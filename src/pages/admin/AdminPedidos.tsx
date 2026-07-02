import { useMemo, useState } from 'react';
import { IconClipboardList } from '@tabler/icons-react';
import { PageHeader, Badge, EmptyState, Select, Modal } from '../../components/ui';
import { usePedidosStore } from '../../store/usePedidosStore';
import { formatFecha, getLabelEstadoPedido } from '../../utils/formatters';
import { COMPRADOR_ID } from '../../utils/constants';
import type { Pedido } from '../../types';

type BadgeColor = 'green' | 'blue' | 'amber' | 'red' | 'gray';

const ESTADO_COLOR: Record<string, BadgeColor> = {
  abierto: 'green',
  en_cotizacion: 'blue',
  en_negociacion: 'amber',
  adjudicado: 'gray',
  cancelado: 'red',
};

const FILTRO_ESTADO_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'abierto', label: 'Abierto' },
  { value: 'en_cotizacion', label: 'En cotización' },
  { value: 'en_negociacion', label: 'En negociación' },
  { value: 'adjudicado', label: 'Adjudicado' },
  { value: 'cancelado', label: 'Cancelado' },
];

function nombreComprador(compradorId: string): string {
  return compradorId === COMPRADOR_ID ? 'Comprador Demo' : compradorId;
}

const TH = 'px-3 py-2 text-[10px] font-medium text-ep-text-muted uppercase tracking-[0.06em] border-b border-ep-border';

export default function AdminPedidos() {
  const pedidos = usePedidosStore((s) => s.pedidos);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null);

  const pedidosFiltrados = useMemo(() => {
    const ordenados = [...pedidos].sort(
      (a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime(),
    );
    return filtroEstado ? ordenados.filter((p) => p.estado === filtroEstado) : ordenados;
  }, [pedidos, filtroEstado]);

  return (
    <div>
      <PageHeader titulo="Pedidos" descripcion="Todos los pedidos publicados por compradores" />

      <div className="mb-4 max-w-xs">
        <Select
          label="Filtrar por estado"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          options={FILTRO_ESTADO_OPTIONS}
        />
      </div>

      {pedidosFiltrados.length === 0 ? (
        <EmptyState icono={IconClipboardList} titulo="Sin pedidos" mensaje="No hay pedidos con este filtro" />
      ) : (
        <div className="bg-ep-surface border border-ep-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ep-surface-raised">
                <th className={`${TH} text-left`}>ID</th>
                <th className={`${TH} text-left`}>Título</th>
                <th className={`${TH} text-left`}>Comprador</th>
                <th className={`${TH} text-right`}>Estado</th>
                <th className={`${TH} text-center`}>Cotizaciones</th>
                <th className={`${TH} text-right`}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((pedido) => (
                <tr
                  key={pedido.id}
                  onClick={() => setPedidoDetalle(pedido)}
                  className="border-b border-ep-border last:border-0 hover:bg-ep-surface-raised transition-colors cursor-pointer"
                >
                  <td className="px-3 py-2.5 text-[11px] font-mono text-ep-text-muted">
                    {pedido.id.slice(0, 8)}
                  </td>
                  <td className="px-3 py-2.5 text-sm font-medium text-ep-text-primary max-w-[220px] truncate">
                    {pedido.titulo}
                  </td>
                  <td className="px-3 py-2.5 text-[11px] text-ep-text-muted">
                    {nombreComprador(pedido.compradorId)}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Badge color={ESTADO_COLOR[pedido.estado] ?? 'gray'}>
                      {getLabelEstadoPedido(pedido.estado, 'comprador')}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-center text-sm text-ep-text-primary">
                    {pedido.cotizacionesRecibidas}
                  </td>
                  <td className="px-3 py-2.5 text-right text-[11px] text-ep-text-muted">
                    {formatFecha(pedido.fechaCreacion)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={pedidoDetalle !== null}
        onClose={() => setPedidoDetalle(null)}
        title="Detalle del pedido"
        size="md"
      >
        {pedidoDetalle && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ep-text-muted">Título</span>
              <span className="font-medium text-ep-text-primary">{pedidoDetalle.titulo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ep-text-muted">Comprador</span>
              <span className="text-ep-text-primary">{nombreComprador(pedidoDetalle.compradorId)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ep-text-muted">Categoría</span>
              <span className="text-ep-text-primary">{pedidoDetalle.categoria}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ep-text-muted">Cantidad</span>
              <span className="text-ep-text-primary">
                {pedidoDetalle.cantidad} {pedidoDetalle.unidad}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ep-text-muted">Estado</span>
              <Badge color={ESTADO_COLOR[pedidoDetalle.estado] ?? 'gray'}>
                {getLabelEstadoPedido(pedidoDetalle.estado, 'comprador')}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-ep-text-muted">Fecha límite</span>
              <span className="text-ep-text-primary">{formatFecha(pedidoDetalle.fechaLimite)}</span>
            </div>
            <div className="pt-2 border-t border-ep-border">
              <p className="text-ep-text-muted mb-1">Descripción</p>
              <p className="text-ep-text-primary leading-relaxed">{pedidoDetalle.descripcion}</p>
            </div>
            {pedidoDetalle.observacionBaja && (
              <div className="bg-ep-red-light border border-ep-red rounded-lg px-3 py-2">
                <p className="text-xs text-ep-red-dark">{pedidoDetalle.observacionBaja}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
