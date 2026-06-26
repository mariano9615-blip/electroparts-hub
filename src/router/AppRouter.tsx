import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';

import DashboardComprador from '../pages/comprador/DashboardComprador';
import PublicarPedido from '../pages/comprador/PublicarPedido';
import MisCotizacionesComprador from '../pages/comprador/MisCotizacionesComprador';
import MisOrdenesComprador from '../pages/comprador/MisOrdenesComprador';
import ChatComprador from '../pages/comprador/ChatComprador';

import DashboardProveedor from '../pages/proveedor/DashboardProveedor';
import PedidosDisponibles from '../pages/proveedor/PedidosDisponibles';
import MisCotizacionesProveedor from '../pages/proveedor/MisCotizacionesProveedor';
import MisOrdenesProveedor from '../pages/proveedor/MisOrdenesProveedor';
import ChatProveedor from '../pages/proveedor/ChatProveedor';

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/comprador" replace />} />

          <Route path="/comprador" element={<DashboardComprador />} />
          <Route path="/comprador/publicar" element={<PublicarPedido />} />
          <Route path="/comprador/cotizaciones" element={<MisCotizacionesComprador />} />
          <Route path="/comprador/ordenes" element={<MisOrdenesComprador />} />
          <Route path="/comprador/chat" element={<ChatComprador />} />

          <Route path="/proveedor" element={<DashboardProveedor />} />
          <Route path="/proveedor/pedidos" element={<PedidosDisponibles />} />
          <Route path="/proveedor/cotizaciones" element={<MisCotizacionesProveedor />} />
          <Route path="/proveedor/ordenes" element={<MisOrdenesProveedor />} />
          <Route path="/proveedor/chat" element={<ChatProveedor />} />

          <Route path="*" element={<Navigate to="/comprador" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
