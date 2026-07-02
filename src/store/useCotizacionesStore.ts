import { create } from 'zustand';
import type { Cotizacion, Orden } from '../types';
import { COMPRADOR_ID } from '../utils/constants';
import { useOrdenesStore } from './useOrdenesStore';
import { usePedidosStore } from './usePedidosStore';
import { useNotificacionesStore } from './useNotificacionesStore';
import * as api from '../services/api';

interface CotizacionesState {
  cotizaciones: Cotizacion[];
  cargarDatos: () => void;
  agregarCotizacion: (cotizacion: Cotizacion) => void;
  aceptarCotizacion: (cotizacionId: string) => void;
  rechazarCotizacion: (cotizacionId: string) => void;
  iniciarNegociacionCotizacion: (cotizacionId: string) => void;
  cancelarNegociacionCotizacion: (cotizacionId: string) => void;
  eliminarCotizacion: (id: string) => void;
  eliminarCotizacionesByPedidoId: (pedidoId: string) => void;
  actualizarCalificacionProveedor: (cotizacionId: string, promedio: number) => Promise<void>;
}

export const useCotizacionesStore = create<CotizacionesState>((set, get) => ({
  cotizaciones: [],

  cargarDatos: () => {
    api.getCotizaciones().then((cotizaciones) => set({ cotizaciones }));
  },

  agregarCotizacion: (cotizacion) => {
    api.createCotizacion(cotizacion).then((created) => {
      if (!created) return;
      set((state) => ({ cotizaciones: [...state.cotizaciones, cotizacion] }));
      useNotificacionesStore.getState().agregarNotificacion({
        tipo: 'nueva_cotizacion',
        rolDestino: 'comprador',
        titulo: 'Nueva cotización recibida',
        mensaje: `${cotizacion.proveedorNombre} cotizó $${cotizacion.precio} para tu pedido`,
      });
    }).catch((e) => console.error('agregarCotizacion:', e));
  },

  aceptarCotizacion: (cotizacionId) => {
    const todas = get().cotizaciones;
    const cotizacion = todas.find((c) => c.id === cotizacionId);
    if (!cotizacion) return;

    const orden: Orden = {
      id: crypto.randomUUID(),
      pedidoId: cotizacion.pedidoId,
      cotizacionId: cotizacion.id,
      compradorId: COMPRADOR_ID,
      proveedorId: cotizacion.proveedorId,
      proveedorNombre: cotizacion.proveedorNombre,
      monto: cotizacion.precio,
      estado: 'confirmada',
      fechaConfirmacion: new Date().toISOString(),
      chatHabilitado: true,
      estadoPago: 'pendiente',
      calificado: false,
    };

    (async () => {
      // 1. Marcar cotizacion seleccionada como aceptada
      const ok = await api.updateCotizacion(cotizacionId, { estado: 'aceptada' });
      if (!ok) return;

      // 2. Rechazar el resto de cotizaciones del mismo pedido via API
      const otrasDelPedido = todas.filter(
        (c) => c.pedidoId === cotizacion.pedidoId && c.id !== cotizacionId,
      );
      await Promise.all(
        otrasDelPedido.map((c) => api.updateCotizacion(c.id, { estado: 'rechazada' })),
      );

      // 3. Actualizar estado local de cotizaciones
      set({
        cotizaciones: todas.map((c) => {
          if (c.id === cotizacionId) return { ...c, estado: 'aceptada' as const };
          if (c.pedidoId === cotizacion.pedidoId) return { ...c, estado: 'rechazada' as const };
          return c;
        }),
      });

      // 4. Delegar a los otros stores (cada uno llama su propia API)
      useOrdenesStore.getState().agregarOrden(orden);
      usePedidosStore.getState().actualizarEstadoPedido(cotizacion.pedidoId, 'adjudicado');

      // 5. Notificaciones
      useNotificacionesStore.getState().agregarNotificacion({
        tipo: 'orden_confirmada',
        rolDestino: 'comprador',
        titulo: 'Orden confirmada',
        mensaje: `Tu orden con ${cotizacion.proveedorNombre} ha sido confirmada`,
        entidadId: orden.id,
      });
      useNotificacionesStore.getState().agregarNotificacion({
        tipo: 'cotizacion_aceptada',
        rolDestino: 'proveedor',
        titulo: 'Cotización aceptada',
        mensaje: `Tu cotización fue aceptada. Prepará el envío`,
        entidadId: cotizacion.id,
      });
    })();
  },

  rechazarCotizacion: (cotizacionId) => {
    api.updateCotizacion(cotizacionId, { estado: 'rechazada' }).then((updated) => {
      if (!updated) return;
      set((state) => ({
        cotizaciones: state.cotizaciones.map((c) =>
          c.id === cotizacionId ? { ...c, estado: 'rechazada' as const } : c,
        ),
      }));
    }).catch((e) => console.error('rechazarCotizacion:', e));
  },

  iniciarNegociacionCotizacion: (cotizacionId) => {
    api.updateCotizacion(cotizacionId, { estado: 'en_negociacion' }).then((updated) => {
      if (!updated) return;
      set((state) => ({
        cotizaciones: state.cotizaciones.map((c) =>
          c.id === cotizacionId ? { ...c, estado: 'en_negociacion' as const } : c,
        ),
      }));
    }).catch((e) => console.error('iniciarNegociacionCotizacion:', e));
  },

  cancelarNegociacionCotizacion: (cotizacionId) => {
    api.updateCotizacion(cotizacionId, { estado: 'pendiente' }).then((updated) => {
      if (!updated) return;
      set((state) => ({
        cotizaciones: state.cotizaciones.map((c) =>
          c.id === cotizacionId ? { ...c, estado: 'pendiente' as const } : c,
        ),
      }));
    }).catch((e) => console.error('cancelarNegociacionCotizacion:', e));
  },

  eliminarCotizacion: (id) => {
    api.deleteCotizacion(id).then((ok) => {
      if (!ok) return;
      set((state) => ({ cotizaciones: state.cotizaciones.filter((c) => c.id !== id) }));
    }).catch((e) => console.error('eliminarCotizacion:', e));
  },

  eliminarCotizacionesByPedidoId: (pedidoId) => {
    const aEliminar = get().cotizaciones.filter((c) => c.pedidoId === pedidoId);
    Promise.all(aEliminar.map((c) => api.deleteCotizacion(c.id)))
      .then(() => {
        set((state) => ({
          cotizaciones: state.cotizaciones.filter((c) => c.pedidoId !== pedidoId),
        }));
      })
      .catch((e) => console.error('eliminarCotizacionesByPedidoId:', e));
  },

  actualizarCalificacionProveedor: async (cotizacionId, promedio) => {
    await api.updateCotizacion(cotizacionId, { calificacionProveedor: promedio });
    set((state) => ({
      cotizaciones: state.cotizaciones.map((c) =>
        c.id === cotizacionId ? { ...c, calificacionProveedor: promedio } : c,
      ),
    }));
  },
}));
