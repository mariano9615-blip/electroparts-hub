import bcrypt from 'bcryptjs';
import type { Pedido, Cotizacion, Orden, MensajePedido, Usuario, Calificacion } from '../types';
import { supabase } from './supabaseClient';

// SUPABASE MIGRATION: fuente de datos activa. 'jsonserver' (default) o 'supabase'.
// Cada función pública de este archivo chequea DATA_SOURCE y delega en la implementación
// correspondiente (*JsonServer / *Supabase) — mismo contrato de funciones en ambos modos.
// Ver ANTIGRAVITY.md sección 10 "Migración Supabase".
const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE ?? 'jsonserver';
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

// Interfaz local compatible con Notificacion del store (evita importacion circular)
interface NotificacionPayload {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  rolDestino: 'comprador' | 'proveedor';
  entidadId?: string;
}

// ─── Pedidos ────────────────────────────────────────────────────────────────

const pedidosJsonServer = {
  async getAll(): Promise<Pedido[]> {
    try {
      const res = await fetch(`${BASE_URL}/pedidos`);
      return await res.json();
    } catch (e) {
      console.error('api.getPedidos:', e);
      return [];
    }
  },
  async getById(id: string): Promise<Pedido | null> {
    try {
      const res = await fetch(`${BASE_URL}/pedidos/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error('api.getPedidoById:', e);
      return null;
    }
  },
  async update(id: string, data: Partial<Pedido>): Promise<Pedido | null> {
    try {
      const res = await fetch(`${BASE_URL}/pedidos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      console.error('api.updatePedido:', e);
      return null;
    }
  },
  async create(data: Pedido): Promise<Pedido | null> {
    try {
      const res = await fetch(`${BASE_URL}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      console.error('api.createPedido:', e);
      return null;
    }
  },
  async delete(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/pedidos/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch (e) {
      console.error('api.deletePedido:', e);
      return false;
    }
  },
};

const pedidosSupabase = {
  async getAll(): Promise<Pedido[]> {
    const { data, error } = await supabase.from('pedidos').select('*');
    if (error) throw new Error(error.message);
    return data ?? [];
  },
  async getById(id: string): Promise<Pedido | null> {
    const { data, error } = await supabase.from('pedidos').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  },
  async update(id: string, data: Partial<Pedido>): Promise<Pedido | null> {
    const { data: actualizado, error } = await supabase
      .from('pedidos')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return actualizado;
  },
  async create(data: Pedido): Promise<Pedido | null> {
    const { data: creado, error } = await supabase.from('pedidos').insert(data).select().single();
    if (error) throw new Error(error.message);
    return creado;
  },
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('pedidos').delete().eq('id', id);
    return !error;
  },
};

export async function getPedidos(): Promise<Pedido[]> {
  return DATA_SOURCE === 'supabase' ? pedidosSupabase.getAll() : pedidosJsonServer.getAll();
}

export async function getPedidoById(id: string): Promise<Pedido | null> {
  return DATA_SOURCE === 'supabase' ? pedidosSupabase.getById(id) : pedidosJsonServer.getById(id);
}

export async function updatePedido(id: string, data: Partial<Pedido>): Promise<Pedido | null> {
  return DATA_SOURCE === 'supabase' ? pedidosSupabase.update(id, data) : pedidosJsonServer.update(id, data);
}

export async function createPedido(data: Pedido): Promise<Pedido | null> {
  return DATA_SOURCE === 'supabase' ? pedidosSupabase.create(data) : pedidosJsonServer.create(data);
}

export async function deletePedido(id: string): Promise<boolean> {
  return DATA_SOURCE === 'supabase' ? pedidosSupabase.delete(id) : pedidosJsonServer.delete(id);
}

// ─── Cotizaciones ────────────────────────────────────────────────────────────

const cotizacionesJsonServer = {
  async getAll(): Promise<Cotizacion[]> {
    try {
      const res = await fetch(`${BASE_URL}/cotizaciones`);
      return await res.json();
    } catch (e) {
      console.error('api.getCotizaciones:', e);
      return [];
    }
  },
  async getByPedidoId(pedidoId: string): Promise<Cotizacion[]> {
    try {
      const res = await fetch(`${BASE_URL}/cotizaciones?pedidoId=${pedidoId}`);
      return await res.json();
    } catch (e) {
      console.error('api.getCotizacionesByPedidoId:', e);
      return [];
    }
  },
  async update(id: string, data: Partial<Cotizacion>): Promise<Cotizacion | null> {
    try {
      const res = await fetch(`${BASE_URL}/cotizaciones/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      console.error('api.updateCotizacion:', e);
      return null;
    }
  },
  async create(data: Cotizacion): Promise<Cotizacion | null> {
    try {
      const res = await fetch(`${BASE_URL}/cotizaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      console.error('api.createCotizacion:', e);
      return null;
    }
  },
  async delete(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/cotizaciones/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch (e) {
      console.error('api.deleteCotizacion:', e);
      return false;
    }
  },
};

const cotizacionesSupabase = {
  async getAll(): Promise<Cotizacion[]> {
    const { data, error } = await supabase.from('cotizaciones').select('*');
    if (error) throw new Error(error.message);
    return data ?? [];
  },
  async getByPedidoId(pedidoId: string): Promise<Cotizacion[]> {
    const { data, error } = await supabase.from('cotizaciones').select('*').eq('pedidoId', pedidoId);
    if (error) throw new Error(error.message);
    return data ?? [];
  },
  async update(id: string, data: Partial<Cotizacion>): Promise<Cotizacion | null> {
    const { data: actualizada, error } = await supabase
      .from('cotizaciones')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return actualizada;
  },
  async create(data: Cotizacion): Promise<Cotizacion | null> {
    const { data: creada, error } = await supabase.from('cotizaciones').insert(data).select().single();
    if (error) throw new Error(error.message);
    return creada;
  },
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('cotizaciones').delete().eq('id', id);
    return !error;
  },
};

export async function getCotizaciones(): Promise<Cotizacion[]> {
  return DATA_SOURCE === 'supabase' ? cotizacionesSupabase.getAll() : cotizacionesJsonServer.getAll();
}

export async function getCotizacionesByPedidoId(pedidoId: string): Promise<Cotizacion[]> {
  return DATA_SOURCE === 'supabase'
    ? cotizacionesSupabase.getByPedidoId(pedidoId)
    : cotizacionesJsonServer.getByPedidoId(pedidoId);
}

export async function updateCotizacion(
  id: string,
  data: Partial<Cotizacion>,
): Promise<Cotizacion | null> {
  return DATA_SOURCE === 'supabase'
    ? cotizacionesSupabase.update(id, data)
    : cotizacionesJsonServer.update(id, data);
}

export async function createCotizacion(data: Cotizacion): Promise<Cotizacion | null> {
  return DATA_SOURCE === 'supabase' ? cotizacionesSupabase.create(data) : cotizacionesJsonServer.create(data);
}

export async function deleteCotizacion(id: string): Promise<boolean> {
  return DATA_SOURCE === 'supabase' ? cotizacionesSupabase.delete(id) : cotizacionesJsonServer.delete(id);
}

// ─── Ordenes ─────────────────────────────────────────────────────────────────

const ordenesJsonServer = {
  async getAll(): Promise<Orden[]> {
    try {
      const res = await fetch(`${BASE_URL}/ordenes`);
      return await res.json();
    } catch (e) {
      console.error('api.getOrdenes:', e);
      return [];
    }
  },
  async create(data: Orden): Promise<Orden | null> {
    try {
      const res = await fetch(`${BASE_URL}/ordenes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      console.error('api.createOrden:', e);
      return null;
    }
  },
  async update(id: string, data: Partial<Orden>): Promise<Orden | null> {
    try {
      const res = await fetch(`${BASE_URL}/ordenes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      console.error('api.updateOrden:', e);
      return null;
    }
  },
};

const ordenesSupabase = {
  async getAll(): Promise<Orden[]> {
    const { data, error } = await supabase.from('ordenes').select('*');
    if (error) throw new Error(error.message);
    return data ?? [];
  },
  async create(data: Orden): Promise<Orden | null> {
    const { data: creada, error } = await supabase.from('ordenes').insert(data).select().single();
    if (error) throw new Error(error.message);
    return creada;
  },
  async update(id: string, data: Partial<Orden>): Promise<Orden | null> {
    const { data: actualizada, error } = await supabase
      .from('ordenes')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return actualizada;
  },
};

export async function getOrdenes(): Promise<Orden[]> {
  return DATA_SOURCE === 'supabase' ? ordenesSupabase.getAll() : ordenesJsonServer.getAll();
}

export async function createOrden(data: Orden): Promise<Orden | null> {
  return DATA_SOURCE === 'supabase' ? ordenesSupabase.create(data) : ordenesJsonServer.create(data);
}

export async function updateOrden(id: string, data: Partial<Orden>): Promise<Orden | null> {
  return DATA_SOURCE === 'supabase' ? ordenesSupabase.update(id, data) : ordenesJsonServer.update(id, data);
}

// ─── Notificaciones ──────────────────────────────────────────────────────────

const notificacionesJsonServer = {
  async getAll(): Promise<NotificacionPayload[]> {
    try {
      const res = await fetch(`${BASE_URL}/notificaciones`);
      return await res.json();
    } catch (e) {
      console.error('api.getNotificaciones:', e);
      return [];
    }
  },
  async create(data: NotificacionPayload): Promise<NotificacionPayload | null> {
    try {
      const res = await fetch(`${BASE_URL}/notificaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      console.error('api.createNotificacion:', e);
      return null;
    }
  },
  async update(id: string, data: Partial<NotificacionPayload>): Promise<NotificacionPayload | null> {
    try {
      const res = await fetch(`${BASE_URL}/notificaciones/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      console.error('api.updateNotificacion:', e);
      return null;
    }
  },
  async delete(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/notificaciones/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch (e) {
      console.error('api.deleteNotificacion:', e);
      return false;
    }
  },
};

const notificacionesSupabase = {
  async getAll(): Promise<NotificacionPayload[]> {
    const { data, error } = await supabase.from('notificaciones').select('*');
    if (error) throw new Error(error.message);
    return data ?? [];
  },
  async create(data: NotificacionPayload): Promise<NotificacionPayload | null> {
    const { data: creada, error } = await supabase.from('notificaciones').insert(data).select().single();
    if (error) throw new Error(error.message);
    return creada;
  },
  async update(id: string, data: Partial<NotificacionPayload>): Promise<NotificacionPayload | null> {
    const { data: actualizada, error } = await supabase
      .from('notificaciones')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return actualizada;
  },
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('notificaciones').delete().eq('id', id);
    return !error;
  },
};

export async function getNotificaciones(): Promise<NotificacionPayload[]> {
  return DATA_SOURCE === 'supabase' ? notificacionesSupabase.getAll() : notificacionesJsonServer.getAll();
}

export async function createNotificacion(
  data: NotificacionPayload,
): Promise<NotificacionPayload | null> {
  return DATA_SOURCE === 'supabase'
    ? notificacionesSupabase.create(data)
    : notificacionesJsonServer.create(data);
}

export async function updateNotificacion(
  id: string,
  data: Partial<NotificacionPayload>,
): Promise<NotificacionPayload | null> {
  return DATA_SOURCE === 'supabase'
    ? notificacionesSupabase.update(id, data)
    : notificacionesJsonServer.update(id, data);
}

export async function deleteNotificacion(id: string): Promise<boolean> {
  return DATA_SOURCE === 'supabase' ? notificacionesSupabase.delete(id) : notificacionesJsonServer.delete(id);
}

// ─── Mensajes de pedido ──────────────────────────────────────────────────────

const mensajesJsonServer = {
  async getAll(): Promise<MensajePedido[]> {
    try {
      const res = await fetch(`${BASE_URL}/mensajes`);
      return await res.json();
    } catch (e) {
      console.error('api.getMensajes:', e);
      return [];
    }
  },
  async getByPedidoId(pedidoId: string): Promise<MensajePedido[]> {
    try {
      const res = await fetch(`${BASE_URL}/mensajes?pedidoId=${pedidoId}`);
      return await res.json();
    } catch (e) {
      console.error('api.getMensajesByPedidoId:', e);
      return [];
    }
  },
  async create(data: MensajePedido): Promise<MensajePedido | null> {
    try {
      const res = await fetch(`${BASE_URL}/mensajes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      console.error('api.createMensaje:', e);
      return null;
    }
  },
  async update(id: string, data: Partial<MensajePedido>): Promise<MensajePedido | null> {
    try {
      const res = await fetch(`${BASE_URL}/mensajes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      console.error('api.updateMensaje:', e);
      return null;
    }
  },
};

const mensajesSupabase = {
  async getAll(): Promise<MensajePedido[]> {
    const { data, error } = await supabase.from('mensajes').select('*');
    if (error) throw new Error(error.message);
    return data ?? [];
  },
  async getByPedidoId(pedidoId: string): Promise<MensajePedido[]> {
    const { data, error } = await supabase.from('mensajes').select('*').eq('pedidoId', pedidoId);
    if (error) throw new Error(error.message);
    return data ?? [];
  },
  async create(data: MensajePedido): Promise<MensajePedido | null> {
    const { data: creado, error } = await supabase.from('mensajes').insert(data).select().single();
    if (error) throw new Error(error.message);
    return creado;
  },
  async update(id: string, data: Partial<MensajePedido>): Promise<MensajePedido | null> {
    const { data: actualizado, error } = await supabase
      .from('mensajes')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return actualizado;
  },
};

export async function getMensajes(): Promise<MensajePedido[]> {
  return DATA_SOURCE === 'supabase' ? mensajesSupabase.getAll() : mensajesJsonServer.getAll();
}

export async function getMensajesByPedidoId(pedidoId: string): Promise<MensajePedido[]> {
  return DATA_SOURCE === 'supabase'
    ? mensajesSupabase.getByPedidoId(pedidoId)
    : mensajesJsonServer.getByPedidoId(pedidoId);
}

export async function createMensaje(data: MensajePedido): Promise<MensajePedido | null> {
  return DATA_SOURCE === 'supabase' ? mensajesSupabase.create(data) : mensajesJsonServer.create(data);
}

export async function updateMensaje(
  id: string,
  data: Partial<MensajePedido>,
): Promise<MensajePedido | null> {
  return DATA_SOURCE === 'supabase' ? mensajesSupabase.update(id, data) : mensajesJsonServer.update(id, data);
}

// ─── Usuarios ────────────────────────────────────────────────────────────────
// SUPABASE MIGRATION: cada método chequea DATA_SOURCE y delega en la implementación
// correspondiente. Las firmas no cambian. Ver ANTIGRAVITY.md sección "Migración Supabase".
// Nunca usar `.select('*')` sobre la tabla `usuarios` en Supabase — expondría `passwordHash`
// al cliente. `USUARIO_COLUMNAS_SEGURAS` es la única proyección permitida salvo dentro de
// `validateCredentials`, que necesita el hash para comparar con bcrypt.

const USUARIO_COLUMNAS_SEGURAS =
  'id, usuario, rol, nombre, empresa, activo, fechaCreacion, ultimaModificacion';

const usuariosJsonServer = {
  async getAll(): Promise<Usuario[]> {
    try {
      const res = await fetch(`${BASE_URL}/usuarios`);
      return await res.json();
    } catch (e) {
      console.error('api.usuariosApi.getAll:', e);
      return [];
    }
  },
  async getById(id: string): Promise<Usuario | null> {
    try {
      const res = await fetch(`${BASE_URL}/usuarios/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error('api.usuariosApi.getById:', e);
      return null;
    }
  },
  async getByUsuario(usuario: string): Promise<Usuario | null> {
    try {
      const res = await fetch(`${BASE_URL}/usuarios?usuario=${encodeURIComponent(usuario)}`);
      const lista: Usuario[] = await res.json();
      return lista[0] ?? null;
    } catch (e) {
      console.error('api.usuariosApi.getByUsuario:', e);
      return null;
    }
  },
  async create(data: Omit<Usuario, 'id' | 'fechaCreacion' | 'ultimaModificacion'>): Promise<Usuario> {
    const ahora = new Date().toISOString();
    const res = await fetch(`${BASE_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, fechaCreacion: ahora, ultimaModificacion: ahora }),
    });
    return await res.json();
  },
  async update(id: string, data: Partial<Usuario>): Promise<Usuario> {
    const res = await fetch(`${BASE_URL}/usuarios/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, ultimaModificacion: new Date().toISOString() }),
    });
    return await res.json();
  },
  async delete(id: string): Promise<void> {
    await fetch(`${BASE_URL}/usuarios/${id}`, { method: 'DELETE' });
  },
};

const usuariosSupabase = {
  async getAll(): Promise<Usuario[]> {
    const { data, error } = await supabase.from('usuarios').select(USUARIO_COLUMNAS_SEGURAS);
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as Usuario[];
  },
  async getById(id: string): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .select(USUARIO_COLUMNAS_SEGURAS)
      .eq('id', id)
      .single();
    if (error) return null;
    return data as unknown as Usuario;
  },
  // Único punto que lee passwordHash: lo necesita validateCredentials para comparar con bcrypt.
  // El resultado nunca debe devolverse tal cual a un componente/store.
  async getByUsuarioConHash(usuario: string): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('usuario', usuario)
      .single();
    if (error) return null;
    return data;
  },
  async getByUsuario(usuario: string): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .select(USUARIO_COLUMNAS_SEGURAS)
      .eq('usuario', usuario)
      .single();
    if (error) return null;
    return data as unknown as Usuario;
  },
  async create(data: Omit<Usuario, 'id' | 'fechaCreacion' | 'ultimaModificacion'>): Promise<Usuario> {
    const ahora = new Date().toISOString();
    const { data: creado, error } = await supabase
      .from('usuarios')
      .insert({ ...data, fechaCreacion: ahora, ultimaModificacion: ahora })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return creado;
  },
  async update(id: string, data: Partial<Usuario>): Promise<Usuario> {
    const { data: actualizado, error } = await supabase
      .from('usuarios')
      .update({ ...data, ultimaModificacion: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return actualizado;
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('usuarios').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};

export const usuariosApi = {
  async getAll(): Promise<Usuario[]> {
    return DATA_SOURCE === 'supabase' ? usuariosSupabase.getAll() : usuariosJsonServer.getAll();
  },

  async getById(id: string): Promise<Usuario | null> {
    return DATA_SOURCE === 'supabase' ? usuariosSupabase.getById(id) : usuariosJsonServer.getById(id);
  },

  async getByUsuario(usuario: string): Promise<Usuario | null> {
    return DATA_SOURCE === 'supabase'
      ? usuariosSupabase.getByUsuario(usuario)
      : usuariosJsonServer.getByUsuario(usuario);
  },

  async create(data: Omit<Usuario, 'id' | 'fechaCreacion' | 'ultimaModificacion'>): Promise<Usuario> {
    return DATA_SOURCE === 'supabase' ? usuariosSupabase.create(data) : usuariosJsonServer.create(data);
  },

  async update(id: string, data: Partial<Usuario>): Promise<Usuario> {
    return DATA_SOURCE === 'supabase' ? usuariosSupabase.update(id, data) : usuariosJsonServer.update(id, data);
  },

  async delete(id: string): Promise<void> {
    return DATA_SOURCE === 'supabase' ? usuariosSupabase.delete(id) : usuariosJsonServer.delete(id);
  },

  async validateCredentials(usuario: string, password: string): Promise<Omit<Usuario, 'passwordHash'> | null> {
    const encontrado =
      DATA_SOURCE === 'supabase'
        ? await usuariosSupabase.getByUsuarioConHash(usuario)
        : await usuariosJsonServer.getByUsuario(usuario);
    if (!encontrado) return null;
    const valido = await bcrypt.compare(password, encontrado.passwordHash);
    if (!valido) return null;
    const { passwordHash: _passwordHash, ...usuarioSeguro } = encontrado;
    return usuarioSeguro;
  },
};

// ─── Calificaciones ────────────────────────────────────────────────────────
// SUPABASE MIGRATION: cada método chequea DATA_SOURCE y delega en la implementación
// correspondiente. Las firmas no cambian. Ver ANTIGRAVITY.md sección "Migración Supabase".

const calificacionesJsonServer = {
  async getAll(): Promise<Calificacion[]> {
    try {
      const res = await fetch(`${BASE_URL}/calificaciones`);
      return await res.json();
    } catch (e) {
      console.error('api.calificacionesApi.getAll:', e);
      return [];
    }
  },
  async getByProveedor(proveedorId: string): Promise<Calificacion[]> {
    try {
      const res = await fetch(`${BASE_URL}/calificaciones?proveedorId=${proveedorId}`);
      return await res.json();
    } catch (e) {
      console.error('api.calificacionesApi.getByProveedor:', e);
      return [];
    }
  },
  async getByOrden(ordenId: string): Promise<Calificacion | null> {
    try {
      const res = await fetch(`${BASE_URL}/calificaciones?ordenId=${ordenId}`);
      const lista: Calificacion[] = await res.json();
      return lista[0] ?? null;
    } catch (e) {
      console.error('api.calificacionesApi.getByOrden:', e);
      return null;
    }
  },
  async create(data: Omit<Calificacion, 'id' | 'fechaCreacion'>): Promise<Calificacion> {
    const nueva: Calificacion = {
      ...data,
      id: crypto.randomUUID(),
      fechaCreacion: new Date().toISOString(),
    };
    const res = await fetch(`${BASE_URL}/calificaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nueva),
    });
    return await res.json();
  },
};

const calificacionesSupabase = {
  async getAll(): Promise<Calificacion[]> {
    const { data, error } = await supabase.from('calificaciones').select('*');
    if (error) throw new Error(error.message);
    return data ?? [];
  },
  async getByProveedor(proveedorId: string): Promise<Calificacion[]> {
    const { data, error } = await supabase
      .from('calificaciones')
      .select('*')
      .eq('proveedorId', proveedorId);
    if (error) throw new Error(error.message);
    return data ?? [];
  },
  async getByOrden(ordenId: string): Promise<Calificacion | null> {
    const { data, error } = await supabase
      .from('calificaciones')
      .select('*')
      .eq('ordenId', ordenId)
      .maybeSingle();
    if (error) return null;
    return data;
  },
  async create(data: Omit<Calificacion, 'id' | 'fechaCreacion'>): Promise<Calificacion> {
    const nueva = {
      ...data,
      id: crypto.randomUUID(),
      fechaCreacion: new Date().toISOString(),
    };
    const { data: creada, error } = await supabase.from('calificaciones').insert(nueva).select().single();
    if (error) throw new Error(error.message);
    return creada;
  },
};

export const calificacionesApi = {
  async getAll(): Promise<Calificacion[]> {
    return DATA_SOURCE === 'supabase' ? calificacionesSupabase.getAll() : calificacionesJsonServer.getAll();
  },

  async getByProveedor(proveedorId: string): Promise<Calificacion[]> {
    return DATA_SOURCE === 'supabase'
      ? calificacionesSupabase.getByProveedor(proveedorId)
      : calificacionesJsonServer.getByProveedor(proveedorId);
  },

  async getByOrden(ordenId: string): Promise<Calificacion | null> {
    return DATA_SOURCE === 'supabase'
      ? calificacionesSupabase.getByOrden(ordenId)
      : calificacionesJsonServer.getByOrden(ordenId);
  },

  async create(data: Omit<Calificacion, 'id' | 'fechaCreacion'>): Promise<Calificacion> {
    return DATA_SOURCE === 'supabase' ? calificacionesSupabase.create(data) : calificacionesJsonServer.create(data);
  },
};
