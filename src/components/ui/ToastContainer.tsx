import { useEffect, useState } from 'react';
import { Toast } from './Toast';
import type { Pedido } from '../../types';

interface ToastData {
  id: string;
  categoria: string;
  presupuestoMax?: number;
}

const MAX_TOASTS = 3;

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const pedido = (e as CustomEvent<Pedido>).detail;
      setToasts((prev) => {
        if (prev.length >= MAX_TOASTS) return prev;
        // Evitar duplicados si el mismo pedido dispara el evento más de una vez
        if (prev.some((t) => t.id === pedido.id)) return prev;
        return [
          ...prev,
          {
            id: pedido.id,
            categoria: pedido.categoria,
            presupuestoMax: pedido.presupuestoMax,
          },
        ];
      });
    };

    window.addEventListener('nuevo-pedido-toast', handler);
    return () => window.removeEventListener('nuevo-pedido-toast', handler);
  }, []);

  const handleClose = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          categoria={toast.categoria}
          presupuestoMax={toast.presupuestoMax}
          onClose={handleClose}
        />
      ))}
    </div>
  );
}
