import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import {
    Building2,
    MapPin,
    ArrowLeft,
    BarChart3,
    Activity,
    AlertCircle,
    Loader2,
    Edit,
    Plus,
    MoreHorizontal
} from "lucide-react";
import { useWarehouse, useWarehouseGates } from "../hooks/useWarehouse";
import { GateFormDialog } from "../components/forms/gate-form-dialog";
import { UpdateWarehouseFormDialog } from "../components/forms/update-warehouse-form-dialog";
import { ConfirmationDialog } from "../components/ui/confirmation-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import type { CreateGateRequest, UpdateGateRequest, UpdateWarehouseRequest, GateSimpleResponse } from "../types/warehouse";

export function WarehouseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { warehouse, loading: warehouseLoading, error: warehouseError, updateWarehouse } = useWarehouse(id);
    const { gates, loading: gatesLoading, error: gatesError, createGate, updateGate, deleteGate } = useWarehouseGates(id);

    const [isCreateGateDialogOpen, setIsCreateGateDialogOpen] = useState(false);
    const [isUpdateWarehouseDialogOpen, setIsUpdateWarehouseDialogOpen] = useState(false);
    const [editingGate, setEditingGate] = useState<GateSimpleResponse | null>(null);
    const [deleteGateId, setDeleteGateId] = useState<string | null>(null);
    const [gateToDelete, setGateToDelete] = useState<GateSimpleResponse | null>(null);

    const handleCreateGate = async (data: CreateGateRequest) => {
        await createGate(data);
    };

    const handleUpdateWarehouse = async (data: UpdateWarehouseRequest) => {
        await updateWarehouse(data);
    };

    const handleUpdateGate = async (data: UpdateGateRequest) => {
        if (editingGate) {
            await updateGate(editingGate.id, data);
            setEditingGate(null);
        }
    };

    const handleDeleteGateClick = (gate: GateSimpleResponse) => {
        setDeleteGateId(gate.id);
        setGateToDelete(gate);
    };

    const handleConfirmDeleteGate = async () => {
        if (deleteGateId) {
            await deleteGate(deleteGateId);
            setDeleteGateId(null);
            setGateToDelete(null);
        }
    };

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
                        <Button variant="outline" size="sm" onClick={() => setIsUpdateWarehouseDialogOpen(true)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Basic Information */}
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Facility Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-primary">{warehouse.gates.length}</div>
                                <div className="text-sm font-medium text-muted-foreground">Total Gates</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600">
                                    {warehouse.gates.filter(g => g.isActive).length}
                                </div>
                                <div className="text-sm font-medium text-muted-foreground">Active Gates</div>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-2">Organisation</div>
                                <div className="text-lg font-semibold">{warehouse.organisation}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-2">Created</div>
                                <div className="text-base">{formatDate(warehouse.createdUtc)}</div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <div className="text-sm font-medium text-muted-foreground mb-3">Location Details</div>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-base">
                                        {warehouse.location.street} {warehouse.location.houseNo}
                                    </span>
                                </div>
                                <div className="text-base text-muted-foreground ml-6">
                                    {warehouse.location.postCode} {warehouse.location.city}
                                </div>
                                <div className="text-sm font-mono text-muted-foreground ml-6 mt-2">
                                    <div>Lat: {warehouse.location.latitude.toFixed(6)}</div>
                                    <div>Lng: {warehouse.location.longitude.toFixed(6)}</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Gates Management */}
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Gates Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Gate Status</span>
                            <Button variant="outline" size="sm" onClick={() => setIsCreateGateDialogOpen(true)}>
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
                                            <div>
                                                <span className="text-sm font-medium">Gate {gate.number}</span>
                                                {gate.description && (
                                                    <p className="text-xs text-muted-foreground">{gate.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant={gate.isActive ? "default" : "secondary"}>
                                                {gate.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setEditingGate(gate)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteGateClick(gate)}
                                                        className="text-destructive"
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>

            {/* Gate Form Dialogs */}
            <GateFormDialog
                open={isCreateGateDialogOpen}
                onClose={() => setIsCreateGateDialogOpen(false)}
                onSubmit={handleCreateGate}
                mode="create"
            />

            <GateFormDialog
                open={!!editingGate}
                onClose={() => setEditingGate(null)}
                onSubmit={handleUpdateGate}
                gate={editingGate ? {
                    id: editingGate.id,
                    number: editingGate.number,
                    description: editingGate.description,
                    isActive: editingGate.isActive,
                    warehouse: undefined,
                    createdUtc: editingGate.createdUtc
                } : undefined}
                mode="edit"
            />

            <UpdateWarehouseFormDialog
                open={isUpdateWarehouseDialogOpen}
                onClose={() => setIsUpdateWarehouseDialogOpen(false)}
                onSubmit={handleUpdateWarehouse}
                warehouse={warehouse}
            />

            <ConfirmationDialog
                open={!!deleteGateId}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteGateId(null);
                        setGateToDelete(null);
                    }
                }}
                title="Delete Gate"
                description={`Are you sure you want to delete gate "${gateToDelete?.number}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleConfirmDeleteGate}
            />
        </div>
    );
}