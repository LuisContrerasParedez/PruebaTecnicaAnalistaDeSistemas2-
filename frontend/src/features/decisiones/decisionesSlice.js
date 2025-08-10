import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

export const listDecisiones = createAsyncThunk('decisiones/list', async ({ expedienteId, page=1, pageSize=50 }={}, { rejectWithValue })=>{
  try { const { data } = await api.get('/decisiones', { params: { expedienteId, page, pageSize } }); return data; }
  catch(e){ return rejectWithValue('Error decisiones'); }
});

const slice = createSlice({
  name: 'decisiones',
  initialState: { items: [], total:0, loading:false, error:null },
  reducers: {},
  extraReducers: (b)=>{
    b.addCase(listDecisiones.pending,(st)=>{ st.loading=true; st.error=null; });
    b.addCase(listDecisiones.fulfilled,(st,{payload})=>{ st.loading=false; st.items=payload.data||[]; st.total=payload.total||0; });
    b.addCase(listDecisiones.rejected,(st,{payload})=>{ st.loading=false; st.error=payload; });
  }
});
export default slice.reducer;
