import { create } from 'zustand';
import { usuariosApi } from '../services/api';
import type { RolUsuario } from '../types';

const CLAVE_AUTH = 'ep_auth';

interface SesionGuardada {
  usuario: string;
  rol: RolUsuario;
  nombre: string;
}

interface AuthState {
  autenticado: boolean;
  usuario: string | null;
  rol: RolUsuario | null;
  nombre: string | null;
  errorLogin: string | null;
  login: (usuario: string, password: string) => Promise<boolean>;
  logout: () => void;
}

function leerSesion(): SesionGuardada | null {
  const guardado = localStorage.getItem(CLAVE_AUTH);
  if (!guardado) return null;
  try {
    const parsed = JSON.parse(guardado);
    if (
      typeof parsed?.usuario === 'string' &&
      typeof parsed?.rol === 'string' &&
      typeof parsed?.nombre === 'string'
    ) {
      return parsed as SesionGuardada;
    }
    return null;
  } catch {
    return null;
  }
}

const sesionGuardada = leerSesion();

export const useAuthStore = create<AuthState>((set) => ({
  autenticado: sesionGuardada !== null,
  usuario: sesionGuardada?.usuario ?? null,
  rol: sesionGuardada?.rol ?? null,
  nombre: sesionGuardada?.nombre ?? null,
  errorLogin: null,

  login: async (usuario: string, password: string): Promise<boolean> => {
    const encontrado = await usuariosApi.validateCredentials(usuario, password);
    if (!encontrado) {
      set({ errorLogin: 'Usuario o contraseña incorrectos' });
      return false;
    }
    if (!encontrado.activo) {
      set({ errorLogin: 'Tu cuenta está desactivada. Contactá al administrador.' });
      return false;
    }

    const sesion: SesionGuardada = {
      usuario: encontrado.usuario,
      rol: encontrado.rol,
      nombre: encontrado.nombre,
    };
    localStorage.setItem(CLAVE_AUTH, JSON.stringify(sesion));
    set({
      autenticado: true,
      usuario: encontrado.usuario,
      rol: encontrado.rol,
      nombre: encontrado.nombre,
      errorLogin: null,
    });
    return true;
  },

  logout: (): void => {
    localStorage.removeItem(CLAVE_AUTH);
    set({ autenticado: false, usuario: null, rol: null, nombre: null, errorLogin: null });
  },
}));
