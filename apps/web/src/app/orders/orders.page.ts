import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { OrderService } from '../services/order.service';
import { OrderCardComponent } from './order-card.component';
import type { Order } from './order.types';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule, RouterLink, OrderCardComponent],
  templateUrl: './orders.page.html',
})
export class OrdersPageComponent implements OnInit {
  private orderService = inject(OrderService);

  orders = signal<Order[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.orderService
      .listOrders()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (rows) => this.orders.set(rows),
        error: (err: unknown) => {
          let msg = 'Could not load orders.';
          if (err instanceof HttpErrorResponse) {
            const e = err.error;
            if (e && typeof e === 'object' && 'message' in e) {
              msg = String((e as { message?: string }).message ?? msg);
            }
          }
          this.error.set(msg);
        },
      });
  }
}
