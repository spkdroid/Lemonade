import { useState, useEffect } from 'react';
import { CartRepository } from '../../data/repositories/CartRepository';

/**
 * Cart ViewModel
 * Manages cart state and business logic using MVVM pattern
 */
export const useCartViewModel = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCart = async () => {
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
  };

  const addToCart = async (item, quantity = 1, selectedSize = null, selectedOptions = []) => {
    try {
      const updatedCart = await CartRepository.addToCart(item, quantity, selectedSize, selectedOptions);
      setCartItems(updatedCart);
      return updatedCart;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

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
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
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