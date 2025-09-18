import { useState, forwardRef, useImperativeHandle } from 'react';
import { Check, ChevronsUpDown, MapPin, Building2, Map } from 'lucide-react';
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
import { useWarehouses } from '../../hooks/useWarehouse';
import { MapPicker } from '../MapPicker';
import type { Location } from '../../types/order';
import type { WarehouseResponse } from '../../types/warehouse';

interface LocationOption {
  type: 'warehouse' | 'custom';
  id?: string;
  label: string;
  location: Location;
  warehouse?: WarehouseResponse;
}

interface LocationSelectorProps {
  value?: Location & { isWarehouse?: boolean; warehouseId?: string };
  onChange: (location: Location & { isWarehouse?: boolean; warehouseId?: string }) => void;
  placeholder?: string;
  allowCustomLocation?: boolean;
  excludeLocation?: Location & { isWarehouse?: boolean; warehouseId?: string };
}

export interface LocationSelectorRef {
  refresh: () => void;
}

export const LocationSelector = forwardRef<LocationSelectorRef, LocationSelectorProps>(({
  value,
  onChange,
  placeholder = "Select location...",
  allowCustomLocation = true,
  excludeLocation,
}, ref) => {
  const [open, setOpen] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const { warehouses, loading, refetch } = useWarehouses();

  // Expose refetch function via ref
  useImperativeHandle(ref, () => ({
    refresh: refetch,
  }));

  // Create location options from warehouses, excluding the specified location
  const warehouseOptions: LocationOption[] = warehouses
    .filter(warehouse => {
      if (!excludeLocation?.isWarehouse || !excludeLocation.warehouseId) return true;
      return warehouse.id !== excludeLocation.warehouseId;
    })
    .map(warehouse => ({
      type: 'warehouse',
      id: warehouse.id,
      label: `${warehouse.name} (${warehouse.location.city})`,
      location: {
        city: warehouse.location.city,
        street: warehouse.location.street,
        houseNo: warehouse.location.houseNo,
        postCode: warehouse.location.postCode,
        latitude: warehouse.location.latitude,
        longitude: warehouse.location.longitude,
      },
      warehouse,
    }));

  const selectedOption = warehouseOptions.find(
    option => option.id === value?.warehouseId
  );

  const displayValue = selectedOption
    ? selectedOption.label
    : value?.city
    ? `${value.city}, ${value.street} ${value.houseNo}`
    : placeholder;

  const handleWarehouseSelect = (option: LocationOption) => {
    onChange({
      ...option.location,
      isWarehouse: true,
      warehouseId: option.id,
    });
    setOpen(false);
  };


  const handleMapPickerSelect = (locationData: any) => {
    const location = {
      city: locationData.city || '',
      street: locationData.street || '',
      houseNo: locationData.houseNo || '',
      postCode: locationData.postCode || '',
      latitude: locationData.latitude,
      longitude: locationData.longitude,
    };

    onChange({
      ...location,
      isWarehouse: false,
    });
    setShowMapPicker(false);
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
              {value?.isWarehouse ? (
                <Building2 className="h-4 w-4 text-primary" />
              ) : value?.city ? (
                <MapPin className="h-4 w-4 text-muted-foreground" />
              ) : null}
              <span className="truncate">{displayValue}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search warehouses..." />
            <CommandList>
              <CommandEmpty>
                {loading ? "Loading warehouses..." : "No warehouses found."}
              </CommandEmpty>
              {warehouseOptions.length > 0 && (
                <CommandGroup heading="Warehouses">
                  {warehouseOptions.map((option) => (
                    <CommandItem
                      key={option.id}
                      onSelect={() => handleWarehouseSelect(option)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 flex-1">
                        <Building2 className="h-4 w-4 text-primary" />
                        <div className="flex-1">
                          <div className="font-medium">{option.warehouse!.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {option.location.city}, {option.location.street} {option.location.houseNo}
                          </div>
                        </div>
                        {selectedOption?.id === option.id && (
                          <Check className="h-4 w-4" />
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {allowCustomLocation && (
                <CommandGroup heading="Custom Location">
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      setShowMapPicker(true);
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <Map className="h-4 w-4" />
                      <span>Pick location on map</span>
                    </div>
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>


      <MapPicker
        open={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onLocationSelect={handleMapPickerSelect}
        initialLocation={
          value?.latitude && value?.longitude
            ? { latitude: value.latitude, longitude: value.longitude }
            : undefined
        }
      />
    </div>
  );
});