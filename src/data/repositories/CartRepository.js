import { CartItem } from '../../domain/models/CartItem';
import { STORAGE_KEYS } from '../../shared/constants/AppConstants';

export class CartRepository {
  constructor(storageService) {
    this.storageService = storageService;
  }

  async getCartItems() {
    try {
      const jsonValue = await this.storageService.getItem(STORAGE_KEYS.CART_DATA);
      return jsonValue ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Error getting cart:', e);
      return [];
    }
  }

  async addToCart(item, quantity = 1, selectedSize = null, selectedOptions = []) {
    try {
      console.log('CartRepository.addToCart called with:', {
        item: item,
        quantity: quantity,
        selectedSize: selectedSize,
        selectedOptions: selectedOptions
      });
      
      const currentCart = await this.getCartItems();
      console.log('Current cart:', currentCart);
      
      const existingItemIndex = currentCart.findIndex(cartItem => 
        cartItem.id === item.name + (selectedSize || '')
      );

      if (existingItemIndex >= 0) {
        currentCart[existingItemIndex].quantity += quantity;
        console.log('Updated existing item quantity');
      } else {
        const newCartItem = new CartItem(item, quantity, selectedSize, selectedOptions);
        console.log('Created new cart item:', newCartItem);
        currentCart.push(newCartItem);
      }

      await this.storageService.setItem(STORAGE_KEYS.CART_DATA, JSON.stringify(currentCart));
      console.log('Cart saved successfully');
      return currentCart;
    } catch (e) {
      console.error('Error adding to cart:', e);
      throw e;
    }
  }

  async removeFromCart(itemId) {
    try {
      const currentCart = await this.getCartItems();
      const updatedCart = currentCart.filter(item => item.id !== itemId);
      await this.storageService.setItem(STORAGE_KEYS.CART_DATA, JSON.stringify(updatedCart));
      return updatedCart;
    } catch (e) {
      console.error('Error removing from cart:', e);
      throw e;
    }
  }

  async updateCartItem(itemId, updates) {
    try {
      const currentCart = await this.getCartItems();
      const itemIndex = currentCart.findIndex(item => item.id === itemId);
      
      if (itemIndex >= 0) {
        currentCart[itemIndex] = { ...currentCart[itemIndex], ...updates };
        await this.storageService.setItem(STORAGE_KEYS.CART_DATA, JSON.stringify(currentCart));
      }
      
      return currentCart;
    } catch (e) {
      console.error('Error updating cart item:', e);
      throw e;
    }
  }

  async clearCart() {
    try {
      await this.storageService.setItem(STORAGE_KEYS.CART_DATA, JSON.stringify([]));
      return true;
    } catch (e) {
      console.error('Error clearing cart:', e);
      throw e;
    }
  }

  async getCartTotal() {
    try {
      const cartItems = await this.getCartItems();
      return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    } catch (e) {
      console.error('Error calculating cart total:', e);
      return 0;
    }
  }

  // Legacy static methods for backward compatibility
  static async getCart() {
    const { StorageService } = await import('../../infrastructure/storage/StorageService');
    const jsonValue = await StorageService.getItem(STORAGE_KEYS.CART_DATA);
    return jsonValue ? JSON.parse(jsonValue) : [];
  }

  static async addToCart(item, quantity = 1, selectedSize = null, selectedOptions = []) {
    const { StorageService } = await import('../../infrastructure/storage/StorageService');
    const currentCart = await CartRepository.getCart();
    
    const existingItemIndex = currentCart.findIndex(cartItem => 
      cartItem.id === item.name + (selectedSize || '')
    );

    if (existingItemIndex >= 0) {
      currentCart[existingItemIndex].quantity += quantity;
    } else {
      const newCartItem = new CartItem(item, quantity, selectedSize, selectedOptions);
      currentCart.push(newCartItem);
    }

    await StorageService.setItem(STORAGE_KEYS.CART_DATA, JSON.stringify(currentCart));
    return currentCart;
  }

  static async removeFromCart(itemId) {
    const { StorageService } = await import('../../infrastructure/storage/StorageService');
    const currentCart = await CartRepository.getCart();
    const updatedCart = currentCart.filter(item => item.id !== itemId);
    await StorageService.setItem(STORAGE_KEYS.CART_DATA, JSON.stringify(updatedCart));
    return updatedCart;
  }

  static async updateCartItem(itemId, updates) {
    const { StorageService } = await import('../../infrastructure/storage/StorageService');
    const currentCart = await CartRepository.getCart();
    const itemIndex = currentCart.findIndex(item => item.id === itemId);
    
    if (itemIndex >= 0) {
      currentCart[itemIndex] = { ...currentCart[itemIndex], ...updates };
      await StorageService.setItem(STORAGE_KEYS.CART_DATA, JSON.stringify(currentCart));
    }
    
    return currentCart;
  }

  static async clearCart() {
    const { StorageService } = await import('../../infrastructure/storage/StorageService');
    await StorageService.setItem(STORAGE_KEYS.CART_DATA, JSON.stringify([]));
    return [];
  }
}