import { useState, useEffect, useCallback } from 'react';
import { CartRepository } from '../../data/repositories/CartRepository';

/**
 * Cart ViewModel
 * Manages cart state and business logic using MVVM pattern
 */
export const useCartViewModel = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      const items = await CartRepository.getCart();
      setCartItems(items);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (item, quantity = 1, selectedSize = null, selectedOptions = []) => {
    try {
      setError(null); // Clear any previous errors
      const updatedCart = await CartRepository.addToCart(item, quantity, selectedSize, selectedOptions);
      setCartItems(updatedCart);
      return updatedCart;
    } catch (err) {
      console.error('Cart ViewModel - Add to cart error:', err);
      const errorMessage = err.message || 'Failed to add item to cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const removeFromCart = async (itemId) => {
    try {
      const updatedCart = await CartRepository.removeFromCart(itemId);
      setCartItems(updatedCart);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateCartItem = async (itemId, updates) => {
    try {
      const updatedCart = await CartRepository.updateCartItem(itemId, updates);
      setCartItems(updatedCart);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      await CartRepository.clearCart();
      setCartItems([]);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = typeof item.price === 'number' ? item.price : 0;
      const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
      return total + (price * quantity);
    }, 0);
  };

  useEffect(() => {
    loadCart();
  }, []);

  return {
    cartItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getTotal,
    refreshCart: loadCart
  };
};