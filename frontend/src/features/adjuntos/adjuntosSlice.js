// src/features/adjuntos/adjuntosSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

// Helpers
const keyFrom = ({ entidad, entidadId }) => `${String(entidad)}:${Number(entidadId)}`;
const normalize = (r) => ({
  id: r.id ?? r.CodigoAdjunto ?? r.codigoAdjunto ?? null,
  entidad: r.entidad,
  entidadId: r.entidadId ?? r.entidad_id ?? null,
  nombreArchivo: r.nombreArchivo ?? r.nombre_archivo ?? '',
  ruta: r.ruta ?? '',
  tipoMime: r.tipoMime ?? r.tipo_mime ?? '',
  tamanoBytes: r.tamanoBytes ?? r.tamano_bytes ?? 0,
});

// Thunks
export const fetchAdjuntos = createAsyncThunk('adjuntos/list', async (query) => {
  const { data } = await api.get('/adjuntos', { params: query });
  // tu backend devuelve { data: [...] }
  return data; // <-- { data: [...] , page, pageSize, total }
});

export const createAdjunto = createAsyncThunk('adjuntos/create', async (payload) => {
  const { data } = await api.post('/adjuntos', payload);
  return data; // devuelve el adjunto creado
});

export const deleteAdjunto = createAsyncThunk('adjuntos/delete', async (id) => {
  await api.delete(`/adjuntos/${id}`);
  return id;
});

const adjuntosSlice = createSlice({
  name: 'adjuntos',
  initialState: { byEntidad: {}, loading: false, error: null },
  reducers: {
    clearAdjuntos(state, action) {
      const key = action.payload;
      if (key) delete state.byEntidad[key];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdjuntos.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchAdjuntos.fulfilled, (s, a) => {
        s.loading = false;
        const key = keyFrom(a.meta.arg || {});
        // acepta tanto {data:[...]} como [...] por si acaso
        const listRaw = Array.isArray(a.payload) ? a.payload : (a.payload?.data || []);
        s.byEntidad[key] = listRaw.map(normalize);
      })
      .addCase(fetchAdjuntos.rejected, (s, a) => { s.loading = false; s.error = a.error.message; })

      .addCase(createAdjunto.fulfilled, (s, a) => {
        const adj = normalize(a.payload || {});
        const key = keyFrom({ entidad: adj.entidad, entidadId: adj.entidadId });
        s.byEntidad[key] = [adj, ...(s.byEntidad[key] || [])];
      })
      .addCase(deleteAdjunto.fulfilled, (s, a) => {
        const deletedId = a.payload;
        Object.keys(s.byEntidad).forEach((k) => {
          s.byEntidad[k] = (s.byEntidad[k] || []).filter((r) => r.id !== deletedId);
        });
      });
  },
});

export const { clearAdjuntos } = adjuntosSlice.actions;
export default adjuntosSlice.reducer;
