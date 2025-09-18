import { useState, useEffect } from 'react';
import { Search, Truck, MapPin, Clock, Package } from 'lucide-react';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import type { OrderResponse } from '../types/order';

interface OrderSearchPanelProps {
    orders: OrderResponse[];
    onOrderSelect: (order: any) => void;
    className?: string;
}

export function OrderSearchPanel({ orders, onOrderSelect, className = '' }: OrderSearchPanelProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOrders, setFilteredOrders] = useState(orders);

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
                <ScrollArea className="h-64">
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
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}