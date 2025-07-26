import { DeliveryUseCases } from '../../src/domain/usecases/DeliveryUseCases';
import { DeliveryRepository } from '../../src/data/repositories/DeliveryRepository';
import { DeliveryInfo } from '../../src/domain/models/DeliveryInfo';

// Mock the repository
jest.mock('../../src/data/repositories/DeliveryRepository', () => ({
  DeliveryRepository: {
    getDeliveryInfo: jest.fn(),
    saveDeliveryInfo: jest.fn(),
    updateDeliveryInfo: jest.fn(),
    clearDeliveryInfo: jest.fn(),
    hasDeliveryInfo: jest.fn(),
    setAsDefault: jest.fn(),
    getAllDeliveryInfo: jest.fn()
  }
}));

describe('DeliveryUseCases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.__DEV__ = false;
  });

  describe('getDeliveryInfo', () => {
    it('should return existing delivery info', async () => {
      const mockDeliveryInfo = new DeliveryInfo({
        id: 'delivery-123',
        name: 'John Doe',
        phoneNumber: '+1234567890',
        email: 'john@example.com',
        address: '123 Main St',
        city: 'Anytown'
      });

      DeliveryRepository.getDeliveryInfo.mockResolvedValue(mockDeliveryInfo);

      const result = await DeliveryUseCases.getDeliveryInfo();

      expect(DeliveryRepository.getDeliveryInfo).toHaveBeenCalled();
      expect(result).toBeInstanceOf(DeliveryInfo);
      expect(result.name).toBe('John Doe');
    });

    it('should handle repository errors', async () => {
      DeliveryRepository.getDeliveryInfo.mockRejectedValue(new Error('Storage Error'));

      await expect(DeliveryUseCases.getDeliveryInfo())
        .rejects.toThrow('Failed to get delivery info: Storage Error');
    });
  });

  describe('saveDeliveryInfo', () => {
    const validDeliveryData = {
      name: 'John Doe',
      phoneNumber: '+1234567890',
      email: 'john@example.com',
      address: '123 Main St',
      city: 'Anytown',
      zipCode: '12345'
    };

    it('should save valid delivery info', async () => {
      DeliveryRepository.saveDeliveryInfo.mockResolvedValue();

      await DeliveryUseCases.saveDeliveryInfo(validDeliveryData);

      expect(DeliveryRepository.saveDeliveryInfo).toHaveBeenCalledWith(
        expect.any(DeliveryInfo)
      );
    });

    it('should validate required fields', async () => {
      const invalidData = {
        name: '',
        phoneNumber: '+1234567890',
        email: 'john@example.com',
        address: '123 Main St'
      };

      await expect(DeliveryUseCases.saveDeliveryInfo(invalidData))
        .rejects.toThrow('Name is required');
    });

    it('should validate phone number format', async () => {
      const invalidData = {
        ...validDeliveryData,
        phoneNumber: '123' // Invalid phone
      };

      await expect(DeliveryUseCases.saveDeliveryInfo(invalidData))
        .rejects.toThrow('Invalid phone number format');
    });

    it('should validate email format', async () => {
      const invalidData = {
        ...validDeliveryData,
        email: 'invalid-email' // Invalid email
      };

      await expect(DeliveryUseCases.saveDeliveryInfo(invalidData))
        .rejects.toThrow('Invalid email format');
    });

    it('should handle repository errors', async () => {
      DeliveryRepository.saveDeliveryInfo.mockRejectedValue(new Error('Storage Error'));

      await expect(DeliveryUseCases.saveDeliveryInfo(validDeliveryData))
        .rejects.toThrow('Failed to save delivery info: Storage Error');
    });

    it('should format phone number before saving', async () => {
      const dataWithUnformattedPhone = {
        ...validDeliveryData,
        phoneNumber: '(123) 456-7890'
      };

      DeliveryRepository.saveDeliveryInfo.mockResolvedValue();

      await DeliveryUseCases.saveDeliveryInfo(dataWithUnformattedPhone);

      const savedInfo = DeliveryRepository.saveDeliveryInfo.mock.calls[0][0];
      expect(savedInfo.phoneNumber).toBe('(123) 456-7890'); // Original format preserved
    });
  });

  describe('updateDeliveryInfo', () => {
    it('should update delivery info', async () => {
      const updates = {
        name: 'Jane Doe',
        address: '456 Oak St'
      };

      const updatedInfo = new DeliveryInfo({
        id: 'delivery-123',
        name: 'Jane Doe',
        phoneNumber: '+1234567890',
        address: '456 Oak St'
      });

      DeliveryRepository.updateDeliveryInfo.mockResolvedValue(updatedInfo);

      const result = await DeliveryUseCases.updateDeliveryInfo(updates);

      expect(DeliveryRepository.updateDeliveryInfo).toHaveBeenCalledWith(updates);
      expect(result).toBeInstanceOf(DeliveryInfo);
      expect(result.name).toBe('Jane Doe');
      expect(result.address).toBe('456 Oak St');
    });

    it('should validate updates', async () => {
      const invalidUpdates = {
        phoneNumber: '123' // Invalid
      };

      await expect(DeliveryUseCases.updateDeliveryInfo(invalidUpdates))
        .rejects.toThrow('Invalid phone number format');
    });

    it('should handle partial updates', async () => {
      const partialUpdates = {
        city: 'New City'
      };

      DeliveryRepository.updateDeliveryInfo.mockResolvedValue(
        new DeliveryInfo(partialUpdates)
      );

      await expect(DeliveryUseCases.updateDeliveryInfo(partialUpdates))
        .resolves.toBeDefined();
    });

    it('should handle repository errors', async () => {
      DeliveryRepository.updateDeliveryInfo.mockRejectedValue(new Error('Update Error'));

      await expect(DeliveryUseCases.updateDeliveryInfo({ name: 'Test' }))
        .rejects.toThrow('Failed to update delivery info: Update Error');
    });
  });

  describe('validateDeliveryInfo', () => {
    it('should validate complete delivery info', () => {
      const validInfo = {
        name: 'John Doe',
        phoneNumber: '+1234567890',
        email: 'john@example.com',
        address: '123 Main St',
        city: 'Anytown'
      };

      expect(() => DeliveryUseCases.validateDeliveryInfo(validInfo))
        .not.toThrow();
    });

    it('should validate required name', () => {
      const invalidInfo = {
        name: '',
        phoneNumber: '+1234567890',
        email: 'john@example.com',
        address: '123 Main St'
      };

      expect(() => DeliveryUseCases.validateDeliveryInfo(invalidInfo))
        .toThrow('Name is required');
    });

    it('should validate phone number', () => {
      const invalidInfo = {
        name: 'John Doe',
        phoneNumber: '123',
        email: 'john@example.com',
        address: '123 Main St'
      };

      expect(() => DeliveryUseCases.validateDeliveryInfo(invalidInfo))
        .toThrow('Invalid phone number format');
    });

    it('should validate email format', () => {
      const invalidInfo = {
        name: 'John Doe',
        phoneNumber: '+1234567890',
        email: 'invalid-email',
        address: '123 Main St'
      };

      expect(() => DeliveryUseCases.validateDeliveryInfo(invalidInfo))
        .toThrow('Invalid email format');
    });

    it('should validate address', () => {
      const invalidInfo = {
        name: 'John Doe',
        phoneNumber: '+1234567890',
        email: 'john@example.com',
        address: ''
      };

      expect(() => DeliveryUseCases.validateDeliveryInfo(invalidInfo))
        .toThrow('Address is required');
    });

    it('should handle whitespace-only fields', () => {
      const invalidInfo = {
        name: '   ',
        phoneNumber: '+1234567890',
        email: 'john@example.com',
        address: '123 Main St'
      };

      expect(() => DeliveryUseCases.validateDeliveryInfo(invalidInfo))
        .toThrow('Name is required');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format US phone numbers', () => {
      const formatted = DeliveryUseCases.formatPhoneNumber('1234567890');
      expect(formatted).toBe('(123) 456-7890');
    });

    it('should handle phone numbers with country code', () => {
      const formatted = DeliveryUseCases.formatPhoneNumber('+11234567890');
      expect(formatted).toBe('+1 (123) 456-7890');
    });

    it('should handle already formatted numbers', () => {
      const formatted = DeliveryUseCases.formatPhoneNumber('(123) 456-7890');
      expect(formatted).toBe('(123) 456-7890');
    });

    it('should handle international numbers', () => {
      const formatted = DeliveryUseCases.formatPhoneNumber('+44 20 7946 0958');
      expect(formatted).toBe('+44 20 7946 0958'); // Keep international format
    });

    it('should handle invalid numbers', () => {
      const formatted = DeliveryUseCases.formatPhoneNumber('invalid');
      expect(formatted).toBe('invalid'); // Return as-is for invalid
    });

    it('should handle empty input', () => {
      const formatted = DeliveryUseCases.formatPhoneNumber('');
      expect(formatted).toBe('');
    });
  });

  describe('validateEmailFormat', () => {
    it('should validate correct email formats', () => {
      expect(DeliveryUseCases.validateEmailFormat('test@example.com')).toBe(true);
      expect(DeliveryUseCases.validateEmailFormat('user.name@domain.co.uk')).toBe(true);
      expect(DeliveryUseCases.validateEmailFormat('test+tag@example.org')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(DeliveryUseCases.validateEmailFormat('invalid')).toBe(false);
      expect(DeliveryUseCases.validateEmailFormat('test@')).toBe(false);
      expect(DeliveryUseCases.validateEmailFormat('@example.com')).toBe(false);
      expect(DeliveryUseCases.validateEmailFormat('test.example.com')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(DeliveryUseCases.validateEmailFormat('')).toBe(false);
      expect(DeliveryUseCases.validateEmailFormat(null)).toBe(false);
      expect(DeliveryUseCases.validateEmailFormat(undefined)).toBe(false);
    });
  });

  describe('validatePhoneNumber', () => {
    it('should validate US phone numbers', () => {
      expect(DeliveryUseCases.validatePhoneNumber('+1234567890')).toBe(true);
      expect(DeliveryUseCases.validatePhoneNumber('(123) 456-7890')).toBe(true);
      expect(DeliveryUseCases.validatePhoneNumber('123-456-7890')).toBe(true);
      expect(DeliveryUseCases.validatePhoneNumber('1234567890')).toBe(true);
    });

    it('should validate international phone numbers', () => {
      expect(DeliveryUseCases.validatePhoneNumber('+44 20 7946 0958')).toBe(true);
      expect(DeliveryUseCases.validatePhoneNumber('+33 1 42 86 83 26')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(DeliveryUseCases.validatePhoneNumber('123')).toBe(false);
      expect(DeliveryUseCases.validatePhoneNumber('abc123def')).toBe(false);
      expect(DeliveryUseCases.validatePhoneNumber('')).toBe(false);
      expect(DeliveryUseCases.validatePhoneNumber(null)).toBe(false);
    });
  });

  describe('clearDeliveryInfo', () => {
    it('should clear delivery info', async () => {
      DeliveryRepository.clearDeliveryInfo.mockResolvedValue();

      await DeliveryUseCases.clearDeliveryInfo();

      expect(DeliveryRepository.clearDeliveryInfo).toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      DeliveryRepository.clearDeliveryInfo.mockRejectedValue(new Error('Clear Error'));

      await expect(DeliveryUseCases.clearDeliveryInfo())
        .rejects.toThrow('Failed to clear delivery info: Clear Error');
    });
  });

  describe('hasDeliveryInfo', () => {
    it('should return true when delivery info exists', async () => {
      DeliveryRepository.hasDeliveryInfo.mockResolvedValue(true);

      const result = await DeliveryUseCases.hasDeliveryInfo();

      expect(result).toBe(true);
    });

    it('should return false when no delivery info exists', async () => {
      DeliveryRepository.hasDeliveryInfo.mockResolvedValue(false);

      const result = await DeliveryUseCases.hasDeliveryInfo();

      expect(result).toBe(false);
    });

    it('should handle repository errors', async () => {
      DeliveryRepository.hasDeliveryInfo.mockRejectedValue(new Error('Check Error'));

      const result = await DeliveryUseCases.hasDeliveryInfo();

      expect(result).toBe(false); // Default to false on error
    });
  });

  describe('getFormattedAddress', () => {
    it('should format complete address', async () => {
      const mockDeliveryInfo = new DeliveryInfo({
        address: '123 Main St',
        city: 'Anytown',
        zipCode: '12345'
      });

      DeliveryRepository.getDeliveryInfo.mockResolvedValue(mockDeliveryInfo);

      const formatted = await DeliveryUseCases.getFormattedAddress();

      expect(formatted).toBe('123 Main St, Anytown, 12345');
    });

    it('should handle missing delivery info', async () => {
      DeliveryRepository.getDeliveryInfo.mockResolvedValue(new DeliveryInfo());

      const formatted = await DeliveryUseCases.getFormattedAddress();

      expect(formatted).toBe('');
    });
  });

  describe('validateForCheckout', () => {
    it('should validate complete delivery info for checkout', async () => {
      const mockDeliveryInfo = new DeliveryInfo({
        name: 'John Doe',
        phoneNumber: '+1234567890',
        email: 'john@example.com',
        address: '123 Main St',
        city: 'Anytown'
      });

      DeliveryRepository.getDeliveryInfo.mockResolvedValue(mockDeliveryInfo);

      const result = await DeliveryUseCases.validateForCheckout();

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return errors for incomplete delivery info', async () => {
      const mockDeliveryInfo = new DeliveryInfo({
        name: '',
        phoneNumber: '123',
        email: 'invalid',
        address: ''
      });

      DeliveryRepository.getDeliveryInfo.mockResolvedValue(mockDeliveryInfo);

      const result = await DeliveryUseCases.validateForCheckout();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name is required');
      expect(result.errors).toContain('Valid phone number is required');
      expect(result.errors).toContain('Valid email is required');
      expect(result.errors).toContain('Address is required');
    });

    it('should handle repository errors', async () => {
      DeliveryRepository.getDeliveryInfo.mockRejectedValue(new Error('Storage Error'));

      const result = await DeliveryUseCases.validateForCheckout();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unable to retrieve delivery information');
    });
  });
});
