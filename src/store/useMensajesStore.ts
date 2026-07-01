import { create } from 'zustand';
import type { MensajePedido, Rol } from '../types';
import * as api from '../services/api';

interface MensajesState {
  mensajes: MensajePedido[];
  pedidoActivoId: string | null;
  cargarMensajes: (pedidoId: string) => void;
  enviarMensaje: (pedidoId: string, texto: string, autorRol: Rol, autorNombre: string) => void;
  limpiarMensajes: () => void;
}

export const useMensajesStore = create<MensajesState>((set, get) => ({
  mensajes: [],
  pedidoActivoId: null,

  cargarMensajes: (pedidoId) => {
    set({ pedidoActivoId: pedidoId });
    api.getMensajesByPedidoId(pedidoId).then((mensajes) => {
      // Solo actualizar si el pedido activo no cambió mientras esperábamos la respuesta
      if (get().pedidoActivoId === pedidoId) {
        set({ mensajes });
      }
    }).catch((e) => console.error('cargarMensajes:', e));
  },

  enviarMensaje: (pedidoId, texto, autorRol, autorNombre) => {
    const mensaje: MensajePedido = {
      id: crypto.randomUUID(),
      pedidoId,
      autorRol,
      autorNombre,
      texto,
      timestamp: new Date().toISOString(),
    };
    api.createMensaje(mensaje).then((created) => {
      if (!created) return;
      set((state) => ({ mensajes: [...state.mensajes, mensaje] }));
    }).catch((e) => console.error('enviarMensaje:', e));
  },

  limpiarMensajes: () => {
    set({ mensajes: [], pedidoActivoId: null });
  },
}));
