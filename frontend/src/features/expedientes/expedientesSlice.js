// src/features/expedientes/expedientesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

// Thunks
export const fetchExpedienteById = createAsyncThunk(
  'expedientes/getById',
  async (id) => {
    const { data } = await api.get(`/expedientes/${id}`);
        console.log('[API] GET /expedientes  -> raw data:', data);

    return data;
  }
);

export const createExpediente = createAsyncThunk(
  'expedientes/create',
  async (payload) => {
    const { data } = await api.post('/expedientes', payload);

    return data;
  }
);

export const updateExpediente = createAsyncThunk(
  'expedientes/update',
  async ({ id, payload }) => {
    await api.patch(`/expedientes/${id}`, payload);
    const { data } = await api.get(`/expedientes/${id}`);
    return data; // 👈 SIEMPRE un expediente completo
  }
);

export const sendExpedienteToReview = createAsyncThunk(
  'expedientes/sendToReview',
  async ({ id, coordinadorId }) => {
    await api.post(`/expedientes/${id}/enviar-revision`, { coordinadorId });
    const { data } = await api.get(`/expedientes/${id}`);
    return data; // 👈 expediente completo (estado = EnRevision)
  }
);

export const approveExpediente = createAsyncThunk(
  'expedientes/approve',
  async (id, thunkAPI) => {
    const { getState, rejectWithValue } = thunkAPI;
    try {
      const state = getState();
      const user = state?.auth?.user;
      const hdrUserId = user?.id ?? user?.sub ?? 1;

      await api.post(`/expedientes/${id}/aprobar`, null, {
        headers: { 'x-user-id': hdrUserId }
      });

      const { data } = await api.get(`/expedientes/${id}`);
      console.log('[approveExpediente] expediente tras aprobar (GET):', data);
      return data;
    } catch (err) {
      console.error('[approveExpediente] error:', err?.response?.data ?? err);
      return rejectWithValue(err?.response?.data ?? err.message);
    }
  }
);

export const rejectExpediente = createAsyncThunk(
  'expedientes/reject',
  async ({ id, justificacion }, thunkAPI) => {
    const { getState, rejectWithValue } = thunkAPI;
    try {
      const state = getState();
      const user = state?.auth?.user;
      const hdrUserId = user?.id ?? user?.sub ?? 1;


      await api.post(`/expedientes/${id}/rechazar`, { justificacion }, {
        headers: { 'x-user-id': hdrUserId }
      });

      const { data } = await api.get(`/expedientes/${id}`);
      console.log('[rejectExpediente] expediente tras rechazar (GET):', data);
      return data;
    } catch (err) {
      console.error('[rejectExpediente] error:', err?.response?.data ?? err);
      return rejectWithValue(err?.response?.data ?? err.message);
    }
  }
);


// Slice
const expedientesSlice = createSlice({
  name: 'expedientes',
  initialState: { current: null, loading: false, error: null },
  reducers: {
    clearExpediente(state) {
      state.current = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpedienteById.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchExpedienteById.fulfilled, (s, a) => { s.loading = false; s.current = a.payload; })
      .addCase(fetchExpedienteById.rejected, (s, a) => { s.loading = false; s.error = a.error.message; })

      .addCase(createExpediente.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createExpediente.fulfilled, (s, a) => { s.loading = false; s.current = a.payload; })
      .addCase(createExpediente.rejected, (s, a) => { s.loading = false; s.error = a.error.message; })

      .addCase(updateExpediente.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(updateExpediente.fulfilled, (s, a) => { s.loading = false; s.current = a.payload; })
      .addCase(updateExpediente.rejected, (s, a) => { s.loading = false; s.error = a.error.message; })

      .addCase(sendExpedienteToReview.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(sendExpedienteToReview.fulfilled, (s, a) => { s.loading = false; s.current = a.payload; })
      .addCase(sendExpedienteToReview.rejected, (s, a) => { s.loading = false; s.error = a.error.message; })

      .addCase(approveExpediente.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(approveExpediente.fulfilled, (s, a) => { s.loading = false; s.current = a.payload; })
      .addCase(approveExpediente.rejected, (s, a) => { s.loading = false; s.error = a.error.message; })

      .addCase(rejectExpediente.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(rejectExpediente.fulfilled, (s, a) => { s.loading = false; s.current = a.payload; })
      .addCase(rejectExpediente.rejected, (s, a) => { s.loading = false; s.error = a.error.message; });
  }
});

export const { clearExpediente } = expedientesSlice.actions;

export const expedientesReducer = expedientesSlice.reducer;
export default expedientesSlice.reducer;
