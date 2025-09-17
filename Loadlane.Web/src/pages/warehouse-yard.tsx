
import { default as TruckDocks } from '../components/TruckDocks';
import { DockStatus } from '../types/docking';
import type { DockData, TruckData } from '../types/docking';


const staticDocks: DockData[] = [
  { id: 1, status: DockStatus.FREE },
  { id: 2, status: DockStatus.BLOCKED },
  { id: 3, status: DockStatus.FREE },
  { id: 4, status: DockStatus.FREE }
];

const staticTrucks: TruckData[] = [
  {
    id: 1,
    text: "DHL",
    numberPlate: "HH-SP 123",
    targetDock: 1
  },
  {
    id: 2,
    text: "Rhenus",
    numberPlate: "UN RH 123",
    targetDock: 3
  }
];

export default function WarehouseYardPage() {
    return (
        <div className="w-full h-full">
      <TruckDocks
        docks={staticDocks}
        trucks={staticTrucks}
        onDockStatusChange={(dockId, newStatus) => {
          console.log(`Dock ${dockId} status changed to: ${newStatus}`);
        }}
        onTruckClick={(truckData, dockId) => {
          console.log(`Truck ${truckData.id} clicked at dock ${dockId}`);
        }}
        onTruckRemovalComplete={(truckId) => {
          console.log(`Truck ${truckId} removal completed`);
        }}
      />
    </div>
  );
}