import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IconClipboardList,
  IconAlertTriangle,
  IconTrash,
  IconInfoCircle,
  IconMessage,
} from '@tabler/icons-react';
import { Badge, Button, EmptyState, Modal, PageHeader, Select } from '../../components/ui';
import { usePedidosStore } from '../../store/usePedidosStore';
import { useCotizacionesStore } from '../../store/useCotizacionesStore';
import { useMensajesStore } from '../../store/useMensajesStore';
import { COMPRADOR_ID } from '../../utils/constants';
import { formatFecha, diasHasta } from '../../utils/formatters';
import type { Pedido } from '../../types';

type BadgeColor = 'green' | 'blue' | 'amber' | 'red' | 'gray';

const ESTADO_COLOR: Record<string, BadgeColor> = {
  abierto: 'green',
  en_cotizacion: 'blue',
  en_negociacion: 'amber',
  adjudicado: 'gray',
  cancelado: 'red',
};

const ESTADO_LABEL: Record<string, string> = {
  abierto: 'Abierto',
  en_cotizacion: 'En cotización',
  en_negociacion: 'En negociación',
  adjudicado: 'Adjudicado',
  cancelado: 'Cancelado',
};

const FILTRO_ESTADO_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_negociacion', label: 'En negociación' },
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
  const [observacionBaja, setObservacionBaja] = useState('');
  const [tooltipObsId, setTooltipObsId] = useState<string | null>(null);

  const pedidos = usePedidosStore((s) => s.pedidos);
  const cancelarPedido = usePedidosStore((s) => s.cancelarPedido);
  const cotizaciones = useCotizacionesStore((s) => s.cotizaciones);
  const pedidosConMensajeNuevo = useMensajesStore((s) => s.pedidosConMensajeNuevo);

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

  // Conteo de cotizaciones por pedido
  const cotizacionesPorPedido = useMemo(() => {
    const map: Record<string, number> = {};
    cotizaciones.forEach((c) => {
      if (!map[c.pedidoId]) map[c.pedidoId] = 0;
      map[c.pedidoId]++;
    });
    return map;
  }, [cotizaciones]);

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

  const handleAbrirModalBaja = (pedido: Pedido) => {
    setPedidoAEliminar(pedido);
    setObservacionBaja('');
  };

  const handleConfirmarBaja = () => {
    if (!pedidoAEliminar || observacionBaja.trim().length < 10) return;
    cancelarPedido(pedidoAEliminar.id, observacionBaja.trim());
    setPedidoAEliminar(null);
    setObservacionBaja('');
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
                const cantCot = cotizacionesPorPedido[pedido.id] ?? 0;
                const tieneMensajeNuevo = pedidosConMensajeNuevo.includes(pedido.id);
                const cancelado = pedido.estado === 'cancelado';

                return (
                  <tr
                    key={pedido.id}
                    className="border-b border-ep-border last:border-0 hover:bg-ep-surface-raised transition-colors duration-150"
                  >
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/comprador/pedidos/${pedido.id}`}
                          className="text-ep-blue hover:underline font-medium"
                        >
                          {pedido.titulo}
                        </Link>
                        {tieneMensajeNuevo && (
                          <span
                            className="inline-flex items-center gap-1 bg-ep-blue-light text-ep-blue text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                            title="Hay mensajes nuevos"
                          >
                            <IconMessage size={10} stroke={2} />
                            nuevo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-ep-text-secondary">{pedido.categoria}</td>
                    <td
                      className={`px-3 py-2.5 ${urgente && !cancelado ? 'text-ep-red' : 'text-ep-text-secondary'}`}
                    >
                      <span className="flex items-center gap-1">
                        {urgente && !cancelado && <IconAlertTriangle size={13} stroke={2} />}
                        {formatFecha(pedido.fechaLimite)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {cantCot === 0 ? (
                        <span className="text-xs text-ep-text-muted font-mono">0</span>
                      ) : (
                        <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-ep-blue text-white text-[11px] font-bold font-mono">
                          {cantCot}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Badge color={ESTADO_COLOR[pedido.estado] ?? 'gray'}>
                          {ESTADO_LABEL[pedido.estado] ?? pedido.estado}
                        </Badge>
                        {cancelado && pedido.observacionBaja && (
                          <div className="relative">
                            <button
                              onMouseEnter={() => setTooltipObsId(pedido.id)}
                              onMouseLeave={() => setTooltipObsId(null)}
                              onClick={() =>
                                setTooltipObsId((v) => (v === pedido.id ? null : pedido.id))
                              }
                              className="text-ep-text-muted hover:text-ep-text-secondary transition-colors"
                              title="Ver motivo de baja"
                            >
                              <IconInfoCircle size={14} stroke={1.5} />
                            </button>
                            {tooltipObsId === pedido.id && (
                              <div className="absolute right-0 top-6 z-20 w-56 bg-ep-text-primary text-white text-xs rounded-lg p-2.5 shadow-xl leading-relaxed">
                                <p className="font-semibold mb-1 text-ep-text-disabled uppercase tracking-wide text-[10px]">
                                  Motivo de baja
                                </p>
                                {pedido.observacionBaja}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {!cancelado && (
                        <button
                          onClick={() => handleAbrirModalBaja(pedido)}
                          className="p-1.5 rounded hover:bg-ep-surface-raised transition-colors duration-150"
                          title="Dar de baja pedido"
                        >
                          <div className="text-ep-red">
                            <IconTrash size={14} stroke={2} />
                          </div>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: baja con observación obligatoria */}
      <Modal
        open={pedidoAEliminar !== null}
        onClose={() => setPedidoAEliminar(null)}
        title="¿Por qué das de baja este pedido?"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setPedidoAEliminar(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleConfirmarBaja}
              disabled={observacionBaja.trim().length < 10}
            >
              Confirmar baja
            </Button>
          </>
        }
      >
        {pedidoAEliminar && (
          <div className="space-y-3">
            <p className="text-sm text-ep-text-secondary">
              Pedido:{' '}
              <span className="font-semibold text-ep-text-primary">{pedidoAEliminar.titulo}</span>
            </p>
            <div>
              <textarea
                value={observacionBaja}
                onChange={(e) => setObservacionBaja(e.target.value)}
                placeholder="Ej: El proveedor acordó el precio por fuera de la plataforma, stock propio, error en la carga, etc."
                rows={4}
                className="w-full px-3 py-2 text-sm bg-ep-surface rounded-lg border border-ep-border focus:border-ep-red focus:ring-1 focus:ring-ep-red outline-none transition-colors duration-150 text-ep-text-primary placeholder:text-ep-text-muted resize-none"
              />
              <div className="flex justify-between mt-1">
                <span
                  className={`text-[11px] ${
                    observacionBaja.trim().length < 10 ? 'text-ep-red' : 'text-ep-text-muted'
                  }`}
                >
                  {observacionBaja.trim().length < 10
                    ? `Mínimo 10 caracteres (${observacionBaja.trim().length}/10)`
                    : `${observacionBaja.trim().length} caracteres`}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
