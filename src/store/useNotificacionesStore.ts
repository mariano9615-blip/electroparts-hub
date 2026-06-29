import { create } from 'zustand';
import { STORAGE_KEY_NOTIFICACIONES } from '../utils/constants';

export type TipoNotificacion =
  | 'nueva_cotizacion'
  | 'pedido_adjudicado'
  | 'orden_confirmada'
  | 'nueva_orden'
  | 'cotizacion_aceptada';

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
  agregarNotificacion: (n: Omit<Notificacion, 'id' | 'fecha' | 'leida'>) => void;
  marcarLeida: (id: string) => void;
  marcarTodasLeidas: () => void;
  eliminarNotificacion: (id: string) => void;
  limpiarTodas: () => void;
  getNoLeidas: (rol: 'comprador' | 'proveedor') => Notificacion[];
  getTodas: (rol: 'comprador' | 'proveedor') => Notificacion[];
}

const leerNotificaciones = (): Notificacion[] => {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY_NOTIFICACIONES);
    if (guardado) {
      const parsed = JSON.parse(guardado);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
};

const persistir = (notificaciones: Notificacion[]) => {
  localStorage.setItem(STORAGE_KEY_NOTIFICACIONES, JSON.stringify(notificaciones));
};

export const useNotificacionesStore = create<NotificacionesState>((set, get) => ({
  notificaciones: leerNotificaciones(),

  agregarNotificacion: (n) => {
    const nueva: Notificacion = {
      ...n,
      id: crypto.randomUUID(),
      fecha: new Date().toISOString(),
      leida: false,
    };
    const notificaciones = [nueva, ...get().notificaciones];
    persistir(notificaciones);
    set({ notificaciones });
  },

  marcarLeida: (id) => {
    const notificaciones = get().notificaciones.map((n) =>
      n.id === id ? { ...n, leida: true } : n,
    );
    persistir(notificaciones);
    set({ notificaciones });
  },

  marcarTodasLeidas: () => {
    const notificaciones = get().notificaciones.map((n) => ({ ...n, leida: true }));
    persistir(notificaciones);
    set({ notificaciones });
  },

  eliminarNotificacion: (id) => {
    const notificaciones = get().notificaciones.filter((n) => n.id !== id);
    persistir(notificaciones);
    set({ notificaciones });
  },

  limpiarTodas: () => {
    persistir([]);
    set({ notificaciones: [] });
  },

  getNoLeidas: (rol) => {
    return get().notificaciones.filter((n) => n.rolDestino === rol && !n.leida);
  },

  getTodas: (rol) => {
    return get().notificaciones.filter((n) => n.rolDestino === rol);
  },
}));
