// Simple test to validate OrderReceiptModal functionality
// This is to help debug why the modal doesn't show after checkout

import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import OrderReceiptModal from './src/presentation/components/OrderReceiptModal';

const TestReceiptModal = () => {
  const [modalVisible, setModalVisible] = useState(false);
  
  const testOrderData = {
    orderNumber: 'TEST-123456',
    orderDate: new Date(),
    cartItems: [
      {
        id: '1',
        name: 'Classic Lemonade',
        price: 4.99,
        quantity: 2,
        selectedSize: 'Medium'
      },
      {
        id: '2', 
        name: 'Strawberry Lemonade',
        price: 5.99,
        quantity: 1,
        selectedSize: 'Large'
      }
    ],
    deliveryInfo: {
      getDisplayName: () => 'John Doe',
      getFormattedAddress: () => '123 Main St, Test City, TC 12345',
      phoneNumber: '+1 (555) 123-4567'
    },
    subtotal: 15.97,
    deliveryFee: 3.99,
    tax: 1.28,
    total: 21.24,
    estimatedDeliveryTime: '25-35 minutes'
  };
  
  console.log('TestReceiptModal: Component rendered');
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <TouchableOpacity
        style={{
          backgroundColor: '#FF6B35',
          padding: 15,
          borderRadius: 8,
          marginBottom: 20
        }}
        onPress={() => {
          console.log('TestReceiptModal: Button pressed, setting modal visible');
          setModalVisible(true);
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Show Receipt Modal</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={{
          backgroundColor: '#666',
          padding: 15,
          borderRadius: 8,
          marginBottom: 20
        }}
        onPress={() => {
          console.log('TestReceiptModal: Testing with null data');
          // Test with no data to see error handling
          setModalVisible(true);
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Test No Data</Text>
      </TouchableOpacity>
      
      <OrderReceiptModal
        visible={modalVisible}
        orderData={testOrderData}
        onClose={() => {
          console.log('TestReceiptModal: Closing modal');
          setModalVisible(false);
        }}
        onGoToHome={() => {
          console.log('TestReceiptModal: Go to home pressed');
          setModalVisible(false);
          Alert.alert('Navigation', 'Would navigate to home screen');
        }}
      />
    </View>
  );
};

export default TestReceiptModal;
