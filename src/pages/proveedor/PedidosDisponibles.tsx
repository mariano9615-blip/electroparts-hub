import { useState } from 'react';
import { IconPackage } from '@tabler/icons-react';
import { PageHeader, EmptyState, Input, Select, Badge } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';
import { PedidoCard } from '../../components/pedidos/PedidoCard';
import { CotizacionForm } from '../../components/cotizaciones/CotizacionForm';
import { usePedidosStore } from '../../store/usePedidosStore';
import { useCotizacionesStore } from '../../store/useCotizacionesStore';
import { useMensajesStore } from '../../store/useMensajesStore';
import { CATEGORIAS } from '../../utils/constants';
import type { Pedido } from '../../types';

const PROV_DEMO_ID = 'prov-demo-001';

const CATEGORIA_OPTIONS = [
  { value: '', label: 'Todas las categorías' },
  ...CATEGORIAS.map((c) => ({ value: c, label: c })),
];

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

function getDiasColorClass(dias: number): string {
  if (dias >= 14) return 'text-ep-red';
  if (dias >= 7) return 'text-ep-amber';
  return 'text-ep-text-muted';
}

export default function PedidosDisponibles() {
  const [pedidoACotizar, setPedidoACotizar] = useState<Pedido | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const pedidos = usePedidosStore((s) => s.pedidos);
  const cotizaciones = useCotizacionesStore((s) => s.cotizaciones);
  const mensajesPorPedido = useMensajesStore((s) => s.mensajesPorPedido);

  const pedidosDisponibles = [...pedidos]
    .filter((p) => ['abierto', 'en_cotizacion'].includes(p.estado))
    .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());

  const pedidosFiltrados = pedidosDisponibles.filter((p) => {
    const coincideBusqueda =
      !busqueda ||
      p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = !categoriaFiltro || p.categoria === categoriaFiltro;
    return coincideBusqueda && coincideCategoria;
  });

  const yaCotize = (pedidoId: string) =>
    cotizaciones.some((c) => c.pedidoId === pedidoId && c.proveedorId === PROV_DEMO_ID);

  const handleSuccess = () => {
    setPedidoACotizar(null);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  return (
    <div>
      <PageHeader
        titulo="Explorar pedidos"
        descripcion="Pedidos publicados por compradores esperando cotizaciones"
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por título o descripción..."
          className="flex-1"
        />
        <Select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          options={CATEGORIA_OPTIONS}
          className="sm:w-56"
        />
      </div>

      <p className="text-sm text-ep-text-muted mb-4">
        {pedidosFiltrados.length} pedidos disponibles
      </p>

      {pedidosFiltrados.length === 0 ? (
        <EmptyState
          icono={IconPackage}
          titulo="No hay pedidos disponibles"
          mensaje="En este momento no hay pedidos publicados que coincidan con tu búsqueda"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {pedidosFiltrados.map((pedido) => {
            const cotizado = yaCotize(pedido.id);
            const actividadDot = getActividadDot(pedido.id, cotizaciones, mensajesPorPedido);
            const diasPublicado = Math.floor(
              (Date.now() - new Date(pedido.fechaCreacion ?? Date.now()).getTime()) /
                (1000 * 60 * 60 * 24),
            );
            const diasColorClass = getDiasColorClass(diasPublicado);

            return (
              <div key={pedido.id} className="relative">
                {/* Indicador de actividad */}
                {actividadDot && (
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        actividadDot === 'verde' ? 'bg-ep-green animate-pulse' : 'bg-ep-amber'
                      }`}
                      title={actividadDot === 'verde' ? 'Actividad reciente (menos de 2h)' : 'Actividad en las últimas 24h'}
                    />
                  </div>
                )}
                <PedidoCard
                  pedido={pedido}
                  onCotizar={cotizado ? undefined : () => setPedidoACotizar(pedido)}
                />
                <div className="flex items-center justify-between px-4 pb-3 -mt-1">
                  <span className={`text-[11px] ${diasColorClass}`}>
                    {diasPublicado === 0
                      ? 'Publicado hoy'
                      : `Publicado hace ${diasPublicado} día${diasPublicado !== 1 ? 's' : ''}`}
                    {diasPublicado >= 14 && ' · Pedido antiguo'}
                    {diasPublicado >= 7 && diasPublicado < 14 && ' · Lleva tiempo publicado'}
                  </span>
                  {cotizado && <Badge color="gray">Ya cotizaste</Badge>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={pedidoACotizar !== null}
        onClose={() => setPedidoACotizar(null)}
        title="Cotizar pedido"
      >
        {pedidoACotizar && (
          <div>
            <div className="mb-4 pb-4 border-b border-ep-border">
              <p className="font-semibold text-ep-text-primary text-sm">
                {pedidoACotizar.titulo}
              </p>
              <p className="text-sm text-ep-text-secondary mt-0.5">
                {pedidoACotizar.cantidad} {pedidoACotizar.unidad} · {pedidoACotizar.categoria}
              </p>
            </div>
            <CotizacionForm pedidoId={pedidoACotizar.id} onSuccess={handleSuccess} />
          </div>
        )}
      </Modal>

      {toastVisible && (
        <div className="fixed bottom-6 right-6 bg-ep-green text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg z-50">
          ¡Cotización enviada exitosamente!
        </div>
      )}
    </div>
  );
}
