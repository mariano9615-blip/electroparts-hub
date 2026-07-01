import { useMemo, type ComponentType } from 'react';
import {
  IconX,
  IconBell,
  IconPackage,
  IconFileInvoice,
  IconCircleCheck,
  IconThumbUp,
  IconAward,
  IconHandStop,
  IconThumbDown,
  IconMessage,
  IconRefresh,
} from '@tabler/icons-react';
import { EmptyState } from '../ui';
import { useNotificacionesStore, type TipoNotificacion, type Notificacion } from '../../store/useNotificacionesStore';
import { useRolStore } from '../../store/useRolStore';
import { formatFechaRelativa } from '../../utils/formatters';

const ICONOS_TIPO: Record<TipoNotificacion, ComponentType<{ size?: number; stroke?: number }>> = {
  nueva_cotizacion: IconFileInvoice,
  pedido_adjudicado: IconAward,
  orden_confirmada: IconCircleCheck,
  nueva_orden: IconPackage,
  cotizacion_aceptada: IconThumbUp,
  cotizacion_en_negociacion: IconHandStop,
  cotizacion_rechazada: IconThumbDown,
  mensaje_nuevo: IconMessage,
  estado_pedido_cambio: IconRefresh,
};

const COLORES_ICONO: Record<TipoNotificacion, string> = {
  nueva_cotizacion: 'bg-ep-blue-light text-ep-blue',
  pedido_adjudicado: 'bg-ep-amber-light text-ep-amber',
  orden_confirmada: 'bg-ep-green-light text-ep-green',
  nueva_orden: 'bg-ep-blue-light text-ep-blue',
  cotizacion_aceptada: 'bg-ep-green-light text-ep-green',
  cotizacion_en_negociacion: 'bg-ep-amber-light text-ep-amber',
  cotizacion_rechazada: 'bg-ep-red-light text-ep-red',
  mensaje_nuevo: 'bg-ep-blue-light text-ep-blue',
  estado_pedido_cambio: 'bg-ep-blue-light text-ep-blue',
};

interface NotificacionesPanelProps {
  abierto: boolean;
  onCerrar: () => void;
}

function ItemNotificacion({
  notif,
  onMarcarLeida,
  onEliminar,
}: {
  notif: Notificacion;
  onMarcarLeida: () => void;
  onEliminar: () => void;
}) {
  const Icono = ICONOS_TIPO[notif.tipo];
  const colorIcono = COLORES_ICONO[notif.tipo];

  return (
    <div
      className={`flex gap-3 px-4 py-3 hover:bg-ep-surface-raised transition-colors duration-150 cursor-pointer ${
        !notif.leida ? 'bg-ep-surface-raised' : ''
      }`}
      onClick={onMarcarLeida}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${colorIcono}`}
      >
        <Icono size={15} stroke={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm leading-tight ${
              !notif.leida
                ? 'font-semibold text-ep-text-primary'
                : 'font-medium text-ep-text-secondary'
            }`}
          >
            {notif.titulo}
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
            {!notif.leida && (
              <span className="w-2 h-2 rounded-full bg-ep-green flex-shrink-0" />
            )}
            <button
              className="p-0.5 rounded text-ep-text-muted hover:text-ep-red hover:bg-ep-red-light transition-colors duration-150"
              onClick={(e) => {
                e.stopPropagation();
                onEliminar();
              }}
              aria-label="Eliminar notificación"
            >
              <IconX size={12} />
            </button>
          </div>
        </div>
        <p className="text-xs text-ep-text-secondary mt-0.5 leading-snug">{notif.mensaje}</p>
        <p className="text-xs text-ep-text-muted mt-1">{formatFechaRelativa(notif.fecha)}</p>
      </div>
    </div>
  );
}

export const NotificacionesPanel = ({ abierto, onCerrar }: NotificacionesPanelProps) => {
  const rol = useRolStore((s) => s.rol);
  const todas = useNotificacionesStore((s) => s.notificaciones);
  const notificaciones = useMemo(() => todas.filter((n) => n.rolDestino === rol), [todas, rol]);
  const { marcarLeida, marcarTodasLeidas, eliminarNotificacion } = useNotificacionesStore.getState();
  const hayNoLeidas = notificaciones.some((n) => !n.leida);

  return (
    <>
      {abierto && (
        <div className="fixed inset-0 z-40" onClick={onCerrar} />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-80 bg-ep-surface border-l border-ep-border shadow-2xl z-50 flex flex-col transition-transform duration-200 ease-in-out ${
          abierto ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!abierto}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-ep-border flex-shrink-0">
          <h2 className="text-sm font-bold text-ep-text-primary">Notificaciones</h2>
          <div className="flex items-center gap-3">
            {hayNoLeidas && (
              <button
                className="text-xs font-medium text-ep-blue hover:text-ep-blue-dark transition-colors duration-150"
                onClick={marcarTodasLeidas}
              >
                Marcar todas como leídas
              </button>
            )}
            <button
              className="p-1.5 rounded-lg text-ep-text-secondary hover:bg-ep-surface-raised transition-colors duration-150"
              onClick={onCerrar}
              aria-label="Cerrar notificaciones"
            >
              <IconX size={16} />
            </button>
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto">
          {notificaciones.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icono={IconBell}
                titulo="Sin notificaciones"
                mensaje="No hay notificaciones para mostrar"
              />
            </div>
          ) : (
            <div className="divide-y divide-ep-border">
              {notificaciones.map((notif) => (
                <ItemNotificacion
                  key={notif.id}
                  notif={notif}
                  onMarcarLeida={() => marcarLeida(notif.id)}
                  onEliminar={() => eliminarNotificacion(notif.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
