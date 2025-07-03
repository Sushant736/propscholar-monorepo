import { httpClient, ApiResponse } from "../http-client";
import { routes } from "../routes";

// Order interfaces
export interface ProductSummary {
  _id: string;
  name: string;
  description?: string;
  images?: string[];
}

export interface VariantSummary {
  _id: string;
  name: string;
}

export interface OrderItem {
  product: ProductSummary;
  variant?: VariantSummary;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
}

export interface Address {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface PaymentDetails {
  paymentMethod: string;
  merchantOrderId: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  phonepeOrderId?: string;
  phonepeTransactionId?: string;
  failureReason?: string;
  paymentTimestamp?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  items: OrderItem[];
  pricing: {
    subtotal: number;
    tax: number;
    discount: number;
    shippingCost: number;
    total: number;
  };
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "completed"
    | "cancelled"
    | "refunded";
  paymentDetails: PaymentDetails;
  customerDetails: CustomerDetails;
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  customerDetails?: CustomerDetails;
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string;
  redirectUrl: string;
}

export interface CreateOrderResponse {
  order: {
    _id: string;
    orderNumber: string;
    total: number;
    status: string;
    paymentStatus: string;
  };
  payment: {
    redirectUrl: string;
    orderId: string;
    merchantOrderId: string;
    expireAt: number;
  };
}

export interface PaymentStatusResponse {
  order: {
    _id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: number;
  };
  paymentDetails?: {
    state: string;
    amount: number;
    paymentDetails: Array<{
      paymentMode: string;
      timestamp: number;
      amount: number;
      transactionId: string;
      state: string;
    }>;
  };
  error?: string;
}

export interface OrderListResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const ordersApi = {
  /**
   * Create order from cart
   */
  async createFromCart(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    const response: ApiResponse<CreateOrderResponse> = await httpClient.post(
      routes.orders.create,
      data
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || "Failed to create order");
    }

    return response.data;
  },

  /**
   * Get all orders for user
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<OrderListResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.status) searchParams.append("status", params.status);
    if (params?.paymentStatus)
      searchParams.append("paymentStatus", params.paymentStatus);
    if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);

    const url = searchParams.toString()
      ? `${routes.orders.getAll}?${searchParams.toString()}`
      : routes.orders.getAll;

    const response: ApiResponse<OrderListResponse> = await httpClient.get(url);

    if (!response.success || !response.data) {
      throw new Error(response.message || "Failed to fetch orders");
    }

    return response.data;
  },

  /**
   * Get order by ID
   */
  async getById(orderId: string): Promise<Order> {
    const response: ApiResponse<{ order: Order }> = await httpClient.get(
      routes.orders.getById(orderId)
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || "Failed to fetch order");
    }

    return response.data.order;
  },

  /**
   * Cancel order
   */
  async cancel(orderId: string): Promise<Order> {
    const response: ApiResponse<{ order: Order }> = await httpClient.put(
      routes.orders.cancel(orderId)
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || "Failed to cancel order");
    }

    return response.data.order;
  },

  /**
   * Check payment status
   */
  async checkPaymentStatus(orderId: string): Promise<PaymentStatusResponse> {
    const response: ApiResponse<PaymentStatusResponse> = await httpClient.get(
      routes.orders.checkPaymentStatus(orderId)
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || "Failed to check payment status");
    }

    return response.data;
  },
};
