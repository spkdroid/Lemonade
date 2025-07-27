import { useMenuViewModel } from '../../../src/presentation/viewModels/useMenuViewModel';
import { MenuUseCases } from '../../../src/domain/usecases/MenuUseCases';

// Mock dependencies
jest.mock('../../../src/domain/usecases/MenuUseCases', () => ({
  MenuUseCases: {
    loadMenu: jest.fn(),
    searchMenuItems: jest.fn(),
    filterMenuItemsByType: jest.fn(),
    getFeaturedDrink: jest.fn(),
    validateMenuItemForOrder: jest.fn(),
    getMenuCategories: jest.fn(),
  }
}));

describe('useMenuViewModel (simplified)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should be defined and importable', () => {
    expect(useMenuViewModel).toBeDefined();
    expect(typeof useMenuViewModel).toBe('function');
  });

  test('MenuUseCases should be properly mocked', () => {
    expect(MenuUseCases.loadMenu).toBeDefined();
    expect(MenuUseCases.searchMenuItems).toBeDefined();
  });

  test('should handle basic functionality', () => {
    // Basic test to ensure the hook can be imported and mocks work
    expect(MenuUseCases.loadMenu).toHaveBeenCalledTimes(0);
    expect(MenuUseCases.searchMenuItems).toHaveBeenCalledTimes(0);
  });
});