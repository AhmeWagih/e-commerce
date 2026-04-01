import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService, AuthResponse } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signin.component.html',
})
export class SigninComponent {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  form = {
    email: '',
    password: '',
  };

  private getApiErrorMessage(err: any, fallback: string): string {
    const status = Number(err?.status ?? 0);

    const validationErrors = err?.error?.errors;
    if (validationErrors && typeof validationErrors === 'object') {
      const firstValidationMessage = Object.values(validationErrors)
        .map((item: any) => item?.message)
        .find((message) => typeof message === 'string' && message.trim().length > 0);
      if (firstValidationMessage) return String(firstValidationMessage).trim();
    }

    const raw = err?.error?.message ?? err?.error?.error;
    if (!raw) return fallback;

    const text = typeof raw === 'string' ? raw : String(raw);
    const clean = text
      .split('\n')
      .map((line) => line.trim())
      .filter(
        (line) =>
          line.length > 0 &&
          !line.startsWith('at ') &&
          !line.includes('node_modules') &&
          !line.includes('internal/process/task_queues')
      )
      .join(' ')
      .replace(/^Error:\s*/i, '')
      .replace(/^ValidationError:\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (clean && !/^Http failure response for\s+/i.test(clean)) {
      return clean;
    }

    if (status === 401) return 'Invalid email or password.';
    if (status === 400) return 'Please check your email and password and try again.';
    if (status >= 500) return 'Server error. Please try again in a moment.';

    return fallback;
  }

  submit() {
    this.loading.set(true);
    this.error.set(null);

    const email = this.form.email.trim();
    if (!email) {
      this.loading.set(false);
      this.error.set('Email is required');
      return;
    }

    this.api.login({ email, password: this.form.password }).subscribe({
      next: (res: AuthResponse) => {
        this.auth.setSession(res);
        this.loading.set(false);
        this.router.navigateByUrl('/');
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(this.getApiErrorMessage(err, 'Login failed. Please check your credentials.'));
      },
    });
  }
}
