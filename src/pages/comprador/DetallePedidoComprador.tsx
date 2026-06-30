import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconAlertCircle, IconInbox, IconAlertTriangle } from '@tabler/icons-react';
import { Badge, Button, EmptyState, Modal } from '../../components/ui';
import { usePedidosStore } from '../../store/usePedidosStore';
import { useCotizacionesStore } from '../../store/useCotizacionesStore';
import { useOrdenesStore } from '../../store/useOrdenesStore';
import { useNotificacionesStore } from '../../store/useNotificacionesStore';
import { formatFecha, formatARS } from '../../utils/formatters';
import type { Cotizacion } from '../../types';

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

const COT_ESTADO_COLOR: Record<string, BadgeColor> = {
  pendiente: 'amber',
  aceptada: 'green',
  rechazada: 'red',
};

const COT_ESTADO_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
};

const TH = 'px-3 py-2 text-[10px] font-medium text-ep-text-muted uppercase tracking-[0.06em] border-b border-ep-border';

export default function DetallePedidoComprador() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [modalAdjudicar, setModalAdjudicar] = useState<Cotizacion | null>(null);
  const [modalRechazar, setModalRechazar] = useState<Cotizacion | null>(null);

  const pedidos = usePedidosStore((s) => s.pedidos);
  const cotizaciones = useCotizacionesStore((s) => s.cotizaciones);
  const ordenes = useOrdenesStore((s) => s.ordenes);
  const aceptarCotizacion = useCotizacionesStore((s) => s.aceptarCotizacion);
  const rechazarCotizacion = useCotizacionesStore((s) => s.rechazarCotizacion);

  const pedido = pedidos.find((p) => p.id === id);

  if (!pedido) {
    return (
      <div>
        <button
          onClick={() => navigate('/comprador/cotizaciones')}
          className="flex items-center gap-1.5 text-sm text-ep-text-muted hover:text-ep-text-primary transition-colors duration-150 mb-6"
        >
          <IconArrowLeft size={15} stroke={2} />
          Volver
        </button>
        <EmptyState
          icono={IconAlertCircle}
          titulo="Pedido no encontrado"
          mensaje="El pedido que buscás no existe o fue eliminado"
          accion={{ label: 'Volver a cotizaciones', onClick: () => navigate('/comprador/cotizaciones') }}
        />
      </div>
    );
  }

  const cotizacionesPedido = [...cotizaciones]
    .filter((c) => c.pedidoId === pedido.id)
    .sort((a, b) => a.precio - b.precio);

  const precioMinimo =
    cotizacionesPedido.length > 0
      ? Math.min(...cotizacionesPedido.map((c) => c.precio))
      : null;

  const pedidoAdjudicado = pedido.estado === 'adjudicado';
  const cotizacionAceptada = cotizacionesPedido.find((c) => c.estado === 'aceptada') ?? null;
  const ordenAdjudicada = ordenes.find((o) => o.pedidoId === pedido.id) ?? null;

  const handleConfirmarAdjudicacion = () => {
    if (!modalAdjudicar) return;
    // Notificar a los proveedores cuyas cotizaciones serán rechazadas automáticamente
    cotizacionesPedido
      .filter((c) => c.id !== modalAdjudicar.id && c.estado === 'pendiente')
      .forEach((c) => {
        useNotificacionesStore.getState().agregarNotificacion({
          tipo: 'pedido_adjudicado',
          rolDestino: 'proveedor',
          titulo: 'Cotización no seleccionada',
          mensaje: `Tu cotización para este pedido no fue seleccionada`,
          entidadId: c.id,
        });
      });
    aceptarCotizacion(modalAdjudicar.id);
    setModalAdjudicar(null);
  };

  const handleConfirmarRechazo = () => {
    if (!modalRechazar) return;
    rechazarCotizacion(modalRechazar.id);
    useNotificacionesStore.getState().agregarNotificacion({
      tipo: 'pedido_adjudicado',
      rolDestino: 'proveedor',
      titulo: 'Cotización rechazada',
      mensaje: `Tu cotización fue rechazada por el comprador`,
      entidadId: modalRechazar.id,
    });
    setModalRechazar(null);
  };

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

      {/* Header del pedido */}
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

      {/* Card de información */}
      <div className="bg-ep-surface border border-ep-border rounded-lg p-5 mb-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Columna izquierda: descripción */}
          <div>
            <p className="text-[11px] text-ep-text-muted uppercase tracking-wide font-medium mb-2">
              Descripción
            </p>
            <p className="text-sm text-ep-text-primary leading-relaxed">{pedido.descripcion}</p>
          </div>

          {/* Columna derecha: datos clave */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 content-start">
            {pedido.presupuestoMax != null && (
              <div>
                <p className="text-[11px] text-ep-text-muted uppercase tracking-wide">
                  Presupuesto máx.
                </p>
                <p className="text-sm font-medium text-ep-text-primary mt-0.5 font-mono">
                  {formatARS(pedido.presupuestoMax)}
                </p>
              </div>
            )}
            <div>
              <p className="text-[11px] text-ep-text-muted uppercase tracking-wide">Fecha límite</p>
              <p className="text-sm font-medium text-ep-text-primary mt-0.5">
                {formatFecha(pedido.fechaLimite)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-ep-text-muted uppercase tracking-wide">Cantidad</p>
              <p className="text-sm font-medium text-ep-text-primary mt-0.5 font-mono">
                {pedido.cantidad} {pedido.unidad}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-ep-text-muted uppercase tracking-wide">Publicado</p>
              <p className="text-sm font-medium text-ep-text-primary mt-0.5">
                {formatFecha(pedido.fechaCreacion)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-ep-text-muted uppercase tracking-wide">Cotizaciones</p>
              <p className="text-sm font-medium text-ep-text-primary mt-0.5">
                {pedido.cotizacionesRecibidas}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección cotizaciones */}
      <div>
        <h2 className="text-xs font-bold text-ep-text-muted uppercase tracking-widest border-b border-ep-border pb-2.5 mb-4">
          Cotizaciones recibidas ({cotizacionesPedido.length})
        </h2>

        {/* Banner de adjudicación */}
        {pedidoAdjudicado && cotizacionAceptada && (
          <div className="bg-ep-green-light border border-ep-green rounded-lg px-4 py-3 text-sm text-ep-green-dark mb-4">
            Pedido adjudicado a{' '}
            <span className="font-semibold">{cotizacionAceptada.proveedorNombre}</span>
            {ordenAdjudicada && (
              <> el {formatFecha(ordenAdjudicada.fechaConfirmacion)}</>
            )}
          </div>
        )}

        {cotizacionesPedido.length === 0 ? (
          <EmptyState
            icono={IconInbox}
            titulo="Aún no hay cotizaciones para este pedido"
            mensaje="Los proveedores verificados serán notificados automáticamente."
          />
        ) : (
          <div className="bg-ep-surface border border-ep-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ep-surface-raised">
                  <th className={`${TH} text-left`}>Proveedor</th>
                  <th className={`${TH} text-right`}>Precio</th>
                  <th className={`${TH} text-right`}>Precio unitario</th>
                  <th className={`${TH} text-left`}>Entrega</th>
                  <th className={`${TH} text-left`}>Notas</th>
                  <th className={`${TH} text-right`}>Estado</th>
                  {!pedidoAdjudicado && (
                    <th className={`${TH} text-right`}>Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {cotizacionesPedido.map((cot) => {
                  const esMejorPrecio = precioMinimo !== null && cot.precio === precioMinimo;
                  const precioUnitario =
                    pedido.cantidad > 0 ? cot.precio / pedido.cantidad : cot.precio;
                  const notasTruncadas =
                    cot.notas && cot.notas.length > 60
                      ? cot.notas.slice(0, 60) + '...'
                      : cot.notas;

                  return (
                    <tr
                      key={cot.id}
                      className={[
                        'border-b border-ep-border last:border-0 transition-colors duration-150',
                        esMejorPrecio ? 'bg-ep-green-light' : 'hover:bg-ep-surface-raised',
                      ].join(' ')}
                    >
                      <td className="px-3 py-2.5 font-medium text-ep-text-primary">
                        <span className="flex items-center gap-2">
                          {cot.proveedorNombre}
                          {esMejorPrecio && (
                            <span className="bg-ep-green text-white text-[10px] px-2 py-0.5 rounded-full">
                              Mejor precio
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-ep-text-primary">
                        {formatARS(cot.precio)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-[11px] text-ep-text-muted">
                        {formatARS(Math.round(precioUnitario))} / {pedido.unidad}
                      </td>
                      <td className="px-3 py-2.5 text-ep-text-muted">{cot.tiempoEntrega}</td>
                      <td
                        className="px-3 py-2.5 text-ep-text-muted max-w-[200px]"
                        title={cot.notas}
                      >
                        {notasTruncadas ?? '—'}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <Badge color={COT_ESTADO_COLOR[cot.estado] ?? 'gray'}>
                          {COT_ESTADO_LABEL[cot.estado] ?? cot.estado}
                        </Badge>
                      </td>
                      {!pedidoAdjudicado && (
                        <td className="px-3 py-2.5 text-right">
                          {cot.estado === 'pendiente' && (
                            <span className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setModalAdjudicar(cot)}
                              >
                                Adjudicar
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setModalRechazar(cot)}
                              >
                                Rechazar
                              </Button>
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmación: Adjudicar */}
      <Modal
        open={modalAdjudicar !== null}
        onClose={() => setModalAdjudicar(null)}
        title="Confirmar adjudicación"
        size="md"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setModalAdjudicar(null)}>
              Cancelar
            </Button>
            <Button variant="primary" size="md" onClick={handleConfirmarAdjudicacion}>
              Confirmar adjudicación
            </Button>
          </>
        }
      >
        {modalAdjudicar && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[11px] text-ep-text-muted uppercase tracking-wide mb-1">
                  Proveedor
                </p>
                <p className="text-sm font-medium text-ep-text-primary">
                  {modalAdjudicar.proveedorNombre}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-ep-text-muted uppercase tracking-wide mb-1">
                  Precio total
                </p>
                <p className="text-sm font-medium text-ep-text-primary font-mono">
                  {formatARS(modalAdjudicar.precio)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-ep-text-muted uppercase tracking-wide mb-1">
                  Entrega estimada
                </p>
                <p className="text-sm font-medium text-ep-text-primary">
                  {modalAdjudicar.tiempoEntrega}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 bg-ep-amber-light border border-ep-amber rounded-lg px-4 py-3">
              <IconAlertTriangle
                size={16}
                stroke={2}
                className="text-ep-amber mt-0.5 shrink-0"
              />
              <p className="text-sm text-ep-amber-dark leading-relaxed">
                Esta acción creará una orden de compra y notificará al proveedor. Las demás
                cotizaciones de este pedido serán rechazadas automáticamente.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de confirmación: Rechazar cotización individual */}
      <Modal
        open={modalRechazar !== null}
        onClose={() => setModalRechazar(null)}
        title="Rechazar cotización"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setModalRechazar(null)}>
              Cancelar
            </Button>
            <Button variant="danger" size="md" onClick={handleConfirmarRechazo}>
              Confirmar rechazo
            </Button>
          </>
        }
      >
        {modalRechazar && (
          <p className="text-sm text-ep-text-secondary">
            ¿Rechazar la cotización de{' '}
            <span className="font-semibold text-ep-text-primary">
              {modalRechazar.proveedorNombre}
            </span>
            ?
          </p>
        )}
      </Modal>
    </div>
  );
}
