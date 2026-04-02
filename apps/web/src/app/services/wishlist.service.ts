import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import type { Product } from '../products/product.types';

export interface WishlistItem {
  productId: Product | string;
  addedAt?: string;
}

interface WishlistResponse {
  status: string;
  data?: {
    wishlist?: WishlistItem[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/users/wishlist`;

  private loaded = false;
  private readonly itemsSubject = new BehaviorSubject<WishlistItem[]>([]);
  readonly wishlist$ = this.itemsSubject.asObservable();

  get snapshot(): WishlistItem[] {
    return this.itemsSubject.value;
  }

  ensureLoaded(): Observable<WishlistItem[]> {
    if (this.loaded) {
      return of(this.snapshot);
    }
    return this.loadWishlist();
  }

  loadWishlist(): Observable<WishlistItem[]> {
    return this.http.get<WishlistResponse>(this.baseUrl).pipe(
      tap((res) => {
        this.loaded = true;
        this.itemsSubject.next(res?.data?.wishlist ?? []);
      }),
      switchMap(() => of(this.snapshot))
    );
  }

  add(productId: string): Observable<WishlistItem[]> {
    return this.http.post<WishlistResponse>(this.baseUrl, { productId }).pipe(
      switchMap(() => this.loadWishlist())
    );
  }

  remove(productId: string): Observable<WishlistItem[]> {
    return this.http.delete<WishlistResponse>(`${this.baseUrl}/${productId}`).pipe(
      switchMap(() => this.loadWishlist())
    );
  }

  contains(productId: string): boolean {
    return this.snapshot.some((item) => this.getProductId(item) === productId);
  }

  private getProductId(item: WishlistItem): string {
    if (!item?.productId) return '';
    if (typeof item.productId === 'string') return item.productId;
    return item.productId._id;
  }
}
