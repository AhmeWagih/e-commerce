import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AdminService, type AdminOrderRow } from '../services/admin.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.component.html',
})
export class AdminOrdersComponent implements OnInit {
  private admin = inject(AdminService);

  orders = signal<AdminOrderRow[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  statusFilter = signal('');
  savingKey = signal<string | null>(null);

  draft = signal<Record<string, { status: string; trackingNumber: string; carrier: string; shippingNotes: string }>>(
    {}
  );

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.admin
      .listOrders(this.statusFilter() || undefined)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.orders.set(res.data.orders);
          const d: Record<string, { status: string; trackingNumber: string; carrier: string; shippingNotes: string }> =
            {};
          for (const row of res.data.orders) {
            const key = this.key(row);
            d[key] = {
              status: row.order.status,
              trackingNumber: row.order.trackingNumber || '',
              carrier: row.order.carrier || '',
              shippingNotes: row.order.shippingNotes || '',
            };
          }
          this.draft.set(d);
        },
        error: () => this.error.set('Could not load orders.'),
      });
  }

  key(row: AdminOrderRow) {
    return `${row.userId}:${row.order._id}`;
  }

  patch(
    row: AdminOrderRow,
    field: 'status' | 'trackingNumber' | 'carrier' | 'shippingNotes',
    value: string
  ) {
    const k = this.key(row);
    this.draft.update((prev) => ({
      ...prev,
      [k]: { ...prev[k], [field]: value },
    }));
  }

  save(row: AdminOrderRow) {
    const k = this.key(row);
    const v = this.draft()[k];
    if (!v) return;
    this.savingKey.set(k);
    this.admin
      .updateOrder(String(row.order._id), {
        status: v.status,
        trackingNumber: v.trackingNumber || undefined,
        carrier: v.carrier || undefined,
        shippingNotes: v.shippingNotes || undefined,
      })
      .pipe(finalize(() => this.savingKey.set(null)))
      .subscribe({
        next: () => this.load(),
        error: () => this.error.set('Update failed.'),
      });
  }
}
