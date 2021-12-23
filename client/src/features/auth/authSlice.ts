import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { httpClient } from '../../common';

export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
}

interface LoginPayload {
  username: string;
  password: string;
}

interface LoginResponse {
  user: User;
  accessToken: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
};

export const getAuth = createAsyncThunk<User>('auth/getAuth', async () => {
  return httpClient.get<User>('/auth/@me');
});

export const signIn = createAsyncThunk<User, LoginPayload>(
  'auth/signIn',
  async (payload) => {
    const { user, accessToken } = await httpClient.post<
      LoginPayload,
      LoginResponse
    >(`${process.env.REACT_APP_SERVER_URL}/auth/login`, payload);

    localStorage.setItem('token', accessToken);

    return user;
  }
);

export const signOut = createAsyncThunk<void>('auth/signOut', async () => {
  await httpClient.post<null, LoginResponse>(
    `${process.env.REACT_APP_SERVER_URL}/auth/logout`
  );

  localStorage.removeItem('token');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateAuth: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(getAuth.rejected, (state) => {
        state.user = null;
        state.isLoading = false;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { updateAuth } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;

export const authReducer = authSlice.reducer;
