import { useState, useEffect } from 'react';
import { MenuRepository } from '../../data/repositories/MenuRepository';

export const useMenuViewModel = () => {
  const [menuData, setMenuData] = useState({
    drinkOfTheDay: null,
    menuItems: [],
    addons: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMenuData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading menu data...');
      
      const data = await MenuRepository.getMenu();
      console.log('Raw menu data received:', data);
      console.log('Menu items count:', data?.menuItems?.length || 0);
      console.log('Addons count:', data?.addons?.length || 0);
      console.log('Drink of the day:', data?.drinkOfTheDay?.name || 'None');
      
      setMenuData(data);
    } catch (err) {
      console.error('Error loading menu:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenuData();
  }, []);

  return {
    menuData,
    loading,
    error,
    refresh: loadMenuData
  };
};