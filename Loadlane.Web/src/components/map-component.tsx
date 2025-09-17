import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import {
    Building2,
    Package,
    Truck,
    RotateCcw,
    X,
    Eye,
    MapPin,
} from 'lucide-react';
import type { Warehouse, RouteData } from '../types/map';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from './ui/sheet';

// Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiYmljbGlnaHRlcjgxIiwiYSI6ImNtZm1tMzYzbjAyc3Yya3NqZ2Fqa3IzOWEifQ.3g3VkSpDLMAFVQCYJ9dtFQ';

const warehouses: Warehouse[] = [
    { id: 1, name: "Berlin Central Hub", lng: 13.4050, lat: 52.5200, type: "Distribution", capacity: 10000, description: "Main distribution center in Berlin city center" },
    { id: 2, name: "Spandau Logistics", lng: 13.1948, lat: 52.5370, type: "Storage", capacity: 15000, description: "Large storage facility in Spandau district" },
    { id: 3, name: "Tempelhof Warehouse", lng: 13.3851, lat: 52.4728, type: "Fulfillment", capacity: 8000, description: "E-commerce fulfillment center near former airport" },
    { id: 4, name: "Marzahn CrossDock", lng: 13.5435, lat: 52.5433, type: "CrossDock", capacity: 5000, description: "Cross-docking facility in eastern Berlin" },
    { id: 5, name: "Reinickendorf Storage", lng: 13.3282, lat: 52.5836, type: "Storage", capacity: 12000, description: "Cold storage and general warehousing" },
    { id: 6, name: "Lichtenberg Hub", lng: 13.5034, lat: 52.5158, type: "Distribution", capacity: 9000, description: "Regional distribution hub with rail access" }
];

const getWarehouseIcon = (type: Warehouse['type']) => {
    switch (type) {
        case 'Distribution': return Building2;
        case 'Storage': return Package;
        case 'Fulfillment': return Truck;
        case 'CrossDock': return RotateCcw;
        default: return Building2;
    }
};

const getWarehouseIconString = (type: Warehouse['type']) => {
    switch (type) {
        case 'Distribution': return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>';
        case 'Storage': return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>';
        case 'Fulfillment': return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>';
        case 'CrossDock': return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>';
        default: return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>';
    }
};

const getWarehouseColorClass = (_type: Warehouse['type']) => {
    switch (_type) {
        case 'Distribution': return 'bg-blue-100 text-blue-800';
        case 'Storage': return 'bg-green-100 text-green-800';
        case 'Fulfillment': return 'bg-purple-100 text-purple-800';
        case 'CrossDock': return 'bg-orange-100 text-orange-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getTypeColor = (type: Warehouse['type']) => {
    switch (type) {
        case 'Distribution': return 'bg-blue-100 text-blue-800';
        case 'Storage': return 'bg-green-100 text-green-800';
        case 'Fulfillment': return 'bg-purple-100 text-purple-800';
        case 'CrossDock': return 'bg-orange-100 text-orange-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getWarehouseDetailBgClass = (type: Warehouse['type']) => {
    switch (type) {
        case 'Distribution': return 'bg-gradient-to-r from-blue-600 to-blue-700';
        case 'Storage': return 'bg-gradient-to-r from-green-600 to-green-700';
        case 'Fulfillment': return 'bg-gradient-to-r from-purple-600 to-purple-700';
        case 'CrossDock': return 'bg-gradient-to-r from-orange-600 to-orange-700';
        default: return 'bg-gradient-to-r from-blue-600 to-blue-700';
    }
};

export function MapComponent() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [selectedWarehouseInfo, setSelectedWarehouseInfo] = useState<Warehouse | null>(null);
    const warehouseMarkers = useRef<mapboxgl.Marker[]>([]);
    const navigate = useNavigate();

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current) return;

        const mapInstance = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [13.4050, 52.52],
            zoom: 11
        });

        map.current = mapInstance;

        // Add warehouse markers
        const markers: mapboxgl.Marker[] = [];
        warehouses.forEach(warehouse => {
            const markerEl = document.createElement('div');
            markerEl.className = 'warehouse-marker';
            markerEl.innerHTML = `
                <div class="warehouse-marker-inner ${getWarehouseColorClass(warehouse.type)}">
                    <div class="warehouse-icon">${getWarehouseIconString(warehouse.type)}</div>
                    <div class="warehouse-pulse"></div>
                </div>
            `;
            markerEl.title = warehouse.name;

            const marker = new mapboxgl.Marker({ element: markerEl })
                .setLngLat([warehouse.lng, warehouse.lat])
                .addTo(mapInstance);

            markerEl.addEventListener('click', (e) => {
                e.stopPropagation();
                handleWarehouseClick(warehouse);
            });

            markerEl.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                setSelectedWarehouseInfo(warehouse);
            });

            markers.push(marker);
        });

        warehouseMarkers.current = markers;

        return () => {
            markers.forEach(marker => marker.remove());
            mapInstance.remove();
        };
    }, []);

    // Initialize SignalR connection
    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl('http://localhost:5119/hub/trip')
            .withAutomaticReconnect()
            .build();

        //newConnection.on('Route', (payload: RouteData) => {
        //     if (!map.current) return;

        //     const coords = payload.coordinates;
        //     const line = {
        //         type: 'Feature' as const,
        //         properties: {},
        //         geometry: { type: 'LineString' as const, coordinates: coords }
        //     };

        //     if (!isRouteSourceAddedRef.current) {
        //         map.current.addSource('route', { type: 'geojson', data: line });
        //         map.current.addLayer({
        //             id: 'route-line',
        //             type: 'line',
        //             source: 'route',
        //             paint: { 'line-color': '#3b82f6', 'line-width': 5 }
        //         });
        //         isRouteSourceAddedRef.current = true;
        //     } else {
        //         const source = map.current.getSource('route') as mapboxgl.GeoJSONSource;
        //         source.setData(line);
        //     }

        //     const bounds = coords.reduce((b, c) => b.extend(c as [number, number]), new mapboxgl.LngLatBounds(coords[0] as [number, number], coords[0] as [number, number]));
        //     map.current.fitBounds(bounds, { padding: 60, duration: 0 });

        //     // Add route car marker
        //     const carEl = document.createElement('div');
        //     carEl.className = 'text-3xl flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full text-white';
        //     carEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 19a6 6 0 0 0 6-6V7h2a2 2 0 0 1 2 2v6"/><circle cx="20" cy="16" r="2"/><path d="M8 19a6 6 0 0 1-6-6V9a2 2 0 0 1 2-2h2"/><circle cx="4" cy="16" r="2"/></svg>';
        //     routeCarMarker.current = new mapboxgl.Marker({ element: carEl })
        //         .setLngLat(coords[0] as [number, number])
        //         .addTo(map.current);
        // });

        // newConnection.on('Position', (p: { lng: number; lat: number }) => {
        //     if (routeCarMarker.current) {
        //         routeCarMarker.current.setLngLat([p.lng, p.lat]);
        //     }
        // });

        // newConnection.on('TripCompleted', () => {
        //     if (routeCarMarker.current) {
        //         const carEl = routeCarMarker.current.getElement();
        //         carEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>';
        //         carEl.className = 'text-3xl flex items-center justify-center w-8 h-8 bg-green-500 rounded-full text-white';
        //     }
        // });

        // newConnection.start().catch(console.error);
        // setConnection(newConnection);

        return () => {
            newConnection.stop();
        };
    }, []);

    const handleWarehouseClick = (warehouse: Warehouse) => {
        setSelectedWarehouseInfo(warehouse);
    };

    return (
        <div className="h-full">
            {/* Map */}
            <div className="w-full h-full">
                <div ref={mapContainer} className="w-full h-full rounded-lg" />
            </div>

            {/* Warehouse Info Drawer */}
            {selectedWarehouseInfo && (
                <Sheet
                    open={!!selectedWarehouseInfo}
                    onOpenChange={(open) => {
                        if (!open) setSelectedWarehouseInfo(null);
                    }}
                >
                    <SheetContent side="right" className="w-[36rem] p-0">
                        <div className="p-6 h-full flex flex-col">
                            <SheetHeader className="mb-4">
                                <div className="flex items-center justify-start">
                                    <SheetTitle className="flex items-center gap-4">
                                        <span className="text-2xl">
                                            {selectedWarehouseInfo &&
                                                React.createElement(
                                                    getWarehouseIcon(selectedWarehouseInfo.type),
                                                    { className: "h-5 w-5" }
                                                )}
                                        </span>
                                        {selectedWarehouseInfo?.name}
                                    </SheetTitle>

                                </div>
                                <SheetDescription className="sr-only">
                                    Warehouse quick info and navigation
                                </SheetDescription>
                            </SheetHeader>

                            {selectedWarehouseInfo && (
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <Label className="font-medium">Type</Label>
                                        <Badge className={`ml-2 ${getTypeColor(selectedWarehouseInfo.type)}`}>
                                            {selectedWarehouseInfo.type}
                                        </Badge>
                                    </div>

                                    <div>
                                        <Label className="font-medium">Capacity</Label>
                                        <p className="text-sm mt-1">
                                            {selectedWarehouseInfo.capacity.toLocaleString()} m³
                                        </p>
                                    </div>

                                    <div>
                                        <Label className="font-medium">Location</Label>
                                        <p className="text-sm mt-1">
                                            {selectedWarehouseInfo.lng.toFixed(4)}, {selectedWarehouseInfo.lat.toFixed(4)}
                                        </p>
                                    </div>

                                    <div>
                                        <Label className="font-medium">Description</Label>
                                        <p className="text-sm mt-1">{selectedWarehouseInfo.description}</p>
                                    </div>
                                </div>
                            )}

                            <SheetFooter className="mt-auto space-y-2">
                                {selectedWarehouseInfo && (
                                    <>
                                        <Button
                                            onClick={() => navigate(`/warehouses/${selectedWarehouseInfo.id}`)}
                                            className="w-full"
                                            variant="default"
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            Details
                                        </Button>
                                        <Button
                                            onClick={() => navigate(`/warehouses/${selectedWarehouseInfo.id}/yard`)}
                                            className="w-full"
                                            variant="outline"
                                        >
                                            <MapPin className="h-4 w-4 mr-2" />
                                            Yard
                                        </Button>
                                    </>
                                )}
                            </SheetFooter>
                        </div>
                    </SheetContent>
                </Sheet>
            )}
        </div>
    );
}