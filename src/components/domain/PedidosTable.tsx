import { Link } from 'react-router-dom';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatFecha, diasHasta } from '../../utils/formatters';
import type { Pedido } from '../../types';

interface PedidosTableProps {
  pedidos: Pedido[];
  onCotizar?: (pedido: Pedido) => void;
  linkeable?: boolean;
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

const TH = 'px-3 py-2 text-[10px] font-medium text-ep-text-muted uppercase tracking-[0.06em] border-b border-ep-border';

export const PedidosTable = ({ pedidos, onCotizar, linkeable = true }: PedidosTableProps) => (
  <div className="bg-ep-surface border border-ep-border rounded-lg overflow-hidden">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-ep-surface-raised">
          <th className={`${TH} text-left`}>Producto</th>
          <th className={`${TH} text-left`}>Categoría</th>
          <th className={`${TH} text-left`}>Fecha límite</th>
          <th className={`${TH} text-center`}>Cotizaciones</th>
          <th className={`${TH} text-right`}>Estado</th>
          {onCotizar && <th className={`${TH}`} />}
        </tr>
      </thead>
      <tbody>
        {pedidos.map((pedido) => {
          const urgente = diasHasta(pedido.fechaLimite) < 3;
          return (
            <tr
              key={pedido.id}
              className="border-b border-ep-border last:border-0 hover:bg-ep-surface-raised transition-colors"
            >
              <td className="px-3 py-2.5 text-sm font-medium text-ep-text-primary max-w-[220px] truncate">
                {linkeable ? (
                  <Link
                    to={`/comprador/pedidos/${pedido.id}`}
                    className="text-ep-blue hover:underline font-medium"
                  >
                    {pedido.titulo}
                  </Link>
                ) : (
                  pedido.titulo
                )}
              </td>
              <td className="px-3 py-2.5 text-[11px] text-ep-text-muted">
                {pedido.categoria}
              </td>
              <td className="px-3 py-2.5">
                <span
                  className={`flex items-center gap-1 ${urgente ? 'text-[11px] text-ep-red' : 'text-[11px] text-ep-text-muted'}`}
                >
                  {urgente && <IconAlertTriangle size={11} stroke={2} />}
                  {formatFecha(pedido.fechaLimite)}
                </span>
              </td>
              <td className="px-3 py-2.5 text-center">
                <span
                  className={
                    pedido.cotizacionesRecibidas > 0
                      ? 'text-sm font-medium text-ep-text-primary'
                      : 'text-sm text-ep-text-muted'
                  }
                >
                  {pedido.cotizacionesRecibidas}
                </span>
              </td>
              <td className="px-3 py-2.5 text-right">
                <Badge color={ESTADO_COLOR[pedido.estado] ?? 'gray'}>
                  {ESTADO_LABEL[pedido.estado] ?? pedido.estado}
                </Badge>
              </td>
              {onCotizar && (
                <td className="px-3 py-2.5 text-right">
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
