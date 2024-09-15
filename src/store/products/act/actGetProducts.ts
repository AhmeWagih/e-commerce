import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosErrorHandler } from '@utils';
import { TProduct } from '@types';
type TResponse = TProduct[];

const actGetProducts = createAsyncThunk(
  'product/getProducts',
  async (prefix: string, thunkAPI) => {
    const { rejectWithValue, signal } = thunkAPI;
    try {
      const response = await axios.get<TResponse>(
        `/products?cat_prefix=${prefix}`,
        { signal }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);

export default actGetProducts;
