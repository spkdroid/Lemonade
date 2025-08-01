export class DeliveryInfo {
  constructor(data = {}) {
    this.id = data.id || 'delivery_info_default';
    this.name = data.name || '';
    this.phoneNumber = data.phoneNumber || '';
    this.email = data.email || '';
    this.address = data.address || '';
    this.city = data.city || '';
    this.zipCode = data.zipCode || '';
    this.deliveryInstructions = data.deliveryInstructions || '';
    this.isDefault = data.isDefault || true;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Validation methods
  isValid() {
    return this.name.trim() !== '' && 
           this.phoneNumber.trim() !== '' && 
           this.email.trim() !== '' && 
           this.address.trim() !== '' &&
           this.isValidPhoneNumber();
  }

  isValidPhoneNumber() {
    if (!this.phoneNumber || this.phoneNumber.trim() === '') {
      return false;
    }
    // Basic phone number validation - allows international format
    const phoneRegex = /^[\+]?[1-9]?[\d\s\-\(\)]{7,15}$/;
    const cleanPhone = this.phoneNumber.replace(/\s/g, '');
    return phoneRegex.test(cleanPhone);
  }

  getFormattedPhoneNumber() {
    if (!this.phoneNumber) return '';
    // Remove all non-digit characters except +
    return this.phoneNumber.replace(/[^\d+]/g, '');
  }

  // Get formatted address
  getFormattedAddress() {
    const parts = [this.address, this.city, this.zipCode].filter(part => part.trim() !== '');
    return parts.join(', ');
  }

  // Get display name
  getDisplayName() {
    return this.name.trim() || 'No name provided';
  }

  // Convert to plain object for storage
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      phoneNumber: this.phoneNumber,
      email: this.email,
      address: this.address,
      city: this.city,
      zipCode: this.zipCode,
      deliveryInstructions: this.deliveryInstructions,
      isDefault: this.isDefault,
      createdAt: this.createdAt,
      updatedAt: new Date().toISOString()
    };
  }
}
