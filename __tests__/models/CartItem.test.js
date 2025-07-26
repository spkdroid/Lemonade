import { CartItem } from '../../src/domain/models/CartItem';

describe('CartItem Model', () => {
  const mockMenuItem = {
    name: 'Classic Lemonade',
    price: 4.99,
    description: 'Fresh squeezed lemonade',
    image: 'https://example.com/lemonade.jpg'
  };

  describe('Constructor', () => {
    test('should create CartItem with default values', () => {
      const cartItem = new CartItem(mockMenuItem);
      
      expect(cartItem.name).toBe('Classic Lemonade');
      expect(cartItem.price).toBe(4.99);
      expect(cartItem.quantity).toBe(1);
      expect(cartItem.selectedSize).toBeNull();
      expect(cartItem.selectedOptions).toEqual([]);
      expect(cartItem.id).toBeDefined();
    });

    test('should create CartItem with custom values', () => {
      const cartItem = new CartItem(mockMenuItem, 2, 'Large', ['Extra Sugar']);
      
      expect(cartItem.quantity).toBe(2);
      expect(cartItem.selectedSize).toBe('Large');
      expect(cartItem.selectedOptions).toEqual(['Extra Sugar']);
    });

    test('should generate unique ID based on item and size', () => {
      const cartItem1 = new CartItem(mockMenuItem, 1, 'Medium');
      const cartItem2 = new CartItem(mockMenuItem, 1, 'Large');
      
      expect(cartItem1.id).not.toBe(cartItem2.id);
      expect(cartItem1.id).toContain('Medium');
      expect(cartItem2.id).toContain('Large');
    });
  });

  describe('Calculations', () => {
    test('should calculate total price correctly', () => {
      const cartItem = new CartItem(mockMenuItem, 3);
      expect(cartItem.getTotalPrice()).toBe(14.97); // 4.99 * 3
    });

    test('should handle zero quantity', () => {
      const cartItem = new CartItem(mockMenuItem, 0);
      expect(cartItem.getTotalPrice()).toBe(0);
    });

    test('should handle decimal quantities', () => {
      const cartItem = new CartItem(mockMenuItem, 2.5);
      expect(cartItem.getTotalPrice()).toBe(12.475);
    });
  });

  describe('Validation', () => {
    test('should validate valid cart item', () => {
      const cartItem = new CartItem(mockMenuItem, 2, 'Medium');
      const errors = cartItem.validate();
      expect(errors).toHaveLength(0);
    });

    test('should return error for invalid quantity', () => {
      const cartItem = new CartItem(mockMenuItem, -1);
      const errors = cartItem.validate();
      expect(errors).toContain('Quantity must be greater than 0');
    });

    test('should return error for missing item data', () => {
      const cartItem = new CartItem({}, 1);
      const errors = cartItem.validate();
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Update Methods', () => {
    test('should update quantity', () => {
      const cartItem = new CartItem(mockMenuItem, 1);
      cartItem.updateQuantity(5);
      expect(cartItem.quantity).toBe(5);
    });

    test('should update selected size', () => {
      const cartItem = new CartItem(mockMenuItem, 1, 'Medium');
      cartItem.updateSize('Large');
      expect(cartItem.selectedSize).toBe('Large');
    });

    test('should add options', () => {
      const cartItem = new CartItem(mockMenuItem, 1);
      cartItem.addOption('Extra Sugar');
      cartItem.addOption('Less Ice');
      expect(cartItem.selectedOptions).toEqual(['Extra Sugar', 'Less Ice']);
    });

    test('should remove options', () => {
      const cartItem = new CartItem(mockMenuItem, 1, null, ['Sugar', 'Ice', 'Lemon']);
      cartItem.removeOption('Ice');
      expect(cartItem.selectedOptions).toEqual(['Sugar', 'Lemon']);
    });
  });

  describe('Serialization', () => {
    test('should convert to JSON', () => {
      const cartItem = new CartItem(mockMenuItem, 2, 'Large', ['Extra Sugar']);
      const json = cartItem.toJSON();
      
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('name', 'Classic Lemonade');
      expect(json).toHaveProperty('price', 4.99);
      expect(json).toHaveProperty('quantity', 2);
      expect(json).toHaveProperty('selectedSize', 'Large');
      expect(json).toHaveProperty('selectedOptions', ['Extra Sugar']);
    });

    test('should create from JSON', () => {
      const jsonData = {
        id: 'test-id',
        name: 'Test Lemonade',
        price: 3.99,
        quantity: 1,
        selectedSize: 'Medium',
        selectedOptions: ['Option1']
      };
      
      const cartItem = CartItem.fromJSON(jsonData);
      expect(cartItem.id).toBe('test-id');
      expect(cartItem.name).toBe('Test Lemonade');
      expect(cartItem.price).toBe(3.99);
      expect(cartItem.quantity).toBe(1);
      expect(cartItem.selectedSize).toBe('Medium');
      expect(cartItem.selectedOptions).toEqual(['Option1']);
    });
  });
});
