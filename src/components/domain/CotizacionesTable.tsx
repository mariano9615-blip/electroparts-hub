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

export const CotizacionesTable = ({ cotizaciones, pedidos }: CotizacionesTableProps) => {
  const getPedidoTitulo = (pedidoId: string) =>
    pedidos.find((p) => p.id === pedidoId)?.titulo ?? '—';

  return (
    <div className="bg-ep-surface border border-ep-border rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-ep-surface-raised border-b border-ep-border">
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-ep-text-muted uppercase tracking-wider">
              Proveedor
            </th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-ep-text-muted uppercase tracking-wider">
              Pedido
            </th>
            <th className="text-right px-4 py-2.5 text-xs font-semibold text-ep-text-muted uppercase tracking-wider">
              Precio
            </th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-ep-text-muted uppercase tracking-wider">
              Entrega
            </th>
            <th className="text-right px-4 py-2.5 text-xs font-semibold text-ep-text-muted uppercase tracking-wider">
              Estado
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ep-border">
          {cotizaciones.map((cot) => (
            <tr
              key={cot.id}
              className="hover:bg-ep-surface-raised transition-colors duration-150"
            >
              <td className="px-4 py-3 font-medium text-ep-text-primary">
                {cot.proveedorNombre}
              </td>
              <td className="px-4 py-3 text-ep-text-secondary text-xs max-w-[180px] truncate">
                {getPedidoTitulo(cot.pedidoId)}
              </td>
              <td className="px-4 py-3 text-right font-mono font-semibold text-ep-text-primary">
                {formatARS(cot.precio)}
              </td>
              <td className="px-4 py-3 text-ep-text-secondary">{cot.tiempoEntrega}</td>
              <td className="px-4 py-3 text-right">
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
