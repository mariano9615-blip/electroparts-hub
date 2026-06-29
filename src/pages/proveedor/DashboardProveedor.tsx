import { useState } from 'react';
import { IconPackage, IconFileInvoice, IconShoppingCart } from '@tabler/icons-react';
import { StatCard, PageHeader, EmptyState } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';
import { PedidosTable } from '../../components/domain/PedidosTable';
import { CotizacionForm } from '../../components/cotizaciones/CotizacionForm';
import { usePedidosStore } from '../../store/usePedidosStore';
import { useCotizacionesStore } from '../../store/useCotizacionesStore';
import { useOrdenesStore } from '../../store/useOrdenesStore';
import type { Pedido } from '../../types';

const PROV_IDS = ['prov-1', 'prov-2', 'prov-3', 'prov-4', 'prov-demo-001'];

export default function DashboardProveedor() {
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const pedidos = usePedidosStore((s) => s.pedidos);
  const cotizaciones = useCotizacionesStore((s) => s.cotizaciones);
  const ordenes = useOrdenesStore((s) => s.ordenes);

  const pedidosDisponibles = pedidos.filter((p) =>
    ['abierto', 'en_cotizacion'].includes(p.estado),
  );
  const misCotizaciones = cotizaciones.filter((c) => PROV_IDS.includes(c.proveedorId));
  const misOrdenes = ordenes.filter((o) => ['prov-4', 'prov-demo-001'].includes(o.proveedorId));

  const ultimosPedidos = [...pedidosDisponibles]
    .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
    .slice(0, 5);

  const handleCotizarExito = () => {
    setPedidoSeleccionado(null);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  return (
    <div>
      <PageHeader titulo="Dashboard" descripcion="Tu actividad como proveedor" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <StatCard
          label="Pedidos disponibles"
          value={pedidosDisponibles.length}
          icono={IconPackage}
          color="blue"
        />
        <StatCard
          label="Cotizaciones enviadas"
          value={misCotizaciones.length}
          icono={IconFileInvoice}
          color="green"
        />
        <StatCard
          label="Órdenes confirmadas"
          value={misOrdenes.length}
          icono={IconShoppingCart}
          color="amber"
        />
      </div>

      <div>
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-ep-border">
          <h2 className="text-xs font-bold text-ep-text-muted uppercase tracking-widest">
            Pedidos recientes disponibles
          </h2>
        </div>
        {ultimosPedidos.length === 0 ? (
          <EmptyState
            icono={IconPackage}
            titulo="No hay pedidos disponibles"
            mensaje="No hay pedidos disponibles en este momento"
          />
        ) : (
          <PedidosTable
            pedidos={ultimosPedidos}
            onCotizar={(pedido) => setPedidoSeleccionado(pedido)}
          />
        )}
      </div>

      <Modal
        open={pedidoSeleccionado !== null}
        onClose={() => setPedidoSeleccionado(null)}
        title="Enviar cotización"
      >
        {pedidoSeleccionado && (
          <div>
            <div className="mb-4 pb-4 border-b border-ep-border">
              <p className="font-semibold text-ep-text-primary text-sm">
                {pedidoSeleccionado.titulo}
              </p>
              <p className="text-sm text-ep-text-secondary mt-0.5">
                {pedidoSeleccionado.cantidad} {pedidoSeleccionado.unidad} ·{' '}
                {pedidoSeleccionado.categoria}
              </p>
            </div>
            <CotizacionForm
              pedidoId={pedidoSeleccionado.id}
              onSuccess={handleCotizarExito}
            />
          </div>
        )}
      </Modal>

      {toastVisible && (
        <div className="fixed bottom-6 right-6 bg-ep-green text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-lg z-50">
          ¡Cotización enviada exitosamente!
        </div>
      )}
    </div>
  );
}
