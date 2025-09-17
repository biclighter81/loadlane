export interface Location {
  city: string;
  street: string;
  houseNo: string;
  postCode: string;
  latitude: number;
  longitude: number;
}

export interface LocationResponse {
  id: string;
  city: string;
  street: string;
  houseNo: string;
  postCode: string;
  latitude: number;
  longitude: number;
}

export interface CreateWarehouseRequest {
  organisation: string;
  name: string;
  location: Location;
  gates?: CreateGateRequest[];
}

export interface UpdateWarehouseRequest {
  organisation: string;
  name: string;
  location: Location;
}

export interface CreateGateRequest {
  number: string;
  description?: string;
}

export interface UpdateGateRequest {
  number: string;
  description?: string;
  isActive?: boolean;
}

export interface GateResponse {
  id: string;
  number: string;
  description?: string;
  isActive: boolean;
  warehouse?: WarehouseResponse;
  createdUtc: string;
}

export interface GateSimpleResponse {
  id: string;
  number: string;
  description?: string;
  isActive: boolean;
  createdUtc: string;
}

export interface WarehouseResponse {
  id: string;
  organisation: string;
  name: string;
  location: LocationResponse;
  gates: GateSimpleResponse[];
  createdUtc: string;
}

// Legacy types for backward compatibility with existing map components
export interface Warehouse {
  id: number;
  name: string;
  lng: number;
  lat: number;
  type: 'Distribution' | 'Storage' | 'Fulfillment' | 'CrossDock';
  capacity: number;
  description: string;
}