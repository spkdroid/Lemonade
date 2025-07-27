import { CartRepository } from '../../../src/data/repositories/CartRepository';
import { CartItem } from '../../../src/domain/models/CartItem';

// Mock the storage service
const mockStorageService = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};

describe('CartRepository', () => {
  let cartRepository;

  beforeEach(() => {
    cartRepository = new CartRepository(mockStorageService);
    jest.clearAllMocks();
  });

  describe('getCartItems', () => {
    test('should return empty array when no cart data exists', async () => {
      mockStorageService.getItem.mockResolvedValue(null);

      const result = await cartRepository.getCartItems();

      expect(result).toEqual([]);
      expect(mockStorageService.getItem).toHaveBeenCalledWith('@cart_data');
    });

    test('should return parsed cart items when data exists', async () => {
      const mockCartData = JSON.stringify([
        { id: 'item1', name: 'Lemonade', quantity: 2 }
      ]);
      mockStorageService.getItem.mockResolvedValue(mockCartData);

      const result = await cartRepository.getCartItems();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Lemonade');
    });

    test('should handle storage errors gracefully', async () => {
      mockStorageService.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await cartRepository.getCartItems();

      expect(result).toEqual([]);
    });
  });

  describe('addToCart', () => {
    test('should add new item to empty cart', async () => {
      mockStorageService.getItem.mockResolvedValue(null);
      mockStorageService.setItem.mockResolvedValue();

      const item = {
        name: 'Lemonade',
        price: 2.99,
        type: 'drink'
      };

      const result = await cartRepository.addToCart(item, 1, 'small');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Lemonade');
      expect(result[0].quantity).toBe(1);
      expect(mockStorageService.setItem).toHaveBeenCalled();
    });

    test('should update quantity for existing item', async () => {
      const existingCart = [
        { id: 'Lemonadesmall', name: 'Lemonade', quantity: 1 }
      ];
      mockStorageService.getItem.mockResolvedValue(JSON.stringify(existingCart));
      mockStorageService.setItem.mockResolvedValue();

      const item = {
        name: 'Lemonade',
        price: 2.99,
        type: 'drink'
      };

      const result = await cartRepository.addToCart(item, 2, 'small');

      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(3); // 1 + 2
    });

    test('should handle storage errors', async () => {
      mockStorageService.getItem.mockResolvedValue('[]');
      mockStorageService.setItem.mockRejectedValue(new Error('Storage error'));

      const item = { name: 'Test', price: 1.99 };

      await expect(cartRepository.addToCart(item, 1)).rejects.toThrow('Storage error');
    });
  });

  describe('removeFromCart', () => {
    test('should remove item from cart', async () => {
      const existingCart = [
        { id: 'item1', name: 'Lemonade' },
        { id: 'item2', name: 'Juice' }
      ];
      mockStorageService.getItem.mockResolvedValue(JSON.stringify(existingCart));
      mockStorageService.setItem.mockResolvedValue();

      const result = await cartRepository.removeFromCart('item1');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Juice');
    });
  });

  describe('clearCart', () => {
    test('should clear all items from cart', async () => {
      mockStorageService.setItem.mockResolvedValue();

      const result = await cartRepository.clearCart();

      expect(result).toBe(true);
      expect(mockStorageService.setItem).toHaveBeenCalledWith('@cart_data', '[]');
    });
  });

  describe('operation queue', () => {
    test('should handle concurrent operations', async () => {
      mockStorageService.getItem.mockResolvedValue('[]');
      mockStorageService.setItem.mockResolvedValue();

      const item1 = { name: 'Item1', price: 1.99 };
      const item2 = { name: 'Item2', price: 2.99 };

      // Start two operations simultaneously
      const promise1 = cartRepository.addToCart(item1, 1);
      const promise2 = cartRepository.addToCart(item2, 1);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Both operations should complete successfully
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });
  });
});
