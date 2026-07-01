import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconClipboardList, IconAlertTriangle, IconTrash } from '@tabler/icons-react';
import { Badge, Button, EmptyState, Modal, PageHeader, Select } from '../../components/ui';
import { usePedidosStore } from '../../store/usePedidosStore';
import { COMPRADOR_ID } from '../../utils/constants';
import { formatFecha, diasHasta } from '../../utils/formatters';
import type { Pedido } from '../../types';

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

const FILTRO_ESTADO_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'adjudicado', label: 'Adjudicado' },
  { value: 'cancelado', label: 'Cancelado' },
];

const TH =
  'px-3 py-2 text-[10px] font-medium text-ep-text-muted uppercase tracking-[0.06em] border-b border-ep-border';

export default function ListaPedidosComprador() {
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [pedidoAEliminar, setPedidoAEliminar] = useState<Pedido | null>(null);

  const pedidos = usePedidosStore((s) => s.pedidos);
  const eliminarPedido = usePedidosStore((s) => s.eliminarPedido);

  const misPedidos = useMemo(
    () =>
      [...pedidos]
        .filter((p) => p.compradorId === COMPRADOR_ID)
        .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()),
    [pedidos],
  );

  const categoriaOptions = useMemo(
    () => [
      { value: '', label: 'Todas las categorías' },
      ...[...new Set(misPedidos.map((p) => p.categoria))]
        .sort()
        .map((c) => ({ value: c, label: c })),
    ],
    [misPedidos],
  );

  const pedidosFiltrados = useMemo(() => {
    return misPedidos.filter((p) => {
      if (filtroEstado) {
        if (filtroEstado === 'pendiente') {
          if (p.estado !== 'abierto' && p.estado !== 'en_cotizacion') return false;
        } else {
          if (p.estado !== filtroEstado) return false;
        }
      }
      if (filtroCategoria && p.categoria !== filtroCategoria) return false;
      if (fechaDesde && new Date(p.fechaCreacion) < new Date(fechaDesde)) return false;
      if (fechaHasta && new Date(p.fechaCreacion) > new Date(fechaHasta + 'T23:59:59')) return false;
      return true;
    });
  }, [misPedidos, filtroEstado, filtroCategoria, fechaDesde, fechaHasta]);

  const hayFiltros = filtroEstado || filtroCategoria || fechaDesde || fechaHasta;

  const limpiarFiltros = () => {
    setFiltroEstado('');
    setFiltroCategoria('');
    setFechaDesde('');
    setFechaHasta('');
  };

  return (
    <div>
      <PageHeader titulo="Mis pedidos" descripcion="Pedidos que publicaste en el marketplace" />

      {/* Barra de filtros */}
      <div className="bg-ep-blue-light/10 border border-ep-border rounded-lg p-4 mb-5 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[150px]">
          <Select
            label="Estado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            options={FILTRO_ESTADO_OPTIONS}
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <Select
            label="Categoría"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            options={categoriaOptions}
          />
        </div>
        <div className="min-w-[140px]">
          <label className="block text-sm font-medium text-ep-text-primary mb-1">Desde</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-ep-surface rounded-lg border border-ep-border focus:border-ep-green focus:ring-1 focus:ring-ep-green outline-none transition-colors duration-150 text-ep-text-primary"
          />
        </div>
        <div className="min-w-[140px]">
          <label className="block text-sm font-medium text-ep-text-primary mb-1">Hasta</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-ep-surface rounded-lg border border-ep-border focus:border-ep-green focus:ring-1 focus:ring-ep-green outline-none transition-colors duration-150 text-ep-text-primary"
          />
        </div>
        {hayFiltros && (
          <Button variant="secondary" size="sm" onClick={limpiarFiltros}>
            Limpiar filtros
          </Button>
        )}
      </div>

      <p className="text-sm text-ep-text-muted mb-4">
        {pedidosFiltrados.length} {pedidosFiltrados.length === 1 ? 'pedido' : 'pedidos'}
      </p>

      {pedidosFiltrados.length === 0 ? (
        hayFiltros ? (
          <p className="text-center py-10 text-sm text-ep-text-muted">
            No hay pedidos que coincidan con los filtros aplicados.
          </p>
        ) : (
          <EmptyState
            icono={IconClipboardList}
            titulo="Todavía no publicaste pedidos"
            mensaje="Publicá tu primer pedido para que los proveedores te coticen"
          />
        )
      ) : (
        <div className="bg-ep-surface border border-ep-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ep-surface-raised">
                <th className={`${TH} text-left`}>Producto</th>
                <th className={`${TH} text-left`}>Categoría</th>
                <th className={`${TH} text-left`}>Fecha límite</th>
                <th className={`${TH} text-right`}>Cotizaciones</th>
                <th className={`${TH} text-right`}>Estado</th>
                <th className={`${TH} text-right`}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((pedido) => {
                const dias = diasHasta(pedido.fechaLimite);
                const urgente = dias < 3;
                return (
                  <tr
                    key={pedido.id}
                    className="border-b border-ep-border last:border-0 hover:bg-ep-surface-raised transition-colors duration-150"
                  >
                    <td className="px-3 py-2.5">
                      <Link
                        to={`/comprador/pedidos/${pedido.id}`}
                        className="text-ep-blue hover:underline font-medium"
                      >
                        {pedido.titulo}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-ep-text-secondary">{pedido.categoria}</td>
                    <td
                      className={`px-3 py-2.5 ${urgente ? 'text-ep-red' : 'text-ep-text-secondary'}`}
                    >
                      <span className="flex items-center gap-1">
                        {urgente && <IconAlertTriangle size={13} stroke={2} />}
                        {formatFecha(pedido.fechaLimite)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-ep-text-primary">
                      {pedido.cotizacionesRecibidas}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Badge color={ESTADO_COLOR[pedido.estado] ?? 'gray'}>
                        {ESTADO_LABEL[pedido.estado] ?? pedido.estado}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        onClick={() => setPedidoAEliminar(pedido)}
                        className="p-1.5 rounded hover:bg-ep-surface-raised transition-colors duration-150"
                        title="Eliminar pedido"
                      >
                        <div className="text-red-500">
                          <IconTrash size={14} stroke={2} />
                        </div>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: confirmar eliminación de pedido */}
      <Modal
        open={pedidoAEliminar !== null}
        onClose={() => setPedidoAEliminar(null)}
        title="Eliminar pedido"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setPedidoAEliminar(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={() => {
                if (!pedidoAEliminar) return;
                eliminarPedido(pedidoAEliminar.id);
                setPedidoAEliminar(null);
              }}
            >
              Eliminar
            </Button>
          </>
        }
      >
        {pedidoAEliminar && (
          <p className="text-sm text-ep-text-secondary">
            ¿Eliminar el pedido{' '}
            <span className="font-semibold text-ep-text-primary">
              {pedidoAEliminar.titulo}
            </span>
            ? Esta acción eliminará también todas sus cotizaciones.
          </p>
        )}
      </Modal>
    </div>
  );
}
