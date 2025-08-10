// src/features/expedientes/expedientesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

// Thunks
export const fetchExpedienteById = createAsyncThunk(
  'expedientes/getById',
  async (id) => {
    const { data } = await api.get(`/expedientes/${id}`);
    return data;
  }
);

export const createExpediente = createAsyncThunk(
  'expedientes/create',
  async (payload) => {
    // Si tu backend no toma el usuario autenticado, agrega codigoTecnico aquí:
    // payload = { ...payload, codigoTecnico: payload.codigoTecnico ??  user?.sub ?? 2 }
    const { data } = await api.post('/expedientes', payload);
    return data;
  }
);

export const updateExpediente = createAsyncThunk(
  'expedientes/update',
  async ({ id, payload }) => {
    const { data } = await api.patch(`/expedientes/${id}`, payload);
    return data;
  }
);

export const sendExpedienteToReview = createAsyncThunk(
  'expedientes/sendToReview',
  async ({ id, coordinadorId }) => {
    const { data } = await api.post(`/expedientes/${id}/enviar-revision`, { coordinadorId });
    return data;
  }
);

export const approveExpediente = createAsyncThunk(
  'expedientes/approve',
  async (id) => {
    const { data } = await api.post(`/expedientes/${id}/aprobar`);
    return data;
  }
);

export const rejectExpediente = createAsyncThunk(
  'expedientes/reject',
  async ({ id, justificacion }) => {
    const { data } = await api.post(`/expedientes/${id}/rechazar`, { justificacion });
    return data;
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
