import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { RedirectComponent } from './redirect/redirect.component';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { BaseLayoutComponent } from './layout/base-layout.component';
import { ProductsComponent } from './products/products.component';
import { ProductDetailComponent } from './products/product-detail/product-detail.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { nonEmptyCartGuard } from './guards/non-empty-cart.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: RedirectComponent,
  },
  {
    path: 'auth',
    redirectTo: 'signin',
    pathMatch: 'full',
  },
  {
    path: '',
    component: BaseLayoutComponent,
    children: [
      {
        path: 'signin',
        component: SigninComponent,
      },
      {
        path: 'signup',
        component: SignupComponent,
      },
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'products',
        component: ProductsComponent,
      },
      {
        path: 'products/:productId',
        component: ProductDetailComponent,
      },
      {
        path: 'cart',
        component: CartComponent,
      },
      {
        path: 'checkout',
        component: CheckoutComponent,
        canActivate: [nonEmptyCartGuard],
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
