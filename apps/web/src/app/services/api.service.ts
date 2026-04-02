import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  data: {
    user: any;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);

  signup(payload: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiBaseUrl}/users/signup`, payload);
  }

  login(payload: { email?: string; phone?: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiBaseUrl}/users/login`, payload);
  }

  me(): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}/users/me`);
  }

  updateMe(payload: any): Observable<any> {
    return this.http.patch<any>(`${environment.apiBaseUrl}/users/updateMe`, payload);
  }
}
