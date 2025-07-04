import { httpClient } from '../http-client';
import { routes } from '../routes';

export interface CartItem {
  product: {
    _id: string;
    name: string;
    images: string[];
  };
  variant: {
    _id: string;
    name: string;
    comparePrice?: number;
    sku?: string;
  };
  quantity: number;
}

export interface CartResponse {
  cart: CartItem[];
}

export interface AddToCartRequest {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface UpdateCartRequest {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface RemoveFromCartRequest {
  productId: string;
  variantId: string;
}

export const cartApi = {
  async getCart(): Promise<CartResponse> {
    const response = await httpClient.get<CartResponse>(routes.users.cart);
    return response.data!;
  },

  async addToCart(item: AddToCartRequest): Promise<CartResponse> {
    const response = await httpClient.post<CartResponse>(
      routes.users.cartAdd,
      item
    );
    return response.data!;
  },

  async updateCartItem(item: UpdateCartRequest): Promise<CartResponse> {
    const response = await httpClient.put<CartResponse>(
      routes.users.cartUpdate,
      item
    );
    return response.data!;
  },

  async removeFromCart(item: RemoveFromCartRequest): Promise<CartResponse> {
    const response = await httpClient.delete<CartResponse>(
      routes.users.cartRemove,
      item // Pass the item as request body
    );
    return response.data!;
  },

  async clearCart(): Promise<CartResponse> {
    const response = await httpClient.delete<CartResponse>(routes.users.cartClear);
    return response.data!;
  },
}; 