import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Truck, Mail, Phone, AlertCircle, Plus, Loader2, Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { useCarriers } from "../hooks/useCarrier";
import { CarrierFormDialog } from "../components/forms/carrier-form-dialog";
import { ConfirmationDialog } from "../components/ui/confirmation-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import type { CarrierResponse, CreateCarrierRequest, UpdateCarrierRequest } from "../types/carrier";

export function CarrierListPage() {
    const { carriers, loading, error, refetch, createCarrier, updateCarrier, deleteCarrier } = useCarriers();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingCarrier, setEditingCarrier] = useState<CarrierResponse | null>(null);
    const [deleteCarrierId, setDeleteCarrierId] = useState<string | null>(null);
    const [carrierToDelete, setCarrierToDelete] = useState<CarrierResponse | null>(null);

    const handleCreateCarrier = async (data: CreateCarrierRequest) => {
        await createCarrier(data);
    };

    const handleUpdateCarrier = async (data: UpdateCarrierRequest) => {
        if (editingCarrier) {
            await updateCarrier(editingCarrier.id, data);
            setEditingCarrier(null);
        }
    };

    const handleDeleteCarrierClick = (carrier: CarrierResponse) => {
        setDeleteCarrierId(carrier.id);
        setCarrierToDelete(carrier);
    };

    const handleConfirmDeleteCarrier = async () => {
        if (deleteCarrierId) {
            await deleteCarrier(deleteCarrierId);
            setDeleteCarrierId(null);
            setCarrierToDelete(null);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading carriers...</p>
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
                        <h2 className="text-lg font-semibold mb-2">Error Loading Carriers</h2>
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

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Carrier Management</h1>
                        <p className="text-muted-foreground">
                            Manage and monitor all logistics carriers in your network.
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Carrier
                    </Button>
                </div>
            </div>

            {carriers.length === 0 ? (
                <div className="text-center py-12">
                    <Truck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Carriers Found</h3>
                    <p className="text-muted-foreground mb-4">
                        Get started by adding your first carrier.
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Carrier
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-2">
                    {carriers.map((carrier) => (
                        <CarrierCard
                            key={carrier.id}
                            carrier={carrier}
                            onEdit={setEditingCarrier}
                            onDelete={handleDeleteCarrierClick}
                            formatDate={formatDate}
                        />
                    ))}
                </div>
            )}

            <CarrierFormDialog
                open={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onSubmit={handleCreateCarrier}
                mode="create"
            />

            <CarrierFormDialog
                open={!!editingCarrier}
                onClose={() => setEditingCarrier(null)}
                onSubmit={handleUpdateCarrier}
                carrier={editingCarrier || undefined}
                mode="edit"
            />

            <ConfirmationDialog
                open={!!deleteCarrierId}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteCarrierId(null);
                        setCarrierToDelete(null);
                    }
                }}
                title="Delete Carrier"
                description={`Are you sure you want to delete carrier "${carrierToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleConfirmDeleteCarrier}
            />
        </div>
    );
}

interface CarrierCardProps {
    carrier: CarrierResponse;
    onEdit: (carrier: CarrierResponse) => void;
    onDelete: (carrier: CarrierResponse) => void;
    formatDate: (dateString: string) => string;
}

function CarrierCard({ carrier, onEdit, onDelete, formatDate }: CarrierCardProps) {
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Truck className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{carrier.name}</CardTitle>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(carrier)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(carrier)}
                                className="text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    {carrier.contactEmail && (
                        <div className="flex items-center space-x-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{carrier.contactEmail}</span>
                        </div>
                    )}
                    {carrier.contactPhone && (
                        <div className="flex items-center space-x-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{carrier.contactPhone}</span>
                        </div>
                    )}
                    {!carrier.contactEmail && !carrier.contactPhone && (
                        <div className="text-sm text-muted-foreground italic">
                            No contact information provided
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">
                        Added {formatDate(carrier.createdUtc)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}