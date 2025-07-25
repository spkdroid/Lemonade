/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { MenuProvider } from './src/context/MenuContext';
import HomeScreen from './src/screens/HomeScreen';

const App = () => {
  return (
    <MenuProvider>
      <HomeScreen />
    </MenuProvider>
  );
};

export default App;