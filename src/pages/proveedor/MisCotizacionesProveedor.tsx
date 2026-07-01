import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconInbox, IconFilter, IconTrash, IconMessageCircle } from '@tabler/icons-react';
import { Button, EmptyState, Modal, PageHeader } from '../../components/ui';
import { CotizacionCard } from '../../components/cotizaciones/CotizacionCard';
import { usePedidosStore } from '../../store/usePedidosStore';
import { useCotizacionesStore } from '../../store/useCotizacionesStore';
import type { Cotizacion } from '../../types';

type Tab = 'todas' | 'pendientes' | 'aceptadas' | 'rechazadas';

const TABS: { id: Tab; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'pendientes', label: 'Pendientes' },
  { id: 'aceptadas', label: 'Aceptadas' },
  { id: 'rechazadas', label: 'Rechazadas' },
];

const PROV_IDS = ['prov-1', 'prov-2', 'prov-3', 'prov-4', 'prov-demo-001'];

export default function MisCotizacionesProveedor() {
  const [tabActiva, setTabActiva] = useState<Tab>('todas');
  const [cotizacionAEliminar, setCotizacionAEliminar] = useState<Cotizacion | null>(null);

  const pedidos = usePedidosStore((s) => s.pedidos);
  const cotizaciones = useCotizacionesStore((s) => s.cotizaciones);
  const eliminarCotizacion = useCotizacionesStore((s) => s.eliminarCotizacion);

  const misCotizaciones = [...cotizaciones]
    .filter((c) => PROV_IDS.includes(c.proveedorId))
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

  const pedidosMap = Object.fromEntries(pedidos.map((p) => [p.id, p]));

  const pedidoIdsConCotizaciones = [...new Set(filtradas.map((c) => c.pedidoId))];

  return (
    <div>
      <PageHeader
        titulo="Mis cotizaciones"
        descripcion="Estado de las cotizaciones que enviaste"
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
            titulo="Todavía no enviaste cotizaciones"
            mensaje="Explorá los pedidos disponibles y enviá tu primera cotización"
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
          {pedidoIdsConCotizaciones.map((pedidoId) => {
            const pedido = pedidosMap[pedidoId];
            return (
              <div key={pedidoId}>
                <p className="text-xs font-semibold text-ep-text-muted uppercase tracking-wide mb-2">
                  {pedido ? pedido.titulo : `Pedido ${pedidoId}`}
                </p>
                <div className="flex flex-col gap-2">
                  {filtradas
                    .filter((c) => c.pedidoId === pedidoId)
                    .map((cot) => (
                      <div key={cot.id} className="flex flex-col gap-1">
                        <CotizacionCard cotizacion={cot} />
                        <div className="flex justify-end items-center gap-2 pr-1">
                          {cot.estado === 'aceptada' && (
                            <Link
                              to={`/proveedor/pedidos/${cot.pedidoId}`}
                              className="flex items-center gap-1.5 text-xs font-medium text-ep-blue hover:text-ep-blue-dark transition-colors duration-150"
                            >
                              <div className="text-ep-blue">
                                <IconMessageCircle size={13} stroke={2} />
                              </div>
                              Ver chat
                            </Link>
                          )}
                          <button
                            onClick={() => setCotizacionAEliminar(cot)}
                            className="p-1.5 rounded hover:bg-ep-surface-raised transition-colors duration-150"
                            title="Eliminar cotización"
                          >
                            <div className="text-red-500">
                              <IconTrash size={13} stroke={2} />
                            </div>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: confirmar eliminación de cotización */}
      <Modal
        open={cotizacionAEliminar !== null}
        onClose={() => setCotizacionAEliminar(null)}
        title="Eliminar cotización"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setCotizacionAEliminar(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={() => {
                if (!cotizacionAEliminar) return;
                eliminarCotizacion(cotizacionAEliminar.id);
                setCotizacionAEliminar(null);
              }}
            >
              Eliminar
            </Button>
          </>
        }
      >
        {cotizacionAEliminar && (
          <p className="text-sm text-ep-text-secondary">
            ¿Eliminar tu cotización para{' '}
            <span className="font-semibold text-ep-text-primary">
              {pedidosMap[cotizacionAEliminar.pedidoId]?.titulo ?? cotizacionAEliminar.pedidoId}
            </span>
            ?
          </p>
        )}
      </Modal>
    </div>
  );
}
