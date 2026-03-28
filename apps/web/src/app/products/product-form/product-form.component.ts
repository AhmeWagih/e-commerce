import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import type { Product } from '../product.types';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent {
  private productService = inject(ProductService);

  created = output<Product>();
  cancelled = output<void>();

  loading = signal(false);
  error = signal<string | null>(null);

  form = {
    title: '',
    brand: '',
    price: null as number | null,
    currency: 'USD',
    quantity: null as number | null,
    discount: 0,
    description: '',
    specifications: '',
  };

  readonly currencies = ['USD', 'EUR', 'GBP', 'EGP', 'SAR', 'AED'];

  submit() {
    this.error.set(null);

    if (!this.form.title.trim()) return this.error.set('Title is required.');
    if (!this.form.brand.trim()) return this.error.set('Brand is required.');
    if (this.form.price === null || this.form.price <= 0)
      return this.error.set('A valid price is required.');
    if (this.form.quantity === null || this.form.quantity < 0)
      return this.error.set('Quantity is required.');

    this.loading.set(true);

    const payload: Partial<Product> = {
      title: this.form.title.trim(),
      brand: this.form.brand.trim(),
      price: this.form.price,
      currency: this.form.currency,
      quantity: this.form.quantity,
      discount: this.form.discount || 0,
      description: this.form.description.trim() || undefined,
      specifications: this.form.specifications.trim() || undefined,
    };

    this.productService.createProduct(payload).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.created.emit(res.data.newProduct);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to create product.');
      },
    });
  }

  cancel() {
    this.cancelled.emit();
  }
}
