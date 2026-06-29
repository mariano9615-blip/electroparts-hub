import { create } from 'zustand';
import type { Pedido, EstadoPedido } from '../types';
import { STORAGE_KEY_PEDIDOS } from '../utils/constants';
import { PEDIDOS_INICIALES } from '../data/mockData';
import { useNotificacionesStore } from './useNotificacionesStore';

interface PedidosState {
  pedidos: Pedido[];
  agregarPedido: (pedido: Pedido) => void;
  actualizarEstadoPedido: (id: string, estado: EstadoPedido) => void;
  incrementarCotizaciones: (pedidoId: string) => void;
}

const leerPedidos = (): Pedido[] => {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY_PEDIDOS);
    if (guardado) {
      const parsed = JSON.parse(guardado);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return PEDIDOS_INICIALES;
};

const persistir = (pedidos: Pedido[]) => {
  localStorage.setItem(STORAGE_KEY_PEDIDOS, JSON.stringify(pedidos));
};

export const usePedidosStore = create<PedidosState>((set, get) => ({
  pedidos: leerPedidos(),

  agregarPedido: (pedido) => {
    const pedidos = [...get().pedidos, pedido];
    persistir(pedidos);
    set({ pedidos });
    useNotificacionesStore.getState().agregarNotificacion({
      tipo: 'nueva_orden',
      rolDestino: 'proveedor',
      titulo: 'Nuevo pedido disponible',
      mensaje: pedido.titulo,
      entidadId: pedido.id,
    });
  },

  actualizarEstadoPedido: (id, estado) => {
    const pedidos = get().pedidos.map((p) => (p.id === id ? { ...p, estado } : p));
    persistir(pedidos);
    set({ pedidos });
  },

  incrementarCotizaciones: (pedidoId) => {
    const pedidos = get().pedidos.map((p) => {
      if (p.id !== pedidoId) return p;
      const nuevasCotizaciones = p.cotizacionesRecibidas + 1;
      const nuevoEstado: EstadoPedido =
        p.cotizacionesRecibidas === 0 ? 'en_cotizacion' : p.estado;
      return { ...p, cotizacionesRecibidas: nuevasCotizaciones, estado: nuevoEstado };
    });
    persistir(pedidos);
    set({ pedidos });
  },
}));
