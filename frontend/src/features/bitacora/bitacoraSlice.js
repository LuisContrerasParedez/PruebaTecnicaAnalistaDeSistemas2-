import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

export const listBitacora = createAsyncThunk('bitacora/list', async (params={}, { rejectWithValue })=>{
  try { const { data } = await api.get('/bitacora', { params }); return data; }
  catch(e){ return rejectWithValue('Error bitácora'); }
});

const slice = createSlice({
  name: 'bitacora',
  initialState: { items: [], total:0, loading:false, error:null, page:1, pageSize:20 },
  reducers: {},
  extraReducers: (b)=>{
    b.addCase(listBitacora.pending,(st)=>{ st.loading=true; st.error=null; });
    b.addCase(listBitacora.fulfilled,(st,{payload})=>{
      st.loading=false; st.items=payload.data||[]; st.total=payload.total||0; st.page=payload.page||1; st.pageSize=payload.pageSize||20;
    });
    b.addCase(listBitacora.rejected,(st,{payload})=>{ st.loading=false; st.error=payload; });
  }
});
export default slice.reducer;
