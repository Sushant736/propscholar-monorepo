import { httpClient } from '../http-client';
import { routes } from '../routes';

export interface Product {
  _id: string;
  name: string;
  description: string;
  images: string[];
  category: {
    _id: string;
    name: string;
    description?: string;
    image?: string;
  };
  variants: {
    _id: string;
    name: string;
  }[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductDetail extends Product {
  category: {
    _id: string;
    name: string;
    description: string;
    image: string;
  };
}

export const productsApi = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: string;
    featured?: boolean;
  }): Promise<ProductsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.category) searchParams.append('category', params.category);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sort) searchParams.append('sort', params.sort);
    if (params?.featured) searchParams.append('featured', params.featured.toString());

    const url = `${routes.products.getAll}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await httpClient.get<ProductsResponse>(url, true);
    return response.data!;
  },

  async getById(id: string): Promise<ProductDetail> {
    const response = await httpClient.get<{ product: ProductDetail }>(routes.products.getById(id), true);
    return response.data!.product;
  },
}; 