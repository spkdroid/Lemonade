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

const OrderReceiptModal = ({ 
  visible, 
  onClose, 
  orderData,
  onGoToHome
}) => {
  console.log('OrderReceiptModal rendered with props:', { 
    visible, 
    hasOrderData: !!orderData,
    orderDataKeys: orderData ? Object.keys(orderData) : []
  });
  
  // Always render the modal when visible is true, even without data
  if (!visible) {
    return null;
  }
  
  if (!orderData) {
    console.log('OrderReceiptModal: No order data provided, showing error modal');
    return (
      <Modal
        visible={true}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.receiptContainer}>
            <View style={{ padding: 20, alignItems: 'center' }}>
              <MaterialIcons name="error" size={60} color="#FF6B35" />
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>
                No Order Data
              </Text>
              <Text style={{ textAlign: 'center', marginTop: 10, marginBottom: 20 }}>
                Order data is not available. Please try again.
              </Text>
              <TouchableOpacity 
                onPress={onClose}
                style={{
                  backgroundColor: '#FF6B35',
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  const {
    orderNumber,
    orderDate = new Date(),
    cartItems = [],
    deliveryInfo,
    subtotal,
    deliveryFee = 3.99,
    tax,
    total,
    estimatedDeliveryTime = '25-35 minutes'
  } = orderData;

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatOrderNumber = (orderNum) => {
    return `#${String(orderNum).padStart(6, '0')}`;
  };

  console.log('OrderReceiptModal: About to render modal with visible:', visible);

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.receiptContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Receipt Header */}
            <View style={styles.receiptHeader}>
              <View style={styles.successIconContainer}>
                <MaterialIcons name="check-circle" size={60} color="#4CAF50" />
              </View>
              <Text style={styles.successTitle}>Order Placed Successfully!</Text>
              <Text style={styles.orderNumber}>{formatOrderNumber(orderNumber)}</Text>
              <Text style={styles.orderDate}>{formatDate(orderDate)}</Text>
              
              {/* Status Badge */}
              <View style={styles.statusBadge}>
                <MaterialIcons name="schedule" size={16} color="#FF6B35" />
                <Text style={styles.statusText}>Preparing</Text>
              </View>
            </View>

            {/* Delivery Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="location-on" size={20} color="#FF6B35" />
                <Text style={styles.sectionTitle}>DELIVERY DETAILS</Text>
              </View>
              <Text style={styles.customerName}>{deliveryInfo?.getDisplayName() || 'Customer'}</Text>
              <Text style={styles.address}>{deliveryInfo?.getFormattedAddress() || 'Address not provided'}</Text>
              <Text style={styles.phone}>{deliveryInfo?.phoneNumber || 'Phone not provided'}</Text>
              
              <View style={styles.estimatedTime}>
                <MaterialIcons name="access-time" size={18} color="#4CAF50" />
                <Text style={styles.estimatedTimeText}>
                  Estimated delivery: {estimatedDeliveryTime}
                </Text>
              </View>
            </View>

            {/* Order Items */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="receipt" size={20} color="#FF6B35" />
                <Text style={styles.sectionTitle}>ORDER ITEMS</Text>
              </View>
              {cartItems.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.selectedSize && (
                      <Text style={styles.itemSize}>Size: {item.selectedSize}</Text>
                    )}
                    <View style={styles.itemMeta}>
                      <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                      <Text style={styles.itemUnitPrice}>
                        ${typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'} each
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.itemTotal}>
                    ${((typeof item.price === 'number' ? item.price : 0) * (item.quantity || 1)).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Bill Summary */}
            <View style={styles.billSummary}>
              <Text style={styles.summaryTitle}>ORDER SUMMARY</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${(subtotal || 0).toFixed(2)}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>${(tax || 0).toFixed(2)}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL PAID</Text>
                <Text style={styles.totalValue}>${(total || 0).toFixed(2)}</Text>
              </View>
            </View>

            {/* Payment Method */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="payment" size={20} color="#FF6B35" />
                <Text style={styles.sectionTitle}>PAYMENT METHOD</Text>
              </View>
              <View style={styles.paymentInfo}>
                <MaterialIcons name="credit-card" size={24} color="#4CAF50" />
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentMethod}>Credit Card</Text>
                  <Text style={styles.paymentStatus}>✓ Payment Successful</Text>
                </View>
              </View>
            </View>

            {/* Thank You Message */}
            <View style={styles.thankYouSection}>
              <Text style={styles.thankYouTitle}>Thank You!</Text>
              <Text style={styles.thankYouMessage}>
                Your order is being prepared with care. You'll receive SMS updates about your delivery status.
              </Text>
              <Text style={styles.supportMessage}>
                Need help? Contact us at support@chillndrink.com
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.trackOrderButton} 
              onPress={() => {
                // TODO: Implement order tracking
                console.log('Track order:', orderNumber);
              }}
            >
              <MaterialIcons name="track-changes" size={20} color="#FF6B35" />
              <Text style={styles.trackOrderText}>Track Order</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={onGoToHome}
            >
              <MaterialIcons name="home" size={20} color="white" />
              <Text style={styles.continueButtonText}>Continue Shopping</Text>
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
  receiptContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: width * 0.9,
    maxHeight: '85%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  receiptHeader: {
    padding: 25,
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomWidth: 3,
    borderBottomColor: '#4CAF50',
  },
  successIconContainer: {
    marginBottom: 15,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
    textAlign: 'center',
  },
  orderNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 5,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  address: {
    fontSize: 15,
    color: '#666',
    marginBottom: 5,
    lineHeight: 22,
  },
  phone: {
    fontSize: 15,
    color: '#666',
    marginBottom: 15,
  },
  estimatedTime: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  estimatedTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  itemDetails: {
    flex: 1,
    marginRight: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemSize: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemQuantity: {
    fontSize: 13,
    color: '#666',
  },
  itemUnitPrice: {
    fontSize: 13,
    color: '#666',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  billSummary: {
    padding: 20,
    backgroundColor: '#FAFAFA',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#DDD',
    marginVertical: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    color: '#4CAF50',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8F0',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  paymentDetails: {
    marginLeft: 15,
  },
  paymentMethod: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  paymentStatus: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  thankYouSection: {
    padding: 25,
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  thankYouTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 10,
  },
  thankYouMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 15,
  },
  supportMessage: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  trackOrderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginRight: 8,
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  trackOrderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 5,
  },
  continueButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginLeft: 8,
    borderRadius: 10,
    backgroundColor: '#FF6B35',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 5,
  },
});

export default OrderReceiptModal;
