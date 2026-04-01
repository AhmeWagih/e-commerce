import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { PaymentService } from '../services/payment.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-order-payment-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (showPay()) {
      <button
        type="button"
        (click)="pay()"
        [disabled]="processing()"
        class="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f2f7f] px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-[#0b2566] disabled:cursor-not-allowed disabled:opacity-70"
      >
        @if (processing()) {
          <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
          Processing…
        } @else {
          Pay now
        }
      </button>
    }
  `,
})
export class OrderPaymentButtonComponent {
  private paymentService = inject(PaymentService);
  private notifications = inject(NotificationService);

  orderId = input.required<string>();
  status = input<string>('');
  paymentStatus = input<string | undefined>(undefined);

  paymentComplete = output<void>();

  processing = signal(false);

  showPay = computed(() => {
    const ps = (this.paymentStatus() || '').toLowerCase();
    if (ps === 'paid' || ps === 'completed') return false;
    const st = (this.status() || '').toLowerCase();
    if (st === 'cancelled' || st === 'failed' || st === 'refunded') return false;
    return true;
  });

  pay(): void {
    if (this.processing()) return;
    this.processing.set(true);
    this.paymentService
      .createPayment({ orderId: this.orderId() })
      .pipe(finalize(() => this.processing.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success('Payment completed.');
          this.paymentComplete.emit();
        },
        error: (err: unknown) => {
          let msg = 'Payment failed.';
          if (err instanceof HttpErrorResponse) {
            const e = err.error;
            if (e && typeof e === 'object' && 'message' in e) {
              msg = String((e as { message?: string }).message ?? msg);
            } else if (typeof err.error === 'string' && err.error.length) {
              msg = err.error;
            }
          }
          this.notifications.error(msg);
        },
      });
  }
}
