import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import type { CreateOrderRequest, OrderResponse } from '../types/order';

export function useOrders() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: CreateOrderRequest): Promise<OrderResponse> => {
    try {
      setError(null);
      const newOrder = await orderService.createOrder(orderData);
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getOrderById = async (id: string): Promise<OrderResponse | null> => {
    try {
      setError(null);
      return await orderService.getOrderById(id);
    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        return null;
      }
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching order:', err);
      return null;
    }
  };

  const deleteOrder = async (id: string): Promise<void> => {
    try {
      setError(null);
      await orderService.deleteOrder(id);
      setOrders(prev => prev.filter(order => order.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete order';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const searchOrders = async (query: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.searchOrders(query);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search orders');
      console.error('Error searching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    refetch,
    createOrder,
    getOrderById,
    deleteOrder,
    searchOrders,
  };
}

export function useOrder(id: string) {
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrderById(id);
      setOrder(data);
    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        setOrder(null);
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error('Error fetching order:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchOrder();
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  return {
    order,
    loading,
    error,
    refetch,
  };
}