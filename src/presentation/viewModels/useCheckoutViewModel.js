import { useState, useCallback } from 'react';
import { CheckoutRepository } from '../../data/repositories/CheckoutRepository';

export const useCheckoutViewModel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);

  const processCheckout = useCallback(async (cartItems, deliveryInfo, customerInfo = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Processing checkout with:', {
        cartItemsCount: cartItems.length,
        deliveryInfo,
        customerInfo
      });
      
      const response = await CheckoutRepository.processCheckout(
        cartItems,
        deliveryInfo,
        customerInfo
      );
      
      if (response.isSuccess()) {
        const { order, checkoutResponse } = response.getData();
        setLastOrder({
          order,
          checkoutResponse
        });
        
        // Refresh order lists
        await loadOrderHistory();
        await loadPendingOrders();
        
        return response;
      } else {
        setError(response.getMessage());
        return response;
      }
    } catch (err) {
      console.error('Checkout ViewModel error:', err);
      const errorMessage = err.message || 'Checkout failed';
      setError(errorMessage);
      return {
        isSuccess: () => false,
        getMessage: () => errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrderHistory = useCallback(async () => {
    try {
      const response = await CheckoutRepository.getOrderHistory();
      if (response.isSuccess()) {
        setOrderHistory(response.getData());
      }
    } catch (err) {
      console.error('Error loading order history:', err);
    }
  }, []);

  const loadPendingOrders = useCallback(async () => {
    try {
      const response = await CheckoutRepository.getPendingOrders();
      if (response.isSuccess()) {
        setPendingOrders(response.getData());
      }
    } catch (err) {
      console.error('Error loading pending orders:', err);
    }
  }, []);

  const getOrderById = useCallback(async (orderId) => {
    try {
      const response = await CheckoutRepository.getOrderById(orderId);
      return response;
    } catch (err) {
      console.error('Error getting order by ID:', err);
      return {
        isSuccess: () => false,
        getMessage: () => err.message || 'Failed to get order'
      };
    }
  }, []);

  const getOrderStatus = useCallback(async (orderNumber) => {
    try {
      const response = await CheckoutRepository.getOrderStatus(orderNumber);
      return response;
    } catch (err) {
      console.error('Error getting order status:', err);
      return {
        isSuccess: () => false,
        getMessage: () => err.message || 'Failed to get order status'
      };
    }
  }, []);

  const cancelOrder = useCallback(async (orderNumber, reason = '') => {
    try {
      setLoading(true);
      const response = await CheckoutRepository.cancelOrder(orderNumber, reason);
      
      if (response.isSuccess()) {
        // Refresh order lists
        await loadOrderHistory();
        await loadPendingOrders();
      }
      
      return response;
    } catch (err) {
      console.error('Error cancelling order:', err);
      return {
        isSuccess: () => false,
        getMessage: () => err.message || 'Failed to cancel order'
      };
    } finally {
      setLoading(false);
    }
  }, [loadOrderHistory, loadPendingOrders]);

  const retryFailedOrder = useCallback(async (orderId) => {
    try {
      setLoading(true);
      const response = await CheckoutRepository.retryFailedOrder(orderId);
      
      if (response.isSuccess()) {
        const { order, checkoutResponse } = response.getData();
        setLastOrder({
          order,
          checkoutResponse
        });
        
        // Refresh order lists
        await loadOrderHistory();
        await loadPendingOrders();
      }
      
      return response;
    } catch (err) {
      console.error('Error retrying failed order:', err);
      return {
        isSuccess: () => false,
        getMessage: () => err.message || 'Failed to retry order'
      };
    } finally {
      setLoading(false);
    }
  }, [loadOrderHistory, loadPendingOrders]);

  const clearOrderHistory = useCallback(async () => {
    try {
      const response = await CheckoutRepository.clearOrderHistory();
      if (response.isSuccess()) {
        setOrderHistory([]);
      }
      return response;
    } catch (err) {
      console.error('Error clearing order history:', err);
      return {
        isSuccess: () => false,
        getMessage: () => err.message || 'Failed to clear order history'
      };
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetLastOrder = useCallback(() => {
    setLastOrder(null);
  }, []);

  // Auto-load data when needed
  const initializeData = useCallback(async () => {
    await Promise.all([
      loadOrderHistory(),
      loadPendingOrders()
    ]);
  }, [loadOrderHistory, loadPendingOrders]);

  return {
    // State
    loading,
    error,
    lastOrder,
    orderHistory,
    pendingOrders,
    
    // Actions
    processCheckout,
    getOrderById,
    getOrderStatus,
    cancelOrder,
    retryFailedOrder,
    clearOrderHistory,
    clearError,
    resetLastOrder,
    
    // Data management
    loadOrderHistory,
    loadPendingOrders,
    initializeData,
    
    // Computed properties
    hasOrders: orderHistory.length > 0,
    hasPendingOrders: pendingOrders.length > 0,
    hasError: !!error,
    isProcessing: loading,
    lastOrderNumber: lastOrder?.checkoutResponse?.orderNumber || null,
    totalOrdersCount: orderHistory.length
  };
};
