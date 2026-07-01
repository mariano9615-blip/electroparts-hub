import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
import { formatFecha, formatARS, diasHasta } from '../../utils/formatters';
import type { Pedido } from '../../types';

type BadgeColor = 'green' | 'blue' | 'amber' | 'red' | 'gray';
type Tab = 'todos' | 'activos' | 'en_negociacion' | 'comprados' | 'cancelados';

const TABS: { id: Tab; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'activos', label: 'Activos' },
  { id: 'en_negociacion', label: 'En negociación' },
  { id: 'comprados', label: 'Comprados' },
  { id: 'cancelados', label: 'Cancelados' },
];

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
  adjudicado: 'Comprado',
  cancelado: 'Cancelado',
};

const FILTRO_ESTADO_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'abierto', label: 'Abierto' },
  { value: 'en_cotizacion', label: 'En cotización' },
  { value: 'en_negociacion', label: 'En negociación' },
  { value: 'adjudicado', label: 'Comprado' },
  { value: 'cancelado', label: 'Cancelado' },
];

const TH =
  'px-3 py-2 text-[10px] font-medium text-ep-text-muted uppercase tracking-[0.06em] border-b border-ep-border';

function getActividadDot(
  pedidoId: string,
  cotizaciones: { pedidoId: string; fechaCreacion: string }[],
  mensajesPorPedido: Record<string, { timestamp: string }[]>,
): 'verde' | 'amber' | null {
  const timestamps: number[] = [
    ...cotizaciones.filter((c) => c.pedidoId === pedidoId).map((c) => new Date(c.fechaCreacion).getTime()),
    ...(mensajesPorPedido[pedidoId] ?? []).map((m) => new Date(m.timestamp).getTime()),
  ];
  if (timestamps.length === 0) return null;
  const diff = Date.now() - Math.max(...timestamps);
  const horas = diff / (1000 * 60 * 60);
  if (horas < 2) return 'verde';
  if (horas < 24) return 'amber';
  return null;
}

export default function ListaPedidosComprador() {
  const [searchParams] = useSearchParams();
  const tabInit = searchParams.get('tab') as Tab | null;
  const [tabActiva, setTabActiva] = useState<Tab>(
    tabInit && TABS.some((t) => t.id === tabInit) ? tabInit : 'todos',
  );
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
  const mensajesPorPedido = useMensajesStore((s) => s.mensajesPorPedido);

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

  // Cotizaciones por pedido: count y mejor precio
  const cotizacionesPorPedido = useMemo(() => {
    const map: Record<string, { count: number; mejor: number | null }> = {};
    cotizaciones.forEach((c) => {
      if (!map[c.pedidoId]) map[c.pedidoId] = { count: 0, mejor: null };
      map[c.pedidoId].count++;
      if (map[c.pedidoId].mejor === null || c.precio < map[c.pedidoId].mejor!) {
        map[c.pedidoId].mejor = c.precio;
      }
    });
    return map;
  }, [cotizaciones]);

  // Conteos por tab
  const tabCounts = useMemo(() => ({
    todos: misPedidos.length,
    activos: misPedidos.filter((p) => p.estado === 'abierto' || p.estado === 'en_cotizacion').length,
    en_negociacion: misPedidos.filter((p) => p.estado === 'en_negociacion').length,
    comprados: misPedidos.filter((p) => p.estado === 'adjudicado').length,
    cancelados: misPedidos.filter((p) => p.estado === 'cancelado').length,
  }), [misPedidos]);

  const pedidosFiltradosPorTab = useMemo(() => {
    return misPedidos.filter((p) => {
      switch (tabActiva) {
        case 'activos': return p.estado === 'abierto' || p.estado === 'en_cotizacion';
        case 'en_negociacion': return p.estado === 'en_negociacion';
        case 'comprados': return p.estado === 'adjudicado';
        case 'cancelados': return p.estado === 'cancelado';
        default: return true;
      }
    });
  }, [misPedidos, tabActiva]);

  const pedidosFiltrados = useMemo(() => {
    return pedidosFiltradosPorTab.filter((p) => {
      if (filtroEstado && p.estado !== filtroEstado) return false;
      if (filtroCategoria && p.categoria !== filtroCategoria) return false;
      if (fechaDesde && new Date(p.fechaCreacion) < new Date(fechaDesde)) return false;
      if (fechaHasta && new Date(p.fechaCreacion) > new Date(fechaHasta + 'T23:59:59')) return false;
      return true;
    });
  }, [pedidosFiltradosPorTab, filtroEstado, filtroCategoria, fechaDesde, fechaHasta]);

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

      {/* Tabs de filtro */}
      <div className="flex gap-1 border-b border-ep-border mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTabActiva(tab.id)}
            className={[
              'px-4 py-2.5 text-sm font-medium transition-colors duration-150 whitespace-nowrap flex items-center gap-1.5',
              tabActiva === tab.id
                ? 'border-b-2 border-ep-blue text-ep-blue'
                : 'text-ep-text-secondary hover:text-ep-text-primary border-b-2 border-transparent',
            ].join(' ')}
          >
            {tab.label}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              tabActiva === tab.id ? 'bg-ep-blue text-white' : 'bg-ep-surface-raised text-ep-text-muted'
            }`}>
              {tabCounts[tab.id]}
            </span>
          </button>
        ))}
      </div>

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
        hayFiltros || tabActiva !== 'todos' ? (
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
                <th className={`${TH} text-right`}>Estado</th>
                <th className={`${TH} text-right`}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((pedido) => {
                const dias = diasHasta(pedido.fechaLimite);
                const urgente = dias < 3;
                const cotData = cotizacionesPorPedido[pedido.id];
                const cantCot = cotData?.count ?? 0;
                const mejorPrecio = cotData?.mejor ?? null;
                const tieneMensajeNuevo = pedidosConMensajeNuevo.includes(pedido.id);
                const cancelado = pedido.estado === 'cancelado';
                const diasPublicado = Math.floor(
                  (Date.now() - new Date(pedido.fechaCreacion ?? Date.now()).getTime()) /
                    (1000 * 60 * 60 * 24),
                );
                const actividadDot = getActividadDot(pedido.id, cotizaciones, mensajesPorPedido);

                return (
                  <tr
                    key={pedido.id}
                    className="border-b border-ep-border last:border-0 hover:bg-ep-surface-raised transition-colors duration-150"
                  >
                    <td className="px-3 py-2.5">
                      {/* Línea 1: punto actividad + título + badge mensaje nuevo */}
                      <div className="flex items-center gap-2">
                        {actividadDot === 'verde' && (
                          <span className="w-2 h-2 rounded-full bg-ep-green flex-shrink-0 animate-pulse" title="Actividad reciente (menos de 2h)" />
                        )}
                        {actividadDot === 'amber' && (
                          <span className="w-2 h-2 rounded-full bg-ep-amber flex-shrink-0" title="Actividad en las últimas 24h" />
                        )}
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
                      {/* Línea 2: resumen de cotizaciones + días publicado */}
                      <div className="text-[11px] text-ep-text-muted mt-0.5 ml-0">
                        {cantCot > 0 ? (
                          <>
                            <span className="font-mono">{cantCot}</span>{' '}
                            {cantCot === 1 ? 'cotización' : 'cotizaciones'}
                            {mejorPrecio !== null && (
                              <> · Mejor precio: <span className="font-mono font-medium">{formatARS(mejorPrecio)}</span></>
                            )}
                          </>
                        ) : (
                          <span className="italic">Sin cotizaciones aún</span>
                        )}
                        {' · '}
                        {diasPublicado === 0
                          ? 'Publicado hoy'
                          : `Publicado hace ${diasPublicado} día${diasPublicado !== 1 ? 's' : ''}`}
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
                      {!cancelado && pedido.estado !== 'adjudicado' && (
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
