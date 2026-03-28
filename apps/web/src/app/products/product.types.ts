export interface Category {
  _id: string;
  name: string;
}

export interface Product {
  _id: string;
  title: string;
  quantity: number;
  brand: string;
  currency: string;
  imageCover?: string;
  images?: string[];
  reviews?: string[];
  description?: string;
  price: number;
  discount?: number;
  category?: Category;
  specifications?: string;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductsResponse {
  status: string;
  data: {
    products: Product[];
  };
}

export interface ProductResponse {
  status: string;
  data: {
    product: Product;
  };
}

export interface CreateProductResponse {
  status: string;
  data: {
    newProduct: Product;
  };
}

export interface UpdateProductResponse {
  status: string;
  data: {
    updatedProduct: Product;
  };
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: string;
  [key: string]: string | number | undefined;
}
