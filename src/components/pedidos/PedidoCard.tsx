import {
  IconPackage,
  IconTag,
  IconCalendar,
  IconAlertTriangle,
  IconSend,
} from '@tabler/icons-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatARS, formatFecha, diasHasta } from '../../utils/formatters';
import type { Pedido } from '../../types';

interface PedidoCardProps {
  pedido: Pedido;
  compacto?: boolean;
  onCotizar?: () => void;
}

type BadgeColor = 'green' | 'blue' | 'amber' | 'red' | 'gray';

function estadoAColor(estado: string): BadgeColor {
  const map: Record<string, BadgeColor> = {
    abierto: 'green',
    en_cotizacion: 'blue',
    adjudicado: 'gray',
    cancelado: 'red',
  };
  return map[estado] ?? 'gray';
}

function estadoALabel(estado: string): string {
  const map: Record<string, string> = {
    abierto: 'Abierto',
    en_cotizacion: 'En cotización',
    adjudicado: 'Adjudicado',
    cancelado: 'Cancelado',
  };
  return map[estado] ?? estado;
}

export const PedidoCard = ({ pedido, compacto = false, onCotizar }: PedidoCardProps) => {
  const dias = diasHasta(pedido.fechaLimite);
  const urgente = dias < 3;

  if (compacto) {
    return (
      <Card padding="sm">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-ep-text-primary truncate">{pedido.titulo}</p>
          <Badge color={estadoAColor(pedido.estado)}>{estadoALabel(pedido.estado)}</Badge>
        </div>
        <div className="flex items-center gap-4 mt-1">
          <span className="text-xs text-ep-text-muted">{pedido.categoria}</span>
          <span className="text-xs text-ep-text-muted">{formatFecha(pedido.fechaLimite)}</span>
        </div>
        <p className="text-xs text-ep-text-muted mt-1">
          {pedido.cotizacionesRecibidas} cotizaciones
        </p>
      </Card>
    );
  }

  return (
    <Card padding="md">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-ep-text-primary">{pedido.titulo}</p>
        <Badge color={estadoAColor(pedido.estado)}>{estadoALabel(pedido.estado)}</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-1">
        <span className="flex items-center gap-1 text-xs text-ep-text-muted">
          <IconPackage size={13} />
          {pedido.cantidad} {pedido.unidad}
        </span>
        <span className="flex items-center gap-1 text-xs text-ep-text-muted">
          <IconTag size={13} />
          {pedido.categoria}
        </span>
        <span
          className={`flex items-center gap-1 text-xs ${urgente ? 'text-ep-red font-medium' : 'text-ep-text-muted'}`}
        >
          {urgente ? <IconAlertTriangle size={13} /> : <IconCalendar size={13} />}
          {formatFecha(pedido.fechaLimite)}
          {urgente && ` · ${dias}d`}
        </span>
      </div>

      <p className="text-sm text-ep-text-secondary mt-2 line-clamp-2">{pedido.descripcion}</p>

      {pedido.presupuestoMax != null && (
        <p className="text-xs text-ep-text-secondary mt-1">
          Presupuesto máx:{' '}
          <span className="font-medium font-mono">{formatARS(pedido.presupuestoMax)}</span>
        </p>
      )}

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-ep-text-muted">
          {pedido.cotizacionesRecibidas} cotizaciones recibidas
        </span>
        {onCotizar && (
          <Button variant="primary" size="sm" onClick={onCotizar}>
            <IconSend size={14} />
            Cotizar
          </Button>
        )}
      </div>
    </Card>
  );
};
