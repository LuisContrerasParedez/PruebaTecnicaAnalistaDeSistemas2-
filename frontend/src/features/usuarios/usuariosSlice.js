import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

export const fetchUsuarios  = createAsyncThunk('usuarios/list', async (params={}, { rejectWithValue })=>{
  try { const { data } = await api.get('/usuarios', { params }); return data; }
  catch(e){ return rejectWithValue(e?.response?.data?.error || 'Error al listar'); }
});
export const getUsuario = createAsyncThunk('usuarios/get', async (id, { rejectWithValue })=>{
  try { const { data } = await api.get(`/usuarios/${id}`); return data; }
  catch(e){ return rejectWithValue('No encontrado'); }
});
export const createUsuario = createAsyncThunk('usuarios/create', async (payload, { rejectWithValue })=>{
  try { const { data } = await api.post('/usuarios', payload); return data; }
  catch(e){ return rejectWithValue(e?.response?.data?.error || 'No se pudo crear'); }
});
export const updateUsuario = createAsyncThunk('usuarios/update', async ({id, payload}, { rejectWithValue })=>{
  try { const { data } = await api.patch(`/usuarios/${id}`, payload); return data; }
  catch(e){ return rejectWithValue('No se pudo actualizar'); }
});
export const setUsuarioActivo = createAsyncThunk('usuarios/activo', async ({id, activo}, { rejectWithValue })=>{
  try { const { data } = await api.patch(`/usuarios/${id}/activo`, { activo }); return data; }
  catch(e){ return rejectWithValue('No se pudo cambiar estado'); }
});
export const setUsuarioPassword = createAsyncThunk('usuarios/password', async ({id, password}, { rejectWithValue })=>{
  try { const { data } = await api.post(`/usuarios/${id}/password`, { password }); return data; }
  catch(e){ return rejectWithValue('No se pudo cambiar contraseña'); }
});

const slice = createSlice({
  name: 'usuarios',
  initialState: { items: [], total: 0, page: 1, pageSize: 20, loading: false, error: null, current: null },
  reducers: {},
  extraReducers: (b)=> {
    b.addCase(fetchUsuarios  .pending, (st)=>{ st.loading=true; st.error=null; });
    b.addCase(fetchUsuarios  .fulfilled, (st,{payload})=>{
      st.loading=false; st.items=payload.data; st.total=payload.total; st.page=payload.page; st.pageSize=payload.pageSize;
    });
    b.addCase(fetchUsuarios  .rejected,(st,{payload})=>{ st.loading=false; st.error=payload; });
    b.addCase(getUsuario.fulfilled,(st,{payload})=>{ st.current=payload; });
    b.addCase(createUsuario.fulfilled,(st,{payload})=>{ st.items.unshift(payload); });
    b.addCase(updateUsuario.fulfilled,(st,{payload})=>{
      const i = st.items.findIndex(u=>u.CodigoUsuario===payload.CodigoUsuario);
      if(i>=0) st.items[i]=payload;
      if(st.current?.CodigoUsuario===payload.CodigoUsuario) st.current=payload;
    });
    b.addCase(setUsuarioActivo.fulfilled,(st,{payload})=>{
      const i = st.items.findIndex(u=>u.CodigoUsuario===payload.CodigoUsuario);
      if(i>=0) st.items[i]=payload;
    });
  }
});
export default slice.reducer;
