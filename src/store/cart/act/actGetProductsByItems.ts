import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../index';
import { TProduct } from '../../../types';
type TResponse = TProduct[];
const actGetProductsByItems = createAsyncThunk('cart/getProductsByItems', async (_, thunkAPI) => {
  const { rejectWithValue, fulfillWithValue, getState } = thunkAPI;
  const { cart } = getState() as RootState;
  const itemsId = Object.keys(cart.items);
  if (!itemsId.length) {
    return fulfillWithValue([]);
  }
  try {
    const concatenatedItemsId = itemsId.map((el) => `id=${el}`).join('&');
    const response = await axios.get<TResponse>(`/products?${concatenatedItemsId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(error.response?.data.message || error.message);
    } else {
      return rejectWithValue('Unexpected error');
    }
  }
});

export default actGetProductsByItems;
