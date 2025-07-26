import { useState, useEffect, useCallback } from 'react';
import { MenuUseCases } from '../../domain/usecases/MenuUseCases';

export const useMenuViewModel = () => {
  const [menuData, setMenuData] = useState({
    drinkOfTheDay: null,
    menuItems: [],
    addons: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredItems, setFilteredItems] = useState([]);

  const loadMenuData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (__DEV__) {
        console.log('Loading menu data...');
      }
      
      const data = await MenuUseCases.loadMenu();
      
      if (__DEV__) {
        console.log('Menu data loaded:', {
          menuItemsCount: data?.menuItems?.length || 0,
          addonsCount: data?.addons?.length || 0,
          drinkOfTheDay: data?.drinkOfTheDay?.name || 'None'
        });
      }
      
      setMenuData(data);
      setFilteredItems(data?.menuItems || []);
    } catch (err) {
      console.error('Error loading menu:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshMenu = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await MenuUseCases.refreshMenu();
      setMenuData(data);
      setFilteredItems(data?.menuItems || []);
      
      // Reset search and filter states
      setSearchTerm('');
      setSelectedCategory('all');
    } catch (err) {
      console.error('Error refreshing menu:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchMenuItems = useCallback((term) => {
    setSearchTerm(term);
    
    if (!menuData) return;
    
    let items = menuData.menuItems || [];
    
    // Apply search filter
    if (term && term.trim().length >= 2) {
      items = MenuUseCases.searchMenuItems(menuData, term);
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.type === selectedCategory);
    }
    
    setFilteredItems(items);
  }, [menuData, selectedCategory]);

  const filterByCategory = useCallback((category) => {
    setSelectedCategory(category);
    
    if (!menuData) return;
    
    let items = menuData.menuItems || [];
    
    // Apply category filter
    if (category !== 'all') {
      items = MenuUseCases.filterMenuItemsByType(menuData, category);
    }
    
    // Apply search filter
    if (searchTerm && searchTerm.trim().length >= 2) {
      items = items.filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.taste?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredItems(items);
  }, [menuData, searchTerm]);

  const validateItemForOrder = useCallback((item) => {
    return MenuUseCases.validateMenuItemForOrder(item);
  }, []);

  const getFeaturedDrink = useCallback(() => {
    return MenuUseCases.getFeaturedDrink(menuData);
  }, [menuData]);

  const getMenuCategories = useCallback(() => {
    return MenuUseCases.getMenuCategories(menuData);
  }, [menuData]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
    setFilteredItems(menuData?.menuItems || []);
  }, [menuData]);

  // Load menu data on component mount
  useEffect(() => {
    loadMenuData();
  }, [loadMenuData]);

  // Update filtered items when menu data changes
  useEffect(() => {
    if (menuData) {
      setFilteredItems(menuData.menuItems || []);
    }
  }, [menuData]);

  return {
    // Data
    menuData,
    filteredItems,
    searchTerm,
    selectedCategory,
    
    // State
    loading,
    error,
    
    // Actions
    refresh: refreshMenu,
    searchMenuItems,
    filterByCategory,
    clearSearch,
    validateItemForOrder,
    getFeaturedDrink,
    getMenuCategories,
    
    // Computed properties
    hasMenuItems: (menuData?.menuItems?.length || 0) > 0,
    hasAddons: (menuData?.addons?.length || 0) > 0,
    hasFeaturedDrink: !!menuData?.drinkOfTheDay,
    totalItemsCount: menuData?.menuItems?.length || 0,
    filteredItemsCount: filteredItems.length,
    availableCategories: menuData ? MenuUseCases.getMenuCategories(menuData) : [],
    isSearchActive: searchTerm.length >= 2,
    isCategoryFiltered: selectedCategory !== 'all'
  };
};