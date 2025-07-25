import { useState, useEffect } from 'react';
import { MenuRepository } from '../services/MenuRepository';

export const useMenuViewModel = () => {
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMenuData = async () => {
    try {
      setLoading(true);
      const data = await MenuRepository.getMenu();
      setMenuData(data);
      setError(null);
    } catch (err) {
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