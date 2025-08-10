import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

export const resumenReportes = createAsyncThunk('reportes/resumen', async (params={}, { rejectWithValue })=>{
  try { const { data } = await api.get('/reportes/resumen', { params }); return data; }
  catch(e){ return rejectWithValue('Error en resumen'); }
});
export const exportarReportes = createAsyncThunk('reportes/export', async (params={}, { rejectWithValue })=>{
  try {
    const { data } = await api.get('/reportes/export', { params, responseType: 'blob' });
    return data; // blob
  } catch(e){ return rejectWithValue('No se pudo exportar'); }
});

const slice = createSlice({
  name: 'reportes',
  initialState: { loading:false, error:null, resumen:null },
  reducers: {},
  extraReducers: (b)=>{
    b.addCase(resumenReportes.pending,(st)=>{ st.loading=true; st.error=null; });
    b.addCase(resumenReportes.fulfilled,(st,{payload})=>{ st.loading=false; st.resumen=payload; });
    b.addCase(resumenReportes.rejected,(st,{payload})=>{ st.loading=false; st.error=payload; });
  }
});
export default slice.reducer;
