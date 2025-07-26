/**
 * Cart Repository Interface
 * Defines the contract for cart data operations
 */
export class ICartRepository {
  /**
   * Get all cart items
   * @returns {Promise<CartItem[]>}
   */
  async getCartItems() {
    throw new Error('Method must be implemented');
  }

  /**
   * Add item to cart
   * @param {CartItem} item 
   * @returns {Promise<CartItem>}
   */
  async addToCart(item) {
    throw new Error('Method must be implemented');
  }

  /**
   * Update cart item
   * @param {string} itemId 
   * @param {Object} updates 
   * @returns {Promise<CartItem>}
   */
  async updateCartItem(itemId, updates) {
    throw new Error('Method must be implemented');
  }

  /**
   * Remove item from cart
   * @param {string} itemId 
   * @returns {Promise<boolean>}
   */
  async removeFromCart(itemId) {
    throw new Error('Method must be implemented');
  }

  /**
   * Clear all cart items
   * @returns {Promise<boolean>}
   */
  async clearCart() {
    throw new Error('Method must be implemented');
  }

  /**
   * Get cart total
   * @returns {Promise<number>}
   */
  async getCartTotal() {
    throw new Error('Method must be implemented');
  }
}
