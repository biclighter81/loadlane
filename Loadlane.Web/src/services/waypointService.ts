const API_BASE_URL = 'http://localhost:5119/api';

export interface LocationResponse {
  id: string;
  city: string;
  street: string;
  houseNo: string;
  postCode: string;
  latitude: number;
  longitude: number;
}

export interface GateResponse {
  id: string;
  number: number;
  description?: string;
  isActive: boolean;
  warehouse?: any; // Can be expanded if needed
  createdUtc: string;
}

export interface WaypointResponse {
  id: string;
  plannedArrival?: string;
  actualArrival?: string;
  actualDeparture?: string;
  location: LocationResponse;
  gate?: GateResponse;
  createdUtc: string;
  isDelayed: boolean;
  hasArrived: boolean;
  hasDeparted: boolean;
}

class WaypointService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async getWaypointsByTransportId(transportId: string): Promise<WaypointResponse[]> {
    const response = await fetch(`${API_BASE_URL}/waypoints/transport/${transportId}`);
    return this.handleResponse<WaypointResponse[]>(response);
  }
}

export const waypointService = new WaypointService();