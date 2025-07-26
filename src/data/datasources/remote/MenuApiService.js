import axios from 'axios';

const BASE_URL = 'https://spkdroid.com/orange';

export class MenuApiService {
  static async fetchMenu() {
    try {
      const response = await axios.get(`${BASE_URL}/menu.php`);
      return response.data;
    } catch (error) {
      console.error('Error fetching menu:', error);
      throw error;
    }
  }
}