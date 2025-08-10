import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

// --- Thunks ---
export const listRoles = createAsyncThunk('roles/list', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/roles', { params });
    // Esperado: { data:[{CodigoRol,nombre,permisos,...}], total,page,pageSize }
    return data;
  } catch (e) {
    return rejectWithValue(e?.response?.data?.error || 'Error al listar roles');
  }
});

export const createRol = createAsyncThunk('roles/create', async (payload, { rejectWithValue }) => {
  try {
    // payload: { nombre, permisos }
    const { data } = await api.post('/roles', payload);
    return data;
  } catch (e) {
    return rejectWithValue(e?.response?.data?.error || 'No se pudo crear el rol');
  }
});

export const updateRol = createAsyncThunk('roles/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/roles/${id}`, payload);
    return data;
  } catch (e) {
    return rejectWithValue(e?.response?.data?.error || 'No se pudo actualizar el rol');
  }
});

export const deleteRol = createAsyncThunk('roles/delete', async (id, { rejectWithValue }) => {
  try {
    // Si tu backend no soporta DELETE, cambia por PATCH activo:false
    const { data } = await api.delete(`/roles/${id}`);
    return { id, data };
  } catch (e) {
    return rejectWithValue(e?.response?.data?.error || 'No se pudo eliminar el rol');
  }
});

// --- Slice ---
const slice = createSlice({
  name: 'roles',
  initialState: {
    items: [],
    total: 0,
    page: 1,
    pageSize: 20,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (b) => {
    // List
    b.addCase(listRoles.pending, (st) => { st.loading = true; st.error = null; });
    b.addCase(listRoles.fulfilled, (st, { payload }) => {
      st.loading = false;
      st.items = payload?.data ?? [];
      st.total = payload?.total ?? st.items.length;
      st.page = payload?.page ?? 1;
      st.pageSize = payload?.pageSize ?? 20;
    });
    b.addCase(listRoles.rejected, (st, { payload }) => { st.loading = false; st.error = payload; });

    // Create
    b.addCase(createRol.pending, (st) => { st.loading = true; st.error = null; });
    b.addCase(createRol.fulfilled, (st, { payload }) => {
      st.loading = false;
      if (payload) st.items.unshift(payload);
    });
    b.addCase(createRol.rejected, (st, { payload }) => { st.loading = false; st.error = payload; });

    // Update
    b.addCase(updateRol.pending, (st) => { st.loading = true; st.error = null; });
    b.addCase(updateRol.fulfilled, (st, { payload }) => {
      st.loading = false;
      const i = st.items.findIndex(r => (r.CodigoRol ?? r.id) === (payload.CodigoRol ?? payload.id));
      if (i >= 0) st.items[i] = payload;
    });
    b.addCase(updateRol.rejected, (st, { payload }) => { st.loading = false; st.error = payload; });

    // Delete
    b.addCase(deleteRol.pending, (st) => { st.loading = true; st.error = null; });
    b.addCase(deleteRol.fulfilled, (st, { meta }) => {
      st.loading = false;
      const id = meta?.arg;
      st.items = st.items.filter(r => (r.CodigoRol ?? r.id) !== id);
    });
    b.addCase(deleteRol.rejected, (st, { payload }) => { st.loading = false; st.error = payload; });
  },
});

export default slice.reducer;
