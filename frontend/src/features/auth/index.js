// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefault) => getDefault({
    serializableCheck: false, 
  }),
});

export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => !!state.auth.accessToken;
