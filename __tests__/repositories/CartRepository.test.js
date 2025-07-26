import { CartRepository } from '../../src/data/repositories/CartRepository';
import { STORAGE_KEYS } from '../../src/shared/constants/AppConstants';

// Mock AsyncStorage
const mockStorageService = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

// Mock StorageService import
jest.mock('../../src/infrastructure/storage/StorageService', () => ({
  StorageService: mockStorageService,
}));

describe('CartRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    test('should return empty array when no cart data exists', async () => {
      mockStorageService.getItem.mockResolvedValue(null);
      
      const result = await CartRepository.getCart();
      
      expect(mockStorageService.getItem).toHaveBeenCalledWith(STORAGE_KEYS.CART_DATA);
      expect(result).toEqual([]);
    });

    test('should return parsed cart data when it exists', async () => {
      const mockCartData = [
        { id: '1', name: 'Lemonade', price: 4.99, quantity: 2 },
        { id: '2', name: 'Iced Tea', price: 3.99, quantity: 1 },
      ];
      
      mockStorageService.getItem.mockResolvedValue(JSON.stringify(mockCartData));
      
      const result = await CartRepository.getCart();
      
      expect(result).toEqual(mockCartData);
    });

    test('should handle invalid JSON and return empty array', async () => {
      mockStorageService.getItem.mockResolvedValue('invalid json');
      
      const result = await CartRepository.getCart();
      
      expect(result).toEqual([]);
    });

    test('should handle storage errors', async () => {
      mockStorageService.getItem.mockRejectedValue(new Error('Storage error'));
      
      const result = await CartRepository.getCart();
      
      expect(result).toEqual([]);
    });
  });

  describe('addToCart', () => {
    test('should add new item to empty cart', async () => {
      const mockItem = { name: 'Lemonade', price: 4.99 };
      const expectedCartItem = {
        id: 'Lemonade',
        name: 'Lemonade',
        price: 4.99,
        quantity: 1,
        selectedSize: null,
        selectedOptions: [],
      };
      
      mockStorageService.getItem.mockResolvedValue(null);
      mockStorageService.setItem.mockResolvedValue();
      
      const result = await CartRepository.addToCart(mockItem, 1, null, []);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject(expectedCartItem);
      expect(mockStorageService.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.CART_DATA,
        JSON.stringify(result)
      );
    });

    test('should increment quantity for existing item', async () => {
      const existingCart = [
        { id: 'Lemonade', name: 'Lemonade', price: 4.99, quantity: 1 },
      ];
      const mockItem = { name: 'Lemonade', price: 4.99 };
      
      mockStorageService.getItem.mockResolvedValue(JSON.stringify(existingCart));
      mockStorageService.setItem.mockResolvedValue();
      
      const result = await CartRepository.addToCart(mockItem, 2);
      
      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(3); // 1 + 2
    });

    test('should create different items for different sizes', async () => {
      const existingCart = [
        { id: 'LemonadeSmall', name: 'Lemonade', price: 4.99, quantity: 1, selectedSize: 'Small' },
      ];
      const mockItem = { name: 'Lemonade', price: 4.99 };
      
      mockStorageService.getItem.mockResolvedValue(JSON.stringify(existingCart));
      mockStorageService.setItem.mockResolvedValue();
      
      const result = await CartRepository.addToCart(mockItem, 1, 'Large');
      
      expect(result).toHaveLength(2);
      expect(result.find(item => item.selectedSize === 'Small')).toBeDefined();
      expect(result.find(item => item.selectedSize === 'Large')).toBeDefined();
    });
  });

  describe('removeFromCart', () => {
    test('should remove item from cart', async () => {
      const existingCart = [
        { id: '1', name: 'Lemonade', price: 4.99, quantity: 1 },
        { id: '2', name: 'Iced Tea', price: 3.99, quantity: 1 },
      ];
      
      mockStorageService.getItem.mockResolvedValue(JSON.stringify(existingCart));
      mockStorageService.setItem.mockResolvedValue();
      
      const result = await CartRepository.removeFromCart('1');
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
      expect(mockStorageService.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.CART_DATA,
        JSON.stringify(result)
      );
    });

    test('should handle removing non-existent item', async () => {
      const existingCart = [
        { id: '1', name: 'Lemonade', price: 4.99, quantity: 1 },
      ];
      
      mockStorageService.getItem.mockResolvedValue(JSON.stringify(existingCart));
      mockStorageService.setItem.mockResolvedValue();
      
      const result = await CartRepository.removeFromCart('non-existent');
      
      expect(result).toEqual(existingCart);
    });
  });

  describe('updateCartItem', () => {
    test('should update existing cart item', async () => {
      const existingCart = [
        { id: '1', name: 'Lemonade', price: 4.99, quantity: 1 },
      ];
      
      mockStorageService.getItem.mockResolvedValue(JSON.stringify(existingCart));
      mockStorageService.setItem.mockResolvedValue();
      
      const result = await CartRepository.updateCartItem('1', { quantity: 5 });
      
      expect(result[0].quantity).toBe(5);
      expect(mockStorageService.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.CART_DATA,
        JSON.stringify(result)
      );
    });

    test('should handle updating non-existent item', async () => {
      const existingCart = [
        { id: '1', name: 'Lemonade', price: 4.99, quantity: 1 },
      ];
      
      mockStorageService.getItem.mockResolvedValue(JSON.stringify(existingCart));
      mockStorageService.setItem.mockResolvedValue();
      
      const result = await CartRepository.updateCartItem('non-existent', { quantity: 5 });
      
      expect(result).toEqual(existingCart);
    });
  });

  describe('clearCart', () => {
    test('should clear all items from cart', async () => {
      mockStorageService.setItem.mockResolvedValue();
      
      const result = await CartRepository.clearCart();
      
      expect(result).toEqual([]);
      expect(mockStorageService.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.CART_DATA,
        JSON.stringify([])
      );
    });

    test('should handle storage errors', async () => {
      mockStorageService.setItem.mockRejectedValue(new Error('Storage error'));
      
      await expect(CartRepository.clearCart()).rejects.toThrow('Storage error');
    });
  });
});
