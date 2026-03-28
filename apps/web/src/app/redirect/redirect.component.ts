import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-redirect',
  standalone: true,
  template: '',
})
export class RedirectComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);

  ngOnInit(): void {
    const target = this.auth.hasToken() ? '/home' : '/signin';
    this.router.navigateByUrl(target, { replaceUrl: true });
  }
}

