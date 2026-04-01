import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { normalizeOrder, type Order } from '../orders/order.types';

export interface CreatePaymentRequest {
  orderId: string;
}

export interface CreatePaymentResponseBody {
  status?: string;
  data?: { order?: unknown };
  order?: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/payments`;

  createPayment(payload: CreatePaymentRequest): Observable<{ order?: Order }> {
    return this.http.post<CreatePaymentResponseBody>(this.baseUrl, payload).pipe(
      map((body) => {
        const raw =
          body.data?.order ??
          (body as unknown as { order?: unknown }).order ??
          (body as unknown as Record<string, unknown>)['data'];
        const order = raw && typeof raw === 'object' ? normalizeOrder(raw) : undefined;
        return { order: order ?? undefined };
      })
    );
  }
}
