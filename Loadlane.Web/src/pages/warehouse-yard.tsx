
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { default as TruckDocks } from '../components/TruckDocks';
import { DockStatus } from '../types/docking';
import type { DockData, TruckData, DockStatusType } from '../types/docking';
import type { WarehouseResponse, GateSimpleResponse } from "../types/warehouse";
import type { DockingDto } from "../types/yard";
import { warehouseService } from '../services/warehouseService';
import { yardService } from '../services/yardService';

// Hilfsfunktion um Status basierend auf isActive zu bestimmen
const getDockStatus = (gate: GateSimpleResponse): DockStatusType => {
  return gate.isActive ? DockStatus.FREE : DockStatus.BLOCKED;
};

// Funktion um GateSimpleResponse zu DockData zu erweitern
const enrichGateWithStatus = (gate: GateSimpleResponse): DockData => ({
  ...gate,
  status: getDockStatus(gate)
});

// Mapping-Funktion von DockingDto zu TruckData
const mapDockingToTruck = (docking: DockingDto, index: number): TruckData | null => {
  console.log(`Mapping docking ${index}:`, {
    hasVehicle: !!docking.vehicle,
    hasDepartureTime: !!docking.departureTime,
    vehicle: docking.vehicle,
    departureTime: docking.departureTime
  });

  // Nur Fahrzeuge zurückgeben, die tatsächlich gedockt sind (Vehicle vorhanden und kein DepartureTime)
  if (!docking.vehicle || docking.departureTime) {
    console.log(`Filtering out docking ${index}: no vehicle or has departure time`);
    return null;
  }

  const truck = {
    id: parseInt(docking.vehicle.id) || index + 1, // Fallback auf Index wenn ID nicht numerisch
    text: docking.vehicle.carrier,
    numberPlate: docking.vehicle.licensePlate,
    targetDock: docking.gate.number
  };
  
  console.log(`Successfully mapped truck ${index}:`, truck);
  return truck;
};

export default function WarehouseYardPage() {
    const { id } = useParams<{ id: string }>();
    const [warehouse, setWarehouse] = useState<WarehouseResponse | null>(null);
    const [docks, setDocks] = useState<DockData[]>([]);
    const [trucks, setTrucks] = useState<TruckData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadWarehouseData = async () => {
            if (!id) {
                setError('Warehouse ID is required');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Lade Warehouse, Gates und Yard-Daten parallel
                const [warehouseData, gatesData, yardData] = await Promise.all([
                    warehouseService.getWarehouseById(id),
                    warehouseService.getWarehouseGates(id),
                    yardService.getDockedVehicles(id)
                ]);

                setWarehouse(warehouseData);
                
                // Erweitere Gates mit Status zu Docks
                const enrichedDocks = gatesData.map(enrichGateWithStatus);
                setDocks(enrichedDocks);

                // Mappe Yard-Daten zu Trucks (nur gedockte Fahrzeuge)
                console.log('Raw yard data:', yardData);
                const mappedTrucks = yardData
                    .map((docking, index) => {
                        console.log(`Processing docking ${index}:`, docking);
                        const result = mapDockingToTruck(docking, index);
                        console.log(`Mapped result ${index}:`, result);
                        return result;
                    })
                    .filter((truck): truck is TruckData => truck !== null);
                console.log('Final mapped trucks:', mappedTrucks);
                setTrucks(mappedTrucks);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Fehler beim Laden der Warehouse-Daten');
                console.error('Error loading warehouse data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadWarehouseData();
    }, [id]);

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-lg">Lade Warehouse-Daten...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-lg text-red-500">Fehler: {error}</div>
            </div>
        );
    }

    if (!warehouse) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-lg">Warehouse nicht gefunden</div>
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            <TruckDocks
                docks={docks}
                trucks={trucks}
                warehouseText={warehouse.name}
                onDockStatusChange={(dockId, newStatus) => {
                    console.log(`Dock ${dockId} status changed to: ${newStatus}`);
                    // Aktualisiere lokalen State
                    setDocks(prevDocks => 
                        prevDocks.map(dock => 
                            dock.number === dockId ? { ...dock, status: newStatus } : dock
                        )
                    );
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