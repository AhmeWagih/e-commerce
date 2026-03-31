import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Category {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/categories`;

  getAll(): Observable<{ status: string; data: { categories: Category[] } }> {
    return this.http.get<{ status: string; data: { categories: Category[] } }>(this.baseUrl);
  }

  create(body: { name: string; description?: string }): Observable<{ status: string; data: { category: Category } }> {
    return this.http.post<{ status: string; data: { category: Category } }>(this.baseUrl, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
