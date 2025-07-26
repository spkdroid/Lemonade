import { MenuRepository } from '../../src/data/repositories/MenuRepository';
import { Menu } from '../../src/domain/models/Menu';

// Mock the API service
jest.mock('../../src/infrastructure/api/MenuApiService', () => ({
  MenuApiService: {
    fetchMenu: jest.fn()
  }
}));

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

import { MenuApiService } from '../../src/infrastructure/api/MenuApiService';

describe('MenuRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset console mocks
    global.__DEV__ = false;
  });

  describe('getMenu', () => {
    const mockMenuData = {
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
            description: 'Traditional fresh lemonade'
          },
          {
            id: '2',
            name: 'Pink Lemonade',
            price: 4.49,
            description: 'Sweet pink lemonade'
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
    };

    it('should return cached menu if available and not expired', async () => {
      const cachedData = {
        menu: mockMenuData,
        timestamp: Date.now() - 5 * 60 * 1000 // 5 minutes ago
      };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedData));

      const result = await MenuRepository.getMenu();

      expect(result).toBeInstanceOf(Menu);
      expect(result.drinkOfTheDay.name).toBe('Strawberry Lemonade');
      expect(result.menuItems).toHaveLength(2);
      expect(MenuApiService.fetchMenu).not.toHaveBeenCalled();
    });

    it('should fetch fresh data if cache is expired', async () => {
      const expiredCachedData = {
        menu: mockMenuData,
        timestamp: Date.now() - 25 * 60 * 1000 // 25 minutes ago (expired)
      };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(expiredCachedData));
      MenuApiService.fetchMenu.mockResolvedValue(mockMenuData);

      const result = await MenuRepository.getMenu();

      expect(MenuApiService.fetchMenu).toHaveBeenCalled();
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Menu);
    });

    it('should fetch fresh data if no cache available', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      MenuApiService.fetchMenu.mockResolvedValue(mockMenuData);

      const result = await MenuRepository.getMenu();

      expect(MenuApiService.fetchMenu).toHaveBeenCalled();
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Menu);
      expect(result.menuItems).toHaveLength(2);
    });

    it('should return cached data if API fails', async () => {
      const cachedData = {
        menu: mockMenuData,
        timestamp: Date.now() - 25 * 60 * 1000 // expired but still usable
      };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedData));
      MenuApiService.fetchMenu.mockRejectedValue(new Error('API Error'));

      const result = await MenuRepository.getMenu();

      expect(result).toBeInstanceOf(Menu);
      expect(result.drinkOfTheDay.name).toBe('Strawberry Lemonade');
    });

    it('should throw error if no cache and API fails', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      MenuApiService.fetchMenu.mockRejectedValue(new Error('API Error'));

      await expect(MenuRepository.getMenu()).rejects.toThrow('Failed to fetch menu data');
    });

    it('should handle corrupted cache data', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid json');
      MenuApiService.fetchMenu.mockResolvedValue(mockMenuData);

      const result = await MenuRepository.getMenu();

      expect(MenuApiService.fetchMenu).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Menu);
    });

    it('should handle empty API response', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      MenuApiService.fetchMenu.mockResolvedValue(null);

      await expect(MenuRepository.getMenu()).rejects.toThrow('Invalid menu data received');
    });
  });

  describe('refreshMenu', () => {
    const mockMenuData = {
      drink_of_the_day: {
        id: 'special',
        name: 'Fresh Lemonade',
        price: 4.99
      },
      full_menu: {
        menu: [],
        addons: []
      }
    };

    it('should force refresh menu data', async () => {
      MenuApiService.fetchMenu.mockResolvedValue(mockMenuData);

      const result = await MenuRepository.refreshMenu();

      expect(MenuApiService.fetchMenu).toHaveBeenCalled();
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Menu);
    });

    it('should handle API error during refresh', async () => {
      MenuApiService.fetchMenu.mockRejectedValue(new Error('Network Error'));

      await expect(MenuRepository.refreshMenu()).rejects.toThrow('Failed to refresh menu');
    });
  });

  describe('clearCache', () => {
    it('should clear menu cache', async () => {
      await MenuRepository.clearCache();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('menu_cache');
    });

    it('should handle cache clear errors gracefully', async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error('Storage Error'));

      // Should not throw
      await expect(MenuRepository.clearCache()).resolves.toBeUndefined();
    });
  });

  describe('getCacheInfo', () => {
    it('should return cache information', async () => {
      const cachedData = {
        menu: { drink_of_the_day: null, full_menu: { menu: [], addons: [] } },
        timestamp: Date.now() - 10 * 60 * 1000 // 10 minutes ago
      };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedData));

      const cacheInfo = await MenuRepository.getCacheInfo();

      expect(cacheInfo.hasCache).toBe(true);
      expect(cacheInfo.isExpired).toBe(false);
      expect(cacheInfo.age).toBeGreaterThan(0);
    });

    it('should return no cache info when cache is empty', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const cacheInfo = await MenuRepository.getCacheInfo();

      expect(cacheInfo.hasCache).toBe(false);
      expect(cacheInfo.isExpired).toBe(true);
      expect(cacheInfo.age).toBe(0);
    });

    it('should handle corrupted cache during info retrieval', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid json');

      const cacheInfo = await MenuRepository.getCacheInfo();

      expect(cacheInfo.hasCache).toBe(false);
      expect(cacheInfo.isExpired).toBe(true);
    });
  });

  describe('cache management', () => {
    it('should save menu data to cache with timestamp', async () => {
      const mockMenuData = {
        drink_of_the_day: null,
        full_menu: { menu: [], addons: [] }
      };

      MenuApiService.fetchMenu.mockResolvedValue(mockMenuData);
      mockAsyncStorage.getItem.mockResolvedValue(null);

      await MenuRepository.getMenu();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'menu_cache',
        expect.stringContaining('"timestamp":')
      );
    });

    it('should validate cache timestamp correctly', async () => {
      const recentData = {
        menu: { drink_of_the_day: null, full_menu: { menu: [], addons: [] } },
        timestamp: Date.now() - 5 * 60 * 1000 // 5 minutes ago
      };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(recentData));

      const result = await MenuRepository.getMenu();

      expect(MenuApiService.fetchMenu).not.toHaveBeenCalled();
      expect(result).toBeInstanceOf(Menu);
    });
  });
});
