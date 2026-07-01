import { useNavigate } from 'react-router-dom';
import { IconPackage, IconFileInvoice, IconShoppingCart, IconPlus, IconInbox, IconCircleX } from '@tabler/icons-react';
import { StatCard, PageHeader, EmptyState, Button } from '../../components/ui';
import { PedidosTable } from '../../components/domain/PedidosTable';
import { CotizacionesTable } from '../../components/domain/CotizacionesTable';
import { usePedidosStore } from '../../store/usePedidosStore';
import { useCotizacionesStore } from '../../store/useCotizacionesStore';
import { COMPRADOR_ID } from '../../utils/constants';

export default function DashboardComprador() {
  const navigate = useNavigate();
  const pedidos = usePedidosStore((s) => s.pedidos);
  const cotizaciones = useCotizacionesStore((s) => s.cotizaciones);

  const misPedidos = pedidos.filter((p) => p.compradorId === COMPRADOR_ID);
  const pedidosActivos = misPedidos.filter((p) =>
    ['abierto', 'en_cotizacion'].includes(p.estado),
  );
  const pedidosEnNegociacion = misPedidos.filter((p) => p.estado === 'en_negociacion');
  const pedidosComprados = misPedidos.filter((p) => p.estado === 'adjudicado');
  const pedidosCancelados = misPedidos.filter((p) => p.estado === 'cancelado');

  const misCotizaciones = cotizaciones.filter((c) =>
    misPedidos.some((p) => p.id === c.pedidoId),
  );

  // Cotizaciones recibidas esta semana
  const inicioSemana = new Date();
  inicioSemana.setDate(inicioSemana.getDate() - 7);
  const cotizacionesSemana = misCotizaciones.filter(
    (c) => new Date(c.fechaCreacion) >= inicioSemana,
  ).length;

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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-5">
        <StatCard
          label="Pedidos activos"
          value={pedidosActivos.length}
          icono={IconPackage}
          color="green"
          sub={`Cotizaciones esta semana: ${cotizacionesSemana}`}
          onClick={() => navigate('/comprador/pedidos?tab=activos')}
        />
        <StatCard
          label="En negociación"
          value={pedidosEnNegociacion.length}
          icono={IconFileInvoice}
          color="amber"
          onClick={() => navigate('/comprador/pedidos?tab=en_negociacion')}
        />
        <StatCard
          label="Mis compras"
          value={pedidosComprados.length}
          icono={IconShoppingCart}
          color="blue"
          onClick={() => navigate('/comprador/pedidos?tab=comprados')}
        />
        <StatCard
          label="Cancelados"
          value={pedidosCancelados.length}
          icono={IconCircleX}
          color="red"
          onClick={() => navigate('/comprador/pedidos?tab=cancelados')}
        />
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-medium text-ep-text-muted uppercase tracking-[0.08em]">
            Últimos pedidos
          </span>
          <button
            onClick={() => navigate('/comprador/pedidos')}
            className="text-[11px] text-ep-blue font-medium hover:underline"
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
          <PedidosTable pedidos={ultimosPedidos} rol="comprador" />
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-medium text-ep-text-muted uppercase tracking-[0.08em]">
            Últimas cotizaciones
          </span>
          <button
            onClick={() => navigate('/comprador/cotizaciones-recibidas')}
            className="text-[11px] text-ep-blue font-medium hover:underline"
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
