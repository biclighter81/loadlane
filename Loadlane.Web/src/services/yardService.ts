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

  /**
   * Updates the gate status for a specific dock and transport
   * @param waypointId - The ID of the waypoint
   * @param dockId - The ID of the dock/gate
   * @param transportId - The ID of the transport (optional)
   */
  async updateGateStatus(waypointId: string, dockId: number, transportId?: string): Promise<void> {
    console.log(`Updating gate status for waypoint ${waypointId}, dock ${dockId}, transport ${transportId || 'none'}`);
    
    const response = await fetch(`${API_BASE_URL}/yard/gate-status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ waypointId, dockId, transportId })
    });
    
    return this.handleResponse<void>(response);
  }

  /**
   * Removes a docked vehicle from the warehouse
   * @param waypointId - The ID of the waypoint
   * @param vehicleId - The ID of the vehicle/truck to remove
   */
  async removeDockedVehicle(waypointId: string, vehicleId: string): Promise<void> {
    console.log(`Removing docked vehicle ${vehicleId} from waypoint ${waypointId}`);
    
    const response = await fetch(`${API_BASE_URL}/yard/remove-vehicle`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ waypointId, vehicleId })
    });
    
    return this.handleResponse<void>(response);
  }
}

export const yardService = new YardService();