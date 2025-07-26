export class CartItem {
  constructor(item, quantity = 1, selectedSize = null, selectedOptions = []) {
    console.log('CartItem constructor called with:', {
      item: item,
      quantity: quantity,
      selectedSize: selectedSize,
      itemPrice: item.price,
      itemName: item.name
    });
    
    this.id = item.name + (selectedSize || '');
    this.name = item.name;
    this.type = item.type;
    this.image = item.image;
    
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
    
    console.log('CartItem created:', this);
  }
}