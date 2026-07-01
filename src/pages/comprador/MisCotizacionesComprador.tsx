import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconInbox, IconFilter } from '@tabler/icons-react';
import { PageHeader, EmptyState } from '../../components/ui';
import { CotizacionCard } from '../../components/cotizaciones/CotizacionCard';
import { usePedidosStore } from '../../store/usePedidosStore';
import { useCotizacionesStore } from '../../store/useCotizacionesStore';
import { COMPRADOR_ID } from '../../utils/constants';

type Tab = 'todas' | 'pendientes' | 'aceptadas' | 'rechazadas';

const TABS: { id: Tab; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'pendientes', label: 'Pendientes' },
  { id: 'aceptadas', label: 'Aceptadas' },
  { id: 'rechazadas', label: 'Rechazadas' },
];

export default function MisCotizacionesComprador() {
  const navigate = useNavigate();
  const [tabActiva, setTabActiva] = useState<Tab>('todas');

  const pedidos = usePedidosStore((s) => s.pedidos);
  const cotizaciones = useCotizacionesStore((s) => s.cotizaciones);

  const misPedidos = pedidos.filter((p) => p.compradorId === COMPRADOR_ID);
  const misPedidoIds = misPedidos.map((p) => p.id);

  const misCotizaciones = [...cotizaciones]
    .filter((c) => misPedidoIds.includes(c.pedidoId))
    .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());

  const counts = {
    todas: misCotizaciones.length,
    pendientes: misCotizaciones.filter((c) => c.estado === 'pendiente').length,
    aceptadas: misCotizaciones.filter((c) => c.estado === 'aceptada').length,
    rechazadas: misCotizaciones.filter((c) => c.estado === 'rechazada').length,
  };

  const filtradas = misCotizaciones.filter((c) => {
    if (tabActiva === 'todas') return true;
    if (tabActiva === 'pendientes') return c.estado === 'pendiente';
    if (tabActiva === 'aceptadas') return c.estado === 'aceptada';
    if (tabActiva === 'rechazadas') return c.estado === 'rechazada';
    return true;
  });

  const pedidosMap = Object.fromEntries(misPedidos.map((p) => [p.id, p]));

  const pedidosConCotizaciones = misPedidoIds
    .filter((id) => filtradas.some((c) => c.pedidoId === id))
    .map((id) => pedidosMap[id])
    .filter(Boolean);

  return (
    <div>
      <PageHeader
        titulo="Cotizaciones recibidas"
        descripcion="Cotizaciones de proveedores para tus pedidos publicados"
      />

      <div className="flex gap-1 border-b border-ep-border mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTabActiva(tab.id)}
            className={[
              'px-4 py-2.5 text-sm font-medium transition-colors duration-150 whitespace-nowrap',
              tabActiva === tab.id
                ? 'border-b-2 border-ep-green text-ep-green'
                : 'text-ep-text-secondary hover:text-ep-text-primary border-b-2 border-transparent',
            ].join(' ')}
          >
            {tab.label} ({counts[tab.id]})
          </button>
        ))}
      </div>

      {filtradas.length === 0 ? (
        tabActiva === 'todas' ? (
          <EmptyState
            icono={IconInbox}
            titulo="Todavía no recibiste cotizaciones"
            mensaje="Publicá un pedido para que los proveedores verificados puedan cotizarte"
            accion={{ label: 'Publicar pedido', onClick: () => navigate('/comprador/publicar') }}
          />
        ) : (
          <EmptyState
            icono={IconFilter}
            titulo="Sin resultados"
            mensaje="No hay cotizaciones con este estado"
          />
        )
      ) : (
        <div className="flex flex-col gap-6">
          {pedidosConCotizaciones.map((pedido) => (
            <div key={pedido.id}>
              <p className="text-xs font-semibold text-ep-text-muted uppercase tracking-wide mb-2">
                {pedido.titulo}
              </p>
              <div className="flex flex-col gap-2">
                {filtradas
                  .filter((c) => c.pedidoId === pedido.id)
                  .map((cot) => (
                    <CotizacionCard
                      key={cot.id}
                      cotizacion={cot}
                      onAceptar={() => {
                        useCotizacionesStore.getState().aceptarCotizacion(cot.id);
                        navigate('/comprador/mis-compras');
                      }}
                      onRechazar={() => {
                        useCotizacionesStore.getState().rechazarCotizacion(cot.id);
                      }}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
