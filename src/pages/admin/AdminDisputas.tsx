import { useState } from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { PageHeader, Badge, EmptyState, Button, TextArea, Modal } from '../../components/ui';
import { useOrdenesStore } from '../../store/useOrdenesStore';
import { usePedidosStore } from '../../store/usePedidosStore';
import { formatARS, formatFecha } from '../../utils/formatters';
import { COMPRADOR_ID } from '../../utils/constants';
import type { Orden } from '../../types';

type Favor = 'comprador' | 'proveedor';

function nombreComprador(compradorId: string): string {
  return compradorId === COMPRADOR_ID ? 'Comprador Demo' : compradorId;
}

export default function AdminDisputas() {
  const ordenes = useOrdenesStore((s) => s.ordenes);
  const resolverDisputa = useOrdenesStore((s) => s.resolverDisputa);
  const pedidos = usePedidosStore((s) => s.pedidos);

  const [ordenAResolver, setOrdenAResolver] = useState<Orden | null>(null);
  const [favor, setFavor] = useState<Favor | null>(null);
  const [resolucion, setResolucion] = useState('');
  const [cargando, setCargando] = useState(false);

  const disputas = ordenes
    .filter((o) => o.estado === 'disputada')
    .sort((a, b) => new Date(b.fechaConfirmacion).getTime() - new Date(a.fechaConfirmacion).getTime());

  function tituloPedido(orden: Orden): string {
    if (!orden.pedidoId) return '—';
    return pedidos.find((p) => p.id === orden.pedidoId)?.titulo ?? '—';
  }

  function abrirModal(orden: Orden) {
    setOrdenAResolver(orden);
    setFavor(null);
    setResolucion('');
  }

  async function handleResolver() {
    if (!ordenAResolver || !favor || resolucion.trim().length === 0) return;
    setCargando(true);
    try {
      const prefijo = favor === 'comprador' ? 'Favor del comprador' : 'Favor del proveedor';
      await resolverDisputa(ordenAResolver.id, `${prefijo}: ${resolucion.trim()}`);
      setOrdenAResolver(null);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div>
      <PageHeader titulo="Disputas" descripcion="Órdenes en estado disputada" />

      {disputas.length === 0 ? (
        <EmptyState
          icono={IconAlertTriangle}
          titulo="Sin disputas abiertas"
          mensaje="No hay órdenes en disputa en este momento"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {disputas.map((orden) => (
            <div key={orden.id} className="bg-ep-surface border border-ep-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-ep-text-primary">{tituloPedido(orden)}</p>
                    <Badge color="red">En disputa</Badge>
                  </div>
                  <p className="text-xs text-ep-text-muted">
                    {nombreComprador(orden.compradorId)} · {orden.proveedorNombre} ·{' '}
                    <span className="font-mono">{formatARS(orden.monto)}</span> ·{' '}
                    {formatFecha(orden.fechaConfirmacion)}
                  </p>
                </div>
                <Button variant="danger" size="sm" onClick={() => abrirModal(orden)}>
                  Resolver disputa
                </Button>
              </div>
              {orden.observacionDisputa && (
                <div className="mt-3 bg-ep-red-light border border-ep-red rounded-lg px-3 py-2">
                  <p className="text-xs text-ep-red-dark leading-relaxed">{orden.observacionDisputa}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={ordenAResolver !== null}
        onClose={() => setOrdenAResolver(null)}
        title="Resolver disputa"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setOrdenAResolver(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="md"
              loading={cargando}
              disabled={!favor || resolucion.trim().length === 0}
              onClick={handleResolver}
            >
              Confirmar resolución
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFavor('comprador')}
              className={`flex-1 text-sm font-medium px-3 py-2 rounded-lg border transition-colors duration-150 ${
                favor === 'comprador'
                  ? 'bg-ep-green text-white border-ep-green'
                  : 'bg-ep-surface border-ep-border text-ep-text-secondary hover:bg-ep-surface-raised'
              }`}
            >
              Favor del comprador
            </button>
            <button
              type="button"
              onClick={() => setFavor('proveedor')}
              className={`flex-1 text-sm font-medium px-3 py-2 rounded-lg border transition-colors duration-150 ${
                favor === 'proveedor'
                  ? 'bg-ep-blue text-white border-ep-blue'
                  : 'bg-ep-surface border-ep-border text-ep-text-secondary hover:bg-ep-surface-raised'
              }`}
            >
              Favor del proveedor
            </button>
          </div>
          <TextArea
            label="Resolución"
            placeholder="Describí cómo se resolvió la disputa..."
            value={resolucion}
            onChange={(e) => setResolucion(e.target.value)}
            rows={4}
          />
        </div>
      </Modal>
    </div>
  );
}
