export type ProfileTab =
  | 'personal'
  | 'orders'
  | 'addresses'
  | 'payments'
  | 'wishlist'
  | 'reviews';

export type AppRole = 'Customer' | 'Seller' | 'Admin';

export type AccountUser = {
  name: string;
  email: string;
  phone?: string;
  role: AppRole;
  verified: boolean;
  createdAt?: string;
  memberSince?: string;
};
