import { useNavigate } from 'react-router-dom';
import { IconClipboardList, IconFileInvoice, IconAlertTriangle, IconCircleCheck, IconInbox } from '@tabler/icons-react';
import { StatCard, PageHeader, Badge, EmptyState } from '../../components/ui';
import { usePedidosStore } from '../../store/usePedidosStore';
import { useOrdenesStore } from '../../store/useOrdenesStore';
import { formatARS, formatFecha, getLabelEstadoOrden } from '../../utils/formatters';
import { COMPRADOR_ID } from '../../utils/constants';
import type { Orden } from '../../types';

type BadgeColor = 'green' | 'blue' | 'amber' | 'red' | 'gray';

const ESTADO_ORDEN_COLOR: Record<string, BadgeColor> = {
  confirmada: 'blue',
  en_preparacion: 'amber',
  enviado: 'blue',
  entregado: 'green',
  cerrado: 'gray',
  disputada: 'red',
};

function nombreComprador(compradorId: string): string {
  return compradorId === COMPRADOR_ID ? 'Comprador Demo' : compradorId;
}

const TH = 'px-3 py-2 text-[10px] font-medium text-ep-text-muted uppercase tracking-[0.06em] border-b border-ep-border';

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const pedidos = usePedidosStore((s) => s.pedidos);
  const ordenes = useOrdenesStore((s) => s.ordenes);

  const ordenesActivas = ordenes.filter((o) => !['cerrado', 'disputada'].includes(o.estado));
  const disputasAbiertas = ordenes.filter((o) => o.estado === 'disputada');
  const ordenesCerradas = ordenes.filter((o) => o.estado === 'cerrado');

  const montoTransaccionado = ordenes
    .filter((o) => o.estado !== 'disputada')
    .reduce((acc, o) => acc + o.monto, 0);

  const actividadReciente: Orden[] = [...ordenes]
    .sort((a, b) => new Date(b.fechaConfirmacion).getTime() - new Date(a.fechaConfirmacion).getTime())
    .slice(0, 5);

  function tituloPedido(orden: Orden): string {
    if (!orden.pedidoId) return '—';
    return pedidos.find((p) => p.id === orden.pedidoId)?.titulo ?? '—';
  }

  return (
    <div>
      <PageHeader titulo="Dashboard" descripcion="Métricas globales de la plataforma" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-3">
        <StatCard
          label="Total pedidos"
          value={pedidos.length}
          icono={IconClipboardList}
          color="blue"
          onClick={() => navigate('/admin/pedidos')}
        />
        <StatCard
          label="Órdenes activas"
          value={ordenesActivas.length}
          icono={IconFileInvoice}
          color="green"
          onClick={() => navigate('/admin/ordenes')}
        />
        <StatCard
          label="Disputas abiertas"
          value={disputasAbiertas.length}
          icono={IconAlertTriangle}
          color="red"
          onClick={() => navigate('/admin/disputas')}
        />
        <StatCard
          label="Órdenes cerradas"
          value={ordenesCerradas.length}
          icono={IconCircleCheck}
          color="amber"
          onClick={() => navigate('/admin/ordenes')}
        />
      </div>

      <p className="text-sm text-ep-text-secondary mb-5">
        Monto total transaccionado:{' '}
        <span className="font-mono font-semibold text-ep-text-primary">
          {formatARS(montoTransaccionado)}
        </span>
      </p>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-medium text-ep-text-muted uppercase tracking-[0.08em]">
            Actividad reciente
          </span>
          <button
            onClick={() => navigate('/admin/ordenes')}
            className="text-[11px] text-ep-blue font-medium hover:underline"
          >
            Ver todas →
          </button>
        </div>

        {actividadReciente.length === 0 ? (
          <EmptyState icono={IconInbox} titulo="Sin actividad" mensaje="Todavía no hay órdenes en la plataforma" />
        ) : (
          <div className="bg-ep-surface border border-ep-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ep-surface-raised">
                  <th className={`${TH} text-left`}>Pedido</th>
                  <th className={`${TH} text-left`}>Comprador</th>
                  <th className={`${TH} text-left`}>Proveedor</th>
                  <th className={`${TH} text-right`}>Monto</th>
                  <th className={`${TH} text-right`}>Estado</th>
                  <th className={`${TH} text-right`}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {actividadReciente.map((orden) => (
                  <tr
                    key={orden.id}
                    className="border-b border-ep-border last:border-0 hover:bg-ep-surface-raised transition-colors"
                  >
                    <td className="px-3 py-2.5 text-sm font-medium text-ep-text-primary max-w-[220px] truncate">
                      {tituloPedido(orden)}
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-ep-text-muted">
                      {nombreComprador(orden.compradorId)}
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-ep-text-muted">{orden.proveedorNombre}</td>
                    <td className="px-3 py-2.5 text-right text-sm font-mono text-ep-text-primary">
                      {formatARS(orden.monto)}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Badge color={ESTADO_ORDEN_COLOR[orden.estado] ?? 'gray'}>
                        {getLabelEstadoOrden(orden.estado, 'comprador')}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right text-[11px] text-ep-text-muted">
                      {formatFecha(orden.fechaConfirmacion)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
