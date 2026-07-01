import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconAlertCircle, IconClock } from '@tabler/icons-react';
import { Badge, Chat, EmptyState, PedidoStepper } from '../../components/ui';
import { usePedidosStore } from '../../store/usePedidosStore';
import { useCotizacionesStore } from '../../store/useCotizacionesStore';
import { formatFecha, formatARS } from '../../utils/formatters';
import { PROV_IDS } from '../../utils/constants';

type BadgeColor = 'green' | 'blue' | 'amber' | 'red' | 'gray';

const ESTADO_COLOR: Record<string, BadgeColor> = {
  abierto: 'green',
  en_cotizacion: 'blue',
  en_negociacion: 'amber',
  adjudicado: 'gray',
  cancelado: 'red',
};

const ESTADO_LABEL: Record<string, string> = {
  abierto: 'Abierto',
  en_cotizacion: 'En cotización',
  en_negociacion: 'En negociación',
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

  // Cotización del proveedor demo en este pedido
  const miCotizacion = useMemo(
    () =>
      cotizaciones.find(
        (c) =>
          c.pedidoId === (pedido?.id ?? '') &&
          (PROV_IDS as readonly string[]).includes(c.proveedorId),
      ) ?? null,
    [cotizaciones, pedido?.id],
  );

  const miCotizacionEnNegociacion = miCotizacion?.estado === 'en_negociacion';

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

  const ganadorSoyYo =
    cotizacionAceptada !== null &&
    (PROV_IDS as readonly string[]).includes(cotizacionAceptada.proveedorId);

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

      {/* Stepper de estado */}
      <PedidoStepper
        estado={pedido.estado}
        rol="proveedor"
        nombreProveedor={ganadorSoyYo ? cotizacionAceptada?.proveedorNombre : undefined}
        miCotizacionEnNegociacion={miCotizacionEnNegociacion}
        observacionBaja={pedido.observacionBaja}
      />

      {/* Indicador "en negociación" para mi cotización */}
      {miCotizacionEnNegociacion && (
        <div className="flex items-start gap-2.5 bg-ep-amber-light border border-ep-amber rounded-lg px-4 py-3 mb-6">
          <IconClock size={16} stroke={1.5} className="text-ep-amber mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-ep-amber-dark">
              Tu cotización está siendo evaluada
            </p>
            <p className="text-xs text-ep-amber-dark/80 mt-0.5">
              El comprador inició una negociación. Usá el chat para coordinar los detalles.
            </p>
          </div>
        </div>
      )}

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
