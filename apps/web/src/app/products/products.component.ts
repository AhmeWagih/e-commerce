import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { ProductFormComponent } from './product-form/product-form.component';
import type { Product } from './product.types';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterLink, FormsModule, ProductFormComponent],
  templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  auth = inject(AuthService);

  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  searchQuery = signal('');
  currentPage = signal(1);
  totalProducts = signal(0);
  readonly pageSize = 12;

  sortOption = signal('');
  showForm = signal(false);
  deletingId = signal<string | null>(null);
  confirmDeleteId = signal<string | null>(null);

  filteredProducts = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.products();
    return this.products().filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  });

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.error.set(null);

    const query: Record<string, string | number> = {
      page: this.currentPage(),
      limit: this.pageSize,
    };
    if (this.sortOption()) query['sort'] = this.sortOption();

    this.productService.getAllProducts(query).subscribe({
      next: (res) => {
        this.products.set(res.data.products);
        this.totalProducts.set(res.data.products.length);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load products. Please try again.');
        this.loading.set(false);
      },
    });
  }

  onSortChange(value: string) {
    this.sortOption.set(value);
    this.currentPage.set(1);
    this.loadProducts();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onProductCreated(product: Product) {
    this.showForm.set(false);
    this.products.update((list) => [product, ...list]);
    this.totalProducts.update((n) => n + 1);
  }

  requestDelete(id: string) {
    this.confirmDeleteId.set(id);
  }

  cancelDelete() {
    this.confirmDeleteId.set(null);
  }

  confirmDelete(id: string) {
    this.confirmDeleteId.set(null);
    this.deletingId.set(id);
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.products.update((list) => list.filter((p) => p._id !== id));
        this.totalProducts.update((n) => Math.max(0, n - 1));
      },
      error: () => {
        this.deletingId.set(null);
      },
    });
  }

  getImageUrl(imageCover?: string): string {
    if (!imageCover) return '';
    if (imageCover.startsWith('http')) return imageCover;
    return `${environment.apiBaseUrl.replace('/api/v1', '')}/uploads/Products/${imageCover}`;
  }

  getDiscountedPrice(product: Product): number {
    if (!product.discount) return product.price;
    return product.price - (product.price * product.discount) / 100;
  }

  formatPrice(price: number, currency: string): string {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);
    } catch {
      return `${currency} ${price.toFixed(2)}`;
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalProducts() / this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
