import { Injectable, signal } from '@angular/core';
import type { AuthResponse } from './api.service';

const ACCESS_TOKEN_KEY = 'accessToken';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn = signal<boolean>(false);

  constructor() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      this.isLoggedIn.set(!!token);
    }
  }

  setSession(response: AuthResponse) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    this.isLoggedIn.set(true);
  }

  clearSession() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    this.isLoggedIn.set(false);
  }

  hasToken(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  }
}

