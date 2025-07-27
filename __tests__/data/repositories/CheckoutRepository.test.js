import { CheckoutRepository } from '../../../src/data/repositories/CheckoutRepository';
import { CheckoutApiService } from '../../../src/data/datasources/remote/CheckoutApiService';
import { Order } from '../../../src/domain/models/Order';
import { ApiResponse } from '../../../src/domain/models/ApiResponse';

// Mock dependencies
jest.mock('../../../src/data/datasources/remote/CheckoutApiService');
jest.mock('../../../src/domain/models/Order');
jest.mock('../../../src/domain/models/ApiResponse');

describe('CheckoutRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  describe('processCheckout', () => {
    const mockCartItems = [
      { id: 'item1', name: 'Lemonade', price: 2.99, quantity: 2 },
      { id: 'item2', name: 'Juice', price: 3.99, quantity: 1 }
    ];

    const mockDeliveryInfo = {
      name: 'John Doe',
      phoneNumber: '+1234567890',
      email: 'john@example.com',
      address: '123 Main St'
    };

    const mockCustomerInfo = {
      name: 'John Doe',
      email: 'john@example.com'
    };

    test('should process checkout successfully with valid data', async () => {
      const mockOrder = {
        id: 'order123',
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        customerEmail: 'john@example.com',
        orderNumber: undefined,
        status: 'pending',
        validate: jest.fn().mockReturnValue([]),
        toJSON: jest.fn().mockReturnValue({
          id: 'order123',
          customerName: 'John Doe',
          total: 9.97
        })
      };

      const mockApiResponse = {
        isSuccess: jest.fn().mockReturnValue(true),
        getData: jest.fn().mockReturnValue({
          orderNumber: 'ORD-123456',
          orderId: 'order123',
          estimatedDeliveryTime: '30 minutes'
        })
      };

      const mockSuccessResponse = {
        isSuccess: jest.fn().mockReturnValue(true),
        getData: jest.fn().mockReturnValue({
          order: mockOrder,
          checkoutResponse: mockApiResponse.getData()
        }),
        getMessage: jest.fn().mockReturnValue('Order placed successfully')
      };

      Order.fromCartAndDelivery.mockReturnValue(mockOrder);
      CheckoutApiService.processCheckout.mockResolvedValue(mockApiResponse);
      ApiResponse.success.mockReturnValue(mockSuccessResponse);

      const result = await CheckoutRepository.processCheckout(
        mockCartItems,
        mockDeliveryInfo,
        mockCustomerInfo
      );

      expect(Order.fromCartAndDelivery).toHaveBeenCalledWith(
        mockCartItems,
        mockDeliveryInfo,
        mockCustomerInfo
      );
      expect(mockOrder.validate).toHaveBeenCalled();
      expect(CheckoutApiService.processCheckout).toHaveBeenCalledWith(mockOrder);
      expect(mockOrder.orderNumber).toBe('ORD-123456');
      expect(mockOrder.status).toBe('confirmed');
      expect(ApiResponse.success).toHaveBeenCalledWith(
        {
          order: mockOrder,
          checkoutResponse: mockApiResponse.getData()
        },
        'Order placed successfully'
      );
      expect(result).toBe(mockSuccessResponse);
    });

    test('should return validation error for invalid order', async () => {
      const mockOrder = {
        validate: jest.fn().mockReturnValue(['Customer name is required', 'Phone number is invalid'])
      };

      const mockErrorResponse = {
        isSuccess: jest.fn().mockReturnValue(false),
        getMessage: jest.fn().mockReturnValue('Order validation failed')
      };

      Order.fromCartAndDelivery.mockReturnValue(mockOrder);
      ApiResponse.error.mockReturnValue(mockErrorResponse);

      const result = await CheckoutRepository.processCheckout(
        mockCartItems,
        mockDeliveryInfo,
        mockCustomerInfo
      );

      expect(mockOrder.validate).toHaveBeenCalled();
      expect(ApiResponse.error).toHaveBeenCalledWith(
        'Order validation failed: Customer name is required, Phone number is invalid',
        400
      );
      expect(CheckoutApiService.processCheckout).not.toHaveBeenCalled();
      expect(result).toBe(mockErrorResponse);
    });

    test('should handle API checkout failure', async () => {
      const mockOrder = {
        validate: jest.fn().mockReturnValue([]),
        toJSON: jest.fn().mockReturnValue({ id: 'order123' })
      };

      const mockApiErrorResponse = {
        isSuccess: jest.fn().mockReturnValue(false),
        getMessage: jest.fn().mockReturnValue('Payment failed'),
        getStatusCode: jest.fn().mockReturnValue(402)
      };

      Order.fromCartAndDelivery.mockReturnValue(mockOrder);
      CheckoutApiService.processCheckout.mockResolvedValue(mockApiErrorResponse);

      const result = await CheckoutRepository.processCheckout(
        mockCartItems,
        mockDeliveryInfo,
        mockCustomerInfo
      );

      expect(CheckoutApiService.processCheckout).toHaveBeenCalledWith(mockOrder);
      expect(result).toBe(mockApiErrorResponse);
    });

    test('should handle network/API errors', async () => {
      const mockOrder = {
        validate: jest.fn().mockReturnValue([]),
        toJSON: jest.fn().mockReturnValue({ id: 'order123' })
      };

      const mockErrorResponse = {
        isSuccess: jest.fn().mockReturnValue(false),
        getMessage: jest.fn().mockReturnValue('Checkout processing failed')
      };

      Order.fromCartAndDelivery.mockReturnValue(mockOrder);
      CheckoutApiService.processCheckout.mockRejectedValue(new Error('Network error'));
      ApiResponse.error.mockReturnValue(mockErrorResponse);

      const result = await CheckoutRepository.processCheckout(
        mockCartItems,
        mockDeliveryInfo,
        mockCustomerInfo
      );

      expect(console.error).toHaveBeenCalledWith('CheckoutRepository error:', expect.any(Error));
      expect(ApiResponse.error).toHaveBeenCalledWith(
        'Checkout processing failed: Network error',
        500
      );
      expect(result).toBe(mockErrorResponse);
    });

    test('should process checkout with default customer info', async () => {
      const mockOrder = {
        validate: jest.fn().mockReturnValue([]),
        toJSON: jest.fn().mockReturnValue({ id: 'order123' })
      };

      const mockApiResponse = {
        isSuccess: jest.fn().mockReturnValue(true),
        getData: jest.fn().mockReturnValue({
          orderNumber: 'ORD-123456',
          orderId: 'order123'
        })
      };

      const mockSuccessResponse = {
        isSuccess: jest.fn().mockReturnValue(true)
      };

      Order.fromCartAndDelivery.mockReturnValue(mockOrder);
      CheckoutApiService.processCheckout.mockResolvedValue(mockApiResponse);
      ApiResponse.success.mockReturnValue(mockSuccessResponse);

      const result = await CheckoutRepository.processCheckout(
        mockCartItems,
        mockDeliveryInfo
        // No customerInfo provided
      );

      expect(Order.fromCartAndDelivery).toHaveBeenCalledWith(
        mockCartItems,
        mockDeliveryInfo,
        {} // Default empty object
      );
      expect(result).toBe(mockSuccessResponse);
    });

    test('should handle order creation error', async () => {
      const mockErrorResponse = {
        isSuccess: jest.fn().mockReturnValue(false),
        getMessage: jest.fn().mockReturnValue('Order creation failed')
      };

      Order.fromCartAndDelivery.mockImplementation(() => {
        throw new Error('Order creation failed');
      });
      ApiResponse.error.mockReturnValue(mockErrorResponse);

      const result = await CheckoutRepository.processCheckout(
        mockCartItems,
        mockDeliveryInfo,
        mockCustomerInfo
      );

      expect(console.error).toHaveBeenCalledWith('CheckoutRepository error:', expect.any(Error));
      expect(ApiResponse.error).toHaveBeenCalledWith(
        'Checkout processing failed: Order creation failed',
        500
      );
      expect(result).toBe(mockErrorResponse);
    });

    test('should update order with all response data fields', async () => {
      const mockOrder = {
        validate: jest.fn().mockReturnValue([]),
        toJSON: jest.fn().mockReturnValue({ id: 'order123' })
      };

      const mockApiResponse = {
        isSuccess: jest.fn().mockReturnValue(true),
        getData: jest.fn().mockReturnValue({
          orderNumber: 'ORD-123456',
          orderId: 'order789',
          estimatedDeliveryTime: '45 minutes',
          trackingNumber: 'TRK-789'
        })
      };

      const mockSuccessResponse = {
        isSuccess: jest.fn().mockReturnValue(true)
      };

      Order.fromCartAndDelivery.mockReturnValue(mockOrder);
      CheckoutApiService.processCheckout.mockResolvedValue(mockApiResponse);
      ApiResponse.success.mockReturnValue(mockSuccessResponse);

      await CheckoutRepository.processCheckout(
        mockCartItems,
        mockDeliveryInfo,
        mockCustomerInfo
      );

      expect(mockOrder.orderNumber).toBe('ORD-123456');
      expect(mockOrder.id).toBe('order789');
      expect(mockOrder.status).toBe('confirmed');
      expect(mockOrder.estimatedDeliveryTime).toBe('45 minutes');
      expect(mockOrder.updatedAt).toBeDefined();
    });
  });
});
