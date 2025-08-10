import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

// --- Thunks ---
export const fetchExpedientes = createAsyncThunk(
  'expedientes/fetch',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { q, estado, desde, hasta, page = 1, pageSize = 20 } = params;
      const { data } = await api.get('/expedientes', { params: { q, estado, desde, hasta, page, pageSize } });
      return data; // { data, page, pageSize, total }
    } catch (e) {
      return rejectWithValue(e?.response?.data?.error || 'Error al cargar expedientes');
    }
  }
);

export const createExpediente = createAsyncThunk(
  'expedientes/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/expedientes', payload);
      return data;
    } catch (e) {
      return rejectWithValue(e?.response?.data?.error || 'No se pudo crear el expediente');
    }
  }
);

export const updateExpediente = createAsyncThunk(
  'expedientes/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/expedientes/${id}`, payload);
      return data;
    } catch (e) {
      return rejectWithValue(e?.response?.data?.error || 'No se pudo actualizar el expediente');
    }
  }
);

export const enviarRevision = createAsyncThunk(
  'expedientes/enviar',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/expedientes/${id}/enviar`);
      return data;
    } catch (e) {
      return rejectWithValue(e?.response?.data?.error || 'No se pudo enviar a revisión');
    }
  }
);

export const aprobarExpediente = createAsyncThunk(
  'expedientes/aprobar',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/expedientes/${id}/aprobar`);
      return data;
    } catch (e) {
      return rejectWithValue(e?.response?.data?.error || 'No se pudo aprobar');
    }
  }
);

export const rechazarExpediente = createAsyncThunk(
  'expedientes/rechazar',
  async ({ id, justificacion }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/expedientes/${id}/rechazar`, { justificacion });
      return data;
    } catch (e) {
      return rejectWithValue(e?.response?.data?.error || 'No se pudo rechazar');
    }
  }
);

// --- Slice ---
const initial = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 20,
  loading: false,
  error: null,
  filters: { q: '', estado: '', desde: '', hasta: '' },
};

const expedientesSlice = createSlice({
  name: 'expedientes',
  initialState: initial,
  reducers: {
    setFilters(state, { payload }) {
      state.filters = { ...state.filters, ...payload };
    },
    resetList(state) {
      Object.assign(state, initial);
    }
  },
  extraReducers: (b) => {
    b.addCase(fetchExpedientes.pending, (st) => { st.loading = true; st.error = null; });
    b.addCase(fetchExpedientes.fulfilled, (st, { payload }) => {
      st.loading = false;
      st.items = payload.data || [];
      st.page = payload.page || 1;
      st.pageSize = payload.pageSize || 20;
      st.total = payload.total || 0;
    });
    b.addCase(fetchExpedientes.rejected, (st, { payload }) => { st.loading = false; st.error = payload; });

    b.addCase(createExpediente.fulfilled, (st, { payload }) => {
      // opcional: push al inicio
      if (payload) st.items.unshift(payload);
    });
    b.addCase(updateExpediente.fulfilled, (st, { payload }) => {
      const i = st.items.findIndex(x => x.CodigoExpediente === payload.CodigoExpediente);
      if (i >= 0) st.items[i] = payload;
    });
  }
});

export const { setFilters, resetList } = expedientesSlice.actions;
export default expedientesSlice.reducer;

// Selectores
export const selectExpedientes = (st) => st.expedientes;
