# Lemonade App Tests

This directory contains test cases for the Lemonade Stand application.

## Test Structure

```
__tests__/
├── domain/
│   └── models/
│       └── CartItem.test.js          # Tests for CartItem model
├── data/
│   └── repositories/
│       └── CartRepository.test.js    # Tests for CartRepository
└── presentation/
    ├── components/
    │   └── AddToCartModal.test.js    # Tests for AddToCartModal component
    ├── screens/
    │   └── MenuScreen.test.js        # Tests for MenuScreen
    └── viewModels/
        └── useCartViewModel.test.js  # Tests for useCartViewModel hook
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test CartItem.test.js
```

## Test Coverage

The tests cover the following functionality:

### CartItem Model
- ✅ Constructor with valid item data
- ✅ Handling of undefined/invalid items
- ✅ Price calculations for different size options
- ✅ Total price calculation

### CartRepository
- ✅ Getting cart items from storage
- ✅ Adding new items to cart
- ✅ Updating existing item quantities
- ✅ Removing items from cart
- ✅ Clearing cart
- ✅ Operation queue for race condition prevention
- ✅ Error handling

### useCartViewModel Hook
- ✅ Initial loading state
- ✅ Loading cart items on mount
- ✅ Adding items to cart
- ✅ Removing items from cart
- ✅ Clearing cart
- ✅ Total calculation
- ✅ Error handling

### AddToCartModal Component
- ✅ Rendering when visible/hidden
- ✅ Displaying item details
- ✅ Button interactions
- ✅ Handling missing item data

### MenuScreen Component
- ✅ Basic rendering
- ✅ Loading and error states
- ✅ Item selection and modal display
- ✅ Search functionality
- ✅ Category filtering
- ✅ Cart navigation

## Test Setup

The tests use:
- **Jest** as the test runner
- **React Native Testing Library** for component testing
- **React Hooks Testing Library** for hook testing

## Mocking

The following modules are mocked in the test setup:
- `react-native-vector-icons`
- `@react-native-async-storage/async-storage`
- `@react-navigation/native`
- React Native Animated APIs

## Notes

- Tests focus on the core functionality we implemented
- Component tests verify UI behavior and user interactions
- Repository tests verify data persistence and error handling
- ViewModel tests verify business logic and state management
- All tests include error scenarios and edge cases
