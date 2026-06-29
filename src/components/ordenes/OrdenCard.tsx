import { IconBuilding, IconMessage } from '@tabler/icons-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatARS, formatFecha } from '../../utils/formatters';
import type { Orden } from '../../types';

interface OrdenCardProps {
  orden: Orden;
  onIrChat?: () => void;
}

type BadgeColor = 'green' | 'blue' | 'amber' | 'red' | 'gray';

function estadoAColor(estado: string): BadgeColor {
  const map: Record<string, BadgeColor> = {
    confirmada: 'blue',
    en_transito: 'amber',
    entregada: 'green',
    disputada: 'red',
  };
  return map[estado] ?? 'gray';
}

function estadoALabel(estado: string): string {
  const map: Record<string, string> = {
    confirmada: 'Confirmada',
    en_transito: 'En tránsito',
    entregada: 'Entregada',
    disputada: 'Disputada',
  };
  return map[estado] ?? estado;
}

export const OrdenCard = ({ orden, onIrChat }: OrdenCardProps) => (
  <Card padding="md">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-mono text-ep-text-muted uppercase tracking-wider mb-1">
          Orden #{orden.id.slice(-6).toUpperCase()}
        </p>
        <div className="flex items-center gap-1.5">
          <IconBuilding size={14} stroke={1.75} className="text-ep-text-muted flex-shrink-0" />
          <span className="text-sm font-semibold text-ep-text-primary">{orden.proveedorNombre}</span>
        </div>
      </div>
      <Badge color={estadoAColor(orden.estado)}>{estadoALabel(orden.estado)}</Badge>
    </div>

    <div className="flex items-center justify-between mt-3 pt-3 border-t border-ep-border">
      <div>
        <p className="text-xl font-bold font-mono text-ep-text-primary leading-none">
          {formatARS(orden.monto)}
        </p>
        <p className="text-xs text-ep-text-muted mt-1">{formatFecha(orden.fechaConfirmacion)}</p>
      </div>
      {onIrChat && (
        <Button variant="secondary" size="sm" onClick={onIrChat}>
          <IconMessage size={14} />
          Ir al chat
        </Button>
      )}
    </div>
  </Card>
);
