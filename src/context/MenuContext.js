import React, { createContext, useState, useContext, useEffect } from 'react';

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <MenuContext.Provider value={{ menuData, loading, error, setMenuData, setLoading, setError }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  return useContext(MenuContext);
};