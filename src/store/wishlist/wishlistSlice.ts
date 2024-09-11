import { createSlice } from '@reduxjs/toolkit';
import actLikeToggle from './act/actLikeToggle';
import { IWishlist } from '../../types';
import actGetWishlist from './act/actGetWishlist';

const initialState: IWishlist = {
  itemsId: [],
  productsFullInfo: [],
  error: null,
  loading: 'idle',
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    productsFullInfoCleanUp: (state) => {
      state.productsFullInfo = [];
    },
  },
  extraReducers: (builder) => {
    // LIKE TOGGLE
    builder.addCase(actLikeToggle.pending, (state) => {
      state.error = null;
    });
    builder.addCase(actLikeToggle.fulfilled, (state, action) => {
      if (action.payload.type === 'add') {
        state.itemsId.push(action.payload.id);
      } else {
        state.itemsId = state.itemsId.filter((el) => el !== action.payload.id);
        state.productsFullInfo = state.productsFullInfo.filter((el) => el.id !== action.payload.id);
      }
    });
    builder.addCase(actLikeToggle.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // GET WISHLIST
    builder.addCase(actGetWishlist.pending, (state) => {
      state.loading = 'pending';
      state.error = null;
    });
    builder.addCase(actGetWishlist.fulfilled, (state, action) => {
      state.loading = 'succeeded';
      state.productsFullInfo = action.payload;
    });
    builder.addCase(actGetWishlist.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export { actLikeToggle, actGetWishlist };
export const { productsFullInfoCleanUp } = wishlistSlice.actions;
export default wishlistSlice.reducer;
