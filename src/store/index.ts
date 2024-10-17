import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import category from './categories/categorySlice';
import product from './products/productSlice';
import cart from './cart/cartSlice';
import wishlist from './wishlist/wishlistSlice';
import auth from './auth/authSlice';

const rootPersistConfig = {
  key: 'root',
  storage,
  whitelist: ['cart','auth'],
};

const authPersistConfig={
  key: 'auth',
  storage,
  whitelist: ['accessToken','user'],
}

const cartPersistConfig = {
  key: 'cart',
  storage,
  whitelist: ['items'],
};

// const wishlistPersistConfig = {
//   key: 'wishlist',
//   storage,
//   whitelist: ['itemsId'],
// };

const rootReducer = combineReducers({
  auth:persistReducer(authPersistConfig, auth),
  category,
  product,
  cart: persistReducer(cartPersistConfig, cart),
  // wishlist: persistReducer(wishlistPersistConfig, wishlist),
  wishlist:  wishlist,
});


const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
const persistor = persistStore(store);
export { store, persistor };
