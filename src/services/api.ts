import type { Pedido, Cotizacion, Orden } from '../types';

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

export async function getPedidos(): Promise<Pedido[]> {
  try {
    const res = await fetch(`${BASE_URL}/pedidos`);
    return await res.json();
  } catch (e) {
    console.error('api.getPedidos:', e);
    return [];
  }
}

export async function getPedidoById(id: string): Promise<Pedido | null> {
  try {
    const res = await fetch(`${BASE_URL}/pedidos/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('api.getPedidoById:', e);
    return null;
  }
}

export async function updatePedido(id: string, data: Partial<Pedido>): Promise<Pedido | null> {
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
}

export async function createPedido(data: Pedido): Promise<Pedido | null> {
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
}

// ─── Cotizaciones ────────────────────────────────────────────────────────────

export async function getCotizaciones(): Promise<Cotizacion[]> {
  try {
    const res = await fetch(`${BASE_URL}/cotizaciones`);
    return await res.json();
  } catch (e) {
    console.error('api.getCotizaciones:', e);
    return [];
  }
}

export async function getCotizacionesByPedidoId(pedidoId: string): Promise<Cotizacion[]> {
  try {
    const res = await fetch(`${BASE_URL}/cotizaciones?pedidoId=${pedidoId}`);
    return await res.json();
  } catch (e) {
    console.error('api.getCotizacionesByPedidoId:', e);
    return [];
  }
}

export async function updateCotizacion(
  id: string,
  data: Partial<Cotizacion>,
): Promise<Cotizacion | null> {
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
}

export async function createCotizacion(data: Cotizacion): Promise<Cotizacion | null> {
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
}

// ─── Ordenes ─────────────────────────────────────────────────────────────────

export async function getOrdenes(): Promise<Orden[]> {
  try {
    const res = await fetch(`${BASE_URL}/ordenes`);
    return await res.json();
  } catch (e) {
    console.error('api.getOrdenes:', e);
    return [];
  }
}

export async function createOrden(data: Orden): Promise<Orden | null> {
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
}

export async function updateOrden(id: string, data: Partial<Orden>): Promise<Orden | null> {
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
}

// ─── Notificaciones ──────────────────────────────────────────────────────────

export async function getNotificaciones(): Promise<NotificacionPayload[]> {
  try {
    const res = await fetch(`${BASE_URL}/notificaciones`);
    return await res.json();
  } catch (e) {
    console.error('api.getNotificaciones:', e);
    return [];
  }
}

export async function createNotificacion(
  data: NotificacionPayload,
): Promise<NotificacionPayload | null> {
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
}

export async function updateNotificacion(
  id: string,
  data: Partial<NotificacionPayload>,
): Promise<NotificacionPayload | null> {
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
}

export async function deleteNotificacion(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/notificaciones/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (e) {
    console.error('api.deleteNotificacion:', e);
    return false;
  }
}
