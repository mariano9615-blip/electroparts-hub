import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconX, IconMessage, IconBuilding } from '@tabler/icons-react';
import { EmptyState } from '../ui';
import { usePedidosStore } from '../../store/usePedidosStore';
import { useCotizacionesStore } from '../../store/useCotizacionesStore';
import { useMensajesStore } from '../../store/useMensajesStore';
import { useRolStore } from '../../store/useRolStore';
import { formatFechaRelativa } from '../../utils/formatters';
import { COMPRADOR_ID, PROV_IDS } from '../../utils/constants';
import type { MensajePedido, Pedido } from '../../types';

interface ChatsActivosPanelProps {
  abierto: boolean;
  onCerrar: () => void;
}

interface ChatActivo {
  pedido: Pedido;
  otroNombre: string;
  ultimoMensaje: MensajePedido | null;
  noLeidos: number;
}

export const ChatsActivosPanel = ({ abierto, onCerrar }: ChatsActivosPanelProps) => {
  const navigate = useNavigate();
  const rol = useRolStore((s) => s.rol);
  const pedidos = usePedidosStore((s) => s.pedidos);
  const cotizaciones = useCotizacionesStore((s) => s.cotizaciones);
  const mensajesPorPedido = useMensajesStore((s) => s.mensajesPorPedido);

  const chatsActivos = useMemo<ChatActivo[]>(() => {
    // Pedidos con chat habilitado: en negociación (para coordinar antes de adjudicar) o adjudicados
    const pedidosConChat =
      rol === 'comprador'
        ? pedidos.filter(
            (p) =>
              p.compradorId === COMPRADOR_ID &&
              (p.estado === 'en_negociacion' || p.estado === 'adjudicado'),
          )
        : pedidos.filter((p) => {
            const miCot = cotizaciones.find(
              (c) => c.pedidoId === p.id && (PROV_IDS as readonly string[]).includes(c.proveedorId),
            );
            return miCot != null && (miCot.estado === 'en_negociacion' || miCot.estado === 'aceptada');
          });

    const items: ChatActivo[] = pedidosConChat.map((pedido) => {
      const cotizacionRelevante =
        rol === 'comprador'
          ? cotizaciones.find(
              (c) => c.pedidoId === pedido.id && (c.estado === 'aceptada' || c.estado === 'en_negociacion'),
            )
          : cotizaciones.find(
              (c) =>
                c.pedidoId === pedido.id &&
                (PROV_IDS as readonly string[]).includes(c.proveedorId),
            );

      const otroNombre =
        rol === 'comprador' ? (cotizacionRelevante?.proveedorNombre ?? 'Proveedor') : 'Comprador Demo';

      const mensajes = mensajesPorPedido[pedido.id] ?? [];
      const ultimoMensaje = mensajes.length > 0 ? mensajes[mensajes.length - 1] : null;
      const noLeidos = mensajes.filter((m) => !m.leido && m.autorRol !== rol).length;

      return { pedido, otroNombre, ultimoMensaje, noLeidos };
    });

    return items.sort((a, b) => {
      const fa = a.ultimoMensaje?.timestamp ?? a.pedido.fechaCreacion;
      const fb = b.ultimoMensaje?.timestamp ?? b.pedido.fechaCreacion;
      return new Date(fb).getTime() - new Date(fa).getTime();
    });
  }, [rol, pedidos, cotizaciones, mensajesPorPedido]);

  const irAChat = (pedidoId: string) => {
    navigate(`/${rol}/pedidos/${pedidoId}`);
    onCerrar();
  };

  return (
    <>
      {abierto && <div className="fixed inset-0 z-40" onClick={onCerrar} />}

      <div
        className={`fixed top-0 right-0 h-full w-80 bg-ep-surface border-l border-ep-border shadow-2xl z-50 flex flex-col transition-transform duration-200 ease-in-out ${
          abierto ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!abierto}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-ep-border flex-shrink-0">
          <h2 className="text-sm font-bold text-ep-text-primary">Chats activos</h2>
          <button
            className="p-1.5 rounded-lg text-ep-text-secondary hover:bg-ep-surface-raised transition-colors duration-150"
            onClick={onCerrar}
            aria-label="Cerrar chats activos"
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chatsActivos.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icono={IconMessage}
                titulo="Sin chats activos"
                mensaje="Cuando negocies o te adjudiquen un pedido, el chat aparecerá acá"
              />
            </div>
          ) : (
            <div className="divide-y divide-ep-border">
              {chatsActivos.map(({ pedido, otroNombre, ultimoMensaje, noLeidos }) => (
                <div
                  key={pedido.id}
                  className={`flex gap-3 px-4 py-3 hover:bg-ep-surface-raised transition-colors duration-150 cursor-pointer ${
                    noLeidos > 0 ? 'bg-ep-surface-raised' : ''
                  }`}
                  onClick={() => irAChat(pedido.id)}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-ep-blue-light text-ep-blue">
                    <IconBuilding size={15} stroke={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm leading-tight truncate ${
                          noLeidos > 0 ? 'font-semibold text-ep-text-primary' : 'font-medium text-ep-text-secondary'
                        }`}
                      >
                        {pedido.titulo}
                      </p>
                      {noLeidos > 0 && (
                        <span className="bg-ep-red text-white text-[10px] font-bold min-w-4 h-4 rounded-full flex items-center justify-center px-1 flex-shrink-0">
                          {noLeidos > 9 ? '9+' : noLeidos}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ep-text-muted mt-0.5">{otroNombre}</p>
                    <p className="text-xs text-ep-text-secondary mt-1 truncate">
                      {ultimoMensaje
                        ? ultimoMensaje.texto.length > 48
                          ? ultimoMensaje.texto.slice(0, 48) + '...'
                          : ultimoMensaje.texto
                        : 'Sin mensajes todavía'}
                    </p>
                    {ultimoMensaje && (
                      <p className="text-[10px] text-ep-text-muted mt-0.5">
                        {formatFechaRelativa(ultimoMensaje.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
