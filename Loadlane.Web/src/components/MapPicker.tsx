import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { MapPin, Search } from 'lucide-react';

// Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiYmljbGlnaHRlcjgxIiwiYSI6ImNtZm1tMzYzbjAyc3Yya3NqZ2Fqa3IzOWEifQ.3g3VkSpDLMAFVQCYJ9dtFQ';

interface LocationData {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    street?: string;
    houseNo?: string;
    postCode?: string;
}

interface MapPickerProps {
    open: boolean;
    onClose: () => void;
    onLocationSelect: (location: LocationData) => void;
    initialLocation?: { latitude: number; longitude: number };
}

export function MapPicker({ open, onClose, onLocationSelect, initialLocation }: MapPickerProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const marker = useRef<mapboxgl.Marker | null>(null);
    const [currentLocation, setCurrentLocation] = useState({
        latitude: initialLocation?.latitude || 52.5200,
        longitude: initialLocation?.longitude || 13.4050
    });
    const [addressInfo, setAddressInfo] = useState<Partial<LocationData>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

    // Reverse geocoding function to get address from coordinates
    const reverseGeocode = async (latitude: number, longitude: number) => {
        setIsReverseGeocoding(true);
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}&limit=1&types=address,poi`
            );

            if (response.ok) {
                const data = await response.json();
                if (data.features && data.features.length > 0) {
                    const feature = data.features[0];
                    const context = feature.context || [];

                    // Extract address components
                    let city = '';
                    let postCode = '';
                    let street = '';
                    let houseNo = '';

                    // Get city and postal code from context
                    context.forEach((item: any) => {
                        if (item.id.includes('place')) {
                            city = item.text;
                        } else if (item.id.includes('postcode')) {
                            postCode = item.text;
                        }
                    });

                    // Try to parse street and house number from place name
                    if (feature.place_name) {
                        const addressParts = feature.place_name.split(',')[0].trim();
                        const match = addressParts.match(/^(.+?)\s+(\d+.*)$/);
                        if (match) {
                            street = match[1];
                            houseNo = match[2];
                        } else {
                            street = addressParts;
                        }
                    }

                    const addressData = {
                        address: feature.place_name,
                        city,
                        street,
                        houseNo,
                        postCode
                    };

                    setAddressInfo(addressData);
                    return addressData;
                }
            }
        } catch (error) {
            console.error('Reverse geocoding failed:', error);
        } finally {
            setIsReverseGeocoding(false);
        }
        return {};
    };

    // Initialize map when dialog opens
    useEffect(() => {
        if (!open) return;

        // Wait for the dialog to be fully rendered
        const timeoutId = setTimeout(() => {
            if (mapContainer.current && !map.current) {
                const mapInstance = new mapboxgl.Map({
                    container: mapContainer.current,
                    style: 'mapbox://styles/mapbox/streets-v12',
                    center: [currentLocation.longitude, currentLocation.latitude],
                    zoom: 13
                });

                map.current = mapInstance;

                // Create draggable marker
                const markerElement = document.createElement('div');
                markerElement.className = 'map-picker-marker';
                markerElement.innerHTML = `
          <div style="
            background: #3b82f6;
            border: 3px solid white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
          "></div>
        `;

                const markerInstance = new mapboxgl.Marker({
                    element: markerElement,
                    draggable: true
                })
                    .setLngLat([currentLocation.longitude, currentLocation.latitude])
                    .addTo(mapInstance);

                marker.current = markerInstance;

                // Update location when marker is dragged
                markerInstance.on('dragend', async () => {
                    const lngLat = markerInstance.getLngLat();
                    const newLocation = {
                        latitude: lngLat.lat,
                        longitude: lngLat.lng
                    };
                    setCurrentLocation(newLocation);
                    await reverseGeocode(newLocation.latitude, newLocation.longitude);
                });

                // Add click handler to move marker
                mapInstance.on('click', async (e) => {
                    const { lng, lat } = e.lngLat;
                    markerInstance.setLngLat([lng, lat]);
                    const newLocation = {
                        latitude: lat,
                        longitude: lng
                    };
                    setCurrentLocation(newLocation);
                    await reverseGeocode(newLocation.latitude, newLocation.longitude);
                });

                mapInstance.on('load', () => {
                    mapInstance.resize();
                });

                // Add resize observer to handle container size changes
                const resizeObserver = new ResizeObserver(() => {
                    if (mapInstance) {
                        mapInstance.resize();
                    }
                });

                if (mapContainer.current) {
                    resizeObserver.observe(mapContainer.current);
                }

                // Store resize observer for cleanup
                (mapInstance as any)._resizeObserver = resizeObserver;
            }
        }, 100);

        // Cleanup when dialog closes
        return () => {
            clearTimeout(timeoutId);
            if (!open && map.current) {
                // Disconnect resize observer if it exists
                if ((map.current as any)._resizeObserver) {
                    (map.current as any)._resizeObserver.disconnect();
                }
                map.current.remove();
                map.current = null;
                marker.current = null;
            }
        };
    }, [open, currentLocation.latitude, currentLocation.longitude]);

    // Trigger map resize when dialog becomes visible
    useEffect(() => {
        if (open && map.current) {
            const timeoutId = setTimeout(() => {
                map.current?.resize();
            }, 200);

            return () => clearTimeout(timeoutId);
        }
    }, [open]);

    // Perform initial reverse geocoding when dialog opens
    useEffect(() => {
        if (open && currentLocation.latitude && currentLocation.longitude) {
            reverseGeocode(currentLocation.latitude, currentLocation.longitude);
        }
    }, [open]);    // Update marker position when currentLocation changes externally
    useEffect(() => {
        if (marker.current) {
            marker.current.setLngLat([currentLocation.longitude, currentLocation.latitude]);
            if (map.current) {
                map.current.flyTo({
                    center: [currentLocation.longitude, currentLocation.latitude],
                    zoom: 13,
                    duration: 1000
                });
            }
        }
    }, [currentLocation.latitude, currentLocation.longitude]);

    // Search for location using Mapbox Geocoding API
    const handleSearch = async () => {
        if (!searchQuery.trim() || !map.current) return;

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                    searchQuery
                )}.json?access_token=${mapboxgl.accessToken}&limit=1`
            );

            if (response.ok) {
                const data = await response.json();
                if (data.features && data.features.length > 0) {
                    const [lng, lat] = data.features[0].center;
                    const newLocation = { latitude: lat, longitude: lng };
                    setCurrentLocation(newLocation);
                    // Also get the detailed address information for the found location
                    await reverseGeocode(lat, lng);
                }
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    };

    const handleConfirm = () => {
        onLocationSelect({
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            ...addressInfo
        });
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[95vh] w-[90vw]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Pick Location on Map
                    </DialogTitle>
                    <DialogDescription>
                        Click on the map or drag the marker to select the warehouse location. You can also search for an address.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search Box */}
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Label htmlFor="search-input">Search Address</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    id="search-input"
                                    placeholder="Enter address, city, or place..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                />
                                <Button
                                    type="button"
                                    onClick={handleSearch}
                                    disabled={isSearching || !searchQuery.trim()}
                                    size="sm"
                                >
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Current Coordinates Display */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <Label>Latitude</Label>
                            <div className="px-2 py-1 bg-muted rounded text-muted-foreground">
                                {currentLocation.latitude.toFixed(6)}
                            </div>
                        </div>
                        <div>
                            <Label>Longitude</Label>
                            <div className="px-2 py-1 bg-muted rounded text-muted-foreground">
                                {currentLocation.longitude.toFixed(6)}
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    {(addressInfo.address || isReverseGeocoding) && (
                        <div className="space-y-2">
                            <Label>Address Information</Label>
                            {isReverseGeocoding ? (
                                <div className="px-2 py-1 bg-muted rounded text-muted-foreground animate-pulse">
                                    Loading address...
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {addressInfo.address && (
                                        <div className="px-2 py-1 bg-muted rounded text-sm">
                                            <strong>Full Address:</strong> {addressInfo.address}
                                        </div>
                                    )}
                                    {(addressInfo.street || addressInfo.houseNo || addressInfo.city || addressInfo.postCode) && (
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            {addressInfo.street && (
                                                <div><strong>Street:</strong> {addressInfo.street}</div>
                                            )}
                                            {addressInfo.houseNo && (
                                                <div><strong>House No:</strong> {addressInfo.houseNo}</div>
                                            )}
                                            {addressInfo.city && (
                                                <div><strong>City:</strong> {addressInfo.city}</div>
                                            )}
                                            {addressInfo.postCode && (
                                                <div><strong>Postal Code:</strong> {addressInfo.postCode}</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Map Container */}
                    <div className="border rounded-lg overflow-hidden">
                        <div
                            ref={mapContainer}
                            className="w-full h-[500px]"
                            style={{ minHeight: '500px' }}
                        />
                    </div>

                    <p className="text-sm text-muted-foreground">
                        💡 Tip: Click anywhere on the map to move the marker, or drag the blue marker to your desired location.
                    </p>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleConfirm}>
                        Use This Location
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}