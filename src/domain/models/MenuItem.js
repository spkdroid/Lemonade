export class MenuItem {
  constructor(data) {
    this.id = data.id || data.name;
    this.name = data.name;
    this.description = data.description || '';
    this.image = data.image;
    this.type = data.type || 'drink';
    this.category = data.category || 'beverages';
    this.price = this.parsePrice(data.price);
    this.sizes = data.sizes || [];
    this.options = data.options || [];
    this.availability = data.availability !== false;
    this.featured = data.featured || false;
    this.nutritionInfo = data.nutritionInfo || {};
    this.allergens = data.allergens || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  parsePrice(price) {
    if (typeof price === 'number') {
      return { default: price };
    }
    if (typeof price === 'object' && price !== null) {
      return price;
    }
    if (typeof price === 'string') {
      const numericPrice = parseFloat(price);
      return isNaN(numericPrice) ? { default: 0 } : { default: numericPrice };
    }
    return { default: 0 };
  }

  getPrice(size = 'default') {
    return this.price[size] || this.price.default || 0;
  }

  getAvailableSizes() {
    return Object.keys(this.price).filter(key => key !== 'default');
  }

  isAvailable() {
    return this.availability;
  }

  isFeatured() {
    return this.featured;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      image: this.image,
      type: this.type,
      category: this.category,
      price: this.price,
      sizes: this.sizes,
      options: this.options,
      availability: this.availability,
      featured: this.featured,
      nutritionInfo: this.nutritionInfo,
      allergens: this.allergens,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(data) {
    return new MenuItem(data);
  }
}
