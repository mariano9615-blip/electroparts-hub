import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconShoppingCart,
  IconFilter,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { PageHeader, EmptyState, Modal, Button, TextArea, StarRating } from '../../components/ui';
import { OrdenCard } from '../../components/ordenes/OrdenCard';
import { useOrdenesStore } from '../../store/useOrdenesStore';
import { usePedidosStore } from '../../store/usePedidosStore';
import { useCotizacionesStore } from '../../store/useCotizacionesStore';
import { useCalificacionesStore } from '../../store/useCalificacionesStore';
import { useNotificacionesStore } from '../../store/useNotificacionesStore';
import { useAuthStore } from '../../store/useAuthStore';
import { COMPRADOR_ID } from '../../utils/constants';
import type { Orden } from '../../types';

const LABEL_ESTRELLAS: Record<number, string> = {
  1: 'Muy mala experiencia',
  2: 'Mala experiencia',
  3: 'Experiencia regular',
  4: 'Buena experiencia',
  5: 'Excelente experiencia',
};

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

  const [modalCalificar, setModalCalificar] = useState<Orden | null>(null);
  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviandoCalificacion, setEnviandoCalificacion] = useState(false);

  const ordenes = useOrdenesStore((s) => s.ordenes);
  const confirmarEntrega = useOrdenesStore((s) => s.confirmarEntrega);
  const abrirDisputa = useOrdenesStore((s) => s.abrirDisputa);
  const marcarOrdenCalificada = useOrdenesStore((s) => s.marcarCalificada);
  const pedidos = usePedidosStore((s) => s.pedidos);
  const cotizaciones = useCotizacionesStore((s) => s.cotizaciones);
  const calificaciones = useCalificacionesStore((s) => s.calificaciones);
  const crearCalificacion = useCalificacionesStore((s) => s.crearCalificacion);
  const nombreComprador = useAuthStore((s) => s.nombre);

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

  function getCalificacionOrden(orden: Orden) {
    if (!orden.calificado) return null;
    return calificaciones.find((c) => c.ordenId === orden.id) ?? null;
  }

  function abrirModalCalificar(orden: Orden) {
    setEstrellas(0);
    setComentario('');
    setModalCalificar(orden);
  }

  async function handleEnviarCalificacion() {
    if (!modalCalificar || estrellas === 0) return;
    setEnviandoCalificacion(true);
    try {
      const orden = modalCalificar;
      const cotizacion = cotizaciones.find((c) => c.id === orden.cotizacionId);

      await crearCalificacion({
        ordenId: orden.id,
        pedidoId: orden.pedidoId ?? '',
        compradorId: orden.compradorId,
        proveedorId: orden.proveedorId,
        proveedorNombre: orden.proveedorNombre,
        estrellas,
        comentario: comentario.trim() || undefined,
      });

      const nuevaCalificacion = useCalificacionesStore.getState().getCalificacionByOrden(orden.id);
      if (nuevaCalificacion) {
        await marcarOrdenCalificada(orden.id, nuevaCalificacion.id);
      }

      const promedio = useCalificacionesStore.getState().getPromedioProveedor(orden.proveedorId);
      if (cotizacion && promedio !== null) {
        await useCotizacionesStore.getState().actualizarCalificacionProveedor(cotizacion.id, promedio);
      }

      useNotificacionesStore.getState().agregarNotificacion({
        tipo: 'calificacion_recibida',
        rolDestino: 'proveedor',
        titulo: 'Recibiste una calificación',
        mensaje: `${nombreComprador ?? 'Un comprador'} calificó tu servicio con ${estrellas} estrella${estrellas > 1 ? 's' : ''}`,
        entidadId: orden.id,
      });

      window.dispatchEvent(
        new CustomEvent('calificacion-enviada-toast', {
          detail: {
            id: `calificacion-${orden.id}`,
            titulo: '¡Calificación enviada!',
            subtitulo: 'Gracias por tu feedback.',
          },
        }),
      );

      setModalCalificar(null);
    } finally {
      setEnviandoCalificacion(false);
    }
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
              calificacion={getCalificacionOrden(orden)}
              onCalificar={() => abrirModalCalificar(orden)}
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

      {/* Modal: Calificar proveedor */}
      <Modal
        open={modalCalificar !== null}
        onClose={() => setModalCalificar(null)}
        title={`Calificá tu experiencia con ${modalCalificar?.proveedorNombre ?? ''}`}
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setModalCalificar(null)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={enviandoCalificacion}
              disabled={estrellas === 0}
              onClick={handleEnviarCalificacion}
            >
              Enviar calificación
            </Button>
          </>
        }
      >
        {modalCalificar && (
          <div className="space-y-4">
            <p className="text-sm text-ep-text-muted">
              Pedido: {getPedidoTitulo(modalCalificar) ?? '—'}
            </p>
            <div className="flex flex-col items-center gap-2 py-2">
              <StarRating value={estrellas} onChange={setEstrellas} size="lg" />
              {estrellas > 0 && (
                <p className="text-sm font-medium text-ep-text-primary">
                  {LABEL_ESTRELLAS[estrellas]}
                </p>
              )}
            </div>
            <TextArea
              label="Contanos más sobre tu experiencia (opcional)"
              placeholder="Ej: Todo llegó a tiempo y en perfecto estado"
              value={comentario}
              onChange={(e) => setComentario(e.target.value.slice(0, 300))}
              rows={3}
              hint={`${comentario.length}/300`}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
