import { CartItem } from '../../../src/domain/models/CartItem';

describe('CartItem', () => {
  describe('constructor', () => {
    test('should create cart item with valid item and default quantity', () => {
      const item = {
        name: 'Lemonade',
        price: { small: 2.99, large: 4.99 },
        type: 'drink',
        image: 'lemonade.jpg'
      };

      const cartItem = new CartItem(item, 1, 'small');

      expect(cartItem.id).toBe('Lemonadesmall');
      expect(cartItem.name).toBe('Lemonade');
      expect(cartItem.type).toBe('drink');
      expect(cartItem.price).toBe(2.99);
      expect(cartItem.quantity).toBe(1);
      expect(cartItem.selectedSize).toBe('small');
    });

    test('should handle item with single price', () => {
      const item = {
        name: 'Simple Drink',
        price: 3.99,
        type: 'drink'
      };

      const cartItem = new CartItem(item, 2);

      expect(cartItem.name).toBe('Simple Drink');
      expect(cartItem.price).toBe(3.99);
      expect(cartItem.quantity).toBe(2);
    });

    test('should handle undefined item gracefully', () => {
      const cartItem = new CartItem(undefined, 1);

      expect(cartItem.name).toBe('Unknown Item');
      expect(cartItem.price).toBe(0);
      expect(cartItem.type).toBe('unknown');
      expect(cartItem.quantity).toBe(1);
    });

    test('should handle invalid item gracefully', () => {
      const cartItem = new CartItem(null, 1);

      expect(cartItem.name).toBe('Unknown Item');
      expect(cartItem.price).toBe(0);
      expect(cartItem.type).toBe('unknown');
    });

    test('should use first price when size not specified', () => {
      const item = {
        name: 'Multi-size Drink',
        price: { small: 2.99, medium: 3.99, large: 4.99 }
      };

      const cartItem = new CartItem(item, 1);

      expect(cartItem.price).toBe(2.99); // First price in object
    });

    test('should calculate total price correctly', () => {
      const item = {
        name: 'Expensive Drink',
        price: 5.99
      };

      const cartItem = new CartItem(item, 3);

      expect(cartItem.price * cartItem.quantity).toBe(17.97);
    });
  });
});
