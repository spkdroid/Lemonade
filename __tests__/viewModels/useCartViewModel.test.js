import { renderHook, act } from '@testing-library/react-native';
import { useCartViewModel } from '../../src/presentation/viewModels/useCartViewModel';
import { CartRepository } from '../../src/data/repositories/CartRepository';

// Mock the CartRepository
jest.mock('../../src/data/repositories/CartRepository', () => ({
  CartRepository: {
    getCart: jest.fn(),
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    updateCartItem: jest.fn(),
    clearCart: jest.fn(),
  },
}));

describe('useCartViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    test('should initialize with empty cart and loading state', () => {
      CartRepository.getCart.mockResolvedValue([]);
      
      const { result } = renderHook(() => useCartViewModel());
      
      expect(result.current.cartItems).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Loading Cart', () => {
    test('should load cart items successfully', async () => {
      const mockCartItems = [
        { id: '1', name: 'Lemonade', price: 4.99, quantity: 2 },
        { id: '2', name: 'Iced Tea', price: 3.99, quantity: 1 },
      ];
      
      CartRepository.getCart.mockResolvedValue(mockCartItems);
      
      const { result } = renderHook(() => useCartViewModel());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(result.current.cartItems).toEqual(mockCartItems);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    test('should handle cart loading error', async () => {
      const errorMessage = 'Failed to load cart';
      CartRepository.getCart.mockRejectedValue(new Error(errorMessage));
      
      const { result } = renderHook(() => useCartViewModel());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(result.current.cartItems).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('Adding to Cart', () => {
    test('should add item to cart successfully', async () => {
      const mockItem = { name: 'Lemonade', price: 4.99 };
      const updatedCart = [{ id: '1', name: 'Lemonade', price: 4.99, quantity: 1 }];
      
      CartRepository.getCart.mockResolvedValue([]);
      CartRepository.addToCart.mockResolvedValue(updatedCart);
      
      const { result } = renderHook(() => useCartViewModel());
      
      await act(async () => {
        await result.current.addToCart(mockItem, 1, 'Medium', []);
      });
      
      expect(CartRepository.addToCart).toHaveBeenCalledWith(mockItem, 1, 'Medium', []);
      expect(result.current.cartItems).toEqual(updatedCart);
    });

    test('should handle add to cart error', async () => {
      const mockItem = { name: 'Lemonade', price: 4.99 };
      const errorMessage = 'Failed to add to cart';
      
      CartRepository.getCart.mockResolvedValue([]);
      CartRepository.addToCart.mockRejectedValue(new Error(errorMessage));
      
      const { result } = renderHook(() => useCartViewModel());
      
      await act(async () => {
        try {
          await result.current.addToCart(mockItem);
        } catch (error) {
          expect(error.message).toBe(errorMessage);
        }
      });
      
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('Removing from Cart', () => {
    test('should remove item from cart successfully', async () => {
      const initialCart = [
        { id: '1', name: 'Lemonade', price: 4.99, quantity: 1 },
        { id: '2', name: 'Iced Tea', price: 3.99, quantity: 1 },
      ];
      const updatedCart = [{ id: '2', name: 'Iced Tea', price: 3.99, quantity: 1 }];
      
      CartRepository.getCart.mockResolvedValue(initialCart);
      CartRepository.removeFromCart.mockResolvedValue(updatedCart);
      
      const { result } = renderHook(() => useCartViewModel());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0)); // Wait for initial load
      });
      
      await act(async () => {
        await result.current.removeFromCart('1');
      });
      
      expect(CartRepository.removeFromCart).toHaveBeenCalledWith('1');
      expect(result.current.cartItems).toEqual(updatedCart);
    });
  });

  describe('Updating Cart Item', () => {
    test('should update cart item successfully', async () => {
      const initialCart = [{ id: '1', name: 'Lemonade', price: 4.99, quantity: 1 }];
      const updatedCart = [{ id: '1', name: 'Lemonade', price: 4.99, quantity: 3 }];
      
      CartRepository.getCart.mockResolvedValue(initialCart);
      CartRepository.updateCartItem.mockResolvedValue(updatedCart);
      
      const { result } = renderHook(() => useCartViewModel());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      await act(async () => {
        await result.current.updateCartItem('1', { quantity: 3 });
      });
      
      expect(CartRepository.updateCartItem).toHaveBeenCalledWith('1', { quantity: 3 });
      expect(result.current.cartItems).toEqual(updatedCart);
    });
  });

  describe('Clearing Cart', () => {
    test('should clear cart successfully', async () => {
      const initialCart = [
        { id: '1', name: 'Lemonade', price: 4.99, quantity: 1 },
        { id: '2', name: 'Iced Tea', price: 3.99, quantity: 1 },
      ];
      
      CartRepository.getCart.mockResolvedValue(initialCart);
      CartRepository.clearCart.mockResolvedValue();
      
      const { result } = renderHook(() => useCartViewModel());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      await act(async () => {
        await result.current.clearCart();
      });
      
      expect(CartRepository.clearCart).toHaveBeenCalled();
      expect(result.current.cartItems).toEqual([]);
    });
  });

  describe('Total Calculation', () => {
    test('should calculate total correctly', async () => {
      const mockCartItems = [
        { id: '1', name: 'Lemonade', price: 4.99, quantity: 2 },
        { id: '2', name: 'Iced Tea', price: 3.99, quantity: 1 },
      ];
      
      CartRepository.getCart.mockResolvedValue(mockCartItems);
      
      const { result } = renderHook(() => useCartViewModel());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      const total = result.current.getTotal();
      expect(total).toBe(13.97); // (4.99 * 2) + (3.99 * 1)
    });

    test('should return 0 for empty cart', async () => {
      CartRepository.getCart.mockResolvedValue([]);
      
      const { result } = renderHook(() => useCartViewModel());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      const total = result.current.getTotal();
      expect(total).toBe(0);
    });

    test('should handle invalid price/quantity values', async () => {
      const mockCartItems = [
        { id: '1', name: 'Lemonade', price: 'invalid', quantity: 2 },
        { id: '2', name: 'Iced Tea', price: 3.99, quantity: 'invalid' },
        { id: '3', name: 'Soda', price: 2.99, quantity: 1 },
      ];
      
      CartRepository.getCart.mockResolvedValue(mockCartItems);
      
      const { result } = renderHook(() => useCartViewModel());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      const total = result.current.getTotal();
      expect(total).toBe(2.99); // Only the valid item should contribute
    });
  });

  describe('Refresh Cart', () => {
    test('should refresh cart data', async () => {
      const initialCart = [{ id: '1', name: 'Lemonade', price: 4.99, quantity: 1 }];
      const updatedCart = [
        { id: '1', name: 'Lemonade', price: 4.99, quantity: 1 },
        { id: '2', name: 'Iced Tea', price: 3.99, quantity: 1 },
      ];
      
      CartRepository.getCart
        .mockResolvedValueOnce(initialCart)
        .mockResolvedValueOnce(updatedCart);
      
      const { result } = renderHook(() => useCartViewModel());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(result.current.cartItems).toEqual(initialCart);
      
      await act(async () => {
        await result.current.refreshCart();
      });
      
      expect(result.current.cartItems).toEqual(updatedCart);
    });
  });
});
