import type { Product } from '../products/product.types';

export interface CartItem {
  _id: string;
  product: string; // productId
  quantity: number;
  priceAfterDiscount?: number;
  itemTotalPrice?: number;
}

export interface Cart {
  _id?: string;
  user?: string;
  items: CartItem[];
  totalItems?: number;
  totalQuantities?: number;
  totalPrice?: number;
  status?: 'active' | 'completed' | 'abandoned';
  createdAt?: string;
  updatedAt?: string;
}

export interface HydratedCartItem extends CartItem {
  productDetails?: Product;
}

export interface HydratedCart extends Omit<Cart, 'items'> {
  items: HydratedCartItem[];
}

export interface GetCartResponse {
  status: string;
  data: {
    cart: Cart;
  };
}

export interface AddCartItemRequest {
  product: string;
  quantity: number;
}

export interface AddCartItemResponse {
  status: string;
  data: {
    cart: Cart;
  };
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface UpdateCartItemResponse {
  status: string;
  data: {
    item: CartItem;
  };
}

