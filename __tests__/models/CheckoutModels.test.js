import { CheckoutRequest, CheckoutResponse } from '../../src/domain/models/CheckoutModels';

describe('CheckoutModels', () => {
  describe('CheckoutRequest', () => {
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
            quantity: 2,
            selectedSize: 'Medium',
            selectedOptions: ['Extra Ice'],
          },
          {
            id: 'item-2',
            name: 'Pink Lemonade',
            price: 4.99,
            quantity: 1,
            selectedSize: 'Large',
            selectedOptions: [],
          }
        ],
        subtotal: 12.97,
        tax: 1.30,
        deliveryFee: 2.99,
        discount: 0,
        total: 17.26,
        deliveryInfo: {
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'US',
          latitude: 37.7749,
          longitude: -122.4194
        },
        deliveryInstructions: 'Ring doorbell',
        paymentMethod: 'Credit Card',
        deliveryDate: '2025-07-26',
        deliveryTime: '2:00 PM',
        notes: 'Extra cold please',
        currency: 'USD',
        getFormattedPhone: () => '+1 (234) 567-890'
      };
    });

    it('should create CheckoutRequest with complete order data', () => {
      const checkoutRequest = new CheckoutRequest(mockOrder);

      expect(checkoutRequest.orderId).toBe('order-123');
      expect(checkoutRequest.customerInfo.name).toBe('John Doe');
      expect(checkoutRequest.customerInfo.phone).toBe('+1 (234) 567-890');
      expect(checkoutRequest.customerInfo.email).toBe('john@example.com');
    });

    it('should format items correctly', () => {
      const checkoutRequest = new CheckoutRequest(mockOrder);

      expect(checkoutRequest.items).toHaveLength(2);
      expect(checkoutRequest.items[0]).toEqual({
        id: 'item-1',
        name: 'Classic Lemonade',
        price: 3.99,
        quantity: 2,
        selectedSize: 'Medium',
        selectedOptions: ['Extra Ice'],
        total: 7.98
      });
      expect(checkoutRequest.items[1]).toEqual({
        id: 'item-2',
        name: 'Pink Lemonade',
        price: 4.99,
        quantity: 1,
        selectedSize: 'Large',
        selectedOptions: [],
        total: 4.99
      });
    });

    it('should include pricing information', () => {
      const checkoutRequest = new CheckoutRequest(mockOrder);

      expect(checkoutRequest.pricing).toEqual({
        subtotal: 12.97,
        tax: 1.30,
        deliveryFee: 2.99,
        discount: 0,
        total: 17.26
      });
    });

    it('should include delivery information', () => {
      const checkoutRequest = new CheckoutRequest(mockOrder);

      expect(checkoutRequest.deliveryInfo).toEqual({
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        country: 'US',
        latitude: 37.7749,
        longitude: -122.4194,
        instructions: 'Ring doorbell'
      });
    });

    it('should include order details', () => {
      const checkoutRequest = new CheckoutRequest(mockOrder);

      expect(checkoutRequest.orderDetails).toEqual({
        paymentMethod: 'Credit Card',
        requestedDeliveryDate: '2025-07-26',
        requestedDeliveryTime: '2:00 PM',
        notes: 'Extra cold please',
        currency: 'USD'
      });
    });

    it('should include metadata', () => {
      const checkoutRequest = new CheckoutRequest(mockOrder);

      expect(checkoutRequest.platform).toBe('mobile_app');
      expect(checkoutRequest.version).toBe('1.0');
      expect(checkoutRequest.timestamp).toBeDefined();
      expect(new Date(checkoutRequest.timestamp)).toBeInstanceOf(Date);
    });

    it('should handle missing customer info gracefully', () => {
      const orderWithoutCustomer = {
        ...mockOrder,
        customerName: undefined,
        customerPhone: undefined,
        customerEmail: undefined,
        getFormattedPhone: undefined
      };

      const checkoutRequest = new CheckoutRequest(orderWithoutCustomer);

      expect(checkoutRequest.customerInfo.name).toBe('');
      expect(checkoutRequest.customerInfo.phone).toBe('');
      expect(checkoutRequest.customerInfo.email).toBe('');
    });

    it('should handle missing items gracefully', () => {
      const orderWithoutItems = {
        ...mockOrder,
        items: undefined
      };

      const checkoutRequest = new CheckoutRequest(orderWithoutItems);
      expect(checkoutRequest.items).toEqual([]);
    });

    it('should handle incomplete items gracefully', () => {
      const orderWithIncompleteItems = {
        ...mockOrder,
        items: [
          {},
          {
            id: 'valid-item',
            name: 'Valid Item',
            price: 5.99,
            quantity: 1
          }
        ]
      };

      const checkoutRequest = new CheckoutRequest(orderWithIncompleteItems);

      expect(checkoutRequest.items).toHaveLength(2);
      expect(checkoutRequest.items[0]).toEqual({
        id: 'unknown',
        name: 'Unknown Item',
        price: 0,
        quantity: 1,
        selectedSize: null,
        selectedOptions: [],
        total: 0
      });
      expect(checkoutRequest.items[1]).toEqual({
        id: 'valid-item',
        name: 'Valid Item',
        price: 5.99,
        quantity: 1,
        selectedSize: null,
        selectedOptions: [],
        total: 5.99
      });
    });

    it('should handle missing delivery info gracefully', () => {
      const orderWithoutDelivery = {
        ...mockOrder,
        deliveryInfo: {}
      };

      const checkoutRequest = new CheckoutRequest(orderWithoutDelivery);

      expect(checkoutRequest.deliveryInfo).toEqual({
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US',
        latitude: null,
        longitude: null,
        instructions: ''
      });
    });
  });

  describe('CheckoutResponse', () => {
    let mockResponseData;

    beforeEach(() => {
      mockResponseData = {
        success: true,
        orderId: 'order-456',
        confirmationNumber: 'CONF-789',
        estimatedDeliveryTime: '45 minutes',
        message: 'Order placed successfully',
        paymentStatus: 'confirmed',
        totalCharged: 17.26,
        currency: 'USD'
      };
    });

    it('should create CheckoutResponse with success data', () => {
      const response = new CheckoutResponse(mockResponseData);

      expect(response.success).toBe(true);
      expect(response.orderId).toBe('order-456');
      expect(response.confirmationNumber).toBe('CONF-789');
      expect(response.estimatedDeliveryTime).toBe('45 minutes');
      expect(response.message).toBe('Order placed successfully');
    });

    it('should include payment information', () => {
      const response = new CheckoutResponse(mockResponseData);

      expect(response.payment).toEqual({
        status: 'confirmed',
        totalCharged: 17.26,
        currency: 'USD'
      });
    });

    it('should include timestamp', () => {
      const response = new CheckoutResponse(mockResponseData);

      expect(response.timestamp).toBeDefined();
      expect(new Date(response.timestamp)).toBeInstanceOf(Date);
    });

    it('should handle error response', () => {
      const errorData = {
        success: false,
        error: 'Payment failed',
        errorCode: 'PAYMENT_DECLINED'
      };

      const response = new CheckoutResponse(errorData);

      expect(response.success).toBe(false);
      expect(response.error).toBe('Payment failed');
      expect(response.errorCode).toBe('PAYMENT_DECLINED');
    });

    it('should handle missing data gracefully', () => {
      const response = new CheckoutResponse({});

      expect(response.success).toBe(false);
      expect(response.orderId).toBeNull();
      expect(response.confirmationNumber).toBeNull();
      expect(response.estimatedDeliveryTime).toBeNull();
      expect(response.message).toBe('');
    });

    it('should determine if order is successful', () => {
      const successResponse = new CheckoutResponse(mockResponseData);
      const failureResponse = new CheckoutResponse({ success: false });

      expect(successResponse.isSuccessful()).toBe(true);
      expect(failureResponse.isSuccessful()).toBe(false);
    });

    it('should get payment status', () => {
      const response = new CheckoutResponse(mockResponseData);
      expect(response.getPaymentStatus()).toBe('confirmed');

      const responseWithoutPayment = new CheckoutResponse({});
      expect(responseWithoutPayment.getPaymentStatus()).toBe('unknown');
    });

    it('should format response for display', () => {
      const response = new CheckoutResponse(mockResponseData);
      const formatted = response.getDisplayInfo();

      expect(formatted).toEqual({
        orderId: 'order-456',
        confirmationNumber: 'CONF-789',
        estimatedDelivery: '45 minutes',
        totalCharged: '$17.26',
        status: 'confirmed'
      });
    });
  });
});
