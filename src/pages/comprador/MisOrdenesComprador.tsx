import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconShoppingCart,
  IconFilter,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { PageHeader, EmptyState, Modal, Button, TextArea } from '../../components/ui';
import { OrdenCard } from '../../components/ordenes/OrdenCard';
import { useOrdenesStore } from '../../store/useOrdenesStore';
import { usePedidosStore } from '../../store/usePedidosStore';
import { COMPRADOR_ID } from '../../utils/constants';
import type { Orden } from '../../types';

type Tab =
  | 'todas'
  | 'confirmadas'
  | 'en_preparacion'
  | 'enviado'
  | 'entregado'
  | 'cerrado'
  | 'disputadas';

const TABS: { id: Tab; label: string; estados: string[] }[] = [
  { id: 'todas',         label: 'Todas',           estados: [] },
  { id: 'confirmadas',   label: 'Confirmadas',      estados: ['confirmada'] },
  { id: 'en_preparacion',label: 'En preparación',  estados: ['en_preparacion'] },
  { id: 'enviado',       label: 'En camino',        estados: ['enviado'] },
  { id: 'entregado',     label: 'Recibidas',        estados: ['entregado'] },
  { id: 'cerrado',       label: 'Cerradas',         estados: ['cerrado'] },
  { id: 'disputadas',    label: 'Disputas',         estados: ['disputada'] },
];

export default function MisOrdenesComprador() {
  const navigate = useNavigate();
  const [tabActiva, setTabActiva] = useState<Tab>('todas');
  const [modalRecepcion, setModalRecepcion] = useState<Orden | null>(null);
  const [modalDisputa, setModalDisputa] = useState<Orden | null>(null);
  const [obsDisputa, setObsDisputa] = useState('');
  const [obsRecepcion, setObsRecepcion] = useState('');
  const [cargando, setCargando] = useState(false);

  const ordenes = useOrdenesStore((s) => s.ordenes);
  const confirmarEntrega = useOrdenesStore((s) => s.confirmarEntrega);
  const abrirDisputa = useOrdenesStore((s) => s.abrirDisputa);
  const pedidos = usePedidosStore((s) => s.pedidos);

  const misOrdenes = [...ordenes]
    .filter((o) => o.compradorId === COMPRADOR_ID)
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

  function getAccionesComprador(orden: Orden) {
    const acciones = [];
    if (orden.estado === 'enviado') {
      acciones.push({
        label: 'Confirmar recepción',
        onClick: () => { setObsRecepcion(''); setModalRecepcion(orden); },
        variante: 'primary' as const,
      });
      acciones.push({
        label: 'Abrir disputa',
        onClick: () => { setObsDisputa(''); setModalDisputa(orden); },
        variante: 'danger' as const,
      });
    } else if (orden.estado === 'confirmada' || orden.estado === 'en_preparacion') {
      acciones.push({
        label: 'Abrir disputa',
        onClick: () => { setObsDisputa(''); setModalDisputa(orden); },
        variante: 'danger' as const,
      });
    }
    return acciones;
  }

  async function handleConfirmarRecepcion() {
    if (!modalRecepcion) return;
    setCargando(true);
    try {
      await confirmarEntrega(modalRecepcion.id);
      setModalRecepcion(null);
    } finally {
      setCargando(false);
    }
  }

  async function handleConfirmarDisputa() {
    if (!modalDisputa || obsDisputa.length < 20) return;
    setCargando(true);
    try {
      await abrirDisputa(modalDisputa.id, obsDisputa);
      setModalDisputa(null);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div>
      <PageHeader
        titulo="Mis compras"
        descripcion="Compras confirmadas con proveedores"
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
            titulo="Sin órdenes todavía"
            mensaje="Aceptá una cotización para generar tu primera orden"
            accion={{
              label: 'Ver cotizaciones',
              onClick: () => navigate('/comprador/cotizaciones-recibidas'),
            }}
          />
        ) : (
          <EmptyState
            icono={IconFilter}
            titulo="Sin resultados"
            mensaje="No hay órdenes con este estado"
          />
        )
      ) : (
        <div className="flex flex-col gap-3">
          {filtradas.map((orden) => (
            <OrdenCard
              key={orden.id}
              orden={orden}
              rol="comprador"
              pedidoTitulo={getPedidoTitulo(orden)}
              onIrChat={
                orden.chatHabilitado && orden.pedidoId
                  ? () => navigate(`/comprador/pedidos/${orden.pedidoId}`)
                  : undefined
              }
              acciones={getAccionesComprador(orden)}
            />
          ))}
        </div>
      )}

      {/* Modal: Confirmar recepción */}
      <Modal
        open={modalRecepcion !== null}
        onClose={() => setModalRecepcion(null)}
        title="Confirmar recepción"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setModalRecepcion(null)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={cargando}
              onClick={handleConfirmarRecepcion}
            >
              Confirmar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-ep-text-secondary leading-relaxed">
            ¿Confirmás que recibiste el pedido correctamente?
          </p>
          <TextArea
            label="Observaciones (opcional)"
            placeholder="Ej: Todo en perfecto estado"
            value={obsRecepcion}
            onChange={(e) => setObsRecepcion(e.target.value)}
            rows={3}
          />
        </div>
      </Modal>

      {/* Modal: Abrir disputa */}
      <Modal
        open={modalDisputa !== null}
        onClose={() => setModalDisputa(null)}
        title="Abrir disputa"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setModalDisputa(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="md"
              loading={cargando}
              disabled={obsDisputa.length < 20}
              onClick={handleConfirmarDisputa}
            >
              Confirmar disputa
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 bg-ep-red-light border border-ep-red rounded-lg px-3 py-2.5">
            <IconAlertTriangle size={15} stroke={2} className="text-ep-red mt-0.5 shrink-0" />
            <p className="text-xs text-ep-red-dark leading-relaxed">
              Abrirás una disputa en esta orden. Describí el problema con el mayor detalle posible.
            </p>
          </div>
          <TextArea
            label="Describí el problema"
            placeholder="Mínimo 20 caracteres — ej: El pedido llegó incompleto..."
            value={obsDisputa}
            onChange={(e) => setObsDisputa(e.target.value)}
            rows={4}
            error={obsDisputa.length > 0 && obsDisputa.length < 20 ? 'Mínimo 20 caracteres' : undefined}
          />
        </div>
      </Modal>
    </div>
  );
}
