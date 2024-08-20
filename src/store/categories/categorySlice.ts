import { createSlice } from "@reduxjs/toolkit";
import actGetCategories from "./act/actGetCategories";
export interface ICategoryStates {
  record: { id: number; title: string; prefix: string; img: string }[];
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}
const initialState: ICategoryStates = {
  record: [],
  loading: "idle",
  error: null,
};
const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(actGetCategories.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(actGetCategories.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.record = action.payload;
      })
      .addCase(actGetCategories.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      });
  },
});

export { actGetCategories };
export default categorySlice.reducer;
