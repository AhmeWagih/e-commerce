import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { axiosErrorHandler } from '@utils';
import { RootState } from '@store/index';
import { TOrderItem } from '@types';

type TResponse = TOrderItem[];

const actGetUserOrders = createAsyncThunk(
  'orders/actGetUserOrders',
  async (_, thunkAPI) => {
    const { rejectWithValue, getState, signal } = thunkAPI;
    const { auth } = getState() as RootState;
    try {
      const response = await axios.get<TResponse>(
        `/orders?userId=${auth.user?.id}`,
        { signal }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);

export default actGetUserOrders;
