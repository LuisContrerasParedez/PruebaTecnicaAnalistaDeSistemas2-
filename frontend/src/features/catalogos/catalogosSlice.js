import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

export const listCatalogo = createAsyncThunk('catalogos/list', async ({ tipo, q, page=1, pageSize=100 }={}, { rejectWithValue })=>{
  try { const { data } = await api.get('/catalogos', { params: { tipo, q, page, pageSize } }); return data; }
  catch(e){ return rejectWithValue('Error catálogos'); }
});
export const createCatalogo = createAsyncThunk('catalogos/create', async (payload, { rejectWithValue })=>{
  try { const { data } = await api.post('/catalogos', payload); return data; }
  catch(e){ return rejectWithValue('No se pudo crear'); }
});
export const updateCatalogo = createAsyncThunk('catalogos/update', async ({id, payload}, { rejectWithValue })=>{
  try { const { data } = await api.patch(`/catalogos/${id}`, payload); return data; }
  catch(e){ return rejectWithValue('No se pudo actualizar'); }
});

const slice = createSlice({
  name: 'catalogos',
  initialState: { byTipo: {}, loading: false, error: null },
  reducers: {},
  extraReducers: (b)=>{
    b.addCase(listCatalogo.pending,(st)=>{ st.loading=true; st.error=null; });
    b.addCase(listCatalogo.fulfilled,(st,{meta, payload})=>{
      st.loading=false;
      const tipo = meta?.arg?.tipo || '_';
      st.byTipo[tipo] = payload.data || [];
    });
    b.addCase(listCatalogo.rejected,(st,{payload})=>{ st.loading=false; st.error=payload; });
  }
});
export default slice.reducer;
