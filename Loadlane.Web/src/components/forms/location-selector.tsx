import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, MapPin, Building2, Plus, Map } from 'lucide-react';
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
import { Badge } from '../ui/badge';
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
}

export function LocationSelector({
  value,
  onChange,
  placeholder = "Select location...",
  allowCustomLocation = true,
}: LocationSelectorProps) {
  const [open, setOpen] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [customLocation, setCustomLocation] = useState<Location>({
    city: '',
    street: '',
    houseNo: '',
    postCode: '',
    latitude: 0,
    longitude: 0,
  });

  const { warehouses, loading } = useWarehouses();

  // Create location options from warehouses
  const warehouseOptions: LocationOption[] = warehouses.map(warehouse => ({
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

  const handleCustomLocationSave = () => {
    if (customLocation.city && customLocation.street && customLocation.houseNo && customLocation.postCode) {
      onChange({
        ...customLocation,
        isWarehouse: false,
      });
      setShowCustomForm(false);
      setOpen(false);
      setCustomLocation({
        city: '',
        street: '',
        houseNo: '',
        postCode: '',
        latitude: 0,
        longitude: 0,
      });
    }
  };

  const handleInputChange = (field: keyof Location, newValue: string | number) => {
    setCustomLocation(prev => ({
      ...prev,
      [field]: newValue,
    }));
  };

  const handleMapPickerSelect = (locationData: any) => {
    setCustomLocation({
      city: locationData.city || '',
      street: locationData.street || '',
      houseNo: locationData.houseNo || '',
      postCode: locationData.postCode || '',
      latitude: locationData.latitude,
      longitude: locationData.longitude,
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
          {!showCustomForm ? (
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
                      onSelect={() => setShowCustomForm(true)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Add custom location</span>
                      </div>
                    </CommandItem>
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          ) : (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Add Custom Location</h4>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMapPicker(true)}
                  >
                    <Map className="h-4 w-4 mr-1" />
                    Pick on Map
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCustomForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">City</label>
                  <input
                    type="text"
                    value={customLocation.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-2 py-1 border rounded text-sm"
                    placeholder="Berlin"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Post Code</label>
                  <input
                    type="text"
                    value={customLocation.postCode}
                    onChange={(e) => handleInputChange('postCode', e.target.value)}
                    className="w-full px-2 py-1 border rounded text-sm"
                    placeholder="10115"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Street</label>
                  <input
                    type="text"
                    value={customLocation.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    className="w-full px-2 py-1 border rounded text-sm"
                    placeholder="Hauptstraße"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">House No</label>
                  <input
                    type="text"
                    value={customLocation.houseNo}
                    onChange={(e) => handleInputChange('houseNo', e.target.value)}
                    className="w-full px-2 py-1 border rounded text-sm"
                    placeholder="123"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={customLocation.latitude}
                    onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 border rounded text-sm"
                    placeholder="52.5200"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={customLocation.longitude}
                    onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 border rounded text-sm"
                    placeholder="13.4050"
                  />
                </div>
              </div>
              <Button
                onClick={handleCustomLocationSave}
                className="w-full"
                disabled={!customLocation.city || !customLocation.street || !customLocation.houseNo || !customLocation.postCode}
              >
                Add Location
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {value?.isWarehouse && (
        <Badge variant="outline" className="w-fit">
          <Building2 className="h-3 w-3 mr-1" />
          Warehouse
        </Badge>
      )}

      <MapPicker
        open={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onLocationSelect={handleMapPickerSelect}
        initialLocation={
          customLocation.latitude && customLocation.longitude
            ? { latitude: customLocation.latitude, longitude: customLocation.longitude }
            : undefined
        }
      />
    </div>
  );
}