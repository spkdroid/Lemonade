import { MenuItem } from './MenuItem';

export class Menu {
  constructor(data) {
    this.id = data.id || 'menu-' + Date.now();
    this.name = data.name || 'Lemonade Stand Menu';
    this.description = data.description || 'Fresh and delicious beverages';
    this.drinkOfTheDay = data.drink_of_the_day ? new MenuItem(data.drink_of_the_day) : null;
    this.categories = this.parseCategories(data.full_menu || data.categories || {});
    this.version = data.version || '1.0';
    this.lastUpdated = data.lastUpdated || new Date().toISOString();
    this.currency = data.currency || 'USD';
    this.tax = data.tax || 0;
    this.serviceCharge = data.serviceCharge || 0;
  }

  parseCategories(categoriesData) {
    const categories = {};
    
    for (const [categoryName, items] of Object.entries(categoriesData)) {
      categories[categoryName] = {
        name: categoryName,
        displayName: this.formatCategoryName(categoryName),
        items: Array.isArray(items) ? items.map(item => new MenuItem(item)) : []
      };
    }
    
    return categories;
  }

  formatCategoryName(categoryName) {
    return categoryName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getAllItems() {
    const allItems = [];
    
    if (this.drinkOfTheDay) {
      allItems.push(this.drinkOfTheDay);
    }
    
    for (const category of Object.values(this.categories)) {
      allItems.push(...category.items);
    }
    
    return allItems;
  }

  getItemsByCategory(categoryName) {
    return this.categories[categoryName]?.items || [];
  }

  getAvailableItems() {
    return this.getAllItems().filter(item => item.isAvailable());
  }

  getFeaturedItems() {
    return this.getAllItems().filter(item => item.isFeatured());
  }

  findItemById(itemId) {
    return this.getAllItems().find(item => item.id === itemId);
  }

  findItemByName(itemName) {
    return this.getAllItems().find(item => item.name === itemName);
  }

  getCategoryNames() {
    return Object.keys(this.categories);
  }

  getItemCount() {
    return this.getAllItems().length;
  }

  getAvailableItemCount() {
    return this.getAvailableItems().length;
  }

  toJSON() {
    const categoriesJSON = {};
    for (const [categoryName, category] of Object.entries(this.categories)) {
      categoriesJSON[categoryName] = category.items.map(item => item.toJSON());
    }

    return {
      id: this.id,
      name: this.name,
      description: this.description,
      drink_of_the_day: this.drinkOfTheDay?.toJSON() || null,
      full_menu: categoriesJSON,
      version: this.version,
      lastUpdated: this.lastUpdated,
      currency: this.currency,
      tax: this.tax,
      serviceCharge: this.serviceCharge
    };
  }

  static fromJSON(data) {
    return new Menu(data);
  }
}
