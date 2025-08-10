// src/App.jsx
import { Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom';
import { Suspense } from 'react';

// Guards / Layout
import PrivateRoute from './components/PrivateRoute.jsx';
import AdminRoute   from './components/AdminRoute.jsx';
import AppShell     from './components/AppShell.jsx';

// Públicas
import Login from './pages/Login.jsx';

// Privadas (generales)
import Home from './pages/Home.jsx';

// Listado del técnico
import ExpedientesTecnicoList from './pages/ExpedientesTecnicoList.jsx';

import ExpedienteGestionPage from './pages/expedientes/ExpedienteGestionPage.jsx';

// Administración (solo Admin)
import AdminLayout  from './pages/admin/AdminLayout.jsx';
import UsuariosPage from './pages/admin/UsuariosPage.jsx';
import RolesPage    from './pages/admin/RolesPage.jsx';
import ReportesPage from './pages/admin/ReportesPage.jsx';

// Shell con navbar + container
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

// Pasar :id como prop al componente de gestión
function ExpedienteDetalleWrapper() {
  const { id } = useParams();
  return <ExpedienteGestionPage expedienteId={Number(id)} />;
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
          <Route path="expedientes" element={<ExpedientesTecnicoList />} />
          <Route path="expedientes/nuevo" element={<ExpedienteGestionPage />} />
          <Route path="expedientes/:id" element={<ExpedienteDetalleWrapper />} />

          {/* ---------- Administración (solo admin) ---------- */}
          <Route path="admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/usuarios" replace />} />
              <Route path="usuarios" element={<UsuariosPage />} />
              <Route path="roles"    element={<RolesPage />} />
              <Route path="reportes" element={<ReportesPage />} />
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
