import { httpClient } from '../http-client';
import { routes } from '../routes';

export interface Variant {
  _id: string;
  name: string;
  comparePrice?: number;
  costPrice?: number;
  isActive: boolean;
  product: {
    _id: string;
    name: string;
    description: string;
    images: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export const variantsApi = {
  async getById(id: string): Promise<Variant> {
    const response = await httpClient.get<{ variant: Variant }>(routes.variants.getById(id), true);
    return response.data!.variant;
  },
}; 