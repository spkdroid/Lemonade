export class CheckoutRequest {
  constructor(order) {
    this.orderId = order.id;
    this.customerInfo = {
      name: order.customerName || '',
      phone: order.getFormattedPhone ? order.getFormattedPhone() : order.customerPhone || '',
      email: order.customerEmail || ''
    };
    
    this.items = (order.items || []).map(item => ({
      id: item?.id || 'unknown',
      name: item?.name || 'Unknown Item',
      price: item?.price || 0,
      quantity: item?.quantity || 1,
      selectedSize: item?.selectedSize || null,
      selectedOptions: item?.selectedOptions || [],
      total: (item?.price || 0) * (item?.quantity || 1)
    }));
    
    this.pricing = {
      subtotal: order.subtotal,
      tax: order.tax,
      deliveryFee: order.deliveryFee,
      discount: order.discount,
      total: order.total
    };
    
    this.deliveryInfo = {
      address: order.deliveryInfo.address || '',
      city: order.deliveryInfo.city || '',
      state: order.deliveryInfo.state || '',
      zipCode: order.deliveryInfo.zipCode || '',
      country: order.deliveryInfo.country || 'US',
      latitude: order.deliveryInfo.latitude || null,
      longitude: order.deliveryInfo.longitude || null,
      instructions: order.deliveryInstructions || ''
    };
    
    this.orderDetails = {
      paymentMethod: order.paymentMethod,
      requestedDeliveryDate: order.deliveryDate,
      requestedDeliveryTime: order.deliveryTime,
      notes: order.notes,
      currency: order.currency
    };
    
    this.timestamp = new Date().toISOString();
    this.platform = 'mobile_app';
    this.version = '1.0';
  }

  toJSON() {
    return {
      orderId: this.orderId,
      customerInfo: this.customerInfo,
      items: this.items,
      pricing: this.pricing,
      deliveryInfo: this.deliveryInfo,
      orderDetails: this.orderDetails,
      timestamp: this.timestamp,
      platform: this.platform,
      version: this.version
    };
  }

  static fromOrder(order) {
    return new CheckoutRequest(order);
  }
}

export class CheckoutResponse {
  constructor(data) {
    this.success = data.success !== false;
    this.message = data.message || '';
    this.orderNumber = data.order_number || data.orderNumber || null;
    this.orderId = data.order_id || data.orderId || null;
    this.estimatedDeliveryTime = data.estimated_delivery_time || data.estimatedDeliveryTime || null;
    this.trackingUrl = data.tracking_url || data.trackingUrl || null;
    this.paymentInfo = data.payment_info || data.paymentInfo || {};
    this.orderDetails = data.order_details || data.orderDetails || {};
    this.timestamp = data.timestamp || new Date().toISOString();
    this.error = data.error || null;
  }

  isSuccess() {
    return this.success && this.orderNumber;
  }

  hasError() {
    return !this.success || this.error;
  }

  getErrorMessage() {
    return this.error || this.message || 'Unknown error occurred';
  }

  toJSON() {
    return {
      success: this.success,
      message: this.message,
      orderNumber: this.orderNumber,
      orderId: this.orderId,
      estimatedDeliveryTime: this.estimatedDeliveryTime,
      trackingUrl: this.trackingUrl,
      paymentInfo: this.paymentInfo,
      orderDetails: this.orderDetails,
      timestamp: this.timestamp,
      error: this.error
    };
  }

  static fromJSON(data) {
    return new CheckoutResponse(data);
  }
}
