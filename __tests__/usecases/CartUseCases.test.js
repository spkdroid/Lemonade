import { CartUseCases } from '../../src/domain/usecases/CartUseCases';
import { CartRepository } from '../../src/data/repositories/CartRepository';
import { CartItem } from '../../src/domain/models/CartItem';

// Mock the repository
jest.mock('../../src/data/repositories/CartRepository', () => ({
  CartRepository: {
    getCartItems: jest.fn(),
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    updateCartItem: jest.fn(),
    clearCart: jest.fn(),
    getCartTotal: jest.fn(),
    getCartCount: jest.fn()
  }
}));

describe('CartUseCases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.__DEV__ = false;
  });

  describe('addItemToCart', () => {
    const mockMenuItem = {
      id: 'item-1',
      name: 'Classic Lemonade',
      price: 3.99,
      description: 'Fresh lemonade',
      image: 'lemonade.jpg'
    };

    it('should add new item to cart', async () => {
      CartRepository.getCartItems.mockResolvedValue([]);
      CartRepository.addToCart.mockResolvedValue();

      await CartUseCases.addItemToCart(mockMenuItem, 2, 'Large', ['Extra Ice']);

      expect(CartRepository.addToCart).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'item-1',
          name: 'Classic Lemonade',
          price: 3.99,
          quantity: 2,
          selectedSize: 'Large',
          selectedOptions: ['Extra Ice']
        })
      );
    });

    it('should update existing item in cart', async () => {
      const existingItem = new CartItem(mockMenuItem, 1, 'Medium', []);
      CartRepository.getCartItems.mockResolvedValue([existingItem]);
      CartRepository.updateCartItem.mockResolvedValue();

      await CartUseCases.addItemToCart(mockMenuItem, 1, 'Medium', []);

      expect(CartRepository.updateCartItem).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity: 2 // 1 + 1
        })
      );
    });

    it('should handle different sizes as separate items', async () => {
      const existingItem = new CartItem(mockMenuItem, 1, 'Medium', []);
      CartRepository.getCartItems.mockResolvedValue([existingItem]);
      CartRepository.addToCart.mockResolvedValue();

      await CartUseCases.addItemToCart(mockMenuItem, 1, 'Large', []);

      expect(CartRepository.addToCart).toHaveBeenCalled(); // New item
      expect(CartRepository.updateCartItem).not.toHaveBeenCalled();
    });

    it('should handle different options as separate items', async () => {
      const existingItem = new CartItem(mockMenuItem, 1, 'Medium', ['Extra Ice']);
      CartRepository.getCartItems.mockResolvedValue([existingItem]);
      CartRepository.addToCart.mockResolvedValue();

      await CartUseCases.addItemToCart(mockMenuItem, 1, 'Medium', ['Sugar']);

      expect(CartRepository.addToCart).toHaveBeenCalled(); // New item
    });

    it('should validate quantity is positive', async () => {
      await expect(CartUseCases.addItemToCart(mockMenuItem, 0))
        .rejects.toThrow('Quantity must be greater than 0');

      await expect(CartUseCases.addItemToCart(mockMenuItem, -1))
        .rejects.toThrow('Quantity must be greater than 0');
    });

    it('should validate menu item is provided', async () => {
      await expect(CartUseCases.addItemToCart(null, 1))
        .rejects.toThrow('Menu item is required');

      await expect(CartUseCases.addItemToCart(undefined, 1))
        .rejects.toThrow('Menu item is required');
    });

    it('should handle repository errors', async () => {
      CartRepository.getCartItems.mockRejectedValue(new Error('Storage Error'));

      await expect(CartUseCases.addItemToCart(mockMenuItem, 1))
        .rejects.toThrow('Failed to add item to cart: Storage Error');
    });
  });

  describe('removeItemFromCart', () => {
    it('should remove item from cart', async () => {
      CartRepository.removeFromCart.mockResolvedValue();

      await CartUseCases.removeItemFromCart('cart-item-1');

      expect(CartRepository.removeFromCart).toHaveBeenCalledWith('cart-item-1');
    });

    it('should validate cart item ID', async () => {
      await expect(CartUseCases.removeItemFromCart(''))
        .rejects.toThrow('Cart item ID is required');

      await expect(CartUseCases.removeItemFromCart(null))
        .rejects.toThrow('Cart item ID is required');
    });

    it('should handle repository errors', async () => {
      CartRepository.removeFromCart.mockRejectedValue(new Error('Storage Error'));

      await expect(CartUseCases.removeItemFromCart('cart-item-1'))
        .rejects.toThrow('Failed to remove item from cart: Storage Error');
    });
  });

  describe('updateCartItemQuantity', () => {
    it('should update item quantity', async () => {
      const mockCartItem = new CartItem(
        { id: 'item-1', name: 'Lemonade', price: 3.99 },
        2,
        'Medium',
        []
      );

      CartRepository.getCartItems.mockResolvedValue([mockCartItem]);
      CartRepository.updateCartItem.mockResolvedValue();

      await CartUseCases.updateCartItemQuantity('cart-item-1', 5);

      expect(CartRepository.updateCartItem).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity: 5
        })
      );
    });

    it('should remove item when quantity is 0', async () => {
      const mockCartItem = new CartItem(
        { id: 'item-1', name: 'Lemonade', price: 3.99 },
        2,
        'Medium',
        []
      );

      CartRepository.getCartItems.mockResolvedValue([mockCartItem]);
      CartRepository.removeFromCart.mockResolvedValue();

      await CartUseCases.updateCartItemQuantity('cart-item-1', 0);

      expect(CartRepository.removeFromCart).toHaveBeenCalledWith('cart-item-1');
      expect(CartRepository.updateCartItem).not.toHaveBeenCalled();
    });

    it('should validate quantity is not negative', async () => {
      await expect(CartUseCases.updateCartItemQuantity('cart-item-1', -1))
        .rejects.toThrow('Quantity cannot be negative');
    });

    it('should handle non-existent cart item', async () => {
      CartRepository.getCartItems.mockResolvedValue([]);

      await expect(CartUseCases.updateCartItemQuantity('non-existent', 5))
        .rejects.toThrow('Cart item not found');
    });
  });

  describe('getCartSummary', () => {
    it('should return cart summary', async () => {
      const mockCartItems = [
        new CartItem(
          { id: 'item-1', name: 'Lemonade', price: 3.99 },
          2,
          'Medium',
          []
        ),
        new CartItem(
          { id: 'item-2', name: 'Iced Tea', price: 2.99 },
          1,
          'Large',
          ['Sugar']
        )
      ];

      CartRepository.getCartItems.mockResolvedValue(mockCartItems);

      const summary = await CartUseCases.getCartSummary();

      expect(summary).toEqual({
        items: mockCartItems,
        itemCount: 2,
        totalQuantity: 3,
        subtotal: 10.97, // (3.99 * 2) + (2.99 * 1)
        hasItems: true
      });
    });

    it('should return empty cart summary', async () => {
      CartRepository.getCartItems.mockResolvedValue([]);

      const summary = await CartUseCases.getCartSummary();

      expect(summary).toEqual({
        items: [],
        itemCount: 0,
        totalQuantity: 0,
        subtotal: 0,
        hasItems: false
      });
    });

    it('should handle repository errors', async () => {
      CartRepository.getCartItems.mockRejectedValue(new Error('Storage Error'));

      await expect(CartUseCases.getCartSummary())
        .rejects.toThrow('Failed to get cart summary: Storage Error');
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      CartRepository.clearCart.mockResolvedValue();

      await CartUseCases.clearCart();

      expect(CartRepository.clearCart).toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      CartRepository.clearCart.mockRejectedValue(new Error('Storage Error'));

      await expect(CartUseCases.clearCart())
        .rejects.toThrow('Failed to clear cart: Storage Error');
    });
  });

  describe('validateCartForCheckout', () => {
    it('should validate cart with items', async () => {
      const mockCartItems = [
        new CartItem(
          { id: 'item-1', name: 'Lemonade', price: 3.99 },
          1,
          'Medium',
          []
        )
      ];

      CartRepository.getCartItems.mockResolvedValue(mockCartItems);

      const result = await CartUseCases.validateCartForCheckout();

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject empty cart', async () => {
      CartRepository.getCartItems.mockResolvedValue([]);

      const result = await CartUseCases.validateCartForCheckout();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cart is empty');
    });

    it('should validate item availability', async () => {
      const mockCartItems = [
        new CartItem(
          { id: 'item-1', name: 'Lemonade', price: 3.99, available: false },
          1,
          'Medium',
          []
        ),
        new CartItem(
          { id: 'item-2', name: 'Tea', price: 2.99, available: true },
          1,
          'Large',
          []
        )
      ];

      CartRepository.getCartItems.mockResolvedValue(mockCartItems);

      const result = await CartUseCases.validateCartForCheckout();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Some items in your cart are no longer available');
    });

    it('should validate minimum order amount', async () => {
      const mockCartItems = [
        new CartItem(
          { id: 'item-1', name: 'Cheap Item', price: 0.50 },
          1,
          'Small',
          []
        )
      ];

      CartRepository.getCartItems.mockResolvedValue(mockCartItems);

      const result = await CartUseCases.validateCartForCheckout(5.00); // Minimum $5

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Minimum order amount is $5.00');
    });

    it('should validate maximum quantity per item', async () => {
      const mockCartItems = [
        new CartItem(
          { id: 'item-1', name: 'Lemonade', price: 3.99 },
          15, // Over limit
          'Medium',
          []
        )
      ];

      CartRepository.getCartItems.mockResolvedValue(mockCartItems);

      const result = await CartUseCases.validateCartForCheckout(0, 10); // Max 10 per item

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Maximum quantity per item is 10');
    });
  });

  describe('calculateCartTotals', () => {
    it('should calculate totals with tax and delivery', async () => {
      const mockCartItems = [
        new CartItem(
          { id: 'item-1', name: 'Lemonade', price: 3.99 },
          2,
          'Medium',
          []
        )
      ];

      CartRepository.getCartItems.mockResolvedValue(mockCartItems);

      const totals = await CartUseCases.calculateCartTotals(0.08, 2.99, 1.00);

      expect(totals).toEqual({
        subtotal: 7.98,
        tax: 0.64, // 7.98 * 0.08
        deliveryFee: 2.99,
        discount: 1.00,
        total: 10.61 // 7.98 + 0.64 + 2.99 - 1.00
      });
    });

    it('should handle empty cart', async () => {
      CartRepository.getCartItems.mockResolvedValue([]);

      const totals = await CartUseCases.calculateCartTotals(0.08, 2.99);

      expect(totals).toEqual({
        subtotal: 0,
        tax: 0,
        deliveryFee: 2.99,
        discount: 0,
        total: 2.99
      });
    });

    it('should handle zero tax and delivery', async () => {
      const mockCartItems = [
        new CartItem(
          { id: 'item-1', name: 'Lemonade', price: 5.00 },
          1,
          'Medium',
          []
        )
      ];

      CartRepository.getCartItems.mockResolvedValue(mockCartItems);

      const totals = await CartUseCases.calculateCartTotals(0, 0);

      expect(totals).toEqual({
        subtotal: 5.00,
        tax: 0,
        deliveryFee: 0,
        discount: 0,
        total: 5.00
      });
    });
  });

  describe('optimizeCart', () => {
    it('should merge similar items', async () => {
      const mockCartItems = [
        new CartItem(
          { id: 'item-1', name: 'Lemonade', price: 3.99 },
          1,
          'Medium',
          ['Extra Ice']
        ),
        new CartItem(
          { id: 'item-1', name: 'Lemonade', price: 3.99 },
          2,
          'Medium',
          ['Extra Ice']
        )
      ];

      CartRepository.getCartItems.mockResolvedValue(mockCartItems);
      CartRepository.updateCartItem.mockResolvedValue();
      CartRepository.removeFromCart.mockResolvedValue();

      await CartUseCases.optimizeCart();

      expect(CartRepository.updateCartItem).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity: 3 // 1 + 2
        })
      );
      expect(CartRepository.removeFromCart).toHaveBeenCalledTimes(1);
    });

    it('should remove zero quantity items', async () => {
      const mockCartItems = [
        new CartItem(
          { id: 'item-1', name: 'Lemonade', price: 3.99 },
          0, // Zero quantity
          'Medium',
          []
        ),
        new CartItem(
          { id: 'item-2', name: 'Tea', price: 2.99 },
          1,
          'Large',
          []
        )
      ];

      CartRepository.getCartItems.mockResolvedValue(mockCartItems);
      CartRepository.removeFromCart.mockResolvedValue();

      await CartUseCases.optimizeCart();

      expect(CartRepository.removeFromCart).toHaveBeenCalledWith(
        expect.stringContaining('item-1')
      );
    });

    it('should handle empty cart', async () => {
      CartRepository.getCartItems.mockResolvedValue([]);

      await expect(CartUseCases.optimizeCart()).resolves.toBeUndefined();
    });
  });
});
