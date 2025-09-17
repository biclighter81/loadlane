import type {
  WarehouseResponse,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
  GateResponse,
  CreateGateRequest,
  UpdateGateRequest,
  GateSimpleResponse
} from '../types/warehouse';

const API_BASE_URL = 'http://localhost:5119/api';

class WarehouseService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // Warehouse endpoints
  async getAllWarehouses(): Promise<WarehouseResponse[]> {
    const response = await fetch(`${API_BASE_URL}/warehouses`);
    return this.handleResponse<WarehouseResponse[]>(response);
  }

  async getWarehouseById(id: string): Promise<WarehouseResponse> {
    const response = await fetch(`${API_BASE_URL}/warehouses/${id}`);
    return this.handleResponse<WarehouseResponse>(response);
  }

  async createWarehouse(warehouse: CreateWarehouseRequest): Promise<WarehouseResponse> {
    const response = await fetch(`${API_BASE_URL}/warehouses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(warehouse),
    });
    return this.handleResponse<WarehouseResponse>(response);
  }

  async updateWarehouse(id: string, warehouse: UpdateWarehouseRequest): Promise<WarehouseResponse> {
    const response = await fetch(`${API_BASE_URL}/warehouses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(warehouse),
    });
    return this.handleResponse<WarehouseResponse>(response);
  }

  async deleteWarehouse(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/warehouses/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Delete failed' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
  }

  // Gate endpoints
  async getGateById(id: string): Promise<GateResponse> {
    const response = await fetch(`${API_BASE_URL}/warehouses/gates/${id}`);
    return this.handleResponse<GateResponse>(response);
  }

  async getWarehouseGates(warehouseId: string): Promise<GateSimpleResponse[]> {
    const response = await fetch(`${API_BASE_URL}/warehouses/${warehouseId}/gates`);
    return this.handleResponse<GateSimpleResponse[]>(response);
  }

  async createGate(warehouseId: string, gate: CreateGateRequest): Promise<GateResponse> {
    const response = await fetch(`${API_BASE_URL}/warehouses/${warehouseId}/gates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gate),
    });
    return this.handleResponse<GateResponse>(response);
  }

  async updateGate(id: string, gate: UpdateGateRequest): Promise<GateResponse> {
    const response = await fetch(`${API_BASE_URL}/warehouses/gates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gate),
    });
    return this.handleResponse<GateResponse>(response);
  }

  async deleteGate(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/warehouses/gates/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Delete failed' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
  }
}

export const warehouseService = new WarehouseService();