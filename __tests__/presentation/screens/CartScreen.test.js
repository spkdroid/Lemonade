import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CartScreen from '../../../src/presentation/screens/CartScreen';
import { useCartViewModel } from '../../../src/presentation/viewModels/useCartViewModel';
import { useDeliveryViewModel } from '../../../src/presentation/viewModels/useDeliveryViewModel';
import { useCheckoutViewModel } from '../../../src/presentation/viewModels/useCheckoutViewModel';
import { Alert } from 'react-native';

// Mock the view models
jest.mock('../../../src/presentation/viewModels/useCartViewModel');
jest.mock('../../../src/presentation/viewModels/useDeliveryViewModel');
jest.mock('../../../src/presentation/viewModels/useCheckoutViewModel');

// Mock React Native components
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock the navigation prop
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
};

// Mock image assets
jest.mock('../../../src/presentation/assets/add_icon.png', () => 'add_icon.png');
jest.mock('../../../src/presentation/assets/minus_icon.png', () => 'minus_icon.png');
jest.mock('../../../src/presentation/assets/cancel_icon.png', () => 'cancel_icon.png');

// Mock components
jest.mock('../../../src/presentation/components/DeliveryCard', () => {
  return ({ deliveryInfo, onEdit }) => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    return (
      <View testID="delivery-card">
        <Text>{deliveryInfo?.name || 'No delivery info'}</Text>
        <TouchableOpacity onPress={onEdit} testID="edit-delivery-button">
          <Text>Edit</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.mock('../../../src/presentation/components/DeliveryEditModal', () => {
  return ({ visible, deliveryInfo, onSave, onClose }) => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    if (!visible) return null;
    return (
      <View testID="delivery-edit-modal">
        <Text>Delivery Edit Modal</Text>
        <TouchableOpacity 
          onPress={() => onSave({ name: 'John Doe', phoneNumber: '123-456-7890' })}
          testID="save-delivery-button"
        >
          <Text>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} testID="close-delivery-button">
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.mock('../../../src/presentation/components/CheckoutBillModal', () => {
  return ({ visible, cartItems, deliveryInfo, onConfirm, onCancel }) => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    if (!visible) return null;
    return (
      <View testID="checkout-bill-modal">
        <Text>Checkout Bill Modal</Text>
        <TouchableOpacity onPress={onConfirm} testID="confirm-checkout-button">
          <Text>Confirm Order</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCancel} testID="cancel-checkout-button">
          <Text>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.mock('../../../src/presentation/components/AddToCartModal', () => ({
  ConfirmationModal: ({ visible, title, message, onConfirm, onCancel }) => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    if (!visible) return null;
    return (
      <View testID="confirmation-modal">
        <Text>{title}</Text>
        <Text>{message}</Text>
        <TouchableOpacity onPress={onConfirm} testID="confirm-button">
          <Text>Confirm</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCancel} testID="cancel-button">
          <Text>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }
}));

jest.mock('../../../src/presentation/components/OrderReceiptModal', () => {
  return ({ visible, orderData, onClose }) => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    if (!visible) return null;
    return (
      <View testID="order-receipt-modal">
        <Text>Order Receipt</Text>
        <Text>{orderData?.orderNumber || 'No order number'}</Text>
        <TouchableOpacity onPress={onClose} testID="close-receipt-button">
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

describe('CartScreen', () => {
  // Default mock implementations
  const mockCartViewModel = {
    cartItems: [],
    loading: false,
    error: null,
    removeFromCart: jest.fn(),
    updateCartItem: jest.fn(),
    clearCart: jest.fn(),
    getTotal: jest.fn(() => 0),
  };

  const mockDeliveryViewModel = {
    deliveryInfo: null,
    loading: false,
    error: null,
    validationErrors: {},
    saveDeliveryInfo: jest.fn(),
    hasDeliveryInfo: jest.fn(() => false),
  };

  const mockCheckoutViewModel = {
    processCheckout: jest.fn(),
    loading: false,
    error: null,
    lastOrder: null,
    clearError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCartViewModel.mockReturnValue(mockCartViewModel);
    useDeliveryViewModel.mockReturnValue(mockDeliveryViewModel);
    useCheckoutViewModel.mockReturnValue(mockCheckoutViewModel);
  });

  describe('Empty Cart State', () => {
    test('should render empty cart message when no items', () => {
      const { getByText } = render(<CartScreen navigation={mockNavigation} />);
      
      expect(getByText('Your cart is empty')).toBeTruthy();
      expect(getByText('Add some delicious drinks to get started!')).toBeTruthy();
    });

    test('should show continue shopping button in empty cart', () => {
      const { getByText } = render(<CartScreen navigation={mockNavigation} />);
      
      const continueButton = getByText('Continue Shopping');
      expect(continueButton).toBeTruthy();
      
      fireEvent.press(continueButton);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Menu');
    });
  });

  describe('Cart with Items', () => {
    const mockCartItems = [
      {
        id: '1',
        name: 'Classic Lemonade',
        price: 4.99,
        quantity: 2,
        selectedSize: 'Large',
        image: 'https://example.com/lemonade.jpg'
      },
      {
        id: '2',
        name: 'Pink Lemonade',
        price: 5.49,
        quantity: 1,
        selectedSize: 'Medium',
        image: null
      }
    ];

    beforeEach(() => {
      useCartViewModel.mockReturnValue({
        ...mockCartViewModel,
        cartItems: mockCartItems,
        getTotal: jest.fn(() => 15.47),
      });
    });

    test('should render cart items correctly', () => {
      const { getByText } = render(<CartScreen navigation={mockNavigation} />);
      
      expect(getByText('Classic Lemonade')).toBeTruthy();
      expect(getByText('Pink Lemonade')).toBeTruthy();
      expect(getByText('Size: Large')).toBeTruthy();
      expect(getByText('Size: Medium')).toBeTruthy();
      expect(getByText('$4.99 each')).toBeTruthy();
      expect(getByText('$5.49 each')).toBeTruthy();
    });

    test('should show checkout button with items', () => {
      const { getByText } = render(<CartScreen navigation={mockNavigation} />);
      
      expect(getByText('Checkout')).toBeTruthy();
      expect(getByText('Total: $15.47')).toBeTruthy();
    });
  });

  describe('Delivery Information', () => {
    test('should show delivery card', () => {
      const { getByTestId } = render(<CartScreen navigation={mockNavigation} />);
      
      // In empty cart, delivery card should not be visible
      expect(() => getByTestId('delivery-card')).toThrow();
    });

    test('should show delivery card with items', () => {
      useCartViewModel.mockReturnValue({
        ...mockCartViewModel,
        cartItems: [{
          id: '1',
          name: 'Classic Lemonade',
          price: 4.99,
          quantity: 1
        }],
      });

      const { getByTestId } = render(<CartScreen navigation={mockNavigation} />);
      
      expect(getByTestId('delivery-card')).toBeTruthy();
    });
  });

  describe('Checkout Process', () => {
    const mockCartItems = [
      {
        id: '1',
        name: 'Classic Lemonade',
        price: 4.99,
        quantity: 2,
        selectedSize: 'Large'
      }
    ];

    beforeEach(() => {
      useCartViewModel.mockReturnValue({
        ...mockCartViewModel,
        cartItems: mockCartItems,
      });
    });

    test('should show checkout button when items present', () => {
      const { getByText } = render(<CartScreen navigation={mockNavigation} />);
      
      const checkoutButton = getByText('Checkout');
      expect(checkoutButton).toBeTruthy();
      
      fireEvent.press(checkoutButton);
      
      // Should prompt for delivery info since hasDeliveryInfo returns false
      expect(Alert.alert).toHaveBeenCalledWith(
        'Delivery Information Required',
        'Please add your delivery information before proceeding to checkout.',
        expect.any(Array)
      );
    });

    test('should open checkout modal when delivery info is complete', () => {
      useDeliveryViewModel.mockReturnValue({
        ...mockDeliveryViewModel,
        hasDeliveryInfo: jest.fn(() => true),
        deliveryInfo: { name: 'John Doe', phoneNumber: '123-456-7890' }
      });

      const { getByText, getByTestId } = render(<CartScreen navigation={mockNavigation} />);
      
      const checkoutButton = getByText('Checkout');
      fireEvent.press(checkoutButton);
      
      expect(getByTestId('checkout-bill-modal')).toBeTruthy();
    });
  });

  describe('Loading States', () => {
    test('should show loading indicator when cart is loading', () => {
      useCartViewModel.mockReturnValue({
        ...mockCartViewModel,
        loading: true,
      });

      const { UNSAFE_getByType } = render(<CartScreen navigation={mockNavigation} />);
      
      expect(UNSAFE_getByType('ActivityIndicator')).toBeTruthy();
    });

    test('should show processing text during checkout', () => {
      useCheckoutViewModel.mockReturnValue({
        ...mockCheckoutViewModel,
        loading: true,
      });

      useCartViewModel.mockReturnValue({
        ...mockCartViewModel,
        cartItems: [{
          id: '1',
          name: 'Classic Lemonade',
          price: 4.99,
          quantity: 1
        }],
      });

      const { getByText } = render(<CartScreen navigation={mockNavigation} />);
      
      expect(getByText('Processing...')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    test('should display cart error message', () => {
      useCartViewModel.mockReturnValue({
        ...mockCartViewModel,
        error: 'Failed to load cart items',
      });

      const { getByText } = render(<CartScreen navigation={mockNavigation} />);
      
      expect(getByText('Failed to load cart items')).toBeTruthy();
    });
  });
});
