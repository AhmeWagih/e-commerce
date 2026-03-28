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
        this.error.set(err.error?.message || 'Login failed');
      },
    });
  }
}
