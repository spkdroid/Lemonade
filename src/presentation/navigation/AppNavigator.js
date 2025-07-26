import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ModernHomeScreen from '../screens/ModernHomeScreen';
import CartScreen from '../screens/CartScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  console.log('AppNavigator rendering...');
  
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen 
        name="Home" 
        component={ModernHomeScreen} 
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