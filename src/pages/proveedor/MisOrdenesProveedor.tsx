import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconShoppingCart, IconFilter } from '@tabler/icons-react';
import { PageHeader, EmptyState, Modal, Button, Input, TextArea } from '../../components/ui';
import { OrdenCard } from '../../components/ordenes/OrdenCard';
import { useOrdenesStore } from '../../store/useOrdenesStore';
import { usePedidosStore } from '../../store/usePedidosStore';
import type { Orden } from '../../types';

type Tab =
  | 'todas'
  | 'confirmadas'
  | 'en_preparacion'
  | 'enviadas'
  | 'entregadas'
  | 'cerradas'
  | 'disputadas';

const TABS: { id: Tab; label: string; estados: string[] }[] = [
  { id: 'todas',         label: 'Todas',         estados: [] },
  { id: 'confirmadas',   label: 'Confirmadas',   estados: ['confirmada'] },
  { id: 'en_preparacion',label: 'Preparando',    estados: ['en_preparacion'] },
  { id: 'enviadas',      label: 'Enviadas',      estados: ['enviado'] },
  { id: 'entregadas',    label: 'Entregadas',    estados: ['entregado'] },
  { id: 'cerradas',      label: 'Cerradas',      estados: ['cerrado'] },
  { id: 'disputadas',    label: 'Disputas',      estados: ['disputada'] },
];

const PROV_IDS_DEMO = ['prov-4', 'prov-demo-001'];

export default function MisOrdenesProveedor() {
  const navigate = useNavigate();
  const [tabActiva, setTabActiva] = useState<Tab>('todas');

  // Modals state
  const [modalPreparacion, setModalPreparacion] = useState<Orden | null>(null);
  const [modalEnvio, setModalEnvio] = useState<Orden | null>(null);
  const [modalPago, setModalPago] = useState<Orden | null>(null);
  const [numSeguimiento, setNumSeguimiento] = useState('');
  const [comprobante, setComprobante] = useState('');
  const [cargando, setCargando] = useState(false);

  const ordenes = useOrdenesStore((s) => s.ordenes);
  const marcarEnPreparacion = useOrdenesStore((s) => s.marcarEnPreparacion);
  const marcarEnviado = useOrdenesStore((s) => s.marcarEnviado);
  const confirmarPago = useOrdenesStore((s) => s.confirmarPago);
  const pedidos = usePedidosStore((s) => s.pedidos);

  const misOrdenes = [...ordenes]
    .filter((o) => PROV_IDS_DEMO.includes(o.proveedorId))
    .sort(
      (a, b) =>
        new Date(b.fechaConfirmacion).getTime() - new Date(a.fechaConfirmacion).getTime(),
    );

  const tabConfig = TABS.find((t) => t.id === tabActiva)!;
  const filtradas =
    tabActiva === 'todas'
      ? misOrdenes
      : misOrdenes.filter((o) => tabConfig.estados.includes(o.estado));

  function getPedidoTitulo(orden: Orden): string | undefined {
    if (!orden.pedidoId) return undefined;
    return pedidos.find((p) => p.id === orden.pedidoId)?.titulo;
  }

  function getAccionesProveedor(orden: Orden) {
    const acciones = [];
    if (orden.estado === 'confirmada') {
      acciones.push({
        label: 'Marcar en preparación',
        onClick: () => setModalPreparacion(orden),
        variante: 'primary' as const,
      });
    } else if (orden.estado === 'en_preparacion') {
      acciones.push({
        label: 'Marcar como enviado',
        onClick: () => { setNumSeguimiento(''); setModalEnvio(orden); },
        variante: 'primary' as const,
      });
    } else if (orden.estado === 'entregado') {
      acciones.push({
        label: 'Confirmar pago recibido',
        onClick: () => { setComprobante(''); setModalPago(orden); },
        variante: 'primary' as const,
      });
    }
    return acciones;
  }

  async function handleMarcarPreparacion() {
    if (!modalPreparacion) return;
    setCargando(true);
    try {
      await marcarEnPreparacion(modalPreparacion.id);
      setModalPreparacion(null);
    } finally {
      setCargando(false);
    }
  }

  async function handleMarcarEnviado() {
    if (!modalEnvio) return;
    setCargando(true);
    try {
      await marcarEnviado(modalEnvio.id, numSeguimiento || undefined);
      setModalEnvio(null);
    } finally {
      setCargando(false);
    }
  }

  async function handleConfirmarPago() {
    if (!modalPago) return;
    setCargando(true);
    try {
      await confirmarPago(modalPago.id, comprobante || undefined);
      setModalPago(null);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div>
      <PageHeader
        titulo="Mis ventas"
        descripcion="Operaciones confirmadas donde fuiste proveedor"
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-ep-border mb-5 overflow-x-auto">
        {TABS.map((tab) => {
          const count =
            tab.id === 'todas'
              ? misOrdenes.length
              : misOrdenes.filter((o) => tab.estados.includes(o.estado)).length;
          return (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id)}
              className={[
                'px-4 py-2.5 text-sm font-medium transition-colors duration-150 whitespace-nowrap flex items-center gap-1.5',
                tabActiva === tab.id
                  ? 'border-b-2 border-ep-green text-ep-green'
                  : 'text-ep-text-secondary hover:text-ep-text-primary border-b-2 border-transparent',
              ].join(' ')}
            >
              {tab.label}
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  tabActiva === tab.id
                    ? 'bg-ep-green text-white'
                    : 'bg-ep-surface-raised text-ep-text-muted'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtradas.length === 0 ? (
        tabActiva === 'todas' ? (
          <EmptyState
            icono={IconShoppingCart}
            titulo="Sin ventas todavía"
            mensaje="Cuando un comprador acepte tu cotización, la venta aparecerá aquí"
          />
        ) : (
          <EmptyState
            icono={IconFilter}
            titulo="Sin resultados"
            mensaje="No hay ventas con este estado"
          />
        )
      ) : (
        <div className="flex flex-col gap-3">
          {filtradas.map((orden) => (
            <OrdenCard
              key={orden.id}
              orden={orden}
              rol="proveedor"
              pedidoTitulo={getPedidoTitulo(orden)}
              onIrChat={
                orden.chatHabilitado && orden.pedidoId
                  ? () => navigate(`/proveedor/pedidos/${orden.pedidoId}`)
                  : undefined
              }
              acciones={getAccionesProveedor(orden)}
            />
          ))}
        </div>
      )}

      {/* Modal: Marcar en preparación */}
      <Modal
        open={modalPreparacion !== null}
        onClose={() => setModalPreparacion(null)}
        title="Marcar en preparación"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setModalPreparacion(null)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={cargando}
              onClick={handleMarcarPreparacion}
            >
              Confirmar
            </Button>
          </>
        }
      >
        <p className="text-sm text-ep-text-secondary leading-relaxed">
          El comprador recibirá una notificación indicando que su pedido está siendo preparado.
        </p>
      </Modal>

      {/* Modal: Marcar como enviado */}
      <Modal
        open={modalEnvio !== null}
        onClose={() => setModalEnvio(null)}
        title="Marcar como enviado"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setModalEnvio(null)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={cargando}
              onClick={handleMarcarEnviado}
            >
              Confirmar envío
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-ep-text-secondary leading-relaxed">
            El comprador recibirá una notificación indicando que el pedido fue despachado.
          </p>
          <Input
            label="Número de seguimiento / remito (opcional)"
            placeholder="Ej: REM-2026-0042"
            value={numSeguimiento}
            onChange={(e) => setNumSeguimiento(e.target.value)}
          />
        </div>
      </Modal>

      {/* Modal: Confirmar pago */}
      <Modal
        open={modalPago !== null}
        onClose={() => setModalPago(null)}
        title="Confirmar pago recibido"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setModalPago(null)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={cargando}
              onClick={handleConfirmarPago}
            >
              Confirmar pago
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-ep-text-secondary leading-relaxed">
            Confirmá que recibiste el pago del comprador.
          </p>
          <TextArea
            label="Referencia / comprobante de pago (opcional)"
            placeholder="Ej: Transferencia bancaria, CBU, número de comprobante..."
            value={comprobante}
            onChange={(e) => setComprobante(e.target.value)}
            rows={3}
          />
        </div>
      </Modal>
    </div>
  );
}
