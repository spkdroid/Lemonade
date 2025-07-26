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
  if (__DEV__) {
    console.log('HomeScreen rendering...');
  }
  
  const { 
    menuData, 
    filteredItems,
    loading, 
    error, 
    refresh,
    searchMenuItems,
    filterByCategory,
    clearSearch,
    validateItemForOrder,
    getFeaturedDrink,
    getMenuCategories,
    hasMenuItems,
    hasAddons,
    hasFeaturedDrink,
    availableCategories,
    isSearchActive,
    selectedCategory
  } = useMenuViewModel();
  
  if (__DEV__) {
    console.log('useMenuViewModel executed successfully');
  }
  
  const { cartItems, addToCart } = useCartViewModel();
  if (__DEV__) {
    console.log('useCartViewModel executed successfully');
  }
  
  const navigation = useNavigation();
  if (__DEV__) {
    console.log('useNavigation executed successfully');
  }
  
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
    // Validate item before opening details
    const validation = validateItemForOrder(item);
    
    if (!validation.isValid) {
      alert(`Cannot view item details: ${validation.errors.join(', ')}`);
      return;
    }
    
    setSelectedItem(item);
    setSelectedSize(item.price ? Object.keys(item.price)[0] : null); // Set default size
    setModalVisible(true);
  };

  const closeItemDetails = () => {
    setModalVisible(false);
    setSelectedItem(null);
    setSelectedSize(null);
  };

  const handleAddToCart = async () => {
    if (!selectedItem) return;
    
    // Validate item before adding to cart
    const validation = validateItemForOrder(selectedItem);
    
    if (!validation.isValid) {
      alert(`Cannot add to cart: ${validation.errors.join(', ')}`);
      return;
    }
    
    try {
      if (__DEV__) {
        console.log('Adding to cart:', {
          item: selectedItem,
          selectedSize: selectedSize,
          hasPrice: selectedItem?.price,
          hasName: selectedItem?.name
        });
      }
      
      await addToCart(selectedItem, 1, selectedSize);
      alert(`${selectedItem?.name || 'Item'} added to cart!`);
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
      <Image 
        source={item.image ? { uri: item.image } : { uri: 'https://via.placeholder.com/100x100/cccccc/666666?text=No+Image' }} 
        style={styles.menuItemImage} 
      />
      <Text style={styles.menuItemName} numberOfLines={1}>{item.name || 'Unknown Item'}</Text>
      <View style={styles.priceBadge}>
        <Text style={styles.priceBadgeText}>
          ${(() => {
            const priceValue = item.price ? Object.values(item.price)[0] : 0;
            return typeof priceValue === 'number' ? priceValue.toFixed(2) : '0.00';
          })()}
        </Text>
      </View>
      <Text style={styles.menuItemType}>{(item.type || 'unknown').toUpperCase()}</Text>
    </TouchableOpacity>
  );

  // Debug logging - moved to avoid React rendering issues
  if (__DEV__) {
    console.log('HomeScreen state:', {
      loading,
      error,
      menuData: menuData ? {
        hasDrinkOfTheDay: !!menuData.drinkOfTheDay,
        menuItemsCount: menuData.menuItems?.length || 0,
        addonsCount: menuData.addons?.length || 0
      } : 'null'
    });
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="local-dining" size={60} color="#FF8C00" />
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

  if (!menuData || (!hasMenuItems && !hasFeaturedDrink && !hasAddons)) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No menu items available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const drinkOfTheDay = getFeaturedDrink();

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
          <View style={styles.materialCard}>
            <View style={styles.cardHeader}>
              <View style={styles.titleContainer}>
                <MaterialIcons name="local-cafe" size={24} color="#FF6B6B" />
                <Text style={styles.sectionTitle}>DRINK OF THE DAY</Text>
              </View>
              <View style={styles.specialBadge}>
                <Text style={styles.specialBadgeText}>SPECIAL</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.featuredItem}
              onPress={() => openItemDetails(drinkOfTheDay)}
              activeOpacity={0.95}
            >
              <View style={styles.imageContainer}>
                <Image 
                  source={drinkOfTheDay?.image ? { uri: drinkOfTheDay.image } : { uri: 'https://via.placeholder.com/300x200/cccccc/666666?text=No+Image' }} 
                  style={styles.featuredImage} 
                />
                <View style={styles.imageOverlay}>
                  <Text style={styles.tapToViewText}>Tap to view</Text>
                </View>
              </View>
              
              <View style={styles.featuredContent}>
                <View style={styles.drinkHeader}>
                  <Text style={styles.featuredName}>{drinkOfTheDay?.name || 'Featured Drink'}</Text>
                  <View style={styles.ratingContainer}>
                    <MaterialIcons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>4.8</Text>
                  </View>
                </View>
                
                <Text style={styles.featuredDescription} numberOfLines={2}>
                  {drinkOfTheDay?.description || 'Delicious featured beverage'}
                </Text>
                
                <View style={styles.priceAndAction}>
                  <View style={styles.featuredPrice}>
                    <Text style={styles.priceLabel}>Starting from</Text>
                    <Text style={styles.featuredPriceText}>
                      ${(() => {
                        const priceValue = drinkOfTheDay?.price ? Object.values(drinkOfTheDay.price)[0] : 0;
                        return typeof priceValue === 'number' ? priceValue.toFixed(2) : '0.00';
                      })()}
                    </Text>
                  </View>
                  
                  <View style={styles.actionButton}>
                    <MaterialIcons name="add-shopping-cart" size={20} color="#FFF" />
                    <Text style={styles.actionButtonText}>Order Now</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
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
          
          {/* Display search/filter info if active */}
          {(isSearchActive || selectedCategory !== 'all') && (
            <View style={styles.filterInfo}>
              <Text style={styles.filterInfoText}>
                Showing {filteredItems.length} items
                {isSearchActive && ` for "${searchTerm}"`}
                {selectedCategory !== 'all' && ` in ${selectedCategory}`}
              </Text>
              <TouchableOpacity onPress={clearSearch} style={styles.clearFilterButton}>
                <Text style={styles.clearFilterText}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <FlatList
            data={filteredItems}
            renderItem={renderMenuItem}
            keyExtractor={(item, index) => item?.name || `item-${index}`}
            numColumns={2}
            columnWrapperStyle={styles.menuRow}
            scrollEnabled={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyMenuContainer}>
                <Text style={styles.emptyMenuText}>
                  {isSearchActive ? 'No items found for your search' : 'No menu items available'}
                </Text>
              </View>
            )}
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
            {(menuData?.addons || []).map((addon, index) => (
              <TouchableOpacity 
                key={addon?.name || `addon-${index}`} 
                style={styles.addonItem}
                onPress={() => openItemDetails(addon)}
              >
                <Text style={styles.addonName}>{addon?.name || 'Unknown Addon'}</Text>
                <Text style={styles.addonPrice}>
                  ${typeof addon?.price === 'number' ? addon.price.toFixed(2) : '0.00'}
                </Text>
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
                  source={selectedItem?.image ? { uri: selectedItem.image } : { uri: 'https://via.placeholder.com/250x200/cccccc/666666?text=No+Image' }} 
                  style={styles.modalImage} 
                />
                <View style={styles.modalDetails}>
                  <Text style={styles.modalTitle}>{selectedItem?.name || 'Unknown Item'}</Text>
                  <Text style={styles.modalType}>{(selectedItem?.type || 'unknown').toUpperCase()}</Text>
                  
                  <Text style={styles.modalDescription}>
                    {selectedItem?.description || 'No description available'}
                  </Text>
                  
                  <Text style={styles.modalTaste}>
                    <Text style={{ fontWeight: 'bold' }}>Taste:</Text> {selectedItem?.taste || 'N/A'}
                  </Text>
                  
                  <View style={styles.modalPriceSection}>
                    <Text style={styles.modalPriceTitle}>Select Size:</Text>
                    <View style={styles.sizeOptions}>
                      {selectedItem?.price ? Object.entries(selectedItem.price).map(([size, price]) => (
                        <TouchableOpacity
                          key={size}
                          style={[
                            styles.sizeOption,
                            selectedSize === size && styles.selectedSizeOption
                          ]}
                          onPress={() => setSelectedSize(size)}
                        >
                          <Text style={[
                            styles.sizeText,
                            selectedSize === size && styles.selectedSizeText
                          ]}>
                            {size.charAt(0).toUpperCase() + size.slice(1)}
                          </Text>
                          <Text style={[
                            styles.sizePriceText,
                            selectedSize === size && styles.selectedSizePriceText
                          ]}>
                            ${typeof price === 'number' ? price.toFixed(2) : '0.00'}
                          </Text>
                        </TouchableOpacity>
                      )) : null}
                    </View>
                  </View>
                  
                  {selectedItem?.options?.length > 0 && (
                    <View style={styles.optionsSection}>
                      <Text style={styles.optionsTitle}>Options:</Text>
                      <View style={styles.optionsContainer}>
                        {(selectedItem.options || []).map((option, index) => (
                          <Text key={option || `option-${index}`} style={styles.optionItem}>
                            {option || 'Unknown Option'}
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
  materialCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specialBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  specialBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  featuredItem: {
    backgroundColor: '#FFF',
    overflow: 'hidden',
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tapToViewText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  featuredContent: {
    padding: 20,
  },
  drinkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  featuredName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF8F00',
    marginLeft: 2,
  },
  featuredDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  priceAndAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredPrice: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  featuredPriceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  actionButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
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
  filterInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFF3E0',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
  },
  filterInfoText: {
    fontSize: 14,
    color: '#FF8C00',
    fontWeight: '500',
  },
  clearFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF8C00',
    borderRadius: 15,
  },
  clearFilterText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyMenuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyMenuText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default HomeScreen;