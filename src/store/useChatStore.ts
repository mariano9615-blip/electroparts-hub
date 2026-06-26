import { create } from 'zustand';
import type { Mensaje } from '../types';
import { STORAGE_KEY_MENSAJES } from '../utils/constants';
import { MENSAJES_INICIALES } from '../data/mockData';

interface ChatState {
  mensajes: Mensaje[];
  agregarMensaje: (mensaje: Mensaje) => void;
  getMensajesPorOrden: (ordenId: string) => Mensaje[];
}

const leerMensajes = (): Mensaje[] => {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY_MENSAJES);
    if (guardado) {
      const parsed = JSON.parse(guardado);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return MENSAJES_INICIALES;
};

const persistir = (mensajes: Mensaje[]) => {
  localStorage.setItem(STORAGE_KEY_MENSAJES, JSON.stringify(mensajes));
};

export const useChatStore = create<ChatState>((set, get) => ({
  mensajes: leerMensajes(),

  agregarMensaje: (mensaje) => {
    const mensajes = [...get().mensajes, mensaje];
    persistir(mensajes);
    set({ mensajes });
  },

  getMensajesPorOrden: (ordenId) => {
    return get().mensajes.filter((m) => m.ordenId === ordenId);
  },
}));
