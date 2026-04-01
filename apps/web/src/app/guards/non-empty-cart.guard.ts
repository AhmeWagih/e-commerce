import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { CartService } from '../services/cart.service';

export const nonEmptyCartGuard: CanActivateFn = () => {
  const cartService = inject(CartService);
  const router = inject(Router);

  return cartService.loadCart().pipe(
    map((cart) => {
      const count =
        cart.totalQuantities ??
        cart.items.reduce((sum, it) => sum + (Number.isFinite(it.quantity) ? it.quantity : 0), 0);
      if (count > 0) return true;
      router.navigateByUrl('/cart');
      return false;
    })
  );
};

