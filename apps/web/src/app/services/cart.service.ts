import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, combineLatest, forkJoin, map, of, shareReplay, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import type { ProductResponse } from '../products/product.types';
import { ProductService } from './product.service';
import type {
  AddCartItemRequest,
  AddCartItemResponse,
  Cart,
  GetCartResponse,
  HydratedCart,
  HydratedCartItem,
  UpdateCartItemRequest,
} from '../cart/cart.types';

const EMPTY_CART: HydratedCart = {
  items: [],
  totalItems: 0,
  totalQuantities: 0,
  totalPrice: 0,
};

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private http = inject(HttpClient);
  private productService = inject(ProductService);
  private baseUrl = `${environment.apiBaseUrl}/cart`;

  private cartSubject = new BehaviorSubject<HydratedCart>(EMPTY_CART);
  readonly cart$ = this.cartSubject.asObservable();

  private countSubject = new BehaviorSubject<number>(0);
  readonly totalCount$ = this.countSubject.asObservable();

  readonly totals$ = combineLatest([this.cart$, this.totalCount$]).pipe(
    map(([cart]) => {
      const subtotal = cart.totalPrice ?? this.calcSubtotal(cart.items);
      const shipping = cart.items.length > 0 ? 50 : 0;
      const total = subtotal + shipping;
      return { subtotal, shipping, total };
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  loadCart(): Observable<HydratedCart> {
    return this.http.get<GetCartResponse>(this.baseUrl).pipe(
      map((res) => res.data.cart),
      switchMap((cart) => this.hydrateCart(cart)),
      tap((hydrated) => this.setCart(hydrated)),
      catchError(() => {
        this.setCart(EMPTY_CART);
        return of(EMPTY_CART);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  addItem(payload: AddCartItemRequest): Observable<HydratedCart> {
    return this.http.post<AddCartItemResponse>(this.baseUrl, payload).pipe(
      map((res) => res.data.cart),
      switchMap((cart) => this.hydrateCart(cart)),
      tap((hydrated) => this.setCart(hydrated))
    );
  }

  updateItemQuantity(itemId: string, payload: UpdateCartItemRequest): Observable<HydratedCart> {
    return this.http.patch(`${this.baseUrl}/${itemId}`, payload).pipe(
      switchMap(() => this.loadCart())
    );
  }

  removeItem(itemId: string): Observable<HydratedCart> {
    return this.http.delete(`${this.baseUrl}/${itemId}`).pipe(switchMap(() => this.loadCart()));
  }

  clearLocalCart() {
    this.setCart(EMPTY_CART);
  }

  private setCart(cart: HydratedCart) {
    this.cartSubject.next(cart);
    const count =
      cart.totalQuantities ??
      cart.items.reduce((sum, it) => sum + (Number.isFinite(it.quantity) ? it.quantity : 0), 0);
    this.countSubject.next(count);
  }

  private calcSubtotal(items: HydratedCartItem[]): number {
    return items.reduce((sum, it) => sum + (it.itemTotalPrice ?? 0), 0);
  }

  private hydrateCart(cart: Cart): Observable<HydratedCart> {
    const items = (cart.items ?? []) as HydratedCartItem[];
    if (items.length === 0) {
      return of({
        ...(cart as any),
        items: [],
        totalItems: cart.totalItems ?? 0,
        totalQuantities: cart.totalQuantities ?? 0,
        totalPrice: cart.totalPrice ?? 0,
      });
    }

    const productCalls = items.map((it) =>
      this.productService.getProduct(it.product).pipe(
        map((res: ProductResponse) => res.data.product),
        catchError(() => of(undefined))
      )
    );

    return forkJoin(productCalls).pipe(
      map((products) => {
        const hydratedItems = items.map((it, idx) => ({
          ...it,
          productDetails: products[idx],
        }));

        return {
          ...(cart as any),
          items: hydratedItems,
        } as HydratedCart;
      })
    );
  }
}

