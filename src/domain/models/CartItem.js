export class CartItem {
  constructor(item = {}, quantity = 1, selectedSize = null, selectedOptions = []) {
    // Handle undefined item gracefully
    if (!item || typeof item !== 'object') {
      item = { name: 'Unknown Item', price: 0, type: 'unknown' };
    }
    
    this.id = (item.name || 'unknown') + (selectedSize || '');
    this.name = item.name || 'Unknown Item';
    this.type = item.type || 'unknown';
    this.image = item.image || null;
    
    // Handle price calculation more safely
    if (selectedSize && item.price && item.price[selectedSize]) {
      this.price = item.price[selectedSize];
    } else if (item.price && typeof item.price === 'object') {
      this.price = Object.values(item.price)[0];
    } else if (typeof item.price === 'number') {
      this.price = item.price;
    } else {
      console.error('Invalid price structure:', item.price);
      this.price = 0;
    }
    
    this.quantity = quantity;
    this.selectedSize = selectedSize;
    this.selectedOptions = selectedOptions;
    this.baseItem = item; // Reference to original menu item
    
    if (__DEV__) {
      console.log('CartItem created:', this);
    }
  }
}