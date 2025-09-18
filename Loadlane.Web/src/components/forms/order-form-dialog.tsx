import { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Loader2, Plus, Trash2, MapPin, Package, Truck } from 'lucide-react';
import { LocationSelector } from './location-selector';
import { ArticleSelector } from './article-selector';
import { CarrierSelector } from './carrier-selector';
import type { LocationSelectorRef } from './location-selector';
import type { ArticleSelectorRef } from './article-selector';
import type { CarrierSelectorRef } from './carrier-selector';
import { ArticleFormDialog } from './article-form-dialog';
import { CarrierFormDialog } from './carrier-form-dialog';
import { useCarriers } from '../../hooks/useCarrier';
import { useArticles } from '../../hooks/useArticle';
import { validateDifferentLocations } from '../../utils/locationValidation';
import type { CreateOrderRequest, OrderFormData, Location } from '../../types/order';
import type { CreateArticleRequest, ArticleResponse } from '../../types/article';
import type { CreateCarrierRequest, CarrierResponse } from '../../types/carrier';

interface OrderFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOrderRequest) => Promise<void>;
}

const defaultLocation: Location = {
  city: '',
  street: '',
  houseNo: '',
  postCode: '',
  latitude: 0,
  longitude: 0,
};

export function OrderFormDialog({ open, onClose, onSubmit }: OrderFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isArticleDialogOpen, setIsArticleDialogOpen] = useState(false);
  const [isCarrierDialogOpen, setIsCarrierDialogOpen] = useState(false);

  // Refs for selector components
  const articleSelectorRef = useRef<ArticleSelectorRef>(null);
  const carrierSelectorRef = useRef<CarrierSelectorRef>(null);
  const startLocationSelectorRef = useRef<LocationSelectorRef>(null);
  const destinationLocationSelectorRef = useRef<LocationSelectorRef>(null);

  const { createCarrier, refetch: refetchCarriers } = useCarriers();
  const { createArticle, refetch: refetchArticles } = useArticles();

  const form = useForm<OrderFormData>({
    defaultValues: {
      extOrderNo: '',
      quantity: 1,
      articleId: '',
      articleName: '',
      articleDescription: '',
      articleWeight: undefined,
      articleVolume: undefined,
      carrierId: '',
      startLocation: defaultLocation,
      destinationLocation: defaultLocation,
      plannedDeparture: undefined,
      plannedArrival: undefined,
      waypoints: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "waypoints"
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        extOrderNo: '',
        quantity: 1,
        articleId: '',
        articleName: '',
        articleDescription: '',
        articleWeight: undefined,
        articleVolume: undefined,
        carrierId: '',
        startLocation: defaultLocation,
        destinationLocation: defaultLocation,
        plannedDeparture: undefined,
        plannedArrival: undefined,
        waypoints: [],
      });
    }
  }, [open, form]);

  const addWaypoint = () => {
    const nextSequence = fields.length + 1;
    append({
      location: defaultLocation,
      sequenceNumber: nextSequence,
      plannedArrival: undefined,
      isWarehouse: false,
      warehouseId: undefined,
    });
  };

  const removeWaypoint = (index: number) => {
    remove(index);
    // Update sequence numbers
    const waypoints = form.getValues('waypoints');
    waypoints.forEach((_, idx) => {
      if (idx > index) {
        form.setValue(`waypoints.${idx}.sequenceNumber`, idx + 1);
      }
    });
  };

  const handleSubmit = async (data: OrderFormData) => {
    try {
      setIsSubmitting(true);

      // Validate locations are different
      const locationValidation = validateDifferentLocations(
        data.startLocation,
        data.destinationLocation
      );

      if (!locationValidation.isValid) {
        throw new Error(locationValidation.message);
      }

      // Prepare carrier data - carrierId is required now
      if (!data.carrierId) {
        throw new Error('Please select a carrier');
      }

      const carrierData = {
        name: '', // Will be filled by backend from carrierId
      };

      // Prepare article data
      const articleData = {
        name: data.articleName || '',
        description: data.articleDescription,
        weight: data.articleWeight,
        volume: data.articleVolume,
      };

      // Prepare waypoints/stopps
      const stopps = data.waypoints.map(waypoint => ({
        location: waypoint.location,
        sequenceNumber: waypoint.sequenceNumber,
        plannedArrival: waypoint.plannedArrival,
      }));

      const orderRequest: CreateOrderRequest = {
        extOrderNo: data.extOrderNo,
        quantity: data.quantity,
        article: articleData,
        carrier: carrierData,
        startLocation: data.startLocation,
        destinationLocation: data.destinationLocation,
        plannedDeparture: data.plannedDeparture,
        plannedArrival: data.plannedArrival,
        stopps: stopps.length > 0 ? stopps : undefined,
      };

      await onSubmit(orderRequest);
      handleClose();
    } catch (error) {
      console.error('Error creating order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
      toast.error('Failed to create order', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArticleSelect = (article: ArticleResponse | null) => {
    if (article) {
      form.setValue('articleId', article.id);
      form.setValue('articleName', article.name);
      form.setValue('articleDescription', article.description || '');
      form.setValue('articleWeight', article.weight);
      form.setValue('articleVolume', article.volume);
    } else {
      form.setValue('articleId', '');
      form.setValue('articleName', '');
      form.setValue('articleDescription', '');
      form.setValue('articleWeight', undefined);
      form.setValue('articleVolume', undefined);
    }
  };

  const handleCarrierSelect = (carrier: CarrierResponse | null) => {
    if (carrier) {
      form.setValue('carrierId', carrier.id);
    } else {
      form.setValue('carrierId', '');
    }
  };

  const handleCreateArticle = async (data: CreateArticleRequest) => {
    try {
      await createArticle(data);
      // Refresh the articles list to make the new article available in the selector
      refetchArticles();
      articleSelectorRef.current?.refresh();
      setIsArticleDialogOpen(false);
    } catch (error) {
      console.error('Error creating article:', error);
    }
  };

  const handleCreateCarrier = async (data: CreateCarrierRequest) => {
    try {
      await createCarrier(data);
      // Refresh the carriers list to make the new carrier available in the selector
      refetchCarriers();
      carrierSelectorRef.current?.refresh();
      setIsCarrierDialogOpen(false);
    } catch (error) {
      console.error('Error creating carrier:', error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Create New Order</span>
          </DialogTitle>
          <DialogDescription>
            Create a new transport order with locations, waypoints, and carrier information.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="extOrderNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Number</FormLabel>
                      <FormControl>
                        <Input placeholder="ORD-2024-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
<FormField
                  control={form.control}
                  name="articleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Article</FormLabel>
                      <FormControl>
                        <ArticleSelector
                          ref={articleSelectorRef}
                          value={field.value}
                          onChange={handleArticleSelect}
                          placeholder="Select an article for this order..."
                          onCreateNew={() => setIsArticleDialogOpen(true)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

          

            {/* Carrier Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Truck className="h-5 w-5" />
                  <span>Carrier Selection</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="carrierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Carrier</FormLabel>
                      <FormControl>
                        <CarrierSelector
                          ref={carrierSelectorRef}
                          value={field.value}
                          onChange={handleCarrierSelect}
                          placeholder="Select a carrier for this order..."
                          onCreateNew={() => setIsCarrierDialogOpen(true)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Route Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Location</FormLabel>
                        <FormControl>
                          <LocationSelector
                            ref={startLocationSelectorRef}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select start location..."
                            excludeLocation={form.watch('destinationLocation')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="destinationLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination Location</FormLabel>
                        <FormControl>
                          <LocationSelector
                            ref={destinationLocationSelectorRef}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select destination location..."
                            excludeLocation={form.watch('startLocation')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="plannedDeparture"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Planned Departure (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="plannedArrival"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Planned Arrival (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Waypoints */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Waypoints (Optional)</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addWaypoint}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Waypoint
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {fields.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No waypoints added yet. Click "Add Waypoint" to add stops along the route.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="border-dashed">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">Stop {index + 1}</Badge>
                              {form.watch(`waypoints.${index}.isWarehouse`) && (
                                <Badge variant="secondary">Warehouse</Badge>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeWaypoint(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name={`waypoints.${index}.location`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                  <LocationSelector
                                    value={field.value}
                                    onChange={(value) => {
                                      field.onChange(value);
                                      // Update isWarehouse flag
                                      form.setValue(`waypoints.${index}.isWarehouse`, value.isWarehouse || false);
                                      form.setValue(`waypoints.${index}.warehouseId`, value.warehouseId);
                                    }}
                                    placeholder="Select waypoint location..."
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`waypoints.${index}.plannedArrival`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Planned Arrival (Optional)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="datetime-local"
                                    {...field}
                                    value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Order
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      {/* Article Creation Dialog */}
      <ArticleFormDialog
        open={isArticleDialogOpen}
        onClose={() => setIsArticleDialogOpen(false)}
        onSubmit={handleCreateArticle}
        mode="create"
      />

      {/* Carrier Creation Dialog */}
      <CarrierFormDialog
        open={isCarrierDialogOpen}
        onClose={() => setIsCarrierDialogOpen(false)}
        onSubmit={handleCreateCarrier}
        mode="create"
      />
    </Dialog>
  );
}