import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

// Helpers
const getServerError = (e, fallback) =>
  e?.response?.data?.error || e?.message || fallback;

// Limpia params vacíos y castea números
const normalizeParams = (p = {}) => {
  const out = { ...p };

  // strings vacías -> remove
  for (const k of ['q', 'desde', 'hasta', 'estado', 'unidad']) {
    if (out[k] === '') delete out[k];
  }

  // numéricos opcionales
  if (out.tecnicoId === '' || out.tecnicoId == null) delete out.tecnicoId;
  else out.tecnicoId = Number(out.tecnicoId);

  if (out.coordinadorId === '' || out.coordinadorId == null) delete out.coordinadorId;
  else out.coordinadorId = Number(out.coordinadorId);

  // página
  if (out.page != null) out.page = Number(out.page);
  if (out.pageSize != null) out.pageSize = Number(out.pageSize);

  return out;
};

// --- Expedientes: Resumen por estado ---
export const fetchExpedientesResumen = createAsyncThunk(
  'reportes/expedientesResumen',
  async (params = {}, { rejectWithValue }) => {
    try {
      const clean = normalizeParams(params);
      const { data } = await api.get('/reportes/expedientes/resumen', { params: clean });

      // Normalizamos a KPIs
      const buckets = { Borrador: 0, EnRevision: 0, Rechazado: 0, Aprobado: 0 };
      for (const r of data || []) {
        const estado = (r.estado || r.Estado || '').replace(/\s/g, '');
        const total = Number(r.total || r.Total || r.cantidad || 0);
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
      return rejectWithValue(getServerError(e, 'Error en resumen'));
    }
  }
);

// --- Expedientes: Detalle paginado ---
export const fetchExpedientesDetalle = createAsyncThunk(
  'reportes/expedientesDetalle',
  async (params = {}, { rejectWithValue }) => {
    try {
      const clean = normalizeParams(params);
      if (clean.page == null) clean.page = 1;
      if (clean.pageSize == null) clean.pageSize = 50;

      const { data } = await api.get('/reportes/expedientes/detalle', { params: clean });
      return data; // { data, page, pageSize, total }
    } catch (e) {
      return rejectWithValue(getServerError(e, 'Error al cargar detalle'));
    }
  }
);

// --- Export CSV (detalle) ---
export const exportExpedientesDetalleCsv = createAsyncThunk(
  'reportes/exportDetalleCsv',
  async (params = {}, { rejectWithValue }) => {
    try {
      const clean = normalizeParams(params);
      const res = await api.get('/reportes/expedientes/detalle.csv', {
        params: clean,
        responseType: 'blob'
      });

      let fileName = 'expedientes_detalle.csv';
      const cd = res.headers?.['content-disposition'] || res.headers?.['Content-Disposition'];
      if (cd) {
        const match = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(cd);
        if (match) fileName = decodeURIComponent(match[1] || match[2]);
      }

      const url = window.URL.createObjectURL(res.data);
      return { url, fileName, size: res.data?.size ?? null };
    } catch (e) {
      return rejectWithValue(getServerError(e, 'No se pudo exportar CSV'));
    }
  }
);

// --- Serie diaria ---
export const fetchExpedientesSerieDiaria = createAsyncThunk(
  'reportes/serieDiaria',
  async (params = {}, { rejectWithValue }) => {
    try {
      const clean = normalizeParams(params);
      // ⚠️ El backend valida boolean estricto → solo mandar si es boolean
      if (typeof params?.porEstado === 'boolean') clean.porEstado = params.porEstado;
      const { data } = await api.get('/reportes/expedientes/serie-diaria', { params: clean });
      return data || [];
    } catch (e) {
      return rejectWithValue(getServerError(e, 'Error en serie diaria'));
    }
  }
);

// --- Indicios por expediente ---
export const fetchIndiciosPorExpediente = createAsyncThunk(
  'reportes/indiciosPorExpediente',
  async (params = {}, { rejectWithValue }) => {
    try {
      const clean = normalizeParams(params);
      if (clean.page == null) clean.page = 1;
      if (clean.pageSize == null) clean.pageSize = 50;

      const { data } = await api.get('/reportes/indicios/por-expediente', { params: clean });
      return data; // { data, page, pageSize, total }
    } catch (e) {
      return rejectWithValue(getServerError(e, 'Error en indicios por expediente'));
    }
  }
);

// --- Motivos de rechazo ---
export const fetchRechazosMotivos = createAsyncThunk(
  'reportes/rechazosMotivos',
  async (params = {}, { rejectWithValue }) => {
    try {
      const clean = normalizeParams(params);
      if (clean.top != null) clean.top = Number(clean.top);

      const { data } = await api.get('/reportes/rechazos/motivos', { params: clean });
      return data || [];
    } catch (e) {
      return rejectWithValue(getServerError(e, 'Error en motivos de rechazo'));
    }
  }
);

const initialState = {
  resumenLoading: false,
  detalleLoading: false,
  csvLoading: false,
  serieLoading: false,
  indiciosLoading: false,
  motivosLoading: false,

  resumenError: null,
  detalleError: null,
  csvError: null,
  serieError: null,
  indiciosError: null,
  motivosError: null,

  resumen: null,
  detalle: { data: [], page: 1, pageSize: 50, total: 0 },
  csvDownload: null,
  serie: [],
  indicios: { data: [], page: 1, pageSize: 50, total: 0 },
  motivos: []
};

const slice = createSlice({
  name: 'reportes',
  initialState,
  reducers: {
    clearCsv(state) {
      if (state.csvDownload?.url) {
        try { window.URL.revokeObjectURL(state.csvDownload.url); } catch {}
      }
      state.csvDownload = null;
      state.csvError = null;
      state.csvLoading = false;
    }
  },
  extraReducers: (b) => {
    // Resumen
    b.addCase(fetchExpedientesResumen.pending, (st) => { st.resumenLoading = true; st.resumenError = null; });
    b.addCase(fetchExpedientesResumen.fulfilled, (st, { payload }) => { st.resumenLoading = false; st.resumen = payload; });
    b.addCase(fetchExpedientesResumen.rejected, (st, { payload }) => { st.resumenLoading = false; st.resumenError = payload; });

    // Detalle
    b.addCase(fetchExpedientesDetalle.pending, (st) => { st.detalleLoading = true; st.detalleError = null; });
    b.addCase(fetchExpedientesDetalle.fulfilled, (st, { payload }) => { st.detalleLoading = false; st.detalle = payload; });
    b.addCase(fetchExpedientesDetalle.rejected, (st, { payload }) => { st.detalleLoading = false; st.detalleError = payload; });

    // Export CSV
    b.addCase(exportExpedientesDetalleCsv.pending, (st) => { st.csvLoading = true; st.csvError = null; st.csvDownload = null; });
    b.addCase(exportExpedientesDetalleCsv.fulfilled, (st, { payload }) => { st.csvLoading = false; st.csvDownload = payload; });
    b.addCase(exportExpedientesDetalleCsv.rejected, (st, { payload }) => { st.csvLoading = false; st.csvError = payload; });

    // Serie diaria
    b.addCase(fetchExpedientesSerieDiaria.pending, (st) => { st.serieLoading = true; st.serieError = null; });
    b.addCase(fetchExpedientesSerieDiaria.fulfilled, (st, { payload }) => { st.serieLoading = false; st.serie = payload || []; });
    b.addCase(fetchExpedientesSerieDiaria.rejected, (st, { payload }) => { st.serieLoading = false; st.serieError = payload; });

    // Indicios
    b.addCase(fetchIndiciosPorExpediente.pending, (st) => { st.indiciosLoading = true; st.indiciosError = null; });
    b.addCase(fetchIndiciosPorExpediente.fulfilled, (st, { payload }) => { st.indiciosLoading = false; st.indicios = payload; });
    b.addCase(fetchIndiciosPorExpediente.rejected, (st, { payload }) => { st.indiciosLoading = false; st.indiciosError = payload; });

    // Motivos
    b.addCase(fetchRechazosMotivos.pending, (st) => { st.motivosLoading = true; st.motivosError = null; });
    b.addCase(fetchRechazosMotivos.fulfilled, (st, { payload }) => { st.motivosLoading = false; st.motivos = payload || []; });
    b.addCase(fetchRechazosMotivos.rejected, (st, { payload }) => { st.motivosLoading = false; st.motivosError = payload; });
  }
});

export const { clearCsv } = slice.actions;
export default slice.reducer;
