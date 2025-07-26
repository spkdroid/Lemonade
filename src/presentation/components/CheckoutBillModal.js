import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const CheckoutBillModal = ({ 
  visible, 
  onClose, 
  onConfirm, 
  cartItems, 
  deliveryInfo, 
  total,
  loading 
}) => {
  const subtotal = cartItems.reduce((sum, item) => {
    const price = typeof item.price === 'number' ? item.price : 0;
    const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
    return sum + (price * quantity);
  }, 0);
  const deliveryFee = 3.99;
  const tax = subtotal * 0.08;
  const finalTotal = subtotal + deliveryFee + tax;

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.billContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Bill Header */}
            <View style={styles.billHeader}>
              <Text style={styles.restaurantName}>🥤 Chill N Drink</Text>
              <Text style={styles.tagline}>Premium Beverage Delivery</Text>
              <View style={styles.divider} />
              <Text style={styles.dateTime}>{formatDate()}</Text>
              <Text style={styles.orderType}>Delivery Order</Text>
            </View>

            {/* Customer Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>DELIVER TO:</Text>
              <Text style={styles.customerName}>{deliveryInfo?.getDisplayName() || 'Customer'}</Text>
              <Text style={styles.address}>{deliveryInfo?.getFormattedAddress() || 'Address not provided'}</Text>
              <Text style={styles.phone}>{deliveryInfo?.phoneNumber || 'Phone not provided'}</Text>
            </View>

            {/* Order Items */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ORDER DETAILS:</Text>
              {cartItems.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.selectedSize && (
                      <Text style={styles.itemSize}>Size: {item.selectedSize}</Text>
                    )}
                    <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={styles.itemPrice}>${((typeof item.price === 'number' ? item.price : 0) * (item.quantity || 1)).toFixed(2)}</Text>
                </View>
              ))}
            </View>

            {/* Bill Calculation */}
            <View style={styles.billCalculation}>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Subtotal:</Text>
                <Text style={styles.calculationValue}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Delivery Fee:</Text>
                <Text style={styles.calculationValue}>${deliveryFee.toFixed(2)}</Text>
              </View>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Tax (8%):</Text>
                <Text style={styles.calculationValue}>${tax.toFixed(2)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL:</Text>
                <Text style={styles.totalValue}>${finalTotal.toFixed(2)}</Text>
              </View>
            </View>

            {/* Payment Method */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PAYMENT METHOD:</Text>
              <View style={styles.paymentMethod}>
                <MaterialIcons name="credit-card" size={20} color="#FF6B35" />
                <Text style={styles.paymentText}>Credit Card ending in ****</Text>
              </View>
            </View>

            {/* Terms */}
            <View style={styles.terms}>
              <Text style={styles.termsText}>
                By confirming this order, you agree to our terms of service.
                Estimated delivery time: 25-35 minutes.
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.confirmButton, loading && styles.disabledButton]} 
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.confirmButtonText}>Processing...</Text>
              ) : (
                <>
                  <MaterialIcons name="payment" size={20} color="white" />
                  <Text style={styles.confirmButtonText}>Place Order</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  billContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: width * 0.9,
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  billHeader: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B35',
    backgroundColor: '#FFF8F5',
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  dateTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 10,
  },
  orderType: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
    marginTop: 2,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    letterSpacing: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  phone: {
    fontSize: 14,
    color: '#666',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  itemSize: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  billCalculation: {
    padding: 20,
    backgroundColor: '#FAFAFA',
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calculationLabel: {
    fontSize: 14,
    color: '#666',
  },
  calculationValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  terms: {
    padding: 20,
    backgroundColor: '#F8F8F8',
  },
  termsText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    flex: 2,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  divider: {
    height: 1,
    backgroundColor: '#DDD',
    marginVertical: 10,
  },
});

export default CheckoutBillModal;
