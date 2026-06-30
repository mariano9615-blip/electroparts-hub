import { create } from 'zustand';
import type { Orden, EstadoOrden } from '../types';
import * as api from '../services/api';

interface OrdenesState {
  ordenes: Orden[];
  cargarDatos: () => void;
  agregarOrden: (orden: Orden) => void;
  actualizarEstadoOrden: (id: string, estado: EstadoOrden) => void;
}

export const useOrdenesStore = create<OrdenesState>((set) => ({
  ordenes: [],

  cargarDatos: () => {
    api.getOrdenes().then((ordenes) => set({ ordenes }));
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
}));
