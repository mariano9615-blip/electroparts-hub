import { useEffect, useState } from 'react';
import { Toast } from './Toast';
import type { ToastPayload } from './Toast';
import { playNotificationSound } from '../../utils/sounds';

const MAX_TOASTS = 4;

// Mapeo de nombres de evento → tipo de toast + sonido
const EVENTOS: {
  nombre: string;
  tipo: ToastPayload['tipo'];
  sonido: 'pedido' | 'cotizacion' | 'mensaje' | null;
}[] = [
  { nombre: 'nuevo-pedido-toast', tipo: 'pedido_nuevo', sonido: 'cotizacion' },
  { nombre: 'nueva-cotizacion-toast', tipo: 'cotizacion_nueva', sonido: 'cotizacion' },
  { nombre: 'cotizacion-adjudicada-toast', tipo: 'cotizacion_adjudicada', sonido: 'pedido' },
  { nombre: 'cotizacion-rechazada-toast', tipo: 'cotizacion_rechazada', sonido: 'mensaje' },
  { nombre: 'cotizacion-negociacion-toast', tipo: 'cotizacion_negociacion', sonido: 'cotizacion' },
  { nombre: 'mensaje-nuevo-toast', tipo: 'mensaje_nuevo', sonido: 'mensaje' },
  { nombre: 'estado-pedido-toast', tipo: 'estado_cambio', sonido: null },
  { nombre: 'calificacion-enviada-toast', tipo: 'estado_cambio', sonido: null },
];

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastPayload[]>([]);

  useEffect(() => {
    const handlers = EVENTOS.map(({ nombre, tipo, sonido }) => {
      const handler = (e: Event) => {
        const detail = (e as CustomEvent).detail as ToastPayload;
        if (!detail) return;

        setToasts((prev) => {
          if (prev.length >= MAX_TOASTS) return prev;
          if (prev.some((t) => t.id === detail.id)) return prev;
          return [...prev, { ...detail, tipo }];
        });

        if (sonido) playNotificationSound(sonido);
      };
      window.addEventListener(nombre, handler);
      return { nombre, handler };
    });

    return () => {
      handlers.forEach(({ nombre, handler }) =>
        window.removeEventListener(nombre, handler),
      );
    };
  }, []);

  const handleClose = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={handleClose} />
      ))}
    </div>
  );
}
