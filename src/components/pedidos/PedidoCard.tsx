import {
  IconPackage,
  IconTag,
  IconCalendar,
  IconAlertTriangle,
  IconSend,
  IconMessageCircle,
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
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ep-text-primary truncate">{pedido.titulo}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-xs text-ep-text-muted">{pedido.categoria}</span>
              <span className="text-xs text-ep-text-muted">·</span>
              <span
                className={`text-xs ${urgente ? 'text-ep-red font-medium' : 'text-ep-text-muted'}`}
              >
                {urgente && <IconAlertTriangle size={11} className="inline mr-0.5 -mt-px" />}
                {formatFecha(pedido.fechaLimite)}
              </span>
              <span className="text-xs text-ep-text-muted">·</span>
              <span className="text-xs text-ep-text-muted font-mono">
                <IconMessageCircle size={11} className="inline mr-0.5 -mt-px" />
                {pedido.cotizacionesRecibidas}
              </span>
            </div>
          </div>
          <Badge color={estadoAColor(pedido.estado)}>{estadoALabel(pedido.estado)}</Badge>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-ep-text-primary">{pedido.titulo}</p>
        <Badge color={estadoAColor(pedido.estado)}>{estadoALabel(pedido.estado)}</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-2">
        <span className="flex items-center gap-1.5 text-xs text-ep-text-secondary">
          <IconPackage size={13} stroke={1.75} />
          {pedido.cantidad} {pedido.unidad}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-ep-text-secondary">
          <IconTag size={13} stroke={1.75} />
          {pedido.categoria}
        </span>
        <span
          className={`flex items-center gap-1.5 text-xs ${urgente ? 'text-ep-red font-medium' : 'text-ep-text-secondary'}`}
        >
          {urgente ? <IconAlertTriangle size={13} stroke={1.75} /> : <IconCalendar size={13} stroke={1.75} />}
          {formatFecha(pedido.fechaLimite)}
          {urgente && ` · ${dias}d`}
        </span>
      </div>

      <p className="text-sm text-ep-text-secondary mt-2.5 leading-relaxed line-clamp-2">
        {pedido.descripcion}
      </p>

      {pedido.presupuestoMax != null && (
        <p className="text-xs text-ep-text-secondary mt-2">
          Presupuesto máx:{' '}
          <span className="font-semibold font-mono text-ep-text-primary">
            {formatARS(pedido.presupuestoMax)}
          </span>
        </p>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-ep-border">
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
