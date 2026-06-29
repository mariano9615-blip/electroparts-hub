import { create } from 'zustand';
import type { Cotizacion, Orden } from '../types';
import { STORAGE_KEY_COTIZACIONES, COMPRADOR_ID } from '../utils/constants';
import { COTIZACIONES_INICIALES } from '../data/mockData';
import { useOrdenesStore } from './useOrdenesStore';
import { usePedidosStore } from './usePedidosStore';
import { useNotificacionesStore } from './useNotificacionesStore';

interface CotizacionesState {
  cotizaciones: Cotizacion[];
  agregarCotizacion: (cotizacion: Cotizacion) => void;
  aceptarCotizacion: (cotizacionId: string) => void;
  rechazarCotizacion: (cotizacionId: string) => void;
}

const leerCotizaciones = (): Cotizacion[] => {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY_COTIZACIONES);
    if (guardado) {
      const parsed = JSON.parse(guardado);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return COTIZACIONES_INICIALES;
};

const persistir = (cotizaciones: Cotizacion[]) => {
  localStorage.setItem(STORAGE_KEY_COTIZACIONES, JSON.stringify(cotizaciones));
};

export const useCotizacionesStore = create<CotizacionesState>((set, get) => ({
  cotizaciones: leerCotizaciones(),

  agregarCotizacion: (cotizacion) => {
    const cotizaciones = [...get().cotizaciones, cotizacion];
    persistir(cotizaciones);
    set({ cotizaciones });
    useNotificacionesStore.getState().agregarNotificacion({
      tipo: 'nueva_cotizacion',
      rolDestino: 'comprador',
      titulo: 'Nueva cotización recibida',
      mensaje: `${cotizacion.proveedorNombre} cotizó $${cotizacion.precio} para tu pedido`,
    });
  },

  aceptarCotizacion: (cotizacionId) => {
    const todas = get().cotizaciones;
    const cotizacion = todas.find((c) => c.id === cotizacionId);
    if (!cotizacion) return;

    const cotizaciones = todas.map((c) => {
      if (c.id === cotizacionId) return { ...c, estado: 'aceptada' as const };
      if (c.pedidoId === cotizacion.pedidoId) return { ...c, estado: 'rechazada' as const };
      return c;
    });

    const orden: Orden = {
      id: crypto.randomUUID(),
      pedidoId: cotizacion.pedidoId,
      cotizacionId: cotizacion.id,
      compradorId: COMPRADOR_ID,
      proveedorId: cotizacion.proveedorId,
      proveedorNombre: cotizacion.proveedorNombre,
      monto: cotizacion.precio,
      estado: 'confirmada',
      fechaConfirmacion: new Date().toISOString(),
      chatHabilitado: true,
    };

    useOrdenesStore.getState().agregarOrden(orden);
    usePedidosStore.getState().actualizarEstadoPedido(cotizacion.pedidoId, 'adjudicado');

    persistir(cotizaciones);
    set({ cotizaciones });

    useNotificacionesStore.getState().agregarNotificacion({
      tipo: 'orden_confirmada',
      rolDestino: 'comprador',
      titulo: 'Orden confirmada',
      mensaje: `Tu orden con ${cotizacion.proveedorNombre} ha sido confirmada`,
      entidadId: orden.id,
    });
    useNotificacionesStore.getState().agregarNotificacion({
      tipo: 'cotizacion_aceptada',
      rolDestino: 'proveedor',
      titulo: 'Cotización aceptada',
      mensaje: `Tu cotización fue aceptada. Prepará el envío`,
      entidadId: cotizacion.id,
    });
  },

  rechazarCotizacion: (cotizacionId) => {
    const cotizaciones = get().cotizaciones.map((c) =>
      c.id === cotizacionId ? { ...c, estado: 'rechazada' as const } : c,
    );
    persistir(cotizaciones);
    set({ cotizaciones });
  },
}));
