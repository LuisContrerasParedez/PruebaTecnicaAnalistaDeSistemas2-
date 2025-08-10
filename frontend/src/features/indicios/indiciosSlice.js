// src/features/indicios/indiciosSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

// Normaliza la respuesta del backend a un shape consistente para el front
const norm = (r = {}) => ({
  id: r.id ?? r.CodigoIndicio ?? null,
  expedienteId: r.expedienteId ?? r.CodigoExpediente ?? null,
  codigo: r.codigo_indicio ?? r.codigoIndicio ?? null,
  tipo: r.tipo ?? '',
  descripcion: r.descripcion ?? '',
  color: r.color ?? '',
  tamano: r.tamano ?? '',
  peso: r.peso ?? '',
  ubicacion: r.ubicacion ?? '',
  fecha_hora: r.fecha_hora ?? null,
  observaciones: r.observaciones ?? '',
  creado_en: r.creado_en ?? null,
  actualizado_en: r.actualizado_en ?? null,
  tecnico_nombre: r.tecnico_nombre ?? '',
});

// ============ Thunks ============
export const fetchIndiciosByExpediente = createAsyncThunk(
  'indicios/list',
  async ({ expedienteId, ...params } = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/indicios', {
        params: { expedienteId, ...params },
      });
      // { data: [...], total, page, pageSize }
      return { expedienteId, rows: (data?.data || []).map(norm) };
    } catch (e) {
      return rejectWithValue(e?.response?.data?.error || 'Error al listar indicios');
    }
  }
);

export const createIndicio = createAsyncThunk(
  'indicios/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/indicios', payload);
      return norm(data);
    } catch (e) {
      return rejectWithValue(e?.response?.data?.error || 'No se pudo crear el indicio');
    }
  }
);

export const updateIndicio = createAsyncThunk(
  'indicios/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/indicios/${id}`, payload);
      return norm(data);
    } catch (e) {
      return rejectWithValue(e?.response?.data?.error || 'No se pudo actualizar el indicio');
    }
  }
);

export const deleteIndicio = createAsyncThunk(
  'indicios/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/indicios/${id}`);
      return id;
    } catch (e) {
      return rejectWithValue(e?.response?.data?.error || 'No se pudo eliminar el indicio');
    }
  }
);

// ============ Slice ============
const indiciosSlice = createSlice({
  name: 'indicios',
  initialState: { byExpediente: {}, loading: false, error: null },
  reducers: {
    clearIndicios(state, action) {
      const expId = action.payload;
      if (expId) delete state.byExpediente[expId];
    },
  },
  extraReducers: (builder) => {
    builder
      // Listar
      .addCase(fetchIndiciosByExpediente.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchIndiciosByExpediente.fulfilled, (s, { payload }) => {
        s.loading = false;
        if (payload?.expedienteId != null) {
          s.byExpediente[payload.expedienteId] = payload.rows;
        }
      })
      .addCase(fetchIndiciosByExpediente.rejected, (s, { payload }) => { s.loading = false; s.error = payload; })

      // Crear
      .addCase(createIndicio.fulfilled, (s, { payload }) => {
        const eId = payload?.expedienteId;
        if (eId != null) {
          s.byExpediente[eId] = [payload, ...(s.byExpediente[eId] || [])];
        }
      })

      // Actualizar
      .addCase(updateIndicio.fulfilled, (s, { payload }) => {
        const eId = payload?.expedienteId;
        if (eId != null && s.byExpediente[eId]) {
          s.byExpediente[eId] = s.byExpediente[eId].map((r) =>
            r.id === payload.id ? payload : r
          );
        }
      })

      // Eliminar
      .addCase(deleteIndicio.fulfilled, (s, { payload: deletedId }) => {
        Object.keys(s.byExpediente).forEach((k) => {
          s.byExpediente[k] = (s.byExpediente[k] || []).filter((r) => r.id !== deletedId);
        });
      });
  },
});

export const { clearIndicios } = indiciosSlice.actions;
export default indiciosSlice.reducer;
