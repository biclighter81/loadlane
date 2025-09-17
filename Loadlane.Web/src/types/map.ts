export interface Warehouse {
  id: number;
  name: string;
  lng: number;
  lat: number;
  type: 'Distribution' | 'Storage' | 'Fulfillment' | 'CrossDock';
  capacity: number;
  description: string;
}

export interface RouteSelection {
  start: Warehouse | null;
  waypoints: Warehouse[];
  destination: Warehouse | null;
}

export interface RouteData {
  coordinates: number[][];
  distance: number;
  duration: number;
}

export type SelectionMode = 'start' | 'waypoint' | 'destination';