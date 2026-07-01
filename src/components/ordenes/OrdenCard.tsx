import { useState } from 'react';
import { IconBuilding, IconMessage, IconChevronDown, IconChevronUp, IconTruck } from '@tabler/icons-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { OrdenStepper } from './OrdenStepper';
import {
  formatARS,
  formatFecha,
  getLabelEstadoOrden,
  getLabelEstadoPago,
} from '../../utils/formatters';
import type { Orden, Rol } from '../../types';

export interface OrdenCardAccion {
  label: string;
  onClick: () => void;
  variante?: 'primary' | 'secondary' | 'danger';
}

interface OrdenCardProps {
  orden: Orden;
  rol: Rol;
  pedidoTitulo?: string;
  nombreContraparteLabel?: string;
  onIrChat?: () => void;
  acciones?: OrdenCardAccion[];
}

type BadgeColor = 'green' | 'blue' | 'amber' | 'red' | 'gray';

function estadoAColor(estado: string): BadgeColor {
  const map: Record<string, BadgeColor> = {
    confirmada:     'blue',
    en_preparacion: 'amber',
    enviado:        'blue',
    entregado:      'green',
    cerrado:        'gray',
    disputada:      'red',
    // legacy
    en_transito:    'amber',
    entregada:      'green',
  };
  return map[estado] ?? 'gray';
}

function pagoAColor(estado: string): BadgeColor {
  const map: Record<string, BadgeColor> = {
    pendiente:  'gray',
    en_proceso: 'amber',
    confirmado: 'green',
  };
  return map[estado] ?? 'gray';
}

export function OrdenCard({
  orden,
  rol,
  pedidoTitulo,
  nombreContraparteLabel,
  onIrChat,
  acciones = [],
}: OrdenCardProps) {
  const [expandido, setExpandido] = useState(false);
  const estadoPago = orden.estadoPago ?? 'pendiente';
  const labelEstado = getLabelEstadoOrden(orden.estado, rol);
  const labelPago = getLabelEstadoPago(estadoPago);

  return (
    <Card padding="md">
      {/* Fila superior: ID + contraparte + badge estado */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-mono text-ep-text-muted uppercase tracking-wider mb-0.5">
            Orden #{orden.id.slice(-6).toUpperCase()}
          </p>
          {pedidoTitulo ? (
            <p className="text-sm font-semibold text-ep-text-primary truncate">{pedidoTitulo}</p>
          ) : null}
          <div className="flex items-center gap-1.5 mt-0.5">
            <IconBuilding size={13} stroke={1.75} className="text-ep-text-muted flex-shrink-0" />
            <span className="text-xs text-ep-text-secondary">
              {nombreContraparteLabel ?? orden.proveedorNombre}
            </span>
          </div>
        </div>
        <Badge color={estadoAColor(orden.estado)}>{labelEstado}</Badge>
      </div>

      {/* Fila de metadatos */}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <Badge color={pagoAColor(estadoPago)}>{labelPago}</Badge>
        <span className="text-[11px] text-ep-text-muted">
          Confirmada el {formatFecha(orden.fechaConfirmacion)}
        </span>
      </div>

      {/* N° seguimiento si está enviado */}
      {orden.numeroSeguimiento && (orden.estado === 'enviado' || orden.estado === 'en_preparacion' || orden.estado === 'entregado' || orden.estado === 'cerrado') && (
        <div className="flex items-center gap-1.5 mt-2">
          <IconTruck size={13} stroke={1.75} className="text-ep-text-muted flex-shrink-0" />
          <span className="text-[11px] text-ep-text-muted">
            N° de seguimiento / remito:{' '}
            <span className="font-mono text-ep-text-primary">{orden.numeroSeguimiento}</span>
          </span>
        </div>
      )}

      {/* Banner orden cerrada */}
      {orden.estado === 'cerrado' && (
        <div className="mt-3 bg-ep-green-light border border-ep-green rounded-lg px-3 py-2 flex items-center justify-between gap-3">
          <p className="text-xs text-ep-green-dark font-medium">
            Orden completada.{rol === 'comprador' ? ' ¡Podés calificar al proveedor!' : ''}
          </p>
          {rol === 'comprador' && (
            <span
              className="text-xs text-ep-green-dark/60 cursor-not-allowed"
              title="Próximamente — Etapa 5b"
            >
              Calificar (próximamente)
            </span>
          )}
        </div>
      )}

      {/* Acciones + Chat + Ver detalles */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-ep-border gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-1 font-bold text-ep-text-primary font-mono leading-none">
          {formatARS(orden.monto)}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {acciones.map((acc, i) => (
            <Button
              key={i}
              variant={acc.variante ?? 'primary'}
              size="sm"
              onClick={acc.onClick}
            >
              {acc.label}
            </Button>
          ))}
          {onIrChat && (
            <Button variant="secondary" size="sm" onClick={onIrChat}>
              <IconMessage size={14} />
              Chat
            </Button>
          )}
          <button
            onClick={() => setExpandido((v) => !v)}
            className="flex items-center gap-1 text-xs text-ep-text-muted hover:text-ep-text-primary transition-colors duration-150"
          >
            {expandido ? (
              <>
                <IconChevronUp size={14} /> Ocultar
              </>
            ) : (
              <>
                <IconChevronDown size={14} /> Ver detalles
              </>
            )}
          </button>
        </div>
      </div>

      {/* Panel expandible */}
      {expandido && (
        <div className="mt-4 pt-4 border-t border-ep-border space-y-3">
          {/* Stepper */}
          <div>
            <p className="text-[10px] font-bold text-ep-text-muted uppercase tracking-widest mb-2">
              Estado de la orden
            </p>
            <OrdenStepper estado={orden.estado} rol={rol} nombreProveedor={orden.proveedorNombre} />
          </div>

          {/* Estado del pago */}
          <div className="bg-ep-surface-raised rounded-lg p-3">
            <p className="text-[10px] font-bold text-ep-text-muted uppercase tracking-widest mb-2">
              Estado del pago
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge color={pagoAColor(estadoPago)}>{labelPago}</Badge>
              {orden.comprobantePago && (
                <span className="text-xs text-ep-text-secondary">
                  Ref:{' '}
                  <span className="font-mono text-ep-text-primary">{orden.comprobantePago}</span>
                </span>
              )}
            </div>
            {orden.numeroSeguimiento && (
              <p className="text-xs text-ep-text-secondary mt-2">
                N° de seguimiento / remito:{' '}
                <span className="font-mono text-ep-text-primary">{orden.numeroSeguimiento}</span>
              </p>
            )}
            {orden.fechaEnvio && (
              <p className="text-xs text-ep-text-muted mt-1">
                Enviado el {formatFecha(orden.fechaEnvio)}
              </p>
            )}
            {orden.fechaEntrega && (
              <p className="text-xs text-ep-text-muted mt-1">
                Entregado el {formatFecha(orden.fechaEntrega)}
              </p>
            )}
            {orden.fechaPagoConfirmado && (
              <p className="text-xs text-ep-text-muted mt-1">
                Pago confirmado el {formatFecha(orden.fechaPagoConfirmado)}
              </p>
            )}
          </div>

          {/* Observación disputa si aplica */}
          {orden.observacionDisputa && (
            <div className="bg-ep-red-light border border-ep-red rounded-lg px-3 py-2">
              <p className="text-[10px] font-bold text-ep-red-dark uppercase tracking-widest mb-1">
                Motivo de disputa
              </p>
              <p className="text-xs text-ep-red-dark leading-relaxed">{orden.observacionDisputa}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
