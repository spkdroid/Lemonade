import { useState, useCallback } from 'react';
import { CheckoutRepository } from '../../data/repositories/CheckoutRepository';

export const useCheckoutViewModel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);

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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetLastOrder = useCallback(() => {
    setLastOrder(null);
  }, []);

  return {
    // State
    loading,
    error,
    lastOrder,
    
    // Actions
    processCheckout,
    clearError,
    resetLastOrder,
    
    // Computed properties
    hasError: !!error,
    isProcessing: loading,
    lastOrderNumber: lastOrder?.checkoutResponse?.orderNumber || null,
    hasLastOrder: !!lastOrder
  };
};
