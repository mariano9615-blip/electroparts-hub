import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { useAuthStore } from '../store/useAuthStore';
import { usePedidosStore } from '../store/usePedidosStore';
import { useCotizacionesStore } from '../store/useCotizacionesStore';
import { useOrdenesStore } from '../store/useOrdenesStore';
import { useNotificacionesStore } from '../store/useNotificacionesStore';

import Login from '../pages/Login';

import DashboardComprador from '../pages/comprador/DashboardComprador';
import PublicarPedido from '../pages/comprador/PublicarPedido';
import MisCotizacionesComprador from '../pages/comprador/MisCotizacionesComprador';
import MisOrdenesComprador from '../pages/comprador/MisOrdenesComprador';
import ChatComprador from '../pages/comprador/ChatComprador';
import DetallePedidoComprador from '../pages/comprador/DetallePedidoComprador';
import ListaPedidosComprador from '../pages/comprador/ListaPedidosComprador';

import DashboardProveedor from '../pages/proveedor/DashboardProveedor';
import PedidosDisponibles from '../pages/proveedor/PedidosDisponibles';
import MisCotizacionesProveedor from '../pages/proveedor/MisCotizacionesProveedor';
import MisOrdenesProveedor from '../pages/proveedor/MisOrdenesProveedor';
import ChatProveedor from '../pages/proveedor/ChatProveedor';

function RutaProtegida({ children }: { children: React.ReactNode }) {
  const autenticado = useAuthStore((s) => s.autenticado);
  if (!autenticado) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function LayoutProtegido() {
  const autenticado = useAuthStore((s) => s.autenticado);
  if (!autenticado) return <Navigate to="/login" replace />;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function RutaLogin() {
  const autenticado = useAuthStore((s) => s.autenticado);
  if (autenticado) return <Navigate to="/comprador" replace />;
  return <Login />;
}

export function AppRouter() {
  useEffect(() => {
    usePedidosStore.getState().cargarDatos();
    useCotizacionesStore.getState().cargarDatos();
    useOrdenesStore.getState().cargarDatos();
    useNotificacionesStore.getState().cargarDatos();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<RutaLogin />} />

        <Route element={<LayoutProtegido />}>
          <Route path="/" element={<Navigate to="/comprador" replace />} />

          <Route path="/comprador" element={<DashboardComprador />} />
          <Route path="/comprador/publicar" element={<PublicarPedido />} />
          <Route path="/comprador/cotizaciones" element={<MisCotizacionesComprador />} />
          <Route path="/comprador/ordenes" element={<MisOrdenesComprador />} />
          <Route path="/comprador/chat" element={<ChatComprador />} />
          <Route path="/comprador/pedidos" element={<ListaPedidosComprador />} />
          <Route path="/comprador/pedidos/:id" element={<DetallePedidoComprador />} />

          <Route path="/proveedor" element={<DashboardProveedor />} />
          <Route path="/proveedor/pedidos" element={<PedidosDisponibles />} />
          <Route path="/proveedor/cotizaciones" element={<MisCotizacionesProveedor />} />
          <Route path="/proveedor/ordenes" element={<MisOrdenesProveedor />} />
          <Route path="/proveedor/chat" element={<ChatProveedor />} />
        </Route>

        <Route
          path="*"
          element={
            <RutaProtegida>
              <Navigate to="/comprador" replace />
            </RutaProtegida>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
