import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Building2, Package, MapPin, Users, Clock, AlertCircle, Plus, Loader2 } from "lucide-react";
import { useWarehouses } from "../hooks/useWarehouse";
import { WarehouseFormDialog } from "../components/forms/warehouse-form-dialog";
import type { WarehouseResponse, CreateWarehouseRequest } from "../types/warehouse";

export function WarehouseListPage() {
    const navigate = useNavigate();
    const { warehouses, loading, error, refetch, createWarehouse } = useWarehouses();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const handleCreateWarehouse = async (data: CreateWarehouseRequest) => {
        await createWarehouse(data);
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading warehouses...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
                        <h2 className="text-lg font-semibold mb-2">Error Loading Warehouses</h2>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button onClick={refetch}>Try Again</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Warehouse Management</h1>
                        <p className="text-muted-foreground">
                            Manage and monitor all warehouse facilities across your network.
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Warehouse
                    </Button>
                </div>
            </div>

            {warehouses.length === 0 ? (
                <div className="text-center py-12">
                    <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Warehouses Found</h3>
                    <p className="text-muted-foreground mb-4">
                        Get started by creating your first warehouse.
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Warehouse
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {warehouses.map((warehouse) => (
                        <WarehouseCard
                            key={warehouse.id}
                            warehouse={warehouse}
                            onView={(id) => navigate(`/warehouses/${id}`)}
                        />
                    ))}
                </div>
            )}

            <WarehouseFormDialog
                open={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onSubmit={handleCreateWarehouse}
            />
        </div>
    );
}

interface WarehouseCardProps {
    warehouse: WarehouseResponse;
    onView: (id: string) => void;
}

function WarehouseCard({ warehouse, onView }: WarehouseCardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                    </div>
                    <Badge variant="outline">{warehouse.organisation}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{warehouse.location.city}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>{warehouse.gates.length} gates</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{warehouse.gates.filter(g => g.isActive).length} active</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(warehouse.createdUtc)}</span>
                    </div>
                </div>

                <div className="text-sm text-muted-foreground">
                    <div className="font-medium">Address:</div>
                    <div>
                        {warehouse.location.street} {warehouse.location.houseNo}<br />
                        {warehouse.location.postCode} {warehouse.location.city}
                    </div>
                </div>

                <div className="pt-2">
                    <Button
                        className="w-full"
                        onClick={() => onView(warehouse.id)}
                    >
                        View Details
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}