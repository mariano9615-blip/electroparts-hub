# ANTIGRAVITY.md -- ElectroParts Hub
## Fuente de verdad arquitectonica. Leer completo antes de cualquier cambio.

## Stack y versiones (package.json exacto)
- react: ^19.2.7
- react-dom: ^19.2.7
- react-router-dom: ^7.18.0
- zustand: ^5.0.14
- @tabler/icons-react: ^3.44.0
- tailwindcss: ^4.3.1  (v4 — configuracion via @theme en CSS, NO tailwind.config.js)
- @tailwindcss/postcss: ^4.x  (plugin PostCSS requerido por v4, distinto de v3)
- vite: ^8.1.0
- typescript: ~6.0.2
- @vitejs/plugin-react: ^6.0.2
- autoprefixer: ^10.5.2
- prettier: ^3.8.5
- oxlint: ^1.69.0

## Sistema de diseno — Tailwind v4 + Paleta EP

Tailwind v4 NO usa tailwind.config.js para colores custom. Los tokens se definen
con la directiva @theme dentro del CSS.

Archivo: src/index.css  (unica fuente de verdad del sistema de diseno)

Configuracion PostCSS: postcss.config.js usa '@tailwindcss/postcss' (no 'tailwindcss').

Paleta EP disponible como clases Tailwind:
  bg-ep-green         #16a34a  (verde primario de marca)
  bg-ep-green-light   #dcfce7
  bg-ep-green-dark    #14532d
  bg-ep-green-hover   #15803d
  bg-ep-blue          #2563eb
  bg-ep-blue-light    #dbeafe
  bg-ep-blue-dark     #1e3a8a
  bg-ep-amber         #d97706
  bg-ep-amber-light   #fef3c7
  bg-ep-amber-dark    #92400e
  bg-ep-red           #dc2626
  bg-ep-red-light     #fee2e2
  bg-ep-red-dark      #991b1b
  bg-ep-bg            #f8fafc  (fondo global)
  bg-ep-surface       #ffffff
  bg-ep-surface-raised #f1f5f9
  bg-ep-border        #e2e8f0
  bg-ep-border-strong #cbd5e1
  text-ep-text-primary   #0f172a
  text-ep-text-secondary #475569
  text-ep-text-muted     #94a3b8
  text-ep-text-disabled  #cbd5e1

Tipografias: --font-sans (Inter) / --font-mono (JetBrains Mono), importadas desde Google Fonts.
Prefijos aplicables: bg-*, text-*, border-*, ring-*, etc.

Animacion CSS global: @keyframes typing-dot (pulsacion para indicador de "escribiendo" en chat)
  0%, 60%, 100% { opacity: 0.2; transform: scale(0.8); }
  30%            { opacity: 1;   transform: scale(1); }

## Autenticacion

Sistema de login del lado del cliente para proteger acceso en demos/presentaciones.
No hay backend — las credenciales son hardcodeadas.

Credenciales demo: usuario = 'admin', password = '123456'
Clave localStorage: 'ep_auth' (valor 'true' cuando hay sesion activa)

### useAuthStore (src/store/useAuthStore.ts)
State: autenticado: boolean, usuario: string | null
Inicializacion: lee localStorage['ep_auth']; si es 'true' arranca autenticado=true, usuario='admin'

Actions:
  login(usuario, password) → boolean
    Valida credenciales hardcodeadas. Si coinciden: setState autenticado=true,
    persiste ep_auth='true', retorna true. Si no: retorna false sin mutar estado.
  logout() → void
    setState autenticado=false/usuario=null, elimina ep_auth de localStorage.

### RutaProtegida / LayoutProtegido (src/router/AppRouter.tsx)
LayoutProtegido: layout route (sin path) que envuelve AppShell con <Outlet />.
  Lee useAuthStore.autenticado; si es false redirige a /login con Navigate replace.
  Todas las rutas de negocio son hijas de este layout — AppShell se monta una sola vez.

RutaProtegida: componente wrapper simple (usado solo en el catch-all *).
  Igual logica: si no autenticado → Navigate to="/login".

RutaLogin: componente que envuelve la ruta /login.
  Si ya autenticado → Navigate to="/comprador" (evita que usuario logueado vea el login).

### Pagina Login (src/pages/Login.tsx)
Fullscreen centrada, sin AppShell. Campos: usuario + password.
Flujo de submit: setTimeout 600ms simula verificacion → llama login() via getState().
  Si ok: el store muta autenticado=true → LayoutProtegido deja pasar → router redirige.
  Si falla: muestra mensaje de error + animacion shake en el card.
Animacion shake: clase CSS .shake definida en index.css (@keyframes shake, 0.4s).
  Se agrega/remueve via DOM ref para poder repetirse en intentos sucesivos.

### Logout
Boton "Salir" en TopBar: llama useAuthStore.getState().logout() + navigate('/login').
LayoutProtegido detecta autenticado=false y redirige automaticamente a /login.

## Stores Zustand (src/store/)

Patron comun a todos los stores:
  - Persistencia manual en localStorage (sin middleware persist de Zustand)
  - Lee localStorage al inicializarse; si no existe usa datos mock de src/data/mockData.ts
  - Cada action que muta estado persiste inmediatamente
  - Para llamar otros stores desde una action: useXxxStore.getState().action()

| Store                      | Entidad          | Clave localStorage    | Depende de                                              |
|----------------------------|------------------|-----------------------|---------------------------------------------------------|
| useAuthStore.ts            | Auth             | ep_auth               | —                                                       |
| useRolStore.ts             | Rol              | ep_rol                | —                                                       |
| usePedidosStore.ts         | Pedido[]         | ep_pedidos            | useNotificacionesStore                                  |
| useOrdenesStore.ts         | Orden[]          | ep_ordenes            | —                                                       |
| useCotizacionesStore.ts    | Cotizacion[]     | ep_cotizaciones       | useOrdenesStore, usePedidosStore, useNotificacionesStore |
| useChatStore.ts            | Mensaje[]        | ep_mensajes           | —                                                       |
| useNotificacionesStore.ts  | Notificacion[]   | ep_notificaciones     | —                                                       |

### useNotificacionesStore (src/store/useNotificacionesStore.ts)
Tipos exportados:
  TipoNotificacion: 'nueva_cotizacion' | 'pedido_adjudicado' | 'orden_confirmada' | 'nueva_orden' | 'cotizacion_aceptada'
  Notificacion: { id, tipo, titulo, mensaje, fecha, leida, rolDestino: 'comprador'|'proveedor', entidadId? }

State: notificaciones: Notificacion[]  (más reciente primero — nuevas se agregan al frente del array)

Actions:
  agregarNotificacion(n: Omit<Notificacion, 'id'|'fecha'|'leida'>) → asigna UUID, fecha ISO y leida=false; prepend al array
  marcarLeida(id) → muta leida=true para el id dado
  marcarTodasLeidas() → muta leida=true en todas
  eliminarNotificacion(id) → filtra el id del array
  limpiarTodas() → array vacío

Selectores (no son reactive hooks — llaman a get() internamente):
  getNoLeidas(rol) → filtra por rolDestino===rol y leida=false
  getTodas(rol) → filtra por rolDestino===rol

Persistencia: 'ep_notificaciones' en localStorage (JSON.stringify/parse manual, sin middleware).
Inicializa vacío si no hay clave guardada (sin datos mock).

Flujo de notificaciones por acción de negocio:
  usePedidosStore.agregarPedido() → notifica rolDestino='proveedor', tipo='nueva_orden', mensaje=pedido.titulo
  useCotizacionesStore.agregarCotizacion() → notifica rolDestino='comprador', tipo='nueva_cotizacion', mensaje con proveedor y precio
  useCotizacionesStore.aceptarCotizacion() → notifica rolDestino='comprador' (orden_confirmada) + rolDestino='proveedor' (cotizacion_aceptada)

Flujo critico en useCotizacionesStore.aceptarCotizacion():
  1. Cambia cotizacion seleccionada a 'aceptada'
  2. Cambia todas las demas cotizaciones del mismo pedido a 'rechazada'
  3. Construye objeto Orden con crypto.randomUUID()
  4. Llama useOrdenesStore.getState().agregarOrden(orden)
  5. Llama usePedidosStore.getState().actualizarEstadoPedido(pedidoId, 'adjudicado')
  6. Persiste cotizaciones en localStorage

## Hooks custom (src/hooks/)

useLocalStorage<T>(key, initialValue) → [T, setter]
  - Lee y parsea JSON de localStorage al montar
  - Setter persiste en localStorage automaticamente
  - Para uso en componentes con preferencias de UI (no en stores)

useSimuladorCotizaciones(pedidoId: string | null, presupuestoMax?: number) → { simulando: boolean }
  - Simula llegada de 4 cotizaciones de PROVEEDORES_SIMULADOS
  - Delays: 5s, 12s, 22s, 35s
  - Cada cotizacion llama agregarCotizacion() e incrementarCotizaciones() via getState()
  - simulando=true hasta que se dispara la ultima cotizacion
  - Cuando pedidoId es null el hook no hace nada
  - Cleanup de timeouts en desmontaje (evita memory leaks)
  - Se activa en PublicarPedido despues de crear el pedido: setPedidoIdSimulado(pedido.id)

## Router (src/router/AppRouter.tsx)

BrowserRouter + Routes + Route (API de React Router v7).
Todas las rutas estan envueltas en AppShell (layout wrapper).

| Ruta                        | Componente destino           |
|-----------------------------|------------------------------|
| /                           | → Navigate /comprador        |
| /comprador                  | DashboardComprador           |
| /comprador/publicar         | PublicarPedido               |
| /comprador/cotizaciones     | MisCotizacionesComprador     |
| /comprador/pedidos/:id      | DetallePedidoComprador       |
| /comprador/ordenes          | MisOrdenesComprador          |
| /comprador/chat             | ChatComprador                |
| /proveedor                  | DashboardProveedor           |
| /proveedor/pedidos          | PedidosDisponibles           |
| /proveedor/cotizaciones     | MisCotizacionesProveedor     |
| /proveedor/ordenes          | MisOrdenesProveedor          |
| /proveedor/chat             | ChatProveedor                |
| *                           | → Navigate /comprador        |

## Inicializacion (src/main.tsx)

Flujo al arrancar la app:
  1. initializarDatos(): si 'ep_initialized' no existe en localStorage,
     escribe PEDIDOS_INICIALES, COTIZACIONES_INICIALES, ORDENES_INICIALES,
     MENSAJES_INICIALES y marca 'ep_initialized'='true'
  2. Los stores leen localStorage al instanciarse — ya encuentran datos en el primer arranque
  3. Monta <StrictMode><AppRouter /></StrictMode>

Claves localStorage del sistema:
  ep_initialized, ep_auth, ep_rol, ep_pedidos, ep_cotizaciones, ep_ordenes, ep_mensajes

## IDs de sesion demo

  COMPRADOR_ID = 'comprador-demo-001'   → importar de src/utils/constants.ts
  Proveedores mock: 'prov-1', 'prov-2', 'prov-3', 'prov-4'
  Proveedor demo logueado: 'prov-demo-001'
  PROV_IDS (para filtrar mis cotizaciones proveedor): ['prov-1','prov-2','prov-3','prov-4','prov-demo-001']
  PROV_CHAT_IDS (para filtrar ordenes de chat proveedor): ['prov-4','prov-demo-001']

## Estructura de carpetas
src/
  assets/          -- recursos estaticos
  components/
    ui/            -- componentes base: Button, Badge, Card, Input, TextArea, Select,
                      Modal, Spinner, StatCard, EmptyState, PageHeader (barrel: index.ts)
    layout/        -- AppShell, Sidebar, TopBar, NotificacionesPanel
    pedidos/       -- PedidoCard
    cotizaciones/  -- CotizacionCard, CotizacionForm
    ordenes/       -- OrdenCard
    domain/        -- PedidosTable, CotizacionesTable (tablas para dashboards)
    chat/          -- (reservado para extraccion futura)
  pages/
    comprador/     -- DashboardComprador, PublicarPedido, MisCotizacionesComprador,
                      DetallePedidoComprador, MisOrdenesComprador, ChatComprador
    proveedor/     -- DashboardProveedor, PedidosDisponibles, MisCotizacionesProveedor,
                      MisOrdenesProveedor, ChatProveedor
  store/           -- useRolStore, usePedidosStore, useOrdenesStore,
                      useCotizacionesStore, useChatStore, useNotificacionesStore
  types/           -- index.ts: Rol, Pedido, Cotizacion, Orden, Mensaje, Proveedor,
                      EstadoPedido, EstadoCotizacion, EstadoOrden
  data/            -- mockData.ts: PEDIDOS_INICIALES, COTIZACIONES_INICIALES,
                      ORDENES_INICIALES, MENSAJES_INICIALES
  hooks/           -- useLocalStorage.ts, useSimuladorCotizaciones.ts
  utils/           -- constants.ts (CATEGORIAS, UNIDADES, PROVEEDORES_SIMULADOS,
                      COMPRADOR_ID, STORAGE_KEY_*), formatters.ts
  router/          -- AppRouter.tsx

## Componentes UI base (src/components/ui/)

Todos se exportan desde `src/components/ui/index.ts`.

| Componente   | Props clave                                              | Variantes / notas |
|--------------|----------------------------------------------------------|-------------------|
| Button       | variant, size, loading, fullWidth, onClick, type         | primary/secondary/danger/ghost · sm/md/lg |
| Badge        | color, dot                                               | green/blue/amber/red/gray |
| Card         | padding, hoverable                                       | none/sm/md/lg padding |
| Input        | label, error, hint, required, type, min, max, step       | estados: normal/focus/error/disabled |
| TextArea     | label, error, hint, rows                                 | igual que Input |
| Select       | options [{value,label}], placeholder, error, required    | igual que Input |
| Modal        | open, onClose, title, size, footer                       | sm/md/lg · portal a document.body · trap foco + Escape |
| Spinner      | size, color                                              | sm/md/lg · dentro de Button cuando loading=true |
| StatCard     | label, value, icono, color, sub?                         | color: green/blue/amber/red · SIN badge (eliminado en v0.1.5) |
| EmptyState   | icono, titulo, mensaje, accion?                          | accion: {label, onClick} muestra Button primary |
| PageHeader   | titulo, descripcion?, accion?                            | flex justify-between · accion alineado a la derecha |

IMPORTANTE: el tipo de icono es React.ComponentType<{ size?: number; stroke?: number }>.
NO acepta className directamente — envolver en un div para aplicar color.

### Convenciones de diseno (aplican a todos los componentes)
- Colores: siempre clases ep-*. Nunca gray-* ni variables CSS del sistema.
- Bordes: border-ep-border para superficies, border-ep-border-strong para enfasis.
- Texto: text-ep-text-primary → titulos/datos; text-ep-text-secondary → descripcion/metadatos;
  text-ep-text-muted → labels/fechas; text-ep-text-disabled → campos inactivos.
- Border radius: rounded-lg inputs/botones, rounded-xl cards, rounded-2xl modales.
- Sombras: shadow-sm SIEMPRE en Card y superficies elevadas. Nunca shadow-lg en elementos inline.
- Transiciones: transition-colors duration-150 en todos los elementos interactivos.
- Tipografia numerica: font-mono (JetBrains Mono) para precios, IDs y cantidades.
- Headers de seccion: text-xs font-bold text-ep-text-muted uppercase tracking-widest + border-b border-ep-border pb-2.5 mb-4
- Separadores internos de card (footer): border-t border-ep-border mt-3 pt-3
- StatCard layout: border-l-4 con color del stat como acento, icono 13px inline junto al label, ambos coloreados con el color del stat (no text-ep-text-muted). Valor text-[26px] font-medium font-mono leading-none mt-1. Label text-[10px] font-medium uppercase tracking-[0.06em]. Sub text-[11px] text-ep-text-muted mt-0.5. Sin badge de pendientes — ese dato ya no se muestra en StatCard. Sin Card wrapper — div propio con bg-ep-surface border border-ep-border rounded-lg (no rounded-xl, no shadow-sm).
- PageHeader: titulo text-2xl font-bold leading-tight + border-b border-ep-border pb-5 mb-6
- EmptyState: contenedor con bg-ep-surface border shadow-sm rounded-xl, icono text-ep-text-disabled
- Sidebar activo: stripe absoluta left-0 h-6 w-[3px] bg-ep-green rounded-r-full + bg-ep-green-light text-ep-green-dark font-semibold
- Sidebar branding: icono en pill verde (w-8 h-8 bg-ep-green rounded-lg) + texto bold tracking-tight
- TopBar: shadow-sm z-10 + breadcrumb font-semibold

### Color de Badge por estado
| Color | Usar para |
|-------|-----------|
| green | Activo/positivo, rol comprador, pedido abierto, cotizacion aceptada, orden entregada |
| blue  | En proceso, rol proveedor, pedido en_cotizacion, orden confirmada |
| amber | Pendiente de accion, orden en_transito, cotizacion pendiente |
| red   | Error/rechazo, pedido cancelado, cotizacion rechazada, orden disputada |
| gray  | Finalizado neutro, pedido adjudicado, "Ya cotizaste" |

## Componentes de dominio

### PedidoCard (src/components/pedidos/PedidoCard.tsx)
Props: pedido: Pedido, compacto?: boolean, onCotizar?: () => void
- Normal: titulo, badge estado, metadatos (cantidad, unidad, categoria, fecha), descripcion,
  presupuesto max, contador cotizaciones. Fecha urgente (< 3 dias) en rojo + IconAlertTriangle.
  Boton "Cotizar" (IconSend) si onCotizar definido.
- Compacto: titulo + badge, categoria + fecha, contador cotizaciones.
Sin dependencias de store — recibe el pedido por prop.

### CotizacionCard (src/components/cotizaciones/CotizacionCard.tsx)
Props: cotizacion: Cotizacion, onAceptar?: () => void, onRechazar?: () => void, compacto?: boolean
- Normal: nombre proveedor, badge estado, zona, badge "Verificado", estrellas, precio (font-mono),
  tiempo entrega, notas en box destacada, fecha relativa, botones si estado=pendiente y ambos callbacks.
- Compacto: nombre, precio, badge estado, tiempo entrega.
Depende de PROVEEDORES_SIMULADOS de constants.ts para zona/verificado.

### OrdenCard (src/components/ordenes/OrdenCard.tsx)
Props: orden: Orden, onIrChat?: () => void
Muestra: ID abreviado (font-mono), badge estado, nombre proveedor con IconBuilding,
monto (font-mono), fecha confirmacion. Boton "Ir al chat" si onIrChat definido.

### PedidosTable (src/components/domain/PedidosTable.tsx)
Props: pedidos: Pedido[], onCotizar?: (pedido: Pedido) => void, linkeable?: boolean (default true)
Tabla HTML con columnas: Producto | Categoría | Fecha límite | Cotizaciones | Estado | (Acción).
Columna Acción (Button "Cotizar") solo aparece cuando onCotizar está definido.
Columna Producto: cuando linkeable=true (default), el título es un <Link> a /comprador/pedidos/${pedido.id}
  con estilo text-ep-blue hover:underline font-medium. Pasar linkeable={false} en contexto proveedor.
Fecha urgente (< 3 dias) en rojo con IconAlertTriangle. divide-y divide-ep-border + hover:bg-ep-surface-raised.

### CotizacionesTable (src/components/domain/CotizacionesTable.tsx)
Props: cotizaciones: Cotizacion[], pedidos: Pedido[]
Tabla HTML con columnas: Proveedor | Pedido | Precio | Entrega | Estado.
Resuelve el título del pedido internamente via pedidos[]. Precio en font-mono. divide-y divide-ep-border.

### CotizacionForm (src/components/cotizaciones/CotizacionForm.tsx)
Props: pedidoId: string, onSuccess: () => void
Campos: precio (number, min=1, step=100), tiempoEntrega (text), notas (textarea, opcional).
Al enviar: valida precio > 0 y tiempoEntrega no vacio; si valido, crea Cotizacion con
  proveedorId='prov-demo-001', proveedorNombre='Mi Empresa (Proveedor)', estado='pendiente',
  calificacion=4.0; llama agregarCotizacion() via getState(); setTimeout 600ms → onSuccess().

## Layout principal (src/components/layout/)

### AppShell (AppShell.tsx)
Gestiona sidebarAbierto (useState) para mobile.
Desktop (≥ md): div.hidden.md:flex (w-64) con Sidebar + div.flex-1 con TopBar + main p-6.
Mobile: sidebar como drawer con overlay semitransparente al tocar hamburger en TopBar.

### Sidebar (Sidebar.tsx)
Lee useRolStore y useCotizacionesStore directamente.
Secciones: Branding (IconBolt) → Toggle rol → Etiqueta seccion → Navegacion por rol → Footer v0.1.0.
Badge amber sobre "Cotizaciones" = count cotizaciones con estado='pendiente'.
Items comprador: Dashboard, Publicar pedido, Cotizaciones (badge), Mis ordenes, Chat activo.
Items proveedor: Dashboard, Pedidos disponibles, Mis cotizaciones (badge), Mis ordenes, Chat activo.

### TopBar (TopBar.tsx)
Props: onToggleSidebar: () => void
Mobile: IconMenu2 → onToggleSidebar. Desktop: nombre seccion activa via BREADCRUMB_MAP[pathname].
Slot derecho: IconBell con badge rojo de no-leidas (max "9+") + Badge rol + avatar "ME" + "Mi Empresa".
Estado local: panelAbierto (useState) — controla visibilidad de NotificacionesPanel.
Renderiza NotificacionesPanel fuera del <header> dentro de un Fragment.

### NotificacionesPanel (NotificacionesPanel.tsx)
Props: abierto: boolean, onCerrar: () => void
Panel lateral derecho fixed, w-80, h-full, z-50, bg-ep-surface, border-l, shadow-2xl.
Animación: translate-x-full (cerrado) → translate-x-0 (abierto) con transition-transform duration-200.
Overlay transparente fixed inset-0 z-40 activo cuando abierto=true — click cierra el panel.
Lee useRolStore para filtrar notificaciones por rol activo.
Header h-14: título "Notificaciones" + botón "Marcar todas como leídas" (solo si hay no-leídas) + botón X.
Lista: divide-y divide-ep-border; cada ítem muestra ícono coloreado según tipo, título (bold si no-leída),
  mensaje en text-xs text-ep-text-secondary, fecha relativa (formatFechaRelativa), punto verde si no-leída,
  botón X pequeño para eliminar (stopPropagation — no marca como leída).
Click en ítem → marcarLeida(id).
No-leídas: bg-ep-surface-raised como fondo; leídas: sin fondo especial.
Estado vacío: EmptyState con IconBell cuando no hay notificaciones.
Íconos por tipo: nueva_cotizacion→IconFileInvoice(blue), pedido_adjudicado→IconAward(amber),
  orden_confirmada→IconCircleCheck(green), nueva_orden→IconPackage(blue), cotizacion_aceptada→IconThumbUp(green).

## Paginas comprador (src/pages/comprador/)

### DashboardComprador.tsx · /comprador
Stores leidos: usePedidosStore, useCotizacionesStore, useOrdenesStore
Calcula: misPedidos (compradorId=COMPRADOR_ID), pedidosActivos (abierto|en_cotizacion),
  misCotizaciones (pedidoId en misPedidos), cotizacionesPendientes (estado=pendiente),
  misOrdenes (compradorId=COMPRADOR_ID), ordenesEnCurso (confirmada|en_transito).
Layout: PageHeader con boton "Publicar pedido" → navigate('/comprador/publicar')
  Grid 3-col de StatCards (Pedidos activos green, Cotizaciones recibidas blue+badge, Ordenes en curso amber)
  Seccion "Ultimos pedidos" — 3 mas recientes, PedidoCard compacto=true
  Seccion "Ultimas cotizaciones" — 3 mas recientes, CotizacionCard compacto=true

### PublicarPedido.tsx · /comprador/publicar
Estado local: titulo, descripcion, cantidad, unidad, categoria, presupuestoMax, fechaLimite,
  errores, enviando, exitoso, pedidoIdSimulado.
Hook: useSimuladorCotizaciones(pedidoIdSimulado, presupuestoMax) — se activa cuando pedidoIdSimulado != null.
handleSubmit(): valida campos requeridos → crea Pedido con crypto.randomUUID() →
  agregarPedido() → setPedidoIdSimulado(pedido.id) → setExitoso(true) →
  setTimeout 3000ms → navigate('/comprador/cotizaciones').
Banner exito: bg-ep-green-light, border-ep-green, IconCircleCheck + Spinner.

### DetallePedidoComprador.tsx · /comprador/pedidos/:id
Stores leidos: usePedidosStore, useCotizacionesStore
Recibe id via useParams(). Si el pedido no existe: EmptyState con "Pedido no encontrado" y botón volver.
Layout:
  Botón "← Volver" (navigate(-1)) arriba del header.
  Header: título text-2xl + badge de estado alineado a la derecha + subtítulo categoría·cantidad·unidad.
  Card información: grid 2 columnas — izquierda descripción completa; derecha grid 2-col de labels/valores
    (presupuesto máx si existe, fecha límite, cantidad+unidad, publicado, total cotizaciones).
  Sección "Cotizaciones recibidas (N)": si hay cero → EmptyState; si hay → tabla con columnas
    Proveedor | Precio (font-mono) | Precio unitario (precio/cantidad, font-mono text-muted) |
    Entrega | Notas (truncado 60 chars, title= tooltip) | Estado (Badge).
  Fila con precio mínimo: bg-ep-green-light en toda la fila + badge inline "Mejor precio" (bg-ep-green text-white text-[10px] rounded-full).
  Cotizaciones ordenadas por precio ascendente.
Solo lectura — sin adjudicar ni modificar estado.

### MisCotizacionesComprador.tsx · /comprador/cotizaciones
Tabs: todas | pendientes | aceptadas | rechazadas (con count entre parentesis).
Agrupa cotizaciones por pedido: encabezado text-xs uppercase + CotizacionCard con callbacks.
onAceptar: aceptarCotizacion(id) → navigate('/comprador/ordenes').
onRechazar: rechazarCotizacion(id).
EmptyState segun tab activa.

### MisOrdenesComprador.tsx · /comprador/ordenes
Filtra ordenes por compradorId=COMPRADOR_ID, ordena por fechaConfirmacion desc.
Lista de OrdenCard con onIrChat si chatHabilitado → navigate('/comprador/chat').

### ChatComprador.tsx · /comprador/chat
ordenActiva: primera orden con compradorId=COMPRADOR_ID y chatHabilitado=true.
Mensajes del comprador alineados a la DERECHA (bg-ep-green text-white, rounded-tr-sm).
Mensajes del proveedor alineados a la IZQUIERDA (bg-ep-surface-raised, rounded-tl-sm).
enviarMensaje(): crea msg comprador → limpiar input → setEscribiendo(true) →
  setTimeout 1800ms → respuesta automatica rotativa (4 frases) → msg proveedor → setEscribiendo(false).
Indicador "escribiendo": 3 puntos animados con @keyframes typing-dot (delays 0/150/300ms).
Auto-scroll al ultimo mensaje via useEffect sobre mensajesOrden/escribiendo.
Textarea auto-resize hasta 4 lineas; Enter sin Shift envia.

## Paginas proveedor (src/pages/proveedor/)

### DashboardProveedor.tsx · /proveedor
Stores: usePedidosStore, useCotizacionesStore, useOrdenesStore.
Calcula: pedidosDisponibles (abierto|en_cotizacion), misCotizaciones (proveedorId en PROV_IDS),
  misOrdenes (proveedorId en ['prov-4','prov-demo-001']).
Grid 3-col StatCards + lista de 5 pedidos recientes disponibles con PedidosTable + onCotizar.
Header de sección "Pedidos recientes disponibles" con link "Ver todos →" → navigate('/proveedor/pedidos').
Modal de cotizacion: Modal con CotizacionForm abierto cuando pedidoSeleccionado != null.
Toast de exito (fixed bottom-6 right-6) que desaparece en 3s.

### PedidosDisponibles.tsx · /proveedor/pedidos
Filtros: busqueda en titulo/descripcion + categoriaFiltro.
Detecta si ya cotizte un pedido: cotizaciones.some(c => c.pedidoId=id && c.proveedorId='prov-demo-001').
Si ya cotizo: no pasa onCotizar al PedidoCard y muestra Badge gray "Ya cotizaste" superpuesto.
Modal con resumen del pedido (titulo, cantidad, unidad, categoria) + CotizacionForm.
Toast de exito igual que DashboardProveedor.

### MisCotizacionesProveedor.tsx · /proveedor/cotizaciones
Misma logica de tabs que la version comprador.
Filtra cotizaciones donde proveedorId in PROV_IDS = ['prov-1','prov-2','prov-3','prov-4','prov-demo-001'].
Sin botones de accion (solo visualizacion). Agrupa por pedido con titulo del pedido como encabezado.

### MisOrdenesProveedor.tsx · /proveedor/ordenes
Filtra ordenes donde proveedorId in ['prov-4','prov-demo-001'].
OrdenCard con onIrChat si chatHabilitado → navigate('/proveedor/chat').

### ChatProveedor.tsx · /proveedor/chat
Igual que ChatComprador con logica invertida:
  ordenActiva: primera orden con proveedorId in ['prov-4','prov-demo-001'] y chatHabilitado=true.
  Mensajes del PROVEEDOR alineados a la DERECHA (burbuja verde).
  Mensajes del COMPRADOR alineados a la IZQUIERDA (burbuja gris).
  Mensajes enviados: autorRol='proveedor', autorNombre='DistribuidoraElec AR'.
  Respuestas automaticas del comprador (4 frases distintas).

## Flujos de negocio implementados

### Flujo comprador completo
1. /comprador → DashboardComprador muestra metricas y acceso rapido
2. Click "Publicar pedido" → navigate('/comprador/publicar')
3. PublicarPedido: llenar formulario → handleSubmit() → agregarPedido() →
   setPedidoIdSimulado() (activa simulador) → banner exito → 3s → navigate('/comprador/cotizaciones')
4. MisCotizacionesComprador: llegan 4 cotizaciones a los 5/12/22/35s (via simulador)
   El badge del sidebar se actualiza en tiempo real.
5. Click "Aceptar cotizacion" → aceptarCotizacion(id):
   - cotizacion → 'aceptada', resto del pedido → 'rechazada'
   - crea Orden con chatHabilitado=true
   - pedido → 'adjudicado'
   - navigate('/comprador/ordenes')
6. MisOrdenesComprador: lista la orden con boton "Ir al chat"
7. ChatComprador: conversacion bidireccional con respuestas automaticas del proveedor

### Flujo proveedor completo
1. Toggle sidebar → rol proveedor → navigate('/proveedor')
2. DashboardProveedor → ver estadisticas y pedidos recientes
3. PedidosDisponibles: buscar/filtrar pedidos → click "Cotizar" → modal
4. CotizacionForm: completar precio/tiempoEntrega/notas → enviar
   agregarCotizacion() via getState(), badge "Ya cotizaste" en el pedido
5. MisCotizacionesProveedor: ver estado de todas las cotizaciones enviadas
6. ChatProveedor: conversacion bidireccional con respuestas automaticas del comprador

### Flujo de cambio de rol
Click toggle Comprador/Proveedor en Sidebar → useRolStore.setRol() → navigate('/comprador'|'/proveedor')
→ Sidebar actualiza items y badge → TopBar actualiza badge de rol.

## Convenciones del proyecto
- UI completamente en espanol
- Nombres tecnicos de archivos y funciones en ingles (convencion React/TS)
- Tokens de color definidos en src/index.css con @theme (Tailwind v4) — no en tailwind.config.js
- Estado global via Zustand — nunca useState para logica de negocio
- Persistencia via localStorage encapsulada en cada store (sin middleware)
- Un archivo por componente
- Exports nombrados para componentes reutilizables, default para paginas
- Props siempre tipadas con interface NombreComponenteProps
- Comentarios en el codigo en espanol

## Comandos utiles
npm run dev      # Servidor local en http://localhost:5173
npm run build    # Build de produccion (tsc -b && vite build)
npm run lint     # Linting con oxlint
