import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconCircleCheck } from '@tabler/icons-react';
import { PageHeader, Button, Input, Select, Spinner } from '../../components/ui';
import { TextArea } from '../../components/ui/TextArea';
import { Card } from '../../components/ui/Card';
import { usePedidosStore } from '../../store/usePedidosStore';
import { useSimuladorCotizaciones } from '../../hooks/useSimuladorCotizaciones';
import { CATEGORIAS, UNIDADES, COMPRADOR_ID } from '../../utils/constants';
import type { Pedido } from '../../types';

const CATEGORIAS_OPTIONS = CATEGORIAS.map((c) => ({ value: c, label: c }));
const UNIDADES_OPTIONS = UNIDADES.map((u) => ({ value: u, label: u }));

function fechaMinima(): string {
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  return manana.toISOString().split('T')[0];
}

export default function PublicarPedido() {
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [unidad, setUnidad] = useState('');
  const [categoria, setCategoria] = useState('');
  const [presupuestoMax, setPresupuestoMax] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [exitoso, setExitoso] = useState(false);
  const [pedidoIdSimulado, setPedidoIdSimulado] = useState<string | null>(null);

  useSimuladorCotizaciones(
    pedidoIdSimulado,
    presupuestoMax ? Number(presupuestoMax) : undefined,
  );

  const handleSubmit = () => {
    const nuevosErrores: Record<string, string> = {};
    if (!titulo.trim()) nuevosErrores.titulo = 'Este campo es requerido';
    if (!descripcion.trim()) nuevosErrores.descripcion = 'Este campo es requerido';
    if (!cantidad || Number(cantidad) < 1) nuevosErrores.cantidad = 'Este campo es requerido';
    if (!unidad) nuevosErrores.unidad = 'Este campo es requerido';
    if (!categoria) nuevosErrores.categoria = 'Este campo es requerido';
    if (!fechaLimite) nuevosErrores.fechaLimite = 'Este campo es requerido';

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setEnviando(true);
    const pedido: Pedido = {
      id: crypto.randomUUID(),
      compradorId: COMPRADOR_ID,
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      cantidad: Number(cantidad),
      unidad,
      categoria,
      presupuestoMax: presupuestoMax ? Number(presupuestoMax) : undefined,
      fechaLimite: new Date(fechaLimite).toISOString(),
      estado: 'abierto',
      cotizacionesRecibidas: 0,
      fechaCreacion: new Date().toISOString(),
    };

    usePedidosStore.getState().agregarPedido(pedido);
    setPedidoIdSimulado(pedido.id);
    setEnviando(false);
    setExitoso(true);
    setTimeout(() => navigate('/comprador/cotizaciones'), 3000);
  };

  return (
    <div>
      <PageHeader
        titulo="Publicar pedido"
        descripcion="Los proveedores verificados recibirán tu pedido y competirán con sus mejores precios"
        accion={
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <IconArrowLeft size={16} />
            Volver
          </Button>
        }
      />

      {exitoso ? (
        <div className="bg-ep-green-light border border-ep-green rounded-xl p-4 flex items-start gap-3">
          <IconCircleCheck size={22} className="text-ep-green flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-ep-green-dark">
              ¡Pedido publicado exitosamente!
            </p>
            <p className="text-sm text-ep-green-dark mt-0.5">
              Los proveedores ya pueden ver tu pedido. Las cotizaciones llegarán en los próximos
              minutos.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Spinner size="sm" color="text-ep-green" />
              <span className="text-xs text-ep-green-dark">Redirigiendo...</span>
            </div>
          </div>
        </div>
      ) : (
        <Card padding="lg">
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-semibold text-ep-text-muted uppercase tracking-wide mb-3">
                Información del producto
              </p>
              <div className="flex flex-col gap-4">
                <Input
                  label="Título del pedido"
                  value={titulo}
                  onChange={(e) => { setTitulo(e.target.value); setErrores((p) => ({ ...p, titulo: '' })); }}
                  required
                  error={errores.titulo}
                  hint="Sé específico: marca, modelo, especificación"
                />
                <TextArea
                  label="Descripción detallada"
                  value={descripcion}
                  onChange={(e) => { setDescripcion(e.target.value); setErrores((p) => ({ ...p, descripcion: '' })); }}
                  required
                  rows={3}
                  error={errores.descripcion}
                  hint="Incluí especificaciones técnicas, marca preferida, condición de entrega"
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-ep-text-muted uppercase tracking-wide mb-3">
                Cantidad y categoría
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Cantidad"
                  value={cantidad}
                  onChange={(e) => { setCantidad(e.target.value); setErrores((p) => ({ ...p, cantidad: '' })); }}
                  required
                  min={1}
                  error={errores.cantidad}
                />
                <Select
                  label="Unidad"
                  value={unidad}
                  onChange={(e) => { setUnidad(e.target.value); setErrores((p) => ({ ...p, unidad: '' })); }}
                  options={UNIDADES_OPTIONS}
                  placeholder="Seleccioná unidad"
                  required
                  error={errores.unidad}
                />
                <Select
                  label="Categoría"
                  value={categoria}
                  onChange={(e) => { setCategoria(e.target.value); setErrores((p) => ({ ...p, categoria: '' })); }}
                  options={CATEGORIAS_OPTIONS}
                  placeholder="Seleccioná categoría"
                  required
                  error={errores.categoria}
                  className="sm:col-span-2"
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-ep-text-muted uppercase tracking-wide mb-3">
                Condiciones comerciales
              </p>
              <div className="flex flex-col gap-4">
                <Input
                  type="number"
                  label="Presupuesto máximo (ARS)"
                  value={presupuestoMax}
                  onChange={(e) => setPresupuestoMax(e.target.value)}
                  hint="Opcional. Publicar con presupuesto recibe cotizaciones más competitivas"
                />
                <Input
                  type="date"
                  label="Fecha límite"
                  value={fechaLimite}
                  onChange={(e) => { setFechaLimite(e.target.value); setErrores((p) => ({ ...p, fechaLimite: '' })); }}
                  required
                  min={fechaMinima()}
                  error={errores.fechaLimite}
                />
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              loading={enviando}
              onClick={handleSubmit}
            >
              Publicar pedido y recibir cotizaciones
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
