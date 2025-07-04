import { httpClient } from '../http-client';
import { routes } from '../routes';

export interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  products: {
    _id: string;
    name: string;
    images: string[];
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  categories: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const categoriesApi = {
  async getAll(): Promise<CategoriesResponse> {
    const response = await httpClient.get<CategoriesResponse>(routes.categories.getAll, true);
    return response.data!;
  },

  async getById(id: string): Promise<Category> {
    const response = await httpClient.get<{ category: Category }>(routes.categories.getById(id), true);
    return response.data!.category;
  },
}; 