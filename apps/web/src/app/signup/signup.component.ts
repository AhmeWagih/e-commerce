import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService, AuthResponse } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
})
export class SignupComponent {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  form = {
    name: '',
    username: '',
    email: '',
    phone: '',
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

    const normalized = clean
      .replace(/^User validation failed:\s*/i, '')
      .replace(/^Validation failed:\s*/i, '')
      .replace(/^password:\s*/i, '')
      .trim();

    if (normalized && !/^Http failure response for\s+/i.test(normalized)) {
      return normalized;
    }

    if (status === 400) return 'Please review your information and try again.';
    if (status === 409) return 'An account with this email already exists.';
    if (status >= 500) return 'Server error. Please try again in a moment.';

    return fallback;
  }

  submit() {
    this.loading.set(true);
    this.error.set(null);

    const payload = {
      name: this.form.name,
      username: this.form.username || this.form.email.split('@')[0],
      email: this.form.email,
      phone: this.form.phone,
      password: this.form.password,
      confirmPassword: this.form.password,
    };

    this.api.signup(payload).subscribe({
      next: (res: AuthResponse) => {
        this.auth.setSession(res);
        this.loading.set(false);
        this.router.navigateByUrl('/');
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(this.getApiErrorMessage(err, 'Signup failed. Please check your details.'));
      },
    });
  }
}
