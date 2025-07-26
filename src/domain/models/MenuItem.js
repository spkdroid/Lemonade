export class MenuItem {
  constructor(data = {}) {
    this.id = data.id || data.name || 'unknown-item';
    this.name = data.name || 'Unknown Item';
    this.type = data.type || 'drink';
    this.description = data.description || '';
    this.taste = data.taste || '';
    this.price = this.parsePrice(data.price);
    this.image = data.image || null;
    this.options = data.options || []; // For addons like flavor shots
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
    // Handle different price structures from API
    if (size === 'default' && this.price.regular !== undefined) {
      return this.price.regular;
    }
    return this.price[size] || this.price.default || 0;
  }

  getAvailableSizes() {
    return Object.keys(this.price).filter(key => key !== 'default');
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      description: this.description,
      taste: this.taste,
      price: this.price,
      image: this.image,
      options: this.options
    };
  }

  static fromJSON(data) {
    return new MenuItem(data);
  }
}
