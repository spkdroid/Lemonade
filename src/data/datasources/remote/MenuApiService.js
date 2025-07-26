import axios from 'axios';

const BASE_URL = 'https://www.spkdroid.com/orange';

export class MenuApiService {
  static async fetchMenu() {
    try {
      console.log('Fetching menu from:', `${BASE_URL}/menu.php`);
      const response = await axios.get(`${BASE_URL}/menu.php`, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      console.log('Menu API response status:', response.status);
      console.log('Menu API response data keys:', Object.keys(response.data || {}));
      return response.data;
    } catch (error) {
      console.error('Error fetching menu:', error.message);
      console.error('Error details:', {
        code: error.code,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }
}