import { CheckoutApiService } from '../datasources/remote/CheckoutApiService';
import { Order } from '../../domain/models/Order';
import { ApiResponse } from '../../domain/models/ApiResponse';

export class CheckoutRepository {
  static async processCheckout(cartItems, deliveryInfo, customerInfo = {}) {
    try {
      // Debug logging
      console.log('CheckoutRepository - Input data:');
      console.log('- cartItems:', cartItems.length, 'items');
      console.log('- deliveryInfo:', deliveryInfo);
      console.log('- customerInfo:', customerInfo);
      
      // Create order from cart and delivery info
      const order = Order.fromCartAndDelivery(cartItems, deliveryInfo, customerInfo);
      
      // Debug the created order
      console.log('CheckoutRepository - Created order:');
      console.log('- customerName:', order.customerName);
      console.log('- customerPhone:', order.customerPhone);
      console.log('- customerEmail:', order.customerEmail);
      
      // Validate order
      const validationErrors = order.validate();
      if (validationErrors.length > 0) {
        console.error('CheckoutRepository - Validation errors:', validationErrors);
        return ApiResponse.error(
          `Order validation failed: ${validationErrors.join(', ')}`,
          400
        );
      }
      
      console.log('Processing checkout for order:', order.toJSON());
      
      // Process checkout with API
      const checkoutResponse = await CheckoutApiService.processCheckout(order);
      
      if (checkoutResponse.isSuccess()) {
        const responseData = checkoutResponse.getData();
        
        // Update order with response data
        order.orderNumber = responseData.orderNumber;
        order.id = responseData.orderId || responseData.orderNumber;
        order.status = 'confirmed';
        order.estimatedDeliveryTime = responseData.estimatedDeliveryTime;
        order.updatedAt = new Date().toISOString();
        
        return ApiResponse.success(
          {
            order: order,
            checkoutResponse: responseData
          },
          'Order placed successfully'
        );
      } else {
        return checkoutResponse; // Return the error response
      }
      
    } catch (error) {
      console.error('CheckoutRepository error:', error);
      return ApiResponse.error(
        'Checkout processing failed: ' + error.message,
        500
      );
    }
  }
}
