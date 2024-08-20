import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
type TResponse = { id: number; title: string; cat_prefix: string; img: string ,price: string}[];

const actGetProducts = createAsyncThunk(
  "product/getProducts",
  async (prefix: string, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await axios.get<TResponse>(
        `http://localhost:5000/products?cat_prefix=${prefix}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data.message || error.message);
      } else {
        return rejectWithValue("Unexpected error");
      }
    }
  }
);

export default actGetProducts;
