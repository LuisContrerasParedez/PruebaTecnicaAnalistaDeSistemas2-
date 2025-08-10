import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

export const fetchExpedientes = createAsyncThunk('expedientes/fetch', async (params={}, { rejectWithValue })=>{
  try { const { data } = await api.get('/expedientes', { params }); return data; }
  catch(e){ return rejectWithValue(e?.response?.data?.error || 'Error al cargar expedientes'); }
});
export const getExpediente = createAsyncThunk('expedientes/get', async (id, { rejectWithValue })=>{
  try { const { data } = await api.get(`/expedientes/${id}`); return data; }
  catch(e){ return rejectWithValue('No encontrado'); }
});
export const createExpediente = createAsyncThunk('expedientes/create', async (payload, { rejectWithValue })=>{
  try { const { data } = await api.post('/expedientes', payload); return data; }
  catch(e){ return rejectWithValue('No se pudo crear'); }
});
export const updateExpediente = createAsyncThunk('expedientes/update', async ({id, payload}, { rejectWithValue })=>{
  try { const { data } = await api.patch(`/expedientes/${id}`, payload); return data; }
  catch(e){ return rejectWithValue('No se pudo actualizar'); }
});
export const enviarRevision = createAsyncThunk('expedientes/enviar', async (id, { rejectWithValue })=>{
  try { const { data } = await api.post(`/expedientes/${id}/enviar`); return data; }
  catch(e){ return rejectWithValue('No se pudo enviar'); }
});
export const aprobarExpediente = createAsyncThunk('expedientes/aprobar', async (id, { rejectWithValue })=>{
  try { const { data } = await api.post(`/expedientes/${id}/aprobar`); return data; }
  catch(e){ return rejectWithValue('No se pudo aprobar'); }
});
export const rechazarExpediente = createAsyncThunk('expedientes/rechazar', async ({id, justificacion}, { rejectWithValue })=>{
  try { const { data } = await api.post(`/expedientes/${id}/rechazar`, { justificacion }); return data; }
  catch(e){ return rejectWithValue('No se pudo rechazar'); }
});

const slice = createSlice({
  name: 'expedientes',
  initialState: { items: [], total:0, page:1, pageSize:20, loading:false, error:null, current:null, filters:{} },
  reducers: { setFilters:(st,{payload})=>{ st.filters = { ...st.filters, ...payload }; } },
  extraReducers: (b)=>{
    b.addCase(fetchExpedientes.pending,(st)=>{ st.loading=true; st.error=null; });
    b.addCase(fetchExpedientes.fulfilled,(st,{payload})=>{
      st.loading=false; st.items=payload.data; st.total=payload.total; st.page=payload.page; st.pageSize=payload.pageSize;
    });
    b.addCase(fetchExpedientes.rejected,(st,{payload})=>{ st.loading=false; st.error=payload; });
    b.addCase(getExpediente.fulfilled,(st,{payload})=>{ st.current=payload; });
    b.addCase(createExpediente.fulfilled,(st,{payload})=>{ st.items.unshift(payload); st.current=payload; });
    b.addCase(updateExpediente.fulfilled,(st,{payload})=>{ st.current=payload; });
    b.addCase(aprobarExpediente.fulfilled,(st,{payload})=>{ st.current=payload; });
    b.addCase(rechazarExpediente.fulfilled,(st,{payload})=>{ st.current=payload; });
  }
});
export const { setFilters } = slice.actions;
export default slice.reducer;
