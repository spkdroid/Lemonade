import { renderHook, act } from '@testing-library/react-native';
import { useMenuViewModel } from '../../src/presentation/viewModels/useMenuViewModel';
import { MenuUseCases } from '../../src/domain/usecases/MenuUseCases';
import { Menu } from '../../src/domain/models/Menu';

// Mock the use cases
jest.mock('../../src/domain/usecases/MenuUseCases', () => ({
  MenuUseCases: {
    loadMenu: jest.fn(),
    refreshMenu: jest.fn(),
    searchMenuItems: jest.fn(),
    getMenuItemsByCategory: jest.fn(),
    getMenuCategories: jest.fn(),
    getFeaturedItems: jest.fn(),
    getMenuStatistics: jest.fn()
  }
}));

describe('useMenuViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.__DEV__ = false;
  });

  const mockMenu = new Menu({
    drink_of_the_day: {
      id: 'special',
      name: 'Strawberry Lemonade',
      price: 5.99,
      description: 'Fresh strawberry lemonade'
    },
    full_menu: {
      menu: [
        {
          id: '1',
          name: 'Classic Lemonade',
          price: 3.99,
          description: 'Traditional fresh lemonade',
          category: 'lemonades'
        },
        {
          id: '2',
          name: 'Pink Lemonade',
          price: 4.49,
          description: 'Sweet pink lemonade',
          category: 'lemonades'
        },
        {
          id: '3',
          name: 'Iced Tea',
          price: 2.99,
          description: 'Refreshing iced tea',
          category: 'teas'
        }
      ],
      addons: [
        {
          id: 'addon1',
          name: 'Extra Ice',
          price: 0.50,
          category: 'extras'
        }
      ]
    }
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      MenuUseCases.loadMenu.mockResolvedValue(mockMenu);

      const { result } = renderHook(() => useMenuViewModel());

      expect(result.current.menu).toBeNull();
      expect(result.current.filteredItems).toEqual([]);
      expect(result.current.selectedCategory).toBe('all');
      expect(result.current.searchQuery).toBe('');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isRefreshing).toBe(false);
    });

    it('should load menu on mount', async () => {
      MenuUseCases.loadMenu.mockResolvedValue(mockMenu);

      const { result } = renderHook(() => useMenuViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(MenuUseCases.loadMenu).toHaveBeenCalled();
      expect(result.current.menu).toEqual(mockMenu);
      expect(result.current.filteredItems).toEqual(mockMenu.menuItems);
    });

    it('should handle loading error', async () => {
      const error = new Error('Failed to load menu');
      MenuUseCases.loadMenu.mockRejectedValue(error);

      const { result } = renderHook(() => useMenuViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.error).toBe('Failed to load menu');
      expect(result.current.menu).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('refreshMenu', () => {
    it('should refresh menu successfully', async () => {
      const refreshedMenu = new Menu({
        drink_of_the_day: {
          id: 'new-special',
          name: 'Mango Lemonade',
          price: 6.99
        },
        full_menu: {
          menu: [
            {
              id: '1',
              name: 'Classic Lemonade',
              price: 4.99 // Updated price
            }
          ],
          addons: []
        }
      });

      MenuUseCases.loadMenu.mockResolvedValue(mockMenu);
      MenuUseCases.refreshMenu.mockResolvedValue(refreshedMenu);

      const { result } = renderHook(() => useMenuViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.refreshMenu();
      });

      expect(MenuUseCases.refreshMenu).toHaveBeenCalled();
      expect(result.current.menu.drinkOfTheDay.name).toBe('Mango Lemonade');
      expect(result.current.isRefreshing).toBe(false);
    });

    it('should handle refresh error', async () => {
      MenuUseCases.loadMenu.mockResolvedValue(mockMenu);
      MenuUseCases.refreshMenu.mockRejectedValue(new Error('Refresh failed'));

      const { result } = renderHook(() => useMenuViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.refreshMenu();
      });

      expect(result.current.error).toBe('Refresh failed');
      expect(result.current.isRefreshing).toBe(false);
    });

    it('should set refreshing state during refresh', async () => {
      MenuUseCases.loadMenu.mockResolvedValue(mockMenu);
      MenuUseCases.refreshMenu.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockMenu), 100))
      );

      const { result } = renderHook(() => useMenuViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.refreshMenu();
      });

      expect(result.current.isRefreshing).toBe(true);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.isRefreshing).toBe(false);
    });
  });

  describe('searchItems', () => {
    beforeEach(async () => {
      MenuUseCases.loadMenu.mockResolvedValue(mockMenu);
    });

    it('should search items by query', async () => {
      const searchResults = [mockMenu.menuItems[0], mockMenu.menuItems[1]]; // Lemonades
      MenuUseCases.searchMenuItems.mockResolvedValue(searchResults);

      const { result } = renderHook(() => useMenuViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.searchItems('lemonade');
      });

      expect(MenuUseCases.searchMenuItems).toHaveBeenCalledWith('lemonade');
      expect(result.current.searchQuery).toBe('lemonade');
      expect(result.current.filteredItems).toEqual(searchResults);
    });

    it('should clear search results for empty query', async () => {
      MenuUseCases.searchMenuItems.mockResolvedValue([]);

      const { result } = renderHook(() => useMenuViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.searchItems('');
      });

      expect(result.current.searchQuery).toBe('');
      expect(result.current.filteredItems).toEqual(mockMenu.menuItems);
    });

    it('should handle search error', async () => {
      MenuUseCases.searchMenuItems.mockRejectedValue(new Error('Search failed'));

      const { result } = renderHook(() => useMenuViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.searchItems('test');
      });

      expect(result.current.error).toBe('Search failed');
    });
  });

  describe('filterByCategory', () => {
    beforeEach(async () => {
      MenuUseCases.loadMenu.mockResolvedValue(mockMenu);
    });

    it('should filter items by category', async () => {
      const categoryItems = [mockMenu.menuItems[0], mockMenu.menuItems[1]]; // Lemonades
      MenuUseCases.getMenuItemsByCategory.mockResolvedValue(categoryItems);

      const { result } = renderHook(() => useMenuViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.filterByCategory('lemonades');
      });

      expect(MenuUseCases.getMenuItemsByCategory).toHaveBeenCalledWith('lemonades');
      expect(result.current.selectedCategory).toBe('lemonades');
      expect(result.current.filteredItems).toEqual(categoryItems);
    });

    it('should show all items for "all" category', async () => {
      const { result } = renderHook(() => useMenuViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.filterByCategory('all');
      });

      expect(result.current.selectedCategory).toBe('all');
      expect(result.current.filteredItems).toEqual(mockMenu.menuItems);
    });

    it('should handle category filter error', async () => {
      MenuUseCases.getMenuItemsByCategory.mockRejectedValue(new Error('Filter failed'));

      const { result } = renderHook(() => useMenuViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.filterByCategory('lemonades');
      });

      expect(result.current.error).toBe('Filter failed');
    });
  });

  describe('loadCategories', () => {
    it('should load menu categories', async () => {
      const categories = ['lemonades', 'teas'];
      MenuUseCases.loadMenu.mockResolvedValue(mockMenu);
      MenuUseCases.getMenuCategories.mockResolvedValue(categories);

      const { result } = renderHook(() => useMenuViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.loadCategories();
      });

      expect(MenuUseCases.getMenuCategories).toHaveBeenCalled();
      expect(result.current.categories).toEqual(categories);
    });

    it('should handle categories loading error', async () => {
      MenuUseCases.loadMenu.mockResolvedValue(mockMenu);
      MenuUseCases.getMenuCategories.mockRejectedValue(new Error('Categories failed'));

      const { result } = renderHook(() => useMenuViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.loadCategories();
      });

      expect(result.current.error).toBe('Categories failed');
    });
  });

  describe('loadFeaturedItems', () => {
    it('should load featured items', async () => {
      const featuredItems = [mockMenu.drinkOfTheDay, mockMenu.menuItems[0]];
      MenuUseCases.loadMenu.mockResolvedValue(mockMenu);
      MenuUseCases.getFeaturedItems.mockResolvedValue(featuredItems);

      const { result } = renderHook(() => useMenuViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.loadFeaturedItems();
      });

      expect(MenuUseCases.getFeaturedItems).toHaveBeenCalled();
      expect(result.current.featuredItems).toEqual(featuredItems);
    });

    it('should handle featured items loading error', async () => {
      MenuUseCases.loadMenu.mockResolvedValue(mockMenu);
      MenuUseCases.getFeaturedItems.mockRejectedValue(new Error('Featured failed'));

      const { result } = renderHook(() => useMenuViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.loadFeaturedItems();
      });

      expect(result.current.error).toBe('Featured failed');
    });
  });

  describe('getMenuStatistics', () => {
    it('should get menu statistics', async () => {
      const stats = {
        totalItems: 3,
        totalAddons: 1,
        hasDrinkOfTheDay: true,
        categories: ['lemonades', 'teas'],
        priceRange: { min: 2.99, max: 4.49, average: 3.82 }
      };

      MenuUseCases.loadMenu.mockResolvedValue(mockMenu);
      MenuUseCases.getMenuStatistics.mockResolvedValue(stats);

      const { result } = renderHook(() => useMenuViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.getMenuStatistics();
      });

      expect(MenuUseCases.getMenuStatistics).toHaveBeenCalled();
      expect(result.current.statistics).toEqual(stats);
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      MenuUseCases.loadMenu.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useMenuViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('resetFilters', () => {
    it('should reset all filters', async () => {
      MenuUseCases.loadMenu.mockResolvedValue(mockMenu);
      MenuUseCases.searchMenuItems.mockResolvedValue([mockMenu.menuItems[0]]);

      const { result } = renderHook(() => useMenuViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Apply filters
      await act(async () => {
        await result.current.searchItems('lemonade');
        await result.current.filterByCategory('lemonades');
      });

      // Reset filters
      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.searchQuery).toBe('');
      expect(result.current.selectedCategory).toBe('all');
      expect(result.current.filteredItems).toEqual(mockMenu.menuItems);
    });
  });

  describe('computed properties', () => {
    beforeEach(async () => {
      MenuUseCases.loadMenu.mockResolvedValue(mockMenu);
    });

    it('should indicate if menu has items', async () => {
      const { result } = renderHook(() => useMenuViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.hasMenuItems).toBe(true);
    });

    it('should indicate if menu has no items', async () => {
      const emptyMenu = new Menu();
      MenuUseCases.loadMenu.mockResolvedValue(emptyMenu);

      const { result } = renderHook(() => useMenuViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.hasMenuItems).toBe(false);
    });

    it('should indicate if drink of the day exists', async () => {
      const { result } = renderHook(() => useMenuViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.hasDrinkOfTheDay).toBe(true);
    });

    it('should count filtered items', async () => {
      const { result } = renderHook(() => useMenuViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.itemCount).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should handle null menu gracefully', async () => {
      MenuUseCases.loadMenu.mockResolvedValue(null);

      const { result } = renderHook(() => useMenuViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.menu).toBeNull();
      expect(result.current.filteredItems).toEqual([]);
      expect(result.current.hasMenuItems).toBe(false);
    });

    it('should handle concurrent operations', async () => {
      MenuUseCases.loadMenu.mockResolvedValue(mockMenu);
      MenuUseCases.searchMenuItems.mockImplementation((query) => 
        new Promise(resolve => setTimeout(() => resolve([]), 100))
      );

      const { result } = renderHook(() => useMenuViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Start multiple search operations
      act(() => {
        result.current.searchItems('query1');
        result.current.searchItems('query2');
        result.current.searchItems('query3');
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      // Should use the latest query
      expect(result.current.searchQuery).toBe('query3');
    });
  });
});
