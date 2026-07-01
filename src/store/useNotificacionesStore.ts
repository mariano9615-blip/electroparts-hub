import { create } from 'zustand';
import * as api from '../services/api';

export type TipoNotificacion =
  | 'nueva_cotizacion'
  | 'pedido_adjudicado'
  | 'orden_confirmada'
  | 'nueva_orden'
  | 'cotizacion_aceptada'
  | 'cotizacion_en_negociacion'
  | 'cotizacion_rechazada'
  | 'mensaje_nuevo'
  | 'estado_pedido_cambio'
  | 'orden_en_preparacion'
  | 'orden_enviada'
  | 'orden_entregada'
  | 'orden_pago_confirmado'
  | 'orden_cerrada'
  | 'orden_disputada';

export interface Notificacion {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  rolDestino: 'comprador' | 'proveedor';
  entidadId?: string;
}

interface NotificacionesState {
  notificaciones: Notificacion[];
  cargarDatos: () => void;
  agregarNotificacion: (n: Omit<Notificacion, 'id' | 'fecha' | 'leida'>) => void;
  marcarLeida: (id: string) => void;
  marcarTodasLeidas: () => void;
  eliminarNotificacion: (id: string) => void;
  limpiarTodas: () => void;
  getNoLeidas: (rol: 'comprador' | 'proveedor') => Notificacion[];
  getTodas: (rol: 'comprador' | 'proveedor') => Notificacion[];
}

export const useNotificacionesStore = create<NotificacionesState>((set, get) => ({
  notificaciones: [],

  cargarDatos: () => {
    api.getNotificaciones().then((notificaciones) =>
      set({ notificaciones: notificaciones as Notificacion[] }),
    );
  },

  agregarNotificacion: (n) => {
    const nueva: Notificacion = {
      ...n,
      id: crypto.randomUUID(),
      fecha: new Date().toISOString(),
      leida: false,
    };
    api.createNotificacion(nueva).then((created) => {
      if (!created) return;
      set((state) => ({ notificaciones: [nueva, ...state.notificaciones] }));
    }).catch((e) => console.error('agregarNotificacion:', e));
  },

  marcarLeida: (id) => {
    api.updateNotificacion(id, { leida: true }).then((updated) => {
      if (!updated) return;
      set((state) => ({
        notificaciones: state.notificaciones.map((n) => (n.id === id ? { ...n, leida: true } : n)),
      }));
    }).catch((e) => console.error('marcarLeida:', e));
  },

  marcarTodasLeidas: () => {
    const noLeidas = get().notificaciones.filter((n) => !n.leida);
    if (noLeidas.length === 0) return;
    Promise.all(noLeidas.map((n) => api.updateNotificacion(n.id, { leida: true }))).then(() => {
      set((state) => ({
        notificaciones: state.notificaciones.map((n) => ({ ...n, leida: true })),
      }));
    }).catch((e) => console.error('marcarTodasLeidas:', e));
  },

  eliminarNotificacion: (id) => {
    api.deleteNotificacion(id).then((ok) => {
      if (!ok) return;
      set((state) => ({
        notificaciones: state.notificaciones.filter((n) => n.id !== id),
      }));
    }).catch((e) => console.error('eliminarNotificacion:', e));
  },

  limpiarTodas: () => {
    const ids = get().notificaciones.map((n) => n.id);
    Promise.all(ids.map((id) => api.deleteNotificacion(id))).then(() => {
      set({ notificaciones: [] });
    }).catch((e) => console.error('limpiarTodas:', e));
  },

  getNoLeidas: (rol) => {
    return get().notificaciones.filter((n) => n.rolDestino === rol && !n.leida);
  },

  getTodas: (rol) => {
    return get().notificaciones.filter((n) => n.rolDestino === rol);
  },
}));
