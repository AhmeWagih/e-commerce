import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ProductFormComponent } from '../product-form/product-form.component';
import type { Product } from '../product.types';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, ProductFormComponent],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  auth = inject(AuthService);

  product = signal<Product | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedImage = signal<string | null>(null);
  addingToCart = signal(false);

  deleting = signal(false);
  confirmDelete = signal(false);
  showEditForm = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('productId');
    if (!id) {
      this.error.set('Invalid product ID.');
      this.loading.set(false);
      return;
    }
    this.productService.getProduct(id).subscribe({
      next: (res) => {
        this.product.set(res.data.product);
        const cover = res.data.product.imageCover;
        if (cover) this.selectedImage.set(this.getImageUrl(cover));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Product not found or failed to load.');
        this.loading.set(false);
      },
    });
  }

  onProductUpdated(updated: Product) {
    this.product.set(updated);
    this.showEditForm.set(false);
    // Refresh selected image in case cover changed
    if (updated.imageCover) {
      this.selectedImage.set(this.getImageUrl(updated.imageCover));
    }
  }

  onDeleteConfirmed() {
    const id = this.product()?._id;
    if (!id) return;
    this.deleting.set(true);
    this.confirmDelete.set(false);
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.router.navigateByUrl('/products');
      },
      error: () => {
        this.deleting.set(false);
        this.error.set('Failed to delete product. Please try again.');
      },
    });
  }

  getImageUrl(filename?: string): string {
    if (!filename) return '';
    if (filename.startsWith('http')) return filename;
    return `${environment.apiBaseUrl.replace('/api/v1', '')}/uploads/Products/${filename}`;
  }

  selectImage(url: string) {
    this.selectedImage.set(url);
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

  addToCart() {
    const p = this.product();
    if (!p) return;
    this.addingToCart.set(true);
    this.cartService.addItem({ product: p._id, quantity: 1 }).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.router.navigateByUrl('/cart');
      },
      error: () => {
        this.addingToCart.set(false);
      },
    });
  }

  get allImages(): string[] {
    const p = this.product();
    if (!p) return [];
    const imgs: string[] = [];
    if (p.imageCover) imgs.push(this.getImageUrl(p.imageCover));
    (p.images ?? []).forEach((img) => imgs.push(this.getImageUrl(img)));
    return imgs;
  }
}
