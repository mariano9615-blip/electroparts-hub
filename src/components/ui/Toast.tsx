import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconShoppingCart, IconX } from '@tabler/icons-react';

interface ToastProps {
  id: string;
  categoria: string;
  presupuestoMax?: number;
  onClose: (id: string) => void;
}

const DURACION_MS = 6000;

export function Toast({ id, categoria, presupuestoMax, onClose }: ToastProps) {
  const navigate = useNavigate();
  const [entrado, setEntrado] = useState(false);
  const [progreso, setProgreso] = useState('100%');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      setEntrado(true);
      // Pequeño delay para que el navegador registre el estado inicial antes de la transición
      setTimeout(() => setProgreso('0%'), 50);
    });

    timerRef.current = setTimeout(() => onClose(id), DURACION_MS);

    return () => {
      cancelAnimationFrame(rafId);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [id, onClose]);

  const subtitulo = presupuestoMax
    ? `${categoria} — $${presupuestoMax.toLocaleString('es-AR')}`
    : categoria;

  return (
    <div
      className={`relative bg-ep-surface border-l-4 border-ep-blue shadow-lg rounded-lg w-80 overflow-hidden transition-transform duration-300 ease-out ${
        entrado ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-ep-blue flex-shrink-0">
            <IconShoppingCart size={20} stroke={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ep-text-primary">Nuevo pedido disponible</p>
            <p className="text-xs text-ep-text-secondary mt-0.5 truncate">{subtitulo}</p>
          </div>
          <button
            onClick={() => onClose(id)}
            className="text-ep-text-muted hover:text-ep-text-secondary transition-colors flex-shrink-0"
          >
            <IconX size={16} stroke={2} />
          </button>
        </div>
        <button
          onClick={() => {
            navigate('/proveedor/pedidos');
            onClose(id);
          }}
          className="mt-3 w-full text-xs font-medium bg-ep-blue text-white rounded py-1.5 hover:bg-ep-blue-dark transition-colors"
        >
          Ver pedido
        </button>
      </div>
      {/* Barra de progreso animada: CSS transition de 100% → 0% en 6 segundos */}
      <div
        className="absolute bottom-0 left-0 h-1 bg-ep-blue"
        style={{ width: progreso, transition: `width ${DURACION_MS}ms linear` }}
      />
    </div>
  );
}
