import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { ProfileAddressesSectionComponent } from './sections/profile-addresses-section.component';
import { ProfileOrdersSectionComponent } from './sections/profile-orders-section.component';
import { ProfilePaymentsSectionComponent } from './sections/profile-payments-section.component';
import { ProfilePersonalSectionComponent } from './sections/profile-personal-section.component';
import { ProfileReviewsSectionComponent } from './sections/profile-reviews-section.component';
import { ProfileWishlistSectionComponent } from './sections/profile-wishlist-section.component';
import { AccountUser, AppRole, ProfileTab } from './profile.types';

type TabItem = {
  key: ProfileTab;
  label: string;
  icon: string;
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ProfilePersonalSectionComponent,
    ProfileOrdersSectionComponent,
    ProfileAddressesSectionComponent,
    ProfilePaymentsSectionComponent,
    ProfileWishlistSectionComponent,
    ProfileReviewsSectionComponent,
  ],
  templateUrl: './profile.page.html',
})
export class ProfileComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  tab = signal<ProfileTab>('personal');
  loading = signal(false);

  readonly tabs: TabItem[] = [
    { key: 'personal', label: 'Personal Info', icon: 'person' },
    { key: 'orders', label: 'Order History', icon: 'history' },
    { key: 'addresses', label: 'Addresses', icon: 'location_on' },
    { key: 'payments', label: 'Payment Methods', icon: 'credit_card' },
    { key: 'wishlist', label: 'Wishlist', icon: 'favorite' },
    { key: 'reviews', label: 'Reviews', icon: 'star' },
  ];

  user = signal<AccountUser>({
    name: '—',
    email: '—',
    phone: '',
    role: 'Customer',
    verified: false,
    memberSince: '—',
  });

  roleLabel = computed(() => {
    const role = this.user().role ?? 'Customer';
    return role;
  });

  activeTabLabel = computed(() => {
    const selected = this.tabs.find((tab) => tab.key === this.tab());
    return selected?.label ?? 'Account';
  });

  ngOnInit(): void {
    if (!this.auth.hasToken()) {
      this.router.navigateByUrl('/signin', { replaceUrl: true });
      return;
    }

    this.loading.set(true);
    this.api.me().subscribe({
      next: (me) => {
        const u = me?.data?.user ?? me?.data ?? me?.user ?? me;
        if (u) this.user.set(this.mapBackendUser(u));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        // Token invalid / expired etc.
        this.signOut();
      },
    });
  }

  private mapBackendUser(u: any): AccountUser {
    const createdAt: string | undefined =
      typeof u?.createdAt === 'string'
        ? u.createdAt
        : typeof u?.created_at === 'string'
          ? u.created_at
          : undefined;

    const year =
      createdAt && !Number.isNaN(Date.parse(createdAt))
        ? String(new Date(createdAt).getFullYear())
        : undefined;

    const roleRaw = u?.role ?? u?.roles?.[0] ?? u?.userType ?? u?.type ?? 'Customer';
    const roleStr = String(roleRaw).toLowerCase();
    const role: AppRole =
      roleStr === 'admin' ? 'Admin' : roleStr === 'seller' ? 'Seller' : 'Customer';

    return {
      name: String(u?.name ?? u?.fullName ?? u?.username ?? '—'),
      email: String(u?.email ?? '—'),
      phone: u?.phone ? String(u.phone) : '',
      role,
      verified: Boolean(
        u?.verified ?? u?.isVerified ?? u?.emailVerified ?? u?.emailConfirmed ?? false
      ),
      createdAt,
      memberSince: year ?? this.user().memberSince,
    };
  }

  setTab(tab: ProfileTab) {
    this.tab.set(tab);
  }

  signOut() {
    this.auth.clearSession();
    this.router.navigateByUrl('/signin', { replaceUrl: true });
  }
}
