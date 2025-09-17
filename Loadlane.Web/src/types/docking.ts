export const DockStatus = {
  FREE: 'free',
  BLOCKED: 'blocked',
  SELECTED: 'selected'
} as const;

export type DockStatusType = typeof DockStatus[keyof typeof DockStatus];

export interface DockData {
  id: number;
  status: DockStatusType;
}

export interface TruckData {
  id: number;
  text: string;
  numberPlate: string;
  targetDock: number;
}

export interface DockProps {
  position: [number, number, number];
  dockNumber: number;
  dockData: DockData;
  onClick: (dockId: number) => void;
}

export interface TruckProps {
  truckData: TruckData;
  dockPosition: [number, number, number];
  isRemoving?: boolean;
  onRemovalComplete?: () => void;
  onClick?: (truckData: TruckData, dockId: number) => void;
}

export interface TruckDocksProps {
  docks: DockData[];
  trucks?: TruckData[];
  removingTrucks?: number[];
  warehouseText?: string;
  onTruckRemovalComplete?: (truckId: number) => void;
  onDockStatusChange?: (dockId: number, newStatus: DockStatusType) => void;
  onTruckClick?: (truckData: TruckData, dockId: number) => void;
}