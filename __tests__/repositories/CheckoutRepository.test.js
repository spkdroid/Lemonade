import { CheckoutRepository } from '../../src/data/repositories/CheckoutRepository';
import { CheckoutRequest, CheckoutResponse } from '../../src/domain/models/CheckoutModels';

// Mock the API service
jest.mock('../../src/infrastructure/api/CheckoutApiService', () => ({
  CheckoutApiService: {
    submitOrder: jest.fn()
  }
}));

import { CheckoutApiService } from '../../src/infrastructure/api/CheckoutApiService';

describe('CheckoutRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.__DEV__ = false;
  });

  describe('submitOrder', () => {
    let mockOrder;

    beforeEach(() => {
      mockOrder = {
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
        discount: 0,
        total: 11.77,
        deliveryInfo: {
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345'
        },
        paymentMethod: 'credit_card',
        getFormattedPhone: () => '+1 (234) 567-890'
      };
    });

    it('should submit order successfully', async () => {
      const mockApiResponse = {
        success: true,
        orderId: 'order-456',
        confirmationNumber: 'CONF-123',
        estimatedDeliveryTime: '30-45 minutes',
        message: 'Order placed successfully',
        paymentStatus: 'confirmed',
        totalCharged: 11.77,
        currency: 'USD'
      };

      CheckoutApiService.submitOrder.mockResolvedValue(mockApiResponse);

      const result = await CheckoutRepository.submitOrder(mockOrder);

      expect(CheckoutApiService.submitOrder).toHaveBeenCalledWith(
        expect.any(CheckoutRequest)
      );
      expect(result).toBeInstanceOf(CheckoutResponse);
      expect(result.success).toBe(true);
      expect(result.orderId).toBe('order-456');
      expect(result.confirmationNumber).toBe('CONF-123');
    });

    it('should handle API failure', async () => {
      CheckoutApiService.submitOrder.mockRejectedValue(new Error('Network Error'));

      await expect(CheckoutRepository.submitOrder(mockOrder))
        .rejects.toThrow('Failed to submit order: Network Error');
    });

    it('should handle API error response', async () => {
      const mockErrorResponse = {
        success: false,
        error: 'Payment declined',
        errorCode: 'PAYMENT_DECLINED'
      };

      CheckoutApiService.submitOrder.mockResolvedValue(mockErrorResponse);

      const result = await CheckoutRepository.submitOrder(mockOrder);

      expect(result).toBeInstanceOf(CheckoutResponse);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Payment declined');
      expect(result.errorCode).toBe('PAYMENT_DECLINED');
    });

    it('should validate order before submission', async () => {
      const invalidOrder = {
        ...mockOrder,
        customerName: '',
        items: []
      };

      await expect(CheckoutRepository.submitOrder(invalidOrder))
        .rejects.toThrow('Invalid order data provided');
    });

    it('should handle missing order data', async () => {
      await expect(CheckoutRepository.submitOrder(null))
        .rejects.toThrow('Order data is required');

      await expect(CheckoutRepository.submitOrder(undefined))
        .rejects.toThrow('Order data is required');
    });

    it('should create proper CheckoutRequest', async () => {
      const mockApiResponse = {
        success: true,
        orderId: 'order-456'
      };

      CheckoutApiService.submitOrder.mockResolvedValue(mockApiResponse);

      await CheckoutRepository.submitOrder(mockOrder);

      const callArgs = CheckoutApiService.submitOrder.mock.calls[0][0];
      expect(callArgs).toBeInstanceOf(CheckoutRequest);
      expect(callArgs.orderId).toBe('order-123');
      expect(callArgs.customerInfo.name).toBe('John Doe');
      expect(callArgs.items).toHaveLength(1);
      expect(callArgs.pricing.total).toBe(11.77);
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.code = 'TIMEOUT';
      
      CheckoutApiService.submitOrder.mockRejectedValue(timeoutError);

      await expect(CheckoutRepository.submitOrder(mockOrder))
        .rejects.toThrow('Failed to submit order: Request timeout');
    });
  });

  describe('validateOrder', () => {
    it('should validate complete order', () => {
      const validOrder = {
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        customerEmail: 'john@example.com',
        items: [
          { id: '1', name: 'Item', price: 3.99, quantity: 1 }
        ],
        deliveryInfo: {
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA'
        },
        total: 3.99
      };

      expect(() => CheckoutRepository.validateOrder(validOrder)).not.toThrow();
    });

    it('should reject order with missing customer name', () => {
      const invalidOrder = {
        customerName: '',
        customerPhone: '+1234567890',
        items: [{ id: '1', name: 'Item', price: 3.99, quantity: 1 }]
      };

      expect(() => CheckoutRepository.validateOrder(invalidOrder))
        .toThrow('Customer name is required');
    });

    it('should reject order with missing phone', () => {
      const invalidOrder = {
        customerName: 'John Doe',
        customerPhone: '',
        items: [{ id: '1', name: 'Item', price: 3.99, quantity: 1 }]
      };

      expect(() => CheckoutRepository.validateOrder(invalidOrder))
        .toThrow('Customer phone is required');
    });

    it('should reject order with empty items', () => {
      const invalidOrder = {
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        items: []
      };

      expect(() => CheckoutRepository.validateOrder(invalidOrder))
        .toThrow('Order must contain at least one item');
    });

    it('should reject order with missing delivery info', () => {
      const invalidOrder = {
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        items: [{ id: '1', name: 'Item', price: 3.99, quantity: 1 }],
        deliveryInfo: {}
      };

      expect(() => CheckoutRepository.validateOrder(invalidOrder))
        .toThrow('Delivery address is required');
    });

    it('should reject order with invalid total', () => {
      const invalidOrder = {
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        items: [{ id: '1', name: 'Item', price: 3.99, quantity: 1 }],
        deliveryInfo: { address: '123 Main St' },
        total: 0
      };

      expect(() => CheckoutRepository.validateOrder(invalidOrder))
        .toThrow('Order total must be greater than 0');
    });
  });

  describe('retryOrder', () => {
    let mockOrder;

    beforeEach(() => {
      mockOrder = {
        id: 'order-123',
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        items: [{ id: '1', name: 'Item', price: 3.99, quantity: 1 }],
        deliveryInfo: { address: '123 Main St' },
        total: 3.99,
        getFormattedPhone: () => '+1 (234) 567-890'
      };
    });

    it('should retry order with exponential backoff', async () => {
      const mockApiResponse = {
        success: true,
        orderId: 'order-456'
      };

      // Fail first two attempts, succeed on third
      CheckoutApiService.submitOrder
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockRejectedValueOnce(new Error('Server Error'))
        .mockResolvedValueOnce(mockApiResponse);

      const result = await CheckoutRepository.retryOrder(mockOrder, 3);

      expect(CheckoutApiService.submitOrder).toHaveBeenCalledTimes(3);
      expect(result).toBeInstanceOf(CheckoutResponse);
      expect(result.success).toBe(true);
    });

    it('should fail after maximum retries', async () => {
      CheckoutApiService.submitOrder.mockRejectedValue(new Error('Persistent Error'));

      await expect(CheckoutRepository.retryOrder(mockOrder, 2))
        .rejects.toThrow('Failed to submit order after 2 retries');
    });

    it('should use default retry count', async () => {
      CheckoutApiService.submitOrder.mockRejectedValue(new Error('Error'));

      await expect(CheckoutRepository.retryOrder(mockOrder))
        .rejects.toThrow('Failed to submit order after 3 retries');

      expect(CheckoutApiService.submitOrder).toHaveBeenCalledTimes(3);
    });
  });

  describe('getOrderStatus', () => {
    it('should get order status from API', async () => {
      const mockStatusResponse = {
        orderId: 'order-123',
        status: 'confirmed',
        estimatedDeliveryTime: '25 minutes',
        trackingInfo: 'Out for delivery'
      };

      // Mock the status API call
      const mockStatusApi = jest.fn().mockResolvedValue(mockStatusResponse);
      CheckoutApiService.getOrderStatus = mockStatusApi;

      const result = await CheckoutRepository.getOrderStatus('order-123');

      expect(mockStatusApi).toHaveBeenCalledWith('order-123');
      expect(result).toEqual(mockStatusResponse);
    });

    it('should handle status check errors', async () => {
      const mockStatusApi = jest.fn().mockRejectedValue(new Error('Order not found'));
      CheckoutApiService.getOrderStatus = mockStatusApi;

      await expect(CheckoutRepository.getOrderStatus('invalid-order'))
        .rejects.toThrow('Failed to get order status');
    });
  });
});
