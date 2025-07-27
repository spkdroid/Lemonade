import { MenuRepository } from '../../../src/data/repositories/MenuRepository';
import { MenuApiService } from '../../../src/data/datasources/remote/MenuApiService';
import { StorageService } from '../../../src/infrastructure/storage/StorageService';
import { Menu } from '../../../src/domain/models/Menu';

// Mock dependencies
jest.mock('../../../src/data/datasources/remote/MenuApiService');
jest.mock('../../../src/infrastructure/storage/StorageService');
jest.mock('../../../src/domain/models/Menu');

describe('MenuRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  describe('getMenu', () => {
    test('should fetch menu from API and store in cache successfully', async () => {
      const mockRawData = {
        drinks: [{ name: 'Lemonade', price: 2.99 }],
        addons: [{ name: 'Extra Sugar', price: 0.5 }]
      };
      const mockMenuInstance = {
        drinkOfTheDay: { name: 'Lemonade' },
        menuItems: [{ name: 'Lemonade', price: 2.99 }],
        addons: [{ name: 'Extra Sugar', price: 0.5 }]
      };

      MenuApiService.fetchMenu.mockResolvedValue(mockRawData);
      Menu.mockImplementation(() => mockMenuInstance);
      StorageService.storeMenuData.mockResolvedValue();

      const result = await MenuRepository.getMenu();

      expect(MenuApiService.fetchMenu).toHaveBeenCalledTimes(1);
      expect(Menu).toHaveBeenCalledWith(mockRawData);
      expect(StorageService.storeMenuData).toHaveBeenCalledWith(mockMenuInstance);
      expect(result).toBe(mockMenuInstance);
    });

    test('should fallback to cached data when API fails', async () => {
      const mockCachedData = {
        drinkOfTheDay: { name: 'Cached Lemonade' },
        menuItems: [{ name: 'Cached Lemonade', price: 2.99 }]
      };
      const mockMenuInstance = {
        drinkOfTheDay: { name: 'Cached Lemonade' },
        menuItems: [{ name: 'Cached Lemonade', price: 2.99 }]
      };

      MenuApiService.fetchMenu.mockRejectedValue(new Error('Network error'));
      StorageService.getMenuData.mockResolvedValue(mockCachedData);
      Menu.mockImplementation(() => mockMenuInstance);

      const result = await MenuRepository.getMenu();

      expect(MenuApiService.fetchMenu).toHaveBeenCalledTimes(1);
      expect(StorageService.getMenuData).toHaveBeenCalledTimes(1);
      expect(Menu).toHaveBeenCalledWith(mockCachedData);
      expect(result).toBe(mockMenuInstance);
    });

    test('should return cached data if it is already a Menu instance', async () => {
      const mockCachedMenu = new Menu({
        drinkOfTheDay: { name: 'Cached Lemonade' },
        menuItems: [{ name: 'Cached Lemonade', price: 2.99 }]
      });

      MenuApiService.fetchMenu.mockRejectedValue(new Error('Network error'));
      StorageService.getMenuData.mockResolvedValue(mockCachedMenu);

      const result = await MenuRepository.getMenu();

      expect(result).toBe(mockCachedMenu);
      expect(MenuApiService.fetchMenu).toHaveBeenCalledTimes(1);
      expect(StorageService.getMenuData).toHaveBeenCalledTimes(1);
    });

    test('should throw error when both API and cache fail', async () => {
      MenuApiService.fetchMenu.mockRejectedValue(new Error('Network error'));
      StorageService.getMenuData.mockResolvedValue(null);

      await expect(MenuRepository.getMenu()).rejects.toThrow(
        'No internet connection and no cached data available'
      );

      expect(MenuApiService.fetchMenu).toHaveBeenCalledTimes(1);
      expect(StorageService.getMenuData).toHaveBeenCalledTimes(1);
    });

    test('should handle storage error gracefully', async () => {
      MenuApiService.fetchMenu.mockRejectedValue(new Error('Network error'));
      StorageService.getMenuData.mockRejectedValue(new Error('Storage error'));

      await expect(MenuRepository.getMenu()).rejects.toThrow('Storage error');

      expect(MenuApiService.fetchMenu).toHaveBeenCalledTimes(1);
      expect(StorageService.getMenuData).toHaveBeenCalledTimes(1);
    });

  });
});
