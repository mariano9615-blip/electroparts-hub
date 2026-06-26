import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const PlaceholderPage = ({ titulo }: { titulo: string }) => (
  <div className="p-8">
    <h1 className="text-2xl font-semibold text-ep-text-primary">{titulo}</h1>
    <p className="text-ep-text-secondary mt-2">En construcción — Sesión 2</p>
  </div>
);

const AppShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-ep-bg">{children}</div>
);

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/comprador" replace />} />
          <Route path="/comprador" element={<PlaceholderPage titulo="Dashboard Comprador" />} />
          <Route
            path="/comprador/publicar"
            element={<PlaceholderPage titulo="Publicar Pedido" />}
          />
          <Route
            path="/comprador/cotizaciones"
            element={<PlaceholderPage titulo="Mis Cotizaciones" />}
          />
          <Route
            path="/comprador/ordenes"
            element={<PlaceholderPage titulo="Mis Órdenes (Comprador)" />}
          />
          <Route
            path="/comprador/chat"
            element={<PlaceholderPage titulo="Chat (Comprador)" />}
          />
          <Route path="/proveedor" element={<PlaceholderPage titulo="Dashboard Proveedor" />} />
          <Route
            path="/proveedor/pedidos"
            element={<PlaceholderPage titulo="Pedidos Disponibles" />}
          />
          <Route
            path="/proveedor/cotizaciones"
            element={<PlaceholderPage titulo="Mis Cotizaciones (Proveedor)" />}
          />
          <Route
            path="/proveedor/ordenes"
            element={<PlaceholderPage titulo="Mis Órdenes (Proveedor)" />}
          />
          <Route
            path="/proveedor/chat"
            element={<PlaceholderPage titulo="Chat (Proveedor)" />}
          />
          <Route path="*" element={<Navigate to="/comprador" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
