import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

export const listIndicios = createAsyncThunk('indicios/list', async ({ expedienteId, page=1, pageSize=50 }={}, { rejectWithValue })=>{
  try { const { data } = await api.get(`/indicios`, { params: { expedienteId, page, pageSize } }); return data; }
  catch(e){ return rejectWithValue('Error al listar indicios'); }
});
export const createIndicio = createAsyncThunk('indicios/create', async (payload, { rejectWithValue })=>{
  try { const { data } = await api.post('/indicios', payload); return data; }
  catch(e){ return rejectWithValue('No se pudo crear indicio'); }
});
export const updateIndicio = createAsyncThunk('indicios/update', async ({ id, payload }, { rejectWithValue })=>{
  try { const { data } = await api.patch(`/indicios/${id}`, payload); return data; }
  catch(e){ return rejectWithValue('No se pudo actualizar'); }
});
export const deleteIndicio = createAsyncThunk('indicios/delete', async (id, { rejectWithValue })=>{
  try { const { data } = await api.delete(`/indicios/${id}`); return { id, data }; }
  catch(e){ return rejectWithValue('No se pudo eliminar'); }
});

const slice = createSlice({
  name: 'indicios',
  initialState: { items: [], total:0, loading:false, error:null },
  reducers: {},
  extraReducers: (b)=>{
    b.addCase(listIndicios.pending,(st)=>{ st.loading=true; st.error=null; });
    b.addCase(listIndicios.fulfilled,(st,{payload})=>{
      st.loading=false; st.items=payload.data || []; st.total=payload.total || st.items.length;
    });
    b.addCase(listIndicios.rejected,(st,{payload})=>{ st.loading=false; st.error=payload; });
    b.addCase(createIndicio.fulfilled,(st,{payload})=>{ st.items.unshift(payload); });
    b.addCase(updateIndicio.fulfilled,(st,{payload})=>{
      const i = st.items.findIndex(x=>x.CodigoIndicio===payload.CodigoIndicio);
      if(i>=0) st.items[i]=payload;
    });
    b.addCase(deleteIndicio.fulfilled,(st,{payload})=>{
      st.items = st.items.filter(x=>x.CodigoIndicio!==payload.id);
    });
  }
});
export default slice.reducer;
