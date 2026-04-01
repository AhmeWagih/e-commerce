import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    @if (notification$ | async; as n) {
      <div
        class="pointer-events-auto fixed bottom-6 left-1/2 z-[100] w-[min(100%-2rem,28rem)] -translate-x-1/2 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-md sm:px-5"
        [class.border-emerald-200]="n.variant === 'success'"
        [class.bg-emerald-50/95]="n.variant === 'success'"
        [class.text-emerald-900]="n.variant === 'success'"
        [class.border-rose-200]="n.variant === 'error'"
        [class.bg-rose-50/95]="n.variant === 'error'"
        [class.text-rose-900]="n.variant === 'error'"
        [class.border-slate-200]="n.variant === 'info'"
        [class.bg-white/95]="n.variant === 'info'"
        [class.text-slate-900]="n.variant === 'info'"
        role="status"
        aria-live="polite"
      >
        <div class="flex items-start gap-3">
          <span class="material-symbols-outlined mt-0.5 shrink-0 text-[20px]">
            @switch (n.variant) {
              @case ('success') {
                check_circle
              }
              @case ('error') {
                error
              }
              @default {
                info
              }
            }
          </span>
          <p class="flex-1 text-sm font-semibold leading-snug">{{ n.text }}</p>
          <button
            type="button"
            (click)="notifications.dismiss()"
            class="grid h-8 w-8 shrink-0 place-content-center rounded-xl text-current opacity-70 transition hover:opacity-100"
            aria-label="Dismiss"
          >
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>
    }
  `,
})
export class ToastComponent {
  protected notifications = inject(NotificationService);
  notification$ = this.notifications.notification$;
}
