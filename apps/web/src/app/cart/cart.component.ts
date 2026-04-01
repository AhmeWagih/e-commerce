import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize, firstValueFrom, take } from 'rxjs';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { NotificationService } from '../services/notification.service';
import type { HydratedCartItem } from './cart.types';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private notifications = inject(NotificationService);
  private platformId = inject(PLATFORM_ID);

  cart$ = this.cartService.cart$;
  totals$ = this.cartService.totals$;

  isLoading = signal(false);
  pendingItemId = signal<string | null>(null);
  checkoutBusy = signal(false);
  checkoutError = signal<string | null>(null);

  ngOnInit(): void {
    this.isLoading.set(true);
    this.cartService
      .loadCart()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe();
  }

  inc(item: HydratedCartItem) {
    this.setPending(item._id);
    this.cartService
      .updateItemQuantity(item._id, { quantity: item.quantity + 1 })
      .pipe(finalize(() => this.clearPending()))
      .subscribe();
  }

  dec(item: HydratedCartItem) {
    if (item.quantity <= 1) return;
    this.setPending(item._id);
    this.cartService
      .updateItemQuantity(item._id, { quantity: item.quantity - 1 })
      .pipe(finalize(() => this.clearPending()))
      .subscribe();
  }

  remove(item: HydratedCartItem) {
    this.setPending(item._id);
    this.cartService
      .removeItem(item._id)
      .pipe(finalize(() => this.clearPending()))
      .subscribe();
  }

  isPending(itemId: string): boolean {
    return this.pendingItemId() === itemId;
  }

  getImageUrl(imageCover?: string): string {
    if (!imageCover) return '';
    if (imageCover.startsWith('http')) return imageCover;
    return `${environment.apiBaseUrl.replace('/api/v1', '')}/uploads/Products/${imageCover}`;
  }

  formatPrice(price: number, currency: string | undefined): string {
    const c = currency || 'USD';
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: c }).format(price);
    } catch {
      return `${c} ${price.toFixed(2)}`;
    }
  }

  /**
   * Creates an order from the current cart and redirects to the gateway when `sessionUrl` is present.
   * Falls back to clearing the cart and navigating to `/orders` when the API returns an order without a session URL.
   */
  async startGatewayCheckout(): Promise<void> {
    this.checkoutError.set(null);
    this.checkoutBusy.set(true);
    try {
      const cart = await firstValueFrom(this.cartService.cart$.pipe(take(1)));
      const totals = await firstValueFrom(this.cartService.totals$.pipe(take(1)));
      if (!cart.items.length) {
        void this.router.navigateByUrl('/cart');
        return;
      }

      const result = await firstValueFrom(
        this.orderService.createOrder({
          items: cart.items.map((it) => ({
            productId: it.product,
            quantity: it.quantity,
            unitPrice: it.priceAfterDiscount,
          })),
          totalAmount: totals.total,
        })
      );

      const sessionUrl = result.sessionUrl?.trim();
      if (sessionUrl) {
        if (isPlatformBrowser(this.platformId)) {
          window.location.href = sessionUrl;
        }
        return;
      }

      if (result.orders.length > 0) {
        this.cartService.clearLocalCart();
        this.notifications.success('Order placed successfully.');
        await this.router.navigateByUrl('/orders');
        return;
      }

      const msg = 'No payment session URL was returned.';
      this.checkoutError.set(msg);
      this.notifications.error(msg);
    } catch (err: unknown) {
      let msg = 'Could not start checkout.';
      if (err instanceof HttpErrorResponse) {
        const e = err.error;
        if (e && typeof e === 'object' && 'message' in e) {
          msg = String((e as { message?: string }).message ?? msg);
        } else if (typeof err.error === 'string' && err.error.length) {
          msg = err.error;
        }
      }
      this.checkoutError.set(msg);
      this.notifications.error(msg);
    } finally {
      this.checkoutBusy.set(false);
    }
  }

  private setPending(itemId: string) {
    this.pendingItemId.set(itemId);
    this.isLoading.set(true);
  }

  private clearPending() {
    this.pendingItemId.set(null);
    this.isLoading.set(false);
  }
}
