import { useState } from 'react';
import { IconPackage } from '@tabler/icons-react';
import { PageHeader, EmptyState, Input, Select, Badge } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';
import { PedidoCard } from '../../components/pedidos/PedidoCard';
import { CotizacionForm } from '../../components/cotizaciones/CotizacionForm';
import { usePedidosStore } from '../../store/usePedidosStore';
import { useCotizacionesStore } from '../../store/useCotizacionesStore';
import { CATEGORIAS } from '../../utils/constants';
import type { Pedido } from '../../types';

const PROV_DEMO_ID = 'prov-demo-001';

const CATEGORIA_OPTIONS = [
  { value: '', label: 'Todas las categorías' },
  ...CATEGORIAS.map((c) => ({ value: c, label: c })),
];

export default function PedidosDisponibles() {
  const [pedidoACotizar, setPedidoACotizar] = useState<Pedido | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const pedidos = usePedidosStore((s) => s.pedidos);
  const cotizaciones = useCotizacionesStore((s) => s.cotizaciones);

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
        titulo="Pedidos disponibles"
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
            return (
              <div key={pedido.id} className="relative">
                <PedidoCard
                  pedido={pedido}
                  onCotizar={cotizado ? undefined : () => setPedidoACotizar(pedido)}
                />
                {cotizado && (
                  <div className="absolute bottom-4 right-4">
                    <Badge color="gray">Ya cotizaste</Badge>
                  </div>
                )}
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
