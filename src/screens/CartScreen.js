import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  Alert
} from 'react-native';
import { useCartViewModel } from '../viewModels/useCartViewModel';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Import custom icons
const addIcon = require('../assets/add_icon.png');
const minusIcon = require('../assets/minus_icon.png');
const cancelIcon = require('../assets/cancel_icon.png');

const CartScreen = ({ navigation }) => {
  const { 
    cartItems, 
    loading, 
    error, 
    removeFromCart, 
    updateCartItem, 
    clearCart,
    getTotal 
  } = useCartViewModel();

  const handleRemoveItem = (item) => {
    Alert.alert(
      'Remove Item',
      `Remove ${item.name} from your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(item.id) },
      ]
    );
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(itemId);
    } else {
      await updateCartItem(itemId, { quantity: newQuantity });
    }
  };

  const handleCheckout = () => {
    Alert.alert(
      'Confirm Order',
      `Total: $${getTotal().toFixed(2)}\nProceed to checkout?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => {
          // Implement your checkout logic here
          clearCart();
          navigation.goBack();
          alert('Order placed successfully!');
        }},
      ]
    );
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.cartItemImage} />
      <View style={styles.cartItemDetails}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        {item.selectedSize && (
          <Text style={styles.cartItemSize}>Size: {item.selectedSize}</Text>
        )}
        <Text style={styles.cartItemPrice}>${item.price.toFixed(2)} each</Text>
        
        <View style={styles.quantityControl}>
          <TouchableOpacity 
            onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
            style={[
              styles.quantityButton, 
              styles.minusButton,
              item.quantity <= 1 && styles.disabledButton
            ]}
            activeOpacity={0.6}
            disabled={item.quantity <= 1}
          >
            <Image source={minusIcon} style={styles.iconImage} />
          </TouchableOpacity>
          
          <View style={styles.quantityTextContainer}>
            <Text style={styles.quantityText}>{item.quantity}</Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
            style={[styles.quantityButton, styles.plusButton]}
            activeOpacity={0.6}
          >
            <Image source={addIcon} style={styles.iconImage} />
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity 
        onPress={() => handleRemoveItem(item)}
        style={styles.removeButton}
        activeOpacity={0.7}
      >
        <View style={styles.removeButtonContainer}>
          <Image source={cancelIcon} style={styles.removeIconImage} />
        </View>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading your cart...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading cart: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <View style={styles.emptyCart}>
          <View style={styles.emptyCartIconContainer}>
            <MaterialIcons name="shopping-cart" size={50} color="#FF6B6B" />
            <View style={styles.emptyIconOverlay}>
              <MaterialIcons name="block" size={70} color="#FFB6B6" />
            </View>
          </View>
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <Text style={styles.emptyCartSubtext}>Add some delicious drinks to get started!</Text>
          <TouchableOpacity 
            style={styles.continueShoppingButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <MaterialIcons name="store" size={20} color="#FFF" style={styles.buttonIcon} />
            <Text style={styles.continueShoppingText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.cartList}
          />
          
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total: ${getTotal().toFixed(2)}</Text>
            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={handleCheckout}
              activeOpacity={0.8}
            >
              <MaterialIcons name="payment" size={20} color="#FFF" style={styles.buttonIcon} />
              <Text style={styles.checkoutButtonText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartIconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  emptyIconOverlay: {
    position: 'absolute',
    top: -10,
    left: -10,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  continueShoppingButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  continueShoppingText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartList: {
    padding: 15,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  cartItemDetails: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cartItemSize: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#FF6B6B',
    marginTop: 5,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  minusButton: {
    backgroundColor: '#E53E3E',
  },
  plusButton: {
    backgroundColor: '#38A169',
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
    opacity: 0.6,
  },
  iconImage: {
    width: 16,
    height: 16,
    tintColor: '#FFF',
  },
  removeIconImage: {
    width: 18,
    height: 18,
    tintColor: '#FFF',
  },
  quantityTextContainer: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    marginHorizontal: 12,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  removeButton: {
    justifyContent: 'center',
    paddingLeft: 10,
  },
  removeButtonContainer: {
    backgroundColor: '#E53E3E',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  totalContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  checkoutButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;