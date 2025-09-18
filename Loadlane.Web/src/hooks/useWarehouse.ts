import { useState, useEffect } from 'react';
import { warehouseService } from '../services/warehouseService';
import type {
  WarehouseResponse,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
  GateResponse,
  CreateGateRequest,
  UpdateGateRequest,
  GateSimpleResponse
} from '../types/warehouse';
import {toast} from 'sonner';

// Hook for managing multiple warehouses
export function useWarehouses() {
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await warehouseService.getAllWarehouses();
      setWarehouses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch warehouses');
    } finally {
      setLoading(false);
    }
  };

  const createWarehouse = async (warehouse: CreateWarehouseRequest) => {
    try {
      const newWarehouse = await warehouseService.createWarehouse(warehouse);
      setWarehouses(prev => [...prev, newWarehouse]);
      return newWarehouse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create warehouse';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteWarehouse = async (id: string) => {
    try {
      await warehouseService.deleteWarehouse(id);
      setWarehouses(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete warehouse';
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  return {
    warehouses,
    loading,
    error,
    refetch: fetchWarehouses,
    createWarehouse,
    deleteWarehouse,
  };
}

// Hook for managing a single warehouse
export function useWarehouse(id: string | undefined) {
  const [warehouse, setWarehouse] = useState<WarehouseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWarehouse = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await warehouseService.getWarehouseById(id);
      setWarehouse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch warehouse');
    } finally {
      setLoading(false);
    }
  };

  const updateWarehouse = async (updates: UpdateWarehouseRequest) => {
    if (!id) throw new Error('No warehouse ID provided');

    try {
      const updatedWarehouse = await warehouseService.updateWarehouse(id, updates);
      setWarehouse(updatedWarehouse);
      return updatedWarehouse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update warehouse';
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchWarehouse();
  }, [id]);

  return {
    warehouse,
    loading,
    error,
    refetch: fetchWarehouse,
    updateWarehouse,
  };
}

// Hook for managing gates within a warehouse
export function useWarehouseGates(warehouseId: string | undefined) {
  const [gates, setGates] = useState<GateSimpleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGates = async () => {
    if (!warehouseId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await warehouseService.getWarehouseGates(warehouseId);
      setGates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gates');
    } finally {
      setLoading(false);
    }
  };

  const createGate = async (gate: CreateGateRequest) => {
    if (!warehouseId) throw new Error('No warehouse ID provided');

    try {
      const newGate = await warehouseService.createGate(warehouseId, gate);
      // Convert full gate response to simple response for list
      const simpleGate: GateSimpleResponse = {
        id: newGate.id,
        number: newGate.number,
        description: newGate.description,
        isActive: newGate.isActive,
        createdUtc: newGate.createdUtc,
      };
      setGates(prev => [...prev, simpleGate]);
      return newGate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create gate';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateGate = async (gateId: string, updates: UpdateGateRequest) => {
    try {
      const updatedGate = await warehouseService.updateGate(gateId, updates);
      // Convert full gate response to simple response for list
      const simpleGate: GateSimpleResponse = {
        id: updatedGate.id,
        number: updatedGate.number,
        description: updatedGate.description,
        isActive: updatedGate.isActive,
        createdUtc: updatedGate.createdUtc,
      };
      setGates(prev => prev.map(g => g.id === gateId ? simpleGate : g));
      return updatedGate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update gate';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteGate = async (gateId: string) => {
    try {
      await warehouseService.deleteGate(gateId);
      setGates(prev => prev.filter(g => g.id !== gateId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete gate';
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchGates();
  }, [warehouseId]);

  return {
    gates,
    loading,
    error,
    refetch: fetchGates,
    createGate,
    updateGate,
    deleteGate,
  };
}

// Hook for managing a single gate
export function useGate(id: string | undefined) {
  const [gate, setGate] = useState<GateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGate = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await warehouseService.getGateById(id);
      setGate(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gate');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGate();
  }, [id]);

  return {
    gate,
    loading,
    error,
    refetch: fetchGate,
  };
}