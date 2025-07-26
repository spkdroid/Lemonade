import AsyncStorage from '@react-native-async-storage/async-storage';

const MENU_STORAGE_KEY = '@menu_data';

export class StorageService {
  static async storeMenuData(data) {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(MENU_STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Error storing menu data:', e);
    }
  }

  static async getMenuData() {
    try {
      const jsonValue = await AsyncStorage.getItem(MENU_STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Error getting menu data:', e);
      return null;
    }
  }

  // Generic storage methods
  static async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error('Error setting item:', e);
      throw e;
    }
  }

  static async getItem(key) {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.error('Error getting item:', e);
      throw e;
    }
  }

  static async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing item:', e);
      throw e;
    }
  }
}