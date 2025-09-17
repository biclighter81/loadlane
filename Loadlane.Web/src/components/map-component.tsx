import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import {
    Building2,
    Package,
    Truck,
    RotateCcw,
    X
} from 'lucide-react';
import type { Warehouse, RouteSelection, RouteData, SelectionMode } from '../types/map';
import { useNavigate } from 'react-router-dom';

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
    const [selectedWarehouses, setSelectedWarehouses] = useState<RouteSelection>({
        start: null,
        waypoints: [],
        destination: null
    });
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('start');
    const [selectedWarehouseInfo, setSelectedWarehouseInfo] = useState<Warehouse | null>(null);
    const [warehouseDetailView, setWarehouseDetailView] = useState<Warehouse | null>(null);
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const warehouseMarkers = useRef<mapboxgl.Marker[]>([]);
    const routeCarMarker = useRef<mapboxgl.Marker | null>(null);
    const isRouteSourceAddedRef = useRef(false);
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

        newConnection.on('Route', (payload: RouteData) => {
            if (!map.current) return;

            const coords = payload.coordinates;
            const line = {
                type: 'Feature' as const,
                properties: {},
                geometry: { type: 'LineString' as const, coordinates: coords }
            };

            if (!isRouteSourceAddedRef.current) {
                map.current.addSource('route', { type: 'geojson', data: line });
                map.current.addLayer({
                    id: 'route-line',
                    type: 'line',
                    source: 'route',
                    paint: { 'line-color': '#3b82f6', 'line-width': 5 }
                });
                isRouteSourceAddedRef.current = true;
            } else {
                const source = map.current.getSource('route') as mapboxgl.GeoJSONSource;
                source.setData(line);
            }

            const bounds = coords.reduce((b, c) => b.extend(c as [number, number]), new mapboxgl.LngLatBounds(coords[0] as [number, number], coords[0] as [number, number]));
            map.current.fitBounds(bounds, { padding: 60, duration: 0 });

            // Add route car marker
            const carEl = document.createElement('div');
            carEl.className = 'text-3xl flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full text-white';
            carEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 19a6 6 0 0 0 6-6V7h2a2 2 0 0 1 2 2v6"/><circle cx="20" cy="16" r="2"/><path d="M8 19a6 6 0 0 1-6-6V9a2 2 0 0 1 2-2h2"/><circle cx="4" cy="16" r="2"/></svg>';
            routeCarMarker.current = new mapboxgl.Marker({ element: carEl })
                .setLngLat(coords[0] as [number, number])
                .addTo(map.current);
        });

        newConnection.on('Position', (p: { lng: number; lat: number }) => {
            if (routeCarMarker.current) {
                routeCarMarker.current.setLngLat([p.lng, p.lat]);
            }
        });

        newConnection.on('TripCompleted', () => {
            if (routeCarMarker.current) {
                const carEl = routeCarMarker.current.getElement();
                carEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>';
                carEl.className = 'text-3xl flex items-center justify-center w-8 h-8 bg-green-500 rounded-full text-white';
            }
        });

        newConnection.start().catch(console.error);
        setConnection(newConnection);

        return () => {
            newConnection.stop();
        };
    }, []);

    const handleWarehouseSelect = (warehouse: Warehouse) => {
        setSelectedWarehouses(prev => {
            const newSelection = { ...prev };

            switch (selectionMode) {
                case 'start':
                    newSelection.start = newSelection.start?.id === warehouse.id ? null : warehouse;
                    break;
                case 'waypoint':
                    const index = newSelection.waypoints.findIndex(w => w.id === warehouse.id);
                    if (index > -1) {
                        newSelection.waypoints.splice(index, 1);
                    } else {
                        newSelection.waypoints.push(warehouse);
                    }
                    break;
                case 'destination':
                    newSelection.destination = newSelection.destination?.id === warehouse.id ? null : warehouse;
                    break;
            }

            return newSelection;
        });
    };

    const handleWarehouseClick = (warehouse: Warehouse) => {
        navigate(`/warehouse/${warehouse.id}`);
    };

    const handleStartTrip = async () => {
        if (!connection || !selectedWarehouses.start || !selectedWarehouses.destination) {
            return;
        }

        const waypoints = selectedWarehouses.waypoints.map(w => ({ lng: w.lng, lat: w.lat }));

        try {
            await connection.invoke('StartTripWithWaypoints',
                selectedWarehouses.start.lng, selectedWarehouses.start.lat,
                selectedWarehouses.destination.lng, selectedWarehouses.destination.lat,
                waypoints, 12);

            if (routeCarMarker.current) {
                const carEl = routeCarMarker.current.getElement();
                carEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 19a6 6 0 0 0 6-6V7h2a2 2 0 0 1 2 2v6"/><circle cx="20" cy="16" r="2"/><path d="M8 19a6 6 0 0 1-6-6V9a2 2 0 0 1 2-2h2"/><circle cx="4" cy="16" r="2"/></svg>';
                carEl.className = 'text-3xl flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full text-white';
            }
        } catch (error) {
            console.error('Failed to start trip:', error);
        }
    };

    const handleStopTrip = async () => {
        if (!connection) return;

        try {
            await connection.invoke('StopTrip');
            if (routeCarMarker.current) {
                const carEl = routeCarMarker.current.getElement();
                carEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="6" height="6" x="9" y="9"/><rect width="20" height="20" x="2" y="2" rx="2"/></svg>';
                carEl.className = 'text-3xl flex items-center justify-center w-8 h-8 bg-orange-500 rounded-full text-white';
            }
        } catch (error) {
            console.error('Failed to stop trip:', error);
        }
    };

    const handleClearRoute = () => {
        setSelectedWarehouses({ start: null, waypoints: [], destination: null });

        if (map.current && isRouteSourceAddedRef.current) {
            map.current.removeLayer('route-line');
            map.current.removeSource('route');
            isRouteSourceAddedRef.current = false;
        }

        if (routeCarMarker.current) {
            routeCarMarker.current.remove();
            routeCarMarker.current = null;
        }
    };

    const getWarehouseRole = (warehouse: Warehouse) => {
        if (selectedWarehouses.start?.id === warehouse.id) return 'START';
        if (selectedWarehouses.destination?.id === warehouse.id) return 'DESTINATION';
        if (selectedWarehouses.waypoints.find(w => w.id === warehouse.id)) return 'WAYPOINT';
        return null;
    };

    return (
        <div className="flex h-full gap-4">
            {/* Map */}
            <div className="flex-1 relative">
                <div ref={mapContainer} className="w-full h-full rounded-lg" />
            </div>

            {/* Control Panel */}
            <Card className="w-80 flex flex-col">
                <CardHeader>
                    <CardTitle>Route Planning</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                    {/* Selection Mode */}
                    <div>
                        <Label className="text-sm font-medium mb-2 block">Selection Mode</Label>
                        <RadioGroup value={selectionMode} onValueChange={(value: SelectionMode) => setSelectionMode(value)}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="start" id="start" />
                                <Label htmlFor="start">Start Point</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="waypoint" id="waypoint" />
                                <Label htmlFor="waypoint">Waypoint</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="destination" id="destination" />
                                <Label htmlFor="destination">Destination</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <Separator />

                    {/* Warehouses */}
                    <div className="flex-1">
                        <Label className="text-sm font-medium mb-2 block">Warehouses</Label>
                        <ScrollArea className="h-64">
                            <div className="space-y-2">
                                {warehouses.map((warehouse) => {
                                    const role = getWarehouseRole(warehouse);
                                    return (
                                        <div
                                            key={warehouse.id}
                                            className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${role ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                                }`}
                                            onClick={() => handleWarehouseClick(warehouse)}
                                            onContextMenu={(e) => {
                                                e.preventDefault();
                                                setSelectedWarehouseInfo(warehouse);
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">
                                                        {React.createElement(getWarehouseIcon(warehouse.type), { className: "h-5 w-5" })}
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-medium text-sm truncate">{warehouse.name}</div>
                                                        <div className="text-xs text-gray-500">{warehouse.capacity.toLocaleString()}m³</div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    {role && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {role}
                                                        </Badge>
                                                    )}
                                                    <Badge variant="outline" className={`text-xs ${getTypeColor(warehouse.type)}`}>
                                                        {warehouse.type}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </div>

                    <Separator />

                    {/* Route Summary */}
                    <div>
                        <Label className="text-sm font-medium mb-2 block">Route</Label>
                        <div className="text-sm space-y-1">
                            {selectedWarehouses.start && (
                                <div>Start: {selectedWarehouses.start.name}</div>
                            )}
                            {selectedWarehouses.waypoints.length > 0 && (
                                <div>Waypoints: {selectedWarehouses.waypoints.map(w => w.name).join(', ')}</div>
                            )}
                            {selectedWarehouses.destination && (
                                <div>Destination: {selectedWarehouses.destination.name}</div>
                            )}
                            {!selectedWarehouses.start && !selectedWarehouses.destination && (
                                <div className="text-gray-500">Click warehouses to build your route</div>
                            )}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="space-y-2">
                        <Button
                            onClick={handleStartTrip}
                            className="w-full"
                            disabled={!selectedWarehouses.start || !selectedWarehouses.destination}
                        >
                            Start Trip
                        </Button>
                        <div className="flex gap-2">
                            <Button onClick={handleStopTrip} variant="outline" className="flex-1">
                                Stop Trip
                            </Button>
                            <Button onClick={handleClearRoute} variant="outline" className="flex-1">
                                Clear Route
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Warehouse Info Drawer */}
            {selectedWarehouseInfo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setSelectedWarehouseInfo(null)}>
                    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <span className="text-2xl">
                                        {React.createElement(getWarehouseIcon(selectedWarehouseInfo.type), { className: "h-6 w-6" })}
                                    </span>
                                    {selectedWarehouseInfo.name}
                                </h2>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedWarehouseInfo(null)}>
                                    {React.createElement(X, { className: "h-4 w-4" })}
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label className="font-medium">Type</Label>
                                    <Badge className={`ml-2 ${getTypeColor(selectedWarehouseInfo.type)}`}>
                                        {selectedWarehouseInfo.type}
                                    </Badge>
                                </div>

                                <div>
                                    <Label className="font-medium">Capacity</Label>
                                    <p className="text-sm mt-1">{selectedWarehouseInfo.capacity.toLocaleString()} m³</p>
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

                            <div className="mt-6 text-xs text-gray-500">
                                <p>Left-click to select for route, right-click for info</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}