import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { FileText, Plus, Loader2, AlertCircle, MapPin, Truck, Calendar, Package } from "lucide-react";
import { useOrders } from "../hooks/useOrder";
import { RegisterOrderDialog } from "../components/forms/register-order-dialog";
import type { CreateOrderRequest } from "../types/order";

export function OrderListPage() {
    const { orders, loading, error, refetch, createOrder } = useOrders();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const handleCreateOrder = async (data: CreateOrderRequest) => {
        await createOrder(data);
        refetch();
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading orders...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
                        <h2 className="text-lg font-semibold mb-2">Error Loading Orders</h2>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button onClick={refetch}>Try Again</Button>
                    </div>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'planned':
                return 'bg-blue-100 text-blue-800';
            case 'intransit':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Order Management</h1>
                        <p className="text-muted-foreground">
                            Manage and monitor all transport orders.
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Order
                    </Button>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
                    <p className="text-muted-foreground mb-4">
                        Get started by creating your first order.
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Order
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 auto-rows-fr">
                    {orders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            formatDate={formatDate}
                            getStatusColor={getStatusColor}
                        />
                    ))}
                </div>
            )}

            <RegisterOrderDialog
                open={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onSubmit={handleCreateOrder}
            />
        </div>
    );
}

interface OrderCardProps {
    order: any;
    formatDate: (dateString: string) => string;
    getStatusColor: (status: string) => string;
}

function OrderCard({ order, formatDate, getStatusColor }: OrderCardProps) {
    return (
        <Card className="hover:shadow-lg transition-shadow w-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg truncate">
                            {order.extOrderNo || `Order ${order.id.slice(0, 8)}`}
                        </CardTitle>
                    </div>
                    <Badge className={getStatusColor(order.transport?.status || 'unknown')}>
                        {order.transport?.status || 'Unknown'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    {order.article && (
                        <div className="flex items-center space-x-2 text-sm">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{order.article.name}</span>
                            <Badge variant="outline" className="text-xs">
                                {order.quantity}x
                            </Badge>
                        </div>
                    )}

                    {order.transport?.carrier && (
                        <div className="flex items-center space-x-2 text-sm">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{order.transport.carrier.name}</span>
                        </div>
                    )}

                    {(order.transport?.startLocation || order.transport?.destinationLocation) && (
                        <div className="flex items-center space-x-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate text-muted-foreground">
                                {order.transport.startLocation?.city} → {order.transport.destinationLocation?.city}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(order.createdUtc)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}