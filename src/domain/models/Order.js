export class Order {
  constructor(data = {}) {
    this.id = data.id || null;
    this.orderNumber = data.orderNumber || data.order_number || null;
    this.customerId = data.customerId || null;
    this.customerName = data.customerName || '';
    this.customerPhone = data.customerPhone || '';
    this.customerEmail = data.customerEmail || '';
    
    // Cart information
    this.items = data.items || [];
    this.subtotal = data.subtotal || 0;
    this.tax = data.tax || 0;
    this.deliveryFee = data.deliveryFee || 0;
    this.discount = data.discount || 0;
    this.total = data.total || 0;
    
    // Delivery information
    this.deliveryInfo = data.deliveryInfo || {};
    this.deliveryDate = data.deliveryDate || null;
    this.deliveryTime = data.deliveryTime || null;
    this.deliveryInstructions = data.deliveryInstructions || '';
    
    // Order status
    this.status = data.status || 'pending';
    this.paymentStatus = data.paymentStatus || 'pending';
    this.paymentMethod = data.paymentMethod || 'cash_on_delivery';
    
    // Timestamps
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.estimatedDeliveryTime = data.estimatedDeliveryTime || null;
    
    // Additional information
    this.notes = data.notes || '';
    this.currency = data.currency || 'USD';
  }

  // Calculate totals
  calculateSubtotal() {
    this.subtotal = this.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    return this.subtotal;
  }

  calculateTax(taxRate = 0.08) {
    this.tax = this.subtotal * taxRate;
    return this.tax;
  }

  calculateTotal() {
    this.total = this.subtotal + this.tax + this.deliveryFee - this.discount;
    return this.total;
  }

  recalculateAll(taxRate = 0.08, deliveryFee = 5.00) {
    this.deliveryFee = deliveryFee;
    this.calculateSubtotal();
    this.calculateTax(taxRate);
    this.calculateTotal();
    return this;
  }

  // Validation
  isValid() {
    const errors = this.validate();
    return errors.length === 0;
  }

  validate() {
    const errors = [];
    
    if (!this.customerName || this.customerName.trim() === '') {
      errors.push('Customer name is required');
    }
    
    if (!this.customerPhone || this.customerPhone.trim() === '') {
      errors.push('Customer phone is required');
    } else {
      // Validate phone number format (basic validation)
      const phoneRegex = /^[\+]?[1-9]?[\d\s\-\(\)]{7,15}$/;
      const cleanPhone = this.customerPhone.replace(/\s/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        errors.push('Please enter a valid phone number (7-15 digits)');
      }
    }
    
    if (!this.items || this.items.length === 0) {
      errors.push('Order must contain at least one item');
    }
    
    if (!this.deliveryInfo || !this.deliveryInfo.address) {
      errors.push('Delivery address is required');
    }
    
    if (this.total <= 0) {
      errors.push('Order total must be greater than zero');
    }
    
    return errors;
  }

  // Status management
  updateStatus(newStatus) {
    this.status = newStatus;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  updatePaymentStatus(newPaymentStatus) {
    this.paymentStatus = newPaymentStatus;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  // Utility methods
  getFormattedTotal() {
    return `$${this.total.toFixed(2)}`;
  }

  getFormattedSubtotal() {
    return `$${this.subtotal.toFixed(2)}`;
  }

  getFormattedTax() {
    return `$${this.tax.toFixed(2)}`;
  }

  getFormattedDeliveryFee() {
    return `$${this.deliveryFee.toFixed(2)}`;
  }

  getFormattedPhone() {
    if (!this.customerPhone) return '';
    // Remove all non-digit characters except +
    const cleaned = this.customerPhone.replace(/[^\d+]/g, '');
    return cleaned;
  }

  getItemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Serialization
  toJSON() {
    return {
      id: this.id,
      orderNumber: this.orderNumber,
      customerId: this.customerId,
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      customerEmail: this.customerEmail,
      items: this.items,
      subtotal: this.subtotal,
      tax: this.tax,
      deliveryFee: this.deliveryFee,
      discount: this.discount,
      total: this.total,
      deliveryInfo: this.deliveryInfo,
      deliveryDate: this.deliveryDate,
      deliveryTime: this.deliveryTime,
      deliveryInstructions: this.deliveryInstructions,
      status: this.status,
      paymentStatus: this.paymentStatus,
      paymentMethod: this.paymentMethod,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      estimatedDeliveryTime: this.estimatedDeliveryTime,
      notes: this.notes,
      currency: this.currency
    };
  }

  static fromJSON(data) {
    return new Order(data);
  }

  // Create order from cart and delivery info
  static fromCartAndDelivery(cartItems = [], deliveryInfo, customerInfo = {}) {
    if (!Array.isArray(cartItems)) {
      console.error('Invalid cartItems passed to Order.fromCartAndDelivery:', cartItems);
      cartItems = [];
    }
    
    const items = cartItems.map(item => ({
      id: item?.id || 'unknown',
      name: item?.name || 'Unknown Item',
      price: item?.price || 0,
      quantity: item?.quantity || 1,
      selectedSize: item?.selectedSize || null,
      selectedOptions: item?.selectedOptions || [],
      image: item?.image || null
    }));

    const order = new Order({
      items: items,
      deliveryInfo: deliveryInfo.toJSON ? deliveryInfo.toJSON() : deliveryInfo,
      customerName: customerInfo.name || deliveryInfo.name || '',
      customerPhone: customerInfo.phone || deliveryInfo.phoneNumber || '',
      customerEmail: customerInfo.email || deliveryInfo.email || ''
    });

    return order.recalculateAll();
  }
}
