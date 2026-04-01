import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import type { Order } from './order.types';
import { OrderPaymentButtonComponent } from './order-payment-button.component';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CommonModule, OrderPaymentButtonComponent],
  templateUrl: './order-card.component.html',
})
export class OrderCardComponent {
  order = input.required<Order>();

  refreshed = output<void>();

  formatDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  statusClass(status: string): string {
    const s = status.toLowerCase();
    if (s === 'paid' || s === 'delivered' || s === 'completed' || s === 'shipped') {
      return 'bg-emerald-50 text-emerald-700';
    }
    if (s === 'pending' || s === 'processing') {
      return 'bg-amber-50 text-amber-800';
    }
    if (s === 'cancelled' || s === 'failed') {
      return 'bg-rose-50 text-rose-700';
    }
    return 'bg-slate-100 text-slate-700';
  }
}
