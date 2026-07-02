import { useMemo, useState } from 'react';
import { IconFileInvoice } from '@tabler/icons-react';
import { PageHeader, Badge, EmptyState, Select, Modal } from '../../components/ui';
import { useOrdenesStore } from '../../store/useOrdenesStore';
import { usePedidosStore } from '../../store/usePedidosStore';
import { formatARS, formatFecha, getLabelEstadoOrden, getLabelEstadoPago } from '../../utils/formatters';
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

const ESTADO_PAGO_COLOR: Record<string, BadgeColor> = {
  pendiente: 'gray',
  en_proceso: 'amber',
  confirmado: 'green',
};

const FILTRO_ESTADO_ORDEN_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'en_preparacion', label: 'En preparación' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cerrado', label: 'Cerrado' },
  { value: 'disputada', label: 'Disputada' },
];

const FILTRO_ESTADO_PAGO_OPTIONS = [
  { value: '', label: 'Todos los pagos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'confirmado', label: 'Confirmado' },
];

function nombreComprador(compradorId: string): string {
  return compradorId === COMPRADOR_ID ? 'Comprador Demo' : compradorId;
}

const TH = 'px-3 py-2 text-[10px] font-medium text-ep-text-muted uppercase tracking-[0.06em] border-b border-ep-border';

export default function AdminOrdenes() {
  const ordenes = useOrdenesStore((s) => s.ordenes);
  const pedidos = usePedidosStore((s) => s.pedidos);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPago, setFiltroPago] = useState('');
  const [ordenDetalle, setOrdenDetalle] = useState<Orden | null>(null);

  function tituloPedido(orden: Orden): string {
    if (!orden.pedidoId) return '—';
    return pedidos.find((p) => p.id === orden.pedidoId)?.titulo ?? '—';
  }

  const ordenesFiltradas = useMemo(() => {
    const ordenadas = [...ordenes].sort(
      (a, b) => new Date(b.fechaConfirmacion).getTime() - new Date(a.fechaConfirmacion).getTime(),
    );
    return ordenadas.filter((o) => {
      if (filtroEstado && o.estado !== filtroEstado) return false;
      if (filtroPago && (o.estadoPago ?? 'pendiente') !== filtroPago) return false;
      return true;
    });
  }, [ordenes, filtroEstado, filtroPago]);

  return (
    <div>
      <PageHeader titulo="Órdenes" descripcion="Todas las órdenes de la plataforma" />

      <div className="mb-4 flex gap-3 max-w-lg">
        <Select
          label="Estado de la orden"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          options={FILTRO_ESTADO_ORDEN_OPTIONS}
        />
        <Select
          label="Estado del pago"
          value={filtroPago}
          onChange={(e) => setFiltroPago(e.target.value)}
          options={FILTRO_ESTADO_PAGO_OPTIONS}
        />
      </div>

      {ordenesFiltradas.length === 0 ? (
        <EmptyState icono={IconFileInvoice} titulo="Sin órdenes" mensaje="No hay órdenes con estos filtros" />
      ) : (
        <div className="bg-ep-surface border border-ep-border rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ep-surface-raised">
                <th className={`${TH} text-left`}>ID</th>
                <th className={`${TH} text-left`}>Pedido</th>
                <th className={`${TH} text-left`}>Comprador</th>
                <th className={`${TH} text-left`}>Proveedor</th>
                <th className={`${TH} text-right`}>Monto</th>
                <th className={`${TH} text-right`}>Estado orden</th>
                <th className={`${TH} text-right`}>Estado pago</th>
                <th className={`${TH} text-right`}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {ordenesFiltradas.map((orden) => (
                <tr
                  key={orden.id}
                  onClick={() => setOrdenDetalle(orden)}
                  className="border-b border-ep-border last:border-0 hover:bg-ep-surface-raised transition-colors cursor-pointer"
                >
                  <td className="px-3 py-2.5 text-[11px] font-mono text-ep-text-muted">{orden.id.slice(0, 8)}</td>
                  <td className="px-3 py-2.5 text-sm font-medium text-ep-text-primary max-w-[180px] truncate">
                    {tituloPedido(orden)}
                  </td>
                  <td className="px-3 py-2.5 text-[11px] text-ep-text-muted">{nombreComprador(orden.compradorId)}</td>
                  <td className="px-3 py-2.5 text-[11px] text-ep-text-muted">{orden.proveedorNombre}</td>
                  <td className="px-3 py-2.5 text-right text-sm font-mono text-ep-text-primary">
                    {formatARS(orden.monto)}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Badge color={ESTADO_ORDEN_COLOR[orden.estado] ?? 'gray'}>
                      {getLabelEstadoOrden(orden.estado, 'comprador')}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Badge color={ESTADO_PAGO_COLOR[orden.estadoPago ?? 'pendiente']}>
                      {getLabelEstadoPago(orden.estadoPago ?? 'pendiente')}
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

      <Modal
        open={ordenDetalle !== null}
        onClose={() => setOrdenDetalle(null)}
        title="Detalle de la orden"
        size="md"
      >
        {ordenDetalle && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ep-text-muted">Pedido</span>
              <span className="font-medium text-ep-text-primary">{tituloPedido(ordenDetalle)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ep-text-muted">Comprador</span>
              <span className="text-ep-text-primary">{nombreComprador(ordenDetalle.compradorId)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ep-text-muted">Proveedor</span>
              <span className="text-ep-text-primary">{ordenDetalle.proveedorNombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ep-text-muted">Monto</span>
              <span className="font-mono text-ep-text-primary">{formatARS(ordenDetalle.monto)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ep-text-muted">Estado orden</span>
              <Badge color={ESTADO_ORDEN_COLOR[ordenDetalle.estado] ?? 'gray'}>
                {getLabelEstadoOrden(ordenDetalle.estado, 'comprador')}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-ep-text-muted">Estado pago</span>
              <Badge color={ESTADO_PAGO_COLOR[ordenDetalle.estadoPago ?? 'pendiente']}>
                {getLabelEstadoPago(ordenDetalle.estadoPago ?? 'pendiente')}
              </Badge>
            </div>
            {ordenDetalle.numeroSeguimiento && (
              <div className="flex justify-between">
                <span className="text-ep-text-muted">N° de seguimiento</span>
                <span className="font-mono text-ep-text-primary">{ordenDetalle.numeroSeguimiento}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-ep-text-muted">Fecha confirmación</span>
              <span className="text-ep-text-primary">{formatFecha(ordenDetalle.fechaConfirmacion)}</span>
            </div>
            {ordenDetalle.observacionDisputa && (
              <div className="bg-ep-red-light border border-ep-red rounded-lg px-3 py-2">
                <p className="text-xs font-semibold text-ep-red-dark mb-0.5">Disputa</p>
                <p className="text-xs text-ep-red-dark">{ordenDetalle.observacionDisputa}</p>
              </div>
            )}
            {ordenDetalle.resolucionDisputa && (
              <div className="bg-ep-surface-raised border border-ep-border rounded-lg px-3 py-2">
                <p className="text-xs font-semibold text-ep-text-primary mb-0.5">Resolución</p>
                <p className="text-xs text-ep-text-secondary">{ordenDetalle.resolucionDisputa}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
