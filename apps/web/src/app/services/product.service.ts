import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  Product,
  ProductsResponse,
  ProductResponse,
  CreateProductResponse,
  UpdateProductResponse,
  ProductQueryParams,
} from '../products/product.types';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/products`;

  getAllProducts(query?: ProductQueryParams): Observable<ProductsResponse> {
    let params = new HttpParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, String(value));
        }
      });
    }
    return this.http.get<ProductsResponse>(this.baseUrl, { params });
  }

  getProduct(productId: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.baseUrl}/${productId}`);
  }

  createProduct(data: FormData | Partial<Product>): Observable<CreateProductResponse> {
    return this.http.post<CreateProductResponse>(this.baseUrl, data);
  }

  updateProduct(
    productId: string,
    data: FormData | Partial<Product>
  ): Observable<UpdateProductResponse> {
    return this.http.patch<UpdateProductResponse>(`${this.baseUrl}/${productId}`, data);
  }

  deleteProduct(productId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${productId}`);
  }

  deleteAllProducts(): Observable<void> {
    return this.http.delete<void>(this.baseUrl);
  }
}
