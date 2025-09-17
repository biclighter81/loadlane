import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import {
    Building2,
    MapPin,
    Users,
    ArrowLeft,
    BarChart3,
    Activity,
    TrendingUp,
    AlertCircle,
    Loader2,
    Edit,
    Plus,
    Settings
} from "lucide-react";
import { useWarehouse, useWarehouseGates } from "../hooks/useWarehouse";

export function WarehouseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { warehouse, loading: warehouseLoading, error: warehouseError } = useWarehouse(id);
    const { gates, loading: gatesLoading, error: gatesError } = useWarehouseGates(id);

    if (warehouseLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading warehouse details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (warehouseError || !warehouse) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-4">
                        {warehouseError || 'Warehouse Not Found'}
                    </h1>
                    <Button onClick={() => navigate('/warehouses')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Warehouses
                    </Button>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

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
                            <Building2 className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{warehouse.name}</h1>
                            <p className="text-muted-foreground mt-1">
                                {warehouse.location.street} {warehouse.location.houseNo}, {warehouse.location.city}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-sm px-3 py-1">
                            {warehouse.organisation}
                        </Badge>
                        <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                    </div>
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
                                <div className="text-sm font-medium text-muted-foreground">Total Gates</div>
                                <div className="text-2xl font-bold">{warehouse.gates.length}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Active Gates</div>
                                <div className="text-2xl font-bold text-green-600">
                                    {warehouse.gates.filter(g => g.isActive).length}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Organisation</div>
                                <div className="text-sm font-semibold">{warehouse.organisation}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Created</div>
                                <div className="text-sm">{formatDate(warehouse.createdUtc)}</div>
                            </div>
                        </div>
                        <Separator />
                        <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">Location</div>
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <MapPin className="h-4 w-4" />
                                    <span className="text-sm">
                                        {warehouse.location.street} {warehouse.location.houseNo}
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground ml-6">
                                    {warehouse.location.postCode} {warehouse.location.city}
                                </div>
                                <div className="text-sm font-mono text-muted-foreground ml-6">
                                    {warehouse.location.latitude.toFixed(6)}, {warehouse.location.longitude.toFixed(6)}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Gates Management */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Gates Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Gate Status</span>
                            <Button variant="outline" size="sm">
                                <Plus className="h-4 w-4 mr-1" />
                                Add Gate
                            </Button>
                        </div>

                        {gatesLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : gatesError ? (
                            <div className="text-center py-4 text-sm text-destructive">
                                Error loading gates: {gatesError}
                            </div>
                        ) : gates.length === 0 ? (
                            <div className="text-center py-8 text-sm text-muted-foreground">
                                No gates configured
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {gates.map((gate) => (
                                    <div key={gate.id} className="flex items-center justify-between p-2 border rounded">
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-2 h-2 rounded-full ${gate.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                                            <span className="text-sm font-medium">Gate {gate.number}</span>
                                        </div>
                                        <Badge variant={gate.isActive ? "default" : "secondary"}>
                                            {gate.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Performance Metrics (Mock Data) */}
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

                {/* Actions */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Button variant="outline" onClick={() => navigate('/map')}>
                                <MapPin className="h-4 w-4 mr-2" />
                                View on Map
                            </Button>
                            <Button variant="outline">
                                <BarChart3 className="h-4 w-4 mr-2" />
                                View Reports
                            </Button>
                            <Button variant="outline">
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                            </Button>
                            <Button variant="outline">
                                <Users className="h-4 w-4 mr-2" />
                                Manage Staff
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}