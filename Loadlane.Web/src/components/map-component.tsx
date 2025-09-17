import React, { useEffect, useRef, useState, useCallback } from 'react';
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
import type { Warehouse } from '../types/map';
import { useWarehouses } from '../hooks/useWarehouse';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from './ui/sheet';
import { OrderSearchPanel } from './OrderSearchPanel';

// Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiYmljbGlnaHRlcjgxIiwiYSI6ImNtZm1tMzYzbjAyc3Yya3NqZ2Fqa3IzOWEifQ.3g3VkSpDLMAFVQCYJ9dtFQ';

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

export function MapComponent() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [selectedWarehouseInfo, setSelectedWarehouseInfo] = useState<Warehouse | null>(null);
    const [selectedTransportInfo, setSelectedTransportInfo] = useState<any | null>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const warehouseMarkers = useRef<mapboxgl.Marker[]>([]);
    const transportMarkers = useRef<Map<string, mapboxgl.Marker>>(new Map());
    const transportRoutes = useRef<Map<string, any>>(new Map()); // Store route data for each transport
    const [visibleRoute, setVisibleRoute] = useState<string | null>(null); // Currently visible route
    const connection = useRef<HubConnection | null>(null);
    const navigate = useNavigate();

    // Get warehouse data from API
    const { warehouses: warehouseData, loading: warehousesLoading } = useWarehouses();

    // Transform API warehouse data to legacy format for map display
    const warehouses: Warehouse[] = warehouseData.map((w) => ({
        id: parseInt(w.id), // Convert UUID to number for legacy compatibility
        name: w.name,
        lng: w.location.longitude,
        lat: w.location.latitude,
        type: 'Distribution' as const, // Default type since API doesn't have this field yet
        capacity: 10000, // Default capacity since API doesn't have this field yet
        description: `${w.organisation} warehouse in ${w.location.city}`
    }));

    // Function to hide route
    const hideRoute = (transportId?: string) => {
        if (!map.current) return;

        const targetTransportId = transportId || visibleRoute;
        if (!targetTransportId) return;

        const sourceId = `route-${targetTransportId}`;
        const layerId = `route-line-${targetTransportId}`;

        if (map.current.getSource(sourceId)) {
            if (map.current.getLayer(layerId)) {
                map.current.removeLayer(layerId);
            }
            map.current.removeSource(sourceId);
            setVisibleRoute(null);
            console.log('Hidden route for transport:', targetTransportId);
        }
    };

    // Function to handle transport drawer close
    const handleTransportDrawerClose = () => {
        if (selectedTransportInfo) {
            hideRoute(selectedTransportInfo.transportId);
            setSelectedTransportInfo(null);
        }
    };

    // Function to show route
    const showRoute = useCallback((transportId: string) => {
        if (!map.current) return;

        const routeData = transportRoutes.current.get(transportId);
        if (!routeData) {
            console.log('No route data available for transport:', transportId);
            return;
        }

        const sourceId = `route-${transportId}`;
        const layerId = `route-line-${transportId}`;

        // Hide any other visible route first
        if (visibleRoute && visibleRoute !== transportId) {
            const oldSourceId = `route-${visibleRoute}`;
            const oldLayerId = `route-line-${visibleRoute}`;
            if (map.current.getSource(oldSourceId)) {
                if (map.current.getLayer(oldLayerId)) {
                    map.current.removeLayer(oldLayerId);
                }
                map.current.removeSource(oldSourceId);
            }
        }

        // Don't add if already visible
        if (map.current.getSource(sourceId)) {
            return;
        }

        // Show the route
        const geojson = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: routeData.coordinates
            }
        };

        map.current.addSource(sourceId, {
            type: 'geojson',
            data: geojson as any
        });

        map.current.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#3b82f6',
                'line-width': 4,
                'line-opacity': 0.8
            }
        });

        setVisibleRoute(transportId);

        // Fit map to route bounds
        const coordinates = routeData.coordinates;
        const bounds = coordinates.reduce((bounds: any, coord: any) => {
            return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

        map.current.fitBounds(bounds, {
            padding: 60,
            duration: 1000
        });

        console.log('Showing route for transport:', transportId, 'Distance:', routeData.distance, 'Duration:', routeData.duration);
    }, [visibleRoute]);

    // Function to handle transport selection
    const selectTransport = useCallback((transport: any) => {
        // Show the route
        showRoute(transport.transportId);

        // Get route data for additional info
        const routeData = transportRoutes.current.get(transport.transportId);

        // Set selected transport with route data
        setSelectedTransportInfo({
            ...transport,
            routeData
        });
    }, [showRoute]);

    // Function to handle order selection - zoom to transport's current position
    const handleOrderSelect = useCallback((order: any) => {
        if (!map.current || !order.transport) return;

        const transportId = order.transport.transportId;
        const marker = transportMarkers.current.get(transportId);

        if (marker) {
            // Get current position of the transport marker
            const currentPos = marker.getLngLat();

            // Zoom to the transport's current position
            map.current.flyTo({
                center: [currentPos.lng, currentPos.lat],
                zoom: 10,
                duration: 2000
            });

            // Optional: Show route if available
        } else {
            // If marker doesn't exist, zoom to start location
            if (order.transport.startLocation) {
                map.current.flyTo({
                    center: [order.transport.startLocation.longitude, order.transport.startLocation.latitude],
                    zoom: 15,
                    duration: 2000
                });
            }
        }
    }, [showRoute, selectTransport]);

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

        return () => {
            mapInstance.remove();
        };
    }, []);

    // Add warehouse markers when warehouse data is loaded
    useEffect(() => {
        if (!map.current || warehousesLoading || warehouses.length === 0) return;

        // Clear existing warehouse markers
        warehouseMarkers.current.forEach(marker => marker.remove());

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
                .addTo(map.current!);

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
        };
    }, [warehouses, warehousesLoading]);

    // Initialize SignalR connection and transport subscriptions
    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl('http://localhost:5119/hub/trip')
            .withAutomaticReconnect()
            .build();

        // Handle Transport events - when a new transport is received from backend
        newConnection.on('Transport', (transport: any) => {
            if (!map.current) return;

            console.log('Received transport:', transport);

            // Store the order/transport data
            setOrders(prevOrders => {
                // Check if order already exists (avoid duplicates)
                const existingOrderIndex = prevOrders.findIndex(order =>
                    order.orderId === transport.orderId ||
                    order.transport?.transportId === transport.transportId
                );

                if (existingOrderIndex >= 0) {
                    // Update existing order
                    const updatedOrders = [...prevOrders];
                    updatedOrders[existingOrderIndex] = {
                        id: transport.orderId,
                        orderId: transport.orderId,
                        transport: transport,
                        createdAt: new Date().toISOString()
                    };
                    return updatedOrders;
                } else {
                    // Add new order
                    return [...prevOrders, {
                        id: transport.orderId,
                        orderId: transport.orderId,
                        transport: transport,
                        createdAt: new Date().toISOString()
                    }];
                }
            });

            // Create a transport marker
            const markerEl = document.createElement('div');
            markerEl.className = 'transport-marker';
            markerEl.innerHTML = `
                <div class="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full text-white shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                        <path d="M15 18H9"/>
                        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
                        <circle cx="17" cy="18" r="2"/>
                        <circle cx="7" cy="18" r="2"/>
                    </svg>
                </div>
            `;
            markerEl.title = `Transport ${transport.transportId}`;

            const marker = new mapboxgl.Marker({ element: markerEl })
                .setLngLat([transport.startLocation.longitude, transport.startLocation.latitude])
                .addTo(map.current);

            // Store the marker for position updates
            transportMarkers.current.set(transport.transportId, marker);

            // Add tooltip functionality that follows the marker
            let popup: mapboxgl.Popup | null = null;

            const showTooltip = () => {
                if (popup) popup.remove(); // Remove existing popup if any

                const currentLngLat = marker.getLngLat();
                popup = new mapboxgl.Popup({
                    offset: 25,
                    closeButton: false,
                    className: 'transport-tooltip'
                })
                    .setLngLat(currentLngLat)
                    .setHTML(`
                        <div class="p-2">
                            <div class="font-semibold">${transport.transportId}</div>
                            <div class="text-sm text-gray-600">Status: ${transport.status}</div>
                            <div class="text-sm text-gray-600">Carrier: ${transport.carrier || 'Unknown'}</div>
                        </div>
                    `)
                    .addTo(map.current!);

                // Store reference for position updates
                (markerEl as any)._popup = popup;
            };

            const hideTooltip = () => {
                if (popup) {
                    popup.remove();
                    popup = null;
                }
                (markerEl as any)._popup = null;
            };

            markerEl.addEventListener('mouseenter', showTooltip);
            markerEl.addEventListener('mouseleave', hideTooltip);

            // Add click handler to select transport and show route
            markerEl.addEventListener('click', () => {
                selectTransport(transport);
            });
        });

        // Handle Route events - store route data for each transport
        newConnection.on('Route', (routeData: any) => {
            console.log('Received route data:', routeData);

            if (routeData.transportId && routeData.coordinates) {
                // Store the route data for this transport
                transportRoutes.current.set(routeData.transportId, routeData);
            }
        });

        // Handle Position updates - move the transport markers
        newConnection.on('Position', (position: any) => {
            if (!map.current) return;

            const marker = transportMarkers.current.get(position.transportId);
            if (marker) {
                // Animate the marker movement
                marker.setLngLat([position.lng, position.lat]);

                // Optional: update marker style to show it's moving
                const markerEl = marker.getElement();
                markerEl.style.transform += ' scale(1.1)';
                setTimeout(() => {
                    markerEl.style.transform = markerEl.style.transform.replace(' scale(1.1)', '');
                }, 200);

                // Update tooltip position if it's currently visible
                const popup = (markerEl as any)._popup;
                if (popup && popup.isOpen()) {
                    popup.setLngLat([position.lng, position.lat]);
                }
            }
        });

        // Handle Transport completed events
        newConnection.on('TransportCompleted', (completion: any) => {
            console.log('Transport completed:', completion);

            const marker = transportMarkers.current.get(completion.transportId);
            if (marker) {
                // Change marker appearance to show completion
                const markerEl = marker.getElement();
                const innerDiv = markerEl.querySelector('div');
                if (innerDiv) {
                    innerDiv.className = 'flex items-center justify-center w-8 h-8 bg-green-500 rounded-full text-white shadow-lg';
                    innerDiv.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 6 9 17l-5-5"/>
                        </svg>
                    `;
                }

                // Remove marker after a delay
                setTimeout(() => {
                    marker.remove();
                    transportMarkers.current.delete(completion.transportId);
                }, 5000);
            }
        });

        // Start connection and automatically subscribe to all orders
        newConnection.start()
            .then(() => {
                console.log('SignalR connected, subscribing to orders...');
                return newConnection.invoke('SubscribeToOrders');
            })
            .then(() => {
                console.log('Successfully subscribed to all transport orders');
            })
            .catch(err => console.error('SignalR connection error:', err));

        connection.current = newConnection;

        return () => {
            // Clean up transport markers
            transportMarkers.current.forEach(marker => marker.remove());
            transportMarkers.current.clear();

            newConnection.stop();
        };
    }, []);

    const handleWarehouseClick = (warehouse: Warehouse) => {
        setSelectedWarehouseInfo(warehouse);
    };

    return (
        <div className="h-full relative">
            {/* Order Search Panel - Top Left */}
            <OrderSearchPanel
                orders={orders}
                onOrderSelect={handleOrderSelect}
                className="absolute top-4 left-4 z-10 shadow-lg"
            />

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

            {/* Transport Info Drawer */}
            {selectedTransportInfo && (
                <Sheet
                    open={!!selectedTransportInfo}
                    onOpenChange={(open) => {
                        if (!open) {
                            // Hide route when closing drawer
                            handleTransportDrawerClose();
                        }
                    }}
                >
                    <SheetContent side="right" className="w-[36rem] p-0">
                        <div className="p-6 h-full flex flex-col">
                            <SheetHeader className="mb-4">
                                <div className="flex items-center justify-start">
                                    <SheetTitle className="flex items-center gap-4">
                                        <span className="text-2xl">
                                            <Truck className="h-5 w-5" />
                                        </span>
                                        Transport {selectedTransportInfo.transportId}
                                    </SheetTitle>
                                </div>
                                <SheetDescription className="sr-only">
                                    Transport information and route details
                                </SheetDescription>
                            </SheetHeader>

                            {selectedTransportInfo && (
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <Label className="font-medium">Status</Label>
                                        <Badge className={`ml-2 ${selectedTransportInfo.status === 'InTransit' ? 'bg-blue-100 text-blue-800' :
                                            selectedTransportInfo.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {selectedTransportInfo.status}
                                        </Badge>
                                    </div>

                                    <div>
                                        <Label className="font-medium">Carrier</Label>
                                        <p className="text-sm mt-1">
                                            {selectedTransportInfo.carrier || 'Unknown'}
                                        </p>
                                    </div>

                                    <div>
                                        <Label className="font-medium">Start Location</Label>
                                        <p className="text-sm mt-1">
                                            {selectedTransportInfo.startLocation?.longitude.toFixed(4)}, {selectedTransportInfo.startLocation?.latitude.toFixed(4)}
                                        </p>
                                    </div>

                                    <div>
                                        <Label className="font-medium">Destination</Label>
                                        <p className="text-sm mt-1">
                                            {selectedTransportInfo.destinationLocation?.longitude.toFixed(4)}, {selectedTransportInfo.destinationLocation?.latitude.toFixed(4)}
                                        </p>
                                    </div>

                                    {selectedTransportInfo.stopps && selectedTransportInfo.stopps.length > 0 && (
                                        <div>
                                            <Label className="font-medium">Stops</Label>
                                            <div className="mt-1 space-y-1">
                                                {selectedTransportInfo.stopps.map((stop: any, index: number) => (
                                                    <p key={index} className="text-sm text-gray-600">
                                                        Stop {index + 1}: {stop.location?.longitude?.toFixed(4)}, {stop.location?.latitude?.toFixed(4)}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedTransportInfo.routeData && (
                                        <>
                                            <div>
                                                <Label className="font-medium">Route Distance</Label>
                                                <p className="text-sm mt-1">
                                                    {(selectedTransportInfo.routeData.distance / 1000).toFixed(2)} km
                                                </p>
                                            </div>

                                            <div>
                                                <Label className="font-medium">Estimated Duration</Label>
                                                <p className="text-sm mt-1">
                                                    {Math.round(selectedTransportInfo.routeData.duration / 60)} minutes
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            <SheetFooter className="mt-auto">
                                <Button
                                    onClick={handleTransportDrawerClose}
                                    className="w-full"
                                    variant="outline"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Close
                                </Button>
                            </SheetFooter>
                        </div>
                    </SheetContent>
                </Sheet>
            )}
        </div>
    );
}