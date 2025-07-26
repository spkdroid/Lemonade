import { Order } from '../../src/domain/models/Order';

describe('Order', () => {
  describe('constructor', () => {
    it('should create order with default values', () => {
      const order = new Order();

      expect(order.id).toBeNull();
      expect(order.orderNumber).toBeNull();
      expect(order.customerId).toBeNull();
      expect(order.customerName).toBe('');
      expect(order.customerPhone).toBe('');
      expect(order.customerEmail).toBe('');
      expect(order.items).toEqual([]);
      expect(order.subtotal).toBe(0);
      expect(order.tax).toBe(0);
      expect(order.deliveryFee).toBe(0);
      expect(order.discount).toBe(0);
      expect(order.total).toBe(0);
      expect(order.status).toBe('pending');
      expect(order.paymentStatus).toBe('pending');
      expect(order.paymentMethod).toBe('cash_on_delivery');
      expect(order.currency).toBe('USD');
    });

    it('should create order with provided data', () => {
      const orderData = {
        id: 'order-123',
        orderNumber: 'ORD-001',
        customerId: 'customer-456',
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        customerEmail: 'john@example.com',
        items: [
          { id: 'item-1', name: 'Lemonade', price: 3.99, quantity: 2 }
        ],
        subtotal: 7.98,
        tax: 0.80,
        deliveryFee: 2.99,
        discount: 1.00,
        total: 10.77,
        deliveryInfo: {
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA'
        },
        deliveryDate: '2025-07-26',
        deliveryTime: '2:00 PM',
        deliveryInstructions: 'Ring doorbell',
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'credit_card',
        notes: 'Extra cold',
        currency: 'USD'
      };

      const order = new Order(orderData);

      expect(order.id).toBe('order-123');
      expect(order.orderNumber).toBe('ORD-001');
      expect(order.customerName).toBe('John Doe');
      expect(order.customerPhone).toBe('+1234567890');
      expect(order.items).toHaveLength(1);
      expect(order.subtotal).toBe(7.98);
      expect(order.total).toBe(10.77);
      expect(order.status).toBe('confirmed');
      expect(order.paymentMethod).toBe('credit_card');
    });

    it('should handle order_number field mapping', () => {
      const orderData = {
        order_number: 'ORD-002'
      };

      const order = new Order(orderData);
      expect(order.orderNumber).toBe('ORD-002');
    });
  });

  describe('calculateSubtotal', () => {
    it('should calculate subtotal correctly', () => {
      const order = new Order({
        items: [
          { id: '1', name: 'Item 1', price: 3.99, quantity: 2 },
          { id: '2', name: 'Item 2', price: 5.50, quantity: 1 },
          { id: '3', name: 'Item 3', price: 2.25, quantity: 3 }
        ]
      });

      const subtotal = order.calculateSubtotal();

      expect(subtotal).toBe(21.23); // (3.99*2) + (5.50*1) + (2.25*3)
      expect(order.subtotal).toBe(21.23);
    });

    it('should return 0 for empty items', () => {
      const order = new Order({ items: [] });

      const subtotal = order.calculateSubtotal();

      expect(subtotal).toBe(0);
      expect(order.subtotal).toBe(0);
    });

    it('should handle items with zero price', () => {
      const order = new Order({
        items: [
          { id: '1', name: 'Free Item', price: 0, quantity: 1 },
          { id: '2', name: 'Paid Item', price: 3.99, quantity: 1 }
        ]
      });

      const subtotal = order.calculateSubtotal();

      expect(subtotal).toBe(3.99);
    });
  });

  describe('calculateTax', () => {
    it('should calculate tax with default rate', () => {
      const order = new Order({ subtotal: 10.00 });

      const tax = order.calculateTax();

      expect(tax).toBe(0.80); // 10.00 * 0.08
      expect(order.tax).toBe(0.80);
    });

    it('should calculate tax with custom rate', () => {
      const order = new Order({ subtotal: 20.00 });

      const tax = order.calculateTax(0.10);

      expect(tax).toBe(2.00); // 20.00 * 0.10
      expect(order.tax).toBe(2.00);
    });

    it('should handle zero subtotal', () => {
      const order = new Order({ subtotal: 0 });

      const tax = order.calculateTax();

      expect(tax).toBe(0);
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total correctly', () => {
      const order = new Order({
        subtotal: 10.00,
        tax: 0.80,
        deliveryFee: 2.99,
        discount: 1.50
      });

      const total = order.calculateTotal();

      expect(total).toBe(12.29); // 10.00 + 0.80 + 2.99 - 1.50
      expect(order.total).toBe(12.29);
    });

    it('should handle zero values', () => {
      const order = new Order({
        subtotal: 5.00,
        tax: 0,
        deliveryFee: 0,
        discount: 0
      });

      const total = order.calculateTotal();

      expect(total).toBe(5.00);
    });

    it('should handle negative totals', () => {
      const order = new Order({
        subtotal: 5.00,
        tax: 0.40,
        deliveryFee: 1.00,
        discount: 10.00
      });

      const total = order.calculateTotal();

      expect(total).toBe(-3.60);
    });
  });

  describe('getFormattedPhone', () => {
    it('should format US phone number', () => {
      const order = new Order({ customerPhone: '+1234567890' });

      const formatted = order.getFormattedPhone();

      expect(formatted).toBe('+1 (234) 567-890');
    });

    it('should return original for invalid phone', () => {
      const order = new Order({ customerPhone: 'invalid' });

      const formatted = order.getFormattedPhone();

      expect(formatted).toBe('invalid');
    });

    it('should handle empty phone', () => {
      const order = new Order({ customerPhone: '' });

      const formatted = order.getFormattedPhone();

      expect(formatted).toBe('');
    });
  });

  describe('isValidOrder', () => {
    it('should return true for valid order', () => {
      const order = new Order({
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        items: [{ id: '1', name: 'Item', price: 3.99, quantity: 1 }],
        deliveryInfo: {
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA'
        }
      });

      expect(order.isValidOrder()).toBe(true);
    });

    it('should return false for missing customer name', () => {
      const order = new Order({
        customerPhone: '+1234567890',
        items: [{ id: '1', name: 'Item', price: 3.99, quantity: 1 }]
      });

      expect(order.isValidOrder()).toBe(false);
    });

    it('should return false for empty items', () => {
      const order = new Order({
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        items: []
      });

      expect(order.isValidOrder()).toBe(false);
    });

    it('should return false for missing delivery info', () => {
      const order = new Order({
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        items: [{ id: '1', name: 'Item', price: 3.99, quantity: 1 }],
        deliveryInfo: {}
      });

      expect(order.isValidOrder()).toBe(false);
    });
  });

  describe('addItem', () => {
    it('should add new item to order', () => {
      const order = new Order();
      const item = { id: '1', name: 'Lemonade', price: 3.99, quantity: 1 };

      order.addItem(item);

      expect(order.items).toHaveLength(1);
      expect(order.items[0]).toEqual(item);
    });

    it('should update quantity for existing item', () => {
      const order = new Order({
        items: [{ id: '1', name: 'Lemonade', price: 3.99, quantity: 1 }]
      });
      const newItem = { id: '1', name: 'Lemonade', price: 3.99, quantity: 2 };

      order.addItem(newItem);

      expect(order.items).toHaveLength(1);
      expect(order.items[0].quantity).toBe(3);
    });
  });

  describe('removeItem', () => {
    it('should remove item from order', () => {
      const order = new Order({
        items: [
          { id: '1', name: 'Item 1', price: 3.99, quantity: 1 },
          { id: '2', name: 'Item 2', price: 5.99, quantity: 1 }
        ]
      });

      order.removeItem('1');

      expect(order.items).toHaveLength(1);
      expect(order.items[0].id).toBe('2');
    });

    it('should do nothing for non-existent item', () => {
      const order = new Order({
        items: [{ id: '1', name: 'Item 1', price: 3.99, quantity: 1 }]
      });

      order.removeItem('2');

      expect(order.items).toHaveLength(1);
    });
  });

  describe('updateStatus', () => {
    it('should update order status', () => {
      const order = new Order({ status: 'pending' });

      order.updateStatus('confirmed');

      expect(order.status).toBe('confirmed');
      expect(order.updatedAt).toBeDefined();
    });

    it('should update timestamp', () => {
      const order = new Order();
      const originalTime = order.updatedAt;

      // Wait a moment to ensure timestamp difference
      setTimeout(() => {
        order.updateStatus('processing');
        expect(order.updatedAt).not.toBe(originalTime);
      }, 1);
    });
  });

  describe('getOrderSummary', () => {
    it('should return order summary', () => {
      const order = new Order({
        id: 'order-123',
        orderNumber: 'ORD-001',
        customerName: 'John Doe',
        items: [
          { id: '1', name: 'Lemonade', price: 3.99, quantity: 2 }
        ],
        total: 8.98,
        status: 'confirmed'
      });

      const summary = order.getOrderSummary();

      expect(summary).toEqual({
        orderId: 'order-123',
        orderNumber: 'ORD-001',
        customerName: 'John Doe',
        itemCount: 1,
        totalItems: 2,
        total: 8.98,
        status: 'confirmed',
        currency: 'USD'
      });
    });
  });
});
