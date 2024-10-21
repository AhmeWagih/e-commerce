export type TProduct = {
  id: number;
  title: string;
  price: number;
  cat_prefix?: string;
  img: string;
  quantity?: number;
  max: number;
  isLikeIt?: boolean;
};
export type TCategory = {
  id?: number;
  title: string;
  prefix: string;
  img: string;
};
export type TLoading = 'idle' | 'pending' | 'succeeded' | 'failed';

export interface ICartState {
  items: { [key: string]: number };
  productsFullInfo: TProduct[];
  loading: TLoading;
  error: null | string;
}
export interface IWishlist {
  itemsId: number[];
  productsFullInfo: TProduct[];
  error: null | string;
  loading: TLoading;
}

export interface IAuthState {
  loading:TLoading,
  error: string | null,
  accessToken: string | null,
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null
}

export type TOrderItem={
  id: number;
  subtotal: number;
  items: TProduct[];
}
export interface IOrdersSlice {
  ordersList: TOrderItem[];
  loading: TLoading;
  error: string | null;
}