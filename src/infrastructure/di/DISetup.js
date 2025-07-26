/**
 * Dependency Injection Setup
 * Configures all dependencies for the application
 */

import container from './DIContainer';

// Infrastructure
import { StorageService } from '../storage/StorageService';

// Data Layer
import { CartRepository } from '../../data/repositories/CartRepository';
import { DeliveryRepository } from '../../data/repositories/DeliveryRepository';
import { MenuRepository } from '../../data/repositories/MenuRepository';

// Domain Layer
import { CartUseCases } from '../../domain/usecases/CartUseCases';
import { DeliveryUseCases } from '../../domain/usecases/DeliveryUseCases';

/**
 * Configure all dependencies
 */
export const configureDependencies = () => {
  // Infrastructure Layer
  container.register('StorageService', () => StorageService, true);

  // Data Layer (Repositories)
  container.register('CartRepository', (container) => {
    const storageService = container.resolve('StorageService');
    return new CartRepository(storageService);
  }, true);

  container.register('DeliveryRepository', (container) => {
    const storageService = container.resolve('StorageService');
    return new DeliveryRepository(storageService);
  }, true);

  container.register('MenuRepository', (container) => {
    const storageService = container.resolve('StorageService');
    return new MenuRepository(storageService);
  }, true);

  // Domain Layer (Use Cases)
  container.register('CartUseCases', (container) => {
    const cartRepository = container.resolve('CartRepository');
    return new CartUseCases(cartRepository);
  }, true);

  container.register('DeliveryUseCases', (container) => {
    const deliveryRepository = container.resolve('DeliveryRepository');
    return new DeliveryUseCases(deliveryRepository);
  }, true);
};

/**
 * Get configured container
 * @returns {DIContainer}
 */
export const getContainer = () => {
  return container;
};

export default container;
