import type { DockingDto } from '../types/yard';

const API_BASE_URL = 'http://localhost:5119/api';

class YardService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async getDockedVehicles(warehouseId: string): Promise<DockingDto[]> {
    const response = await fetch(`${API_BASE_URL}/yard?warehouseId=${encodeURIComponent(warehouseId)}`);
    return this.handleResponse<DockingDto[]>(response);
  }
}

export const yardService = new YardService();