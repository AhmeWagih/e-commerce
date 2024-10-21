import { createSlice } from '@reduxjs/toolkit';
import { IOrdersSlice } from '@types';
import actPlaceOrders from './act/actPlaceOrders';
import actGetUserOrders from './act/actGetUserOrders';

const initialState: IOrdersSlice = {
  ordersList: [],
  loading: 'idle',
  error: null,
};
const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetOrderState: (state) => {
      state.loading = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
    // PLACE ORDERS
      .addCase(actPlaceOrders.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(actPlaceOrders.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.ordersList = action.payload;
      })
      .addCase(actPlaceOrders.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      })
      // Get User Orders
      .addCase(actGetUserOrders.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(actGetUserOrders.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.ordersList = action.payload;
      })
      .addCase(actGetUserOrders.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { resetOrderState } = ordersSlice.actions;
export { actPlaceOrders, actGetUserOrders };
export default ordersSlice.reducer;
