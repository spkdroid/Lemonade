import { renderHook, act } from '@testing-library/react-native';
import { useCheckoutViewModel } from '../../src/presentation/viewModels/useCheckoutViewModel';
import { CheckoutRepository } from '../../src/data/repositories/CheckoutRepository';
import { CheckoutResponse } from '../../src/domain/models/CheckoutModels';

// Mock the repository
jest.mock('../../src/data/repositories/CheckoutRepository', () => ({
  CheckoutRepository: {
    submitOrder: jest.fn(),
    validateOrder: jest.fn(),
    retryOrder: jest.fn()
  }
}));

describe('useCheckoutViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.__DEV__ = false;
  });

  const mockOrder = {
    id: 'order-123',
    customerName: 'John Doe',
    customerPhone: '+1234567890',
    customerEmail: 'john@example.com',
    items: [
      {
        id: 'item-1',
        name: 'Classic Lemonade',
        price: 3.99,
        quantity: 2
      }
    ],
    subtotal: 7.98,
    tax: 0.80,
    deliveryFee: 2.99,
    total: 11.77,
    deliveryInfo: {
      address: '123 Main St',
      city: 'Anytown',
      state: 'CA'
    },
    paymentMethod: 'credit_card',
    getFormattedPhone: () => '+1 (234) 567-890'
  };

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useCheckoutViewModel());

      expect(result.current.isProcessing).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.checkoutResponse).toBeNull();
      expect(result.current.progress).toBe(0);
    });
  });

  describe('submitOrder', () => {
    it('should submit order successfully', async () => {
      const mockResponse = new CheckoutResponse({
        success: true,
        orderId: 'order-456',
        confirmationNumber: 'CONF-123',
        estimatedDeliveryTime: '30-45 minutes',
        message: 'Order placed successfully',
        paymentStatus: 'confirmed',
        totalCharged: 11.77,
        currency: 'USD'
      });

      CheckoutRepository.submitOrder.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCheckoutViewModel());

      await act(async () => {
        await result.current.submitOrder(mockOrder);
      });

      expect(CheckoutRepository.submitOrder).toHaveBeenCalledWith(mockOrder);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.checkoutResponse).toEqual(mockResponse);
      expect(result.current.error).toBeNull();
    });

    it('should handle order submission failure', async () => {
      const mockErrorResponse = new CheckoutResponse({
        success: false,
        error: 'Payment declined',
        errorCode: 'PAYMENT_DECLINED'
      });

      CheckoutRepository.submitOrder.mockResolvedValue(mockErrorResponse);

      const { result } = renderHook(() => useCheckoutViewModel());

      await act(async () => {
        await result.current.submitOrder(mockOrder);
      });

      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.error).toBe('Payment declined');
      expect(result.current.checkoutResponse).toEqual(mockErrorResponse);
    });

    it('should handle network/repository errors', async () => {
      CheckoutRepository.submitOrder.mockRejectedValue(new Error('Network Error'));

      const { result } = renderHook(() => useCheckoutViewModel());

      await act(async () => {
        await result.current.submitOrder(mockOrder);
      });

      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.error).toBe('Network Error');
      expect(result.current.checkoutResponse).toBeNull();
    });

    it('should set processing state during submission', async () => {
      CheckoutRepository.submitOrder.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(new CheckoutResponse({ success: true })), 100))
      );

      const { result } = renderHook(() => useCheckoutViewModel());

      act(() => {
        result.current.submitOrder(mockOrder);
      });

      expect(result.current.isProcessing).toBe(true);
      expect(result.current.progress).toBeGreaterThan(0);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.isProcessing).toBe(false);
    });

    it('should validate order before submission', async () => {
      CheckoutRepository.validateOrder.mockImplementation(() => {
        throw new Error('Customer name is required');
      });

      const invalidOrder = { ...mockOrder, customerName: '' };
      const { result } = renderHook(() => useCheckoutViewModel());

      await act(async () => {
        await result.current.submitOrder(invalidOrder);
      });

      expect(result.current.error).toBe('Customer name is required');
      expect(CheckoutRepository.submitOrder).not.toHaveBeenCalled();
    });

    it('should handle null/undefined order', async () => {
      const { result } = renderHook(() => useCheckoutViewModel());

      await act(async () => {
        await result.current.submitOrder(null);
      });

      expect(result.current.error).toBe('Order data is required');

      await act(async () => {
        await result.current.submitOrder(undefined);
      });

      expect(result.current.error).toBe('Order data is required');
    });
  });

  describe('retryOrder', () => {
    it('should retry order submission', async () => {
      const mockResponse = new CheckoutResponse({
        success: true,
        orderId: 'order-retry-456'
      });

      CheckoutRepository.retryOrder.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCheckoutViewModel());

      await act(async () => {
        await result.current.retryOrder(mockOrder, 3);
      });

      expect(CheckoutRepository.retryOrder).toHaveBeenCalledWith(mockOrder, 3);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.checkoutResponse).toEqual(mockResponse);
    });

    it('should handle retry failure', async () => {
      CheckoutRepository.retryOrder.mockRejectedValue(new Error('Max retries exceeded'));

      const { result } = renderHook(() => useCheckoutViewModel());

      await act(async () => {
        await result.current.retryOrder(mockOrder, 3);
      });

      expect(result.current.error).toBe('Max retries exceeded');
      expect(result.current.isSuccess).toBe(false);
    });

    it('should use default retry count', async () => {
      const mockResponse = new CheckoutResponse({ success: true });
      CheckoutRepository.retryOrder.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCheckoutViewModel());

      await act(async () => {
        await result.current.retryOrder(mockOrder);
      });

      expect(CheckoutRepository.retryOrder).toHaveBeenCalledWith(mockOrder, 3);
    });
  });

  describe('progress tracking', () => {
    it('should track progress during order submission', async () => {
      CheckoutRepository.submitOrder.mockImplementation(async () => {
        // Simulate progress updates
        await new Promise(resolve => setTimeout(resolve, 50));
        return new CheckoutResponse({ success: true });
      });

      const { result } = renderHook(() => useCheckoutViewModel());

      act(() => {
        result.current.submitOrder(mockOrder);
      });

      // Progress should start
      expect(result.current.progress).toBeGreaterThan(0);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Progress should complete
      expect(result.current.progress).toBe(100);
    });

    it('should reset progress on new submission', async () => {
      const { result } = renderHook(() => useCheckoutViewModel());

      // Set some progress
      act(() => {
        result.current.setProgress(50);
      });

      expect(result.current.progress).toBe(50);

      // Start new submission
      CheckoutRepository.submitOrder.mockResolvedValue(new CheckoutResponse({ success: true }));

      await act(async () => {
        await result.current.submitOrder(mockOrder);
      });

      expect(result.current.progress).toBe(100);
    });
  });

  describe('state management', () => {
    it('should clear error', () => {
      const { result } = renderHook(() => useCheckoutViewModel());

      // Set error
      act(() => {
        result.current.setError('Test error');
      });

      expect(result.current.error).toBe('Test error');

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should reset checkout state', async () => {
      CheckoutRepository.submitOrder.mockResolvedValue(
        new CheckoutResponse({
          success: true,
          orderId: 'order-456'
        })
      );

      const { result } = renderHook(() => useCheckoutViewModel());

      // Submit order to set state
      await act(async () => {
        await result.current.submitOrder(mockOrder);
      });

      expect(result.current.isSuccess).toBe(true);
      expect(result.current.checkoutResponse).toBeDefined();

      // Reset state
      act(() => {
        result.current.resetCheckout();
      });

      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.checkoutResponse).toBeNull();
      expect(result.current.progress).toBe(0);
    });

    it('should set custom progress', () => {
      const { result } = renderHook(() => useCheckoutViewModel());

      act(() => {
        result.current.setProgress(75);
      });

      expect(result.current.progress).toBe(75);
    });

    it('should clamp progress to valid range', () => {
      const { result } = renderHook(() => useCheckoutViewModel());

      act(() => {
        result.current.setProgress(-10);
      });

      expect(result.current.progress).toBe(0);

      act(() => {
        result.current.setProgress(150);
      });

      expect(result.current.progress).toBe(100);
    });
  });

  describe('computed properties', () => {
    it('should indicate if checkout can be retried', async () => {
      const { result } = renderHook(() => useCheckoutViewModel());

      // No error initially
      expect(result.current.canRetry).toBe(false);

      // Set error
      CheckoutRepository.submitOrder.mockRejectedValue(new Error('Network Error'));

      await act(async () => {
        await result.current.submitOrder(mockOrder);
      });

      expect(result.current.canRetry).toBe(true);

      // Success should disable retry
      CheckoutRepository.submitOrder.mockResolvedValue(new CheckoutResponse({ success: true }));

      await act(async () => {
        await result.current.submitOrder(mockOrder);
      });

      expect(result.current.canRetry).toBe(false);
    });

    it('should indicate if order is confirmed', async () => {
      const { result } = renderHook(() => useCheckoutViewModel());

      expect(result.current.isConfirmed).toBe(false);

      CheckoutRepository.submitOrder.mockResolvedValue(
        new CheckoutResponse({
          success: true,
          paymentStatus: 'confirmed'
        })
      );

      await act(async () => {
        await result.current.submitOrder(mockOrder);
      });

      expect(result.current.isConfirmed).toBe(true);
    });

    it('should get order status', async () => {
      const { result } = renderHook(() => useCheckoutViewModel());

      expect(result.current.orderStatus).toBe('pending');

      CheckoutRepository.submitOrder.mockResolvedValue(
        new CheckoutResponse({
          success: true,
          orderId: 'order-456'
        })
      );

      await act(async () => {
        await result.current.submitOrder(mockOrder);
      });

      expect(result.current.orderStatus).toBe('confirmed');
    });
  });

  describe('error handling', () => {
    it('should handle different error types', async () => {
      const { result } = renderHook(() => useCheckoutViewModel());

      // Network error
      CheckoutRepository.submitOrder.mockRejectedValue(new Error('Network timeout'));

      await act(async () => {
        await result.current.submitOrder(mockOrder);
      });

      expect(result.current.error).toBe('Network timeout');

      // Payment error
      CheckoutRepository.submitOrder.mockResolvedValue(
        new CheckoutResponse({
          success: false,
          error: 'Insufficient funds',
          errorCode: 'INSUFFICIENT_FUNDS'
        })
      );

      await act(async () => {
        await result.current.submitOrder(mockOrder);
      });

      expect(result.current.error).toBe('Insufficient funds');
    });

    it('should preserve error code in response', async () => {
      const errorResponse = new CheckoutResponse({
        success: false,
        error: 'Card declined',
        errorCode: 'CARD_DECLINED'
      });

      CheckoutRepository.submitOrder.mockResolvedValue(errorResponse);

      const { result } = renderHook(() => useCheckoutViewModel());

      await act(async () => {
        await result.current.submitOrder(mockOrder);
      });

      expect(result.current.checkoutResponse.errorCode).toBe('CARD_DECLINED');
    });
  });

  describe('concurrency handling', () => {
    it('should handle concurrent submissions', async () => {
      CheckoutRepository.submitOrder.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(new CheckoutResponse({ success: true })), 100))
      );

      const { result } = renderHook(() => useCheckoutViewModel());

      // Start multiple submissions
      act(() => {
        result.current.submitOrder(mockOrder);
        result.current.submitOrder(mockOrder);
        result.current.submitOrder(mockOrder);
      });

      expect(result.current.isProcessing).toBe(true);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      // Should only process one submission
      expect(CheckoutRepository.submitOrder).toHaveBeenCalledTimes(1);
    });

    it('should ignore submissions while processing', async () => {
      CheckoutRepository.submitOrder.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(new CheckoutResponse({ success: true })), 100))
      );

      const { result } = renderHook(() => useCheckoutViewModel());

      act(() => {
        result.current.submitOrder(mockOrder);
      });

      expect(result.current.isProcessing).toBe(true);

      // Try to submit again while processing
      act(() => {
        result.current.submitOrder(mockOrder);
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(CheckoutRepository.submitOrder).toHaveBeenCalledTimes(1);
    });
  });
});
