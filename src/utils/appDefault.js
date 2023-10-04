import {create} from 'mobx-persist';
import createStores from '@stores';
import StoreManager from '@stores/StoreManager';
import Modules from '@modules';
// import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeManager = new StoreManager(createStores());

// function hydrateStore() {
//   const hydrate = create({
//     storage: AsyncStorage,
//   });

//   Modules.forEach(module => module({ storeManager, options: { hydrate } }));
// }

// export function appDefault() {
//   hydrateStore();
// }
