import { CartItem } from '../../domain/models/CartItem';
import { STORAGE_KEYS } from '../../shared/constants/AppConstants';
import { StorageService } from '../../infrastructure/storage/StorageService';

export class CartRepository {
  constructor(storageService) {
    this.storageService = storageService;
    this.operationQueue = Promise.resolve();
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
    // Queue the operation to prevent race conditions
    return this.operationQueue = this.operationQueue.then(async () => {
      try {
        const currentCart = await this.getCartItems();
        const itemId = item.name + (selectedSize || '');
        
        // Use a more efficient lookup with Map for large carts
        const existingItemIndex = currentCart.findIndex(cartItem => cartItem.id === itemId);

        if (existingItemIndex >= 0) {
          currentCart[existingItemIndex].quantity += quantity;
        } else {
          const newCartItem = new CartItem(item, quantity, selectedSize, selectedOptions);
          currentCart.push(newCartItem);
        }

        await this.storageService.setItem(STORAGE_KEYS.CART_DATA, JSON.stringify(currentCart));
        return currentCart;
      } catch (e) {
        console.error('Error adding to cart:', e);
        throw e;
      }
    });
  }

  async removeFromCart(itemId) {
    // Queue the operation to prevent race conditions
    return this.operationQueue = this.operationQueue.then(async () => {
      try {
        const currentCart = await this.getCartItems();
        const updatedCart = currentCart.filter(item => item.id !== itemId);
        await this.storageService.setItem(STORAGE_KEYS.CART_DATA, JSON.stringify(updatedCart));
        return updatedCart;
      } catch (e) {
        console.error('Error removing from cart:', e);
        throw e;
      }
    });
  }

  async updateCartItem(itemId, updates) {
    // Queue the operation to prevent race conditions
    return this.operationQueue = this.operationQueue.then(async () => {
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
    });
  }

  async clearCart() {
    // Queue the operation to prevent race conditions
    return this.operationQueue = this.operationQueue.then(async () => {
      try {
        await this.storageService.setItem(STORAGE_KEYS.CART_DATA, JSON.stringify([]));
        return true;
      } catch (e) {
        console.error('Error clearing cart:', e);
        throw e;
      }
    });
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
    const jsonValue = await StorageService.getItem(STORAGE_KEYS.CART_DATA);
    return jsonValue ? JSON.parse(jsonValue) : [];
  }

  static async addToCart(item, quantity = 1, selectedSize = null, selectedOptions = []) {
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
    const currentCart = await CartRepository.getCart();
    const updatedCart = currentCart.filter(item => item.id !== itemId);
    await StorageService.setItem(STORAGE_KEYS.CART_DATA, JSON.stringify(updatedCart));
    return updatedCart;
  }

  static async updateCartItem(itemId, updates) {
    const currentCart = await CartRepository.getCart();
    const itemIndex = currentCart.findIndex(item => item.id === itemId);
    
    if (itemIndex >= 0) {
      currentCart[itemIndex] = { ...currentCart[itemIndex], ...updates };
      await StorageService.setItem(STORAGE_KEYS.CART_DATA, JSON.stringify(currentCart));
    }
    
    return currentCart;
  }

  static async clearCart() {
    await StorageService.setItem(STORAGE_KEYS.CART_DATA, JSON.stringify([]));
    return [];
  }
}