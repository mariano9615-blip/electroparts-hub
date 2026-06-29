import { useNavigate } from 'react-router-dom';
import { IconPackage, IconFileInvoice, IconShoppingCart, IconPlus, IconInbox } from '@tabler/icons-react';
import { StatCard, PageHeader, EmptyState, Button } from '../../components/ui';
import { PedidosTable } from '../../components/domain/PedidosTable';
import { CotizacionesTable } from '../../components/domain/CotizacionesTable';
import { usePedidosStore } from '../../store/usePedidosStore';
import { useCotizacionesStore } from '../../store/useCotizacionesStore';
import { useOrdenesStore } from '../../store/useOrdenesStore';
import { COMPRADOR_ID } from '../../utils/constants';

export default function DashboardComprador() {
  const navigate = useNavigate();
  const pedidos = usePedidosStore((s) => s.pedidos);
  const cotizaciones = useCotizacionesStore((s) => s.cotizaciones);
  const ordenes = useOrdenesStore((s) => s.ordenes);

  const misPedidos = pedidos.filter((p) => p.compradorId === COMPRADOR_ID);
  const pedidosActivos = misPedidos.filter((p) =>
    ['abierto', 'en_cotizacion'].includes(p.estado),
  );
  const misCotizaciones = cotizaciones.filter((c) =>
    misPedidos.some((p) => p.id === c.pedidoId),
  );
  const cotizacionesPendientes = misCotizaciones.filter((c) => c.estado === 'pendiente');
  const misOrdenes = ordenes.filter((o) => o.compradorId === COMPRADOR_ID);
  const ordenesEnCurso = misOrdenes.filter((o) =>
    ['confirmada', 'en_transito'].includes(o.estado),
  );

  const ultimosPedidos = [...misPedidos]
    .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
    .slice(0, 3);

  const ultimasCotizaciones = [...misCotizaciones]
    .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
    .slice(0, 3);

  return (
    <div>
      <PageHeader
        titulo="Dashboard"
        descripcion="Resumen de tu actividad"
        accion={
          <Button variant="primary" onClick={() => navigate('/comprador/publicar')}>
            <IconPlus size={16} />
            Publicar pedido
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <StatCard
          label="Pedidos activos"
          value={pedidosActivos.length}
          icono={IconPackage}
          color="green"
        />
        <StatCard
          label="Cotizaciones recibidas"
          value={misCotizaciones.length}
          icono={IconFileInvoice}
          color="blue"
          badge={cotizacionesPendientes.length}
        />
        <StatCard
          label="Órdenes en curso"
          value={ordenesEnCurso.length}
          icono={IconShoppingCart}
          color="amber"
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-ep-border">
          <h2 className="text-xs font-bold text-ep-text-muted uppercase tracking-widest">
            Últimos pedidos
          </h2>
          <button
            onClick={() => navigate('/comprador/cotizaciones')}
            className="text-xs text-ep-green hover:text-ep-green-dark transition-colors font-semibold"
          >
            Ver todos →
          </button>
        </div>
        {ultimosPedidos.length === 0 ? (
          <EmptyState
            icono={IconInbox}
            titulo="No tenés pedidos publicados"
            mensaje="Publicá tu primer pedido y recibí cotizaciones de proveedores verificados"
            accion={{ label: 'Publicar pedido', onClick: () => navigate('/comprador/publicar') }}
          />
        ) : (
          <PedidosTable pedidos={ultimosPedidos} />
        )}
      </div>

      <div>
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-ep-border">
          <h2 className="text-xs font-bold text-ep-text-muted uppercase tracking-widest">
            Últimas cotizaciones
          </h2>
          <button
            onClick={() => navigate('/comprador/cotizaciones')}
            className="text-xs text-ep-green hover:text-ep-green-dark transition-colors font-semibold"
          >
            Ver todas →
          </button>
        </div>
        {ultimasCotizaciones.length === 0 ? (
          <EmptyState
            icono={IconFileInvoice}
            titulo="Todavía no recibiste cotizaciones"
            mensaje="Publicá un pedido para que los proveedores puedan cotizarte"
          />
        ) : (
          <CotizacionesTable cotizaciones={ultimasCotizaciones} pedidos={misPedidos} />
        )}
      </div>
    </div>
  );
}
