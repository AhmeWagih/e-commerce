import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  extractOrdersFromListResponse,
  extractSessionUrl,
  normalizeOrder,
  type Order,
} from '../orders/order.types';
import { ProductService } from './product.service';
import type { ProductResponse } from '../products/product.types';

export interface CreateOrderItem {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface CreateOrderRequest {
  items: CreateOrderItem[];
  totalAmount: number;
  status?: string;
  shippingAddress?: {
    address: string;
    city: string;
    zipCode: string;
  };
  paymentMethod?: 'credit' | 'cod';
}

export interface CreateOrderResult {
  sessionUrl?: string;
  orders: Order[];
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private productService = inject(ProductService);
  private listUrl = `${environment.apiBaseUrl}/users/orders`;
  private createUrl = `${environment.apiBaseUrl}/orders`;

  listOrders(): Observable<Order[]> {
    return this.http.get<unknown>(this.listUrl).pipe(
      map((body) => {
        const rawList = extractOrdersFromListResponse(body);
        const orders: Order[] = [];
        for (const row of rawList) {
          const o = normalizeOrder(row);
          if (o) orders.push(o);
        }
        return orders;
      }),
      switchMap((orders) => this.hydrateOrders(orders))
    );
  }

  createOrder(payload: CreateOrderRequest): Observable<CreateOrderResult> {
    return this.http.post<unknown>(this.createUrl, payload).pipe(
      map((body) => {
        const sessionUrl = extractSessionUrl(body);
        let orders: Order[] = [];
        if (body && typeof body === 'object') {
          const b = body as Record<string, unknown>;
          const data = b['data'];
          if (data && typeof data === 'object') {
            const d = data as Record<string, unknown>;
            const arr = d['orders'];
            if (Array.isArray(arr)) {
              orders = arr.map((r) => normalizeOrder(r)).filter((o): o is Order => o !== null);
            } else if (d['order']) {
              const one = normalizeOrder(d['order']);
              if (one) orders = [one];
            }
          }
        }
        return { sessionUrl, orders };
      })
    );
  }

  private hydrateOrders(orders: Order[]): Observable<Order[]> {
    const productIds = Array.from(
      new Set(
        orders.flatMap((order) =>
          order.items.map((item) => item.productId).filter((id): id is string => !!id)
        )
      )
    );

    if (productIds.length === 0) return of(orders);

    const calls = productIds.map((id) =>
      this.productService.getProduct(id).pipe(
        map((res: ProductResponse) => ({ id, product: res.data.product })),
        catchError(() => of({ id, product: undefined }))
      )
    );

    return forkJoin(calls).pipe(
      map((results) => {
        const byId = new Map(results.map((r) => [r.id, r.product]));
        return orders.map((order) => {
          const items = order.items.map((line) => {
            const product = line.productId ? byId.get(line.productId) : undefined;
            const hasValidUnit = Number.isFinite(line.unitPrice) && (line.unitPrice ?? 0) > 0;
            const unitPrice = hasValidUnit ? (line.unitPrice as number) : (product?.price ?? 0);
            const hasValidLineTotal =
              Number.isFinite(line.lineTotal) && (line.lineTotal ?? 0) > 0;
            return {
              ...line,
              name: line.name !== 'Product' ? line.name : product?.title || line.name,
              unitPrice,
              lineTotal: hasValidLineTotal ? line.lineTotal : unitPrice * line.quantity,
            };
          });

          const itemsTotal = items.reduce((sum, line) => sum + (line.lineTotal ?? 0), 0);
          const raw = (order.raw ?? {}) as Record<string, unknown>;
          const shippingCost =
            typeof raw['shippingCost'] === 'number' && Number.isFinite(raw['shippingCost'])
              ? raw['shippingCost']
              : 0;
          const total = itemsTotal + shippingCost;

          return {
            ...order,
            items,
            total,
          };
        });
      })
    );
  }
}
