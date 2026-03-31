import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CartService } from '../services/cart.service';
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

  cart$ = this.cartService.cart$;
  totals$ = this.cartService.totals$;

  isLoading = signal(false);
  pendingItemId = signal<string | null>(null);

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

  private setPending(itemId: string) {
    this.pendingItemId.set(itemId);
    this.isLoading.set(true);
  }

  private clearPending() {
    this.pendingItemId.set(null);
    this.isLoading.set(false);
  }
}

