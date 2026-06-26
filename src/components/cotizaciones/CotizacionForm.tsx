import { useState } from 'react';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { useCotizacionesStore } from '../../store/useCotizacionesStore';
import type { Cotizacion } from '../../types';

interface CotizacionFormProps {
  pedidoId: string;
  onSuccess: () => void;
}

export const CotizacionForm = ({ pedidoId, onSuccess }: CotizacionFormProps) => {
  const [precio, setPrecio] = useState('');
  const [tiempoEntrega, setTiempoEntrega] = useState('');
  const [notas, setNotas] = useState('');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = () => {
    const nuevosErrores: Record<string, string> = {};
    if (!precio || Number(precio) <= 0) nuevosErrores.precio = 'Ingresá un precio válido mayor a 0';
    if (!tiempoEntrega.trim()) nuevosErrores.tiempoEntrega = 'Este campo es requerido';

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setEnviando(true);
    const cotizacion: Cotizacion = {
      id: crypto.randomUUID(),
      pedidoId,
      proveedorId: 'prov-demo-001',
      proveedorNombre: 'Mi Empresa (Proveedor)',
      precio: Number(precio),
      tiempoEntrega: tiempoEntrega.trim(),
      notas: notas.trim() || undefined,
      calificacionProveedor: 4.0,
      estado: 'pendiente',
      fechaCreacion: new Date().toISOString(),
    };

    useCotizacionesStore.getState().agregarCotizacion(cotizacion);
    setTimeout(() => {
      setEnviando(false);
      onSuccess();
    }, 600);
  };

  return (
    <div className="flex flex-col gap-4">
      <Input
        type="number"
        label="Precio total en ARS"
        value={precio}
        onChange={(e) => { setPrecio(e.target.value); setErrores((prev) => ({ ...prev, precio: '' })); }}
        required
        min={1}
        step={100}
        error={errores.precio}
        hint="Incluí todos los costos: producto, IVA y flete si corresponde"
      />
      <Input
        label="Tiempo de entrega"
        value={tiempoEntrega}
        onChange={(e) => { setTiempoEntrega(e.target.value); setErrores((prev) => ({ ...prev, tiempoEntrega: '' })); }}
        required
        placeholder="ej: 3 días hábiles"
        error={errores.tiempoEntrega}
        hint="Tiempo desde la confirmación de la orden hasta la entrega"
      />
      <TextArea
        label="Notas adicionales"
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
        rows={3}
        hint="Condiciones, garantía, facturación, marca del producto"
      />
      <Button variant="primary" fullWidth loading={enviando} onClick={handleSubmit}>
        Enviar cotización
      </Button>
    </div>
  );
};
