import { IDeliveryRepository } from '../repositories/IDeliveryRepository';

/**
 * Delivery Use Cases
 * Contains all business logic related to delivery operations
 */
export class DeliveryUseCases {
  constructor(deliveryRepository) {
    if (!deliveryRepository || !(deliveryRepository instanceof IDeliveryRepository)) {
      throw new Error('DeliveryUseCases requires a valid IDeliveryRepository implementation');
    }
    this.deliveryRepository = deliveryRepository;
  }

  /**
   * Save delivery information with validation
   * @param {Object} deliveryInfo 
   * @returns {Promise<DeliveryInfo>}
   */
  async saveDeliveryInformation(deliveryInfo) {
    // Business validation
    const validation = await this.validateDeliveryInfo(deliveryInfo);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    return await this.deliveryRepository.saveDeliveryInfo(deliveryInfo);
  }

  /**
   * Validate delivery information according to business rules
   * @param {Object} deliveryInfo 
   * @returns {Promise<{isValid: boolean, errors: string[]}>}
   */
  async validateDeliveryInfo(deliveryInfo) {
    const errors = [];

    // Business rule: Required fields
    if (!deliveryInfo.name || deliveryInfo.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (!deliveryInfo.phoneNumber || !/^\+?[\d\s\-\(\)]+$/.test(deliveryInfo.phoneNumber)) {
      errors.push('Valid phone number is required');
    }

    if (!deliveryInfo.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryInfo.email)) {
      errors.push('Valid email address is required');
    }

    if (!deliveryInfo.address || deliveryInfo.address.trim().length < 5) {
      errors.push('Address must be at least 5 characters long');
    }

    // Business rule: Postal code validation (if provided)
    if (deliveryInfo.zipCode && !/^\d{5}(-\d{4})?$/.test(deliveryInfo.zipCode)) {
      errors.push('Invalid zip code format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if delivery information is complete
   * @returns {Promise<boolean>}
   */
  async isDeliveryInfoComplete() {
    const deliveryInfo = await this.deliveryRepository.getDeliveryInfo();
    const validation = await this.validateDeliveryInfo(deliveryInfo);
    return validation.isValid;
  }

  /**
   * Calculate delivery fee based on business rules
   * @param {Object} deliveryInfo 
   * @param {number} orderTotal 
   * @returns {Promise<{fee: number, estimatedTime: string}>}
   */
  async calculateDeliveryFee(deliveryInfo, orderTotal) {
    let fee = 5.99; // Base delivery fee
    
    // Business rule: Free delivery for orders over $30
    if (orderTotal >= 30) {
      fee = 0;
    }

    // Business rule: Express delivery option
    let estimatedTime = '30-45 minutes';
    if (deliveryInfo.isExpress) {
      fee += 3.99;
      estimatedTime = '15-25 minutes';
    }

    return {
      fee: Math.round(fee * 100) / 100,
      estimatedTime
    };
  }

  /**
   * Get delivery information
   * @returns {Promise<DeliveryInfo>}
   */
  async getDeliveryInfo() {
    return await this.deliveryRepository.getDeliveryInfo();
  }

  /**
   * Update delivery information
   * @param {Object} updates 
   * @returns {Promise<DeliveryInfo>}
   */
  async updateDeliveryInfo(updates) {
    // Validate updates
    const currentInfo = await this.deliveryRepository.getDeliveryInfo();
    const updatedInfo = { ...currentInfo, ...updates };
    
    const validation = await this.validateDeliveryInfo(updatedInfo);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    return await this.deliveryRepository.updateDeliveryInfo(updates);
  }

  /**
   * Clear delivery information
   * @returns {Promise<boolean>}
   */
  async clearDeliveryInfo() {
    return await this.deliveryRepository.clearDeliveryInfo();
  }
}
