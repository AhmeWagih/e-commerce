import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductService } from '../../services/product.service';
import { CategoryService, type Category } from '../../services/category.service';
import type { Product, CreateProductResponse, UpdateProductResponse } from '../product.types';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  categories = signal<Category[]>([]);

  /** Pass an existing product to enable edit mode */
  product = input<Product | null>(null);

  saved = output<Product>();
  cancelled = output<void>();

  loading = signal(false);
  error = signal<string | null>(null);

  get isEditMode() {
    return !!this.product();
  }

  form = {
    title: '',
    brand: '',
    price: null as number | null,
    currency: 'USD',
    quantity: null as number | null,
    discount: 0,
    description: '',
    specifications: '',
    categoryId: '' as string,
  };

  // New file selected by the user
  imageCoverFile = signal<File | null>(null);
  imageCoverPreview = signal<string | null>(null); // data-URL of new file
  existingCoverUrl = signal<string | null>(null); // URL already stored in DB

  imageFiles = signal<File[]>([]);
  imagePreviews = signal<string[]>([]); // data-URLs for new files
  existingImageUrls = signal<string[]>([]); // URLs already stored in DB

  readonly currencies = ['USD', 'EUR', 'GBP', 'EGP', 'SAR', 'AED'];

  ngOnInit() {
    this.categoryService.getAll().subscribe({
      next: (res) => this.categories.set(res.data.categories),
      error: () => this.categories.set([]),
    });

    const p = this.product();
    if (!p) return;

    this.form.title = p.title;
    this.form.brand = p.brand;
    this.form.price = p.price;
    this.form.currency = p.currency;
    this.form.quantity = p.quantity;
    this.form.discount = p.discount ?? 0;
    this.form.description = p.description ?? '';
    this.form.specifications = p.specifications ?? '';

    if (p.imageCover) this.existingCoverUrl.set(this.getImageUrl(p.imageCover));
    if (p.images?.length) this.existingImageUrls.set(p.images.map((img) => this.getImageUrl(img)));
    if (p.category?._id) this.form.categoryId = p.category._id;
  }

  getImageUrl(filename: string): string {
    if (filename.startsWith('http')) return filename;
    return `${environment.apiBaseUrl.replace('/api/v1', '')}/uploads/Products/${filename}`;
  }

  // ── Cover image ────────────────────────────────────────────────
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

  removeCover() {
    this.imageCoverFile.set(null);
    this.imageCoverPreview.set(null);
    this.existingCoverUrl.set(null);
  }

  // ── Extra images ────────────────────────────────────────────────
  onImagesChange(event: Event) {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    const totalExisting = this.existingImageUrls().length;
    const merged = [...this.imageFiles(), ...files].slice(0, 7 - totalExisting);
    this.imageFiles.set(merged);

    if (merged.length === 0) {
      this.imagePreviews.set([]);
      return;
    }
    const previews: string[] = new Array(merged.length);
    let loaded = 0;
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

  removeNewImage(index: number) {
    this.imageFiles.update((files) => files.filter((_, i) => i !== index));
    this.imagePreviews.update((previews) => previews.filter((_, i) => i !== index));
  }

  // ── Submit ────────────────────────────────────────────────────
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
    if (this.form.categoryId.trim()) fd.append('category', this.form.categoryId.trim());

    const cover = this.imageCoverFile();
    if (cover) fd.append('imageCover', cover);
    this.imageFiles().forEach((file) => fd.append('images', file));

    const p = this.product();
    const obs$ = (
      p ? this.productService.updateProduct(p._id, fd) : this.productService.createProduct(fd)
    ) as any;

    obs$.subscribe({
      next: (res: any) => {
        this.loading.set(false);
        const saved = p ? res.data.updatedProduct : res.data.newProduct;
        this.saved.emit(saved);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(err.error?.message || `Failed to ${p ? 'update' : 'create'} product.`);
      }})
      
    const onError = (err: HttpErrorResponse, action: 'update' | 'create') => {
      this.loading.set(false);
      this.error.set(err.error?.message || `Failed to ${action} product.`);
    };

    if (p) {
      this.productService.updateProduct(p._id, fd).subscribe({
        next: (res: UpdateProductResponse) => {
          this.loading.set(false);
          this.saved.emit(res.data.updatedProduct);
        },
        error: (err: HttpErrorResponse) => onError(err, 'update'),
      });
      return;
    }

    this.productService.createProduct(fd).subscribe({
      next: (res: CreateProductResponse) => {
        this.loading.set(false);
        this.saved.emit(res.data.newProduct);
      },
      error: (err: HttpErrorResponse) => onError(err, 'create'),
    });
  }

  cancel() {
    this.cancelled.emit();
  }
}
