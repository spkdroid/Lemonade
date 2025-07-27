import { DeliveryRepository } from '../../../src/data/repositories/DeliveryRepository';
import { StorageService } from '../../../src/infrastructure/storage/StorageService';
import { DeliveryInfo } from '../../../src/domain/models/DeliveryInfo';

// Mock dependencies
jest.mock('../../../src/infrastructure/storage/StorageService');

describe('DeliveryRepository', () => {
  const DELIVERY_INFO_STORAGE_KEY = '@delivery_info';

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  describe('getDeliveryInfo', () => {
    test('should return delivery info when data exists', async () => {
      const mockStoredData = {
        name: 'John Doe',
        phoneNumber: '+1234567890',
        email: 'john@example.com',
        address: '123 Main St'
      };

      StorageService.getItem.mockResolvedValue(JSON.stringify(mockStoredData));

      const result = await DeliveryRepository.getDeliveryInfo();

      expect(StorageService.getItem).toHaveBeenCalledWith(DELIVERY_INFO_STORAGE_KEY);
      expect(result).toBeInstanceOf(DeliveryInfo);
      expect(result.name).toBe(mockStoredData.name);
      expect(result.phoneNumber).toBe(mockStoredData.phoneNumber);
    });

    test('should return empty delivery info when no data exists', async () => {
      StorageService.getItem.mockResolvedValue(null);

      const result = await DeliveryRepository.getDeliveryInfo();

      expect(StorageService.getItem).toHaveBeenCalledWith(DELIVERY_INFO_STORAGE_KEY);
      expect(result).toBeInstanceOf(DeliveryInfo);
      expect(result.name).toBe('');
      expect(result.phoneNumber).toBe('');
    });

    test('should handle storage error gracefully', async () => {
      StorageService.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await DeliveryRepository.getDeliveryInfo();

      expect(console.error).toHaveBeenCalledWith('Error getting delivery info:', expect.any(Error));
      expect(result).toBeInstanceOf(DeliveryInfo);
      expect(result.name).toBe('');
    });
  });

  describe('saveDeliveryInfo', () => {
    test('should save delivery info instance successfully', async () => {
      const mockJsonData = {
        name: 'John Doe',
        phoneNumber: '+1234567890'
      };
      const mockDeliveryInfo = new DeliveryInfo(mockJsonData);
      
      StorageService.setItem.mockResolvedValue();

      const result = await DeliveryRepository.saveDeliveryInfo(mockDeliveryInfo);

      // Check that setItem was called with the storage key
      expect(StorageService.setItem).toHaveBeenCalledWith(
        DELIVERY_INFO_STORAGE_KEY,
        expect.any(String)
      );
      
      // Verify the stored data structure matches what we expect
      const storedData = JSON.parse(StorageService.setItem.mock.calls[0][1]);
      expect(storedData.name).toBe(mockJsonData.name);
      expect(storedData.phoneNumber).toBe(mockJsonData.phoneNumber);
      expect(storedData.id).toBe('delivery_info_default');
      expect(storedData.isDefault).toBe(true);
      expect(storedData.createdAt).toBeDefined();
      expect(storedData.updatedAt).toBeDefined();
      
      expect(result).toEqual(mockDeliveryInfo);
    });

    test('should create DeliveryInfo instance from plain object', async () => {
      const mockData = {
        name: 'John Doe',
        phoneNumber: '+1234567890'
      };

      StorageService.setItem.mockResolvedValue();

      const result = await DeliveryRepository.saveDeliveryInfo(mockData);

      expect(result).toBeInstanceOf(DeliveryInfo);
      expect(result.name).toBe(mockData.name);
      expect(result.phoneNumber).toBe(mockData.phoneNumber);
      
      // Check that setItem was called with the storage key
      expect(StorageService.setItem).toHaveBeenCalledWith(
        DELIVERY_INFO_STORAGE_KEY,
        expect.any(String)
      );
      
      // Verify the stored data structure
      const storedData = JSON.parse(StorageService.setItem.mock.calls[0][1]);
      expect(storedData.name).toBe(mockData.name);
      expect(storedData.phoneNumber).toBe(mockData.phoneNumber);
      expect(storedData.id).toBe('delivery_info_default');
      expect(storedData.isDefault).toBe(true);
      expect(storedData.createdAt).toBeDefined();
      expect(storedData.updatedAt).toBeDefined();
    });

    test('should handle storage error when saving', async () => {
      const mockDeliveryInfo = new DeliveryInfo({
        name: 'John Doe',
        phoneNumber: '+1234567890'
      });

      StorageService.setItem.mockRejectedValue(new Error('Storage error'));

      await expect(DeliveryRepository.saveDeliveryInfo(mockDeliveryInfo))
        .rejects.toThrow('Storage error');

      expect(console.error).toHaveBeenCalledWith('Error saving delivery info:', expect.any(Error));
    });
  });

  describe('updateDeliveryInfo', () => {
    test('should update delivery info successfully', async () => {
      const mockCurrentData = {
        name: 'John Doe',
        phoneNumber: '+1234567890'
      };
      const mockUpdates = {
        name: 'Jane Doe',
        email: 'jane@example.com'
      };

      // Mock getDeliveryInfo
      StorageService.getItem.mockResolvedValue(JSON.stringify(mockCurrentData));
      StorageService.setItem.mockResolvedValue();

      const result = await DeliveryRepository.updateDeliveryInfo(mockUpdates);

      expect(result).toBeInstanceOf(DeliveryInfo);
      expect(result.name).toBe(mockUpdates.name);
      expect(result.phoneNumber).toBe(mockCurrentData.phoneNumber);
      expect(result.email).toBe(mockUpdates.email);
    });

    test('should handle update error', async () => {
      const mockUpdates = { name: 'Jane Doe' };

      // Mock getDeliveryInfo to succeed but saveDeliveryInfo to fail
      StorageService.getItem.mockResolvedValue(JSON.stringify({ name: 'John' }));
      StorageService.setItem.mockRejectedValue(new Error('Storage error'));

      await expect(DeliveryRepository.updateDeliveryInfo(mockUpdates))
        .rejects.toThrow('Storage error');

      expect(console.error).toHaveBeenCalledWith('Error updating delivery info:', expect.any(Error));
    });
  });

  describe('clearDeliveryInfo', () => {
    test('should clear delivery info successfully', async () => {
      StorageService.removeItem.mockResolvedValue();

      const result = await DeliveryRepository.clearDeliveryInfo();

      expect(StorageService.removeItem).toHaveBeenCalledWith(DELIVERY_INFO_STORAGE_KEY);
      expect(result).toBeInstanceOf(DeliveryInfo);
      expect(result.name).toBe('');
      expect(result.phoneNumber).toBe('');
    });

    test('should handle storage error when clearing', async () => {
      StorageService.removeItem.mockRejectedValue(new Error('Storage error'));

      await expect(DeliveryRepository.clearDeliveryInfo())
        .rejects.toThrow('Storage error');

      expect(console.error).toHaveBeenCalledWith('Error clearing delivery info:', expect.any(Error));
    });
  });

  describe('validateDeliveryInfo', () => {
    test('should return valid for complete delivery info', async () => {
      const validDeliveryInfo = {
        name: 'John Doe',
        phoneNumber: '+1234567890',
        email: 'john@example.com',
        address: '123 Main St'
      };

      const result = await DeliveryRepository.validateDeliveryInfo(validDeliveryInfo);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    test('should return errors for missing required fields', async () => {
      const invalidDeliveryInfo = {
        name: '',
        phoneNumber: '',
        email: '',
        address: ''
      };

      const result = await DeliveryRepository.validateDeliveryInfo(invalidDeliveryInfo);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        name: 'Name is required',
        phoneNumber: 'Phone number is required',
        email: 'Email is required',
        address: 'Address is required'
      });
    });

    test('should validate phone number format', async () => {
      const invalidPhoneDeliveryInfo = {
        name: 'John Doe',
        phoneNumber: 'invalid-phone',
        email: 'john@example.com',
        address: '123 Main St'
      };

      const result = await DeliveryRepository.validateDeliveryInfo(invalidPhoneDeliveryInfo);

      expect(result.isValid).toBe(false);
      expect(result.errors.phoneNumber).toBe('Please enter a valid phone number');
    });

    test('should validate email format', async () => {
      const invalidEmailDeliveryInfo = {
        name: 'John Doe',
        phoneNumber: '+1234567890',
        email: 'invalid-email',
        address: '123 Main St'
      };

      const result = await DeliveryRepository.validateDeliveryInfo(invalidEmailDeliveryInfo);

      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Please enter a valid email address');
    });

    test('should accept valid phone number formats', async () => {
      const validPhoneNumbers = [
        '+1234567890',
        '123-456-7890',
        '(123) 456-7890',
        '123 456 7890'
      ];

      for (const phoneNumber of validPhoneNumbers) {
        const deliveryInfo = {
          name: 'John Doe',
          phoneNumber,
          email: 'john@example.com',
          address: '123 Main St'
        };

        const result = await DeliveryRepository.validateDeliveryInfo(deliveryInfo);
        expect(result.isValid).toBe(true);
      }
    });
  });
});
