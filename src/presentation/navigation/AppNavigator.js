import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MenuScreen from '../screens/MenuScreen';
import CartScreen from '../screens/CartScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  console.log('AppNavigator rendering...');
  
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen 
        name="Home" 
        component={MenuScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Menu" 
        component={MenuScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Cart" 
        component={CartScreen} 
        options={{ title: 'Your Cart' }} 
      />
    </Stack.Navigator>
  );
}

export default AppNavigator;