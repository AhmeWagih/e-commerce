import { createSlice } from '@reduxjs/toolkit';
import actGetProductsByItems from './act/actGetProductsByItems';
import { getCartTotalQuantitySelector, itemQuantityAvailabilityCheckingSelector } from './selectors';

import { ICartState } from '../../types';

const initialState: ICartState = {
  items: {},
  productsFullInfo: [],
  loading: 'idle',
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const id = action.payload;
      if (state.items[id]) {
        state.items[id]++;
      } else {
        state.items[id] = 1;
      }
    },
    cartItemChangeQuantity: (state, action) => {
      state.items[action.payload.id] = action.payload.quantity;
    },
    cartItemRemove: (state, action) => {
      delete state.items[action.payload];
      state.productsFullInfo = state.productsFullInfo.filter((el) => el.id !== action.payload);
    },
    productFullInfoCleanUp: (state) => {
      state.productsFullInfo = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(actGetProductsByItems.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(actGetProductsByItems.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.productsFullInfo = action.payload;
      })
      .addCase(actGetProductsByItems.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      });
  },
});

export { getCartTotalQuantitySelector, itemQuantityAvailabilityCheckingSelector, actGetProductsByItems };
export const { addToCart, cartItemChangeQuantity, cartItemRemove, productFullInfoCleanUp } = cartSlice.actions;
export default cartSlice.reducer;
