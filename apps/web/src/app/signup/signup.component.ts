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
        this.error.set(err.error?.message || 'Signup failed');
      },
    });
  }
}
