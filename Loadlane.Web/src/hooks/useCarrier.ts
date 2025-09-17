import { useState, useEffect } from 'react';
import { carrierService } from '../services/carrierService';
import type {
  CarrierResponse,
  CreateCarrierRequest,
  UpdateCarrierRequest
} from '../types/carrier';

// Hook for managing multiple carriers
export function useCarriers() {
  const [carriers, setCarriers] = useState<CarrierResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCarriers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await carrierService.getAllCarriers();
      setCarriers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch carriers');
    } finally {
      setLoading(false);
    }
  };

  const createCarrier = async (carrier: CreateCarrierRequest) => {
    try {
      const newCarrier = await carrierService.createCarrier(carrier);
      setCarriers(prev => [...prev, newCarrier]);
      return newCarrier;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create carrier';
      setError(errorMessage);
      throw err;
    }
  };

  const updateCarrier = async (id: string, updates: UpdateCarrierRequest) => {
    try {
      const updatedCarrier = await carrierService.updateCarrier(id, updates);
      setCarriers(prev => prev.map(c => c.id === id ? updatedCarrier : c));
      return updatedCarrier;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update carrier';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteCarrier = async (id: string) => {
    try {
      await carrierService.deleteCarrier(id);
      setCarriers(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete carrier';
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchCarriers();
  }, []);

  return {
    carriers,
    loading,
    error,
    refetch: fetchCarriers,
    createCarrier,
    updateCarrier,
    deleteCarrier,
  };
}

// Hook for managing a single carrier
export function useCarrier(id: string | undefined) {
  const [carrier, setCarrier] = useState<CarrierResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCarrier = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await carrierService.getCarrierById(id);
      setCarrier(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch carrier');
    } finally {
      setLoading(false);
    }
  };

  const updateCarrier = async (updates: UpdateCarrierRequest) => {
    if (!id) throw new Error('No carrier ID provided');

    try {
      const updatedCarrier = await carrierService.updateCarrier(id, updates);
      setCarrier(updatedCarrier);
      return updatedCarrier;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update carrier';
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchCarrier();
  }, [id]);

  return {
    carrier,
    loading,
    error,
    refetch: fetchCarrier,
    updateCarrier,
  };
}