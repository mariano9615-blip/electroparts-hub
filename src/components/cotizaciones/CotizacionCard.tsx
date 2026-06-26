import { IconShieldCheck } from '@tabler/icons-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatARS, formatFechaRelativa } from '../../utils/formatters';
import { PROVEEDORES_SIMULADOS } from '../../utils/constants';
import type { Cotizacion } from '../../types';

interface CotizacionCardProps {
  cotizacion: Cotizacion;
  onAceptar?: () => void;
  onRechazar?: () => void;
  compacto?: boolean;
}

type BadgeColor = 'green' | 'blue' | 'amber' | 'red' | 'gray';

function estadoAColor(estado: string): BadgeColor {
  const map: Record<string, BadgeColor> = {
    pendiente: 'amber',
    aceptada: 'green',
    rechazada: 'red',
  };
  return map[estado] ?? 'gray';
}

function estadoALabel(estado: string): string {
  const map: Record<string, string> = {
    pendiente: 'Pendiente',
    aceptada: 'Aceptada',
    rechazada: 'Rechazada',
  };
  return map[estado] ?? estado;
}

const Estrella = ({ llena }: { llena: boolean }) => (
  <svg
    viewBox="0 0 20 20"
    className={`w-3.5 h-3.5 ${llena ? 'text-ep-amber' : 'text-ep-text-disabled'}`}
    fill="currentColor"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export const CotizacionCard = ({
  cotizacion,
  onAceptar,
  onRechazar,
  compacto = false,
}: CotizacionCardProps) => {
  const proveedor = PROVEEDORES_SIMULADOS.find((p) => p.id === cotizacion.proveedorId);
  const puedeAccionar =
    cotizacion.estado === 'pendiente' && onAceptar != null && onRechazar != null;

  if (compacto) {
    return (
      <Card padding="sm">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-ep-text-primary">{cotizacion.proveedorNombre}</p>
          <Badge color={estadoAColor(cotizacion.estado)}>{estadoALabel(cotizacion.estado)}</Badge>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm font-bold font-mono text-ep-text-primary">
            {formatARS(cotizacion.precio)}
          </span>
          <span className="text-xs text-ep-text-muted">{cotizacion.tiempoEntrega}</span>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="md">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-ep-text-primary">{cotizacion.proveedorNombre}</p>
        <Badge color={estadoAColor(cotizacion.estado)}>{estadoALabel(cotizacion.estado)}</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-1">
        {proveedor && (
          <span className="text-xs text-ep-text-muted">{proveedor.zona}</span>
        )}
        {proveedor?.verificado && (
          <Badge color="green" dot={false}>
            <IconShieldCheck size={11} className="inline mr-0.5" />
            Verificado
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-1 mt-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <Estrella key={n} llena={n <= Math.round(cotizacion.calificacionProveedor)} />
        ))}
        <span className="text-xs text-ep-text-muted ml-1">{cotizacion.calificacionProveedor}</span>
      </div>

      <div className="mt-2">
        <span className="text-xl font-bold font-mono text-ep-text-primary">
          {formatARS(cotizacion.precio)}
        </span>
        <p className="text-sm text-ep-text-secondary mt-0.5">{cotizacion.tiempoEntrega}</p>
      </div>

      {cotizacion.notas && (
        <div className="bg-ep-surface-raised rounded-lg px-3 py-2 mt-2">
          <p className="text-sm text-ep-text-secondary italic">{cotizacion.notas}</p>
        </div>
      )}

      <p className="text-xs text-ep-text-muted mt-2">
        {formatFechaRelativa(cotizacion.fechaCreacion)}
      </p>

      {puedeAccionar && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-ep-border">
          <Button variant="danger" size="sm" onClick={onRechazar}>
            Rechazar
          </Button>
          <Button variant="primary" size="sm" onClick={onAceptar}>
            Aceptar cotización
          </Button>
        </div>
      )}
    </Card>
  );
};
