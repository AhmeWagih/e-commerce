import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../services/notification.service';
import { WishlistItem, WishlistService } from '../../services/wishlist.service';
import type { Product } from '../../products/product.types';

@Component({
  selector: 'app-profile-wishlist-section',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile-wishlist-section.component.html',
})
export class ProfileWishlistSectionComponent implements OnInit {
  private wishlist = inject(WishlistService);
  private notifications = inject(NotificationService);

  loading = signal(true);
  pendingProductId = signal<string | null>(null);
  error = signal<string | null>(null);
  items = signal<WishlistItem[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.wishlist
      .loadWishlist()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (items) => this.items.set(items),
        error: (err: unknown) => {
          let message = 'Could not load your wishlist.';
          if (err instanceof HttpErrorResponse) {
            const payload = err.error;
            if (payload && typeof payload === 'object' && 'message' in payload) {
              message = String((payload as { message?: string }).message ?? message);
            }
          }
          this.error.set(message);
        },
      });
  }

  remove(item: WishlistItem): void {
    const productId = this.productId(item);
    if (!productId) return;

    this.pendingProductId.set(productId);
    this.wishlist
      .remove(productId)
      .pipe(finalize(() => this.pendingProductId.set(null)))
      .subscribe({
        next: (items) => {
          this.items.set(items);
          this.notifications.success('Removed from wishlist.');
        },
        error: () => this.notifications.error('Could not remove wishlist item.'),
      });
  }

  trackByProductId = (_: number, item: WishlistItem): string => this.productId(item);

  product(item: WishlistItem): Product | null {
    if (!item?.productId || typeof item.productId === 'string') {
      return null;
    }
    return item.productId;
  }

  productId(item: WishlistItem): string {
    if (!item?.productId) return '';
    if (typeof item.productId === 'string') return item.productId;
    return item.productId._id;
  }

  getImageUrl(item: WishlistItem): string {
    const imageCover = this.product(item)?.imageCover;
    if (!imageCover) return '';
    if (imageCover.startsWith('http')) return imageCover;
    return `${environment.apiBaseUrl.replace('/api/v1', '')}/uploads/Products/${imageCover}`;
  }

  formatPrice(item: WishlistItem): string {
    const p = this.product(item);
    if (!p) return '';
    const price = p.discount ? p.price - (p.price * p.discount) / 100 : p.price;
    const currency = p.currency || 'USD';
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);
    } catch {
      return `${currency} ${price.toFixed(2)}`;
    }
  }
}
