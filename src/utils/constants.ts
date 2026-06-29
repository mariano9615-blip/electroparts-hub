// Constantes globales del proyecto

export const CATEGORIAS = [
  'Cables y Conectores',
  'Semiconductores',
  'Resistencias y Capacitores',
  'Modulos y Placas',
  'Fuentes de Alimentacion',
  'Displays y Pantallas',
  'Sensores',
  'Herramientas Electronicas',
  'Iluminacion LED',
  'Componentes Pasivos',
] as const;

export const UNIDADES = [
  'unidades',
  'cajas',
  'metros',
  'kg',
  'rollos',
  'pares',
] as const;

export const PROVEEDORES_SIMULADOS = [
  { id: 'prov-1', nombre: 'ElectroMayorista Once', zona: 'Once', calificacion: 4.7, operacionesCompletadas: 312, verificado: true },
  { id: 'prov-2', nombre: 'TecnoSuministros SA', zona: 'Avellaneda', calificacion: 4.2, operacionesCompletadas: 198, verificado: true },
  { id: 'prov-3', nombre: 'ComponentesBA', zona: 'Once', calificacion: 3.9, operacionesCompletadas: 87, verificado: false },
  { id: 'prov-4', nombre: 'DistribuidoraElec AR', zona: 'Avellaneda', calificacion: 4.5, operacionesCompletadas: 445, verificado: true },
] as const;

export const COMPRADOR_ID = 'comprador-demo-001';
export const STORAGE_KEY_INITIALIZED = 'ep_initialized';
export const STORAGE_KEY_PEDIDOS = 'ep_pedidos';
export const STORAGE_KEY_COTIZACIONES = 'ep_cotizaciones';
export const STORAGE_KEY_ORDENES = 'ep_ordenes';
export const STORAGE_KEY_MENSAJES = 'ep_mensajes';
export const STORAGE_KEY_ROL = 'ep_rol';
export const STORAGE_KEY_NOTIFICACIONES = 'ep_notificaciones';
