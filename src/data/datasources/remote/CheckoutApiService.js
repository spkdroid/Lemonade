import axios from 'axios';
import { ApiResponse } from '../../../domain/models/ApiResponse';
import { CheckoutRequest, CheckoutResponse } from '../../../domain/models/CheckoutModels';

const BASE_URL = 'https://www.spkdroid.com/orange';
const TIMEOUT = 15000; // 15 seconds timeout for checkout

export class CheckoutApiService {
  static async processCheckout(order) {
    try {
      // Create checkout request from order
      const checkoutRequest = CheckoutRequest.fromOrder(order);
      
      console.log('Processing checkout request:', checkoutRequest.toJSON());
      
      const response = await axios.post(
        `${BASE_URL}/checkout.php`,
        checkoutRequest.toJSON(),
        {
          timeout: TIMEOUT,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Checkout API response:', response.data);
      
      // Transform API response
      const checkoutResponse = CheckoutResponse.fromJSON(response.data);
      
      if (checkoutResponse.isSuccess()) {
        return ApiResponse.success(checkoutResponse, 'Checkout completed successfully');
      } else {
        return ApiResponse.error(
          checkoutResponse.getErrorMessage(),
          response.status || 400
        );
      }
      
    } catch (error) {
      console.error('Checkout API error:', error);
      
      if (error.code === 'ECONNABORTED') {
        return ApiResponse.error(
          'Checkout request timeout - please try again',
          408
        );
      }
      
      if (error.response) {
        const errorMessage = error.response.data?.error || 
                           error.response.data?.message || 
                           `Server error: ${error.response.status}`;
        return ApiResponse.error(errorMessage, error.response.status);
      }
      
      if (error.request) {
        return ApiResponse.error(
          'Network error - unable to connect to server',
          503
        );
      }
      
      return ApiResponse.error(
        error.message || 'Unexpected error during checkout',
        500
      );
    }
  }
}
