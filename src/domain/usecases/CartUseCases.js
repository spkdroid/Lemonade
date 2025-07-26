import { ICartRepository } from '../repositories/ICartRepository';

/**
 * Cart Use Cases
 * Contains all business logic related to cart operations
 */
export class CartUseCases {
  constructor(cartRepository) {
    if (!cartRepository || !(cartRepository instanceof ICartRepository)) {
      throw new Error('CartUseCases requires a valid ICartRepository implementation');
    }
    this.cartRepository = cartRepository;
  }

  /**
   * Add item to cart with business logic validation
   * @param {Object} item 
   * @returns {Promise<CartItem>}
   */
  async addItemToCart(item) {
    // Business rule: Validate item before adding
    if (!item || !item.id || !item.name || !item.price) {
      throw new Error('Invalid item: id, name, and price are required');
    }

    // Business rule: Price must be positive
    if (item.price <= 0) {
      throw new Error('Item price must be greater than 0');
    }

    // Business rule: Quantity must be at least 1
    const quantity = item.quantity || 1;
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    return await this.cartRepository.addToCart({
      ...item,
      quantity,
      addedAt: new Date().toISOString()
    });
  }

  /**
   * Update cart item quantity with validation
   * @param {string} itemId 
   * @param {number} newQuantity 
   * @returns {Promise<CartItem>}
   */
  async updateItemQuantity(itemId, newQuantity) {
    if (!itemId) {
      throw new Error('Item ID is required');
    }

    if (newQuantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    if (newQuantity === 0) {
      return await this.cartRepository.removeFromCart(itemId);
    }

    return await this.cartRepository.updateCartItem(itemId, { 
      quantity: newQuantity,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Calculate cart total with any applicable discounts
   * @returns {Promise<{subtotal: number, tax: number, total: number}>}
   */
  async calculateCartTotal() {
    const subtotal = await this.cartRepository.getCartTotal();
    
    // Business rule: Calculate tax (8.5% for example)
    const taxRate = 0.085;
    const tax = subtotal * taxRate;
    
    // Business rule: Apply minimum order discount
    let discount = 0;
    if (subtotal > 50) {
      discount = subtotal * 0.05; // 5% discount for orders over $50
    }

    const total = subtotal + tax - discount;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  }

  /**
   * Validate cart before checkout
   * @returns {Promise<{isValid: boolean, errors: string[]}>}
   */
  async validateCartForCheckout() {
    const cartItems = await this.cartRepository.getCartItems();
    const errors = [];

    if (cartItems.length === 0) {
      errors.push('Cart is empty');
    }

    // Business rule: Check inventory (mock validation)
    for (const item of cartItems) {
      if (item.quantity > 10) {
        errors.push(`Maximum quantity for ${item.name} is 10`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Clear cart
   * @returns {Promise<boolean>}
   */
  async clearCart() {
    return await this.cartRepository.clearCart();
  }

  /**
   * Remove item from cart
   * @param {string} itemId 
   * @returns {Promise<boolean>}
   */
  async removeItem(itemId) {
    if (!itemId) {
      throw new Error('Item ID is required');
    }
    return await this.cartRepository.removeFromCart(itemId);
  }

  /**
   * Get all cart items
   * @returns {Promise<CartItem[]>}
   */
  async getCartItems() {
    return await this.cartRepository.getCartItems();
  }
}
