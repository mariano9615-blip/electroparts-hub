import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconPackage, IconFileInvoice, IconShoppingCart, IconCircleX } from '@tabler/icons-react';
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
  const navigate = useNavigate();
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const pedidos = usePedidosStore((s) => s.pedidos);
  const cotizaciones = useCotizacionesStore((s) => s.cotizaciones);
  const ordenes = useOrdenesStore((s) => s.ordenes);

  const pedidosDisponibles = pedidos.filter((p) =>
    ['abierto', 'en_cotizacion'].includes(p.estado),
  );
  const misCotizaciones = cotizaciones.filter((c) => PROV_IDS.includes(c.proveedorId));
  const misVentas = ordenes.filter((o) => ['prov-4', 'prov-demo-001'].includes(o.proveedorId));
  const misRechazadas = misCotizaciones.filter((c) => c.estado === 'rechazada');

  // Tasa de éxito: cotizaciones ganadas / total enviadas
  const ganadas = misCotizaciones.filter((c) => c.estado === 'aceptada').length;
  const total = misCotizaciones.length;
  const tasaExito = total > 0 ? Math.round((ganadas / total) * 100) : 0;

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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-5">
        <StatCard
          label="Pedidos disponibles"
          value={pedidosDisponibles.length}
          icono={IconPackage}
          color="blue"
          onClick={() => navigate('/proveedor/explorar')}
        />
        <StatCard
          label="Mis cotizaciones"
          value={misCotizaciones.length}
          icono={IconFileInvoice}
          color="green"
          sub={`Tasa de éxito: ${tasaExito}%`}
          onClick={() => navigate('/proveedor/cotizaciones')}
        />
        <StatCard
          label="Mis ventas"
          value={misVentas.length}
          icono={IconShoppingCart}
          color="amber"
          onClick={() => navigate('/proveedor/mis-ventas')}
        />
        <StatCard
          label="Rechazadas"
          value={misRechazadas.length}
          icono={IconCircleX}
          color="red"
          onClick={() => navigate('/proveedor/cotizaciones')}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-medium text-ep-text-muted uppercase tracking-[0.08em]">
            Pedidos recientes disponibles
          </span>
          <button
            onClick={() => navigate('/proveedor/explorar')}
            className="text-[11px] text-ep-blue font-medium hover:underline"
          >
            Ver todos →
          </button>
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
            rol="proveedor"
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
