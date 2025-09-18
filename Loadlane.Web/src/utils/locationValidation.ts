import type { Location } from '../types/order';

export interface LocationWithMeta extends Location {
  isWarehouse?: boolean;
  warehouseId?: string;
}

/**
 * Checks if two locations are the same
 */
export function isSameLocation(location1: LocationWithMeta | null, location2: LocationWithMeta | null): boolean {
  if (!location1 || !location2) return false;

  // If both are warehouses, compare warehouse IDs
  if (location1.isWarehouse && location2.isWarehouse) {
    return location1.warehouseId === location2.warehouseId;
  }

  // If one is warehouse and other is custom, they're different
  if (location1.isWarehouse !== location2.isWarehouse) {
    return false;
  }

  // For custom locations, compare coordinates with some tolerance for floating point comparison
  const latDiff = Math.abs(location1.latitude - location2.latitude);
  const lngDiff = Math.abs(location1.longitude - location2.longitude);
  const tolerance = 0.0001; // ~11 meters

  return latDiff < tolerance && lngDiff < tolerance;
}

/**
 * Validates that start and destination locations are different
 */
export function validateDifferentLocations(
  startLocation: LocationWithMeta | null,
  destinationLocation: LocationWithMeta | null
): { isValid: boolean; message?: string } {
  if (!startLocation || !destinationLocation) {
    return { isValid: true }; // Allow empty locations for now
  }

  if (isSameLocation(startLocation, destinationLocation)) {
    return {
      isValid: false,
      message: "Start and destination locations must be different"
    };
  }

  return { isValid: true };
}

/**
 * Gets a display name for a location
 */
export function getLocationDisplayName(location: LocationWithMeta | null): string {
  if (!location) return "";

  if (location.isWarehouse) {
    return `${location.city} (Warehouse)`;
  }

  return `${location.city}, ${location.street} ${location.houseNo}`;
}