import { MenuApiService } from './api/MenuApiService';
import { StorageService } from './storage/StorageService';

export class MenuRepository {
  static async getMenu() {
    try {
      // First try to fetch from API
      const freshData = await MenuApiService.fetchMenu();
      // Store the fresh data in AsyncStorage
      await StorageService.storeMenuData(freshData);
      return freshData;
    } catch (error) {
      console.log('Network error, trying to load from cache...');
      // If network fails, try to load from AsyncStorage
      const cachedData = await StorageService.getMenuData();
      if (cachedData) {
        return cachedData;
      }
      throw new Error('No internet connection and no cached data available');
    }
  }
}