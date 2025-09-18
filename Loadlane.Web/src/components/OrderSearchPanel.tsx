import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Truck, MapPin, Clock, Package, Navigation } from 'lucide-react';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { useOrders } from '../hooks/useOrder';
import { useWarehouses } from '../hooks/useWarehouse';
import type { OrderResponse } from '../types/order';
import type { WarehouseResponse } from '../types/warehouse';

interface OrderSearchPanelProps {
    orders: OrderResponse[];
    onOrderSelect: (order: any) => void;
    className?: string;
    getTransportMarkerPosition?: (transportId: string) => { longitude: number; latitude: number } | null;
}

export function OrderSearchPanel({ orders, onOrderSelect, className = '', getTransportMarkerPosition }: OrderSearchPanelProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOrders, setFilteredOrders] = useState(orders);
    const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);

    const { createOrder } = useOrders();
    const { warehouses } = useWarehouses();
    const navigate = useNavigate();

    // Helper function to calculate distance between two points
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Find the nearest warehouse to a transport location
    const findNearestWarehouse = (latitude: number, longitude: number): WarehouseResponse | null => {
        if (!warehouses || warehouses.length === 0) return null;

        let nearestWarehouse = warehouses[0];
        let minDistance = calculateDistance(latitude, longitude, nearestWarehouse.location.latitude, nearestWarehouse.location.longitude);

        for (let i = 1; i < warehouses.length; i++) {
            const distance = calculateDistance(latitude, longitude, warehouses[i].location.latitude, warehouses[i].location.longitude);
            if (distance < minDistance) {
                minDistance = distance;
                nearestWarehouse = warehouses[i];
            }
        }

        return nearestWarehouse;
    };

    const handleGoToYard = (order: OrderResponse) => {
        // Get the current marker position if available, otherwise fall back to destination location
        let currentLocation = null;

        if (getTransportMarkerPosition && order.transport?.transportId) {
            currentLocation = getTransportMarkerPosition(order.transport.transportId);
        }

        // Fallback to destination location for waiting transports if marker position not available
        if (!currentLocation && order.transport?.destinationLocation) {
            currentLocation = {
                longitude: order.transport.destinationLocation.longitude,
                latitude: order.transport.destinationLocation.latitude
            };
        }

        if (!currentLocation) return;

        const nearestWarehouse = findNearestWarehouse(
            currentLocation.latitude,
            currentLocation.longitude
        );

        if (nearestWarehouse) {
            navigate(`/warehouses/${nearestWarehouse.id}/yard?transportId=${order.transport?.transportId}`);
        }
    };



    // Filter orders based on search term
    useEffect(() => {
        if (!searchTerm) {
            setFilteredOrders(orders);
        } else {
            const filtered = orders.filter(order =>
                order.transport?.transportId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.transport?.carrier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.transport?.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.id?.toString().includes(searchTerm)
            );
            setFilteredOrders(filtered);
        }
    }, [searchTerm, orders]);

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'intransit':
            case 'in_transit':
            case 'inprogress':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
            case 'arrived':
                return 'bg-green-100 text-green-800';
            case 'waiting':
                return 'bg-orange-100 text-orange-800';
            case 'accepted':
                return 'bg-purple-100 text-purple-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatStatus = (status: string) => {
        return status?.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) || 'Unknown';
    };

    return (
        <Card className={`w-80 h-[95%] ${className}`}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5" />
                    Transports
                </CardTitle>

                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search transports, carriers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea>
                    <div className="p-4 pt-0 space-y-2">
                        {filteredOrders.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">
                                {searchTerm ? 'No Transports found' : 'No Transports available'}
                            </div>
                        ) : (
                            filteredOrders.map((order) => (
                                <div
                                    key={order.id}
                                    onClick={() => onOrderSelect(order)}
                                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Truck className="h-4 w-4 text-gray-600" />
                                            <span className="font-medium text-sm">
                                                {order.transport?.transportId || `Order #${order.id}`}
                                            </span>
                                        </div>
                                        <Badge className={getStatusColor(order.transport?.status)}>
                                            {formatStatus(order.transport?.status)}
                                        </Badge>
                                    </div>

                                    {order.transport?.carrier?.name && (
                                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                                            <Package className="h-3 w-3" />
                                            <span>{order.transport.carrier.name}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            <span>
                                                {order.transport?.startLocation && order.transport?.destinationLocation
                                                    ? `${order.transport.startLocation.longitude.toFixed(2)}, ${order.transport.startLocation.latitude.toFixed(2)}`
                                                    : 'Location unknown'
                                                }
                                            </span>
                                        </div>
                                        {order.createdUtc && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>
                                                    {new Date(order.createdUtc).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Go to Yard button for waiting transports */}
                                    {order.transport?.status === 'Waiting' && (
                                        <div className="mt-2 flex justify-end">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent triggering the card click
                                                    handleGoToYard(order);
                                                }}
                                                className="text-xs px-2 py-1 h-6"
                                            >
                                                <Navigation className="h-3 w-3 mr-1" />
                                                Go to Yard
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}