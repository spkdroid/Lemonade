import { Menu } from '../../src/domain/models/Menu';
import { MenuItem } from '../../src/domain/models/MenuItem';

// Mock console methods for cleaner test output
global.__DEV__ = false;

describe('Menu', () => {
  describe('constructor', () => {
    it('should create empty menu with no data', () => {
      const menu = new Menu();
      
      expect(menu.drinkOfTheDay).toBeNull();
      expect(menu.menuItems).toEqual([]);
      expect(menu.addons).toEqual([]);
    });

    it('should create menu with empty data object', () => {
      const menu = new Menu({});
      
      expect(menu.drinkOfTheDay).toBeNull();
      expect(menu.menuItems).toEqual([]);
      expect(menu.addons).toEqual([]);
    });

    it('should create menu with drink of the day', () => {
      const data = {
        drink_of_the_day: {
          id: '1',
          name: 'Special Lemonade',
          price: 4.99,
          description: 'Today\'s special drink'
        }
      };
      
      const menu = new Menu(data);
      
      expect(menu.drinkOfTheDay).toBeInstanceOf(MenuItem);
      expect(menu.drinkOfTheDay.name).toBe('Special Lemonade');
      expect(menu.drinkOfTheDay.price).toBe(4.99);
    });

    it('should create menu with full menu items', () => {
      const data = {
        full_menu: {
          menu: [
            {
              id: '1',
              name: 'Classic Lemonade',
              price: 3.99,
              description: 'Fresh and tangy'
            },
            {
              id: '2',
              name: 'Pink Lemonade',
              price: 4.49,
              description: 'Sweet and colorful'
            }
          ]
        }
      };
      
      const menu = new Menu(data);
      
      expect(menu.menuItems).toHaveLength(2);
      expect(menu.menuItems[0]).toBeInstanceOf(MenuItem);
      expect(menu.menuItems[0].name).toBe('Classic Lemonade');
      expect(menu.menuItems[1].name).toBe('Pink Lemonade');
    });

    it('should create menu with addons', () => {
      const data = {
        full_menu: {
          addons: [
            {
              id: 'addon1',
              name: 'Extra Ice',
              price: 0.50,
              category: 'extras'
            },
            {
              id: 'addon2',
              name: 'Mint Leaves',
              price: 0.75,
              category: 'extras'
            }
          ]
        }
      };
      
      const menu = new Menu(data);
      
      expect(menu.addons).toHaveLength(2);
      expect(menu.addons[0].name).toBe('Extra Ice');
      expect(menu.addons[0].price).toBe(0.50);
      expect(menu.addons[1].name).toBe('Mint Leaves');
    });

    it('should handle complete menu data', () => {
      const data = {
        drink_of_the_day: {
          id: 'special',
          name: 'Strawberry Lemonade',
          price: 5.99
        },
        full_menu: {
          menu: [
            {
              id: '1',
              name: 'Classic Lemonade',
              price: 3.99
            }
          ],
          addons: [
            {
              id: 'addon1',
              name: 'Extra Sugar',
              price: 0.25
            }
          ]
        }
      };
      
      const menu = new Menu(data);
      
      expect(menu.drinkOfTheDay.name).toBe('Strawberry Lemonade');
      expect(menu.menuItems).toHaveLength(1);
      expect(menu.addons).toHaveLength(1);
    });
  });

  describe('parseMenuItems', () => {
    let menu;

    beforeEach(() => {
      menu = new Menu();
    });

    it('should return empty array for non-array input', () => {
      const result = menu.parseMenuItems(null);
      expect(result).toEqual([]);
    });

    it('should return empty array for undefined input', () => {
      const result = menu.parseMenuItems(undefined);
      expect(result).toEqual([]);
    });

    it('should filter out invalid items', () => {
      const menuArray = [
        { id: '1', name: 'Valid Item', price: 3.99 },
        null,
        undefined,
        'invalid string',
        { id: '2', name: 'Another Valid Item', price: 4.99 }
      ];
      
      const result = menu.parseMenuItems(menuArray);
      
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Valid Item');
      expect(result[1].name).toBe('Another Valid Item');
    });

    it('should handle empty array', () => {
      const result = menu.parseMenuItems([]);
      expect(result).toEqual([]);
    });
  });

  describe('parseAddons', () => {
    let menu;

    beforeEach(() => {
      menu = new Menu();
    });

    it('should return empty array for non-array input', () => {
      const result = menu.parseAddons('not an array');
      expect(result).toEqual([]);
    });

    it('should group addons by category', () => {
      const addonsArray = [
        { id: '1', name: 'Extra Ice', price: 0.50, category: 'extras' },
        { id: '2', name: 'Sugar', price: 0.25, category: 'sweeteners' },
        { id: '3', name: 'Honey', price: 0.75, category: 'sweeteners' },
        { id: '4', name: 'Lemon Slice', price: 0.50, category: 'extras' }
      ];
      
      const result = menu.parseAddons(addonsArray);
      
      expect(result.extras).toHaveLength(2);
      expect(result.sweeteners).toHaveLength(2);
      expect(result.extras[0].name).toBe('Extra Ice');
      expect(result.sweeteners[0].name).toBe('Sugar');
    });

    it('should handle addons without categories', () => {
      const addonsArray = [
        { id: '1', name: 'Extra Ice', price: 0.50 },
        { id: '2', name: 'Sugar', price: 0.25 }
      ];
      
      const result = menu.parseAddons(addonsArray);
      
      expect(result.uncategorized).toHaveLength(2);
    });

    it('should filter out invalid addon items', () => {
      const addonsArray = [
        { id: '1', name: 'Valid Addon', price: 0.50, category: 'extras' },
        null,
        undefined,
        'invalid',
        { id: '2', name: 'Another Valid', price: 0.75, category: 'extras' }
      ];
      
      const result = menu.parseAddons(addonsArray);
      
      expect(result.extras).toHaveLength(2);
    });
  });

  describe('utility methods', () => {
    it('should return correct item count', () => {
      const data = {
        full_menu: {
          menu: [
            { id: '1', name: 'Item 1', price: 3.99 },
            { id: '2', name: 'Item 2', price: 4.99 },
            { id: '3', name: 'Item 3', price: 5.99 }
          ]
        }
      };
      
      const menu = new Menu(data);
      expect(menu.getItemCount()).toBe(3);
    });

    it('should return zero for empty menu', () => {
      const menu = new Menu();
      expect(menu.getItemCount()).toBe(0);
    });

    it('should return correct addon count', () => {
      const data = {
        full_menu: {
          addons: [
            { id: '1', name: 'Addon 1', price: 0.50, category: 'extras' },
            { id: '2', name: 'Addon 2', price: 0.75, category: 'sweeteners' }
          ]
        }
      };
      
      const menu = new Menu(data);
      expect(menu.getAddonCount()).toBe(2);
    });

    it('should search menu items by name', () => {
      const data = {
        full_menu: {
          menu: [
            { id: '1', name: 'Classic Lemonade', price: 3.99 },
            { id: '2', name: 'Pink Lemonade', price: 4.99 },
            { id: '3', name: 'Iced Tea', price: 2.99 }
          ]
        }
      };
      
      const menu = new Menu(data);
      const results = menu.searchItems('lemonade');
      
      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Classic Lemonade');
      expect(results[1].name).toBe('Pink Lemonade');
    });

    it('should return empty array for no search results', () => {
      const data = {
        full_menu: {
          menu: [
            { id: '1', name: 'Classic Lemonade', price: 3.99 }
          ]
        }
      };
      
      const menu = new Menu(data);
      const results = menu.searchItems('coffee');
      
      expect(results).toEqual([]);
    });

    it('should get menu items by category', () => {
      const data = {
        full_menu: {
          menu: [
            { id: '1', name: 'Classic Lemonade', price: 3.99, category: 'lemonades' },
            { id: '2', name: 'Iced Tea', price: 2.99, category: 'teas' },
            { id: '3', name: 'Pink Lemonade', price: 4.99, category: 'lemonades' }
          ]
        }
      };
      
      const menu = new Menu(data);
      const lemonades = menu.getItemsByCategory('lemonades');
      
      expect(lemonades).toHaveLength(2);
      expect(lemonades[0].name).toBe('Classic Lemonade');
      expect(lemonades[1].name).toBe('Pink Lemonade');
    });
  });
});
