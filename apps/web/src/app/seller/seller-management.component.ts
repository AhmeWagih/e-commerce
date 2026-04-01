import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { SellerService, SellerProfilePayload } from '../services/seller.service';
import { ProductFormComponent } from '../products/product-form/product-form.component';
import type { Product } from '../products/product.types';

@Component({
  selector: 'app-seller-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductFormComponent],
  templateUrl: './seller-management.component.html',
})
export class SellerManagementComponent implements OnInit {
  private sellerService = inject(SellerService);
  auth = inject(AuthService);

  loading = signal(true);
  error = signal<string | null>(null);
  savingProfile = signal(false);
  requestingPayout = signal(false);
  updatingItemId = signal<string | null>(null);
  showProductForm = signal(false);

  profileForm: SellerProfilePayload = {
    storeName: '',
    businessName: '',
    businessType: 'individual',
    taxId: '',
    description: '',
    supportEmail: '',
    supportPhone: '',
    warehouseAddress: '',
  };

  inventory = signal<any[]>([]);
  sellerOrders = signal<any[]>([]);
  wallet = signal<any>(null);

  payoutForm = {
    amount: null as number | null,
    method: 'manual' as 'bank_transfer' | 'paypal' | 'manual',
    reference: '',
    note: '',
  };

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.loading.set(false);
      this.error.set('Please sign in to access seller management.');
      return;
    }
    this.loadAll();
  }

  loadAll() {
    this.loading.set(true);
    this.error.set(null);

    this.sellerService.getMySellerProfile().subscribe({
      next: (res) => {
        const seller = res.data?.seller || {};
        this.profileForm = {
          storeName: seller?.sellerProfile?.storeName || '',
          businessName: seller?.sellerProfile?.businessName || '',
          businessType: seller?.sellerProfile?.businessType || 'individual',
          taxId: seller?.sellerProfile?.taxId || '',
          description: seller?.sellerProfile?.description || '',
          supportEmail: seller?.sellerProfile?.supportEmail || '',
          supportPhone: seller?.sellerProfile?.supportPhone || '',
          warehouseAddress: seller?.sellerProfile?.warehouseAddress || '',
        };
      },
      error: () => {},
    });

    this.sellerService.getInventory().subscribe({
      next: (res) => this.inventory.set(res.data?.products || []),
      error: () => this.inventory.set([]),
    });

    this.sellerService.getSellerOrders().subscribe({
      next: (res) => this.sellerOrders.set(res.data?.orders || []),
      error: () => this.sellerOrders.set([]),
    });

    this.sellerService.getEarnings().subscribe({
      next: (res) => {
        this.wallet.set(res.data?.wallet || null);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Unable to load seller dashboard data.');
      },
    });
  }

  saveProfile() {
    this.savingProfile.set(true);
    this.sellerService.updateMySellerProfile(this.profileForm).subscribe({
      next: () => this.savingProfile.set(false),
      error: () => {
        this.savingProfile.set(false);
        this.error.set('Failed to save seller profile.');
      },
    });
  }

  becomeSeller() {
    this.savingProfile.set(true);
    this.sellerService.registerSeller(this.profileForm).subscribe({
      next: (res) => {
        this.savingProfile.set(false);
        const user = res.data?.seller;
        if (user) {
          this.auth.updateCurrentUser(user);
        }
        this.loadAll();
      },
      error: () => {
        this.savingProfile.set(false);
        this.error.set('Failed to register as seller.');
      },
    });
  }

  updateStock(productId: string, value: string | number) {
    const quantity = Number(value);
    if (!Number.isFinite(quantity) || quantity < 0) return;
    this.sellerService.updateInventory(productId, quantity).subscribe({
      next: () => this.loadAll(),
      error: () => this.error.set('Failed to update inventory.'),
    });
  }

  setItemStatus(order: any, item: any, sellerStatus: any) {
    this.updatingItemId.set(item._id);
    this.sellerService
      .updateOrderItemStatus(order.customerId, order.orderId, item._id, sellerStatus)
      .subscribe({
        next: () => {
          this.updatingItemId.set(null);
          this.loadAll();
        },
        error: () => {
          this.updatingItemId.set(null);
          this.error.set('Failed to update item status.');
        },
      });
  }

  submitPayout() {
    if (!this.payoutForm.amount || this.payoutForm.amount <= 0) return;
    this.requestingPayout.set(true);
    this.sellerService
      .requestPayout({
        amount: this.payoutForm.amount,
        method: this.payoutForm.method,
        reference: this.payoutForm.reference || undefined,
        note: this.payoutForm.note || undefined,
      })
      .subscribe({
        next: (res) => {
          this.wallet.set(res.data?.wallet || null);
          this.requestingPayout.set(false);
          this.payoutForm.amount = null;
          this.payoutForm.reference = '';
          this.payoutForm.note = '';
        },
        error: () => {
          this.requestingPayout.set(false);
          this.error.set('Failed to request payout.');
        },
      });
  }

  onProductCreated(_: Product) {
    this.showProductForm.set(false);
    this.loadAll();
  }
}
