import { Badge } from '../ui/Badge';
import { formatARS } from '../../utils/formatters';
import type { Cotizacion, Pedido } from '../../types';

interface CotizacionesTableProps {
  cotizaciones: Cotizacion[];
  pedidos: Pedido[];
}

type BadgeColor = 'green' | 'blue' | 'amber' | 'red' | 'gray';

const ESTADO_COLOR: Record<string, BadgeColor> = {
  pendiente: 'amber',
  aceptada: 'green',
  rechazada: 'red',
};

const ESTADO_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
};

const TH = 'px-3 py-2 text-[10px] font-medium text-ep-text-muted uppercase tracking-[0.06em] border-b border-ep-border';

export const CotizacionesTable = ({ cotizaciones, pedidos }: CotizacionesTableProps) => {
  const getPedidoTitulo = (pedidoId: string) =>
    pedidos.find((p) => p.id === pedidoId)?.titulo ?? '—';

  return (
    <div className="bg-ep-surface border border-ep-border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-ep-surface-raised">
            <th className={`${TH} text-left`}>Proveedor</th>
            <th className={`${TH} text-left`}>Pedido</th>
            <th className={`${TH} text-right`}>Precio</th>
            <th className={`${TH} text-left`}>Entrega</th>
            <th className={`${TH} text-right`}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {cotizaciones.map((cot) => (
            <tr
              key={cot.id}
              className="border-b border-ep-border last:border-0 hover:bg-ep-surface-raised transition-colors"
            >
              <td className="px-3 py-2.5 text-sm font-medium text-ep-text-primary">
                {cot.proveedorNombre}
              </td>
              <td className="px-3 py-2.5 text-[11px] text-ep-text-muted max-w-[180px] truncate">
                {getPedidoTitulo(cot.pedidoId)}
              </td>
              <td className="px-3 py-2.5 text-right font-mono font-medium text-ep-text-primary">
                {formatARS(cot.precio)}
              </td>
              <td className="px-3 py-2.5 text-[11px] text-ep-text-muted">
                {cot.tiempoEntrega}
              </td>
              <td className="px-3 py-2.5 text-right">
                <Badge color={ESTADO_COLOR[cot.estado] ?? 'gray'}>
                  {ESTADO_LABEL[cot.estado] ?? cot.estado}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
