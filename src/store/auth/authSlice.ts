import { createSlice } from '@reduxjs/toolkit';
import { IAuthState } from '@types';
import actAuthRegister from './act/actAuthRegister';
import actAuthLogin from './act/actAuthLogin';

const initialState: IAuthState = {
  accessToken: null,
  user: null,
  loading: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetUI: (state) => {
      state.loading = 'idle';
      state.error = null;
    },
    authLogout: (state) => {
      state.accessToken = null;
      state.user = null;
    }
  },
  extraReducers: (builder) => {
    // REGISTER
    builder.addCase(actAuthRegister.pending, (state) => {
      state.loading = 'pending';
      state.error = null;
    });
    builder.addCase(actAuthRegister.fulfilled, (state) => {
      state.loading = 'succeeded';
      state.error = null;
    });
    builder.addCase(actAuthRegister.rejected, (state, action) => {
      state.loading = 'failed';
      state.error = action.payload as string;
    });
    // LOGIN
    builder.addCase(actAuthLogin.pending, (state) => {
      state.loading = 'pending';
      state.error = null;
    });
    builder.addCase(actAuthLogin.fulfilled, (state,action) => {
      state.loading = 'succeeded';
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.error = null;
    });
    builder.addCase(actAuthLogin.rejected, (state, action) => {
      state.loading = 'failed';
      state.error = action.payload as string;
    });
  },
});

export { actAuthRegister, actAuthLogin };
export const { resetUI, authLogout } = authSlice.actions;
export default authSlice.reducer;
