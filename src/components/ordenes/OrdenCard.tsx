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
    <div className="flex items-center justify-between gap-2">
      <span className="font-mono text-sm text-ep-text-muted">
        Orden #{orden.id.slice(-6).toUpperCase()}
      </span>
      <Badge color={estadoAColor(orden.estado)}>{estadoALabel(orden.estado)}</Badge>
    </div>

    <div className="flex items-center gap-1.5 mt-2">
      <IconBuilding size={15} className="text-ep-text-muted flex-shrink-0" />
      <span className="text-sm font-medium text-ep-text-primary">{orden.proveedorNombre}</span>
    </div>

    <p className="text-lg font-bold font-mono text-ep-text-primary mt-2">
      {formatARS(orden.monto)}
    </p>

    <p className="text-xs text-ep-text-muted mt-1">{formatFecha(orden.fechaConfirmacion)}</p>

    {onIrChat && (
      <div className="mt-3">
        <Button variant="secondary" size="sm" onClick={onIrChat}>
          <IconMessage size={14} />
          Ir al chat
        </Button>
      </div>
    )}
  </Card>
);
