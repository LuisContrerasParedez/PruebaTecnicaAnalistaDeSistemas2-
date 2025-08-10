import { configureStore } from '@reduxjs/toolkit';

import auth from '../features/auth/authSlice';
import usuarios from '../features/usuarios/usuariosSlice';
import roles from '../features/roles/rolesSlice';
import catalogos from '../features/catalogos/catalogosSlice';
import expedientes from '../features/expedientes/expedientesSlice';
import indicios from '../features/indicios/indiciosSlice';
import decisiones from '../features/decisiones/decisionesSlice';
import adjuntos from '../features/adjuntos/adjuntosSlice';
import bitacora from '../features/bitacora/bitacoraSlice';
import reportes from '../features/reportes/reportesSlice';

export const store = configureStore({
  reducer: {
    auth,
    usuarios,
    roles,
    catalogos,
    expedientes,
    indicios,
    decisiones,
    adjuntos,
    bitacora,
    reportes,
  },
  middleware: (gDM) => gDM({ serializableCheck: false }),
});

export const selectAuth = (st) => st.auth;
export const selectUsuarios = (st) => st.usuarios;
export const selectRoles = (st) => st.roles;
export const selectCatalogos = (st) => st.catalogos;
export const selectExpedientes = (st) => st.expedientes;
export const selectIndicios = (st) => st.indicios;
export const selectDecisiones = (st) => st.decisiones;
export const selectAdjuntos = (st) => st.adjuntos;
export const selectBitacora = (st) => st.bitacora;
export const selectReportes = (st) => st.reportes;
