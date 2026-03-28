import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { AuthResponse } from './api.service';
import { environment } from '../../environments/environment';

const ACCESS_TOKEN_KEY = 'accessToken';
const CURRENT_USER_KEY = 'currentUser';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  isLoggedIn = signal<boolean>(false);
  currentUser = signal<any>(null);

  canManageProducts = computed(() => {
    const role = this.currentUser()?.role?.toLowerCase();
    return role === 'seller' || role === 'admin';
  });

  isAdmin = computed(() => this.currentUser()?.role?.toLowerCase() === 'admin');

  constructor() {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    this.isLoggedIn.set(!!token);

    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.role) {
          this.currentUser.set(parsed);
        } else {
          // Cached user has no role — discard and re-fetch
          localStorage.removeItem(CURRENT_USER_KEY);
        }
      } catch {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }

    // Fetch fresh user data if: token exists but no role info cached
    const hasRole = !!this.currentUser()?.role;
    if (token && !hasRole) {
      this.http.get<any>(`${environment.apiBaseUrl}/users/me`).subscribe({
        next: (res) => {
          // GET /users/me returns { status, data: <userObject> }
          const user = res.data?.user ?? res.data ?? res;
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
          this.currentUser.set(user);
        },
        error: () => {
          // Don't clear session on network/auth errors to avoid
          // accidentally logging out users on a temporary failure.
          // The user will simply not see role-gated UI until they re-login.
        },
      });
    }
  }

  setSession(response: AuthResponse) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    if (response.data?.user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.data.user));
      this.currentUser.set(response.data.user);
    }
    this.isLoggedIn.set(true);
  }

  clearSession() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
  }

  hasToken(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  }
}

