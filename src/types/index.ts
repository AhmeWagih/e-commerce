export type TProduct = {
  id: number;
  title: string;
  price: number;
  cat_prefix?: string;
  img: string;
  quantity?: number;
  max: number;
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
