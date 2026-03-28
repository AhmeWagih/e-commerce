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

  imageCoverFile = signal<File | null>(null);
  imageCoverPreview = signal<string | null>(null);
  imageFiles = signal<File[]>([]);
  imagePreviews = signal<string[]>([]);

  readonly currencies = ['USD', 'EUR', 'GBP', 'EGP', 'SAR', 'AED'];

  onCoverChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.imageCoverFile.set(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => this.imageCoverPreview.set(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      this.imageCoverPreview.set(null);
    }
  }

  onImagesChange(event: Event) {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    const merged = [...this.imageFiles(), ...files].slice(0, 7);
    this.imageFiles.set(merged);

    const previews: string[] = [];
    let loaded = 0;
    if (merged.length === 0) { this.imagePreviews.set([]); return; }
    merged.forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews[i] = e.target?.result as string;
        loaded++;
        if (loaded === merged.length) this.imagePreviews.set([...previews]);
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number) {
    this.imageFiles.update((files) => files.filter((_, i) => i !== index));
    this.imagePreviews.update((previews) => previews.filter((_, i) => i !== index));
  }

  removeCover() {
    this.imageCoverFile.set(null);
    this.imageCoverPreview.set(null);
  }

  submit() {
    this.error.set(null);

    if (!this.form.title.trim()) return this.error.set('Title is required.');
    if (!this.form.brand.trim()) return this.error.set('Brand is required.');
    if (this.form.price === null || this.form.price <= 0)
      return this.error.set('A valid price is required.');
    if (this.form.quantity === null || this.form.quantity < 0)
      return this.error.set('Quantity is required.');

    this.loading.set(true);

    const fd = new FormData();
    fd.append('title', this.form.title.trim());
    fd.append('brand', this.form.brand.trim());
    fd.append('price', String(this.form.price));
    fd.append('currency', this.form.currency);
    fd.append('quantity', String(this.form.quantity));
    fd.append('discount', String(this.form.discount || 0));
    if (this.form.description.trim()) fd.append('description', this.form.description.trim());
    if (this.form.specifications.trim()) fd.append('specifications', this.form.specifications.trim());

    const cover = this.imageCoverFile();
    if (cover) fd.append('imageCover', cover);
    this.imageFiles().forEach((file) => fd.append('images', file));

    this.productService.createProduct(fd).subscribe({
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
