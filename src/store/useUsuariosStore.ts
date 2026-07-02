import { create } from 'zustand';
import bcrypt from 'bcryptjs';
import { usuariosApi } from '../services/api';
import type { Usuario, UsuarioFormData } from '../types';

type UsuarioSeguro = Omit<Usuario, 'passwordHash'>;

interface UsuariosState {
  usuarios: UsuarioSeguro[];
  cargando: boolean;
  error: string | null;
  cargarUsuarios: () => Promise<void>;
  crearUsuario: (data: UsuarioFormData) => Promise<{ ok: boolean; error?: string }>;
  editarUsuario: (id: string, data: Partial<UsuarioFormData>) => Promise<{ ok: boolean; error?: string }>;
  cambiarPassword: (id: string, passwordNueva: string) => Promise<{ ok: boolean; error?: string }>;
  toggleActivo: (id: string) => Promise<void>;
  eliminarUsuario: (id: string) => Promise<void>;
}

function omitirHash(usuario: Usuario): UsuarioSeguro {
  const { passwordHash: _passwordHash, ...usuarioSeguro } = usuario;
  return usuarioSeguro;
}

export const useUsuariosStore = create<UsuariosState>((set, get) => ({
  usuarios: [],
  cargando: false,
  error: null,

  cargarUsuarios: async () => {
    set({ cargando: true, error: null });
    try {
      const data = await usuariosApi.getAll();
      set({ usuarios: data.map(omitirHash), cargando: false });
    } catch (e) {
      console.error('useUsuariosStore.cargarUsuarios:', e);
      set({ error: 'No se pudieron cargar los usuarios', cargando: false });
    }
  },

  crearUsuario: async (data) => {
    const usuarioNormalizado = data.usuario.trim().toLowerCase();
    const existe = get().usuarios.some((u) => u.usuario.toLowerCase() === usuarioNormalizado);
    if (existe) return { ok: false, error: 'Este nombre de usuario ya está en uso' };

    try {
      const passwordHash = await bcrypt.hash(data.password, 10);
      const nuevo = await usuariosApi.create({
        usuario: data.usuario.trim(),
        passwordHash,
        rol: data.rol,
        nombre: data.nombre.trim(),
        empresa: data.empresa?.trim() || undefined,
        activo: data.activo,
      });
      set({ usuarios: [...get().usuarios, omitirHash(nuevo)] });
      return { ok: true };
    } catch (e) {
      console.error('useUsuariosStore.crearUsuario:', e);
      return { ok: false, error: 'No se pudo crear el usuario' };
    }
  },

  editarUsuario: async (id, data) => {
    try {
      const payload: Partial<Usuario> = {};
      if (data.nombre !== undefined) payload.nombre = data.nombre.trim();
      if (data.rol !== undefined) payload.rol = data.rol;
      if (data.empresa !== undefined) payload.empresa = data.empresa.trim() || undefined;
      if (data.activo !== undefined) payload.activo = data.activo;

      const actualizado = await usuariosApi.update(id, payload);
      set({ usuarios: get().usuarios.map((u) => (u.id === id ? omitirHash(actualizado) : u)) });
      return { ok: true };
    } catch (e) {
      console.error('useUsuariosStore.editarUsuario:', e);
      return { ok: false, error: 'No se pudo editar el usuario' };
    }
  },

  cambiarPassword: async (id, passwordNueva) => {
    try {
      const passwordHash = await bcrypt.hash(passwordNueva, 10);
      const actualizado = await usuariosApi.update(id, { passwordHash });
      set({ usuarios: get().usuarios.map((u) => (u.id === id ? omitirHash(actualizado) : u)) });
      return { ok: true };
    } catch (e) {
      console.error('useUsuariosStore.cambiarPassword:', e);
      return { ok: false, error: 'No se pudo cambiar la contraseña' };
    }
  },

  toggleActivo: async (id) => {
    const usuario = get().usuarios.find((u) => u.id === id);
    if (!usuario) return;
    if (usuario.rol === 'admin') {
      console.warn('useUsuariosStore.toggleActivo: el administrador no puede ser desactivado');
      return;
    }
    try {
      const actualizado = await usuariosApi.update(id, { activo: !usuario.activo });
      set({ usuarios: get().usuarios.map((u) => (u.id === id ? omitirHash(actualizado) : u)) });
    } catch (e) {
      console.error('useUsuariosStore.toggleActivo:', e);
    }
  },

  eliminarUsuario: async (id) => {
    const usuario = get().usuarios.find((u) => u.id === id);
    if (!usuario) return;
    if (usuario.rol === 'admin') {
      console.warn('useUsuariosStore.eliminarUsuario: el administrador no puede ser eliminado');
      return;
    }
    try {
      await usuariosApi.delete(id);
      set({ usuarios: get().usuarios.filter((u) => u.id !== id) });
    } catch (e) {
      console.error('useUsuariosStore.eliminarUsuario:', e);
    }
  },
}));
