import { IconCheck, IconAlertTriangle } from '@tabler/icons-react';
import type { EstadoOrden, Rol } from '../../types';

interface OrdenStepperProps {
  estado: EstadoOrden;
  rol: Rol;
  nombreProveedor?: string;
}

const PASOS = ['Confirmada', 'En preparación', 'Enviado', 'Entregado', 'Cerrado'] as const;

function estadoAPasoIndex(estado: EstadoOrden): number {
  switch (estado) {
    case 'confirmada':    return 0;
    case 'en_preparacion':return 1;
    case 'enviado':       return 2;
    case 'entregado':     return 3;
    case 'cerrado':       return 4;
    case 'disputada':     return -1;
    default:              return 0;
  }
}

function textoContextual(estado: EstadoOrden, rol: Rol, nombreProveedor?: string): string {
  const prov = nombreProveedor ?? 'el proveedor';
  if (rol === 'comprador') {
    switch (estado) {
      case 'confirmada':    return `Compra confirmada. ${prov} va a preparar y despachar el pedido.`;
      case 'en_preparacion':return `${prov} está preparando tu pedido.`;
      case 'enviado':       return 'Tu pedido fue despachado. Confirmá la recepción cuando llegue.';
      case 'entregado':     return 'Recepción confirmada. Esperando confirmación de pago del proveedor.';
      case 'cerrado':       return 'Orden completada.';
      case 'disputada':     return 'Hay una disputa abierta en esta orden.';
    }
  } else {
    switch (estado) {
      case 'confirmada':    return 'La compra fue confirmada. Prepará el pedido para despachar.';
      case 'en_preparacion':return 'Marcaste este pedido como en preparación. Cuando lo despaches, cargá el número de remito.';
      case 'enviado':       return 'Pedido despachado. Esperando que el comprador confirme la recepción.';
      case 'entregado':     return 'El comprador confirmó la entrega. Confirmá el pago cuando lo recibas.';
      case 'cerrado':       return 'Orden completada.';
      case 'disputada':     return 'Hay una disputa abierta en esta orden.';
    }
  }
  return '';
}

export function OrdenStepper({ estado, rol, nombreProveedor }: OrdenStepperProps) {
  const disputada = estado === 'disputada';
  const pasoActual = estadoAPasoIndex(estado);
  const texto = textoContextual(estado, rol, nombreProveedor);

  return (
    <div className={`border rounded-lg p-4 mb-4 ${disputada ? 'bg-ep-red-light border-ep-red' : 'bg-ep-surface border-ep-border'}`}>
      {disputada ? (
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-ep-red flex items-center justify-center flex-shrink-0 mt-0.5">
            <IconAlertTriangle size={14} stroke={2.5} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ep-red-dark">Disputa abierta</p>
            {texto && (
              <p className="text-xs text-ep-red-dark/80 mt-1 leading-relaxed">{texto}</p>
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
              return (
                <div key={paso} className="flex items-center flex-1 last:flex-none">
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
                    {pasado ? <IconCheck size={12} stroke={2.5} /> : idx + 1}
                  </div>
                  {idx < PASOS.length - 1 && (
                    <div
                      className={[
                        'flex-1 h-0.5 mx-1 transition-colors duration-200',
                        idx < pasoActual
                          ? 'bg-ep-green'
                          : activo
                            ? 'bg-ep-blue/40'
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
                    activo ? 'text-ep-blue' : futuro ? 'text-ep-text-disabled' : 'text-ep-text-muted',
                  ].join(' ')}
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
