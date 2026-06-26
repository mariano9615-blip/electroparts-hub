import { useEffect, useState } from 'react';
import type { Cotizacion } from '../types';
import { PROVEEDORES_SIMULADOS } from '../utils/constants';
import { useCotizacionesStore } from '../store/useCotizacionesStore';
import { usePedidosStore } from '../store/usePedidosStore';

const TIEMPOS_ENTREGA = [
  '2 días hábiles',
  '3 días hábiles',
  '5 días hábiles',
  '7 días hábiles',
] as const;

const NOTAS_POR_PROVEEDOR: Record<string, string> = {
  'prov-1': 'Stock disponible. Precio incluye IVA. Entrega en puerta.',
  'prov-2': 'Precio sin IVA. Flete a coordinar según destino.',
  'prov-3': 'Producto importado. Consultar disponibilidad de factura.',
  'prov-4': 'Garantía del fabricante. Factura A disponible.',
};

const DELAYS_MS = [5000, 12000, 22000, 35000];

function precioAleatorio(presupuestoMax?: number): number {
  const base = presupuestoMax ?? 165000;
  const min = base * 0.8;
  const max = base * 1.2;
  return Math.round(min + Math.random() * (max - min));
}

export function useSimuladorCotizaciones(
  pedidoId: string | null,
  presupuestoMax?: number,
): { simulando: boolean } {
  const [simulando, setSimulando] = useState(false);

  useEffect(() => {
    if (!pedidoId) return;

    setSimulando(true);
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    PROVEEDORES_SIMULADOS.forEach((prov, index) => {
      const timeout = setTimeout(() => {
        const cotizacion: Cotizacion = {
          id: crypto.randomUUID(),
          pedidoId,
          proveedorId: prov.id,
          proveedorNombre: prov.nombre,
          calificacionProveedor: prov.calificacion,
          precio: precioAleatorio(presupuestoMax),
          tiempoEntrega: TIEMPOS_ENTREGA[Math.floor(Math.random() * TIEMPOS_ENTREGA.length)],
          notas: NOTAS_POR_PROVEEDOR[prov.id],
          estado: 'pendiente',
          fechaCreacion: new Date().toISOString(),
        };

        useCotizacionesStore.getState().agregarCotizacion(cotizacion);
        usePedidosStore.getState().incrementarCotizaciones(pedidoId);

        if (index === PROVEEDORES_SIMULADOS.length - 1) {
          setSimulando(false);
        }
      }, DELAYS_MS[index]);

      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(clearTimeout);
      setSimulando(false);
    };
  }, [pedidoId]);

  return { simulando };
}
