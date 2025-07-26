import { StorageService } from '../../infrastructure/storage/StorageService';
import { DeliveryInfo } from '../../domain/models/DeliveryInfo';

const DELIVERY_INFO_STORAGE_KEY = '@delivery_info';

export class DeliveryRepository {
  static async getDeliveryInfo() {
    try {
      const jsonValue = await StorageService.getItem(DELIVERY_INFO_STORAGE_KEY);
      if (jsonValue) {
        const data = JSON.parse(jsonValue);
        return new DeliveryInfo(data);
      }
      return new DeliveryInfo(); // Return empty delivery info if none exists
    } catch (e) {
      console.error('Error getting delivery info:', e);
      return new DeliveryInfo();
    }
  }

  static async saveDeliveryInfo(deliveryInfo) {
    try {
      const deliveryInfoInstance = deliveryInfo instanceof DeliveryInfo 
        ? deliveryInfo 
        : new DeliveryInfo(deliveryInfo);
      
      const jsonValue = JSON.stringify(deliveryInfoInstance.toJSON());
      await StorageService.setItem(DELIVERY_INFO_STORAGE_KEY, jsonValue);
      return deliveryInfoInstance;
    } catch (e) {
      console.error('Error saving delivery info:', e);
      throw e;
    }
  }

  static async updateDeliveryInfo(updates) {
    try {
      const currentInfo = await this.getDeliveryInfo();
      const updatedInfo = new DeliveryInfo({
        ...currentInfo.toJSON(),
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      return await this.saveDeliveryInfo(updatedInfo);
    } catch (e) {
      console.error('Error updating delivery info:', e);
      throw e;
    }
  }

  static async clearDeliveryInfo() {
    try {
      await StorageService.removeItem(DELIVERY_INFO_STORAGE_KEY);
      return new DeliveryInfo();
    } catch (e) {
      console.error('Error clearing delivery info:', e);
      throw e;
    }
  }

  static async validateDeliveryInfo(deliveryInfo) {
    const errors = {};
    
    if (!deliveryInfo.name || deliveryInfo.name.trim() === '') {
      errors.name = 'Name is required';
    }
    
    if (!deliveryInfo.phoneNumber || deliveryInfo.phoneNumber.trim() === '') {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[\d\s\-()]+$/.test(deliveryInfo.phoneNumber.trim())) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }
    
    if (!deliveryInfo.email || deliveryInfo.email.trim() === '') {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(deliveryInfo.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!deliveryInfo.address || deliveryInfo.address.trim() === '') {
      errors.address = 'Address is required';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}
