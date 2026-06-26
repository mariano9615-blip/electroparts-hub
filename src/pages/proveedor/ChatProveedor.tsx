import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconMessage, IconSend, IconBuilding } from '@tabler/icons-react';
import { EmptyState, Badge, Button } from '../../components/ui';
import { Card } from '../../components/ui/Card';
import { useChatStore } from '../../store/useChatStore';
import { useOrdenesStore } from '../../store/useOrdenesStore';
import { formatFechaRelativa } from '../../utils/formatters';

const PROV_CHAT_IDS = ['prov-4', 'prov-demo-001'];

const RESPUESTAS_AUTO = [
  'Perfecto, gracias. ¿Me confirmás el número de seguimiento cuando despache?',
  'Entendido. ¿Emitís factura A?',
  'Anotado. Te aviso si necesito algo más antes del despacho.',
  'Bien. ¿El precio incluye el IVA?',
];

function estadoLabel(estado: string): string {
  const map: Record<string, string> = {
    confirmada: 'Confirmada',
    en_transito: 'En tránsito',
    entregada: 'Entregada',
    disputada: 'Disputada',
  };
  return map[estado] ?? estado;
}

type BadgeColor = 'green' | 'blue' | 'amber' | 'red' | 'gray';
function estadoColor(estado: string): BadgeColor {
  const map: Record<string, BadgeColor> = {
    confirmada: 'blue',
    en_transito: 'amber',
    entregada: 'green',
    disputada: 'red',
  };
  return map[estado] ?? 'gray';
}

export default function ChatProveedor() {
  const navigate = useNavigate();
  const [inputMensaje, setInputMensaje] = useState('');
  const [escribiendo, setEscribiendo] = useState(false);
  const [respuestaIdx, setRespuestaIdx] = useState(0);
  const mensajesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const ordenes = useOrdenesStore((s) => s.ordenes);
  const mensajes = useChatStore((s) => s.mensajes);

  const ordenActiva =
    ordenes.find((o) => PROV_CHAT_IDS.includes(o.proveedorId) && o.chatHabilitado) ?? null;

  const mensajesOrden = ordenActiva
    ? mensajes.filter((m) => m.ordenId === ordenActiva.id)
    : [];

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajesOrden, escribiendo]);

  const enviarMensaje = () => {
    if (!inputMensaje.trim() || escribiendo || !ordenActiva) return;

    const texto = inputMensaje.trim();
    useChatStore.getState().agregarMensaje({
      id: crypto.randomUUID(),
      ordenId: ordenActiva.id,
      autorRol: 'proveedor',
      autorNombre: 'DistribuidoraElec AR',
      texto,
      timestamp: new Date().toISOString(),
    });
    setInputMensaje('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setEscribiendo(true);
    setTimeout(() => {
      const respuesta = RESPUESTAS_AUTO[respuestaIdx % RESPUESTAS_AUTO.length];
      useChatStore.getState().agregarMensaje({
        id: crypto.randomUUID(),
        ordenId: ordenActiva.id,
        autorRol: 'comprador',
        autorNombre: 'Mi Empresa',
        texto: respuesta,
        timestamp: new Date().toISOString(),
      });
      setEscribiendo(false);
      setRespuestaIdx((i) => i + 1);
    }, 1800);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMensaje(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    const maxHeight = 4 * 24;
    ta.style.height = Math.min(ta.scrollHeight, maxHeight) + 'px';
  };

  if (!ordenActiva) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-ep-text-primary">Chat activo</h1>
        </div>
        <EmptyState
          icono={IconMessage}
          titulo="No tenés chats activos"
          mensaje="Cuando un comprador acepte tu cotización se habilitará el chat"
          accion={{
            label: 'Ver mis cotizaciones',
            onClick: () => navigate('/proveedor/cotizaciones'),
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-ep-text-primary">Chat activo</h1>
      </div>

      <Card padding="none" className="flex flex-col h-[calc(100vh-12rem)]">
        <div className="px-5 py-4 border-b border-ep-border bg-ep-surface flex items-center gap-3 flex-shrink-0">
          <IconBuilding size={18} className="text-ep-text-muted" />
          <span className="font-semibold text-ep-text-primary text-sm">Mi Empresa (Comprador)</span>
          <Badge color={estadoColor(ordenActiva.estado)}>
            {estadoLabel(ordenActiva.estado)}
          </Badge>
          <span className="font-mono text-sm text-ep-text-secondary ml-auto">
            {new Intl.NumberFormat('es-AR', {
              style: 'currency',
              currency: 'ARS',
              maximumFractionDigits: 0,
            }).format(ordenActiva.monto)}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
          {mensajesOrden.map((msg) => {
            const esProveedor = msg.autorRol === 'proveedor';
            return (
              <div key={msg.id} className={`flex ${esProveedor ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[75%]">
                  {!esProveedor && (
                    <p className="text-xs font-medium text-ep-text-muted mb-1">{msg.autorNombre}</p>
                  )}
                  <div
                    className={
                      esProveedor
                        ? 'bg-ep-green text-white rounded-2xl rounded-tr-sm px-4 py-2.5'
                        : 'bg-ep-surface-raised text-ep-text-primary rounded-2xl rounded-tl-sm px-4 py-2.5 border border-ep-border'
                    }
                  >
                    <p className="text-sm">{msg.texto}</p>
                  </div>
                  <p className={`text-xs text-ep-text-muted mt-1 ${esProveedor ? 'text-right' : ''}`}>
                    {formatFechaRelativa(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}

          {escribiendo && (
            <div className="flex justify-start">
              <div className="max-w-[75%]">
                <p className="text-xs font-medium text-ep-text-muted mb-1">Mi Empresa</p>
                <div className="bg-ep-surface-raised border border-ep-border rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="w-1.5 h-1.5 rounded-full bg-ep-text-muted"
                        style={{
                          animation: `typing-dot 1.2s ease-in-out ${delay}ms infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={mensajesEndRef} />
        </div>

        <div className="px-4 py-3 border-t border-ep-border bg-ep-surface flex-shrink-0">
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputMensaje}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Escribí tu mensaje..."
              className="flex-1 resize-none outline-none text-sm px-3 py-2 rounded-xl border border-ep-border focus:border-ep-green transition-colors text-ep-text-primary placeholder:text-ep-text-muted bg-ep-surface"
              style={{ minHeight: '38px', maxHeight: '96px' }}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={enviarMensaje}
              disabled={!inputMensaje.trim() || escribiendo}
            >
              <IconSend size={14} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
