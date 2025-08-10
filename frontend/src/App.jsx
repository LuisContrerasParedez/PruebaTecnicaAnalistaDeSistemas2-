// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from '/src/components/PrivateRoute';
import AppShell from '/src/components/AppShell';

import Login from '/src/pages/Login';
import Home from '/src/pages/Home';
import ExpedientesList from '/src/pages/ExpedientesList';
import ExpedienteForm from '/src/pages/ExpedienteForm';
// import ... resto de módulos

export default function App() {
  return (
    <Routes>
      {/* Rutas protegidas renderizan dentro de AppShell */}
      <Route element={<PrivateRoute><AppShell><OutletWrapper /></AppShell></PrivateRoute>}>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Expedientes */}
        <Route path="/expedientes" element={<ExpedientesList />} />
        <Route path="/expedientes/nuevo" element={<ExpedienteForm />} />
        {/* <Route path="/expedientes/:id" element={<ExpedienteDetalle />} /> */}

        {/* …otros módulos: usuarios, roles, reportes, etc. */}
      </Route>

      {/* Login público */}
      <Route path="/login" element={<Login />} />

      {/* 404 */}
      <Route path="*" element={<div style={{ padding: 24 }}>404</div>} />
    </Routes>
  );
}

import { Outlet } from 'react-router-dom';
function OutletWrapper() { return <Outlet />; }
