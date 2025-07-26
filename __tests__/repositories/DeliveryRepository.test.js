import { DeliveryRepository } from '../../src/data/repositories/DeliveryRepository';
import { DeliveryInfo } from '../../src/domain/models/DeliveryInfo';

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

describe('DeliveryRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.__DEV__ = false;
  });

  describe('saveDeliveryInfo', () => {
    it('should save delivery info to storage', async () => {
      const deliveryInfo = new DeliveryInfo({
        id: 'delivery-123',
        name: 'John Doe',
        phoneNumber: '+1234567890',
        address: '123 Main St',
        city: 'Anytown'
      });

      mockAsyncStorage.setItem.mockResolvedValue();

      await DeliveryRepository.saveDeliveryInfo(deliveryInfo);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'delivery_info',
        expect.stringContaining('"id":"delivery-123"')
      );
    });

    it('should handle storage errors', async () => {
      const deliveryInfo = new DeliveryInfo({ name: 'John Doe' });
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage Error'));

      await expect(DeliveryRepository.saveDeliveryInfo(deliveryInfo))
        .rejects.toThrow('Failed to save delivery info');
    });

    it('should validate delivery info before saving', async () => {
      const invalidDeliveryInfo = new DeliveryInfo({
        name: '', // Invalid - empty name
        phoneNumber: '+1234567890'
      });

      await expect(DeliveryRepository.saveDeliveryInfo(invalidDeliveryInfo))
        .rejects.toThrow('Invalid delivery information');
    });
  });

  describe('getDeliveryInfo', () => {
    it('should retrieve delivery info from storage', async () => {
      const storedData = {
        id: 'delivery-123',
        name: 'John Doe',
        phoneNumber: '+1234567890',
        address: '123 Main St',
        city: 'Anytown',
        isDefault: true
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedData));

      const result = await DeliveryRepository.getDeliveryInfo();

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('delivery_info');
      expect(result).toBeInstanceOf(DeliveryInfo);
      expect(result.name).toBe('John Doe');
      expect(result.phoneNumber).toBe('+1234567890');
    });

    it('should return default delivery info when no data stored', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await DeliveryRepository.getDeliveryInfo();

      expect(result).toBeInstanceOf(DeliveryInfo);
      expect(result.name).toBe('');
      expect(result.isDefault).toBe(true);
    });

    it('should handle corrupted storage data', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid json');

      const result = await DeliveryRepository.getDeliveryInfo();

      expect(result).toBeInstanceOf(DeliveryInfo);
      expect(result.name).toBe('');
    });

    it('should handle storage read errors', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Read Error'));

      await expect(DeliveryRepository.getDeliveryInfo())
        .rejects.toThrow('Failed to retrieve delivery info');
    });
  });

  describe('updateDeliveryInfo', () => {
    it('should update existing delivery info', async () => {
      const existingData = {
        id: 'delivery-123',
        name: 'John Doe',
        phoneNumber: '+1234567890',
        address: '123 Main St'
      };

      const updates = {
        name: 'Jane Doe',
        address: '456 Oak St',
        city: 'New City'
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingData));
      mockAsyncStorage.setItem.mockResolvedValue();

      const result = await DeliveryRepository.updateDeliveryInfo(updates);

      expect(result).toBeInstanceOf(DeliveryInfo);
      expect(result.name).toBe('Jane Doe');
      expect(result.address).toBe('456 Oak St');
      expect(result.city).toBe('New City');
      expect(result.phoneNumber).toBe('+1234567890'); // unchanged
    });

    it('should create new delivery info if none exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue();

      const updates = {
        name: 'New User',
        phoneNumber: '+0987654321',
        address: '789 Pine St'
      };

      const result = await DeliveryRepository.updateDeliveryInfo(updates);

      expect(result).toBeInstanceOf(DeliveryInfo);
      expect(result.name).toBe('New User');
      expect(result.phoneNumber).toBe('+0987654321');
    });

    it('should validate updated delivery info', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const invalidUpdates = {
        name: '', // Invalid
        phoneNumber: 'invalid'
      };

      await expect(DeliveryRepository.updateDeliveryInfo(invalidUpdates))
        .rejects.toThrow('Invalid delivery information');
    });
  });

  describe('clearDeliveryInfo', () => {
    it('should clear delivery info from storage', async () => {
      mockAsyncStorage.removeItem.mockResolvedValue();

      await DeliveryRepository.clearDeliveryInfo();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('delivery_info');
    });

    it('should handle storage clear errors', async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error('Clear Error'));

      await expect(DeliveryRepository.clearDeliveryInfo())
        .rejects.toThrow('Failed to clear delivery info');
    });
  });

  describe('hasDeliveryInfo', () => {
    it('should return true when valid delivery info exists', async () => {
      const validData = {
        name: 'John Doe',
        phoneNumber: '+1234567890',
        email: 'john@example.com',
        address: '123 Main St'
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(validData));

      const result = await DeliveryRepository.hasDeliveryInfo();

      expect(result).toBe(true);
    });

    it('should return false when no delivery info exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await DeliveryRepository.hasDeliveryInfo();

      expect(result).toBe(false);
    });

    it('should return false when delivery info is invalid', async () => {
      const invalidData = {
        name: '', // Invalid
        phoneNumber: '+1234567890'
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(invalidData));

      const result = await DeliveryRepository.hasDeliveryInfo();

      expect(result).toBe(false);
    });

    it('should handle storage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage Error'));

      const result = await DeliveryRepository.hasDeliveryInfo();

      expect(result).toBe(false);
    });
  });

  describe('setAsDefault', () => {
    it('should set delivery info as default', async () => {
      const existingData = {
        id: 'delivery-123',
        name: 'John Doe',
        isDefault: false
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingData));
      mockAsyncStorage.setItem.mockResolvedValue();

      await DeliveryRepository.setAsDefault('delivery-123');

      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
      expect(savedData.isDefault).toBe(true);
    });

    it('should handle non-existent delivery info', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      await expect(DeliveryRepository.setAsDefault('non-existent'))
        .rejects.toThrow('Delivery info not found');
    });
  });

  describe('getAllDeliveryInfo', () => {
    it('should return array with single delivery info', async () => {
      const storedData = {
        id: 'delivery-123',
        name: 'John Doe',
        phoneNumber: '+1234567890'
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedData));

      const result = await DeliveryRepository.getAllDeliveryInfo();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(DeliveryInfo);
      expect(result[0].name).toBe('John Doe');
    });

    it('should return empty array when no data exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await DeliveryRepository.getAllDeliveryInfo();

      expect(result).toEqual([]);
    });
  });

  describe('validateDeliveryInfo', () => {
    it('should validate complete delivery info', () => {
      const validInfo = new DeliveryInfo({
        name: 'John Doe',
        phoneNumber: '+1234567890',
        email: 'john@example.com',
        address: '123 Main St'
      });

      expect(() => DeliveryRepository.validateDeliveryInfo(validInfo))
        .not.toThrow();
    });

    it('should reject invalid delivery info', () => {
      const invalidInfo = new DeliveryInfo({
        name: '', // Invalid
        phoneNumber: '+1234567890'
      });

      expect(() => DeliveryRepository.validateDeliveryInfo(invalidInfo))
        .toThrow('Invalid delivery information');
    });

    it('should handle null delivery info', () => {
      expect(() => DeliveryRepository.validateDeliveryInfo(null))
        .toThrow('Delivery info is required');
    });
  });

  describe('backup and restore', () => {
    it('should create backup of delivery info', async () => {
      const deliveryData = {
        id: 'delivery-123',
        name: 'John Doe',
        phoneNumber: '+1234567890'
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(deliveryData));
      mockAsyncStorage.setItem.mockResolvedValue();

      await DeliveryRepository.createBackup();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'delivery_info_backup',
        expect.stringContaining('"name":"John Doe"')
      );
    });

    it('should restore from backup', async () => {
      const backupData = {
        id: 'delivery-123',
        name: 'Backup User',
        phoneNumber: '+1234567890',
        address: '123 Backup St'
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(backupData));
      mockAsyncStorage.setItem.mockResolvedValue();

      const result = await DeliveryRepository.restoreFromBackup();

      expect(result).toBeInstanceOf(DeliveryInfo);
      expect(result.name).toBe('Backup User');
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'delivery_info',
        expect.stringContaining('"name":"Backup User"')
      );
    });

    it('should handle missing backup', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      await expect(DeliveryRepository.restoreFromBackup())
        .rejects.toThrow('No backup found');
    });
  });
});
