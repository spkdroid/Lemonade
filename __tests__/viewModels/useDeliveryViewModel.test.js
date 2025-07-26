import { renderHook, act } from '@testing-library/react-native';
import { useDeliveryViewModel } from '../../src/presentation/viewModels/useDeliveryViewModel';
import { DeliveryUseCases } from '../../src/domain/usecases/DeliveryUseCases';
import { DeliveryInfo } from '../../src/domain/models/DeliveryInfo';

// Mock the use cases
jest.mock('../../src/domain/usecases/DeliveryUseCases', () => ({
  DeliveryUseCases: {
    getDeliveryInfo: jest.fn(),
    saveDeliveryInfo: jest.fn(),
    updateDeliveryInfo: jest.fn(),
    clearDeliveryInfo: jest.fn(),
    hasDeliveryInfo: jest.fn(),
    validateForCheckout: jest.fn(),
    formatPhoneNumber: jest.fn(),
    validateEmailFormat: jest.fn(),
    validatePhoneNumber: jest.fn()
  }
}));

describe('useDeliveryViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.__DEV__ = false;
  });

  const mockDeliveryInfo = new DeliveryInfo({
    id: 'delivery-123',
    name: 'John Doe',
    phoneNumber: '+1234567890',
    email: 'john@example.com',
    address: '123 Main St',
    city: 'Anytown',
    zipCode: '12345',
    deliveryInstructions: 'Ring doorbell'
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      DeliveryUseCases.getDeliveryInfo.mockResolvedValue(new DeliveryInfo());

      const { result } = renderHook(() => useDeliveryViewModel());

      expect(result.current.deliveryInfo).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.validationErrors).toEqual({});
      expect(result.current.hasExistingInfo).toBe(false);
    });

    it('should load delivery info on mount', async () => {
      DeliveryUseCases.getDeliveryInfo.mockResolvedValue(mockDeliveryInfo);

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(DeliveryUseCases.getDeliveryInfo).toHaveBeenCalled();
      expect(result.current.deliveryInfo).toEqual(mockDeliveryInfo);
      expect(result.current.hasExistingInfo).toBe(true);
    });

    it('should handle loading error', async () => {
      DeliveryUseCases.getDeliveryInfo.mockRejectedValue(new Error('Load failed'));

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.error).toBe('Load failed');
      expect(result.current.deliveryInfo).toBeNull();
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

    it('should save delivery info successfully', async () => {
      DeliveryUseCases.getDeliveryInfo.mockResolvedValue(new DeliveryInfo());
      DeliveryUseCases.saveDeliveryInfo.mockResolvedValue();

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.saveDeliveryInfo(validDeliveryData);
      });

      expect(DeliveryUseCases.saveDeliveryInfo).toHaveBeenCalledWith(validDeliveryData);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle save error', async () => {
      DeliveryUseCases.getDeliveryInfo.mockResolvedValue(new DeliveryInfo());
      DeliveryUseCases.saveDeliveryInfo.mockRejectedValue(new Error('Save failed'));

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.saveDeliveryInfo(validDeliveryData);
      });

      expect(result.current.error).toBe('Save failed');
      expect(result.current.isSaving).toBe(false);
    });

    it('should set saving state during save', async () => {
      DeliveryUseCases.getDeliveryInfo.mockResolvedValue(new DeliveryInfo());
      DeliveryUseCases.saveDeliveryInfo.mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.saveDeliveryInfo(validDeliveryData);
      });

      expect(result.current.isSaving).toBe(true);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.isSaving).toBe(false);
    });

    it('should update delivery info after successful save', async () => {
      const updatedInfo = new DeliveryInfo(validDeliveryData);
      DeliveryUseCases.getDeliveryInfo.mockResolvedValue(new DeliveryInfo());
      DeliveryUseCases.saveDeliveryInfo.mockResolvedValue();
      
      // Mock the reload after save
      DeliveryUseCases.getDeliveryInfo.mockResolvedValueOnce(new DeliveryInfo())
        .mockResolvedValueOnce(updatedInfo);

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.saveDeliveryInfo(validDeliveryData);
      });

      expect(result.current.deliveryInfo.name).toBe('John Doe');
    });
  });

  describe('updateDeliveryInfo', () => {
    it('should update delivery info successfully', async () => {
      const updates = {
        name: 'Jane Doe',
        address: '456 Oak St'
      };

      const updatedInfo = new DeliveryInfo({
        ...mockDeliveryInfo,
        ...updates
      });

      DeliveryUseCases.getDeliveryInfo.mockResolvedValue(mockDeliveryInfo);
      DeliveryUseCases.updateDeliveryInfo.mockResolvedValue(updatedInfo);

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.updateDeliveryInfo(updates);
      });

      expect(DeliveryUseCases.updateDeliveryInfo).toHaveBeenCalledWith(updates);
      expect(result.current.deliveryInfo.name).toBe('Jane Doe');
      expect(result.current.deliveryInfo.address).toBe('456 Oak St');
    });

    it('should handle update error', async () => {
      DeliveryUseCases.getDeliveryInfo.mockResolvedValue(mockDeliveryInfo);
      DeliveryUseCases.updateDeliveryInfo.mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.updateDeliveryInfo({ name: 'New Name' });
      });

      expect(result.current.error).toBe('Update failed');
    });
  });

  describe('validation', () => {
    beforeEach(async () => {
      DeliveryUseCases.getDeliveryInfo.mockResolvedValue(new DeliveryInfo());
    });

    it('should validate phone number', async () => {
      DeliveryUseCases.validatePhoneNumber.mockReturnValue(true);

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.validatePhone('+1234567890');
      });

      expect(DeliveryUseCases.validatePhoneNumber).toHaveBeenCalledWith('+1234567890');
      expect(result.current.validationErrors.phoneNumber).toBeUndefined();
    });

    it('should set phone validation error', async () => {
      DeliveryUseCases.validatePhoneNumber.mockReturnValue(false);

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.validatePhone('123');
      });

      expect(result.current.validationErrors.phoneNumber).toBe('Invalid phone number format');
    });

    it('should validate email', async () => {
      DeliveryUseCases.validateEmailFormat.mockReturnValue(true);

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.validateEmail('john@example.com');
      });

      expect(DeliveryUseCases.validateEmailFormat).toHaveBeenCalledWith('john@example.com');
      expect(result.current.validationErrors.email).toBeUndefined();
    });

    it('should set email validation error', async () => {
      DeliveryUseCases.validateEmailFormat.mockReturnValue(false);

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.validateEmail('invalid-email');
      });

      expect(result.current.validationErrors.email).toBe('Invalid email format');
    });

    it('should validate all fields', async () => {
      const invalidData = {
        name: '',
        phoneNumber: '123',
        email: 'invalid',
        address: ''
      };

      DeliveryUseCases.validatePhoneNumber.mockReturnValue(false);
      DeliveryUseCases.validateEmailFormat.mockReturnValue(false);

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.validateAllFields(invalidData);
      });

      expect(result.current.validationErrors.name).toBe('Name is required');
      expect(result.current.validationErrors.phoneNumber).toBe('Invalid phone number format');
      expect(result.current.validationErrors.email).toBe('Invalid email format');
      expect(result.current.validationErrors.address).toBe('Address is required');
    });

    it('should clear validation errors for valid fields', async () => {
      DeliveryUseCases.validatePhoneNumber.mockReturnValue(true);
      DeliveryUseCases.validateEmailFormat.mockReturnValue(true);

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Set errors first
      act(() => {
        result.current.validateAllFields({
          name: '',
          phoneNumber: '123',
          email: 'invalid',
          address: ''
        });
      });

      expect(Object.keys(result.current.validationErrors)).toHaveLength(4);

      // Now validate with correct data
      act(() => {
        result.current.validateAllFields({
          name: 'John Doe',
          phoneNumber: '+1234567890',
          email: 'john@example.com',
          address: '123 Main St'
        });
      });

      expect(Object.keys(result.current.validationErrors)).toHaveLength(0);
    });
  });

  describe('formatPhone', () => {
    it('should format phone number', async () => {
      DeliveryUseCases.formatPhoneNumber.mockReturnValue('(123) 456-7890');

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const formatted = result.current.formatPhone('1234567890');

      expect(DeliveryUseCases.formatPhoneNumber).toHaveBeenCalledWith('1234567890');
      expect(formatted).toBe('(123) 456-7890');
    });

    it('should handle formatting errors', async () => {
      DeliveryUseCases.formatPhoneNumber.mockReturnValue('invalid');

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const formatted = result.current.formatPhone('invalid');

      expect(formatted).toBe('invalid');
    });
  });

  describe('clearDeliveryInfo', () => {
    it('should clear delivery info', async () => {
      DeliveryUseCases.getDeliveryInfo.mockResolvedValue(mockDeliveryInfo);
      DeliveryUseCases.clearDeliveryInfo.mockResolvedValue();

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.hasExistingInfo).toBe(true);

      await act(async () => {
        await result.current.clearDeliveryInfo();
      });

      expect(DeliveryUseCases.clearDeliveryInfo).toHaveBeenCalled();
      expect(result.current.deliveryInfo).toBeNull();
      expect(result.current.hasExistingInfo).toBe(false);
    });

    it('should handle clear error', async () => {
      DeliveryUseCases.getDeliveryInfo.mockResolvedValue(mockDeliveryInfo);
      DeliveryUseCases.clearDeliveryInfo.mockRejectedValue(new Error('Clear failed'));

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.clearDeliveryInfo();
      });

      expect(result.current.error).toBe('Clear failed');
    });
  });

  describe('validateForCheckout', () => {
    it('should validate delivery info for checkout', async () => {
      const validationResult = {
        isValid: true,
        errors: []
      };

      DeliveryUseCases.getDeliveryInfo.mockResolvedValue(mockDeliveryInfo);
      DeliveryUseCases.validateForCheckout.mockResolvedValue(validationResult);

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const result_validation = await act(async () => {
        return await result.current.validateForCheckout();
      });

      expect(DeliveryUseCases.validateForCheckout).toHaveBeenCalled();
      expect(result_validation.isValid).toBe(true);
    });

    it('should handle checkout validation errors', async () => {
      const validationResult = {
        isValid: false,
        errors: ['Name is required', 'Phone is required']
      };

      DeliveryUseCases.getDeliveryInfo.mockResolvedValue(new DeliveryInfo());
      DeliveryUseCases.validateForCheckout.mockResolvedValue(validationResult);

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const result_validation = await act(async () => {
        return await result.current.validateForCheckout();
      });

      expect(result_validation.isValid).toBe(false);
      expect(result_validation.errors).toEqual(['Name is required', 'Phone is required']);
    });
  });

  describe('state management', () => {
    it('should clear error', async () => {
      DeliveryUseCases.getDeliveryInfo.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should clear validation errors', async () => {
      DeliveryUseCases.getDeliveryInfo.mockResolvedValue(new DeliveryInfo());

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Set validation errors
      act(() => {
        result.current.validateAllFields({
          name: '',
          phoneNumber: '',
          email: '',
          address: ''
        });
      });

      expect(Object.keys(result.current.validationErrors)).toHaveLength(4);

      // Clear validation errors
      act(() => {
        result.current.clearValidationErrors();
      });

      expect(Object.keys(result.current.validationErrors)).toHaveLength(0);
    });

    it('should reload delivery info', async () => {
      const initialInfo = new DeliveryInfo({ name: 'Initial' });
      const updatedInfo = new DeliveryInfo({ name: 'Updated' });

      DeliveryUseCases.getDeliveryInfo.mockResolvedValueOnce(initialInfo)
        .mockResolvedValueOnce(updatedInfo);

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.deliveryInfo.name).toBe('Initial');

      await act(async () => {
        await result.current.reloadDeliveryInfo();
      });

      expect(result.current.deliveryInfo.name).toBe('Updated');
    });
  });

  describe('computed properties', () => {
    it('should indicate if delivery info is valid', async () => {
      DeliveryUseCases.getDeliveryInfo.mockResolvedValue(mockDeliveryInfo);

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isValid).toBe(true);
    });

    it('should indicate if delivery info is invalid', async () => {
      const invalidInfo = new DeliveryInfo({
        name: '',
        phoneNumber: '123'
      });

      DeliveryUseCases.getDeliveryInfo.mockResolvedValue(invalidInfo);

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isValid).toBe(false);
    });

    it('should get formatted address', async () => {
      DeliveryUseCases.getDeliveryInfo.mockResolvedValue(mockDeliveryInfo);

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.formattedAddress).toBe('123 Main St, Anytown, 12345');
    });

    it('should indicate if form has validation errors', async () => {
      DeliveryUseCases.getDeliveryInfo.mockResolvedValue(new DeliveryInfo());

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.hasValidationErrors).toBe(false);

      act(() => {
        result.current.validateAllFields({ name: '' });
      });

      expect(result.current.hasValidationErrors).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle null delivery info gracefully', async () => {
      DeliveryUseCases.getDeliveryInfo.mockResolvedValue(null);

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.deliveryInfo).toBeNull();
      expect(result.current.hasExistingInfo).toBe(false);
      expect(result.current.isValid).toBe(false);
      expect(result.current.formattedAddress).toBe('');
    });

    it('should handle concurrent save operations', async () => {
      DeliveryUseCases.getDeliveryInfo.mockResolvedValue(new DeliveryInfo());
      DeliveryUseCases.saveDeliveryInfo.mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() => useDeliveryViewModel());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Start multiple saves
      act(() => {
        result.current.saveDeliveryInfo({ name: 'First' });
        result.current.saveDeliveryInfo({ name: 'Second' });
        result.current.saveDeliveryInfo({ name: 'Third' });
      });

      expect(result.current.isSaving).toBe(true);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      // Should only save once
      expect(DeliveryUseCases.saveDeliveryInfo).toHaveBeenCalledTimes(1);
    });
  });
});
