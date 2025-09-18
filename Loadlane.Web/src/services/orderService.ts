import type {
  OrderResponse,
  CreateOrderRequest
} from '../types/order';

const API_BASE_URL = 'http://localhost:5119/api';

class OrderService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  private async handleDeleteResponse(response: Response): Promise<void> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
  }

  private async makeApiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  async getAllOrders(): Promise<OrderResponse[]> {
    return this.makeApiCall<OrderResponse[]>('/orders');
  }

  async getOrderById(id: string): Promise<OrderResponse> {
    return this.makeApiCall<OrderResponse>(`/orders/${id}`);
  }

  async createOrder(order: CreateOrderRequest): Promise<OrderResponse> {
    return this.makeApiCall<OrderResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async deleteOrder(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleDeleteResponse(response);
  }

  // Additional method for filtering orders if needed
  async getOrdersByStatus(status: string): Promise<OrderResponse[]> {
    return this.makeApiCall<OrderResponse[]>(`/orders?status=${encodeURIComponent(status)}`);
  }

  // Method for searching orders
  async searchOrders(query: string): Promise<OrderResponse[]> {
    return this.makeApiCall<OrderResponse[]>(`/orders/search?q=${encodeURIComponent(query)}`);
  }
}

export const orderService = new OrderService();