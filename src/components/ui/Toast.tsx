import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconShoppingCart,
  IconFileInvoice,
  IconTrophy,
  IconX,
  IconMessage,
  IconAlertCircle,
  IconClock,
  IconInfoCircle,
} from '@tabler/icons-react';

export type ToastTipo =
  | 'pedido_nuevo'
  | 'cotizacion_nueva'
  | 'cotizacion_adjudicada'
  | 'cotizacion_rechazada'
  | 'cotizacion_negociacion'
  | 'mensaje_nuevo'
  | 'estado_cambio';

export interface ToastPayload {
  id: string;
  tipo: ToastTipo;
  titulo: string;
  subtitulo?: string;
  navegarA?: string;
}

interface ToastProps extends ToastPayload {
  onClose: (id: string) => void;
}

const CONFIG: Record<
  ToastTipo,
  {
    bordColor: string;
    barColor: string;
    icono: React.ComponentType<{ size?: number; stroke?: number }>;
    iconoColor: string;
    duracionMs: number;
  }
> = {
  pedido_nuevo: {
    bordColor: 'border-ep-blue',
    barColor: 'bg-ep-blue',
    icono: IconShoppingCart,
    iconoColor: 'text-ep-blue',
    duracionMs: 6000,
  },
  cotizacion_nueva: {
    bordColor: 'border-ep-green',
    barColor: 'bg-ep-green',
    icono: IconFileInvoice,
    iconoColor: 'text-ep-green',
    duracionMs: 5000,
  },
  cotizacion_adjudicada: {
    bordColor: 'border-ep-green',
    barColor: 'bg-ep-green',
    icono: IconTrophy,
    iconoColor: 'text-ep-green',
    duracionMs: 8000,
  },
  cotizacion_rechazada: {
    bordColor: 'border-ep-red',
    barColor: 'bg-ep-red',
    icono: IconAlertCircle,
    iconoColor: 'text-ep-red',
    duracionMs: 5000,
  },
  cotizacion_negociacion: {
    bordColor: 'border-ep-amber',
    barColor: 'bg-ep-amber',
    icono: IconClock,
    iconoColor: 'text-ep-amber',
    duracionMs: 6000,
  },
  mensaje_nuevo: {
    bordColor: 'border-ep-blue',
    barColor: 'bg-ep-blue',
    icono: IconMessage,
    iconoColor: 'text-ep-blue',
    duracionMs: 5000,
  },
  estado_cambio: {
    bordColor: 'border-ep-border-strong',
    barColor: 'bg-ep-text-muted',
    icono: IconInfoCircle,
    iconoColor: 'text-ep-text-muted',
    duracionMs: 4000,
  },
};

export function Toast({ id, tipo, titulo, subtitulo, navegarA, onClose }: ToastProps) {
  const navigate = useNavigate();
  const [entrado, setEntrado] = useState(false);
  const [progreso, setProgreso] = useState('100%');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cfg = CONFIG[tipo];

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      setEntrado(true);
      setTimeout(() => setProgreso('0%'), 50);
    });
    timerRef.current = setTimeout(() => onClose(id), cfg.duracionMs);
    return () => {
      cancelAnimationFrame(rafId);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [id, onClose, cfg.duracionMs]);

  const Icono = cfg.icono;

  return (
    <div
      className={`relative bg-ep-surface border-l-4 ${cfg.bordColor} shadow-lg rounded-lg w-80 overflow-hidden transition-transform duration-300 ease-out ${
        entrado ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex-shrink-0 ${cfg.iconoColor}`}>
            <Icono size={tipo === 'cotizacion_adjudicada' ? 22 : 18} stroke={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-semibold text-ep-text-primary ${
                tipo === 'cotizacion_adjudicada' ? 'text-base' : ''
              }`}
            >
              {titulo}
            </p>
            {subtitulo && (
              <p className="text-xs text-ep-text-secondary mt-0.5 truncate">{subtitulo}</p>
            )}
          </div>
          <button
            onClick={() => onClose(id)}
            className="text-ep-text-muted hover:text-ep-text-secondary transition-colors flex-shrink-0"
          >
            <IconX size={15} stroke={2} />
          </button>
        </div>

        {navegarA && (
          <button
            onClick={() => {
              navigate(navegarA);
              onClose(id);
            }}
            className={`mt-3 w-full text-xs font-medium rounded py-1.5 transition-colors ${
              tipo === 'cotizacion_adjudicada'
                ? 'bg-ep-green text-white hover:bg-ep-green-dark'
                : 'bg-ep-blue text-white hover:bg-ep-blue-dark'
            }`}
          >
            {tipo === 'cotizacion_adjudicada' ? 'Ver detalle' : 'Ver'}
          </button>
        )}
      </div>

      <div
        className={`absolute bottom-0 left-0 h-1 ${cfg.barColor}`}
        style={{ width: progreso, transition: `width ${cfg.duracionMs}ms linear` }}
      />
    </div>
  );
}
