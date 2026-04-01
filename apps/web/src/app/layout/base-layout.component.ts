import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CartService } from '../services/cart.service';
import { ToastComponent } from './toast.component';

@Component({
  selector: 'app-base-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe, ToastComponent],
  templateUrl: './base-layout.component.html',
})
export class BaseLayoutComponent implements OnInit {
  private cartService = inject(CartService);
  cartCount$ = this.cartService.totalCount$;

  ngOnInit(): void {
    this.cartService.loadCart().subscribe();
  }
}
