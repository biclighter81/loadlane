import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Building2, Package, Truck, RotateCcw, MapPin, Users, Clock } from "lucide-react";
import type { Warehouse } from "../types/map";

// Same warehouse data as in map component
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

const getTypeVariant = (type: Warehouse['type']) => {
    switch (type) {
        case 'Distribution': return 'default';
        case 'Storage': return 'secondary';
        case 'Fulfillment': return 'outline';
        case 'CrossDock': return 'destructive';
        default: return 'default';
    }
};

export function WarehouseListPage() {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Warehouse Management</h1>
                <p className="text-muted-foreground">
                    Manage and monitor all warehouse facilities across the Berlin region.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {warehouses.map((warehouse) => {
                    const Icon = getWarehouseIcon(warehouse.type);
                    return (
                        <Card key={warehouse.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Icon className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                                    </div>
                                    <Badge variant={getTypeVariant(warehouse.type)}>
                                        {warehouse.type}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    {warehouse.description}
                                </p>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center space-x-2">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                        <span>{warehouse.capacity.toLocaleString()} m³</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>Berlin</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span>{Math.floor(Math.random() * 50 + 20)} staff</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>24/7</span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        className="w-full"
                                        onClick={() => navigate(`/warehouses/${warehouse.id}`)}
                                    >
                                        View Details
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}