import { createSlice } from "@reduxjs/toolkit";
import actGetProducts from "./act/actGetProducts";
export interface IProductStates {
  record: {
    id: number;
    title: string;
    cat_prefix: string;
    img: string;
    price: string;
  }[];
  loading: "idle" | "pending" | "succeeded" | "failed";
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
