import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SellerProfilePayload {
  storeName?: string;
  businessName?: string;
  businessType?: 'individual' | 'company';
  taxId?: string;
  description?: string;
  supportEmail?: string;
  supportPhone?: string;
  warehouseAddress?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SellerService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/sellers`;

  registerSeller(payload: SellerProfilePayload): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register`, payload);
  }

  getMySellerProfile(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/me`);
  }

  updateMySellerProfile(payload: SellerProfilePayload): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/me`, payload);
  }

  getInventory(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/inventory`);
  }

  updateInventory(productId: string, quantity: number): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/inventory/${productId}`, { quantity });
  }

  getSellerOrders(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/orders`);
  }

  updateOrderItemStatus(
    customerId: string,
    orderId: string,
    itemId: string,
    sellerStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  ): Observable<any> {
    return this.http.patch<any>(
      `${this.baseUrl}/orders/${customerId}/${orderId}/items/${itemId}/status`,
      { sellerStatus }
    );
  }

  getEarnings(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/earnings`);
  }

  requestPayout(payload: {
    amount: number;
    method?: 'bank_transfer' | 'paypal' | 'manual';
    reference?: string;
    note?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/payouts`, payload);
  }
}
