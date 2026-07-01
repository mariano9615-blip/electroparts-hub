import { create } from 'zustand';
import type { MensajePedido, Rol } from '../types';
import { useRolStore } from './useRolStore';
import * as api from '../services/api';

interface MensajesState {
  mensajes: MensajePedido[];
  pedidoActivoId: string | null;
  // Set de pedidoIds con mensajes no leídos detectados en la sesión
  pedidosConMensajeNuevo: string[];
  cargarMensajes: (pedidoId: string) => void;
  enviarMensaje: (pedidoId: string, texto: string, autorRol: Rol, autorNombre: string) => void;
  limpiarMensajes: () => void;
  marcarMensajesLeidos: (pedidoId: string, miRol: Rol) => void;
}

export const useMensajesStore = create<MensajesState>((set, get) => ({
  mensajes: [],
  pedidoActivoId: null,
  pedidosConMensajeNuevo: [],

  cargarMensajes: (pedidoId) => {
    const prev = get();
    // Primera carga para este pedido: no disparar toasts, pero sí detectar no leídos
    const esPrimeraCarga = prev.pedidoActivoId !== pedidoId;

    set({ pedidoActivoId: pedidoId });

    api.getMensajesByPedidoId(pedidoId).then((mensajes) => {
      if (get().pedidoActivoId !== pedidoId) return;

      const miRol = useRolStore.getState().rol;

      if (esPrimeraCarga) {
        // En primera carga: detectar si hay mensajes no leídos del otro lado
        const tieneNoLeidos = mensajes.some(
          (m) => m.autorRol !== miRol && m.leido === false,
        );
        if (tieneNoLeidos) {
          set((state) => ({
            mensajes,
            pedidosConMensajeNuevo: [...new Set([...state.pedidosConMensajeNuevo, pedidoId])],
          }));
        } else {
          set({ mensajes });
        }
      } else {
        // En polls subsiguientes: detectar mensajes nuevos del otro lado y disparar evento
        const prevIds = new Set(prev.mensajes.map((m) => m.id));
        const nuevos = mensajes.filter(
          (m) => !prevIds.has(m.id) && m.autorRol !== miRol,
        );
        set({ mensajes });
        if (nuevos.length > 0) {
          set((state) => ({
            pedidosConMensajeNuevo: [...new Set([...state.pedidosConMensajeNuevo, pedidoId])],
          }));
          nuevos.forEach((msg) => {
            window.dispatchEvent(new CustomEvent('mensaje-nuevo-toast', { detail: msg }));
          });
        }
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
      leido: false,
    };
    api.createMensaje(mensaje).then((created) => {
      if (!created) return;
      set((state) => ({ mensajes: [...state.mensajes, mensaje] }));
    }).catch((e) => console.error('enviarMensaje:', e));
  },

  limpiarMensajes: () => {
    set({ mensajes: [], pedidoActivoId: null });
  },

  marcarMensajesLeidos: (pedidoId, miRol) => {
    const noLeidos = get().mensajes.filter(
      (m) => m.autorRol !== miRol && m.leido === false,
    );
    if (noLeidos.length === 0) return;

    // PATCH en paralelo, sin bloquear la UI
    Promise.all(noLeidos.map((m) => api.updateMensaje(m.id, { leido: true }))).then(() => {
      set((state) => ({
        mensajes: state.mensajes.map((m) =>
          m.autorRol !== miRol ? { ...m, leido: true } : m,
        ),
        pedidosConMensajeNuevo: state.pedidosConMensajeNuevo.filter((id) => id !== pedidoId),
      }));
    }).catch((e) => console.error('marcarMensajesLeidos:', e));
  },
}));
