import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconShoppingCart, IconFilter } from '@tabler/icons-react';
import { PageHeader, EmptyState } from '../../components/ui';
import { OrdenCard } from '../../components/ordenes/OrdenCard';
import { useOrdenesStore } from '../../store/useOrdenesStore';
import type { EstadoOrden } from '../../types';

type Tab = 'todas' | 'ganadas' | 'en_transito' | 'cerradas';

const TABS: { id: Tab; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'ganadas', label: 'Ganadas' },
  { id: 'en_transito', label: 'En tránsito' },
  { id: 'cerradas', label: 'Cerradas' },
];

const PROV_IDS = ['prov-4', 'prov-demo-001'];

const estadoParaTab = (estado: EstadoOrden): Tab | null => {
  if (estado === 'confirmada') return 'ganadas';
  if (estado === 'en_transito') return 'en_transito';
  if (estado === 'entregada' || estado === 'disputada') return 'cerradas';
  return null;
};

export default function MisOrdenesProveedor() {
  const navigate = useNavigate();
  const [tabActiva, setTabActiva] = useState<Tab>('todas');
  const ordenes = useOrdenesStore((s) => s.ordenes);

  const misOrdenes = [...ordenes]
    .filter((o) => PROV_IDS.includes(o.proveedorId))
    .sort(
      (a, b) =>
        new Date(b.fechaConfirmacion).getTime() - new Date(a.fechaConfirmacion).getTime(),
    );

  const counts: Record<Tab, number> = {
    todas: misOrdenes.length,
    ganadas: misOrdenes.filter((o) => o.estado === 'confirmada').length,
    en_transito: misOrdenes.filter((o) => o.estado === 'en_transito').length,
    cerradas: misOrdenes.filter((o) => o.estado === 'entregada' || o.estado === 'disputada').length,
  };

  const filtradas =
    tabActiva === 'todas'
      ? misOrdenes
      : misOrdenes.filter((o) => estadoParaTab(o.estado) === tabActiva);

  return (
    <div>
      <PageHeader
        titulo="Mis ventas"
        descripcion="Operaciones confirmadas donde fuiste proveedor"
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-ep-border mb-5">
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
            icono={IconShoppingCart}
            titulo="Sin ventas todavía"
            mensaje="Cuando un comprador acepte tu cotización, la venta aparecerá aquí"
          />
        ) : (
          <EmptyState
            icono={IconFilter}
            titulo="Sin resultados"
            mensaje="No hay ventas con este estado"
          />
        )
      ) : (
        <div className="flex flex-col gap-3">
          {filtradas.map((orden) => (
            <OrdenCard
              key={orden.id}
              orden={orden}
              onIrChat={
                orden.chatHabilitado
                  ? () => navigate(`/proveedor/pedidos/${orden.pedidoId}`)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
