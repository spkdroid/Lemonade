/**
 * Dependency Injection Container
 * Manages dependency injection for the application
 */

class DIContainer {
  constructor() {
    this.dependencies = new Map();
    this.singletons = new Map();
  }

  /**
   * Register a dependency
   * @param {string} name 
   * @param {Function} factory 
   * @param {boolean} singleton 
   */
  register(name, factory, singleton = false) {
    this.dependencies.set(name, { factory, singleton });
  }

  /**
   * Resolve a dependency
   * @param {string} name 
   * @returns {*}
   */
  resolve(name) {
    const dependency = this.dependencies.get(name);
    
    if (!dependency) {
      throw new Error(`Dependency '${name}' not registered`);
    }

    if (dependency.singleton) {
      if (!this.singletons.has(name)) {
        this.singletons.set(name, dependency.factory(this));
      }
      return this.singletons.get(name);
    }

    return dependency.factory(this);
  }

  /**
   * Check if dependency is registered
   * @param {string} name 
   * @returns {boolean}
   */
  isRegistered(name) {
    return this.dependencies.has(name);
  }

  /**
   * Clear all dependencies
   */
  clear() {
    this.dependencies.clear();
    this.singletons.clear();
  }
}

// Create global container instance
const container = new DIContainer();

export default container;
