import { MenuRepository } from '../../data/repositories/MenuRepository';

export class MenuUseCases {
  
  /**
   * Load complete menu data including drink of the day, menu items, and addons
   * @returns {Promise<Menu>} Processed menu data
   */
  static async loadMenu() {
    try {
      const menuData = await MenuRepository.getMenu();
      
      // Business rules validation
      if (!menuData) {
        throw new Error('Menu data is not available');
      }

      // Log business metrics
      if (__DEV__) {
        console.log('Menu loaded successfully:', {
          totalItems: menuData.getItemCount(),
          hasSpecialDrink: !!menuData.drinkOfTheDay,
          addonsAvailable: menuData.getAddonCount()
        });
      }

      return menuData;
    } catch (error) {
      if (__DEV__) {
        console.error('MenuUseCases: Failed to load menu:', error);
      }
      throw new Error(`Failed to load menu: ${error.message}`);
    }
  }

  /**
   * Refresh menu data from remote source
   * @returns {Promise<Menu>} Fresh menu data
   */
  static async refreshMenu() {
    try {
      // Force refresh by calling repository directly
      const freshMenuData = await MenuRepository.getMenu();
      
      if (__DEV__) {
        console.log('Menu refreshed successfully');
      }

      return freshMenuData;
    } catch (error) {
      if (__DEV__) {
        console.error('MenuUseCases: Failed to refresh menu:', error);
      }
      throw new Error(`Failed to refresh menu: ${error.message}`);
    }
  }

  /**
   * Search for menu items by name or type
   * @param {Menu} menuData - The menu data to search
   * @param {string} searchTerm - The term to search for
   * @returns {Array<MenuItem>} Filtered menu items
   */
  static searchMenuItems(menuData, searchTerm) {
    try {
      if (!menuData || !searchTerm) {
        return [];
      }

      const normalizedSearchTerm = searchTerm.toLowerCase().trim();
      
      if (normalizedSearchTerm.length < 2) {
        return []; // Require at least 2 characters for search
      }

      const allItems = menuData.getAllItems();
      
      const filteredItems = allItems.filter(item => 
        item.name?.toLowerCase().includes(normalizedSearchTerm) ||
        item.type?.toLowerCase().includes(normalizedSearchTerm) ||
        item.description?.toLowerCase().includes(normalizedSearchTerm) ||
        item.taste?.toLowerCase().includes(normalizedSearchTerm)
      );

      if (__DEV__) {
        console.log(`MenuUseCases: Search for "${searchTerm}" returned ${filteredItems.length} results`);
      }

      return filteredItems;
    } catch (error) {
      if (__DEV__) {
        console.error('MenuUseCases: Search failed:', error);
      }
      return [];
    }
  }

  /**
   * Filter menu items by type
   * @param {Menu} menuData - The menu data to filter
   * @param {string} type - The type to filter by
   * @returns {Array<MenuItem>} Filtered menu items
   */
  static filterMenuItemsByType(menuData, type) {
    try {
      if (!menuData || !type) {
        return menuData?.getAllItems() || [];
      }

      const filteredItems = menuData.getItemsByType(type);

      if (__DEV__) {
        console.log(`MenuUseCases: Filtered by type "${type}", found ${filteredItems.length} items`);
      }

      return filteredItems;
    } catch (error) {
      if (__DEV__) {
        console.error('MenuUseCases: Filter by type failed:', error);
      }
      return [];
    }
  }

  /**
   * Get featured drink of the day with business logic
   * @param {Menu} menuData - The menu data
   * @returns {MenuItem|null} Featured drink or null
   */
  static getFeaturedDrink(menuData) {
    try {
      if (!menuData) {
        return null;
      }

      const featuredDrink = menuData.drinkOfTheDay;
      
      // Business rule: Featured drink should have valid price
      if (featuredDrink && (!featuredDrink.price || Object.keys(featuredDrink.price).length === 0)) {
        if (__DEV__) {
          console.warn('MenuUseCases: Featured drink has invalid pricing');
        }
        return null;
      }

      return featuredDrink;
    } catch (error) {
      if (__DEV__) {
        console.error('MenuUseCases: Failed to get featured drink:', error);
      }
      return null;
    }
  }

  /**
   * Validate menu item for ordering
   * @param {MenuItem} item - The menu item to validate
   * @returns {Object} Validation result with isValid and errors
   */
  static validateMenuItemForOrder(item) {
    const errors = [];

    try {
      if (!item) {
        errors.push('Menu item is required');
        return { isValid: false, errors };
      }

      if (!item.name || item.name.trim().length === 0) {
        errors.push('Menu item must have a valid name');
      }

      if (!item.price || Object.keys(item.price).length === 0) {
        errors.push('Menu item must have valid pricing');
      }

      // Check if all prices are positive numbers
      if (item.price) {
        for (const [size, price] of Object.entries(item.price)) {
          if (typeof price !== 'number' || price <= 0) {
            errors.push(`Invalid price for size "${size}"`);
          }
        }
      }

      const isValid = errors.length === 0;

      if (__DEV__ && !isValid) {
        console.warn('MenuUseCases: Menu item validation failed:', errors);
      }

      return { isValid, errors };
    } catch (error) {
      if (__DEV__) {
        console.error('MenuUseCases: Validation error:', error);
      }
      return { 
        isValid: false, 
        errors: ['Validation failed due to unexpected error'] 
      };
    }
  }

  /**
   * Get available menu categories
   * @param {Menu} menuData - The menu data
   * @returns {Array<string>} Available categories
   */
  static getMenuCategories(menuData) {
    try {
      if (!menuData) {
        if (__DEV__) {
          console.log('MenuUseCases: No menu data provided for categories');
        }
        return [];
      }

      // Check if menuData has the required methods
      if (typeof menuData.getAllItems !== 'function') {
        if (__DEV__) {
          console.error('MenuUseCases: menuData does not have getAllItems method');
        }
        return [];
      }

      const allItems = menuData.getAllItems();
      
      if (!Array.isArray(allItems)) {
        if (__DEV__) {
          console.error('MenuUseCases: getAllItems did not return an array');
        }
        return [];
      }

      const categories = [...new Set(allItems.map(item => item?.type).filter(Boolean))];
      
      if (__DEV__) {
        console.log('MenuUseCases: Available categories:', categories);
      }

      return categories.sort();
    } catch (error) {
      if (__DEV__) {
        console.error('MenuUseCases: Failed to get categories:', error);
      }
      return [];
    }
  }
}
