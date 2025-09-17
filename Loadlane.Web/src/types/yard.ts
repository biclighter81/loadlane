// TypeScript-Typen für die Yard-API
export interface VehicleDto {
  id: string;
  licensePlate: string;
  carrier: string;
  driverName: string;
  driverContact: string;
}

export interface GatesDto {
  id: string;
  number: number;
  is_active: boolean;
  type: string;
  description: string;
}

export interface DockingDto {
  vehicle: VehicleDto | null;
  gate: GatesDto;
  arrivalTime: string | null;
  departureTime: string | null;
}