import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { useAuthStore } from '../store/useAuthStore';
import { usePedidosStore } from '../store/usePedidosStore';
import { useCotizacionesStore } from '../store/useCotizacionesStore';
import { useOrdenesStore } from '../store/useOrdenesStore';
import { useNotificacionesStore } from '../store/useNotificacionesStore';
import { useMensajesStore } from '../store/useMensajesStore';
import { useRolStore } from '../store/useRolStore';
import { PROV_IDS } from '../utils/constants';

import Login from '../pages/Login';

import DashboardComprador from '../pages/comprador/DashboardComprador';
import PublicarPedido from '../pages/comprador/PublicarPedido';
import MisCotizacionesComprador from '../pages/comprador/MisCotizacionesComprador';
import MisOrdenesComprador from '../pages/comprador/MisOrdenesComprador';
import DetallePedidoComprador from '../pages/comprador/DetallePedidoComprador';
import ListaPedidosComprador from '../pages/comprador/ListaPedidosComprador';

import DashboardProveedor from '../pages/proveedor/DashboardProveedor';
import PedidosDisponibles from '../pages/proveedor/PedidosDisponibles';
import MisCotizacionesProveedor from '../pages/proveedor/MisCotizacionesProveedor';
import MisOrdenesProveedor from '../pages/proveedor/MisOrdenesProveedor';
import DetallePedidoProveedor from '../pages/proveedor/DetallePedidoProveedor';

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
  // ── Snapshots para detección de cambios entre polls ──────────────────────────
  const pedidosConocidosRef = useRef<Set<string> | null>(null);
  const pedidosEstadoRef = useRef<Map<string, string> | null>(null);
  const cotizacionesEstadoRef = useRef<Map<string, string> | null>(null);

  useEffect(() => {
    // ── Suscripción a cambios en pedidos ─────────────────────────────────────
    const desubPedidos = usePedidosStore.subscribe((state, prevState) => {
      // Primera inicialización: guardar baseline sin disparar toasts
      if (pedidosConocidosRef.current === null) {
        pedidosConocidosRef.current = new Set(prevState.pedidos.map((p) => p.id));
      }
      if (pedidosEstadoRef.current === null) {
        pedidosEstadoRef.current = new Map(state.pedidos.map((p) => [p.id, p.estado]));
      }

      const rol = useRolStore.getState().rol;

      // Detectar pedidos nuevos (toast para proveedor)
      if (rol === 'proveedor') {
        const nuevosPedidos = state.pedidos.filter(
          (p) => !pedidosConocidosRef.current!.has(p.id),
        );
        nuevosPedidos.forEach((pedido) => {
          window.dispatchEvent(
            new CustomEvent('nuevo-pedido-toast', {
              detail: {
                id: pedido.id,
                titulo: `Nuevo pedido: ${pedido.titulo}`,
                subtitulo: pedido.categoria,
                navegarA: `/proveedor/pedidos/${pedido.id}`,
              },
            }),
          );
        });
      }

      pedidosConocidosRef.current = new Set(state.pedidos.map((p) => p.id));

      // Detectar cambios de estado en pedidos
      state.pedidos.forEach((p) => {
        const estadoAnterior = pedidosEstadoRef.current!.get(p.id);
        if (estadoAnterior && estadoAnterior !== p.estado) {
          window.dispatchEvent(
            new CustomEvent('estado-pedido-toast', {
              detail: {
                id: `${p.id}-estado-${p.estado}`,
                titulo: `Pedido: ${p.estado.replace('_', ' ')}`,
                subtitulo: p.titulo,
              },
            }),
          );
        }
      });

      pedidosEstadoRef.current = new Map(state.pedidos.map((p) => [p.id, p.estado]));
    });

    // ── Suscripción a cambios en cotizaciones ─────────────────────────────────
    const desubCotizaciones = useCotizacionesStore.subscribe((state) => {
      if (cotizacionesEstadoRef.current === null) {
        cotizacionesEstadoRef.current = new Map(
          state.cotizaciones.map((c) => [c.id, c.estado]),
        );
        return;
      }

      const rol = useRolStore.getState().rol;

      state.cotizaciones.forEach((c) => {
        const estadoAnterior = cotizacionesEstadoRef.current!.get(c.id);

        if (!estadoAnterior) {
          // Cotización nueva: avisar al comprador
          if (rol === 'comprador') {
            window.dispatchEvent(
              new CustomEvent('nueva-cotizacion-toast', {
                detail: {
                  id: c.id,
                  titulo: 'Nueva cotización recibida',
                  subtitulo: `${c.proveedorNombre} — $${c.precio.toLocaleString('es-AR')}`,
                  navegarA: `/comprador/pedidos/${c.pedidoId}`,
                },
              }),
            );
          }
          return;
        }

        if (estadoAnterior === c.estado) return;

        // Cambio de estado detectado: solo avisar al proveedor si la cotizacion le pertenece
        if (rol === 'proveedor' && (PROV_IDS as readonly string[]).includes(c.proveedorId)) {
          if (c.estado === 'aceptada') {
            window.dispatchEvent(
              new CustomEvent('cotizacion-adjudicada-toast', {
                detail: {
                  id: c.id,
                  titulo: '¡Tu cotización fue adjudicada!',
                  subtitulo: c.proveedorNombre,
                  navegarA: `/proveedor/pedidos/${c.pedidoId}`,
                },
              }),
            );
          } else if (c.estado === 'rechazada') {
            window.dispatchEvent(
              new CustomEvent('cotizacion-rechazada-toast', {
                detail: {
                  id: c.id,
                  titulo: 'Cotización no seleccionada',
                  subtitulo: 'Tu cotización fue rechazada',
                },
              }),
            );
          } else if (c.estado === 'en_negociacion') {
            window.dispatchEvent(
              new CustomEvent('cotizacion-negociacion-toast', {
                detail: {
                  id: c.id,
                  titulo: 'El comprador quiere negociar',
                  subtitulo: 'Tu cotización está siendo evaluada',
                  navegarA: `/proveedor/pedidos/${c.pedidoId}`,
                },
              }),
            );
          }
        }
      });

      cotizacionesEstadoRef.current = new Map(
        state.cotizaciones.map((c) => [c.id, c.estado]),
      );
    });

    const cargarTodo = () => {
      usePedidosStore.getState().cargarDatos();
      useCotizacionesStore.getState().cargarDatos();
      useOrdenesStore.getState().cargarDatos();
      useNotificacionesStore.getState().cargarDatos();
      // Agrupa TODOS los mensajes por pedidoId — detecta mensajes nuevos en cualquier
      // pedido (no solo el que está abierto) para poder mostrar toasts y badges en el menú de chats.
      useMensajesStore.getState().cargarTodosLosMensajes();
    };

    cargarTodo();
    const intervalo = setInterval(cargarTodo, 5000);

    return () => {
      clearInterval(intervalo);
      desubPedidos();
      desubCotizaciones();
    };
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
          <Route path="/comprador/pedidos" element={<ListaPedidosComprador />} />
          <Route path="/comprador/pedidos/:id" element={<DetallePedidoComprador />} />

          <Route path="/proveedor" element={<DashboardProveedor />} />
          <Route path="/proveedor/pedidos" element={<PedidosDisponibles />} />
          <Route path="/proveedor/pedidos/:id" element={<DetallePedidoProveedor />} />
          <Route path="/proveedor/cotizaciones" element={<MisCotizacionesProveedor />} />
          <Route path="/proveedor/ordenes" element={<MisOrdenesProveedor />} />
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
