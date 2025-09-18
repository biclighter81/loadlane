import { useState, forwardRef, useImperativeHandle } from 'react';
import { Check, ChevronsUpDown, Truck, Plus, Mail, Phone } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { useCarriers } from '../../hooks/useCarrier';
import type { CarrierResponse } from '../../types/carrier';

interface CarrierSelectorProps {
  value?: string; // Carrier ID
  onChange: (carrier: CarrierResponse | null) => void;
  placeholder?: string;
  onCreateNew?: () => void;
}

export interface CarrierSelectorRef {
  refresh: () => void;
}

export const CarrierSelector = forwardRef<CarrierSelectorRef, CarrierSelectorProps>(({
  value,
  onChange,
  placeholder = "Select carrier...",
  onCreateNew,
}, ref) => {
  const [open, setOpen] = useState(false);

  const { carriers, loading, refetch } = useCarriers();

  // Expose refetch function via ref
  useImperativeHandle(ref, () => ({
    refresh: refetch,
  }));

  const selectedCarrier = carriers.find(carrier => carrier.id === value);

  const displayValue = selectedCarrier
    ? selectedCarrier.name
    : placeholder;

  const handleCarrierSelect = (carrier: CarrierResponse) => {
    onChange(carrier);
    setOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <div className="flex items-center space-x-2 truncate">
              <Truck className="h-4 w-4 text-primary" />
              <span className="truncate">{displayValue}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search carriers..." />
            <CommandList>
              <CommandEmpty>
                {loading ? "Loading carriers..." : "No carriers found."}
              </CommandEmpty>
              {carriers.length > 0 && (
                <CommandGroup heading="Available Carriers">
                  {carriers.map((carrier) => (
                    <CommandItem
                      key={carrier.id}
                      onSelect={() => handleCarrierSelect(carrier)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 flex-1">
                        <Truck className="h-4 w-4 text-primary" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{carrier.name}</div>
                          {(carrier.contactEmail || carrier.contactPhone) && (
                            <div className="flex items-center space-x-2 mt-1">
                              {carrier.contactEmail && (
                                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate">{carrier.contactEmail}</span>
                                </div>
                              )}
                              {carrier.contactPhone && (
                                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  <span>{carrier.contactPhone}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {selectedCarrier?.id === carrier.id && (
                          <Check className="h-4 w-4" />
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              <CommandGroup>
                {value && (
                  <CommandItem
                    onSelect={handleClear}
                    className="cursor-pointer text-muted-foreground"
                  >
                    <div className="flex items-center space-x-2">
                      <span>Clear selection</span>
                    </div>
                  </CommandItem>
                )}
                {onCreateNew && (
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      onCreateNew();
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Create new carrier</span>
                    </div>
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
});