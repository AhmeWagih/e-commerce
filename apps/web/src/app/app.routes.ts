import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { RedirectComponent } from './redirect/redirect.component';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { BaseLayoutComponent } from './layout/base-layout.component';

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
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
