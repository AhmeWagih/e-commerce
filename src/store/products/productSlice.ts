import { createSlice } from "@reduxjs/toolkit";
import actGetProducts from "./act/actGetProducts";
import { TLoading, TProduct } from "@types";
export interface IProductStates {
  record: TProduct[];
  loading: TLoading;
  error: string | null;
}
const initialState: IProductStates = {
  record: [],
  loading: "idle",
  error: null,
};
const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    productsCleanUp: (state) => {
      state.record = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(actGetProducts.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(actGetProducts.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.record = action.payload;
      })
      .addCase(actGetProducts.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { productsCleanUp } = productSlice.actions;
export { actGetProducts };
export default productSlice.reducer;
