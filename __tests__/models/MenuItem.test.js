import { MenuItem } from '../../src/domain/models/MenuItem';

describe('MenuItem Model', () => {
  const mockMenuItemData = {
    name: 'Classic Lemonade',
    price: 4.99,
    description: 'Fresh squeezed lemonade',
    image: 'https://example.com/lemonade.jpg',
    category: 'Beverages',
    available: true,
    sizes: ['Small', 'Medium', 'Large'],
    ingredients: ['Lemon', 'Sugar', 'Water'],
    nutrition: {
      calories: 120,
      sugar: 25
    }
  };

  describe('Constructor', () => {
    test('should create MenuItem with valid data', () => {
      const menuItem = new MenuItem(mockMenuItemData);
      
      expect(menuItem.name).toBe('Classic Lemonade');
      expect(menuItem.price).toBe(4.99);
      expect(menuItem.description).toBe('Fresh squeezed lemonade');
      expect(menuItem.image).toBe('https://example.com/lemonade.jpg');
      expect(menuItem.category).toBe('Beverages');
      expect(menuItem.available).toBe(true);
      expect(menuItem.sizes).toEqual(['Small', 'Medium', 'Large']);
      expect(menuItem.ingredients).toEqual(['Lemon', 'Sugar', 'Water']);
      expect(menuItem.nutrition).toEqual({ calories: 120, sugar: 25 });
    });

    test('should handle minimal data', () => {
      const minimalData = {
        name: 'Simple Drink',
        price: 2.99
      };
      
      const menuItem = new MenuItem(minimalData);
      expect(menuItem.name).toBe('Simple Drink');
      expect(menuItem.price).toBe(2.99);
    });

    test('should handle null/undefined values gracefully', () => {
      const dataWithNulls = {
        name: 'Test Drink',
        price: 3.99,
        description: null,
        image: undefined,
        sizes: null
      };
      
      const menuItem = new MenuItem(dataWithNulls);
      expect(menuItem.name).toBe('Test Drink');
      expect(menuItem.price).toBe(3.99);
      expect(menuItem.description).toBeNull();
      expect(menuItem.image).toBeUndefined();
    });
  });

  describe('Validation', () => {
    test('should validate required fields', () => {
      const validItem = new MenuItem(mockMenuItemData);
      const errors = validItem.validate();
      expect(errors).toHaveLength(0);
    });

    test('should return error for missing name', () => {
      const invalidData = { ...mockMenuItemData, name: '' };
      const menuItem = new MenuItem(invalidData);
      const errors = menuItem.validate();
      expect(errors).toContain('Name is required');
    });

    test('should return error for invalid price', () => {
      const invalidData = { ...mockMenuItemData, price: -1 };
      const menuItem = new MenuItem(invalidData);
      const errors = menuItem.validate();
      expect(errors).toContain('Price must be greater than 0');
    });

    test('should return error for non-numeric price', () => {
      const invalidData = { ...mockMenuItemData, price: 'invalid' };
      const menuItem = new MenuItem(invalidData);
      const errors = menuItem.validate();
      expect(errors).toContain('Price must be a valid number');
    });
  });

  describe('Utility Methods', () => {
    test('isAvailable should return availability status', () => {
      const availableItem = new MenuItem({ ...mockMenuItemData, available: true });
      const unavailableItem = new MenuItem({ ...mockMenuItemData, available: false });
      
      expect(availableItem.isAvailable()).toBe(true);
      expect(unavailableItem.isAvailable()).toBe(false);
    });

    test('getFormattedPrice should return formatted price', () => {
      const menuItem = new MenuItem(mockMenuItemData);
      expect(menuItem.getFormattedPrice()).toBe('$4.99');
    });

    test('hasSizes should return true if sizes exist', () => {
      const itemWithSizes = new MenuItem(mockMenuItemData);
      const itemWithoutSizes = new MenuItem({ ...mockMenuItemData, sizes: [] });
      
      expect(itemWithSizes.hasSizes()).toBe(true);
      expect(itemWithoutSizes.hasSizes()).toBe(false);
    });

    test('toJSON should return serializable object', () => {
      const menuItem = new MenuItem(mockMenuItemData);
      const json = menuItem.toJSON();
      
      expect(json).toEqual(mockMenuItemData);
      expect(typeof json).toBe('object');
    });
  });

  describe('Static Methods', () => {
    test('fromApiResponse should create MenuItem from API data', () => {
      const apiData = {
        name: 'API Lemonade',
        price: 5.99,
        description: 'From API',
        available: true
      };
      
      const menuItem = MenuItem.fromApiResponse(apiData);
      expect(menuItem).toBeInstanceOf(MenuItem);
      expect(menuItem.name).toBe('API Lemonade');
      expect(menuItem.price).toBe(5.99);
    });

    test('fromApiResponse should handle null/undefined', () => {
      expect(() => MenuItem.fromApiResponse(null)).not.toThrow();
      expect(() => MenuItem.fromApiResponse(undefined)).not.toThrow();
    });
  });
});
