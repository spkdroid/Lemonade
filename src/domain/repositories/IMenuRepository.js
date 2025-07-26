/**
 * Menu Repository Interface
 * Defines the contract for menu data operations
 */
export class IMenuRepository {
  /**
   * Get all menu items
   * @returns {Promise<MenuItem[]>}
   */
  async getMenuItems() {
    throw new Error('Method must be implemented');
  }

  /**
   * Get menu item by ID
   * @param {string} itemId 
   * @returns {Promise<MenuItem>}
   */
  async getMenuItemById(itemId) {
    throw new Error('Method must be implemented');
  }

  /**
   * Get featured items
   * @returns {Promise<MenuItem[]>}
   */
  async getFeaturedItems() {
    throw new Error('Method must be implemented');
  }

  /**
   * Search menu items
   * @param {string} query 
   * @returns {Promise<MenuItem[]>}
   */
  async searchMenuItems(query) {
    throw new Error('Method must be implemented');
  }

  /**
   * Get items by category
   * @param {string} category 
   * @returns {Promise<MenuItem[]>}
   */
  async getItemsByCategory(category) {
    throw new Error('Method must be implemented');
  }
}
