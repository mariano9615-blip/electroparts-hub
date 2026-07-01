import { create } from 'zustand';
import type { Pedido, EstadoPedido } from '../types';
import { useNotificacionesStore } from './useNotificacionesStore';
import { useCotizacionesStore } from './useCotizacionesStore';
import * as api from '../services/api';

interface PedidosState {
  pedidos: Pedido[];
  cargarDatos: () => void;
  agregarPedido: (pedido: Pedido) => void;
  actualizarEstadoPedido: (id: string, estado: EstadoPedido) => void;
  incrementarCotizaciones: (pedidoId: string) => void;
  eliminarPedido: (id: string) => void;
  iniciarNegociacion: (pedidoId: string, cotizacionId: string) => void;
  cancelarNegociacion: (pedidoId: string) => void;
  cancelarPedido: (id: string, observacion: string) => void;
}

export const usePedidosStore = create<PedidosState>((set, get) => ({
  pedidos: [],

  cargarDatos: () => {
    api.getPedidos().then((pedidos) => set({ pedidos }));
  },

  agregarPedido: (pedido) => {
    api.createPedido(pedido).then((created) => {
      if (!created) return;
      set((state) => ({ pedidos: [...state.pedidos, pedido] }));
      useNotificacionesStore.getState().agregarNotificacion({
        tipo: 'nueva_orden',
        rolDestino: 'proveedor',
        titulo: 'Nuevo pedido disponible',
        mensaje: pedido.titulo,
        entidadId: pedido.id,
      });
    }).catch((e) => console.error('agregarPedido:', e));
  },

  actualizarEstadoPedido: (id, estado) => {
    api.updatePedido(id, { estado }).then((updated) => {
      if (!updated) return;
      set((state) => ({
        pedidos: state.pedidos.map((p) => (p.id === id ? { ...p, estado } : p)),
      }));
    }).catch((e) => console.error('actualizarEstadoPedido:', e));
  },

  eliminarPedido: (id) => {
    api.deletePedido(id).then((ok) => {
      if (!ok) return;
      useCotizacionesStore.getState().eliminarCotizacionesByPedidoId(id);
      set((state) => ({ pedidos: state.pedidos.filter((p) => p.id !== id) }));
    }).catch((e) => console.error('eliminarPedido:', e));
  },

  iniciarNegociacion: (pedidoId, cotizacionId) => {
    const data: Partial<Pedido> = {
      estado: 'en_negociacion',
      cotizacionEnNegociacionId: cotizacionId,
    };
    api.updatePedido(pedidoId, data).then((updated) => {
      if (!updated) return;
      set((state) => ({
        pedidos: state.pedidos.map((p) =>
          p.id === pedidoId ? { ...p, ...data } : p,
        ),
      }));
    }).catch((e) => console.error('iniciarNegociacion:', e));
  },

  cancelarNegociacion: (pedidoId) => {
    api.updatePedido(pedidoId, { estado: 'abierto', cotizacionEnNegociacionId: undefined }).then((updated) => {
      if (!updated) return;
      set((state) => ({
        pedidos: state.pedidos.map((p) =>
          p.id === pedidoId
            ? { ...p, estado: 'abierto', cotizacionEnNegociacionId: undefined }
            : p,
        ),
      }));
    }).catch((e) => console.error('cancelarNegociacion:', e));
  },

  cancelarPedido: (id, observacion) => {
    const data: Partial<Pedido> = {
      estado: 'cancelado',
      observacionBaja: observacion,
      fechaBaja: new Date().toISOString(),
    };
    api.updatePedido(id, data).then((updated) => {
      if (!updated) return;
      set((state) => ({
        pedidos: state.pedidos.map((p) => (p.id === id ? { ...p, ...data } : p)),
      }));
    }).catch((e) => console.error('cancelarPedido:', e));
  },

  incrementarCotizaciones: (pedidoId) => {
    const pedido = get().pedidos.find((p) => p.id === pedidoId);
    if (!pedido) return;
    const nuevasCotizaciones = pedido.cotizacionesRecibidas + 1;
    const nuevoEstado: EstadoPedido =
      pedido.cotizacionesRecibidas === 0 ? 'en_cotizacion' : pedido.estado;
    api
      .updatePedido(pedidoId, { cotizacionesRecibidas: nuevasCotizaciones, estado: nuevoEstado })
      .then((updated) => {
        if (!updated) return;
        set((state) => ({
          pedidos: state.pedidos.map((p) =>
            p.id !== pedidoId
              ? p
              : { ...p, cotizacionesRecibidas: nuevasCotizaciones, estado: nuevoEstado },
          ),
        }));
      })
      .catch((e) => console.error('incrementarCotizaciones:', e));
  },
}));
