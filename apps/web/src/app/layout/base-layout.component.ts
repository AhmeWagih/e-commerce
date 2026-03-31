import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-base-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe],
  templateUrl: './base-layout.component.html',
})
export class BaseLayoutComponent implements OnInit {
  private cartService = inject(CartService);
  auth = inject(AuthService);
  cartCount$ = this.cartService.totalCount$;

  ngOnInit(): void {
    this.cartService.loadCart().subscribe();
  }
}
