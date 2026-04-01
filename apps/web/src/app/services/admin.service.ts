import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminUser {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  name: string;
  role: string;
  accountStatus?: string;
  deletedAt?: string | null;
}

export interface AdminOrderRow {
  userId: string;
  userEmail: string;
  userName: string;
  order: {
    _id: string;
    status: string;
    totalAmount: number;
    trackingNumber?: string;
    carrier?: string;
    shippingNotes?: string;
    createdAt: string;
  };
}

export interface PromoCode {
  _id: string;
  code: string;
  description?: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt?: string | null;
  active: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/admin`;

  listUsers(params?: { accountStatus?: string; includeDeleted?: boolean; page?: number }): Observable<{
    status: string;
    data: { users: AdminUser[] };
  }> {
    let hp = new HttpParams();
    if (params?.accountStatus) hp = hp.set('accountStatus', params.accountStatus);
    if (params?.includeDeleted) hp = hp.set('includeDeleted', 'true');
    if (params?.page) hp = hp.set('page', String(params.page));
    return this.http.get<{ status: string; data: { users: AdminUser[] } }>(`${this.base}/users`, { params: hp });
  }

  updateAccountStatus(userId: string, accountStatus: string): Observable<{ data: { user: AdminUser } }> {
    return this.http.patch<{ data: { user: AdminUser } }>(`${this.base}/users/${userId}/account`, {
      accountStatus,
    });
  }

  softDeleteUser(userId: string): Observable<unknown> {
    return this.http.delete(`${this.base}/users/${userId}`);
  }

  restoreUser(userId: string): Observable<unknown> {
    return this.http.patch(`${this.base}/users/${userId}/restore`, {});
  }

  listOrders(status?: string): Observable<{ status: string; data: { orders: AdminOrderRow[] } }> {
    let hp = new HttpParams();
    if (status) hp = hp.set('status', status);
    return this.http.get<{ status: string; data: { orders: AdminOrderRow[] } }>(`${this.base}/orders`, { params: hp });
  }

  updateOrder(
    userId: string,
    orderId: string,
    body: { status?: string; trackingNumber?: string; carrier?: string; shippingNotes?: string }
  ): Observable<unknown> {
    return this.http.patch(`${this.base}/orders/${userId}/${orderId}`, body);
  }

  listPromos(): Observable<{ data: { promos: PromoCode[] } }> {
    return this.http.get<{ data: { promos: PromoCode[] } }>(`${this.base}/promos`);
  }

  createPromo(body: Partial<PromoCode>): Observable<{ data: { promo: PromoCode } }> {
    return this.http.post<{ data: { promo: PromoCode } }>(`${this.base}/promos`, body);
  }

  updatePromo(
    id: string,
    body: Partial<Omit<PromoCode, '_id'>>
  ): Observable<{ data: { promo: PromoCode } }> {
    return this.http.patch<{ data: { promo: PromoCode } }>(`${this.base}/promos/${id}`, body);
  }

  deletePromo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/promos/${id}`);
  }

  updateSiteContent(body: { banners?: unknown[]; homepage?: Record<string, string | undefined> }): Observable<{
    data: { siteContent: unknown };
  }> {
    return this.http.patch<{ data: { siteContent: unknown } }>(`${this.base}/site-content`, body);
  }
}
