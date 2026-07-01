import { useEffect, useRef, useState } from 'react';
import { IconSend } from '@tabler/icons-react';
import { useMensajesStore } from '../../store/useMensajesStore';
import { useRolStore } from '../../store/useRolStore';

interface ChatProps {
  pedidoId: string;
  otroNombre: string;
  cotizacionId?: string;
}

function formatHora(timestamp: string): string {
  const d = new Date(timestamp);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export function Chat({ pedidoId, otroNombre, cotizacionId }: ChatProps) {
  const [texto, setTexto] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const mensajes = useMensajesStore((s) => s.mensajesPorPedido[pedidoId] ?? []);
  const cargarMensajes = useMensajesStore((s) => s.cargarMensajes);
  const enviarMensaje = useMensajesStore((s) => s.enviarMensaje);
  const limpiarPedidoActivo = useMensajesStore((s) => s.limpiarPedidoActivo);
  const marcarMensajesLeidos = useMensajesStore((s) => s.marcarMensajesLeidos);
  const rol = useRolStore((s) => s.rol);

  const miRol = rol;
  const miNombre = rol === 'comprador' ? 'Comprador Demo' : 'Mi Empresa (Proveedor)';

  useEffect(() => {
    cargarMensajes(pedidoId);
    return () => {
      limpiarPedidoActivo();
    };
  }, [pedidoId]);

  // Marcar mensajes del otro lado como leídos cada vez que llegan nuevos mensajes
  useEffect(() => {
    if (mensajes.length > 0) {
      marcarMensajesLeidos(pedidoId, miRol);
    }
  }, [mensajes]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const handleEnviar = () => {
    if (!texto.trim()) return;
    enviarMensaje(pedidoId, texto.trim(), miRol, miNombre, cotizacionId);
    setTexto('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xs font-bold text-ep-text-muted uppercase tracking-widest border-b border-ep-border pb-2.5 mb-4">
        Chat — Pedido #{pedidoId.slice(0, 8)} con {otroNombre}
      </h2>

      <div className="bg-ep-surface border border-ep-border rounded-lg overflow-hidden">
        {/* Área de mensajes */}
        <div className="h-96 overflow-y-auto p-4 flex flex-col gap-3 bg-ep-blue-dark/5">
          {mensajes.length === 0 && (
            <p className="text-center text-sm text-ep-text-muted py-8">
              Iniciá la conversación enviando un mensaje.
            </p>
          )}
          {mensajes.map((msg) => {
            const esMio = msg.autorRol === miRol;
            const noLeido = !esMio && msg.leido === false;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${esMio ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-ep-text-muted mb-1 flex items-center gap-1.5">
                  {msg.autorNombre} · {formatHora(msg.timestamp)}
                  {noLeido && (
                    <span className="w-1.5 h-1.5 rounded-full bg-ep-blue inline-block" title="No leído" />
                  )}
                </span>
                <div
                  className={[
                    'max-w-[70%] px-3.5 py-2 text-sm leading-relaxed',
                    esMio
                      ? 'bg-ep-blue text-white rounded-2xl rounded-tr-sm'
                      : 'bg-ep-surface border border-ep-border text-ep-text-primary rounded-2xl rounded-tl-sm',
                    noLeido ? 'ring-1 ring-ep-blue/30' : '',
                  ].join(' ')}
                >
                  {msg.texto}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Footer: input + enviar */}
        <div className="border-t border-ep-border p-3 flex gap-2 bg-ep-surface">
          <input
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribí un mensaje..."
            className="flex-1 px-3 py-2 text-sm bg-ep-surface-raised rounded-lg border border-ep-border focus:border-ep-blue focus:ring-1 focus:ring-ep-blue outline-none transition-colors duration-150 text-ep-text-primary placeholder:text-ep-text-muted"
          />
          <button
            onClick={handleEnviar}
            disabled={!texto.trim()}
            className="px-3 py-2 bg-ep-blue text-white rounded-lg hover:bg-ep-blue-dark transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <IconSend size={16} stroke={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
