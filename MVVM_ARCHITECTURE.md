# MVVM Architecture Guide

This Lemonade Stand app follows a clean MVVM (Model-View-ViewModel) architecture with Repository pattern and Dependency Injection.

## 📁 Folder Structure

```
src/
├── presentation/           # 🎨 View Layer (UI Components)
│   ├── screens/           # Screen components (Views)
│   │   ├── HomeScreen.js
│   │   └── CartScreen.js
│   ├── components/        # Reusable UI components
│   │   ├── DeliveryCard.js
│   │   └── DeliveryEditModal.js
│   ├── viewModels/        # ViewModels (Presentation Logic)
│   │   ├── useCartViewModel.js
│   │   ├── useMenuViewModel.js
│   │   └── useDeliveryViewModel.js
│   ├── navigation/        # Navigation configuration
│   │   └── AppNavigator.js
│   └── assets/           # Images, icons, fonts
│       ├── add_icon.png
│       ├── minus_icon.png
│       └── cancel_icon.png
│
├── domain/               # 🧠 Business Logic Layer
│   ├── models/           # Domain models/entities
│   │   ├── CartItem.js
│   │   └── DeliveryInfo.js
│   ├── repositories/     # Repository interfaces
│   │   ├── ICartRepository.js
│   │   ├── IMenuRepository.js
│   │   └── IDeliveryRepository.js
│   └── usecases/         # Business use cases
│       ├── CartUseCases.js
│       └── DeliveryUseCases.js
│
├── data/                 # 💾 Data Layer
│   ├── repositories/     # Repository implementations
│   │   ├── CartRepository.js
│   │   ├── MenuRepository.js
│   │   └── DeliveryRepository.js
│   ├── datasources/      # Data sources
│   │   ├── local/        # Local storage
│   │   └── remote/       # API services
│   │       └── MenuApiService.js
│   └── models/           # Data transfer objects
│
├── infrastructure/       # 🔧 Framework Layer
│   ├── di/              # Dependency injection
│   │   ├── DIContainer.js
│   │   └── DISetup.js
│   ├── storage/         # Storage implementations
│   │   └── StorageService.js
│   └── network/         # Network configurations
│
└── shared/              # 🔄 Shared utilities
    ├── constants/       # App constants
    │   └── AppConstants.js
    ├── utils/          # Utility functions
    │   └── CommonUtils.js
    └── types/          # TypeScript types
```

## 🏗️ Architecture Layers

### 1. **Presentation Layer** (`src/presentation/`)
- **Screens**: React Native screen components
- **Components**: Reusable UI components
- **ViewModels**: Manage UI state and handle user interactions
- **Navigation**: Navigation configuration

### 2. **Domain Layer** (`src/domain/`)
- **Models**: Core business entities (CartItem, DeliveryInfo)
- **Repository Interfaces**: Contracts for data operations
- **Use Cases**: Business logic and rules

### 3. **Data Layer** (`src/data/`)
- **Repository Implementations**: Concrete data access implementations
- **Data Sources**: Local storage and remote API services
- **DTOs**: Data transfer objects for API communication

### 4. **Infrastructure Layer** (`src/infrastructure/`)
- **Dependency Injection**: DI container and setup
- **Storage**: AsyncStorage implementations
- **Network**: HTTP client configurations

### 5. **Shared Layer** (`src/shared/`)
- **Constants**: App-wide constants
- **Utils**: Common utility functions
- **Types**: Shared TypeScript types

## 🔄 Data Flow

```
View → ViewModel → UseCase → Repository → DataSource
  ↑                                          ↓
  ←←←←←←←←←←← State Updates ←←←←←←←←←←←←←←←←←
```

1. **View** (Screen/Component) calls **ViewModel**
2. **ViewModel** calls **UseCase** for business logic
3. **UseCase** calls **Repository** interface
4. **Repository** implementation calls **DataSource**
5. Data flows back up through the layers
6. **ViewModel** updates state
7. **View** re-renders with new data

## 🎯 Key Benefits

### ✅ **Separation of Concerns**
- Each layer has a single responsibility
- Business logic is isolated from UI
- Data access is abstracted

### ✅ **Testability**
- Each layer can be unit tested independently
- Mocking is easy with interfaces
- Business logic testing without UI

### ✅ **Maintainability**
- Changes in one layer don't affect others
- Easy to add new features
- Clean code organization

### ✅ **Dependency Injection**
- Loose coupling between components
- Easy to swap implementations
- Better testing capabilities

### ✅ **Scalability**
- Easy to add new features
- Consistent patterns
- Team collaboration friendly

## 🚀 Usage Examples

### Adding a New Feature (Order History)

1. **Create Domain Model**
```javascript
// src/domain/models/Order.js
export class Order {
  constructor(data) {
    this.id = data.id;
    this.items = data.items;
    this.total = data.total;
    this.status = data.status;
  }
}
```

2. **Create Repository Interface**
```javascript
// src/domain/repositories/IOrderRepository.js
export class IOrderRepository {
  async getOrderHistory() { /* ... */ }
  async createOrder() { /* ... */ }
}
```

3. **Create Use Case**
```javascript
// src/domain/usecases/OrderUseCases.js
export class OrderUseCases {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }
  
  async placeOrder(cartItems, deliveryInfo) {
    // Business logic here
  }
}
```

4. **Implement Repository**
```javascript
// src/data/repositories/OrderRepository.js
export class OrderRepository extends IOrderRepository {
  async getOrderHistory() {
    // Data access implementation
  }
}
```

5. **Create ViewModel**
```javascript
// src/presentation/viewModels/useOrderViewModel.js
export const useOrderViewModel = () => {
  const orderUseCases = getContainer().resolve('OrderUseCases');
  // ViewModel logic
};
```

6. **Create Screen**
```javascript
// src/presentation/screens/OrderHistoryScreen.js
const OrderHistoryScreen = () => {
  const { orders, loading } = useOrderViewModel();
  // UI implementation
};
```

## 🔧 Current Implementation Status

### ✅ **Completed**
- ✅ MVVM folder structure
- ✅ Domain models (CartItem, DeliveryInfo)
- ✅ Repository interfaces
- ✅ Use cases (Cart, Delivery)
- ✅ Dependency injection setup
- ✅ Constants and utilities
- ✅ Delivery information system

### 🚧 **In Progress**
- 🚧 Migrating existing repositories to new structure
- 🚧 Updating ViewModels to use DI
- 🚧 Updating screen imports

### 📋 **TODO**
- 📋 Add comprehensive unit tests
- 📋 Add integration tests
- 📋 Implement caching layer
- 📋 Add offline support
- 📋 Performance optimizations

## 📖 Migration Guide

To migrate existing code to use the new architecture:

1. **Move files to appropriate folders**
2. **Update import paths**
3. **Implement repository interfaces**
4. **Use dependency injection**
5. **Update ViewModels to use use cases**

This architecture provides a solid foundation for building scalable, maintainable React Native applications!
