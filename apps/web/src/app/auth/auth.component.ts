import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, AuthResponse } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
})
export class AuthComponent {
  private api: ApiService = inject(ApiService);
  private auth: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  mode = signal<'login' | 'signup'>('login');
  loading = signal(false);
  error = signal<string | null>(null);

  form = {
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
  };

  switchMode(mode: 'login' | 'signup') {
    this.mode.set(mode);
    this.error.set(null);
  }

  submit() {
    this.loading.set(true);
    this.error.set(null);

    const mode = this.mode();

    if (mode === 'signup') {
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
          this.error.set(err.error?.message || 'Signup failed');
        },
      });
    } else {
      const payload: any = {
        password: this.form.password,
      };
      if (this.form.email) {
        payload.email = this.form.email;
      } else if (this.form.phone) {
        payload.phone = this.form.phone;
      }

      this.api.login(payload).subscribe({
        next: (res: AuthResponse) => {
          this.auth.setSession(res);
          this.loading.set(false);
          this.router.navigateByUrl('/');
        },
        error: (err: any) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Login failed');
        },
      });
    }
  }
}

