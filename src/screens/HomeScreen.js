import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  Dimensions,
  Animated,
  StatusBar
} from 'react-native';
import { useMenuViewModel } from '../viewModels/useMenuViewModel';
import { useCartViewModel } from '../viewModels/useCartViewModel';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import custom icons
const basketIcon = require('../assets/basket_icon.png');
const cancelIcon = require('../assets/cancel_icon.png');

const { width } = Dimensions.get('window');
const itemWidth = (width - 40) / 2;
const HEADER_MAX_HEIGHT = 250;
const HEADER_MIN_HEIGHT = 80;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const HomeScreen = () => {
  console.log('HomeScreen rendering...');
  
  const { menuData, loading, error, refresh } = useMenuViewModel();
  console.log('useMenuViewModel executed successfully');
  
  const { cartItems, addToCart } = useCartViewModel();
  console.log('useCartViewModel executed successfully');
  
  const navigation = useNavigation();
  console.log('useNavigation executed successfully');
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const featuredOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const featuredTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const openItemDetails = (item) => {
    setSelectedItem(item);
    setSelectedSize(Object.keys(item.price)[0]); // Set default size
    setModalVisible(true);
  };

  const closeItemDetails = () => {
    setModalVisible(false);
    setSelectedItem(null);
    setSelectedSize(null);
  };

  const handleAddToCart = async () => {
    if (!selectedItem) return;
    
    try {
      console.log('Adding to cart:', {
        item: selectedItem,
        selectedSize: selectedSize,
        hasPrice: selectedItem.price,
        hasName: selectedItem.name
      });
      
      await addToCart(selectedItem, 1, selectedSize);
      alert(`${selectedItem.name} added to cart!`);
      closeItemDetails();
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart: ' + error.message);
    }
  };

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={() => openItemDetails(item)}
    >
      <Image source={{ uri: item.image }} style={styles.menuItemImage} />
      <Text style={styles.menuItemName} numberOfLines={1}>{item.name}</Text>
      <View style={styles.priceBadge}>
        <Text style={styles.priceBadgeText}>
          ${Object.values(item.price)[0]}
        </Text>
      </View>
      <Text style={styles.menuItemType}>{item.type.toUpperCase()}</Text>
    </TouchableOpacity>
  );

  if (loading && !menuData) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="local-dining" size={60} color="#FF6B6B" />
        <Text style={styles.loadingText}>Preparing our delicious menu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="ios-warning" size={60} color="#FF6B6B" />
        <Text style={styles.errorText}>Failed to load menu</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!menuData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Menu not available</Text>
      </View>
    );
  }

  const { drink_of_the_day: drinkOfTheDay, full_menu: fullMenu } = menuData;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Text style={styles.headerTitle}>Chill & Drink</Text>
        
        {/* Original cart button - now using floating button instead */}
        {/* <TouchableOpacity 
          style={styles.cartIconContainer}
          onPress={() => navigation.navigate('Cart')}
        >
          <MaterialIcons name="shopping-cart" size={24} color="#FFF" />
          {cartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity> */}

        {/* Featured Drink - will minimize on scroll */}
        <Animated.View style={[
          styles.featuredContainer, 
          {
            opacity: featuredOpacity,
            transform: [{ translateY: featuredTranslateY }]
          }
        ]}>
          <Text style={styles.sectionTitle}>DRINK OF THE DAY</Text>
          <TouchableOpacity 
            style={styles.featuredItem}
            onPress={() => openItemDetails(drinkOfTheDay)}
          >
            <Image source={{ uri: drinkOfTheDay.image }} style={styles.featuredImage} />
            <View style={styles.featuredContent}>
              <Text style={styles.featuredName}>{drinkOfTheDay.name}</Text>
              <Text style={styles.featuredDescription} numberOfLines={2}>
                {drinkOfTheDay.description}
              </Text>
              <View style={styles.featuredPrice}>
                <FontAwesome name="tags" size={16} color="#FF6B6B" />
                <Text style={styles.featuredPriceText}>
                  ${Object.values(drinkOfTheDay.price)[0]}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Menu Grid - padding to account for header */}
        <View style={[styles.menuContainer, { paddingTop: HEADER_MAX_HEIGHT + 20 }]}>
          <Text style={styles.sectionTitle}>OUR MENU</Text>
          <FlatList
            data={fullMenu.menu}
            renderItem={renderMenuItem}
            keyExtractor={(item) => item.name}
            numColumns={2}
            columnWrapperStyle={styles.menuRow}
            scrollEnabled={false}
          />
        </View>

        {/* Addons Section */}
        <View style={styles.addonsContainer}>
          <Text style={styles.sectionTitle}>ADD-ONS</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.addonsList}
          >
            {fullMenu.addons.map((addon) => (
              <TouchableOpacity 
                key={addon.name} 
                style={styles.addonItem}
                onPress={() => openItemDetails(addon)}
              >
                <Text style={styles.addonName}>{addon.name}</Text>
                <Text style={styles.addonPrice}>${addon.price}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Animated.ScrollView>

      {/* Item Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeItemDetails}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={closeItemDetails}
              activeOpacity={0.7}
            >
              <Image source={cancelIcon} style={styles.closeIconImage} />
            </TouchableOpacity>
            
            {selectedItem && (
              <>
                <Image 
                  source={{ uri: selectedItem.image }} 
                  style={styles.modalImage} 
                />
                <View style={styles.modalDetails}>
                  <Text style={styles.modalTitle}>{selectedItem.name}</Text>
                  <Text style={styles.modalType}>{selectedItem.type.toUpperCase()}</Text>
                  
                  <Text style={styles.modalDescription}>
                    {selectedItem.description}
                  </Text>
                  
                  <Text style={styles.modalTaste}>
                    <Text style={{ fontWeight: 'bold' }}>Taste:</Text> {selectedItem.taste}
                  </Text>
                  
                  <View style={styles.modalPriceSection}>
                    <Text style={styles.modalPriceTitle}>Select Size:</Text>
                    <View style={styles.sizeOptions}>
                      {Object.entries(selectedItem.price).map(([size, price]) => (
                        <TouchableOpacity
                          key={size}
                          style={[
                            styles.sizeOption,
                            selectedSize === size && styles.selectedSizeOption
                          ]}
                          onPress={() => setSelectedSize(size)}
                        >
                          <Text style={[
                            styles.sizeOptionText,
                            selectedSize === size && styles.selectedSizeOptionText
                          ]}>
                            {size.toUpperCase()}
                          </Text>
                          <Text style={[
                            styles.sizeOptionPrice,
                            selectedSize === size && styles.selectedSizeOptionText
                          ]}>
                            ${price}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  
                  {selectedItem.options && (
                    <View style={styles.optionsSection}>
                      <Text style={styles.optionsTitle}>Options:</Text>
                      <View style={styles.optionsContainer}>
                        {selectedItem.options.map((option) => (
                          <Text key={option} style={styles.optionItem}>
                            {option}
                          </Text>
                        ))}
                      </View>
                    </View>
                  )}

                  <TouchableOpacity 
                    style={styles.addToCartButton}
                    onPress={handleAddToCart}
                  >
                    <Text style={styles.addToCartButtonText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Floating Cart Button */}
      <TouchableOpacity 
        style={styles.floatingCartButton}
        onPress={() => navigation.navigate('Cart')}
        activeOpacity={0.8}
      >
        <Image source={basketIcon} style={styles.basketIconImage} />
        {cartItems.length > 0 && (
          <View style={styles.floatingCartBadge}>
            <Text style={styles.floatingCartBadgeText}>
              {cartItems.length > 99 ? '99+' : cartItems.length}
            </Text>
          </View>
        )}
      </TouchableOpacity>
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
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#555',
    fontFamily: 'sans-serif-light',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
  },
  errorText: {
    marginTop: 20,
    fontSize: 22,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  errorSubtext: {
    marginTop: 10,
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  emptyText: {
    fontSize: 18,
    color: '#555',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF6B6B',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  cartIconContainer: {
    position: 'absolute',
    right: 20,
    top: 40,
  },
  cartBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: '#FFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: 'bold',
  },
  featuredContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    letterSpacing: 1,
  },
  featuredItem: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    width: '100%',
  },
  featuredImage: {
    width: '100%',
    height: 180,
  },
  featuredContent: {
    padding: 15,
  },
  featuredName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  featuredDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  featuredPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  featuredPriceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginLeft: 8,
  },
  menuContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  menuRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  menuItem: {
    width: itemWidth,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemImage: {
    width: '100%',
    height: itemWidth,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  priceBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,107,107,0.9)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  priceBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  menuItemType: {
    fontSize: 10,
    color: '#FF6B6B',
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingBottom: 10,
    marginTop: 5,
  },
  addonsContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  addonsList: {
    paddingBottom: 10,
  },
  addonItem: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    minWidth: 120,
    alignItems: 'center',
  },
  addonName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  addonPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#FF5252',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalDetails: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  modalType: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: 'bold',
    marginTop: 5,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
    lineHeight: 22,
  },
  modalTaste: {
    fontSize: 15,
    color: '#555',
    marginTop: 10,
    fontStyle: 'italic',
  },
  modalPriceSection: {
    marginTop: 20,
  },
  modalPriceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalPrices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  priceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 10,
  },
  priceSize: {
    fontSize: 14,
    color: '#777',
    marginRight: 5,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  optionsSection: {
    marginTop: 20,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionItem: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
    fontSize: 14,
    color: '#555',
  },
  sizeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  sizeOption: {
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 10,
  },
  selectedSizeOption: {
    backgroundColor: '#FF6B6B',
  },
  sizeOptionText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  selectedSizeOptionText: {
    color: '#FFF',
  },
  sizeOptionPrice: {
    color: '#FF6B6B',
    fontSize: 12,
  },
  addToCartButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  floatingCartButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 1000,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  basketIconImage: {
    width: 30,
    height: 30,
    tintColor: '#FFF',
  },
  closeIconImage: {
    width: 18,
    height: 18,
    tintColor: '#FFF',
  },
  floatingCartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF9500',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
  floatingCartBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default HomeScreen;