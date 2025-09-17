import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { Loader2 } from 'lucide-react';
import type { CreateCarrierRequest, UpdateCarrierRequest, CarrierResponse } from '../../types/carrier';

type CarrierFormData = {
  name: string;
  contactEmail?: string;
  contactPhone?: string;
};

interface CarrierFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCarrierRequest | UpdateCarrierRequest) => Promise<void>;
  carrier?: CarrierResponse; // For editing existing carriers
  mode: 'create' | 'edit';
}

export function CarrierFormDialog({ open, onClose, onSubmit, carrier, mode }: CarrierFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CarrierFormData>({
    defaultValues: {
      name: carrier?.name || '',
      contactEmail: carrier?.contactEmail || '',
      contactPhone: carrier?.contactPhone || '',
    },
  });

  // Reset form when carrier prop changes or dialog opens
  useEffect(() => {
    if (open) {
      if (carrier && mode === 'edit') {
        form.reset({
          name: carrier.name,
          contactEmail: carrier.contactEmail || '',
          contactPhone: carrier.contactPhone || '',
        });
      } else {
        form.reset({
          name: '',
          contactEmail: '',
          contactPhone: '',
        });
      }
    }
  }, [open, carrier, mode, form]);

  const handleSubmit = async (data: CarrierFormData) => {
    if (!data.name || data.name.trim().length < 2) {
      return;
    }

    try {
      setIsSubmitting(true);
      const submitData: CreateCarrierRequest | UpdateCarrierRequest = {
        name: data.name.trim(),
        contactEmail: data.contactEmail?.trim() || undefined,
        contactPhone: data.contactPhone?.trim() || undefined,
      };

      await onSubmit(submitData);
      form.reset();
      onClose();
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} carrier:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Carrier' : 'Edit Carrier'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new carrier to your network.'
              : 'Update the carrier information.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carrier Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter carrier name (e.g., DHL, UPS)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contact@carrier.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+49 30 12345678"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Create Carrier' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}