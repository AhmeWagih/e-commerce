import { Injectable, signal, computed } from '@angular/core';
import type { AuthResponse } from './api.service';

const ACCESS_TOKEN_KEY = 'accessToken';
const CURRENT_USER_KEY = 'currentUser';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn = signal<boolean>(false);
  currentUser = signal<any>(null);

  canManageProducts = computed(() => {
    const role = this.currentUser()?.role;
    return role === 'seller' || role === 'admin';
  });

  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      this.isLoggedIn.set(!!token);
      const storedUser = localStorage.getItem(CURRENT_USER_KEY);
      if (storedUser) {
        try {
          this.currentUser.set(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem(CURRENT_USER_KEY);
        }
      }
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

