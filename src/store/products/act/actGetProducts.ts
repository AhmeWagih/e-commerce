import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { TProduct } from '../../../types';
type TResponse = TProduct[];

const actGetProducts = createAsyncThunk('product/getProducts', async (prefix: string, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const response = await axios.get<TResponse>(`/products?cat_prefix=${prefix}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(error.response?.data.message || error.message);
    } else {
      return rejectWithValue('Unexpected error');
    }
  }
});

export default actGetProducts;
