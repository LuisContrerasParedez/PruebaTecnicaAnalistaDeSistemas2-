// src/features/reportes/reportesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

// --- Expedientes: Resumen por estado ---
export const fetchExpedientesResumen = createAsyncThunk(
  'reportes/expedientesResumen',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/reportes/expedientes/resumen', { params });
      // data = array de filas (depende de tu SP). Normalizamos a KPIs:
      const buckets = { Borrador:0, EnRevision:0, Rechazado:0, Aprobado:0 };
      for (const r of data || []) {
        const estado = (r.estado || r.Estado || '').replace(/\s/g,'');
        const total  = Number(r.total || r.Total || r.cantidad || 0);
        if (estado in buckets) buckets[estado] += total;
      }
      return {
        raw: data,
        totales: {
          registrados: (data || []).reduce((acc, r) => acc + (Number(r.total || r.Total || 0)), 0),
          aprobados: buckets.Aprobado,
          rechazados: buckets.Rechazado,
          borrador: buckets.Borrador,
          enRevision: buckets.EnRevision,
        }
      };
    } catch (e) {
      return rejectWithValue(e?.response?.data?.error || 'Error en resumen');
    }
  }
);

// --- Expedientes: Detalle paginado ---
export const fetchExpedientesDetalle = createAsyncThunk(
  'reportes/expedientesDetalle',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/reportes/expedientes/detalle', { params });
      return data; // { data, page, pageSize, total }
    } catch (e) {
      return rejectWithValue('Error al cargar detalle');
    }
  }
);

// --- Export CSV (detalle) ---
export const exportExpedientesDetalleCsv = createAsyncThunk(
  'reportes/exportDetalleCsv',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/reportes/expedientes/detalle.csv', {
        params,
        responseType: 'blob'
      });
      return res.data;
    } catch (e) {
      return rejectWithValue('No se pudo exportar CSV');
    }
  }
);

// --- Serie diaria ---
export const fetchExpedientesSerieDiaria = createAsyncThunk(
  'reportes/serieDiaria',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/reportes/expedientes/serie-diaria', { params });
      return data;
    } catch {
      return rejectWithValue('Error en serie diaria');
    }
  }
);

// --- Indicios por expediente ---
export const fetchIndiciosPorExpediente = createAsyncThunk(
  'reportes/indiciosPorExpediente',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/reportes/indicios/por-expediente', { params });
      return data; // { data, page, pageSize, total }
    } catch {
      return rejectWithValue('Error en indicios por expediente');
    }
  }
);

// --- Motivos de rechazo ---
export const fetchRechazosMotivos = createAsyncThunk(
  'reportes/rechazosMotivos',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/reportes/rechazos/motivos', { params });
      return data; // array
    } catch {
      return rejectWithValue('Error en motivos de rechazo');
    }
  }
);

const slice = createSlice({
  name: 'reportes',
  initialState: {
    loading: false,
    error: null,
    resumen: null,         // { raw, totales }
    detalle: { data: [], page: 1, pageSize: 50, total: 0 },
    serie: [],
    indicios: { data: [], page: 1, pageSize: 50, total: 0 },
    motivos: []
  },
  reducers: {},
  extraReducers: (b) => {
    // Resumen
    b.addCase(fetchExpedientesResumen.pending, (st)=>{ st.loading = true; st.error = null; });
    b.addCase(fetchExpedientesResumen.fulfilled, (st,{payload})=>{ st.loading=false; st.resumen=payload; });
    b.addCase(fetchExpedientesResumen.rejected, (st,{payload})=>{ st.loading=false; st.error=payload; });

    // Detalle
    b.addCase(fetchExpedientesDetalle.fulfilled, (st,{payload})=>{ st.detalle = payload; });

    // Serie
    b.addCase(fetchExpedientesSerieDiaria.fulfilled, (st,{payload})=>{ st.serie = payload || []; });

    // Indicios
    b.addCase(fetchIndiciosPorExpediente.fulfilled, (st,{payload})=>{ st.indicios = payload; });

    // Motivos
    b.addCase(fetchRechazosMotivos.fulfilled, (st,{payload})=>{ st.motivos = payload || []; });
  }
});

export default slice.reducer;
