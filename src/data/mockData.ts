// Datos iniciales de ejemplo para poblar localStorage en el primer arranque

import type { Pedido, Cotizacion, Orden } from '../types';

const hoy = new Date().toISOString();
const ayer = new Date(Date.now() - 86400000).toISOString();
const en3dias = new Date(Date.now() + 3 * 86400000).toISOString();
const en7dias = new Date(Date.now() + 7 * 86400000).toISOString();

export const PEDIDOS_INICIALES: Pedido[] = [
  {
    id: 'ped-001',
    compradorId: 'comprador-demo-001',
    titulo: 'Cable UTP Cat6 x 500m',
    descripcion: 'Necesito 500 metros de cable UTP Cat6 exterior, en bobina. Marca reconocida.',
    cantidad: 500,
    unidad: 'metros',
    categoria: 'Cables y Conectores',
    presupuestoMax: 180000,
    fechaLimite: en7dias,
    estado: 'en_cotizacion',
    cotizacionesRecibidas: 3,
    fechaCreacion: ayer,
  },
  {
    id: 'ped-002',
    compradorId: 'comprador-demo-001',
    titulo: 'Resistencias 10k x 1000 unidades',
    descripcion: 'Resistencias 10k 1/4W, tolerancia 5%, empaque de 1000 unidades.',
    cantidad: 1000,
    unidad: 'unidades',
    categoria: 'Resistencias y Capacitores',
    presupuestoMax: 25000,
    fechaLimite: en3dias,
    estado: 'abierto',
    cotizacionesRecibidas: 0,
    fechaCreacion: hoy,
  },
  {
    id: 'ped-003',
    compradorId: 'comprador-demo-001',
    titulo: 'Fuente switching 12V 10A x 20 unidades',
    descripcion: 'Fuentes de alimentacion switching 12V 10A con certificacion. Para instalaciones industriales.',
    cantidad: 20,
    unidad: 'unidades',
    categoria: 'Fuentes de Alimentacion',
    presupuestoMax: 320000,
    fechaLimite: en7dias,
    estado: 'adjudicado',
    cotizacionesRecibidas: 4,
    fechaCreacion: ayer,
  },
];

export const COTIZACIONES_INICIALES: Cotizacion[] = [
  {
    id: 'cot-001',
    pedidoId: 'ped-001',
    proveedorId: 'prov-1',
    proveedorNombre: 'ElectroMayorista Once',
    precio: 165000,
    tiempoEntrega: '2 dias habiles',
    notas: 'Stock disponible. Incluye IVA. Entrega en puerta.',
    calificacionProveedor: 4.7,
    estado: 'pendiente',
    fechaCreacion: hoy,
  },
  {
    id: 'cot-002',
    pedidoId: 'ped-001',
    proveedorId: 'prov-2',
    proveedorNombre: 'TecnoSuministros SA',
    precio: 158000,
    tiempoEntrega: '3 dias habiles',
    notas: 'Precio sin IVA. El flete se cotiza aparte segun destino.',
    calificacionProveedor: 4.2,
    estado: 'pendiente',
    fechaCreacion: hoy,
  },
  {
    id: 'cot-003',
    pedidoId: 'ped-003',
    proveedorId: 'prov-4',
    proveedorNombre: 'DistribuidoraElec AR',
    precio: 298000,
    tiempoEntrega: '5 dias habiles',
    notas: 'Marca Meanwell. Garantia 1 año. Factura A.',
    calificacionProveedor: 4.5,
    estado: 'aceptada',
    fechaCreacion: ayer,
  },
  {
    id: 'cot-004',
    pedidoId: 'ped-003',
    proveedorId: 'prov-3',
    proveedorNombre: 'ComponentesBA',
    precio: 285000,
    tiempoEntrega: '7 dias habiles',
    notas: 'Marca importada sin certificacion local.',
    calificacionProveedor: 3.9,
    estado: 'rechazada',
    fechaCreacion: ayer,
  },
];

export const ORDENES_INICIALES: Orden[] = [
  {
    id: 'ord-001',
    pedidoId: 'ped-003',
    cotizacionId: 'cot-003',
    compradorId: 'comprador-demo-001',
    proveedorId: 'prov-4',
    proveedorNombre: 'DistribuidoraElec AR',
    monto: 298000,
    estado: 'enviado',
    fechaConfirmacion: ayer,
    chatHabilitado: true,
    estadoPago: 'pendiente',
  },
];
