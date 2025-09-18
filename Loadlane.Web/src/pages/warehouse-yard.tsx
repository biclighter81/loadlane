
import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { default as TruckDocks } from '../components/TruckDocks';
import { DockStatus } from '../types/docking';
import type { DockData, TruckData, DockStatusType } from '../types/docking';
import type { WarehouseResponse, GateSimpleResponse } from "../types/warehouse";
import type { DockingDto } from "../types/yard";
import type { OrderResponse } from "../types/order";
import { warehouseService } from '../services/warehouseService';
import { yardService } from '../services/yardService';
import { orderService } from '../services/orderService';

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
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const transportId = searchParams.get('transport_id');
    
    const [warehouse, setWarehouse] = useState<WarehouseResponse | null>(null);
    const [order, setOrder] = useState<OrderResponse | null>(null);
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
                const promises: [
                    Promise<WarehouseResponse>,
                    Promise<GateSimpleResponse[]>,
                    Promise<DockingDto[]>
                ] = [
                    warehouseService.getWarehouseById(id),
                    warehouseService.getWarehouseGates(id),
                    yardService.getDockedVehicles(id)
                ];

                // Wenn transport_id Parameter vorhanden ist, lade auch die Order
                if (transportId) {
                    // Finde Order anhand der transportId
                    //todo get order by transportId implementieren
                    //const foundOrder = await orderService.getOrderByTransportId(transportId);
                    //if (foundOrder) {
                    //    setOrder(foundOrder);
                    //}
                    const allOrders = await orderService.getAllOrders();
                    const foundOrder = allOrders.find(order => 
                        order.transport.transportId === transportId
                    );
                    if (foundOrder) {
                        setOrder(foundOrder);
                    }
                }

                const [warehouseData, gatesData, yardData] = await Promise.all(promises);

                setWarehouse(warehouseData);
                
                // Erweitere Gates mit Status zu Docks
                const enrichedDocks = gatesData.map(enrichGateWithStatus);
                setDocks(enrichedDocks);

                // Mappe Yard-Daten zu Trucks (nur gedockte Fahrzeuge)
                console.log('Raw yard data:', yardData);
                const mappedTrucks = yardData
                    .map((docking: DockingDto, index: number) => {
                        console.log(`Processing docking ${index}:`, docking);
                        const result = mapDockingToTruck(docking, index);
                        console.log(`Mapped result ${index}:`, result);
                        return result;
                    })
                    .filter((truck: TruckData | null): truck is TruckData => truck !== null);
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
    }, [id, transportId]);

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
            {/* Header mit Zurück-Button und Transport-ID */}
            <div className="px-6 py-4 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                
                {order && (
                    <div className="flex-1 ml-4">
                        <h1 className="text-xl font-semibold text-gray-900">
                            Transport: {order.transport.transportId}
                        </h1>
                    </div>
                )}
            </div>
            
            {/* Transport-Details wenn transport_id Parameter vorhanden ist */}
            {order && (
                <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 mb-4">
                    <div className="text-sm text-blue-700">
                        {order.transport.carrier?.name && (
                            <span className="mr-4">Spediteur: {order.transport.carrier.name}</span>
                        )}
                        <span className="mr-4">Status: {order.transport.status}</span>
                        {order.transport.startLocation && order.transport.destinationLocation && (
                            <span>
                                Route: {order.transport.startLocation.city} → {order.transport.destinationLocation.city}
                            </span>
                        )}
                    </div>
                </div>
            )}
            
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