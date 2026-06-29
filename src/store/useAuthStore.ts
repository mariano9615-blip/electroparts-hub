import { create } from 'zustand';

const CLAVE_AUTH = 'ep_auth';

interface AuthState {
  autenticado: boolean;
  usuario: string | null;
  login: (usuario: string, password: string) => boolean;
  logout: () => void;
}

const sesionGuardada = localStorage.getItem(CLAVE_AUTH) === 'true';

export const useAuthStore = create<AuthState>(() => ({
  autenticado: sesionGuardada,
  usuario: sesionGuardada ? 'admin' : null,

  login: (usuario: string, password: string): boolean => {
    if (usuario === 'admin' && password === '123456') {
      localStorage.setItem(CLAVE_AUTH, 'true');
      useAuthStore.setState({ autenticado: true, usuario: 'admin' });
      return true;
    }
    return false;
  },

  logout: (): void => {
    localStorage.removeItem(CLAVE_AUTH);
    useAuthStore.setState({ autenticado: false, usuario: null });
  },
}));
