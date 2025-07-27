import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const AddToCartModal = ({ 
  visible, 
  onClose, 
  item, 
  onViewCart,
  animationValue = new Animated.Value(0)
}) => {
  React.useEffect(() => {
    if (visible) {
      Animated.spring(animationValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(animationValue, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [visible]);

  const scale = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const opacity = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayBackground} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [{ scale }],
              opacity,
            }
          ]}
        >
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.successCircle}>
              <MaterialIcons name="check" size={40} color="white" />
            </View>
            <View style={styles.pulseCircle} />
          </View>

          {/* Success Message */}
          <Text style={styles.successTitle}>Added to Cart!</Text>
          <Text style={styles.itemName}>{item?.name || 'Item'}</Text>
          
          {/* Item Details */}
          <View style={styles.itemDetails}>
            <View style={styles.detailRow}>
              <MaterialIcons name="local-drink" size={20} color="#FF6B35" />
              <Text style={styles.detailText}>
                ${typeof item?.price === 'number' ? item.price.toFixed(2) : '0.00'}
              </Text>
            </View>
            {item?.selectedSize && (
              <View style={styles.detailRow}>
                <MaterialIcons name="straighten" size={20} color="#FF6B35" />
                <Text style={styles.detailText}>Size: {item.selectedSize}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <MaterialIcons name="shopping-cart" size={20} color="#FF6B35" />
              <Text style={styles.detailText}>Quantity: 1</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={onClose}
            >
              <MaterialIcons name="add" size={20} color="#FF6B35" />
              <Text style={styles.continueButtonText}>Add More</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.viewCartButton} 
              onPress={onViewCart}
            >
              <MaterialIcons name="shopping-cart" size={20} color="white" />
              <Text style={styles.viewCartButtonText}>View Cart</Text>
            </TouchableOpacity>
          </View>

          {/* Close Button */}
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
          >
            <MaterialIcons name="close" size={24} color="#999" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const ConfirmationModal = ({ 
  visible, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'default' // 'default', 'warning', 'danger'
}) => {
  const getThemeColors = () => {
    switch (type) {
      case 'warning':
        return {
          icon: 'warning',
          iconColor: '#FFA726',
          confirmColor: '#FFA726',
        };
      case 'danger':
        return {
          icon: 'error',
          iconColor: '#EF5350',
          confirmColor: '#EF5350',
        };
      default:
        return {
          icon: 'info',
          iconColor: '#42A5F5',
          confirmColor: '#42A5F5',
        };
    }
  };

  const theme = getThemeColors();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.confirmationContainer}>
          {/* Icon */}
          <View style={[styles.iconContainer, { marginBottom: 20 }]}>
            <View style={[styles.iconCircle, { backgroundColor: theme.iconColor }]}>
              <MaterialIcons name={theme.icon} size={32} color="white" />
            </View>
          </View>

          {/* Content */}
          <Text style={styles.confirmationTitle}>{title}</Text>
          <Text style={styles.confirmationMessage}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelConfirmButton} 
              onPress={onClose}
            >
              <Text style={styles.cancelConfirmButtonText}>{cancelText}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.confirmConfirmButton, { backgroundColor: theme.confirmColor }]} 
              onPress={onConfirm}
            >
              <Text style={styles.confirmConfirmButtonText}>{confirmText}</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    position: 'relative',
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: width * 0.85,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    zIndex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  pulseCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    top: -10,
    left: -10,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  itemName: {
    fontSize: 18,
    color: '#FF6B35',
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  itemDetails: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 25,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  continueButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginRight: 8,
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 5,
  },
  viewCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginLeft: 8,
    borderRadius: 10,
    backgroundColor: '#FF6B35',
  },
  viewCartButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
  },
  
  // Confirmation Modal Styles
  confirmationContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    width: width * 0.8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  confirmationMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  cancelConfirmButton: {
    flex: 1,
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmConfirmButton: {
    flex: 1,
    padding: 12,
    marginLeft: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmConfirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export { AddToCartModal, ConfirmationModal };
export default AddToCartModal;
