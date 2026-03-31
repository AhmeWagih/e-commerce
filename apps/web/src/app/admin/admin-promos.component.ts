import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AdminService, type PromoCode } from '../services/admin.service';

@Component({
  selector: 'app-admin-promos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-promos.component.html',
})
export class AdminPromosComponent implements OnInit {
  private admin = inject(AdminService);

  promos = signal<PromoCode[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  busyId = signal<string | null>(null);

  form = {
    code: '',
    description: '',
    discountType: 'percent' as 'percent' | 'fixed',
    discountValue: 10,
    minOrderAmount: 0,
    maxUses: null as number | null,
    expiresAt: '' as string,
    active: true,
  };

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.admin
      .listPromos()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => this.promos.set(res.data.promos),
        error: () => this.error.set('Could not load promo codes.'),
      });
  }

  create() {
    const code = this.form.code.trim();
    if (!code) {
      this.error.set('Code is required.');
      return;
    }
    this.error.set(null);
    const body: Partial<PromoCode> = {
      code,
      description: this.form.description.trim() || undefined,
      discountType: this.form.discountType,
      discountValue: Number(this.form.discountValue),
      minOrderAmount: Number(this.form.minOrderAmount) || 0,
      maxUses: this.form.maxUses != null && this.form.maxUses > 0 ? this.form.maxUses : null,
      active: this.form.active,
    };
    if (this.form.expiresAt) {
      body.expiresAt = new Date(this.form.expiresAt).toISOString();
    }
    this.admin.createPromo(body).subscribe({
      next: () => {
        this.form = {
          code: '',
          description: '',
          discountType: 'percent',
          discountValue: 10,
          minOrderAmount: 0,
          maxUses: null,
          expiresAt: '',
          active: true,
        };
        this.load();
      },
      error: () => this.error.set('Could not create promo code.'),
    });
  }

  toggleActive(p: PromoCode) {
    this.busyId.set(p._id);
    this.admin
      .updatePromo(p._id, { active: !p.active })
      .pipe(finalize(() => this.busyId.set(null)))
      .subscribe({
        next: () => this.load(),
        error: () => this.error.set('Update failed.'),
      });
  }

  remove(p: PromoCode) {
    this.busyId.set(p._id);
    this.admin
      .deletePromo(p._id)
      .pipe(finalize(() => this.busyId.set(null)))
      .subscribe({
        next: () => this.load(),
        error: () => this.error.set('Delete failed.'),
      });
  }
}
