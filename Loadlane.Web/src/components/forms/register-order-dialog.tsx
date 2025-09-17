import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "../ui/dialog";

interface RegisterOrderDialogProps {
  open: boolean;
  onClose: () => void;
//   onSubmit: (data: CreateOrderRequest | UpdateOrderRequest) => Promise<void>;
//   order?: OrderResponse; // For editing existing orders
//   mode: 'create' | 'edit';
}
export function RegisterOrderDialog({ open, onClose }: RegisterOrderDialogProps) {
    if (!open) return null;

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
               <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                <DialogTitle>Create Order</DialogTitle>
                <DialogDescription>
                    Fill in the details to create a new order.
                </DialogDescription>
                </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    );
}
