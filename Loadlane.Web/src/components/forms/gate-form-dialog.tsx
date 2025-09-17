import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
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
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Loader2 } from 'lucide-react';
import type { CreateGateRequest, UpdateGateRequest, GateResponse } from '../../types/warehouse';

const gateSchema = yup.object({
  number: yup.number().required('Gate number is required'),
  description: yup.string().optional(),
  isActive: yup.boolean().default(true),
});

type GateFormData = yup.InferType<typeof gateSchema>;

interface GateFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateGateRequest | UpdateGateRequest) => Promise<void>;
  gate?: GateResponse; // For editing existing gates
  mode: 'create' | 'edit';
}

export function GateFormDialog({ open, onClose, onSubmit, gate, mode }: GateFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<GateFormData>({
    resolver: yupResolver(gateSchema),
    defaultValues: {
      number: gate?.number || 1,
      description: gate?.description || '',
      isActive: gate?.isActive ?? true,
    },
  });

  // Reset form when gate prop changes
  useEffect(() => {
    if (open) {
      if (gate && mode === 'edit') {
        form.reset({
          number: gate.number,
          description: gate.description || '',
          isActive: gate.isActive,
        });
      } else {
        form.reset({
          number: 1,
          description: '',
          isActive: true,
        });
      }
    }
  }, [open, gate, mode, form]);

  const handleSubmit = async (data: GateFormData) => {
    try {
      setIsSubmitting(true);
      const submitData = mode === 'create'
        ? { number: data.number, description: data.description }
        : { number: data.number, description: data.description, isActive: data.isActive };

      await onSubmit(submitData);
      form.reset();
      onClose();
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} gate:`, error);
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
            {mode === 'create' ? 'Create New Gate' : 'Edit Gate'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new gate to this warehouse.'
              : 'Update the gate information.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gate Number</FormLabel>
                  <FormControl>
                    <Input type='number' placeholder="Enter gate number (e.g., 1, 2)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter gate description or notes"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === 'edit' && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Active Status
                      </FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable or disable this gate for operations
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Create Gate' : 'Update Gate'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}