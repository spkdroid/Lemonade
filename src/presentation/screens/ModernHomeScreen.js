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
  StatusBar,
  TextInput,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { useMenuViewModel } from '../viewModels/useMenuViewModel';
import { useCartViewModel } from '../viewModels/useCartViewModel';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
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
    selectedCategory,
    searchTerm
  } = useMenuViewModel();
  
  const { cartItems, addToCart } = useCartViewModel();
  const navigation = useNavigation();
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const scrollY = useRef(new Animated.Value(0)).current;

  // Loading and Error States
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading delicious drinks...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={64} color="#FF6B6B" />
        <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!hasMenuItems && !hasFeaturedDrink && !hasAddons) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <MaterialIcons name="restaurant-menu" size={64} color="#CCC" />
        <Text style={styles.emptyTitle}>No menu available</Text>
        <Text style={styles.emptyText}>Check back later for our delicious drinks!</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const drinkOfTheDay = getFeaturedDrink();

  const handleSearch = (text) => {
    setSearchText(text);
    searchMenuItems(text);
  };

  const handleCategorySelect = (category) => {
    filterByCategory(category);
  };

  const openItemDetails = (item) => {
    const validation = validateItemForOrder(item);
    
    if (!validation.isValid) {
      alert(`Cannot view item details: ${validation.errors.join(', ')}`);
      return;
    }
    
    setSelectedItem(item);
    setSelectedSize(item.price ? Object.keys(item.price)[0] : null);
    setModalVisible(true);
  };

  const closeItemDetails = () => {
    setModalVisible(false);
    setSelectedItem(null);
    setSelectedSize(null);
  };

  const handleAddToCart = async () => {
    if (!selectedItem) return;
    
    const validation = validateItemForOrder(selectedItem);
    
    if (!validation.isValid) {
      alert(`Cannot add to cart: ${validation.errors.join(', ')}`);
      return;
    }
    
    try {
      await addToCart(selectedItem, 1, selectedSize);
      alert(`${selectedItem?.name || 'Item'} added to cart!`);
      closeItemDetails();
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart: ' + error.message);
    }
  };

  // Render Header Component
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={20} color="#666" />
          <Text style={styles.locationText}>Delivering to</Text>
          <Text style={styles.addressText}>Current Location</Text>
        </View>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <MaterialIcons name="shopping-cart" size={24} color="#FF6B35" />
          {cartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      <Text style={styles.welcomeText}>What would you like to drink today?</Text>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search drinks, flavors..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={handleSearch}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Render Categories Component
  const renderCategories = () => (
    <View style={styles.categoriesSection}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        <TouchableOpacity 
          style={[
            styles.categoryChip, 
            selectedCategory === 'all' && styles.categoryChipActive
          ]}
          onPress={() => handleCategorySelect('all')}
        >
          <Text style={[
            styles.categoryText, 
            selectedCategory === 'all' && styles.categoryTextActive
          ]}>
            All
          </Text>
        </TouchableOpacity>
        {(availableCategories || []).map((category) => (
          <TouchableOpacity 
            key={category}
            style={[
              styles.categoryChip, 
              selectedCategory === category && styles.categoryChipActive
            ]}
            onPress={() => handleCategorySelect(category)}
          >
            <Text style={[
              styles.categoryText, 
              selectedCategory === category && styles.categoryTextActive
            ]}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render Featured Drink Component
  const renderFeaturedDrink = () => {
    if (!drinkOfTheDay) return null;

    return (
      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>Today's Special</Text>
        <TouchableOpacity 
          style={styles.featuredCard}
          onPress={() => openItemDetails(drinkOfTheDay)}
        >
          <Image 
            source={{ 
              uri: drinkOfTheDay.image || 'https://via.placeholder.com/150x100/FF6B35/FFF?text=Special+Drink' 
            }} 
            style={styles.featuredImage} 
          />
          <View style={styles.featuredContent}>
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>Special</Text>
            </View>
            <Text style={styles.featuredName}>{drinkOfTheDay.name}</Text>
            <Text style={styles.featuredDescription} numberOfLines={2}>
              {drinkOfTheDay.description}
            </Text>
            <View style={styles.featuredBottom}>
              <Text style={styles.featuredPrice}>
                ${(() => {
                  const priceValue = drinkOfTheDay.price ? Object.values(drinkOfTheDay.price)[0] : 0;
                  return typeof priceValue === 'number' ? priceValue.toFixed(2) : '0.00';
                })()}
              </Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>4.8</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Render Menu Item Component
  const renderMenuItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.menuItemCard}
      onPress={() => openItemDetails(item)}
    >
      <Image 
        source={{ 
          uri: item.image || 'https://via.placeholder.com/120x80/FF6B35/FFF?text=Drink' 
        }} 
        style={styles.menuItemImage} 
      />
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemName} numberOfLines={2}>
          {item.name || 'Unknown Item'}
        </Text>
        <Text style={styles.menuItemDescription} numberOfLines={1}>
          {item.description || 'Delicious drink'}
        </Text>
        <View style={styles.menuItemBottom}>
          <Text style={styles.menuItemPrice}>
            ${(() => {
              const priceValue = item.price ? Object.values(item.price)[0] : 0;
              return typeof priceValue === 'number' ? priceValue.toFixed(2) : '0.00';
            })()}
          </Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => openItemDetails(item)}
          >
            <Ionicons name="add" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render Menu Section
  const renderMenuSection = () => (
    <View style={styles.menuSection}>
      <View style={styles.menuHeader}>
        <Text style={styles.sectionTitle}>
          {isSearchActive ? `Search Results (${filteredItems.length})` : 'Popular Drinks'}
        </Text>
        {isSearchActive && (
          <TouchableOpacity onPress={clearSearch}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={filteredItems}
        renderItem={renderMenuItem}
        keyExtractor={(item, index) => item?.name || `item-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.menuRow}
        scrollEnabled={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyMenuContainer}>
            <MaterialIcons name="search-off" size={48} color="#CCC" />
            <Text style={styles.emptyMenuText}>
              {isSearchActive ? 'No drinks found for your search' : 'No drinks available'}
            </Text>
          </View>
        )}
      />
    </View>
  );

  // Render Item Details Modal
  const renderItemModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeItemDetails}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.modalClose} onPress={closeItemDetails}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          
          {selectedItem && (
            <>
              <Image 
                source={{ 
                  uri: selectedItem.image || 'https://via.placeholder.com/300x200/FF6B35/FFF?text=Drink' 
                }} 
                style={styles.modalImage} 
              />
              <View style={styles.modalDetails}>
                <Text style={styles.modalTitle}>{selectedItem.name}</Text>
                <Text style={styles.modalType}>{selectedItem.type?.toUpperCase()}</Text>
                <Text style={styles.modalDescription}>{selectedItem.description}</Text>
                
                {selectedItem.taste && (
                  <Text style={styles.modalTaste}>
                    <Text style={styles.modalTasteLabel}>Taste: </Text>
                    {selectedItem.taste}
                  </Text>
                )}
                
                {selectedItem.price && Object.keys(selectedItem.price).length > 1 && (
                  <View style={styles.sizeSection}>
                    <Text style={styles.sizeTitle}>Select Size:</Text>
                    <View style={styles.sizeOptions}>
                      {Object.entries(selectedItem.price).map(([size, price]) => (
                        <TouchableOpacity
                          key={size}
                          style={[
                            styles.sizeOption,
                            selectedSize === size && styles.sizeOptionSelected
                          ]}
                          onPress={() => setSelectedSize(size)}
                        >
                          <Text style={[
                            styles.sizeOptionText,
                            selectedSize === size && styles.sizeOptionTextSelected
                          ]}>
                            {size.charAt(0).toUpperCase() + size.slice(1)}
                          </Text>
                          <Text style={[
                            styles.sizeOptionPrice,
                            selectedSize === size && styles.sizeOptionPriceSelected
                          ]}>
                            ${typeof price === 'number' ? price.toFixed(2) : '0.00'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
                
                <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                  <Text style={styles.addToCartText}>Add to Cart</Text>
                  <Text style={styles.addToCartPrice}>
                    ${selectedItem.price && selectedSize ? 
                      (typeof selectedItem.price[selectedSize] === 'number' ? 
                        selectedItem.price[selectedSize].toFixed(2) : '0.00') : '0.00'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderCategories()}
        {renderFeaturedDrink()}
        {renderMenuSection()}
        
        {/* Addons Section */}
        {hasAddons && (
          <View style={styles.addonsSection}>
            <Text style={styles.sectionTitle}>Add-ons</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.addonsContainer}
            >
              {menuData.addons.map((addon, index) => (
                <TouchableOpacity 
                  key={addon?.name || `addon-${index}`} 
                  style={styles.addonCard}
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
        )}
      </Animated.ScrollView>
      
      {renderItemModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginLeft: 4,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  categoriesSection: {
    backgroundColor: '#FFF',
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
  },
  categoryChipActive: {
    backgroundColor: '#FF6B35',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  featuredSection: {
    backgroundColor: '#FFF',
    paddingVertical: 20,
    marginTop: 8,
  },
  featuredCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  featuredImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#F5F5F5',
  },
  featuredContent: {
    padding: 16,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  featuredBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  featuredName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  featuredDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  featuredBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  menuSection: {
    backgroundColor: '#FFF',
    paddingVertical: 20,
    marginTop: 8,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  clearText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
  },
  menuRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  menuItemCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItemImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  menuItemContent: {
    padding: 12,
  },
  menuItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  menuItemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  addButton: {
    backgroundColor: '#FF6B35',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMenuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyMenuText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
  addonsSection: {
    backgroundColor: '#FFF',
    paddingVertical: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  addonsContainer: {
    paddingHorizontal: 20,
  },
  addonCard: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
    alignItems: 'center',
  },
  addonName: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  addonPrice: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: 'bold',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
  },
  modalImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F5F5F5',
  },
  modalDetails: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  modalType: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  modalTaste: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  modalTasteLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  sizeSection: {
    marginBottom: 20,
  },
  sizeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sizeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sizeOption: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  sizeOptionSelected: {
    backgroundColor: '#FF6B35',
  },
  sizeOptionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  sizeOptionTextSelected: {
    color: '#FFF',
  },
  sizeOptionPrice: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    marginTop: 2,
  },
  sizeOptionPriceSelected: {
    color: '#FFF',
  },
  addToCartButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  addToCartText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addToCartPrice: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
