// Tipos de dominio de ElectroParts Hub

export type Rol = 'comprador' | 'proveedor';
export type RolUsuario = 'admin' | 'comprador' | 'proveedor';

export type EstadoPedido = 'abierto' | 'en_cotizacion' | 'en_negociacion' | 'adjudicado' | 'cancelado';
export type EstadoCotizacion = 'pendiente' | 'en_negociacion' | 'aceptada' | 'rechazada';
export type EstadoOrden =
  | 'confirmada'
  | 'en_preparacion'
  | 'enviado'
  | 'entregado'
  | 'cerrado'
  | 'disputada';
export type EstadoPago = 'pendiente' | 'en_proceso' | 'confirmado';

export interface Pedido {
  id: string;
  compradorId: string;
  titulo: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  categoria: string;
  presupuestoMax?: number;
  fechaLimite: string;
  estado: EstadoPedido;
  cotizacionesRecibidas: number;
  fechaCreacion: string;
  cotizacionEnNegociacionId?: string;
  observacionBaja?: string;
  fechaBaja?: string;
}

export interface Cotizacion {
  id: string;
  pedidoId: string;
  proveedorId: string;
  proveedorNombre: string;
  precio: number;
  tiempoEntrega: string;
  notas?: string;
  calificacionProveedor: number;
  estado: EstadoCotizacion;
  fechaCreacion: string;
}

export interface Orden {
  id: string;
  pedidoId: string | null;
  cotizacionId: string;
  compradorId: string;
  proveedorId: string;
  proveedorNombre: string;
  monto: number;
  estado: EstadoOrden;
  fechaConfirmacion: string;
  chatHabilitado: boolean;
  estadoPago: EstadoPago;
  numeroSeguimiento?: string;
  fechaEnvio?: string;
  fechaEntrega?: string;
  comprobantePago?: string;
  fechaPagoConfirmado?: string;
  observacionDisputa?: string;
  resolucionDisputa?: string;
  resolvedBy?: string;
}

export interface MensajePedido {
  id: string;
  pedidoId: string;
  cotizacionId?: string;
  autorRol: Rol;
  autorNombre: string;
  texto: string;
  timestamp: string;
  leido?: boolean;
}

export interface Proveedor {
  id: string;
  nombre: string;
  calificacion: number;
  operacionesCompletadas: number;
  verificado: boolean;
  zona: string;
}
