// Funciones de formateo para la UI

export function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatFecha(isoDate: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(isoDate));
}

export function formatFechaRelativa(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutos = Math.floor(diff / 60000);
  if (minutos < 1)   return 'ahora mismo';
  if (minutos < 60)  return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24)    return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias === 1)    return 'ayer';
  if (dias < 7)      return `hace ${dias} dias`;
  return formatFecha(isoDate);
}

export function diasHasta(isoDate: string): number {
  const diff = new Date(isoDate).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

export function getLabelEstadoPedido(estado: string, rol: 'comprador' | 'proveedor'): string {
  if (rol === 'comprador') {
    const map: Record<string, string> = {
      abierto: 'Abierto',
      en_cotizacion: 'En cotización',
      en_negociacion: 'En negociación',
      adjudicado: 'Comprado',
      cancelado: 'Cancelado',
    };
    return map[estado] ?? estado;
  }
  const map: Record<string, string> = {
    abierto: 'Abierto',
    en_cotizacion: 'En cotización',
    en_negociacion: 'En negociación',
    adjudicado: 'Vendido',
    cancelado: 'Cancelado',
  };
  return map[estado] ?? estado;
}

export function getLabelEstadoCotizacion(estado: string, rol: 'comprador' | 'proveedor'): string {
  if (rol === 'proveedor') {
    const map: Record<string, string> = {
      pendiente: 'Pendiente',
      en_negociacion: 'En negociación',
      aceptada: 'Ganada',
      rechazada: 'Rechazada',
    };
    return map[estado] ?? estado;
  }
  const map: Record<string, string> = {
    pendiente: 'Pendiente',
    en_negociacion: 'En negociación',
    aceptada: 'Aceptada',
    rechazada: 'Rechazada',
  };
  return map[estado] ?? estado;
}

export function getLabelEstadoOrden(estado: string, rol: 'comprador' | 'proveedor'): string {
  if (rol === 'comprador') {
    const map: Record<string, string> = {
      confirmada: 'Confirmada',
      en_preparacion: 'En preparación',
      enviado: 'En camino',
      entregado: 'Recibido',
      cerrado: 'Cerrado',
      disputada: 'En disputa',
    };
    return map[estado] ?? estado;
  }
  const map: Record<string, string> = {
    confirmada: 'Confirmada',
    en_preparacion: 'Preparando pedido',
    enviado: 'Enviado',
    entregado: 'Entregado',
    cerrado: 'Cerrado',
    disputada: 'En disputa',
  };
  return map[estado] ?? estado;
}

export function getLabelEstadoPago(estado: string): string {
  const map: Record<string, string> = {
    pendiente: 'Pago pendiente',
    en_proceso: 'Pago en proceso',
    confirmado: 'Pago confirmado',
  };
  return map[estado] ?? estado;
}

export function getColorEstadoPedido(estado: string): string {
  const map: Record<string, string> = {
    abierto:       'bg-ep-green-light text-ep-green-dark',
    en_cotizacion: 'bg-ep-blue-light text-ep-blue-dark',
    adjudicado:    'bg-gray-100 text-gray-600',
    cancelado:     'bg-ep-red-light text-ep-red',
  };
  return map[estado] ?? 'bg-gray-100 text-gray-500';
}

export function getColorEstadoCotizacion(estado: string): string {
  const map: Record<string, string> = {
    pendiente: 'bg-ep-amber-light text-ep-amber',
    aceptada:  'bg-ep-green-light text-ep-green-dark',
    rechazada: 'bg-ep-red-light text-ep-red',
  };
  return map[estado] ?? 'bg-gray-100 text-gray-500';
}

export function getColorEstadoOrden(estado: string): string {
  const map: Record<string, string> = {
    confirmada:    'bg-ep-blue-light text-ep-blue-dark',
    en_preparacion:'bg-ep-amber-light text-ep-amber-dark',
    enviado:       'bg-ep-blue-light text-ep-blue-dark',
    entregado:     'bg-ep-green-light text-ep-green-dark',
    cerrado:       'bg-ep-surface-raised text-ep-text-secondary',
    disputada:     'bg-ep-red-light text-ep-red-dark',
  };
  return map[estado] ?? 'bg-gray-100 text-gray-500';
}

export function getColorEstadoPago(estado: string): string {
  const map: Record<string, string> = {
    pendiente:  'bg-ep-surface-raised text-ep-text-secondary',
    en_proceso: 'bg-ep-amber-light text-ep-amber-dark',
    confirmado: 'bg-ep-green-light text-ep-green-dark',
  };
  return map[estado] ?? 'bg-ep-surface-raised text-ep-text-secondary';
}
