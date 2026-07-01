import { useNavigate } from 'react-router-dom';
import { IconShoppingCart } from '@tabler/icons-react';
import { PageHeader, EmptyState } from '../../components/ui';
import { OrdenCard } from '../../components/ordenes/OrdenCard';
import { useOrdenesStore } from '../../store/useOrdenesStore';
import { COMPRADOR_ID } from '../../utils/constants';

export default function MisOrdenesComprador() {
  const navigate = useNavigate();
  const ordenes = useOrdenesStore((s) => s.ordenes);

  const misOrdenes = [...ordenes]
    .filter((o) => o.compradorId === COMPRADOR_ID)
    .sort(
      (a, b) =>
        new Date(b.fechaConfirmacion).getTime() - new Date(a.fechaConfirmacion).getTime(),
    );

  return (
    <div>
      <PageHeader
        titulo="Mis órdenes"
        descripcion="Operaciones confirmadas con proveedores"
      />

      {misOrdenes.length === 0 ? (
        <EmptyState
          icono={IconShoppingCart}
          titulo="Sin órdenes todavía"
          mensaje="Aceptá una cotización para generar tu primera orden"
          accion={{
            label: 'Ver cotizaciones',
            onClick: () => navigate('/comprador/cotizaciones'),
          }}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {misOrdenes.map((orden) => (
            <OrdenCard
              key={orden.id}
              orden={orden}
              onIrChat={
                orden.chatHabilitado
                  ? () => navigate(`/comprador/pedidos/${orden.pedidoId}`)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
