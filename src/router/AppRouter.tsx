import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { useAuthStore } from '../store/useAuthStore';
import { usePedidosStore } from '../store/usePedidosStore';
import { useCotizacionesStore } from '../store/useCotizacionesStore';
import { useOrdenesStore } from '../store/useOrdenesStore';
import { useNotificacionesStore } from '../store/useNotificacionesStore';
import { useMensajesStore } from '../store/useMensajesStore';
import { PROV_IDS } from '../utils/constants';
import type { RolUsuario } from '../types';

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

import DashboardAdmin from '../pages/admin/DashboardAdmin';
import AdminPedidos from '../pages/admin/AdminPedidos';
import AdminOrdenes from '../pages/admin/AdminOrdenes';
import AdminDisputas from '../pages/admin/AdminDisputas';
import AdminUsuarios from '../pages/admin/AdminUsuarios';

function RedirigirSegunRol() {
  const autenticado = useAuthStore((s) => s.autenticado);
  const rol = useAuthStore((s) => s.rol);
  if (!autenticado || !rol) return <Navigate to="/login" replace />;
  return <Navigate to={`/${rol}`} replace />;
}

function LayoutPorRol({ rolRequerido }: { rolRequerido: RolUsuario }) {
  const autenticado = useAuthStore((s) => s.autenticado);
  const rol = useAuthStore((s) => s.rol);
  if (!autenticado || !rol) return <Navigate to="/login" replace />;
  if (rol !== rolRequerido) return <Navigate to={`/${rol}`} replace />;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function RutaLogin() {
  const autenticado = useAuthStore((s) => s.autenticado);
  const rol = useAuthStore((s) => s.rol);
  if (autenticado && rol) return <Navigate to={`/${rol}`} replace />;
  return <Login />;
}

export function AppRouter() {
  // ── Snapshots para detección de cambios entre polls ──────────────────────────
  const pedidosConocidosRef = useRef<Set<string> | null>(null);
  const pedidosEstadoRef = useRef<Map<string, string> | null>(null);
  const cotizacionesEstadoRef = useRef<Map<string, string> | null>(null);
  const ordenesEstadoRef = useRef<Map<string, { estado: string; estadoPago: string }> | null>(null);

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

      const rol = useAuthStore.getState().rol;

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
          const rolActual = useAuthStore.getState().rol;
          const titulo =
            p.estado === 'adjudicado' && rolActual === 'comprador'
              ? `Compra confirmada para ${p.titulo}`
              : `Pedido: ${p.estado.replace('_', ' ')}`;
          window.dispatchEvent(
            new CustomEvent('estado-pedido-toast', {
              detail: {
                id: `${p.id}-estado-${p.estado}`,
                titulo,
                subtitulo: p.estado === 'adjudicado' && rolActual === 'comprador' ? '' : p.titulo,
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

      const rol = useAuthStore.getState().rol;

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
            const pedidoNombre =
              usePedidosStore.getState().pedidos.find((p) => p.id === c.pedidoId)?.titulo ?? '';
            window.dispatchEvent(
              new CustomEvent('cotizacion-adjudicada-toast', {
                detail: {
                  id: c.id,
                  titulo: '¡Ganaste la venta!',
                  subtitulo: pedidoNombre,
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

    // ── Suscripción a cambios en órdenes ─────────────────────────────────────
    const desubOrdenes = useOrdenesStore.subscribe((state) => {
      if (ordenesEstadoRef.current === null) {
        ordenesEstadoRef.current = new Map(
          state.ordenes.map((o) => [o.id, { estado: o.estado, estadoPago: o.estadoPago ?? 'pendiente' }]),
        );
        return;
      }

      const rol = useAuthStore.getState().rol;

      state.ordenes.forEach((o) => {
        const anterior = ordenesEstadoRef.current!.get(o.id);
        if (!anterior) return;

        const estadoPagoActual = o.estadoPago ?? 'pendiente';

        if (anterior.estado !== o.estado) {
          const pedidoNombre =
            usePedidosStore.getState().pedidos.find((p) => p.id === o.pedidoId)?.titulo ?? '';

          if (rol === 'comprador') {
            const toasts: Record<string, string> = {
              en_preparacion: `Tu pedido${pedidoNombre ? ` "${pedidoNombre}"` : ''} está siendo preparado`,
              enviado: `Tu pedido${pedidoNombre ? ` "${pedidoNombre}"` : ''} fue despachado`,
              cerrado: `Orden${pedidoNombre ? ` "${pedidoNombre}"` : ''} completada`,
              disputada: `Disputa abierta en orden${pedidoNombre ? ` "${pedidoNombre}"` : ''}`,
            };
            const titulo = toasts[o.estado];
            if (titulo) {
              window.dispatchEvent(
                new CustomEvent('orden-estado-toast', {
                  detail: { id: `${o.id}-${o.estado}`, titulo, subtitulo: '' },
                }),
              );
            }
          } else if (rol === 'proveedor') {
            const toasts: Record<string, string> = {
              entregado: `El comprador confirmó la recepción`,
              cerrado: `Orden completada`,
            };
            const titulo = toasts[o.estado];
            if (titulo) {
              const subtitulo = pedidoNombre ? `Pedido: ${pedidoNombre}` : '';
              window.dispatchEvent(
                new CustomEvent('orden-estado-toast', {
                  detail: { id: `${o.id}-${o.estado}`, titulo, subtitulo },
                }),
              );
            }
          }
        }

        if (anterior.estadoPago !== estadoPagoActual && estadoPagoActual === 'confirmado') {
          const pedidoNombre =
            usePedidosStore.getState().pedidos.find((p) => p.id === o.pedidoId)?.titulo ?? '';
          if (rol === 'comprador') {
            window.dispatchEvent(
              new CustomEvent('orden-estado-toast', {
                detail: {
                  id: `${o.id}-pago-confirmado`,
                  titulo: 'Pago confirmado',
                  subtitulo: pedidoNombre ? `Pedido: ${pedidoNombre}` : '',
                },
              }),
            );
          }
        }
      });

      ordenesEstadoRef.current = new Map(
        state.ordenes.map((o) => [o.id, { estado: o.estado, estadoPago: o.estadoPago ?? 'pendiente' }]),
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

    // Carga inicial siempre corre, sin importar el rol (el admin también necesita sus datos).
    cargarTodo();
    // El polling recurrente de 5s no corre para admin: solo comprador y proveedor operan en tiempo real.
    const intervalo = setInterval(() => {
      if (useAuthStore.getState().rol === 'admin') return;
      cargarTodo();
    }, 5000);

    return () => {
      clearInterval(intervalo);
      desubPedidos();
      desubCotizaciones();
      desubOrdenes();
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<RutaLogin />} />
        <Route path="/" element={<RedirigirSegunRol />} />

        <Route element={<LayoutPorRol rolRequerido="comprador" />}>
          <Route path="/comprador" element={<DashboardComprador />} />
          <Route path="/comprador/publicar" element={<PublicarPedido />} />
          <Route path="/comprador/pedidos" element={<ListaPedidosComprador />} />
          <Route path="/comprador/pedidos/:id" element={<DetallePedidoComprador />} />
          {/* Rutas nuevas */}
          <Route path="/comprador/cotizaciones-recibidas" element={<MisCotizacionesComprador />} />
          <Route path="/comprador/mis-compras" element={<MisOrdenesComprador />} />
          {/* Redirects desde rutas viejas */}
          <Route path="/comprador/cotizaciones" element={<Navigate to="/comprador/cotizaciones-recibidas" replace />} />
          <Route path="/comprador/ordenes" element={<Navigate to="/comprador/mis-compras" replace />} />
        </Route>

        <Route element={<LayoutPorRol rolRequerido="proveedor" />}>
          <Route path="/proveedor" element={<DashboardProveedor />} />
          <Route path="/proveedor/explorar" element={<PedidosDisponibles />} />
          <Route path="/proveedor/pedidos/:id" element={<DetallePedidoProveedor />} />
          <Route path="/proveedor/cotizaciones" element={<MisCotizacionesProveedor />} />
          <Route path="/proveedor/mis-ventas" element={<MisOrdenesProveedor />} />
          {/* Redirects desde rutas viejas */}
          <Route path="/proveedor/pedidos" element={<Navigate to="/proveedor/explorar" replace />} />
          <Route path="/proveedor/ordenes" element={<Navigate to="/proveedor/mis-ventas" replace />} />
        </Route>

        <Route element={<LayoutPorRol rolRequerido="admin" />}>
          <Route path="/admin" element={<DashboardAdmin />} />
          <Route path="/admin/pedidos" element={<AdminPedidos />} />
          <Route path="/admin/ordenes" element={<AdminOrdenes />} />
          <Route path="/admin/disputas" element={<AdminDisputas />} />
          <Route path="/admin/usuarios" element={<AdminUsuarios />} />
        </Route>

        <Route path="*" element={<RedirigirSegunRol />} />
      </Routes>
    </BrowserRouter>
  );
}
