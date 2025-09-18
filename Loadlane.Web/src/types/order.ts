// Location types
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

// Article types
export interface Article {
  name: string;
  description?: string;
  weight?: number;
  volume?: number;
}

export interface ArticleResponse {
  id: string;
  name: string;
  description?: string;
  weight?: number;
  volume?: number;
}

// Carrier types (simplified for order form)
export interface Carrier {
  name: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface CarrierResponse {
  id: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  createdUtc: string;
}

// Stopp/Waypoint types
export interface Stopp {
  location: Location;
  sequenceNumber: number;
  plannedArrival?: Date;
  isWarehouse?: boolean;
  warehouseId?: string;
}

export interface StoppResponse {
  id: string;
  sequenceNumber: number;
  plannedArrival?: string;
  actualArrival?: string;
  location: LocationResponse;
}

// Order types
export interface CreateOrderRequest {
  extOrderNo: string;
  quantity: number;
  articleId: string;
  carrierId: string;
  startLocation: Location;
  destinationLocation: Location;
  plannedDeparture?: Date;
  plannedArrival?: Date;
  stopps?: Stopp[];
}

export interface OrderResponse {
  id: string;
  extOrderNo: string;
  quantity: number;
  article: ArticleResponse;
  transport: TransportResponse;
  directionsCacheKey?: string;
  createdUtc: string;
}

export interface TransportResponse {
  id: string;
  transportId: string;
  status: TransportStatus;
  carrier?: CarrierResponse;
  startLocation?: LocationResponse;
  destinationLocation?: LocationResponse;
  vehicle?: VehicleResponse | null;
  stopps: StoppResponse[];
  createdUtc: string;
}
export interface VehicleResponse {
  id: string;
  licencePlate: string;
  createdUtc: string;
}

export type TransportStatus =
  | "Draft"
  | "Pending"
  | "Accepted"
  | "Rejected"
  | "InProgress"
  | "Completed"
  | "Cancelled"
  | "Waiting";

// Waypoint with warehouse option
export interface WaypointFormData {
  location: Location;
  sequenceNumber: number;
  plannedArrival?: Date;
  isWarehouse: boolean;
  warehouseId?: string;
}

// Form data types
export interface OrderFormData {
  extOrderNo: string;
  quantity: number;
  articleId: string;
  articleName?: string;
  articleDescription?: string;
  articleWeight?: number;
  articleVolume?: number;
  carrierId: string;
  startLocation: Location;
  destinationLocation: Location;
  plannedDeparture?: Date;
  plannedArrival?: Date;
  waypoints: WaypointFormData[];
}
