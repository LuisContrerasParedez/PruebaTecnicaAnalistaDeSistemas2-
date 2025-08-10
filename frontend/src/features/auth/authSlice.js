// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

const STORAGE_KEY = 'dicri_auth_v1';

function saveSession({ user, accessToken, refreshToken }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, accessToken, refreshToken }));
}
function loadSession() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { user: null, accessToken: null, refreshToken: null };
  try { return JSON.parse(raw); } catch { return { user: null, accessToken: null, refreshToken: null }; }
}
function clearSession() { localStorage.removeItem(STORAGE_KEY); }

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      // Esperado desde tu backend: { user, accessToken, refreshToken }
      return data;
    } catch (err) {
      const msg = err?.response?.data?.error || 'Credenciales inválidas';
      return rejectWithValue(msg);
    }
  }
);

export const refreshTokenThunk = createAsyncThunk(
  'auth/refresh',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const { refreshToken } = auth;
      if (!refreshToken) return rejectWithValue('No refresh token');
      const { data } = await api.post('/auth/refresh', { refreshToken });
      // Esperado: { accessToken, refreshToken }
      return data;
    } catch (err) {
      const msg = err?.response?.data?.error || 'No fue posible refrescar la sesión';
      return rejectWithValue(msg);
    }
  }
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { getState }) => {
    try {
      const { refreshToken } = getState().auth || {};
      if (refreshToken) await api.post('/auth/logout', { refreshToken });
    } finally {
      // Aunque falle la llamada, limpiaremos local
      return true;
    }
  }
);

const initial = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
  initialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initial,
  reducers: {
    initFromStorage(state) {
      const { user, accessToken, refreshToken } = loadSession();
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.initialized = true;
    },
    logout(state) {
      Object.assign(state, { ...initial, initialized: true });
      clearSession();
    }
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginThunk.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || null;
        state.accessToken = action.payload.accessToken || null;
        state.refreshToken = action.payload.refreshToken || null;
        saveSession(state);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false; state.error = action.payload || 'Error de login';
      })

      // refresh
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken || null;
        state.refreshToken = action.payload.refreshToken || state.refreshToken;
        saveSession(state);
      })
      .addCase(refreshTokenThunk.rejected, (state) => {
        // Si falla refresh, quedará a cargo del interceptor hacer logout
      })

      // logout
      .addCase(logoutThunk.fulfilled, (state) => {
        Object.assign(state, { ...initial, initialized: true });
        clearSession();
      });
  }
});

export const { initFromStorage, logout } = authSlice.actions;
export default authSlice.reducer;
