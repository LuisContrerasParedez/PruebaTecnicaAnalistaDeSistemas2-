// src/lib/api.js
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: false,
});

// Setup de interceptores una vez que ya tienes el store
let isRefreshing = false;
let refreshPromise = null;
let subscribers = [];

function subscribeTokenRefresh(cb) { subscribers.push(cb); }
function onRefreshed(token) { subscribers.forEach((cb) => cb(token)); subscribers = []; }

export function attachInterceptors(store) {
  api.interceptors.request.use((config) => {
    const state = store.getState();
    const token = state.auth.accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config;
      const status = error?.response?.status;

      // Si el endpoint falló con 401 y no hemos reintentado aún
      if (status === 401 && !original._retry) {
        original._retry = true;

        const state = store.getState();
        const refreshToken = state.auth.refreshToken;

        if (!refreshToken) {
          // no hay refresh; sale sesión
          store.dispatch({ type: 'auth/logout' });
          return Promise.reject(error);
        }

        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = store.dispatch({ type: 'auth/refreshTokenThunk' }).unwrap()
            .finally(() => { isRefreshing = false; });
        }

        // Espera a que el refresh termine y reintenta
        try {
          const newAccess = await refreshPromise;
          onRefreshed(newAccess);
          return new Promise((resolve) => {
            subscribeTokenRefresh((token) => {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(api(original));
            });
          });
        } catch (err) {
          store.dispatch({ type: 'auth/logout' });
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    }
  );
}
