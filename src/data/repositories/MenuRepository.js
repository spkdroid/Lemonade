import { MenuApiService } from '../datasources/remote/MenuApiService';
import { StorageService } from '../../infrastructure/storage/StorageService';
import { Menu } from '../../domain/models/Menu';

export class MenuRepository {
  static async getMenu() {
    try {
      // First try to fetch from API
      console.log('Fetching menu from API...');
      const rawData = await MenuApiService.fetchMenu();
      if (__DEV__) {
        console.log('Raw API response:', rawData);
      }
      
      // Process the raw data through the Menu model
      const menuData = new Menu(rawData);
      if (__DEV__) {
        console.log('Processed menu data:', {
          drinkOfTheDay: menuData.drinkOfTheDay?.name || 'None',
          menuItemsCount: menuData.menuItems?.length || 0,
          addonsCount: menuData.addons?.length || 0
        });
      }
      
      // Store the processed data in AsyncStorage
      await StorageService.storeMenuData(menuData);
      return menuData;
    } catch (error) {
      if (__DEV__) {
        console.log('Network error, trying to load from cache...', error.message);
      }
      // If network fails, try to load from AsyncStorage
      const cachedData = await StorageService.getMenuData();
      if (cachedData) {
        if (__DEV__) {
          console.log('Loaded cached data:', cachedData);
        }
        // If cached data exists, ensure it's processed through Menu model
        return cachedData instanceof Menu ? cachedData : new Menu(cachedData);
      }
      throw new Error('No internet connection and no cached data available');
    }
  }
}