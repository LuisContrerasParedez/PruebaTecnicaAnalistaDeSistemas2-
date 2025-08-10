// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import expedientesReducer from '../features/expedientes/expedientesSlice'; // Asegúrate de importar tu reducer de expedientes

export const store = configureStore({
    reducer: {
        auth: authReducer,
        expedientes: expedientesReducer
    },
    middleware: (getDefault) => getDefault({ serializableCheck: false }),
});




export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => Boolean(state.auth?.accessToken);
export default store;
