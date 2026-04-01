import type { Order } from '../orders/order.types';

export interface CreateOrderItem {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface CreateOrderRequest {
  items: CreateOrderItem[];
  totalAmount: number;
  status?: string;
  shippingAddress?: {
    address: string;
    city: string;
    zipCode: string;
  };
  paymentMethod?: 'credit' | 'cod';
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateOrderResult {
  sessionUrl?: string;
  orders: Order[];
}
