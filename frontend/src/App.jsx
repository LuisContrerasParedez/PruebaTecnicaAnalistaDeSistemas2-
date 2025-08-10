
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Suspense } from 'react';


// Guards / Layout
import PrivateRoute from './components/PrivateRoute.jsx';
import AdminRoute   from './components/AdminRoute.jsx';
import AppShell     from './components/AppShell.jsx';

// Públicas
import Login from './pages/Login.jsx';

// Privadas (generales)
import Home            from './pages/Home.jsx';
import ExpedientesList from './pages/ExpedientesList.jsx';
import ExpedienteForm  from './pages/ExpedienteForm.jsx';

// Administración (solo Admin)
import AdminLayout  from './pages/admin/AdminLayout.jsx';
import UsuariosPage from './pages/admin/UsuariosPage.jsx';
import RolesPage    from './pages/admin/RolesPage.jsx';
import BitacoraPage from './pages/admin/BitacoraPage.jsx';

// Renderiza las rutas privadas dentro del shell (navbar + container)
function ShellOutlet() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function NotFound() {
  return <div style={{ padding: 24 }}>404 — Página no encontrada</div>;
}

export default function App() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Cargando…</div>}>
      <Routes>
        {/* ---------- Público ---------- */}
        <Route path="/login" element={<Login />} />

        {/* ---------- Privado (requiere login) ---------- */}
        <Route element={<PrivateRoute><ShellOutlet /></PrivateRoute>}>
          {/* Home */}
          <Route index element={<Home />} />

          {/* Expedientes */}
          <Route path="expedientes" element={<ExpedientesList />} />
          <Route path="expedientes/nuevo" element={<ExpedienteForm />} />
          {/* <Route path="expedientes/:id" element={<ExpedienteDetalle />} /> */}
          

          {/* ---------- Administración (solo admin) ---------- */}
          {/* AdminRoute debe renderizar <Outlet /> si es admin */}
          <Route path="admin" element={<AdminRoute />}>
            {/* AdminLayout (barra secundaria / tabs admin) */}
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/usuarios" replace />} />
              <Route path="usuarios" element={<UsuariosPage />} />
              <Route path="roles"    element={<RolesPage />} />
              <Route path="bitacora" element={<BitacoraPage />} />
            </Route>
          </Route>

          {/* 404 dentro del ámbito privado */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Cualquier otra ruta redirige a home (protegido) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
