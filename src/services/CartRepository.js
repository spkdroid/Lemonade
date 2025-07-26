import { StorageService } from './storage/StorageService';
import { CartItem } from '../database/models/CartItem';

const CART_STORAGE_KEY = '@cart_items';

export class CartRepository {
  static async getCart() {
    try {
      const jsonValue = await StorageService.getItem(CART_STORAGE_KEY);
      return jsonValue ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Error getting cart:', e);
      return [];
    }
  }

  static async addToCart(item, quantity = 1, selectedSize = null, selectedOptions = []) {
    try {
      console.log('CartRepository.addToCart called with:', {
        item: item,
        quantity: quantity,
        selectedSize: selectedSize,
        selectedOptions: selectedOptions
      });
      
      const currentCart = await this.getCart();
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

      await StorageService.setItem(CART_STORAGE_KEY, JSON.stringify(currentCart));
      console.log('Cart saved successfully');
      return currentCart;
    } catch (e) {
      console.error('Error adding to cart:', e);
      throw e;
    }
  }

  static async removeFromCart(itemId) {
    try {
      const currentCart = await this.getCart();
      const updatedCart = currentCart.filter(item => item.id !== itemId);
      await StorageService.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
      return updatedCart;
    } catch (e) {
      console.error('Error removing from cart:', e);
      throw e;
    }
  }

  static async updateCartItem(itemId, updates) {
    try {
      const currentCart = await this.getCart();
      const itemIndex = currentCart.findIndex(item => item.id === itemId);
      
      if (itemIndex >= 0) {
        currentCart[itemIndex] = { ...currentCart[itemIndex], ...updates };
        await StorageService.setItem(CART_STORAGE_KEY, JSON.stringify(currentCart));
      }
      
      return currentCart;
    } catch (e) {
      console.error('Error updating cart:', e);
      throw e;
    }
  }

  static async clearCart() {
    try {
      await StorageService.removeItem(CART_STORAGE_KEY);
      return [];
    } catch (e) {
      console.error('Error clearing cart:', e);
      throw e;
    }
  }
}