export default class StoreManager {
  stores;

  constructor(stores) {
    this.stores = stores;
  }
  addStore(name, store) {
    this.stores[name] = store;
  }
}
