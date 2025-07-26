import { MenuItem } from './MenuItem';

export class Menu {
  constructor(data = {}) {
    if (__DEV__) {
      console.log('Menu constructor called with data:', {
        hasData: !!data,
        hasDrinkOfTheDay: !!data.drink_of_the_day,
        hasFullMenu: !!data.full_menu,
        hasMenuArray: !!data.full_menu?.menu,
        hasAddonsArray: !!data.full_menu?.addons,
        menuArrayLength: data.full_menu?.menu?.length || 0,
        addonsArrayLength: data.full_menu?.addons?.length || 0
      });
    }
    
    this.drinkOfTheDay = data.drink_of_the_day ? new MenuItem(data.drink_of_the_day) : null;
    this.menuItems = this.parseMenuItems(data.full_menu?.menu || []);
    this.addons = this.parseAddons(data.full_menu?.addons || []);
    
    if (__DEV__) {
      console.log('Menu created with:', {
        drinkOfTheDay: this.drinkOfTheDay?.name || 'None',
        menuItemsCount: this.menuItems?.length || 0,
        addonsCount: this.addons?.length || 0
      });
    }
  }

  parseMenuItems(menuArray) {
    return Array.isArray(menuArray) ? 
      menuArray.filter(item => item && typeof item === 'object').map(item => new MenuItem(item)) : [];
  }

  parseAddons(addonsArray) {
    return Array.isArray(addonsArray) ? 
      addonsArray.filter(addon => addon && typeof addon === 'object').map(addon => new MenuItem(addon)) : [];
  }

  getAllItems() {
    const allItems = [...this.menuItems];
    
    if (this.drinkOfTheDay) {
      allItems.unshift(this.drinkOfTheDay);
    }
    
    return allItems;
  }

  getItemsByType(type) {
    return this.getAllItems().filter(item => item.type === type);
  }

  findItemById(itemId) {
    return this.getAllItems().find(item => item.id === itemId);
  }

  findItemByName(itemName) {
    return this.getAllItems().find(item => item.name === itemName);
  }

  getItemCount() {
    return this.getAllItems().length;
  }

  getAddonCount() {
    return this.addons.length;
  }

  toJSON() {
    return {
      drink_of_the_day: this.drinkOfTheDay?.toJSON() || null,
      full_menu: {
        menu: (this.menuItems || []).map(item => item.toJSON()),
        addons: (this.addons || []).map(addon => addon.toJSON())
      }
    };
  }

  static fromJSON(data) {
    return new Menu(data);
  }
}
