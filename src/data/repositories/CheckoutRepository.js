import { CheckoutApiService } from '../datasources/remote/CheckoutApiService';
import { StorageService } from '../../infrastructure/storage/StorageService';
import { Order } from '../../domain/models/Order';
import { ApiResponse } from '../../domain/models/ApiResponse';

export class CheckoutRepository {
  static ORDER_HISTORY_KEY = 'order_history';
  static PENDING_ORDERS_KEY = 'pending_orders';
  static MAX_ORDER_HISTORY = 50;

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
      
      // Save order as pending
      await this.savePendingOrder(order);
      
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
        
        // Save to order history
        await this.saveToOrderHistory(order);
        
        // Remove from pending orders
        await this.removePendingOrder(order.id);
        
        return ApiResponse.success(
          {
            order: order,
            checkoutResponse: responseData
          },
          'Order placed successfully'
        );
      } else {
        // Update pending order with error status
        order.status = 'failed';
        order.notes = checkoutResponse.getMessage();
        await this.updatePendingOrder(order);
        
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

  static async getOrderHistory() {
    try {
      const history = await StorageService.getData(this.ORDER_HISTORY_KEY) || [];
      return ApiResponse.success(
        history.map(orderData => Order.fromJSON(orderData)),
        'Order history retrieved'
      );
    } catch (error) {
      console.error('Error getting order history:', error);
      return ApiResponse.error('Failed to get order history', 500);
    }
  }

  static async getPendingOrders() {
    try {
      const pending = await StorageService.getData(this.PENDING_ORDERS_KEY) || [];
      return ApiResponse.success(
        pending.map(orderData => Order.fromJSON(orderData)),
        'Pending orders retrieved'
      );
    } catch (error) {
      console.error('Error getting pending orders:', error);
      return ApiResponse.error('Failed to get pending orders', 500);
    }
  }

  static async getOrderById(orderId) {
    try {
      // Check order history first
      const historyResponse = await this.getOrderHistory();
      if (historyResponse.isSuccess()) {
        const order = historyResponse.getData().find(o => o.id === orderId);
        if (order) {
          return ApiResponse.success(order, 'Order found in history');
        }
      }
      
      // Check pending orders
      const pendingResponse = await this.getPendingOrders();
      if (pendingResponse.isSuccess()) {
        const order = pendingResponse.getData().find(o => o.id === orderId);
        if (order) {
          return ApiResponse.success(order, 'Order found in pending');
        }
      }
      
      return ApiResponse.error('Order not found', 404);
    } catch (error) {
      console.error('Error getting order by ID:', error);
      return ApiResponse.error('Failed to get order', 500);
    }
  }

  static async getOrderStatus(orderNumber) {
    try {
      const response = await CheckoutApiService.getOrderStatus(orderNumber);
      return response;
    } catch (error) {
      console.error('Error getting order status:', error);
      return ApiResponse.error('Failed to get order status', 500);
    }
  }

  static async cancelOrder(orderNumber, reason = '') {
    try {
      const response = await CheckoutApiService.cancelOrder(orderNumber, reason);
      
      if (response.isSuccess()) {
        // Update local order status
        await this.updateOrderStatus(orderNumber, 'cancelled');
      }
      
      return response;
    } catch (error) {
      console.error('Error cancelling order:', error);
      return ApiResponse.error('Failed to cancel order', 500);
    }
  }

  static async retryFailedOrder(orderId) {
    try {
      const orderResponse = await this.getOrderById(orderId);
      if (!orderResponse.isSuccess()) {
        return orderResponse;
      }
      
      const order = orderResponse.getData();
      if (order.status !== 'failed') {
        return ApiResponse.error('Order is not in failed status', 400);
      }
      
      // Reset order status and retry
      order.status = 'pending';
      order.updatedAt = new Date().toISOString();
      
      const checkoutResponse = await CheckoutApiService.processCheckout(order);
      
      if (checkoutResponse.isSuccess()) {
        const responseData = checkoutResponse.getData();
        order.orderNumber = responseData.orderNumber;
        order.status = 'confirmed';
        order.estimatedDeliveryTime = responseData.estimatedDeliveryTime;
        
        await this.saveToOrderHistory(order);
        await this.removePendingOrder(order.id);
      } else {
        order.status = 'failed';
        await this.updatePendingOrder(order);
      }
      
      return checkoutResponse;
    } catch (error) {
      console.error('Error retrying failed order:', error);
      return ApiResponse.error('Failed to retry order', 500);
    }
  }

  // Private helper methods
  static async savePendingOrder(order) {
    try {
      const pending = await StorageService.getData(this.PENDING_ORDERS_KEY) || [];
      pending.push(order.toJSON());
      await StorageService.storeData(this.PENDING_ORDERS_KEY, pending);
    } catch (error) {
      console.error('Error saving pending order:', error);
    }
  }

  static async updatePendingOrder(order) {
    try {
      const pending = await StorageService.getData(this.PENDING_ORDERS_KEY) || [];
      const index = pending.findIndex(o => o.id === order.id);
      if (index !== -1) {
        pending[index] = order.toJSON();
        await StorageService.storeData(this.PENDING_ORDERS_KEY, pending);
      }
    } catch (error) {
      console.error('Error updating pending order:', error);
    }
  }

  static async removePendingOrder(orderId) {
    try {
      const pending = await StorageService.getData(this.PENDING_ORDERS_KEY) || [];
      const filtered = pending.filter(o => o.id !== orderId);
      await StorageService.storeData(this.PENDING_ORDERS_KEY, filtered);
    } catch (error) {
      console.error('Error removing pending order:', error);
    }
  }

  static async saveToOrderHistory(order) {
    try {
      const history = await StorageService.getData(this.ORDER_HISTORY_KEY) || [];
      
      // Add to beginning of array (most recent first)
      history.unshift(order.toJSON());
      
      // Limit history size
      if (history.length > this.MAX_ORDER_HISTORY) {
        history.splice(this.MAX_ORDER_HISTORY);
      }
      
      await StorageService.storeData(this.ORDER_HISTORY_KEY, history);
    } catch (error) {
      console.error('Error saving to order history:', error);
    }
  }

  static async updateOrderStatus(orderNumber, newStatus) {
    try {
      // Update in order history
      const history = await StorageService.getData(this.ORDER_HISTORY_KEY) || [];
      const historyIndex = history.findIndex(o => o.orderNumber === orderNumber);
      if (historyIndex !== -1) {
        history[historyIndex].status = newStatus;
        history[historyIndex].updatedAt = new Date().toISOString();
        await StorageService.storeData(this.ORDER_HISTORY_KEY, history);
      }
      
      // Update in pending orders
      const pending = await StorageService.getData(this.PENDING_ORDERS_KEY) || [];
      const pendingIndex = pending.findIndex(o => o.orderNumber === orderNumber);
      if (pendingIndex !== -1) {
        pending[pendingIndex].status = newStatus;
        pending[pendingIndex].updatedAt = new Date().toISOString();
        await StorageService.storeData(this.PENDING_ORDERS_KEY, pending);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  }

  static async clearOrderHistory() {
    try {
      await StorageService.removeData(this.ORDER_HISTORY_KEY);
      return ApiResponse.success(null, 'Order history cleared');
    } catch (error) {
      console.error('Error clearing order history:', error);
      return ApiResponse.error('Failed to clear order history', 500);
    }
  }
}
