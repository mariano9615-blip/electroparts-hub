import { useNavigate } from 'react-router-dom';
import { IconInbox, IconFilter, IconTrash } from '@tabler/icons-react';
import { Badge, Button, EmptyState, Modal, PageHeader } from '../../components/ui';
import { usePedidosStore } from '../../store/usePedidosStore';
import { useCotizacionesStore } from '../../store/useCotizacionesStore';
import { formatARS, formatFechaRelativa, getLabelEstadoCotizacion } from '../../utils/formatters';
import { useState } from 'react';
import type { Cotizacion } from '../../types';

type Tab = 'todas' | 'pendientes' | 'en_negociacion' | 'ganadas' | 'rechazadas';
type BadgeColor = 'green' | 'blue' | 'amber' | 'red' | 'gray';

const TABS: { id: Tab; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'pendientes', label: 'Pendientes' },
  { id: 'en_negociacion', label: 'En negociación' },
  { id: 'ganadas', label: 'Ganadas' },
  { id: 'rechazadas', label: 'Rechazadas' },
];

const ESTADO_COLOR: Record<string, BadgeColor> = {
  pendiente: 'gray',
  en_negociacion: 'amber',
  aceptada: 'green',
  rechazada: 'red',
};

const PROV_IDS = ['prov-1', 'prov-2', 'prov-3', 'prov-4', 'prov-demo-001'];

export default function MisCotizacionesProveedor() {
  const navigate = useNavigate();
  const [tabActiva, setTabActiva] = useState<Tab>('todas');
  const [cotizacionAEliminar, setCotizacionAEliminar] = useState<Cotizacion | null>(null);

  const pedidos = usePedidosStore((s) => s.pedidos);
  const cotizaciones = useCotizacionesStore((s) => s.cotizaciones);
  const eliminarCotizacion = useCotizacionesStore((s) => s.eliminarCotizacion);

  const misCotizaciones = [...cotizaciones]
    .filter((c) => PROV_IDS.includes(c.proveedorId))
    .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());

  const counts: Record<Tab, number> = {
    todas: misCotizaciones.length,
    pendientes: misCotizaciones.filter((c) => c.estado === 'pendiente').length,
    en_negociacion: misCotizaciones.filter((c) => c.estado === 'en_negociacion').length,
    ganadas: misCotizaciones.filter((c) => c.estado === 'aceptada').length,
    rechazadas: misCotizaciones.filter((c) => c.estado === 'rechazada').length,
  };

  const filtradas = misCotizaciones.filter((c) => {
    if (tabActiva === 'todas') return true;
    if (tabActiva === 'pendientes') return c.estado === 'pendiente';
    if (tabActiva === 'en_negociacion') return c.estado === 'en_negociacion';
    if (tabActiva === 'ganadas') return c.estado === 'aceptada';
    if (tabActiva === 'rechazadas') return c.estado === 'rechazada';
    return true;
  });

  const pedidosMap = Object.fromEntries(pedidos.map((p) => [p.id, p]));

  return (
    <div>
      <PageHeader
        titulo="Mis cotizaciones"
        descripcion="Estado de las cotizaciones que enviaste"
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-ep-border mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTabActiva(tab.id)}
            className={[
              'px-4 py-2.5 text-sm font-medium transition-colors duration-150 whitespace-nowrap flex items-center gap-1.5',
              tabActiva === tab.id
                ? 'border-b-2 border-ep-green text-ep-green'
                : 'text-ep-text-secondary hover:text-ep-text-primary border-b-2 border-transparent',
            ].join(' ')}
          >
            {tab.label}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              tabActiva === tab.id ? 'bg-ep-green text-white' : 'bg-ep-surface-raised text-ep-text-muted'
            }`}>
              {counts[tab.id]}
            </span>
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
        <div className="bg-ep-surface border border-ep-border rounded-lg overflow-hidden">
          {filtradas.map((cot, idx) => {
            const pedido = pedidosMap[cot.pedidoId];
            const badgeColor = ESTADO_COLOR[cot.estado] ?? 'gray';
            const label = getLabelEstadoCotizacion(cot.estado, 'proveedor');

            return (
              <div
                key={cot.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-ep-surface-raised transition-colors duration-150 ${
                  idx < filtradas.length - 1 ? 'border-b border-ep-border' : ''
                }`}
                onClick={() => navigate(`/proveedor/pedidos/${cot.pedidoId}`)}
              >
                {/* Info principal */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ep-text-primary truncate">
                    {pedido ? pedido.titulo : `Pedido ${cot.pedidoId}`}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge color={badgeColor}>{label}</Badge>
                    <span className="text-[11px] text-ep-text-muted">
                      Mi precio:{' '}
                      <span className="font-mono font-medium text-ep-text-secondary">
                        {formatARS(cot.precio)}
                      </span>
                    </span>
                    <span className="text-[11px] text-ep-text-muted">
                      Enviada {formatFechaRelativa(cot.fechaCreacion)}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCotizacionAEliminar(cot);
                  }}
                  className="p-1.5 rounded hover:bg-ep-surface-raised transition-colors duration-150 flex-shrink-0"
                  title="Eliminar cotización"
                >
                  <div className="text-ep-red">
                    <IconTrash size={13} stroke={2} />
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: confirmar eliminación */}
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
