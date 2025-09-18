import { OrderFormDialog } from './order-form-dialog';
import type { CreateOrderRequest } from '../../types/order';

interface RegisterOrderDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOrderRequest) => Promise<void>;
}

export function RegisterOrderDialog({ open, onClose, onSubmit }: RegisterOrderDialogProps) {
    return (
        <OrderFormDialog
            open={open}
            onClose={onClose}
            onSubmit={onSubmit}
        />
    );
}
