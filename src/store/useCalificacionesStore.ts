import { create } from 'zustand';
import type { Calificacion } from '../types';
import { calificacionesApi } from '../services/api';

interface CalificacionesState {
  calificaciones: Calificacion[];
  cargando: boolean;
  cargarCalificaciones: () => Promise<void>;
  crearCalificacion: (data: Omit<Calificacion, 'id' | 'fechaCreacion'>) => Promise<void>;
  getCalificacionesByProveedor: (proveedorId: string) => Calificacion[];
  getPromedioProveedor: (proveedorId: string) => number | null;
  getCalificacionByOrden: (ordenId: string) => Calificacion | null;
}

export const useCalificacionesStore = create<CalificacionesState>((set, get) => ({
  calificaciones: [],
  cargando: false,

  cargarCalificaciones: async () => {
    set({ cargando: true });
    const calificaciones = await calificacionesApi.getAll();
    set({ calificaciones, cargando: false });
  },

  crearCalificacion: async (data) => {
    try {
      const nueva = await calificacionesApi.create(data);
      set((state) => ({ calificaciones: [...state.calificaciones, nueva] }));
    } catch (e) {
      console.error('useCalificacionesStore.crearCalificacion:', e);
    }
  },

  getCalificacionesByProveedor: (proveedorId) => {
    return get().calificaciones.filter((c) => c.proveedorId === proveedorId);
  },

  getPromedioProveedor: (proveedorId) => {
    const propias = get().calificaciones.filter((c) => c.proveedorId === proveedorId);
    if (propias.length === 0) return null;
    const suma = propias.reduce((acc, c) => acc + c.estrellas, 0);
    return suma / propias.length;
  },

  getCalificacionByOrden: (ordenId) => {
    return get().calificaciones.find((c) => c.ordenId === ordenId) ?? null;
  },
}));
