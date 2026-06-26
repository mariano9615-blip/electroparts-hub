import { create } from 'zustand';
import type { Rol } from '../types';
import { STORAGE_KEY_ROL } from '../utils/constants';

interface RolState {
  rol: Rol;
  setRol: (rol: Rol) => void;
}

const leerRolGuardado = (): Rol => {
  const guardado = localStorage.getItem(STORAGE_KEY_ROL);
  if (guardado === 'comprador' || guardado === 'proveedor') return guardado;
  return 'comprador';
};

export const useRolStore = create<RolState>((set) => ({
  rol: leerRolGuardado(),
  setRol: (rol) => {
    localStorage.setItem(STORAGE_KEY_ROL, rol);
    set({ rol });
  },
}));
