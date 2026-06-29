import { IconAlertTriangle } from '@tabler/icons-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatFecha, diasHasta } from '../../utils/formatters';
import type { Pedido } from '../../types';

interface PedidosTableProps {
  pedidos: Pedido[];
  onCotizar?: (pedido: Pedido) => void;
}

type BadgeColor = 'green' | 'blue' | 'amber' | 'red' | 'gray';

const ESTADO_COLOR: Record<string, BadgeColor> = {
  abierto: 'green',
  en_cotizacion: 'blue',
  adjudicado: 'gray',
  cancelado: 'red',
};

const ESTADO_LABEL: Record<string, string> = {
  abierto: 'Abierto',
  en_cotizacion: 'En cotización',
  adjudicado: 'Adjudicado',
  cancelado: 'Cancelado',
};

export const PedidosTable = ({ pedidos, onCotizar }: PedidosTableProps) => (
  <div className="bg-ep-surface border border-ep-border rounded-xl shadow-sm overflow-hidden">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-ep-surface-raised border-b border-ep-border">
          <th className="text-left px-4 py-2.5 text-xs font-semibold text-ep-text-muted uppercase tracking-wider">
            Producto
          </th>
          <th className="text-left px-4 py-2.5 text-xs font-semibold text-ep-text-muted uppercase tracking-wider">
            Categoría
          </th>
          <th className="text-left px-4 py-2.5 text-xs font-semibold text-ep-text-muted uppercase tracking-wider">
            Fecha límite
          </th>
          <th className="text-center px-4 py-2.5 text-xs font-semibold text-ep-text-muted uppercase tracking-wider">
            Cotizaciones
          </th>
          <th className="text-right px-4 py-2.5 text-xs font-semibold text-ep-text-muted uppercase tracking-wider">
            Estado
          </th>
          {onCotizar && <th className="px-4 py-2.5" />}
        </tr>
      </thead>
      <tbody className="divide-y divide-ep-border">
        {pedidos.map((pedido) => {
          const urgente = diasHasta(pedido.fechaLimite) < 3;
          return (
            <tr
              key={pedido.id}
              className="hover:bg-ep-surface-raised transition-colors duration-150"
            >
              <td className="px-4 py-3 font-medium text-ep-text-primary max-w-[220px] truncate">
                {pedido.titulo}
              </td>
              <td className="px-4 py-3 text-ep-text-secondary">{pedido.categoria}</td>
              <td className="px-4 py-3">
                <span
                  className={`flex items-center gap-1 text-xs font-mono ${
                    urgente ? 'text-ep-red font-semibold' : 'text-ep-text-muted'
                  }`}
                >
                  {urgente && <IconAlertTriangle size={11} stroke={2} />}
                  {formatFecha(pedido.fechaLimite)}
                </span>
              </td>
              <td className="px-4 py-3 text-center font-mono text-ep-text-secondary">
                {pedido.cotizacionesRecibidas}
              </td>
              <td className="px-4 py-3 text-right">
                <Badge color={ESTADO_COLOR[pedido.estado] ?? 'gray'}>
                  {ESTADO_LABEL[pedido.estado] ?? pedido.estado}
                </Badge>
              </td>
              {onCotizar && (
                <td className="px-4 py-3 text-right">
                  <Button variant="secondary" size="sm" onClick={() => onCotizar(pedido)}>
                    Cotizar
                  </Button>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
