import { create } from 'zustand';
import type { Orden, EstadoOrden } from '../types';
import { STORAGE_KEY_ORDENES } from '../utils/constants';
import { ORDENES_INICIALES } from '../data/mockData';

interface OrdenesState {
  ordenes: Orden[];
  agregarOrden: (orden: Orden) => void;
  actualizarEstadoOrden: (id: string, estado: EstadoOrden) => void;
}

const leerOrdenes = (): Orden[] => {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY_ORDENES);
    if (guardado) {
      const parsed = JSON.parse(guardado);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return ORDENES_INICIALES;
};

const persistir = (ordenes: Orden[]) => {
  localStorage.setItem(STORAGE_KEY_ORDENES, JSON.stringify(ordenes));
};

export const useOrdenesStore = create<OrdenesState>((set, get) => ({
  ordenes: leerOrdenes(),

  agregarOrden: (orden) => {
    const ordenes = [...get().ordenes, orden];
    persistir(ordenes);
    set({ ordenes });
  },

  actualizarEstadoOrden: (id, estado) => {
    const ordenes = get().ordenes.map((o) => (o.id === id ? { ...o, estado } : o));
    persistir(ordenes);
    set({ ordenes });
  },
}));
