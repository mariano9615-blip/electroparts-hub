import { IconCheck, IconX } from '@tabler/icons-react';
import type { EstadoPedido, Rol } from '../../types';

interface PedidoStepperProps {
  estado: EstadoPedido;
  rol: Rol;
  nombreProveedor?: string;
  miCotizacionEnNegociacion?: boolean;
  observacionBaja?: string;
}

const PASOS = ['Abierto', 'En negociación', 'Adjudicado', 'Cerrado'] as const;

function estadoAPasoIndex(estado: EstadoPedido): number {
  switch (estado) {
    case 'abierto':
    case 'en_cotizacion':
      return 0;
    case 'en_negociacion':
      return 1;
    case 'adjudicado':
      return 2;
    case 'cancelado':
      return -1; // estado terminal alternativo
    default:
      return 0;
  }
}

function textoContextual(estado: EstadoPedido, rol: Rol, nombreProveedor?: string, miCotizacionEnNegociacion?: boolean): string {
  if (rol === 'comprador') {
    switch (estado) {
      case 'abierto':
      case 'en_cotizacion':
        return 'Estás recibiendo cotizaciones. Podés iniciar una negociación cuando quieras.';
      case 'en_negociacion':
        return `Estás negociando con ${nombreProveedor ?? 'el proveedor'}. Podés adjudicar cuando lleguen a un acuerdo.`;
      case 'adjudicado':
        return `Pedido adjudicado a ${nombreProveedor ?? 'el proveedor'}. Podés cerrar la orden cuando se complete la entrega.`;
      case 'cancelado':
        return 'Este pedido fue dado de baja.';
    }
  } else {
    switch (estado) {
      case 'abierto':
      case 'en_cotizacion':
        return 'Este pedido está abierto. Tu cotización está en evaluación.';
      case 'en_negociacion':
        return miCotizacionEnNegociacion
          ? 'El comprador quiere negociar con vos. Usá el chat para coordinar.'
          : 'El comprador está negociando con otro proveedor.';
      case 'adjudicado':
        return nombreProveedor
          ? '¡Tu cotización fue adjudicada!'
          : 'Este pedido fue adjudicado a otro proveedor.';
      case 'cancelado':
        return 'Este pedido fue cancelado por el comprador.';
    }
  }
  return '';
}

export function PedidoStepper({
  estado,
  rol,
  nombreProveedor,
  miCotizacionEnNegociacion,
  observacionBaja,
}: PedidoStepperProps) {
  const cancelado = estado === 'cancelado';
  const pasoActual = estadoAPasoIndex(estado);
  const texto = textoContextual(estado, rol, nombreProveedor, miCotizacionEnNegociacion);

  return (
    <div className="bg-ep-surface border border-ep-border rounded-lg p-4 mb-6">
      {cancelado ? (
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-ep-red flex items-center justify-center flex-shrink-0 mt-0.5">
            <IconX size={14} stroke={2.5} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ep-red">Pedido cancelado</p>
            {observacionBaja && (
              <p className="text-xs text-ep-text-secondary mt-1 leading-relaxed">
                Motivo: {observacionBaja}
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Pasos */}
          <div className="flex items-center gap-0 mb-3">
            {PASOS.map((paso, idx) => {
              const pasado = idx < pasoActual;
              const activo = idx === pasoActual;
              const futuro = idx > pasoActual;
              return (
                <div key={paso} className="flex items-center flex-1 last:flex-none">
                  {/* Círculo */}
                  <div
                    className={[
                      'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold transition-colors duration-200',
                      pasado
                        ? 'bg-ep-green text-white'
                        : activo
                          ? 'bg-ep-blue text-white'
                          : 'bg-ep-surface-raised border border-ep-border text-ep-text-disabled',
                    ].join(' ')}
                  >
                    {pasado ? (
                      <IconCheck size={12} stroke={2.5} />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  {/* Línea conectora */}
                  {idx < PASOS.length - 1 && (
                    <div
                      className={[
                        'flex-1 h-0.5 mx-1 transition-colors duration-200',
                        pasado || activo
                          ? idx < pasoActual - 1 || pasado
                            ? 'bg-ep-green'
                            : 'bg-ep-blue/40'
                          : 'bg-ep-border',
                      ].join(' ')}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Etiquetas */}
          <div className="flex justify-between mb-3">
            {PASOS.map((paso, idx) => {
              const activo = idx === pasoActual;
              const futuro = idx > pasoActual;
              return (
                <span
                  key={paso}
                  className={[
                    'text-[10px] font-medium',
                    activo
                      ? 'text-ep-blue'
                      : futuro
                        ? 'text-ep-text-disabled'
                        : 'text-ep-text-muted',
                  ].join(' ')}
                  style={{ width: idx === PASOS.length - 1 ? 'auto' : undefined }}
                >
                  {paso}
                </span>
              );
            })}
          </div>

          {/* Texto contextual */}
          {texto && (
            <p className="text-xs text-ep-text-secondary leading-relaxed border-t border-ep-border pt-2.5 mt-1">
              {texto}
            </p>
          )}
        </>
      )}
    </div>
  );
}
