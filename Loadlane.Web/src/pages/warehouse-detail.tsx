import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import {
    Building2,
    Package,
    Truck,
    RotateCcw,
    MapPin,
    Users,
    Clock,
    ArrowLeft,
    BarChart3,
    Activity,
    TrendingUp,
    AlertCircle,
    CheckCircle
} from "lucide-react";
import type { Warehouse } from "../types/map";

// Same warehouse data as in other components
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

export function WarehouseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const warehouse = warehouses.find(w => w.id === Number(id));

    if (!warehouse) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Warehouse Not Found</h1>
                    <Button onClick={() => navigate('/warehouses')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Warehouses
                    </Button>
                </div>
            </div>
        );
    }

    const Icon = getWarehouseIcon(warehouse.type);

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <Button
                    variant="ghost"
                    className="mb-4"
                    onClick={() => navigate('/warehouses')}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Warehouses
                </Button>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                            <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{warehouse.name}</h1>
                            <p className="text-muted-foreground mt-1">{warehouse.description}</p>
                        </div>
                    </div>
                    <Badge variant={getTypeVariant(warehouse.type)} className="text-sm px-3 py-1">
                        {warehouse.type}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Facility Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Capacity</div>
                                <div className="text-2xl font-bold">{warehouse.capacity.toLocaleString()} m³</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Utilization</div>
                                <div className="text-2xl font-bold text-green-600">78%</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Staff Count</div>
                                <div className="text-2xl font-bold">42</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Operating Hours</div>
                                <div className="text-sm">24/7 Operations</div>
                            </div>
                        </div>
                        <Separator />
                        <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">Location</div>
                            <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4" />
                                <span className="font-mono text-sm">{warehouse.lng.toFixed(6)}, {warehouse.lat.toFixed(6)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Current Operations */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Current Operations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Inbound Shipments</span>
                                <Badge variant="secondary">7 pending</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Outbound Shipments</span>
                                <Badge variant="secondary">12 in progress</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Loading Docks</span>
                                <span className="text-sm font-medium">5/8 occupied</span>
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">Next Scheduled Arrival</div>
                            <div className="flex items-center space-x-2">
                                <Truck className="h-4 w-4" />
                                <span className="text-sm">Truck ID: TK-4721 - ETA: 14:30</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Performance Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Daily Throughput</div>
                                <div className="text-xl font-bold text-blue-600">850 packages</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Avg. Processing</div>
                                <div className="text-xl font-bold text-green-600">2.4 hours</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Error Rate</div>
                                <div className="text-xl font-bold text-green-600">0.03%</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">On-Time Rate</div>
                                <div className="text-xl font-bold text-green-600">98.7%</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Inventory Status */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Inventory Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['Electronics', 'Automotive Parts', 'Textiles', 'Food & Beverage'].map((category) => {
                                const percentage = Math.floor(Math.random() * 100);
                                const isHigh = percentage > 80;
                                return (
                                    <div key={category} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            {isHigh ? (
                                                <AlertCircle className="h-4 w-4 text-orange-500" />
                                            ) : (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            )}
                                            <span className="font-medium">{category}</span>
                                        </div>
                                        <span className={`font-bold ${isHigh ? 'text-orange-600' : 'text-green-600'}`}>
                                            {percentage}% full
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <Separator />
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Last inventory update: 2 hours ago</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button className="w-full" onClick={() => navigate('/map')}>
                            <MapPin className="h-4 w-4 mr-2" />
                            View on Map
                        </Button>
                        <Button variant="outline" className="w-full">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Reports
                        </Button>
                        <Button variant="outline" className="w-full">
                            <Users className="h-4 w-4 mr-2" />
                            Manage Staff
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}