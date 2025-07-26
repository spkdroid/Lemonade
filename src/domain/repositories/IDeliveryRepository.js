/**
 * Delivery Repository Interface
 * Defines the contract for delivery information operations
 */
export class IDeliveryRepository {
  /**
   * Get delivery information
   * @returns {Promise<DeliveryInfo>}
   */
  async getDeliveryInfo() {
    throw new Error('Method must be implemented');
  }

  /**
   * Save delivery information
   * @param {DeliveryInfo} deliveryInfo 
   * @returns {Promise<DeliveryInfo>}
   */
  async saveDeliveryInfo(deliveryInfo) {
    throw new Error('Method must be implemented');
  }

  /**
   * Update delivery information
   * @param {Object} updates 
   * @returns {Promise<DeliveryInfo>}
   */
  async updateDeliveryInfo(updates) {
    throw new Error('Method must be implemented');
  }

  /**
   * Clear delivery information
   * @returns {Promise<boolean>}
   */
  async clearDeliveryInfo() {
    throw new Error('Method must be implemented');
  }

  /**
   * Validate delivery information
   * @param {Object} deliveryInfo 
   * @returns {Promise<{isValid: boolean, errors: Object}>}
   */
  async validateDeliveryInfo(deliveryInfo) {
    throw new Error('Method must be implemented');
  }
}
