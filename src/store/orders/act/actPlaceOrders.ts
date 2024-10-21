import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { axiosErrorHandler } from '@utils';
import { RootState } from '@store/index';
import { TProduct } from '@types';

const actPlaceOrders = createAsyncThunk(
  'orders/actPlaceOrders',
  async (subtotal: number, thunkAPI) => {
    const { rejectWithValue, getState } = thunkAPI;
    const { cart, auth } = getState() as RootState;
    const orderItem = cart.productsFullInfo.map((el: TProduct) => ({
      id: el.id,
      title: el.title,
      price: el.price,
      img: el.img,
      quantity: cart.items[el.id],
    }));
    try {
      const response = await axios.post('/orders', {
        userId: auth.user?.id,
        items: orderItem,
        subtotal,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);

export default actPlaceOrders;
