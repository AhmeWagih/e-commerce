import { createSlice } from '@reduxjs/toolkit';
import actGetCategories from './act/actGetCategories';
import { TCategory, TLoading } from '@types';
export interface ICategoryStates {
  record: TCategory[];
  loading: TLoading;
  error: string | null;
}
const initialState: ICategoryStates = {
  record: [],
  loading: 'idle',
  error: null,
};
const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    categoryCleanUp: (state) => {
      state.record = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(actGetCategories.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(actGetCategories.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.record = action.payload;
      })
      .addCase(actGetCategories.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      });
  },
});

export { actGetCategories };
export const { categoryCleanUp } = categorySlice.actions;
export default categorySlice.reducer;
