import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { TCategory } from '../../../types';
type TResponse = TCategory[];

const actGetCategories = createAsyncThunk('category/getCategories', async (_, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const response = await axios.get<TResponse>('/categories');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(error.response?.data.message || error.message);
    } else {
      return rejectWithValue('Unexpected error');
    }
  }
});

export default actGetCategories;
