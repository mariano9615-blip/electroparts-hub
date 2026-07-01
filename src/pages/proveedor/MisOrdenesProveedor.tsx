import { useNavigate } from 'react-router-dom';
import { IconShoppingCart } from '@tabler/icons-react';
import { PageHeader, EmptyState } from '../../components/ui';
import { OrdenCard } from '../../components/ordenes/OrdenCard';
import { useOrdenesStore } from '../../store/useOrdenesStore';

const PROV_IDS = ['prov-4', 'prov-demo-001'];

export default function MisOrdenesProveedor() {
  const navigate = useNavigate();
  const ordenes = useOrdenesStore((s) => s.ordenes);

  const misOrdenes = [...ordenes]
    .filter((o) => PROV_IDS.includes(o.proveedorId))
    .sort(
      (a, b) =>
        new Date(b.fechaConfirmacion).getTime() - new Date(a.fechaConfirmacion).getTime(),
    );

  return (
    <div>
      <PageHeader
        titulo="Mis órdenes"
        descripcion="Operaciones confirmadas donde fuiste proveedor"
      />

      {misOrdenes.length === 0 ? (
        <EmptyState
          icono={IconShoppingCart}
          titulo="Sin órdenes todavía"
          mensaje="Cuando un comprador acepte tu cotización, la orden aparecerá aquí"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {misOrdenes.map((orden) => (
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
