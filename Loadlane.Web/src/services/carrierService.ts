import type {
  CarrierResponse,
  CreateCarrierRequest,
  UpdateCarrierRequest
} from '../types/carrier';

const API_BASE_URL = 'http://localhost:5119/api';

class CarrierService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
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

  async getAllCarriers(): Promise<CarrierResponse[]> {
    return this.makeApiCall<CarrierResponse[]>('/carriers');
  }

  async getCarrierById(id: string): Promise<CarrierResponse> {
    return this.makeApiCall<CarrierResponse>(`/carriers/${id}`);
  }

  async createCarrier(carrier: CreateCarrierRequest): Promise<CarrierResponse> {
    return this.makeApiCall<CarrierResponse>('/carriers', {
      method: 'POST',
      body: JSON.stringify(carrier),
    });
  }

  async updateCarrier(id: string, carrier: UpdateCarrierRequest): Promise<CarrierResponse> {
    return this.makeApiCall<CarrierResponse>(`/carriers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(carrier),
    });
  }

  async deleteCarrier(id: string): Promise<void> {
    await this.makeApiCall<void>(`/carriers/${id}`, {
      method: 'DELETE',
    });
  }
}

export const carrierService = new CarrierService();