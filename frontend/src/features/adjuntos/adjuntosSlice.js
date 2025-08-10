import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

export const listAdjuntos = createAsyncThunk('adjuntos/list', async ({ entidad, entidadId, page=1, pageSize=50 }, { rejectWithValue })=>{
  try { const { data } = await api.get('/adjuntos', { params: { entidad, entidadId, page, pageSize } }); return data; }
  catch(e){ return rejectWithValue('Error adjuntos'); }
});
export const uploadAdjunto = createAsyncThunk('adjuntos/upload', async ({ entidad, entidadId, file }, { rejectWithValue })=>{
  try {
    const form = new FormData();
    form.append('entidad', entidad);
    form.append('entidadId', entidadId);
    form.append('file', file);
    const { data } = await api.post('/adjuntos', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return data;
  } catch(e){ return rejectWithValue('No se pudo subir'); }
});
export const deleteAdjunto = createAsyncThunk('adjuntos/delete', async (id, { rejectWithValue })=>{
  try { await api.delete(`/adjuntos/${id}`); return id; }
  catch(e){ return rejectWithValue('No se pudo eliminar'); }
});

const slice = createSlice({
  name: 'adjuntos',
  initialState: { items: [], total:0, loading:false, error:null },
  reducers: {},
  extraReducers: (b)=>{
    b.addCase(listAdjuntos.pending,(st)=>{ st.loading=true; st.error=null; });
    b.addCase(listAdjuntos.fulfilled,(st,{payload})=>{ st.loading=false; st.items=payload.data||[]; st.total=payload.total||0; });
    b.addCase(listAdjuntos.rejected,(st,{payload})=>{ st.loading=false; st.error=payload; });
    b.addCase(uploadAdjunto.fulfilled,(st,{payload})=>{ st.items.unshift(payload); });
    b.addCase(deleteAdjunto.fulfilled,(st,{payload:id})=>{ st.items = st.items.filter(x=>x.CodigoAdjunto!==id); });
  }
});
export default slice.reducer;
