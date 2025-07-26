import { MenuUseCases } from '../../src/domain/usecases/MenuUseCases';
import { MenuRepository } from '../../src/data/repositories/MenuRepository';
import { Menu } from '../../src/domain/models/Menu';

// Mock the repository
jest.mock('../../src/data/repositories/MenuRepository', () => ({
  MenuRepository: {
    getMenu: jest.fn(),
    refreshMenu: jest.fn(),
    clearCache: jest.fn(),
    getCacheInfo: jest.fn()
  }
}));

describe('MenuUseCases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.__DEV__ = false;
  });

  describe('loadMenu', () => {
    it('should load menu successfully', async () => {
      const mockMenu = new Menu({
        drink_of_the_day: {
          id: 'special',
          name: 'Strawberry Lemonade',
          price: 5.99
        },
        full_menu: {
          menu: [
            { id: '1', name: 'Classic Lemonade', price: 3.99 },
            { id: '2', name: 'Pink Lemonade', price: 4.49 }
          ],
          addons: [
            { id: 'addon1', name: 'Extra Ice', price: 0.50, category: 'extras' }
          ]
        }
      });

      MenuRepository.getMenu.mockResolvedValue(mockMenu);

      const result = await MenuUseCases.loadMenu();

      expect(MenuRepository.getMenu).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Menu);
      expect(result.drinkOfTheDay.name).toBe('Strawberry Lemonade');
      expect(result.menuItems).toHaveLength(2);
    });

    it('should throw error when menu data is not available', async () => {
      MenuRepository.getMenu.mockResolvedValue(null);

      await expect(MenuUseCases.loadMenu())
        .rejects.toThrow('Menu data is not available');
    });

    it('should handle repository errors', async () => {
      MenuRepository.getMenu.mockRejectedValue(new Error('Network Error'));

      await expect(MenuUseCases.loadMenu())
        .rejects.toThrow('Failed to load menu: Network Error');
    });

    it('should validate menu business rules', async () => {
      const mockMenu = new Menu({
        full_menu: {
          menu: [],
          addons: []
        }
      });

      MenuRepository.getMenu.mockResolvedValue(mockMenu);

      const result = await MenuUseCases.loadMenu();

      expect(result.getItemCount()).toBe(0);
      expect(result.getAddonCount()).toBe(0);
    });
  });

  describe('refreshMenu', () => {
    it('should refresh menu successfully', async () => {
      const mockMenu = new Menu({
        drink_of_the_day: {
          id: 'new-special',
          name: 'Fresh Limeade',
          price: 4.99
        },
        full_menu: {
          menu: [
            { id: '1', name: 'Classic Lemonade', price: 3.99 }
          ],
          addons: []
        }
      });

      MenuRepository.getMenu.mockResolvedValue(mockMenu);

      const result = await MenuUseCases.refreshMenu();

      expect(MenuRepository.getMenu).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Menu);
      expect(result.drinkOfTheDay.name).toBe('Fresh Limeade');
    });

    it('should handle refresh errors', async () => {
      MenuRepository.getMenu.mockRejectedValue(new Error('Server Error'));

      await expect(MenuUseCases.refreshMenu())
        .rejects.toThrow('Failed to refresh menu: Server Error');
    });
  });

  describe('searchMenuItems', () => {
    let mockMenu;

    beforeEach(() => {
      mockMenu = new Menu({
        full_menu: {
          menu: [
            { id: '1', name: 'Classic Lemonade', price: 3.99, description: 'Traditional fresh lemonade' },
            { id: '2', name: 'Pink Lemonade', price: 4.49, description: 'Sweet pink lemonade' },
            { id: '3', name: 'Iced Tea', price: 2.99, description: 'Refreshing iced tea' },
            { id: '4', name: 'Arnold Palmer', price: 3.49, description: 'Half iced tea, half lemonade' }
          ],
          addons: []
        }
      });

      MenuRepository.getMenu.mockResolvedValue(mockMenu);
    });

    it('should search menu items by name', async () => {
      const results = await MenuUseCases.searchMenuItems('lemonade');

      expect(results).toHaveLength(3); // Classic, Pink, and Arnold Palmer
      expect(results[0].name).toBe('Classic Lemonade');
      expect(results[1].name).toBe('Pink Lemonade');
    });

    it('should return empty array for no matches', async () => {
      const results = await MenuUseCases.searchMenuItems('coffee');

      expect(results).toEqual([]);
    });

    it('should handle empty search query', async () => {
      const results = await MenuUseCases.searchMenuItems('');

      expect(results).toEqual(mockMenu.menuItems);
    });

    it('should handle case-insensitive search', async () => {
      const results = await MenuUseCases.searchMenuItems('LEMONADE');

      expect(results).toHaveLength(3);
    });

    it('should search in descriptions', async () => {
      const results = await MenuUseCases.searchMenuItems('refreshing');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Iced Tea');
    });
  });

  describe('getMenuItemsByCategory', () => {
    let mockMenu;

    beforeEach(() => {
      mockMenu = new Menu({
        full_menu: {
          menu: [
            { id: '1', name: 'Classic Lemonade', price: 3.99, category: 'lemonades' },
            { id: '2', name: 'Pink Lemonade', price: 4.49, category: 'lemonades' },
            { id: '3', name: 'Iced Tea', price: 2.99, category: 'teas' },
            { id: '4', name: 'Green Tea', price: 3.49, category: 'teas' }
          ],
          addons: []
        }
      });

      MenuRepository.getMenu.mockResolvedValue(mockMenu);
    });

    it('should get items by category', async () => {
      const lemonades = await MenuUseCases.getMenuItemsByCategory('lemonades');

      expect(lemonades).toHaveLength(2);
      expect(lemonades[0].name).toBe('Classic Lemonade');
      expect(lemonades[1].name).toBe('Pink Lemonade');
    });

    it('should return empty array for non-existent category', async () => {
      const results = await MenuUseCases.getMenuItemsByCategory('smoothies');

      expect(results).toEqual([]);
    });

    it('should handle undefined category', async () => {
      const results = await MenuUseCases.getMenuItemsByCategory(undefined);

      expect(results).toEqual([]);
    });
  });

  describe('getMenuCategories', () => {
    let mockMenu;

    beforeEach(() => {
      mockMenu = new Menu({
        full_menu: {
          menu: [
            { id: '1', name: 'Classic Lemonade', category: 'lemonades' },
            { id: '2', name: 'Pink Lemonade', category: 'lemonades' },
            { id: '3', name: 'Iced Tea', category: 'teas' },
            { id: '4', name: 'No Category Item' } // No category
          ],
          addons: []
        }
      });

      MenuRepository.getMenu.mockResolvedValue(mockMenu);
    });

    it('should get unique categories', async () => {
      const categories = await MenuUseCases.getMenuCategories();

      expect(categories).toEqual(['lemonades', 'teas']);
    });

    it('should handle items without categories', async () => {
      const categories = await MenuUseCases.getMenuCategories();

      // Should not include undefined/null categories
      expect(categories).not.toContain(undefined);
      expect(categories).not.toContain(null);
    });

    it('should return empty array for menu with no categorized items', async () => {
      const noCategoryMenu = new Menu({
        full_menu: {
          menu: [
            { id: '1', name: 'Item 1' },
            { id: '2', name: 'Item 2' }
          ],
          addons: []
        }
      });

      MenuRepository.getMenu.mockResolvedValue(noCategoryMenu);

      const categories = await MenuUseCases.getMenuCategories();

      expect(categories).toEqual([]);
    });
  });

  describe('getFeaturedItems', () => {
    let mockMenu;

    beforeEach(() => {
      mockMenu = new Menu({
        drink_of_the_day: {
          id: 'special',
          name: 'Strawberry Lemonade',
          price: 5.99,
          featured: true
        },
        full_menu: {
          menu: [
            { id: '1', name: 'Classic Lemonade', price: 3.99, featured: true },
            { id: '2', name: 'Pink Lemonade', price: 4.49, featured: false },
            { id: '3', name: 'Iced Tea', price: 2.99 }, // No featured flag
            { id: '4', name: 'Premium Tea', price: 4.99, featured: true }
          ],
          addons: []
        }
      });

      MenuRepository.getMenu.mockResolvedValue(mockMenu);
    });

    it('should get featured items including drink of the day', async () => {
      const featuredItems = await MenuUseCases.getFeaturedItems();

      expect(featuredItems).toHaveLength(3); // Drink of day + 2 featured menu items
      expect(featuredItems[0].name).toBe('Strawberry Lemonade');
      expect(featuredItems[1].name).toBe('Classic Lemonade');
      expect(featuredItems[2].name).toBe('Premium Tea');
    });

    it('should handle menu with no featured items', async () => {
      const noFeaturedMenu = new Menu({
        full_menu: {
          menu: [
            { id: '1', name: 'Regular Item 1', price: 3.99 },
            { id: '2', name: 'Regular Item 2', price: 4.49 }
          ],
          addons: []
        }
      });

      MenuRepository.getMenu.mockResolvedValue(noFeaturedMenu);

      const featuredItems = await MenuUseCases.getFeaturedItems();

      expect(featuredItems).toEqual([]);
    });

    it('should limit featured items count', async () => {
      const featuredItems = await MenuUseCases.getFeaturedItems(2);

      expect(featuredItems).toHaveLength(2);
    });
  });

  describe('getMenuStatistics', () => {
    let mockMenu;

    beforeEach(() => {
      mockMenu = new Menu({
        drink_of_the_day: {
          id: 'special',
          name: 'Strawberry Lemonade',
          price: 5.99
        },
        full_menu: {
          menu: [
            { id: '1', name: 'Classic Lemonade', price: 3.99, category: 'lemonades' },
            { id: '2', name: 'Pink Lemonade', price: 4.49, category: 'lemonades' },
            { id: '3', name: 'Iced Tea', price: 2.99, category: 'teas' }
          ],
          addons: [
            { id: 'addon1', name: 'Extra Ice', price: 0.50, category: 'extras' },
            { id: 'addon2', name: 'Sugar', price: 0.25, category: 'sweeteners' }
          ]
        }
      });

      MenuRepository.getMenu.mockResolvedValue(mockMenu);
    });

    it('should calculate menu statistics', async () => {
      const stats = await MenuUseCases.getMenuStatistics();

      expect(stats).toEqual({
        totalItems: 3,
        totalAddons: 2,
        hasDrinkOfTheDay: true,
        categories: ['lemonades', 'teas'],
        priceRange: {
          min: 2.99,
          max: 4.49,
          average: 3.82
        },
        addonCategories: ['extras', 'sweeteners']
      });
    });

    it('should handle empty menu', async () => {
      const emptyMenu = new Menu();
      MenuRepository.getMenu.mockResolvedValue(emptyMenu);

      const stats = await MenuUseCases.getMenuStatistics();

      expect(stats).toEqual({
        totalItems: 0,
        totalAddons: 0,
        hasDrinkOfTheDay: false,
        categories: [],
        priceRange: {
          min: 0,
          max: 0,
          average: 0
        },
        addonCategories: []
      });
    });
  });

  describe('validateMenuAvailability', () => {
    it('should validate menu availability', async () => {
      const mockMenu = new Menu({
        full_menu: {
          menu: [
            { id: '1', name: 'Available Item', price: 3.99, available: true },
            { id: '2', name: 'Unavailable Item', price: 4.99, available: false }
          ],
          addons: []
        }
      });

      MenuRepository.getMenu.mockResolvedValue(mockMenu);

      const isAvailable = await MenuUseCases.validateMenuAvailability();

      expect(isAvailable).toBe(true); // Has at least one available item
    });

    it('should return false for completely unavailable menu', async () => {
      const mockMenu = new Menu({
        full_menu: {
          menu: [
            { id: '1', name: 'Unavailable Item 1', price: 3.99, available: false },
            { id: '2', name: 'Unavailable Item 2', price: 4.99, available: false }
          ],
          addons: []
        }
      });

      MenuRepository.getMenu.mockResolvedValue(mockMenu);

      const isAvailable = await MenuUseCases.validateMenuAvailability();

      expect(isAvailable).toBe(false);
    });

    it('should return true for items without availability flag', async () => {
      const mockMenu = new Menu({
        full_menu: {
          menu: [
            { id: '1', name: 'Item Without Flag', price: 3.99 }
          ],
          addons: []
        }
      });

      MenuRepository.getMenu.mockResolvedValue(mockMenu);

      const isAvailable = await MenuUseCases.validateMenuAvailability();

      expect(isAvailable).toBe(true); // Assume available if no flag
    });
  });
});
