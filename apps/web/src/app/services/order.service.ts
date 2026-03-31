import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreateOrderItem {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface CreateOrderRequest {
  items: CreateOrderItem[];
  /** Ignored by server; totals are recalculated from catalog prices and promo. */
  totalAmount?: number;
  status?: string;
  shippingAddress?: {
    address: string;
    city: string;
    zipCode: string;
  };
  paymentMethod?: 'credit' | 'cod';
  promoCode?: string;
  shippingFee?: number;
}

export interface CreateOrderResponse {
  status: string;
  data: {
    orders: any[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/users/orders`;

  createOrder(payload: CreateOrderRequest): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(this.baseUrl, payload);
  }

  validatePromo(code: string, subtotal: number): Observable<{
    status: string;
    data: { code: string; discount: number; discountType: string; discountValue: number };
  }> {
    return this.http.post<{
      status: string;
      data: { code: string; discount: number; discountType: string; discountValue: number };
    }>(`${environment.apiBaseUrl}/promos/validate`, { code, subtotal });
  }
}

