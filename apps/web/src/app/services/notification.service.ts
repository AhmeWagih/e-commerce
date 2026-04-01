import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationVariant = 'success' | 'error' | 'info';

export interface AppNotification {
  text: string;
  variant: NotificationVariant;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly subject = new BehaviorSubject<AppNotification | null>(null);
  readonly notification$ = this.subject.asObservable();

  private dismissTimer: ReturnType<typeof setTimeout> | null = null;

  show(text: string, variant: NotificationVariant = 'info', durationMs = 4500): void {
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
    this.subject.next({ text, variant });
    if (durationMs > 0) {
      this.dismissTimer = setTimeout(() => this.dismiss(), durationMs);
    }
  }

  success(text: string): void {
    this.show(text, 'success');
  }

  error(text: string): void {
    this.show(text, 'error');
  }

  dismiss(): void {
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
    this.subject.next(null);
  }
}
