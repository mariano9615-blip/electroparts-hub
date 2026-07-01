import { create } from 'zustand';
import type { Orden, EstadoOrden, EstadoPago } from '../types';
import * as api from '../services/api';
import { useNotificacionesStore } from './useNotificacionesStore';

interface OrdenesState {
  ordenes: Orden[];
  cargarDatos: () => void;
  agregarOrden: (orden: Orden) => void;
  actualizarEstadoOrden: (id: string, estado: EstadoOrden) => void;
  marcarEnPreparacion: (ordenId: string) => Promise<void>;
  marcarEnviado: (ordenId: string, numeroSeguimiento?: string) => Promise<void>;
  confirmarEntrega: (ordenId: string) => Promise<void>;
  confirmarPago: (ordenId: string, comprobantePago?: string) => Promise<void>;
  abrirDisputa: (ordenId: string, observacion: string) => Promise<void>;
  cerrarOrden: (ordenId: string) => Promise<void>;
}

function getOrden(ordenes: Orden[], id: string): Orden | undefined {
  return ordenes.find((o) => o.id === id);
}

export const useOrdenesStore = create<OrdenesState>((set, get) => ({
  ordenes: [],

  cargarDatos: () => {
    api.getOrdenes().then((ordenes) => set({ ordenes: ordenes as Orden[] }));
  },

  agregarOrden: (orden) => {
    api.createOrden(orden).then((created) => {
      if (!created) return;
      set((state) => ({ ordenes: [...state.ordenes, orden] }));
    }).catch((e) => console.error('agregarOrden:', e));
  },

  actualizarEstadoOrden: (id, estado) => {
    api.updateOrden(id, { estado }).then((updated) => {
      if (!updated) return;
      set((state) => ({
        ordenes: state.ordenes.map((o) => (o.id === id ? { ...o, estado } : o)),
      }));
    }).catch((e) => console.error('actualizarEstadoOrden:', e));
  },

  marcarEnPreparacion: async (ordenId) => {
    const orden = getOrden(get().ordenes, ordenId);
    if (!orden) return;
    const patch = { estado: 'en_preparacion' as EstadoOrden };
    await api.updateOrden(ordenId, patch);
    set((state) => ({
      ordenes: state.ordenes.map((o) => (o.id === ordenId ? { ...o, ...patch } : o)),
    }));
    useNotificacionesStore.getState().agregarNotificacion({
      tipo: 'orden_en_preparacion',
      rolDestino: 'comprador',
      titulo: 'Pedido en preparación',
      mensaje: `Tu pedido está siendo preparado por ${orden.proveedorNombre}`,
      entidadId: ordenId,
    });
  },

  marcarEnviado: async (ordenId, numeroSeguimiento) => {
    const orden = getOrden(get().ordenes, ordenId);
    if (!orden) return;
    const patch: Partial<Orden> = {
      estado: 'enviado',
      fechaEnvio: new Date().toISOString(),
      ...(numeroSeguimiento ? { numeroSeguimiento } : {}),
    };
    await api.updateOrden(ordenId, patch);
    set((state) => ({
      ordenes: state.ordenes.map((o) => (o.id === ordenId ? { ...o, ...patch } : o)),
    }));
    useNotificacionesStore.getState().agregarNotificacion({
      tipo: 'orden_enviada',
      rolDestino: 'comprador',
      titulo: 'Pedido despachado',
      mensaje: `Tu pedido fue enviado por ${orden.proveedorNombre}`,
      entidadId: ordenId,
    });
  },

  confirmarEntrega: async (ordenId) => {
    const orden = getOrden(get().ordenes, ordenId);
    if (!orden) return;
    const patch: Partial<Orden> = {
      estado: 'entregado',
      fechaEntrega: new Date().toISOString(),
    };
    await api.updateOrden(ordenId, patch);
    set((state) => ({
      ordenes: state.ordenes.map((o) => (o.id === ordenId ? { ...o, ...patch } : o)),
    }));
    useNotificacionesStore.getState().agregarNotificacion({
      tipo: 'orden_entregada',
      rolDestino: 'proveedor',
      titulo: 'Entrega confirmada',
      mensaje: `El comprador confirmó la recepción del pedido`,
      entidadId: ordenId,
    });
    // Si el pago ya estaba confirmado, cerrar automáticamente
    const actualizada = { ...orden, ...patch };
    if (actualizada.estadoPago === 'confirmado') {
      await get().cerrarOrden(ordenId);
    }
  },

  confirmarPago: async (ordenId, comprobantePago) => {
    const orden = getOrden(get().ordenes, ordenId);
    if (!orden) return;
    const patch: Partial<Orden> = {
      estadoPago: 'confirmado' as EstadoPago,
      fechaPagoConfirmado: new Date().toISOString(),
      ...(comprobantePago ? { comprobantePago } : {}),
    };
    await api.updateOrden(ordenId, patch);
    set((state) => ({
      ordenes: state.ordenes.map((o) => (o.id === ordenId ? { ...o, ...patch } : o)),
    }));
    useNotificacionesStore.getState().agregarNotificacion({
      tipo: 'orden_pago_confirmado',
      rolDestino: 'comprador',
      titulo: 'Pago confirmado',
      mensaje: `${orden.proveedorNombre} confirmó la recepción del pago`,
      entidadId: ordenId,
    });
    // Si la entrega ya estaba confirmada, cerrar automáticamente
    if (orden.estado === 'entregado') {
      await get().cerrarOrden(ordenId);
    }
  },

  abrirDisputa: async (ordenId, observacion) => {
    const orden = getOrden(get().ordenes, ordenId);
    if (!orden) return;
    const patch: Partial<Orden> = {
      estado: 'disputada',
      observacionDisputa: observacion,
    };
    await api.updateOrden(ordenId, patch);
    set((state) => ({
      ordenes: state.ordenes.map((o) => (o.id === ordenId ? { ...o, ...patch } : o)),
    }));
    useNotificacionesStore.getState().agregarNotificacion({
      tipo: 'orden_disputada',
      rolDestino: 'proveedor',
      titulo: 'Disputa abierta',
      mensaje: `El comprador abrió una disputa en una orden`,
      entidadId: ordenId,
    });
  },

  cerrarOrden: async (ordenId) => {
    const patch = { estado: 'cerrado' as EstadoOrden };
    await api.updateOrden(ordenId, patch);
    set((state) => ({
      ordenes: state.ordenes.map((o) => (o.id === ordenId ? { ...o, ...patch } : o)),
    }));
    useNotificacionesStore.getState().agregarNotificacion({
      tipo: 'orden_cerrada',
      rolDestino: 'comprador',
      titulo: 'Orden cerrada',
      mensaje: `La orden fue completada exitosamente`,
      entidadId: ordenId,
    });
    useNotificacionesStore.getState().agregarNotificacion({
      tipo: 'orden_cerrada',
      rolDestino: 'proveedor',
      titulo: 'Orden cerrada',
      mensaje: `La orden fue completada exitosamente`,
      entidadId: ordenId,
    });
  },
}));
