import { create } from 'zustand';
import type { MensajePedido, Rol } from '../types';
import { useAuthStore } from './useAuthStore';
import * as api from '../services/api';

// Referencia estable para pedidos sin mensajes todavía. Un `?? []` inline crearía un array
// nuevo en cada llamada, rompiendo la igualdad por referencia que espera useSyncExternalStore
// (Zustand) y causando "getSnapshot should be cached" → loop infinito de renders.
const SIN_MENSAJES: MensajePedido[] = [];

interface MensajesState {
  mensajesPorPedido: Record<string, MensajePedido[]>;
  pedidoActivoId: string | null;
  // Set de pedidoIds con mensajes no leídos detectados en la sesión
  pedidosConMensajeNuevo: string[];

  setMensajesPorPedido: (pedidoId: string, mensajes: MensajePedido[]) => void;
  agregarMensaje: (mensaje: MensajePedido) => void;
  getMensajesDePedido: (pedidoId: string) => MensajePedido[];
  setPedidoActivo: (pedidoId: string | null) => void;

  cargarMensajes: (pedidoId: string) => void;
  cargarTodosLosMensajes: () => Promise<void>;
  enviarMensaje: (
    pedidoId: string,
    texto: string,
    autorRol: Rol,
    autorNombre: string,
    cotizacionId?: string,
  ) => void;
  limpiarPedidoActivo: () => void;
  marcarMensajesLeidos: (pedidoId: string, miRol: Rol) => void;
}

export const useMensajesStore = create<MensajesState>((set, get) => ({
  mensajesPorPedido: {},
  pedidoActivoId: null,
  pedidosConMensajeNuevo: [],

  setMensajesPorPedido: (pedidoId, mensajes) => {
    set((state) => ({
      mensajesPorPedido: { ...state.mensajesPorPedido, [pedidoId]: mensajes },
    }));
  },

  agregarMensaje: (mensaje) => {
    set((state) => ({
      mensajesPorPedido: {
        ...state.mensajesPorPedido,
        [mensaje.pedidoId]: [...(state.mensajesPorPedido[mensaje.pedidoId] ?? []), mensaje],
      },
    }));
  },

  getMensajesDePedido: (pedidoId) => get().mensajesPorPedido[pedidoId] ?? SIN_MENSAJES,

  setPedidoActivo: (pedidoId) => set({ pedidoActivoId: pedidoId }),

  cargarMensajes: (pedidoId) => {
    set({ pedidoActivoId: pedidoId });

    api.getMensajesByPedidoId(pedidoId).then((mensajes) => {
      if (get().pedidoActivoId !== pedidoId) return;

      const miRol = useAuthStore.getState().rol;
      const tieneNoLeidos = mensajes.some((m) => m.autorRol !== miRol && m.leido === false);

      get().setMensajesPorPedido(pedidoId, mensajes);

      if (tieneNoLeidos) {
        set((state) => ({
          pedidosConMensajeNuevo: [...new Set([...state.pedidosConMensajeNuevo, pedidoId])],
        }));
      }
    }).catch((e) => console.error('cargarMensajes:', e));
  },

  // Trae TODOS los mensajes, los agrupa por pedidoId y actualiza el store completo.
  // Usado por el polling global: detecta mensajes nuevos en cualquier pedido (no solo el activo)
  // y dispara toast + sonido comparando contra el snapshot previo en mensajesPorPedido.
  cargarTodosLosMensajes: async () => {
    let todos: MensajePedido[];
    try {
      todos = await api.getMensajes();
    } catch (e) {
      console.error('cargarTodosLosMensajes:', e);
      return;
    }

    const miRol = useAuthStore.getState().rol;
    const prev = get().mensajesPorPedido;

    const agrupados: Record<string, MensajePedido[]> = {};
    for (const m of todos) {
      (agrupados[m.pedidoId] ??= []).push(m);
    }

    const nuevosPorPedido: string[] = [];

    Object.entries(agrupados).forEach(([pedidoId, mensajes]) => {
      const prevMensajes = prev[pedidoId];
      // Primera vez que vemos este pedido en la sesión: no disparar toasts retroactivos
      if (prevMensajes === undefined) return;

      const prevIds = new Set(prevMensajes.map((m) => m.id));
      const nuevos = mensajes.filter((m) => !prevIds.has(m.id) && m.autorRol !== miRol);
      if (nuevos.length > 0) {
        nuevosPorPedido.push(pedidoId);
        nuevos.forEach((msg) => {
          window.dispatchEvent(new CustomEvent('mensaje-nuevo-toast', { detail: msg }));
        });
      }
    });

    set((state) => ({
      mensajesPorPedido: { ...state.mensajesPorPedido, ...agrupados },
      pedidosConMensajeNuevo:
        nuevosPorPedido.length > 0
          ? [...new Set([...state.pedidosConMensajeNuevo, ...nuevosPorPedido])]
          : state.pedidosConMensajeNuevo,
    }));
  },

  enviarMensaje: (pedidoId, texto, autorRol, autorNombre, cotizacionId) => {
    const mensaje: MensajePedido = {
      id: crypto.randomUUID(),
      pedidoId,
      ...(cotizacionId ? { cotizacionId } : {}),
      autorRol,
      autorNombre,
      texto,
      timestamp: new Date().toISOString(),
      leido: false,
    };
    api.createMensaje(mensaje).then((created) => {
      if (!created) return;
      get().agregarMensaje(mensaje);
    }).catch((e) => console.error('enviarMensaje:', e));
  },

  limpiarPedidoActivo: () => {
    set({ pedidoActivoId: null });
  },

  marcarMensajesLeidos: (pedidoId, miRol) => {
    const mensajes = get().mensajesPorPedido[pedidoId] ?? [];
    const noLeidos = mensajes.filter((m) => m.autorRol !== miRol && m.leido === false);
    if (noLeidos.length === 0) return;

    // PATCH en paralelo, sin bloquear la UI
    Promise.all(noLeidos.map((m) => api.updateMensaje(m.id, { leido: true }))).then(() => {
      set((state) => ({
        mensajesPorPedido: {
          ...state.mensajesPorPedido,
          [pedidoId]: (state.mensajesPorPedido[pedidoId] ?? []).map((m) =>
            m.autorRol !== miRol ? { ...m, leido: true } : m,
          ),
        },
        pedidosConMensajeNuevo: state.pedidosConMensajeNuevo.filter((id) => id !== pedidoId),
      }));
    }).catch((e) => console.error('marcarMensajesLeidos:', e));
  },
}));
