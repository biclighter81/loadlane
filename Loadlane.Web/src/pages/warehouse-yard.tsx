
import { useParams } from 'react-router-dom';
import { default as TruckDocks } from '../components/TruckDocks';
import { DockStatus } from '../types/docking';
import type { DockData, TruckData } from '../types/docking';
import type { Warehouse } from "../types/map";

const warehouses: Warehouse[] = [
    { id: 1, name: "Berlin Central Hub", lng: 13.4050, lat: 52.5200, type: "Distribution", capacity: 10000, description: "Main distribution center in Berlin city center" },
    { id: 2, name: "Spandau Logistics", lng: 13.1948, lat: 52.5370, type: "Storage", capacity: 15000, description: "Large storage facility in Spandau district" },
    { id: 3, name: "Tempelhof Warehouse", lng: 13.3851, lat: 52.4728, type: "Fulfillment", capacity: 8000, description: "E-commerce fulfillment center near former airport" },
    { id: 4, name: "Marzahn CrossDock", lng: 13.5435, lat: 52.5433, type: "CrossDock", capacity: 5000, description: "Cross-docking facility in eastern Berlin" },
    { id: 5, name: "Reinickendorf Storage", lng: 13.3282, lat: 52.5836, type: "Storage", capacity: 12000, description: "Cold storage and general warehousing" },
    { id: 6, name: "Lichtenberg Hub", lng: 13.5034, lat: 52.5158, type: "Distribution", capacity: 9000, description: "Regional distribution hub with rail access" }
];

const staticDocks: DockData[] = [
  { id: 1, status: DockStatus.FREE },
  { id: 2, status: DockStatus.BLOCKED },
  { id: 3, status: DockStatus.FREE },
  { id: 4, status: DockStatus.FREE },
  { id: 5, status: DockStatus.SELECTED }
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
    const { id } = useParams();
    const warehouse = warehouses.find(wh => wh.id === Number(id));
    return (

        <div className="w-full h-full">
            <h1 className="text-2xl font-bold mb-4">{warehouse?.name}</h1>
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