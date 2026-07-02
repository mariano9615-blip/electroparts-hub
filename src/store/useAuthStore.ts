import { create } from 'zustand';
import type { RolUsuario } from '../types';

const CLAVE_AUTH = 'ep_auth';

interface Credencial {
  password: string;
  rol: RolUsuario;
}

// Usuarios fijos hardcodeados — sin backend de auth (Etapa 6)
const USUARIOS: Record<string, Credencial> = {
  admin: { password: '123456', rol: 'admin' },
  comprador: { password: '123456', rol: 'comprador' },
  proveedor: { password: '123456', rol: 'proveedor' },
};

interface SesionGuardada {
  usuario: string;
  rol: RolUsuario;
}

interface AuthState {
  autenticado: boolean;
  usuario: string | null;
  rol: RolUsuario | null;
  login: (usuario: string, password: string) => boolean;
  logout: () => void;
}

function leerSesion(): SesionGuardada | null {
  const guardado = localStorage.getItem(CLAVE_AUTH);
  if (!guardado) return null;
  try {
    const parsed = JSON.parse(guardado);
    if (typeof parsed?.usuario === 'string' && typeof parsed?.rol === 'string') {
      return parsed as SesionGuardada;
    }
    return null;
  } catch {
    return null;
  }
}

const sesionGuardada = leerSesion();

export const useAuthStore = create<AuthState>(() => ({
  autenticado: sesionGuardada !== null,
  usuario: sesionGuardada?.usuario ?? null,
  rol: sesionGuardada?.rol ?? null,

  login: (usuario: string, password: string): boolean => {
    const credencial = USUARIOS[usuario];
    if (!credencial || credencial.password !== password) return false;

    const sesion: SesionGuardada = { usuario, rol: credencial.rol };
    localStorage.setItem(CLAVE_AUTH, JSON.stringify(sesion));
    useAuthStore.setState({ autenticado: true, usuario, rol: credencial.rol });
    return true;
  },

  logout: (): void => {
    localStorage.removeItem(CLAVE_AUTH);
    useAuthStore.setState({ autenticado: false, usuario: null, rol: null });
  },
}));
