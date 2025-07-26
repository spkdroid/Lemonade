import { DeliveryInfo } from '../../src/domain/models/DeliveryInfo';

describe('DeliveryInfo', () => {
  describe('constructor', () => {
    it('should create DeliveryInfo with default values', () => {
      const deliveryInfo = new DeliveryInfo();

      expect(deliveryInfo.id).toBe('delivery_info_default');
      expect(deliveryInfo.name).toBe('');
      expect(deliveryInfo.phoneNumber).toBe('');
      expect(deliveryInfo.email).toBe('');
      expect(deliveryInfo.address).toBe('');
      expect(deliveryInfo.city).toBe('');
      expect(deliveryInfo.zipCode).toBe('');
      expect(deliveryInfo.deliveryInstructions).toBe('');
      expect(deliveryInfo.isDefault).toBe(true);
      expect(deliveryInfo.createdAt).toBeDefined();
      expect(deliveryInfo.updatedAt).toBeDefined();
    });

    it('should create DeliveryInfo with provided data', () => {
      const data = {
        id: 'delivery-123',
        name: 'John Doe',
        phoneNumber: '+1234567890',
        email: 'john@example.com',
        address: '123 Main St',
        city: 'Anytown',
        zipCode: '12345',
        deliveryInstructions: 'Ring doorbell',
        isDefault: false,
        createdAt: '2025-07-26T10:00:00Z',
        updatedAt: '2025-07-26T10:30:00Z'
      };

      const deliveryInfo = new DeliveryInfo(data);

      expect(deliveryInfo.id).toBe('delivery-123');
      expect(deliveryInfo.name).toBe('John Doe');
      expect(deliveryInfo.phoneNumber).toBe('+1234567890');
      expect(deliveryInfo.email).toBe('john@example.com');
      expect(deliveryInfo.address).toBe('123 Main St');
      expect(deliveryInfo.city).toBe('Anytown');
      expect(deliveryInfo.zipCode).toBe('12345');
      expect(deliveryInfo.deliveryInstructions).toBe('Ring doorbell');
      expect(deliveryInfo.isDefault).toBe(false);
      expect(deliveryInfo.createdAt).toBe('2025-07-26T10:00:00Z');
      expect(deliveryInfo.updatedAt).toBe('2025-07-26T10:30:00Z');
    });
  });

  describe('isValid', () => {
    it('should return true for valid delivery info', () => {
      const deliveryInfo = new DeliveryInfo({
        name: 'John Doe',
        phoneNumber: '+1234567890',
        email: 'john@example.com',
        address: '123 Main St'
      });

      expect(deliveryInfo.isValid()).toBe(true);
    });

    it('should return false for missing name', () => {
      const deliveryInfo = new DeliveryInfo({
        name: '',
        phoneNumber: '+1234567890',
        email: 'john@example.com',
        address: '123 Main St'
      });

      expect(deliveryInfo.isValid()).toBe(false);
    });

    it('should return false for missing phone number', () => {
      const deliveryInfo = new DeliveryInfo({
        name: 'John Doe',
        phoneNumber: '',
        email: 'john@example.com',
        address: '123 Main St'
      });

      expect(deliveryInfo.isValid()).toBe(false);
    });

    it('should return false for missing email', () => {
      const deliveryInfo = new DeliveryInfo({
        name: 'John Doe',
        phoneNumber: '+1234567890',
        email: '',
        address: '123 Main St'
      });

      expect(deliveryInfo.isValid()).toBe(false);
    });

    it('should return false for missing address', () => {
      const deliveryInfo = new DeliveryInfo({
        name: 'John Doe',
        phoneNumber: '+1234567890',
        email: 'john@example.com',
        address: ''
      });

      expect(deliveryInfo.isValid()).toBe(false);
    });

    it('should return false for invalid phone number', () => {
      const deliveryInfo = new DeliveryInfo({
        name: 'John Doe',
        phoneNumber: '123',
        email: 'john@example.com',
        address: '123 Main St'
      });

      expect(deliveryInfo.isValid()).toBe(false);
    });

    it('should handle whitespace-only fields', () => {
      const deliveryInfo = new DeliveryInfo({
        name: '   ',
        phoneNumber: '+1234567890',
        email: 'john@example.com',
        address: '123 Main St'
      });

      expect(deliveryInfo.isValid()).toBe(false);
    });
  });

  describe('isValidPhoneNumber', () => {
    it('should validate US phone numbers', () => {
      const deliveryInfo = new DeliveryInfo();

      deliveryInfo.phoneNumber = '+1234567890';
      expect(deliveryInfo.isValidPhoneNumber()).toBe(true);

      deliveryInfo.phoneNumber = '1234567890';
      expect(deliveryInfo.isValidPhoneNumber()).toBe(true);

      deliveryInfo.phoneNumber = '(123) 456-7890';
      expect(deliveryInfo.isValidPhoneNumber()).toBe(true);

      deliveryInfo.phoneNumber = '123-456-7890';
      expect(deliveryInfo.isValidPhoneNumber()).toBe(true);
    });

    it('should validate international phone numbers', () => {
      const deliveryInfo = new DeliveryInfo();

      deliveryInfo.phoneNumber = '+44 20 7946 0958';
      expect(deliveryInfo.isValidPhoneNumber()).toBe(true);

      deliveryInfo.phoneNumber = '+33 1 42 86 83 26';
      expect(deliveryInfo.isValidPhoneNumber()).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      const deliveryInfo = new DeliveryInfo();

      deliveryInfo.phoneNumber = '123';
      expect(deliveryInfo.isValidPhoneNumber()).toBe(false);

      deliveryInfo.phoneNumber = 'abc123def';
      expect(deliveryInfo.isValidPhoneNumber()).toBe(false);

      deliveryInfo.phoneNumber = '';
      expect(deliveryInfo.isValidPhoneNumber()).toBe(false);

      deliveryInfo.phoneNumber = '   ';
      expect(deliveryInfo.isValidPhoneNumber()).toBe(false);
    });

    it('should handle null and undefined phone numbers', () => {
      const deliveryInfo = new DeliveryInfo();

      deliveryInfo.phoneNumber = null;
      expect(deliveryInfo.isValidPhoneNumber()).toBe(false);

      deliveryInfo.phoneNumber = undefined;
      expect(deliveryInfo.isValidPhoneNumber()).toBe(false);
    });
  });

  describe('getFormattedPhoneNumber', () => {
    it('should format phone number by removing non-digits except +', () => {
      const deliveryInfo = new DeliveryInfo();

      deliveryInfo.phoneNumber = '(123) 456-7890';
      expect(deliveryInfo.getFormattedPhoneNumber()).toBe('1234567890');

      deliveryInfo.phoneNumber = '+1 (234) 567-890';
      expect(deliveryInfo.getFormattedPhoneNumber()).toBe('+1234567890');

      deliveryInfo.phoneNumber = '123.456.7890 ext 123';
      expect(deliveryInfo.getFormattedPhoneNumber()).toBe('12345678901234');
    });

    it('should handle empty phone number', () => {
      const deliveryInfo = new DeliveryInfo({ phoneNumber: '' });
      expect(deliveryInfo.getFormattedPhoneNumber()).toBe('');

      deliveryInfo.phoneNumber = null;
      expect(deliveryInfo.getFormattedPhoneNumber()).toBe('');
    });
  });

  describe('getFormattedAddress', () => {
    it('should format complete address', () => {
      const deliveryInfo = new DeliveryInfo({
        address: '123 Main St',
        city: 'Anytown',
        zipCode: '12345'
      });

      expect(deliveryInfo.getFormattedAddress()).toBe('123 Main St, Anytown, 12345');
    });

    it('should handle partial address', () => {
      const deliveryInfo = new DeliveryInfo({
        address: '123 Main St',
        city: 'Anytown',
        zipCode: ''
      });

      expect(deliveryInfo.getFormattedAddress()).toBe('123 Main St, Anytown');
    });

    it('should handle single field address', () => {
      const deliveryInfo = new DeliveryInfo({
        address: '123 Main St',
        city: '',
        zipCode: ''
      });

      expect(deliveryInfo.getFormattedAddress()).toBe('123 Main St');
    });

    it('should handle empty address', () => {
      const deliveryInfo = new DeliveryInfo({
        address: '',
        city: '',
        zipCode: ''
      });

      expect(deliveryInfo.getFormattedAddress()).toBe('');
    });

    it('should handle whitespace-only fields', () => {
      const deliveryInfo = new DeliveryInfo({
        address: '123 Main St',
        city: '   ',
        zipCode: '12345'
      });

      expect(deliveryInfo.getFormattedAddress()).toBe('123 Main St, 12345');
    });
  });

  describe('getDisplayName', () => {
    it('should return name when provided', () => {
      const deliveryInfo = new DeliveryInfo({ name: 'John Doe' });
      expect(deliveryInfo.getDisplayName()).toBe('John Doe');
    });

    it('should return default message for empty name', () => {
      const deliveryInfo = new DeliveryInfo({ name: '' });
      expect(deliveryInfo.getDisplayName()).toBe('No name provided');
    });

    it('should handle whitespace-only name', () => {
      const deliveryInfo = new DeliveryInfo({ name: '   ' });
      expect(deliveryInfo.getDisplayName()).toBe('No name provided');
    });

    it('should trim whitespace from name', () => {
      const deliveryInfo = new DeliveryInfo({ name: '  John Doe  ' });
      expect(deliveryInfo.getDisplayName()).toBe('John Doe');
    });
  });

  describe('setAsDefault', () => {
    it('should set delivery info as default', () => {
      const deliveryInfo = new DeliveryInfo({ isDefault: false });
      
      deliveryInfo.setAsDefault();
      
      expect(deliveryInfo.isDefault).toBe(true);
      expect(deliveryInfo.updatedAt).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update delivery info fields', () => {
      const deliveryInfo = new DeliveryInfo({
        name: 'John Doe',
        phoneNumber: '+1234567890',
        email: 'john@example.com'
      });

      const updates = {
        name: 'Jane Doe',
        phoneNumber: '+0987654321',
        address: '456 Oak St'
      };

      deliveryInfo.update(updates);

      expect(deliveryInfo.name).toBe('Jane Doe');
      expect(deliveryInfo.phoneNumber).toBe('+0987654321');
      expect(deliveryInfo.address).toBe('456 Oak St');
      expect(deliveryInfo.email).toBe('john@example.com'); // unchanged
    });

    it('should update timestamp', () => {
      const deliveryInfo = new DeliveryInfo();
      const originalTimestamp = deliveryInfo.updatedAt;

      // Wait a moment to ensure timestamp difference
      setTimeout(() => {
        deliveryInfo.update({ name: 'Updated Name' });
        expect(deliveryInfo.updatedAt).not.toBe(originalTimestamp);
      }, 1);
    });
  });

  describe('toJSON', () => {
    it('should return JSON representation', () => {
      const deliveryInfo = new DeliveryInfo({
        id: 'delivery-123',
        name: 'John Doe',
        phoneNumber: '+1234567890',
        email: 'john@example.com',
        address: '123 Main St',
        city: 'Anytown',
        zipCode: '12345'
      });

      const json = deliveryInfo.toJSON();

      expect(json).toEqual({
        id: 'delivery-123',
        name: 'John Doe',
        phoneNumber: '+1234567890',
        email: 'john@example.com',
        address: '123 Main St',
        city: 'Anytown',
        zipCode: '12345',
        deliveryInstructions: '',
        isDefault: true,
        createdAt: deliveryInfo.createdAt,
        updatedAt: deliveryInfo.updatedAt
      });
    });
  });
});
