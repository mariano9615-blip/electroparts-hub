// Tipos de dominio de ElectroParts Hub

export type Rol = 'comprador' | 'proveedor';

export type EstadoPedido = 'abierto' | 'en_cotizacion' | 'adjudicado' | 'cancelado';
export type EstadoCotizacion = 'pendiente' | 'aceptada' | 'rechazada';
export type EstadoOrden = 'confirmada' | 'en_transito' | 'entregada' | 'disputada';

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
  pedidoId: string;
  cotizacionId: string;
  compradorId: string;
  proveedorId: string;
  proveedorNombre: string;
  monto: number;
  estado: EstadoOrden;
  fechaConfirmacion: string;
  chatHabilitado: boolean;
}

export interface Mensaje {
  id: string;
  ordenId: string;
  autorRol: Rol;
  autorNombre: string;
  texto: string;
  timestamp: string;
}

export interface MensajePedido {
  id: string;
  pedidoId: string;
  autorRol: Rol;
  autorNombre: string;
  texto: string;
  timestamp: string;
}

export interface Proveedor {
  id: string;
  nombre: string;
  calificacion: number;
  operacionesCompletadas: number;
  verificado: boolean;
  zona: string;
}
