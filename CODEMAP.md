# CODEMAP — ElectroParts Hub

Última actualización: 2026-06-30
Rama: mdemichelis

---

## src/pages/comprador/DetallePedidoComprador.tsx

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 1–10 | imports | React (`useMemo`, `useState`), React Router (`useParams`, `useNavigate`), íconos Tabler, componentes UI (`Badge`, `Button`, `EmptyState`, `Modal`, `Select`), los cuatro stores, utilidades de formato, tipo `Cotizacion` |
| 12 | `BadgeColor` | Tipo local para variantes de color de `Badge` |
| 14–19 | `ESTADO_COLOR` | Mapa estado pedido → color badge (`abierto`→green, `en_cotizacion`→blue, `adjudicado`→gray, `cancelado`→red) |
| 21–26 | `ESTADO_LABEL` | Mapa estado pedido → etiqueta legible en español |
| 28–32 | `COT_ESTADO_COLOR` | Mapa estado cotización → color badge (`pendiente`→amber, `aceptada`→green, `rechazada`→red) |
| 34–38 | `COT_ESTADO_LABEL` | Mapa estado cotización → etiqueta legible en español |
| 40–45 | `FILTRO_ESTADO_COT_OPTIONS` | Opciones del select de estado de cotizaciones: Todas / Pendiente / Aceptada / Rechazada |
| 47–51 | `ORDEN_PRECIO_OPTIONS` | Opciones del select de orden por precio: Sin orden / Menor a mayor / Mayor a menor |
| 53 | `TH` | Clases Tailwind compartidas de todos los `<th>` de la tabla de cotizaciones |
| 55 | `DetallePedidoComprador` | Página exportada por defecto para la ruta `/comprador/pedidos/:id` |
| 56–57 | router hooks | `useParams` extrae `id` de URL; `useNavigate` para navegación programática |
| 59–60 | `useState` modales | `modalAdjudicar: Cotizacion\|null` y `modalRechazar: Cotizacion\|null` — controlan qué modal está abierto |
| 62–65 | `useState` filtros | `filtroEstadoCot`, `filtroProveedor`, `ordenPrecio` — estado local de UI de la barra de filtros, no persiste en store |
| 67–71 | suscripciones a stores | Lee `pedidos`, `cotizaciones`, `ordenes`; extrae `aceptarCotizacion` y `rechazarCotizacion` de sus stores |
| 73 | `pedido` | Busca el pedido cuyo `id` coincide con el parámetro de URL. No es un hook — resultado plain JS |
| 75–79 | `todasCotizacionesPedido` | `useMemo` que filtra cotizaciones por `pedidoId === pedido?.id`. Sin filtros aplicados — es la fuente de verdad para el count del header y para `precioMinimo`. Colocado antes del early return porque es un hook |
| 81–89 | `proveedoresOptions` | `useMemo` que construye el array de opciones del select de proveedor: "Todos los proveedores" + entries únicas de `Map(proveedorId → proveedorNombre)` sobre `todasCotizacionesPedido` |
| 91–104 | `cotizacionesPedido` | `useMemo` con la lista filtrada y ordenada para la tabla: aplica filtros de estado, proveedor y orden por precio. Depende de `todasCotizacionesPedido`, `filtroEstadoCot`, `filtroProveedor`, `ordenPrecio` |
| 106–113 | `precioMinimo` | `useMemo` calculado siempre sobre `todasCotizacionesPedido` (no sobre filtradas) para que el badge "Mejor precio" sea consistente independientemente de los filtros activos |
| 115 | `hayFiltrosCot` | Booleano derivado truthy cuando alguno de los tres filtros es no-vacío; controla visibilidad del botón "Limpiar filtros" |
| 117–121 | `limpiarFiltrosCot` | Resetea `filtroEstadoCot`, `filtroProveedor` y `ordenPrecio` a string vacío |
| 123–141 | guard: pedido no encontrado | Si `pedido` es undefined: renderiza botón "Volver" hacia `/comprador/cotizaciones` + `EmptyState`. Los hooks anteriores ya se ejecutaron en orden correcto antes de este early return |
| 143–145 | derivados post-guard | `pedidoAdjudicado`, `cotizacionAceptada` (desde `todasCotizacionesPedido`), `ordenAdjudicada` — plain JS seguro pues `pedido` está garantizado |
| 147–166 | `handleConfirmarAdjudicacion` | Notifica a proveedores rechazados iterando `todasCotizacionesPedido` (no las filtradas); llama `aceptarCotizacion()` del store vía suscripción reactiva; cierra modal |
| 168–181 | `handleConfirmarRechazo` | Llama `rechazarCotizacion()` + notifica al proveedor vía `useNotificacionesStore.getState()`; cierra modal |
| 183–191 | JSX: botón volver | `navigate(-1)`. Estilo `text-ep-text-muted hover:text-ep-text-primary`, `IconArrowLeft` |
| 193–204 | JSX: header pedido | `flex justify-between`: título `text-2xl font-bold`, subtítulo `categoría · cantidad unidad`, badge de estado alineado derecha |
| 206–245 | JSX: card información | `bg-ep-surface border border-ep-border rounded-lg p-5`. Grid 2 cols: descripción completa a la izquierda; grid 2-col de metadatos a la derecha |
| 247–253 | JSX: header sección cotizaciones | `<h2>` con count = `todasCotizacionesPedido.length` (total sin filtrar), estilo `text-xs font-bold uppercase tracking-widest border-b` |
| 255–271 | JSX: barra filtros cotizaciones | Visible solo si `todasCotizacionesPedido.length > 0`. Contenedor `bg-ep-blue-light/10 border border-ep-border rounded-lg p-3`. Tres `Select` (estado, proveedor, orden precio) + botón "Limpiar filtros" condicional |
| 273–280 | JSX: banner adjudicado | `bg-ep-green-light border border-ep-green` cuando `pedidoAdjudicado && cotizacionAceptada` |
| 282–286 | JSX: EmptyState sin cotizaciones | `EmptyState` con `IconInbox` cuando `todasCotizacionesPedido.length === 0` (nunca llegaron cotizaciones) |
| 287–290 | JSX: sin resultados con filtros | `<p className="text-center py-8 text-sm text-ep-text-muted">` cuando `cotizacionesPedido.length === 0` pero `todasCotizacionesPedido.length > 0` |
| 291–390 | JSX: tabla cotizaciones | Tabla con borde y overflow hidden. Columnas: Proveedor, Precio, Precio unitario, Entrega, Notas, Estado, Acciones (condicional). Usa `cotizacionesPedido` (filtrada/ordenada). La fila con `esMejorPrecio` (basado en `precioMinimo` sobre todas) tiene fondo `bg-ep-green-light` |
| 392–448 | JSX: Modal adjudicar | `size="md"`. Cuerpo: grid 3 cols (proveedor, precio, entrega) + aviso amber `IconAlertTriangle`. Footer: "Cancelar" + "Confirmar adjudicación" → `handleConfirmarAdjudicacion` |
| 450–493 | JSX: Modal rechazar | `size="sm"`. Cuerpo: "¿Rechazar la cotización de [proveedor]?". Footer: "Cancelar" + "Confirmar rechazo" (danger) → `handleConfirmarRechazo` |

---

## src/store/useCotizacionesStore.ts

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 1–7 | imports | Zustand `create`, tipos `Cotizacion` y `Orden`, constantes de storage, datos mock, y los tres stores de los que depende (`useOrdenesStore`, `usePedidosStore`, `useNotificacionesStore`) |
| 9–14 | `CotizacionesState` | Interface del store: array `cotizaciones: Cotizacion[]` más las tres acciones públicas (`agregarCotizacion`, `aceptarCotizacion`, `rechazarCotizacion`) |
| 16–25 | `leerCotizaciones()` | Lee y parsea `STORAGE_KEY_COTIZACIONES` de localStorage. Si el valor no existe, no es parseable, o no es un array, retorna `COTIZACIONES_INICIALES` del mock |
| 27–29 | `persistir()` | Serializa el array completo de cotizaciones a JSON y lo escribe en localStorage bajo `STORAGE_KEY_COTIZACIONES` |
| 31–99 | `useCotizacionesStore` | Instancia del store creada con `create<CotizacionesState>` |
| 32 | estado inicial | `cotizaciones: leerCotizaciones()` — se hidrata desde localStorage en el momento de creación del store |
| 34–44 | `agregarCotizacion(cotizacion)` | Agrega la cotización al array, persiste, y dispara una notificación `nueva_cotizacion` al rol `comprador` con el nombre del proveedor y el precio |
| 46–90 | `aceptarCotizacion(cotizacionId)` | Flujo completo de adjudicación: (1) busca la cotización por id; (2) mapea el array marcando la seleccionada como `'aceptada'` y todas las demás del mismo `pedidoId` como `'rechazada'`; (3) construye un objeto `Orden` con `crypto.randomUUID()` como id, `estado: 'confirmada'`, `chatHabilitado: true` y fecha actual; (4) llama `useOrdenesStore.getState().agregarOrden(orden)`; (5) llama `usePedidosStore.getState().actualizarEstadoPedido(pedidoId, 'adjudicado')`; (6) persiste y actualiza el estado; (7) dispara notificación `orden_confirmada` al comprador y notificación `cotizacion_aceptada` al proveedor ganador |
| 92–98 | `rechazarCotizacion(cotizacionId)` | Mapea el array cambiando solo la cotización con el id dado a `estado: 'rechazada'`. Persiste y actualiza el estado. No dispara notificaciones (se manejan desde el componente llamante) |

---

## src/store/useOrdenesStore.ts

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 1–3 | imports | Zustand `create`, tipos `Orden` y `EstadoOrden`, constante de storage, datos mock |
| 5–9 | `OrdenesState` | Interface del store: array `ordenes: Orden[]` más las acciones `agregarOrden` y `actualizarEstadoOrden` |
| 11–20 | `leerOrdenes()` | Lee y parsea `STORAGE_KEY_ORDENES` de localStorage. Retorna `ORDENES_INICIALES` si no existe o no es un array válido |
| 22–24 | `persistir()` | Serializa el array completo de órdenes a JSON y lo escribe en localStorage |
| 26–41 | `useOrdenesStore` | Instancia del store creada con `create<OrdenesState>` |
| 27 | estado inicial | `ordenes: leerOrdenes()` |
| 30–34 | `agregarOrden(orden)` | Agrega la nueva orden al final del array, persiste y actualiza el estado. Es llamada exclusivamente desde `useCotizacionesStore.aceptarCotizacion()` vía `getState()` |
| 36–40 | `actualizarEstadoOrden(id, estado)` | Mapea el array cambiando el `estado` de la orden que coincide con el `id`. Persiste y actualiza. Se usa para avanzar el ciclo de vida de la orden (confirmada → en_transito → entregada) |

---

## src/store/usePedidosStore.ts

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 1–5 | imports | Zustand `create`, tipos `Pedido` y `EstadoPedido`, constante de storage, datos mock, `useNotificacionesStore` |
| 7–12 | `PedidosState` | Interface del store: array `pedidos: Pedido[]` más las acciones `agregarPedido`, `actualizarEstadoPedido` e `incrementarCotizaciones` |
| 14–23 | `leerPedidos()` | Lee y parsea `STORAGE_KEY_PEDIDOS` de localStorage. Retorna `PEDIDOS_INICIALES` si no existe o no es un array válido |
| 25–27 | `persistir()` | Serializa el array completo de pedidos a JSON y lo escribe en localStorage |
| 29–62 | `usePedidosStore` | Instancia del store creada con `create<PedidosState>` |
| 30 | estado inicial | `pedidos: leerPedidos()` |
| 32–43 | `agregarPedido(pedido)` | Agrega el nuevo pedido al final del array, persiste, y dispara una notificación `nueva_orden` con `rolDestino: 'proveedor'` para que los proveedores sean alertados del nuevo pedido disponible |
| 45–49 | `actualizarEstadoPedido(id, estado)` | Mapea el array cambiando el `estado` del pedido que coincide con el `id`. Persiste y actualiza. Es llamada desde `useCotizacionesStore.aceptarCotizacion()` vía `getState()` para pasar el pedido a `'adjudicado'` |
| 51–61 | `incrementarCotizaciones(pedidoId)` | Incrementa en 1 el campo `cotizacionesRecibidas` del pedido. Si antes era 0, además cambia el `estado` de `'abierto'` a `'en_cotizacion'`. Llamada desde `useSimuladorCotizaciones` cada vez que llega una nueva cotización simulada |

---

## src/store/useNotificacionesStore.ts

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 1–2 | imports | Zustand `create`, constante de storage |
| 4–9 | `TipoNotificacion` | Unión de strings que enumera todos los tipos posibles de notificación: `nueva_cotizacion`, `pedido_adjudicado`, `orden_confirmada`, `nueva_orden`, `cotizacion_aceptada`. Exportado para uso en componentes |
| 11–19 | `Notificacion` | Interface exportada que describe la estructura de una notificación: `id`, `tipo`, `titulo`, `mensaje`, `fecha` (ISO), `leida` (boolean), `rolDestino` (`'comprador'`\|`'proveedor'`), y `entidadId?` opcional para referenciar la entidad relacionada |
| 21–31 | `NotificacionesState` | Interface interna del store: array `notificaciones`, las cinco acciones mutadoras, y los dos selectores no reactivos (`getNoLeidas`, `getTodas`) |
| 33–42 | `leerNotificaciones()` | Lee y parsea `STORAGE_KEY_NOTIFICACIONES` de localStorage. Retorna array vacío `[]` si no existe (no hay datos mock para notificaciones) |
| 44–46 | `persistir()` | Serializa el array completo de notificaciones a JSON y lo escribe en localStorage |
| 48–95 | `useNotificacionesStore` | Instancia del store creada con `create<NotificacionesState>` |
| 49 | estado inicial | `notificaciones: leerNotificaciones()` |
| 51–61 | `agregarNotificacion(n)` | Recibe un objeto sin `id`, `fecha` ni `leida`. Asigna `id` vía `crypto.randomUUID()`, `fecha` como ISO string del momento actual, y `leida: false`. Hace prepend (no push) para que las más recientes aparezcan primero. Persiste y actualiza |
| 63–68 | `marcarLeida(id)` | Mapea el array cambiando `leida: true` solo para la notificación con el `id` dado. Persiste y actualiza |
| 70–74 | `marcarTodasLeidas()` | Mapea el array completo cambiando `leida: true` en todas las notificaciones. Persiste y actualiza |
| 76–80 | `eliminarNotificacion(id)` | Filtra el array descartando la notificación con el `id` dado. Persiste y actualiza. Activado por el botón X en cada ítem del `NotificacionesPanel` |
| 82–85 | `limpiarTodas()` | Reemplaza el array con `[]`. Persiste array vacío y actualiza el estado |
| 87–90 | `getNoLeidas(rol)` | Selector no reactivo (usa `get()` interno). Filtra notificaciones donde `rolDestino === rol` y `leida === false`. Usado para el contador del badge en TopBar |
| 92–94 | `getTodas(rol)` | Selector no reactivo. Filtra notificaciones por `rolDestino === rol` sin importar si están leídas. Usado para listar notificaciones en `NotificacionesPanel` |

---

## src/pages/comprador/ListaPedidosComprador.tsx

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 1–7 | imports | React (`useMemo`, `useState`), `Link` de react-router-dom, íconos (`IconClipboardList`, `IconAlertTriangle`), componentes UI (`Badge`, `Button`, `EmptyState`, `PageHeader`, `Select`), `usePedidosStore`, `COMPRADOR_ID`, utilidades `formatFecha` y `diasHasta` |
| 9 | `BadgeColor` | Tipo local para variantes de color de `Badge` |
| 11–16 | `ESTADO_COLOR` | Mapa estado pedido → color badge |
| 18–23 | `ESTADO_LABEL` | Mapa estado pedido → etiqueta en español |
| 25–30 | `FILTRO_ESTADO_OPTIONS` | Opciones del select de estado: "Todos" (vacío), "Pendiente" (mapea a `abierto`+`en_cotizacion`), "Adjudicado", "Cancelado" |
| 32–33 | `TH` | Clases Tailwind compartidas para `<th>` de la tabla de pedidos |
| 35 | `ListaPedidosComprador` | Página exportada por defecto para la ruta `/comprador/pedidos` |
| 36–39 | `useState` filtros | `filtroEstado`, `filtroCategoria`, `fechaDesde`, `fechaHasta` — estado local de UI puro, no persiste en store |
| 41 | `pedidos` | Suscripción reactiva al array completo de `usePedidosStore` |
| 43–49 | `misPedidos` | `useMemo` que filtra por `compradorId === COMPRADOR_ID` y ordena por `fechaCreacion` descendente |
| 51–59 | `categoriaOptions` | `useMemo` que extrae categorías únicas de `misPedidos` con `Set`, las ordena y construye las opciones del select |
| 61–75 | `pedidosFiltrados` | `useMemo` principal del filtrado: aplica filtro de estado (si `filtroEstado === 'pendiente'` incluye `abierto` y `en_cotizacion`), categoría y rango de fechas. Depende de `misPedidos` y los cuatro estados de filtro |
| 77 | `hayFiltros` | Booleano truthy cuando al menos un filtro está activo; controla visibilidad del botón "Limpiar filtros" y del mensaje "sin resultados" |
| 79–84 | `limpiarFiltros` | Resetea los cuatro valores de filtro a string vacío |
| 86–88 | JSX: `PageHeader` | Título "Mis pedidos", descripción "Pedidos que publicaste en el marketplace" |
| 90–131 | JSX: barra de filtros | Contenedor `bg-ep-blue-light/10 border border-ep-border rounded-lg p-4`. Dos `Select` (estado, categoría), dos `<input type="date">` (desde, hasta), botón "Limpiar filtros" condicional |
| 133–135 | JSX: contador | `<p>` con count de `pedidosFiltrados.length` — actualizado en tiempo real |
| 137–149 | JSX: sin resultados | Si `pedidosFiltrados.length === 0`: con filtros activos → `<p>` centrado en `text-ep-text-muted`; sin filtros → `EmptyState` con `IconClipboardList` |
| 150–202 | JSX: tabla de pedidos | `bg-ep-surface border border-ep-border rounded-lg overflow-hidden`. Columnas: Producto (`<Link>` a `/comprador/pedidos/:id`, `text-ep-blue hover:underline`), Categoría, Fecha límite (urgente `dias<3` → rojo + `IconAlertTriangle`), Cotizaciones (`font-mono`), Estado (`Badge`) |

---

## src/components/layout/Sidebar.tsx (cambios Etapa 3)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 10 | import `IconClipboardList` | Ícono para el ítem "Mis pedidos" en la navegación comprador |
| 27–29 | `NAV_COMPRADOR` — ítem "Mis pedidos" | Nuevo ítem `{ label: 'Mis pedidos', ruta: '/comprador/pedidos', icono: IconClipboardList }` insertado entre "Publicar pedido" y "Cotizaciones" |
| 114–116 | `esActivo` extendido | Además del match exacto `pathname === item.ruta`, agrega condición `item.ruta === '/comprador/pedidos' && pathname.startsWith('/comprador/pedidos/')` para mantener "Mis pedidos" activo cuando el usuario está en el detalle `/comprador/pedidos/:id` |

---

## src/router/AppRouter.tsx (cambios Etapa 3)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 13 | import `ListaPedidosComprador` | Importa la nueva página desde `../pages/comprador/ListaPedidosComprador` |
| 57 | ruta `/comprador/pedidos` | `<Route path="/comprador/pedidos" element={<ListaPedidosComprador />} />` — declarada antes de `/comprador/pedidos/:id` para que React Router resuelva ambas sin conflicto |

---

## src/components/layout/TopBar.tsx (cambios Etapa 3)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 15 | `BREADCRUMB_MAP` — entrada nueva | `'/comprador/pedidos': 'Mis pedidos'` — muestra el título correcto en la TopBar al navegar a la lista de pedidos |

---

## src/services/api.ts (nuevo, 215 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 1 | import tipos | Importa `Pedido`, `Cotizacion`, `Orden` de `../types` |
| 3 | `BASE_URL` | Constante con la URL base: `import.meta.env.VITE_API_URL ?? 'http://localhost:3001'` |
| 5–15 | `NotificacionPayload` | Interfaz local que replica la forma de `Notificacion` del store — evita importación circular entre `api.ts` y `useNotificacionesStore.ts` |
| 19–27 | `getPedidos()` | GET `/pedidos` → `Pedido[]`. Retorna `[]` si la red falla |
| 29–38 | `getPedidoById(id)` | GET `/pedidos/:id` → `Pedido \| null`. Retorna `null` si no existe o falla |
| 40–52 | `updatePedido(id, data)` | PATCH `/pedidos/:id` con body JSON → `Pedido \| null` |
| 54–66 | `createPedido(data)` | POST `/pedidos` con body JSON → `Pedido \| null` |
| 70–78 | `getCotizaciones()` | GET `/cotizaciones` → `Cotizacion[]` |
| 80–88 | `getCotizacionesByPedidoId(pedidoId)` | GET `/cotizaciones?pedidoId=X` → `Cotizacion[]` — usa query string de JSON Server |
| 90–105 | `updateCotizacion(id, data)` | PATCH `/cotizaciones/:id` → `Cotizacion \| null` |
| 107–119 | `createCotizacion(data)` | POST `/cotizaciones` → `Cotizacion \| null` |
| 123–131 | `getOrdenes()` | GET `/ordenes` → `Orden[]` |
| 133–145 | `createOrden(data)` | POST `/ordenes` → `Orden \| null` |
| 147–159 | `updateOrden(id, data)` | PATCH `/ordenes/:id` → `Orden \| null` — usada por `actualizarEstadoOrden` |
| 163–171 | `getNotificaciones()` | GET `/notificaciones` → `NotificacionPayload[]` |
| 173–187 | `createNotificacion(data)` | POST `/notificaciones` → `NotificacionPayload \| null` |
| 189–204 | `updateNotificacion(id, data)` | PATCH `/notificaciones/:id` → `NotificacionPayload \| null` — usada por `marcarLeida` y `marcarTodasLeidas` |
| 206–214 | `deleteNotificacion(id)` | DELETE `/notificaciones/:id` → `boolean` — usada por `eliminarNotificacion` y `limpiarTodas` |

---

## src/store/usePedidosStore.ts (reescrito, 65 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 1–4 | imports | Zustand `create`, tipos `Pedido` y `EstadoPedido`, `useNotificacionesStore`, namespace `* as api` de `../services/api` |
| 6–12 | `PedidosState` | Interface del store — agrega `cargarDatos: () => void` a las 3 acciones existentes |
| 14–64 | `usePedidosStore` | Instancia del store; estado inicial `pedidos: []` |
| 17–19 | `cargarDatos()` | Llama `api.getPedidos()` y setea el resultado completo en el store |
| 21–33 | `agregarPedido(pedido)` | Llama `api.createPedido()`; si ok: push al estado local + notificación `nueva_orden` a proveedor via `useNotificacionesStore` |
| 35–42 | `actualizarEstadoPedido(id, estado)` | Llama `api.updatePedido(id, { estado })`; si ok: map sobre array local |
| 44–63 | `incrementarCotizaciones(pedidoId)` | Lee pedido del estado local para calcular nuevos valores; llama `api.updatePedido()` con `cotizacionesRecibidas` y `estado`; si ok: actualiza estado local |

---

## src/store/useCotizacionesStore.ts (reescrito, 110 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 1–7 | imports | Zustand `create`, tipos `Cotizacion` y `Orden`, `COMPRADOR_ID`, los tres stores dependientes, namespace `* as api` |
| 9–15 | `CotizacionesState` | Interface del store — agrega `cargarDatos: () => void` |
| 17–109 | `useCotizacionesStore` | Instancia del store; estado inicial `cotizaciones: []` |
| 20–22 | `cargarDatos()` | Llama `api.getCotizaciones()` y setea el resultado |
| 24–35 | `agregarCotizacion(cotizacion)` | Llama `api.createCotizacion()`; si ok: push al estado local + notificación `nueva_cotizacion` al comprador |
| 37–97 | `aceptarCotizacion(cotizacionId)` | Construye el objeto `Orden` sincrónicamente, luego ejecuta un IIFE async: (1) PATCH cotizacion→'aceptada', (2) `Promise.all` PATCH otras del pedido→'rechazada', (3) actualiza estado local de cotizaciones, (4) delega `agregarOrden()` y `actualizarEstadoPedido()` a sus stores, (5) dispara 2 notificaciones. Retorna `void` — el IIFE es fire-and-forget |
| 99–108 | `rechazarCotizacion(cotizacionId)` | Llama `api.updateCotizacion(id, { estado: 'rechazada' })`; si ok: map sobre array local |

---

## src/store/useOrdenesStore.ts (reescrito, 35 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 1–3 | imports | Zustand `create`, tipos `Orden` y `EstadoOrden`, namespace `* as api` |
| 5–10 | `OrdenesState` | Interface del store — agrega `cargarDatos: () => void` |
| 12–34 | `useOrdenesStore` | Instancia del store; estado inicial `ordenes: []` |
| 15–17 | `cargarDatos()` | Llama `api.getOrdenes()` y setea el resultado |
| 19–24 | `agregarOrden(orden)` | Llama `api.createOrden()`; si ok: push al array local. Llamada desde `useCotizacionesStore.aceptarCotizacion()` |
| 26–33 | `actualizarEstadoOrden(id, estado)` | Llama `api.updateOrden(id, { estado })`; si ok: map sobre array local |

---

## src/store/useNotificacionesStore.ts (reescrito, 99 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 1–2 | imports | Zustand `create`, namespace `* as api` |
| 4–9 | `TipoNotificacion` | Tipo unión exportado — sin cambios respecto a versión anterior |
| 11–20 | `Notificacion` | Interfaz exportada — sin cambios |
| 22–32 | `NotificacionesState` | Interface interna — agrega `cargarDatos: () => void` |
| 34–98 | `useNotificacionesStore` | Instancia del store; estado inicial `notificaciones: []` |
| 37–41 | `cargarDatos()` | Llama `api.getNotificaciones()` y setea el resultado (cast a `Notificacion[]`) |
| 43–54 | `agregarNotificacion(n)` | Construye el objeto `Notificacion` completo (UUID, fecha, leida=false); llama `api.createNotificacion()`; si ok: prepend al array local |
| 56–63 | `marcarLeida(id)` | Llama `api.updateNotificacion(id, { leida: true })`; si ok: map sobre array local |
| 65–73 | `marcarTodasLeidas()` | `Promise.all` de `api.updateNotificacion()` sobre todas las no-leídas; si ok: map completo a `leida: true` |
| 75–82 | `eliminarNotificacion(id)` | Llama `api.deleteNotificacion(id)`; si ok: filtra el id del array local |
| 84–89 | `limpiarTodas()` | Recoge todos los ids y hace `Promise.all` de DELETE; si ok: vacía el array local |
| 91–93 | `getNoLeidas(rol)` | Selector no reactivo — sin cambios en lógica |
| 95–97 | `getTodas(rol)` | Selector no reactivo — sin cambios en lógica |

---

## src/router/AppRouter.tsx (cambios v0.1.9)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 1 | import `useEffect` | Nuevo import de `react` para el efecto de carga inicial |
| 5–8 | imports stores | `usePedidosStore`, `useCotizacionesStore`, `useOrdenesStore`, `useNotificacionesStore` — usados solo para disparar `cargarDatos()` al montar |
| 49–54 | `useEffect` en `AppRouter` | `useEffect(() => { cargarDatos() × 4 }, [])` — dispara la carga inicial de todas las entidades al montar la app por primera vez |
