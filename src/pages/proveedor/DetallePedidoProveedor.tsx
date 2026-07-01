import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconAlertCircle } from '@tabler/icons-react';
import { Badge, Chat, EmptyState } from '../../components/ui';
import { usePedidosStore } from '../../store/usePedidosStore';
import { useCotizacionesStore } from '../../store/useCotizacionesStore';
import { formatFecha, formatARS } from '../../utils/formatters';

type BadgeColor = 'green' | 'blue' | 'amber' | 'red' | 'gray';

const ESTADO_COLOR: Record<string, BadgeColor> = {
  abierto: 'green',
  en_cotizacion: 'blue',
  adjudicado: 'gray',
  cancelado: 'red',
};

const ESTADO_LABEL: Record<string, string> = {
  abierto: 'Abierto',
  en_cotizacion: 'En cotización',
  adjudicado: 'Adjudicado',
  cancelado: 'Cancelado',
};

export default function DetallePedidoProveedor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const pedidos = usePedidosStore((s) => s.pedidos);
  const cotizaciones = useCotizacionesStore((s) => s.cotizaciones);

  const pedido = pedidos.find((p) => p.id === id);

  const cotizacionAceptada = useMemo(
    () => cotizaciones.find((c) => c.pedidoId === (pedido?.id ?? '') && c.estado === 'aceptada') ?? null,
    [cotizaciones, pedido?.id],
  );

  if (!pedido) {
    return (
      <div>
        <button
          onClick={() => navigate('/proveedor/cotizaciones')}
          className="flex items-center gap-1.5 text-sm text-ep-text-muted hover:text-ep-text-primary transition-colors duration-150 mb-6"
        >
          <IconArrowLeft size={15} stroke={2} />
          Volver
        </button>
        <EmptyState
          icono={IconAlertCircle}
          titulo="Pedido no encontrado"
          mensaje="El pedido que buscás no existe o fue eliminado"
          accion={{ label: 'Volver a cotizaciones', onClick: () => navigate('/proveedor/cotizaciones') }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Botón volver */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-ep-text-muted hover:text-ep-text-primary transition-colors duration-150 mb-4"
      >
        <IconArrowLeft size={15} stroke={2} />
        Volver
      </button>

      {/* Header */}
      <div className="flex items-start justify-between border-b border-ep-border pb-5 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ep-text-primary leading-tight">{pedido.titulo}</h1>
          <p className="text-sm text-ep-text-muted mt-1">
            {pedido.categoria} · {pedido.cantidad} {pedido.unidad}
          </p>
        </div>
        <Badge color={ESTADO_COLOR[pedido.estado] ?? 'gray'}>
          {ESTADO_LABEL[pedido.estado] ?? pedido.estado}
        </Badge>
      </div>

      {/* Resumen cotización aceptada */}
      {cotizacionAceptada && (
        <div className="bg-ep-surface border border-ep-border rounded-lg p-5 mb-6">
          <p className="text-xs font-bold text-ep-text-muted uppercase tracking-widest border-b border-ep-border pb-2.5 mb-4">
            Tu cotización aceptada
          </p>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-[11px] text-ep-text-muted uppercase tracking-wide mb-1">Precio ofertado</p>
              <p className="text-sm font-medium text-ep-text-primary font-mono">
                {formatARS(cotizacionAceptada.precio)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-ep-text-muted uppercase tracking-wide mb-1">Tiempo de entrega</p>
              <p className="text-sm font-medium text-ep-text-primary">{cotizacionAceptada.tiempoEntrega}</p>
            </div>
            <div>
              <p className="text-[11px] text-ep-text-muted uppercase tracking-wide mb-1">Fecha adjudicación</p>
              <p className="text-sm font-medium text-ep-text-primary">
                {formatFecha(cotizacionAceptada.fechaCreacion)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chat solo cuando el pedido está adjudicado */}
      {pedido.estado === 'adjudicado' && (
        <Chat pedidoId={pedido.id} otroNombre="Comprador Demo" />
      )}
    </div>
  );
}
