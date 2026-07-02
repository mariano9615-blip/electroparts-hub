# CODEMAP — ElectroParts Hub

Última actualización: 2026-07-01 (v0.6.0 — migración a MySQL + Vercel serverless)
Rama: electroparts-bd

---

## RESUMEN v0.5.1 — Archivos clave modificados

| Archivo | Cambio principal | Líneas clave |
|---|---|---|
| `src/types/index.ts` | Nuevo `EstadoOrden` (6 estados), nuevo `EstadoPago`, campos nuevos en `Orden` | 9–12 (tipos), 40–57 (Orden) |
| `src/store/useNotificacionesStore.ts` | + 6 valores en `TipoNotificacion` | 4–19 |
| `src/store/useOrdenesStore.ts` | + 6 acciones async: `marcarEnPreparacion`, `marcarEnviado`, `confirmarEntrega`, `confirmarPago`, `abrirDisputa`, `cerrarOrden` | 18–130 (acciones) |
| `src/utils/formatters.ts` | + `getLabelEstadoOrden`, `getLabelEstadoPago`, `getColorEstadoPago`; actualiza `getColorEstadoOrden` | 70–107 |
| `src/components/ordenes/OrdenStepper.tsx` | **NUEVO** — stepper horizontal de 5 pasos con texto contextual por rol y estado disputada en rojo | 1–100 |
| `src/components/ordenes/OrdenCard.tsx` | Refactor total: + prop `rol`, `pedidoTitulo`, `acciones[]`; panel expandible con `OrdenStepper` + info de pago | 1–175 |
| `src/pages/comprador/MisOrdenesComprador.tsx` | + 7 tabs; modales recepción y disputa; calcula `acciones` por estado | 1–200 |
| `src/pages/proveedor/MisOrdenesProveedor.tsx` | + 7 tabs; modales preparación, envío y pago; calcula `acciones` por estado | 1–215 |
| `src/router/AppRouter.tsx` | + `ordenesEstadoRef`; suscripción a ordenes que detecta cambios de estado y estadoPago | 54, 192–250 |
| `db.json` | + `estadoPago: "pendiente"` en todas las órdenes; migra `en_transito` → `enviado` | n/a |

### Lógica condicional clave — useOrdenesStore.ts

- `confirmarEntrega()` (L74–88): si `actualizada.estadoPago === 'confirmado'` → llama `cerrarOrden()` automáticamente.
- `confirmarPago()` (L90–108): si `orden.estado === 'entregado'` → llama `cerrarOrden()` automáticamente.
- `cerrarOrden()` (L121–132): notifica a ambos roles (comprador y proveedor) ya que el cierre es bilateral.

### Lógica condicional clave — OrdenCard.tsx

- `numeroSeguimiento` se muestra solo si `estado ∈ {enviado, en_preparacion, entregado, cerrado}` (L73–78).
- Panel expandible (L94–147): toggle local via `useState(false)`.
- Banner "Orden completada" solo para estado `cerrado`; botón "Calificar" deshabilitado con tooltip (L80–89).

### Lógica condicional clave — MisOrdenesComprador.tsx

- `getAccionesComprador(orden)`: estado `enviado` → botones "Confirmar recepción" (primary) + "Abrir disputa" (danger); estados `confirmada|en_preparacion` → solo "Abrir disputa" (danger).
- Modal disputa: botón habilitado solo si `obsDisputa.length >= 20`.

### Lógica condicional clave — MisOrdenesProveedor.tsx

- `getAccionesProveedor(orden)`: `confirmada` → "Marcar en preparación"; `en_preparacion` → "Marcar como enviado"; `entregado` → "Confirmar pago recibido"; resto → sin acciones.

---

## RESUMEN v0.5.0 — Archivos clave modificados

| Archivo | Cambio principal | Líneas clave |
|---|---|---|
| `src/utils/formatters.ts` | + `getLabelEstadoPedido(estado, rol)`, `getLabelEstadoCotizacion(estado, rol)` | 37–75 (nuevas funciones) |
| `src/components/ui/StatCard.tsx` | + prop `onClick?: () => void` | 5–9 (interface), 25 (destructuring) |
| `src/components/domain/PedidosTable.tsx` | + prop `rol?: Rol`; usa `getLabelEstadoPedido` | 8–11 (interface), 32 (default), 88 (badge) |
| `src/components/cotizaciones/CotizacionCard.tsx` | + prop `rol?: Rol`; usa `getLabelEstadoCotizacion`; + color `en_negociacion` | 9–14 (interface), 46 (default), 73/95 (badges) |
| `src/components/layout/Sidebar.tsx` | Refactor completo: botón destacado, sección MIS VISTAS, badges por rol, nuevas rutas | 1–170 (completo) |
| `src/router/AppRouter.tsx` | + 4 rutas nuevas + 4 redirects + toast text changes | 144–152 (toasts), 213–232 (rutas) |
| `src/pages/comprador/ListaPedidosComprador.tsx` | + tabs con URL param `?tab=`; resumen cotizaciones por fila; punto actividad; días publicado | 1–300 (refactor) |
| `src/pages/comprador/DetallePedidoComprador.tsx` | ESTADO_LABEL `adjudicado`→"Comprado"; botón "Confirmar compra"; banner "Compra confirmada con" | 27, 354, 449, 487–494 |
| `src/pages/comprador/MisOrdenesComprador.tsx` | PageHeader título → "Mis compras" | 21 |
| `src/pages/comprador/MisCotizacionesComprador.tsx` | PageHeader → "Cotizaciones recibidas"; navigate → `/comprador/mis-compras` | 57, 109 |
| `src/pages/comprador/DashboardComprador.tsx` | 4 StatCards clickeables; métrica semana; navigate actualizado | 1–120 (refactor) |
| `src/pages/proveedor/PedidosDisponibles.tsx` | PageHeader → "Explorar pedidos"; punto actividad; días coloreados | 1–160 (refactor) |
| `src/pages/proveedor/MisCotizacionesProveedor.tsx` | 5 tabs (incluye "Ganadas"); vista rápida por fila; usa `getLabelEstadoCotizacion` | 1–165 (refactor) |
| `src/pages/proveedor/MisOrdenesProveedor.tsx` | PageHeader → "Mis ventas"; 4 tabs (Ganadas/En tránsito/Cerradas) | 1–105 (refactor) |
| `src/pages/proveedor/DashboardProveedor.tsx` | 4 StatCards clickeables; tasa de éxito; navigate a rutas nuevas | 1–125 (refactor) |

---

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

## src/components/ui/Toast.tsx (nuevo, v0.2.1 — 78 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 1–3 | imports | `useEffect`, `useRef`, `useState` de React; `useNavigate` de react-router-dom; `IconShoppingCart`, `IconX` de @tabler/icons-react |
| 5–10 | `ToastProps` | Interface: `id`, `categoria`, `presupuestoMax?`, `onClose(id)` |
| 12 | `DURACION_MS` | Constante `6000` — duración en ms del auto-cierre y de la animación de la barra de progreso |
| 14–78 | `Toast` | Componente exportado. Estado local: `entrado` (boolean para slide-in) y `progreso` (string CSS para la barra). `useEffect` activa `translate-x-0` vía `requestAnimationFrame` y arranca barra de progreso con `setTimeout(50ms)`; registra `setTimeout(6000)` para auto-cerrar. Clase `transition-transform duration-300` sobre el contenedor raíz para el slide. Barra de progreso: div `absolute bottom-0 h-1 bg-ep-blue` con `style.transition = 'width 6s linear'`. Botón "Ver pedido" llama `navigate('/proveedor/pedidos')` + `onClose`. Botón X llama `onClose` directamente |

---

## src/components/ui/ToastContainer.tsx (nuevo, v0.2.1 — 57 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 1–3 | imports | `useEffect`, `useState` de React; `Toast` local; tipo `Pedido` de `../../types` |
| 5–9 | `ToastData` | Interface local: `id`, `categoria`, `presupuestoMax?` — subconjunto de `Pedido` necesario para el toast |
| 11 | `MAX_TOASTS` | Constante `3` — límite de toasts simultáneos en pantalla |
| 13–57 | `ToastContainer` | Componente exportado. `useState<ToastData[]>` para la cola. `useEffect` registra listener de `'nuevo-pedido-toast'` en `window`; el handler extrae `detail: Pedido`, verifica límite y anti-duplicado por `id`, y agrega al estado. Cleanup en return del efecto. `handleClose(id)` filtra el id del array. Devuelve `null` si la cola está vacía. Renderiza `fixed bottom-6 right-6 z-50 flex flex-col gap-3` con un `<Toast>` por elemento |

---

## src/components/layout/AppShell.tsx (cambios v0.2.1 — 47 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 4 | import `ToastContainer` | Importa desde `'../ui/ToastContainer'` |
| 42–43 | `<ToastContainer />` | Montado dentro del div raíz del layout, fuera del área de contenido, para que sea un portal fijo disponible en todas las rutas protegidas |

---

## src/router/AppRouter.tsx (cambios v0.2.0 + v0.2.1 + v0.3.0 — 129 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 1 | imports React | `useEffect`, `useRef` de `react` |
| 5–10 | imports stores | `usePedidosStore`, `useCotizacionesStore`, `useOrdenesStore`, `useNotificacionesStore`, `useMensajesStore`, `useRolStore` |
| 27 | import `DetallePedidoProveedor` | Importa la nueva página de detalle de pedido del proveedor |
| 51 | `pedidosConocidosRef` | `useRef<Set<string> \| null>(null)` — persiste entre renders para guardar los IDs de pedidos ya conocidos; `null` indica que aún no hubo primera carga |
| 55–75 | `usePedidosStore.subscribe` | Callback `(state, prevState)`: si ref es `null` inicializa con IDs de `prevState` (baseline sin toasts). Si rol es `'comprador'` solo actualiza ref. Si rol es `'proveedor'` filtra IDs no conocidos y despacha `CustomEvent('nuevo-pedido-toast', { detail: pedido })` por cada uno |
| 77–84 | `cargarTodo()` | Llama `cargarDatos()` en los 4 stores + si `useMensajesStore.getState().pedidoActivoId` no es null, también llama `cargarMensajes(pedidoActivoId)` para sincronizar el chat activo. Se ejecuta al montar y cada 5 s vía `setInterval` |
| 88–91 | cleanup | `clearInterval` + `desuscribir()` al desmontar — evita memory leaks del timer y del subscriber |
| 111 | ruta `/proveedor/pedidos/:id` | Nueva ruta que renderiza `DetallePedidoProveedor` para el detalle de pedido adjudicado con chat |

---

## src/store/useMensajesStore.ts (nuevo — v0.3.0, 46 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 1–3 | imports | Zustand `create`, tipos `MensajePedido` y `Rol` de types, `api` de services |
| 5–11 | `MensajesState` | Interface del store: `mensajes: MensajePedido[]`, `pedidoActivoId: string \| null`, y las tres acciones |
| 13 | `useMensajesStore` | Instancia del store creada con `create<MensajesState>`. No persiste en localStorage — fuente de verdad en API |
| 15 | estado inicial | `mensajes: []`, `pedidoActivoId: null` |
| 17–24 | `cargarMensajes(pedidoId)` | Setea `pedidoActivoId` inmediatamente (para que el polling en AppRouter pueda leerlo), luego llama `api.getMensajesByPedidoId`. Solo actualiza el estado si `pedidoActivoId` no cambió mientras esperaba la respuesta (guard de race condition) |
| 26–35 | `enviarMensaje(pedidoId, texto, autorRol, autorNombre)` | Construye `MensajePedido` con `crypto.randomUUID()` e ISO timestamp, llama `api.createMensaje`, y si ok agrega al array local |
| 37–39 | `limpiarMensajes()` | Resetea `mensajes: []` y `pedidoActivoId: null`. Llamada al desmontar el componente `Chat` vía cleanup de `useEffect` |

---

## src/components/ui/Chat.tsx (nuevo — v0.3.0, 97 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 1–4 | imports | React (`useEffect`, `useRef`, `useState`), `IconSend` de Tabler, `useMensajesStore`, `useRolStore` |
| 6–9 | `ChatProps` | Interface de props: `pedidoId: string`, `otroNombre: string` |
| 11–15 | `formatHora(timestamp)` | Función utilitaria pura que convierte un ISO string a formato `HH:mm` con padding |
| 17 | `Chat` | Componente exportado con nombre para la ruta `/comprador/pedidos/:id` y `/proveedor/pedidos/:id` |
| 18–19 | `useState` | `texto: string` — único estado local (control de UI del input) |
| 20 | `bottomRef` | `useRef<HTMLDivElement>` apuntando a un div vacío al final de la lista de mensajes; usado para auto-scroll |
| 22–26 | suscripciones al store | Lee `mensajes`, `cargarMensajes`, `enviarMensaje`, `limpiarMensajes` de `useMensajesStore`; lee `rol` de `useRolStore` para determinar identidad del usuario actual |
| 28–29 | `miRol` / `miNombre` | Derivados del rol activo: `'comprador'` → `'Comprador Demo'`; `'proveedor'` → `'Mi Empresa (Proveedor)'` |
| 31–35 | `useEffect([pedidoId])` | Al montar: llama `cargarMensajes(pedidoId)`. Cleanup al desmontar: llama `limpiarMensajes()`. Depende de `pedidoId` por si cambia dinámicamente |
| 37–39 | `useEffect([mensajes])` | Hace scroll suave al `bottomRef` cada vez que el array de mensajes cambia (nuevo mensaje o carga inicial) |
| 41–44 | `handleEnviar()` | Valida que `texto.trim()` no esté vacío; llama `enviarMensaje`; resetea el input |
| 46–50 | `handleKeyDown` | Intercepta `Enter` sin `Shift` → previene salto de línea y llama `handleEnviar` |
| 54–57 | JSX: header sección | `<h2>` con formato "Chat — Pedido #[id.slice(0,8)] con [otroNombre]", estilo `text-xs font-bold uppercase tracking-widest border-b` |
| 59–90 | JSX: área de mensajes | `h-96 overflow-y-auto p-4 flex flex-col gap-3 bg-ep-blue-dark/5`. Burbujas: propias → `bg-ep-blue text-white rounded-tr-sm items-end`; ajenas → `bg-ep-surface border rounded-tl-sm items-start`. Metadato `autorNombre · HH:mm` encima en `text-[10px] text-ep-text-muted` |
| 91–101 | JSX: footer input + send | `border-t border-ep-border p-3 flex gap-2`. Input con focus `border-ep-blue ring-ep-blue`. Botón `IconSend` con `bg-ep-blue` deshabilitado con `opacity-40` si texto vacío |

---

## src/pages/comprador/ListaPedidosComprador.tsx (cambios v0.3.0 — ~240 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 3 | `IconTrash` | Nuevo ícono importado para el botón de eliminar |
| 4 | `Modal` | Importado para el modal de confirmación de eliminación |
| 7 | tipo `Pedido` | Importado para tipar el estado `pedidoAEliminar` |
| 40 | `pedidoAEliminar` | `useState<Pedido \| null>` — controla qué pedido está pendiente de confirmación de eliminación |
| 42 | `eliminarPedido` | Suscripción a la acción del store; condicional — solo llama API cuando el usuario confirma en el modal |
| columna Acciones `<th>` | header tabla | Nueva columna "Acciones" alineada a la derecha en el thead de la tabla |
| columna Acciones `<td>` | fila tabla | Botón `IconTrash` `text-red-500` por cada pedido; click → `setPedidoAEliminar(pedido)` |
| modal eliminar | `Modal` confirmación | `size="sm"`, avisa que se eliminarán también las cotizaciones; "Cancelar" + "Eliminar" (variant danger) → `eliminarPedido(id)` |

---

## src/pages/proveedor/DetallePedidoProveedor.tsx (nuevo — v0.3.0, 104 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 1–5 | imports | React (`useMemo`), React Router (`useParams`, `useNavigate`), íconos, componentes UI (`Badge`, `Chat`, `EmptyState`), stores `usePedidosStore` y `useCotizacionesStore`, utilidades de formato |
| 7–24 | mapas de estado | `ESTADO_COLOR` y `ESTADO_LABEL` locales (mismos valores que en `DetallePedidoComprador`) |
| 26 | `DetallePedidoProveedor` | Página exportada por defecto para la ruta `/proveedor/pedidos/:id` |
| 27–28 | router hooks | `useParams` extrae `id`; `useNavigate` para volver |
| 30–32 | suscripciones | Lee `pedidos` de `usePedidosStore`, `cotizaciones` de `useCotizacionesStore` |
| 34 | `pedido` | Busca el pedido por id. Si es undefined renderiza EmptyState con botón "Volver a cotizaciones" |
| 36–39 | `cotizacionAceptada` | `useMemo` que busca la cotización con `pedidoId === id && estado === 'aceptada'`; guarda el guard antes del early return para cumplir reglas de hooks |
| 43–60 | guard: pedido no encontrado | Botón "Volver" + EmptyState; en prod si el pedido fue eliminado o la URL es incorrecta |
| 62–77 | JSX: header | Botón "Volver" (`navigate(-1)`), título `text-2xl font-bold`, subtítulo `categoría · cantidad unidad`, badge de estado |
| 79–97 | JSX: card cotización aceptada | Condicional: solo si `cotizacionAceptada !== null`. Grid 3 cols: precio (`font-mono`), tiempo entrega, fecha. `bg-ep-surface border rounded-lg p-5` |
| 99–101 | JSX: `<Chat>` | Condicional: solo si `pedido.estado === 'adjudicado'`. Props: `pedidoId={pedido.id}`, `otroNombre="Comprador Demo"` |

---

## src/pages/proveedor/MisCotizacionesProveedor.tsx (cambios v0.3.0)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 2 | `Link` | Importado de react-router-dom para el link "Ver chat" |
| 3 | `IconTrash`, `IconMessageCircle` | Nuevos íconos: `IconTrash` para eliminar, `IconMessageCircle` para el link al chat |
| 4 | `Button`, `Modal` | Nuevos imports UI para el modal de confirmación |
| 7 | tipo `Cotizacion` | Importado para tipar el estado `cotizacionAEliminar` |
| ~22 | `cotizacionAEliminar` | `useState<Cotizacion \| null>` — controla qué cotización está pendiente de eliminación |
| ~25 | `eliminarCotizacion` | Suscripción a la acción del store de cotizaciones |
| wrapper por cotización | `div` con acciones | Cada `CotizacionCard` se envuelve en un `div flex-col gap-1`. Debajo: fila `flex justify-end` con el link "Ver chat" (solo si `estado === 'aceptada'`) y el botón `IconTrash` |
| link "Ver chat" | `Link` | Navega a `/proveedor/pedidos/${cot.pedidoId}`; `text-ep-blue hover:text-ep-blue-dark`, `IconMessageCircle` `size={13}` |
| modal eliminar | `Modal` confirmación | `size="sm"`, "¿Eliminar tu cotización para [pedido]?"; "Cancelar" + "Eliminar" (danger) → `eliminarCotizacion(id)` |

---

## src/store/usePedidosStore.ts (cambios v0.3.0)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| import `useCotizacionesStore` | nuevo import | Necesario para la cascade; al ser llamado solo dentro de funciones (no a nivel de módulo) evita problemas de inicialización pese a la dependencia circular bidireccional |
| `eliminarPedido` en `PedidosState` | nueva acción | `(id: string) => void` |
| `eliminarPedido(id)` | implementación | Llama `api.deletePedido(id)` → si ok: llama `useCotizacionesStore.getState().eliminarCotizacionesByPedidoId(id)` (cascade en paralelo) → filtra el pedido del estado local |

---

## src/store/useCotizacionesStore.ts (cambios v0.3.0)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| `eliminarCotizacion`, `eliminarCotizacionesByPedidoId` en `CotizacionesState` | nuevas acciones | Dos nuevas firmas en la interface |
| `eliminarCotizacion(id)` | implementación | `api.deleteCotizacion(id)` → filtra la cotización del array local |
| `eliminarCotizacionesByPedidoId(pedidoId)` | implementación | Obtiene las cotizaciones del pedido via `get()`, llama `api.deleteCotizacion` en paralelo con `Promise.all`, luego filtra todas del `pedidoId` en el estado local. Llamada desde `usePedidosStore.eliminarPedido` como cascade |

---

## src/types/index.ts (cambios v0.3.0)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| ~60–66 | `MensajePedido` | Nueva interfaz para mensajes del chat por pedido: `{ id, pedidoId, autorRol: Rol, autorNombre, texto, timestamp }`. Distinta de `Mensaje` (que usa `ordenId`) para no romper el sistema de chat por orden existente |

---

## src/services/api.ts (cambios v0.3.0)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| import `MensajePedido` | nuevo import | Importado del módulo de tipos para tipar las funciones de mensajes |
| `getMensajesByPedidoId(pedidoId)` | GET /mensajes?pedidoId=X | Retorna `MensajePedido[]`; `[]` en caso de error |
| `createMensaje(data)` | POST /mensajes | Crea un nuevo mensaje; retorna `MensajePedido \| null` |
| `deletePedido(id)` | DELETE /pedidos/:id | Retorna `boolean` indicando éxito; usado por `usePedidosStore.eliminarPedido` |
| `deleteCotizacion(id)` | DELETE /cotizaciones/:id | Retorna `boolean` indicando éxito; usado por `useCotizacionesStore.eliminarCotizacion` y `eliminarCotizacionesByPedidoId` |

---

## src/types/index.ts (cambios v0.4.0)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 5 | `EstadoPedido` | Agrega `'en_negociacion'` a la unión: `'abierto' \| 'en_cotizacion' \| 'en_negociacion' \| 'adjudicado' \| 'cancelado'` |
| 6 | `EstadoCotizacion` | Agrega `'en_negociacion'` a la unión: `'pendiente' \| 'en_negociacion' \| 'aceptada' \| 'rechazada'` |
| 22–24 | campos opcionales `Pedido` | `cotizacionEnNegociacionId?: string` (id de la cotización en negociación activa), `observacionBaja?: string` (texto obligatorio al cancelar), `fechaBaja?: string` (ISO de la cancelación) |
| 62–70 | `MensajePedido` | Agrega campo `leido?: boolean` — `false` en mensajes nuevos, `true` tras `marcarMensajesLeidos`. Permite el indicador de punto azul en el Chat y el badge "mensaje nuevo" en la lista |

---

## src/utils/constants.ts (cambios v0.4.0)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 33 | `PROV_IDS` | `export const PROV_IDS = ['prov-1', 'prov-2', 'prov-3', 'prov-4', 'prov-demo-001'] as const` — lista de todos los proveedores del sistema demo. Usado en `AppRouter.tsx` y `DetallePedidoProveedor.tsx` para filtrar cotizaciones pertenecientes al usuario activo. Requiere cast `(PROV_IDS as readonly string[])` al llamar `.includes(string)` por TS literal type |

---

## src/utils/sounds.ts (nuevo v0.4.0 — 45 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 3 | `TipoSonido` | Tipo local: `'pedido' \| 'cotizacion' \| 'mensaje'` |
| 5 | `_ctx` | Variable de módulo `AudioContext \| null` — singleton lazy para evitar múltiples contextos de audio |
| 7–10 | `getCtx()` | Crea el `AudioContext` en la primera llamada; lo reutiliza en las siguientes. Evita el warning del navegador por múltiples contextos |
| 12–30 | `beep(freq, durMs)` | `Promise<void>` que crea oscilador + nodo de ganancia, conecta al destino, aplica rampa exponencial y resuelve en `osc.onended`. Envuelto en try/catch para no propagar errores en contextos bloqueados |
| 32–45 | `playNotificationSound(tipo)` | Función exportada. Retorna inmediatamente si `localStorage 'ep_sonido_silenciado' === 'true'`. Según tipo: `pedido`→`beep(880, 150)`, `cotizacion`→`beep(660,100).then(()=>beep(880,100))` (doble tono ascendente), `mensaje`→`beep(440, 80)`. Fire-and-forget. Llamada desde `ToastContainer` al recibir cada evento |

---

## src/services/api.ts (cambios v0.4.0)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| `updateMensaje(id, data)` | PATCH /mensajes/:id | Nuevo función que recibe `Partial<MensajePedido>` y retorna `MensajePedido \| null`. Usada exclusivamente por `useMensajesStore.marcarMensajesLeidos` para cambiar `leido: true` en paralelo con `Promise.all` |

---

## src/store/useNotificacionesStore.ts (cambios v0.4.0)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 4–13 | `TipoNotificacion` | Extiende el tipo unión con 4 valores nuevos: `'cotizacion_en_negociacion'` (comprador inició negociación con proveedor), `'cotizacion_rechazada'` (cotización individual rechazada), `'mensaje_nuevo'` (mensaje no leído en chat), `'estado_pedido_cambio'` (cambio de estado genérico de pedido). Retrocompatible — no modifica lógica existente |

---

## src/store/usePedidosStore.ts (cambios v0.4.0 — 119 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 7–17 | `PedidosState` | Agrega 3 nuevas firmas: `iniciarNegociacion`, `cancelarNegociacion`, `cancelarPedido` |
| 57–70 | `iniciarNegociacion(pedidoId, cotizacionId)` | PATCH `/pedidos/:id` con `{ estado: 'en_negociacion', cotizacionEnNegociacionId }`. Si ok: map sobre el array local aplicando ambos campos. Llamada desde `DetallePedidoComprador.handleConfirmarNegociacion` junto con `iniciarNegociacionCotizacion` del store de cotizaciones |
| 72–83 | `cancelarNegociacion(pedidoId)` | PATCH `/pedidos/:id` con `{ estado: 'abierto', cotizacionEnNegociacionId: undefined }`. Revierte el pedido al estado anterior sin registrar historial. Llamada desde `handleCancelarNegociacion` junto con `cancelarNegociacionCotizacion` |
| 85–97 | `cancelarPedido(id, observacion)` | PATCH `/pedidos/:id` con `{ estado: 'cancelado', observacionBaja: observacion, fechaBaja: new Date().toISOString() }`. No DELETE — preserva el registro en `db.json` con el motivo. El estado `cancelado` es terminal; el botón de baja se oculta y se muestra un `IconInfoCircle` con tooltip |

---

## src/store/useCotizacionesStore.ts (cambios v0.4.0 — 153 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 9–19 | `CotizacionesState` | Agrega 2 nuevas firmas: `iniciarNegociacionCotizacion` y `cancelarNegociacionCotizacion` |
| 114–123 | `iniciarNegociacionCotizacion(cotizacionId)` | PATCH `/cotizaciones/:id` con `{ estado: 'en_negociacion' }`. Si ok: map local. Siempre se llama en conjunto con `usePedidosStore.iniciarNegociacion` desde el mismo handler en DetallePedidoComprador (no hay coordinación explícita entre stores) |
| 125–134 | `cancelarNegociacionCotizacion(cotizacionId)` | PATCH `/cotizaciones/:id` con `{ estado: 'pendiente' }`. Revierte la cotización al estado `pendiente`. Siempre se llama junto con `usePedidosStore.cancelarNegociacion` |

---

## src/store/useMensajesStore.ts (cambios v0.4.0 — 103 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 6–15 | `MensajesState` | Agrega `pedidosConMensajeNuevo: string[]` (pedidoIds con mensajes no leídos en sesión) y `marcarMensajesLeidos` a la interface |
| 20 | estado inicial | `pedidosConMensajeNuevo: []` — no persiste; se recalcula al cargar mensajes cada sesión |
| 22–64 | `cargarMensajes(pedidoId)` | Lógica de detección dual: calcula `esPrimeraCarga = prev.pedidoActivoId !== pedidoId` antes del `set`. **Primera carga**: busca mensajes con `autorRol !== miRol && leido === false`; si existen, agrega `pedidoId` a `pedidosConMensajeNuevo` sin disparar toast. **Polls subsiguientes**: filtra IDs no conocidos del otro rol; si hay nuevos, agrega a `pedidosConMensajeNuevo` y dispara `CustomEvent('mensaje-nuevo-toast')` por cada uno. Guard de race condition en línea 30: descarta respuestas de polls anteriores si `pedidoActivoId` cambió |
| 66–80 | `enviarMensaje(...)` | Agrega `leido: false` al objeto `MensajePedido` construido localmente antes de llamar `api.createMensaje` |
| 86–101 | `marcarMensajesLeidos(pedidoId, miRol)` | Filtra mensajes con `autorRol !== miRol && leido === false`. Si hay, hace `Promise.all` de `api.updateMensaje(m.id, { leido: true })`. Al resolver: map local a `leido: true` y elimina `pedidoId` de `pedidosConMensajeNuevo`. Llamada desde `Chat.tsx` en `useEffect([mensajes])` cada vez que llegan nuevos mensajes |

---

## src/hooks/useNotificationSound.ts (nuevo v0.4.0 — 17 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 3 | `STORAGE_KEY` | `'ep_sonido_silenciado'` — clave de localStorage compartida con `playNotificationSound` en `sounds.ts` |
| 5–17 | `useNotificationSound()` | Hook exportado. `useState` inicializado lazy desde `localStorage`. `useEffect([silenciado])` persiste cada cambio. `toggleSilencio` con `useCallback`. Retorna `{ silenciado, toggleSilencio }`. Consumido por `TopBar.tsx` para el ícono de mute |

---

## src/components/ui/Toast.tsx (refactorizado v0.4.0 — 172 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 3–12 | imports íconos | 8 íconos de Tabler: `IconShoppingCart`, `IconFileInvoice`, `IconTrophy`, `IconX`, `IconMessage`, `IconAlertCircle`, `IconClock`, `IconInfoCircle` |
| 14–21 | `ToastTipo` | Tipo unión exportado con 7 variantes: `'pedido_nuevo'`, `'cotizacion_nueva'`, `'cotizacion_adjudicada'`, `'cotizacion_rechazada'`, `'cotizacion_negociacion'`, `'mensaje_nuevo'`, `'estado_cambio'` |
| 23–29 | `ToastPayload` | Interface exportada: `id`, `tipo: ToastTipo`, `titulo`, `subtitulo?`, `navegarA?`. Usada por `ToastContainer` para tipar la cola y por `AppRouter` para construir los payloads de cada CustomEvent |
| 35–94 | `CONFIG` | Map `Record<ToastTipo, {...}>` con `bordColor`, `barColor`, `icono`, `iconoColor`, `duracionMs` por tipo. `cotizacion_adjudicada` dura 8000 ms; `estado_cambio` dura 4000 ms; el resto 5000–6000 ms |
| 96–172 | `Toast` | Componente. Slide-in via `entrado` boolean + `requestAnimationFrame`. Barra de progreso CSS (div `absolute bottom-0 h-1`) con `transition: width Xms linear`. `cotizacion_adjudicada`: ícono `size=22` y título `text-base`. Botón "Ver" / "Ver detalle" condicional cuando `navegarA` presente; llama `navigate(navegarA) + onClose` |

---

## src/components/ui/ToastContainer.tsx (refactorizado v0.4.0 — 64 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 4 | import `playNotificationSound` | Importa desde `'../../utils/sounds'` — invocada al agregar cada toast |
| 6 | `MAX_TOASTS` | `4` — límite de toasts simultáneos (antes era 3) |
| 9–21 | `EVENTOS` | Array de 7 objetos `{ nombre, tipo, sonido }` que mapea cada nombre de CustomEvent a su `ToastTipo` y su `TipoSonido` (o `null` para `estado_cambio` que no tiene sonido) |
| 26–48 | `useEffect` — registro de listeners | Itera `EVENTOS` creando un handler por evento. Cada handler: extrae `detail`, verifica límite y anti-duplicado por `id`, agrega al estado y llama `playNotificationSound(sonido)` si `sonido !== null`. Cleanup: `removeEventListener` para cada par `{nombre, handler}` |

---

## src/components/ui/PedidoStepper.tsx (nuevo v0.4.0 — 169 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 1–2 | imports | `IconCheck`, `IconX` de Tabler; tipos `EstadoPedido`, `Rol` de `../../types` |
| 4–10 | `PedidoStepperProps` | Props: `estado: EstadoPedido`, `rol: Rol`, `nombreProveedor?`, `miCotizacionEnNegociacion?`, `observacionBaja?` |
| 12 | `PASOS` | `['Abierto', 'En negociación', 'Adjudicado', 'Cerrado'] as const` |
| 14–28 | `estadoAPasoIndex(estado)` | Función pura: `abierto/en_cotizacion`→0, `en_negociacion`→1, `adjudicado`→2, `cancelado`→-1 (terminal alternativo, renderizado especial) |
| 30–61 | `textoContextual(...)` | Función pura con lógica `rol × estado`: comprador recibe frases sobre negociación y adjudicación; proveedor distingue `miCotizacionEnNegociacion` (negociando con vos) vs. otro proveedor en negociación; `cancelado` siempre muestra mensaje de baja |
| 63–169 | `PedidoStepper` | Componente exportado (named export). Rama `cancelado`: banner rojo con `IconX` y `observacionBaja`. Rama normal: (1) fila de círculos + líneas conectoras — `bg-ep-green` si pasado, `bg-ep-blue` si activo, `bg-ep-border` si futuro; (2) fila de etiquetas con `text-ep-blue`/muted/disabled según posición; (3) párrafo de texto contextual debajo de línea divisora |

---

## src/components/ui/index.ts (cambios v0.4.0)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| — | export `PedidoStepper` | Agrega `export { PedidoStepper } from './PedidoStepper'` al barrel de exports de la carpeta `ui` |

---

## src/components/ui/Chat.tsx (cambios v0.4.0 — 127 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 24 | `marcarMensajesLeidos` | Nueva suscripción al store: `useMensajesStore((s) => s.marcarMensajesLeidos)` |
| 38–42 | `useEffect([mensajes])` | Nuevo efecto: cuando `mensajes.length > 0` llama `marcarMensajesLeidos(pedidoId, miRol)`. Dispara en cada actualización de mensajes (incluye el polling de 5 s). Remueve `pedidoId` de `pedidosConMensajeNuevo` y PATCHea en API |
| 77 | `noLeido` | `const noLeido = !esMio && msg.leido === false` — booleano derivado por mensaje |
| 83–88 | punto azul | Cuando `noLeido`: muestra `<span className="w-1.5 h-1.5 rounded-full bg-ep-blue">` junto al timestamp del mensaje del otro lado |
| 90–96 | ring en burbuja | Cuando `noLeido`: agrega `ring-1 ring-ep-blue/30` al className de la burbuja |

---

## src/components/layout/TopBar.tsx (cambios v0.4.0 — 116 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 3 | `IconBellOff` | Ícono adicional importado de Tabler para el estado silenciado |
| 8 | import `useNotificationSound` | Hook importado desde `'../../hooks/useNotificationSound'` |
| 35 | `{ silenciado, toggleSilencio }` | Desestructurado del hook; `silenciado` controla el ícono; `toggleSilencio` es el handler del botón |
| 62–73 | botón mute | `<button onClick={toggleSilencio}>` con `aria-label` y `title` condicionales. Silenciado: `IconBellOff size=18 className="text-ep-text-muted"`. Activo: `IconBell size=18 className="text-ep-text-secondary"`. Posicionado antes del botón de notificaciones |

---

## src/router/AppRouter.tsx (cambios v0.4.0 — 241 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 11 | import `PROV_IDS` | Importa desde `'../utils/constants'`; cast `(PROV_IDS as readonly string[])` al usar `.includes()` |
| 54–56 | 3 `useRef` de snapshots | `pedidosConocidosRef: Set<string> \| null` (IDs conocidos), `pedidosEstadoRef: Map<string, string> \| null` (pedidoId→estado), `cotizacionesEstadoRef: Map<string, string> \| null` (cotizacionId→estado). `null` en todos indica primera carga — se inicializan con baseline sin disparar toasts |
| 60–109 | `usePedidosStore.subscribe` | Suscripción permanente al store de pedidos. **Primera vez** (`ref === null`): inicializa `pedidosConocidosRef` con IDs de `prevState` y `pedidosEstadoRef` con estado actual (baseline). **Proveedor**: filtra IDs no conocidos → `CustomEvent('nuevo-pedido-toast')` con `navegarA`. **Todos los roles**: detecta cambios de estado (`estadoAnterior !== p.estado`) → `CustomEvent('estado-pedido-toast')`. Actualiza ambos refs al final |
| 112–185 | `useCotizacionesStore.subscribe` | Suscripción al store de cotizaciones. **Primera vez**: inicializa `cotizacionesEstadoRef` y retorna. Itera todas las cotizaciones del nuevo estado: si `!estadoAnterior` (cotización nueva) y `rol === 'comprador'` → `CustomEvent('nueva-cotizacion-toast')`; si `estadoAnterior !== c.estado` y es cotización del proveedor activo (`PROV_IDS.includes`) → despacha `cotizacion-adjudicada-toast`, `cotizacion-rechazada-toast` o `cotizacion-negociacion-toast` según el nuevo estado. Actualiza ref al final |
| 187–204 | `cargarTodo()` + polling | Sin cambios en lógica; ahora incluye limpieza `desubPedidos()` + `desubCotizaciones()` en el `return` del `useEffect` para evitar memory leaks |

---

## src/pages/comprador/ListaPedidosComprador.tsx (cambios v0.4.0 — 356 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 7–9 | nuevos imports íconos | `IconTrash` (existente), `IconInfoCircle` (tooltip observación), `IconMessage` (badge mensaje nuevo) |
| 52–54 | nuevos `useState` | `observacionBaja: string` (textarea del modal de baja), `tooltipObsId: string \| null` (controla qué pedido muestra tooltip de observación) |
| 57–59 | nuevas suscripciones | `cancelarPedido` de `usePedidosStore`, `cotizaciones` de `useCotizacionesStore`, `pedidosConMensajeNuevo` de `useMensajesStore` |
| 36–42 | `FILTRO_ESTADO_OPTIONS` | Agrega opción `{ value: 'en_negociacion', label: 'En negociación' }` al select de filtro |
| 80–87 | `cotizacionesPorPedido` | `useMemo` que acumula un `Record<string, number>` contando cotizaciones por `pedidoId` iterando el array completo |
| 114–124 | `handleAbrirModalBaja` / `handleConfirmarBaja` | Reemplazan el antiguo `handleEliminar`. `handleConfirmarBaja` valida `observacionBaja.trim().length >= 10` antes de llamar `cancelarPedido` (PATCH, no DELETE) |
| 207 | `tieneMensajeNuevo` | `pedidosConMensajeNuevo.includes(pedido.id)` — booleano por fila |
| 208 | `cancelado` | `pedido.estado === 'cancelado'` — controla visibilidad del botón de baja y el icono de tooltip |
| 223–231 | badge "mensaje nuevo" | Condicional `tieneMensajeNuevo`: pill `bg-ep-blue-light text-ep-blue` con `IconMessage size=10` y texto "nuevo" junto al título |
| 244–249 | badge cotizaciones | `cantCot === 0` → texto muted `font-mono`; `cantCot > 0` → `<span>` circular `bg-ep-blue text-white min-w-[22px] h-[22px] rounded-full` con `font-mono font-bold` |
| 257–279 | tooltip `observacionBaja` | `IconInfoCircle` junto al badge de estado cuando `cancelado && pedido.observacionBaja`. Posición: `absolute right-0 top-6 z-20 w-56`. Controlled por `tooltipObsId` (hover mouse + click toggle) |
| 283–293 | botón baja | Solo visible cuando `!cancelado`. Reemplaza lógica de DELETE; abre modal de baja |
| 304–354 | modal de baja | Título "¿Por qué das de baja este pedido?". Textarea `rows=4` con placeholder de ejemplo; contador de chars abajo (`text-ep-red` si <10). Botón "Confirmar baja" `disabled={observacionBaja.trim().length < 10}` |

---

## src/pages/comprador/DetallePedidoComprador.tsx (cambios v0.4.0 — 604 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 4 | nuevos imports | `PedidoStepper` desde `'../../components/ui'`; `IconHandStop` para el banner de negociación |
| 30–50 | mapas `COT_ESTADO_*` | Agrega `en_negociacion: 'amber'` / `'En negociación'` a los mapas de color y label de cotizaciones |
| 44–50 | `FILTRO_ESTADO_COT_OPTIONS` | Agrega `{ value: 'en_negociacion', label: 'En negociación' }` |
| 66 | `modalNegociar` | `useState<Cotizacion \| null>` — controla el modal de confirmación de inicio de negociación |
| 78–81 | nuevas suscripciones stores | `iniciarNegociacionCotizacion`, `cancelarNegociacionCotizacion` de `useCotizacionesStore`; `iniciarNegociacion` (alias `iniciarNegociacionPedido`), `cancelarNegociacion` (alias `cancelarNegociacionPedido`) de `usePedidosStore` |
| 151–158 | derivados de estado | `pedidoEnNegociacion`, `pedidoCancelado`, `pedidoBloqueado = pedidoAdjudicado \|\| pedidoCancelado`, `cotizacionEnNegociacion` |
| 190–202 | `handleConfirmarNegociacion()` | Llama `iniciarNegociacionCotizacion(modalNegociar.id)` + `iniciarNegociacionPedido(pedido.id, modalNegociar.id)` + notificación `cotizacion_en_negociacion` al proveedor + cierra modal |
| 204–208 | `handleCancelarNegociacion()` | Llama `cancelarNegociacionCotizacion(cotizacionEnNegociacion.id)` + `cancelarNegociacionPedido(pedido.id)` |
| 235–240 | `<PedidoStepper>` | Montado entre el header y la card de info. Props: `estado`, `rol="comprador"`, `nombreProveedor` (acepta la cotización aceptada o en negociación), `observacionBaja` |
| 294–308 | banner amber negociación | Visible cuando `pedidoEnNegociacion && cotizacionEnNegociacion`. Muestra nombre del proveedor + botón "Cancelar negociación" que llama `handleCancelarNegociacion` |
| 393–394 | columna `esEnNegociacion` | Booleano por fila; resalta la fila con `bg-ep-amber-light/40` y muestra badge "Negociando" |
| 442–469 | botones por cotización | `Adjudicar` visible para `pendiente` y `en_negociacion`. `Negociar` visible solo si `pendiente && !pedidoEnNegociacion`. `Rechazar` visible solo si `pendiente` |
| 543–568 | modal de negociación | `size="sm"`, texto confirmación con nombre del proveedor. Footer: "Cancelar" + "Iniciar negociación" → `handleConfirmarNegociacion` |

---

## src/pages/proveedor/DetallePedidoProveedor.tsx (cambios v0.4.0 — 160 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 8 | import `PROV_IDS` | Importado desde `'../../utils/constants'`; usado con cast `(PROV_IDS as readonly string[])` |
| 43–51 | `miCotizacion` | `useMemo` que busca una cotización del pedido donde `PROV_IDS.includes(c.proveedorId)` — identifica si el usuario demo cotizó en este pedido |
| 53 | `miCotizacionEnNegociacion` | `miCotizacion?.estado === 'en_negociacion'` — booleano derivado |
| 75–77 | `ganadorSoyYo` | `cotizacionAceptada !== null && PROV_IDS.includes(cotizacionAceptada.proveedorId)` — determina si mostrar nombre en stepper y si el chat debe abrirse |
| 104–110 | `<PedidoStepper>` | `estado`, `rol="proveedor"`, `nombreProveedor` solo cuando `ganadorSoyYo` (muestra "¡Tu cotización fue adjudicada!"), `miCotizacionEnNegociacion`, `observacionBaja` |
| 113–125 | banner amber negociación proveedor | Visible cuando `miCotizacionEnNegociacion`. Icono `IconClock`, texto "Tu cotización está siendo evaluada" con subtexto "Usá el chat para coordinar" |

---

## Fix v0.3.1 — Chat segmentado por pedido (eliminación del chat global)

Contexto del bug: convivían dos sistemas de chat. El nuevo (`useMensajesStore` + `Chat.tsx`,
montado en `DetallePedido*`) ya filtraba por `pedidoId`, pero en paralelo seguía activo un chat
"global" (`useChatStore`, páginas `ChatComprador.tsx`/`ChatProveedor.tsx`, rutas `/comprador/chat`
y `/proveedor/chat`, enlazadas desde `Sidebar` y desde el botón "Ir al chat" de `OrdenCard`) que
guardaba un array plano de mensajes en `localStorage` y solo mostraba la *primera* orden con
`chatHabilitado=true` — si el usuario tenía más de una orden con chat, nunca podía ver la otra.
Ese camino fue eliminado por completo; `useMensajesStore` pasa a ser la única fuente de mensajes.

### src/store/useMensajesStore.ts (reescrito — 158 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 6–29 | `MensajesState` | Reemplaza el array plano `mensajes: MensajePedido[]` por `mensajesPorPedido: Record<string, MensajePedido[]>`. Agrega `getMensajesDePedido`, `setMensajesPorPedido`, `agregarMensaje`, `setPedidoActivo`, `cargarTodosLosMensajes`, `limpiarPedidoActivo` (reemplaza a `limpiarMensajes`) |
| 33–41 | `setMensajesPorPedido` / `agregarMensaje` | Mutan únicamente la entrada `mensajesPorPedido[pedidoId]` — nunca reemplazan el Record completo, así los demás pedidos ya cargados no se pierden |
| 45 | `getMensajesDePedido(pedidoId)` | `get().mensajesPorPedido[pedidoId] ?? []` |
| 51–68 | `cargarMensajes(pedidoId)` | Llamado por `Chat.tsx` al montar. `GET /mensajes?pedidoId=X` (filtro server-side), guarda el resultado en el slot de ese pedido y marca `pedidosConMensajeNuevo` si hay mensajes no leídos del otro rol |
| 72–105 | `cargarTodosLosMensajes()` | Llamado por el polling de 5 s en `AppRouter.tsx` (ya no solo cuando hay un pedido activo). `GET /mensajes` sin filtro, agrupa por `pedidoId`, y por cada pedido **ya visto antes en la sesión** (`prevMensajes !== undefined`, evita toasts retroactivos en la primera carga) compara IDs contra el snapshot previo para detectar mensajes nuevos del otro rol. Por cada uno despacha `window.dispatchEvent(new CustomEvent('mensaje-nuevo-toast', { detail: msg }))` — el mismo evento que `ToastContainer.tsx` ya escuchaba, así que el toast + sonido 'mensaje' (`utils/sounds.ts`) siguen funcionando sin tocar ese componente |
| 118–133 | `enviarMensaje(pedidoId, texto, autorRol, autorNombre, cotizacionId?)` | Nuevo parámetro opcional `cotizacionId`, incluido en el objeto `MensajePedido` solo si viene definido (spread condicional) antes del `POST /mensajes` |
| 139–157 | `marcarMensajesLeidos(pedidoId, miRol)` | Igual lógica que antes pero opera sobre `mensajesPorPedido[pedidoId]` en vez del array global |

### src/services/api.ts (+8 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 218–226 | `getMensajes()` | Nueva función, `GET /mensajes` sin query — usada exclusivamente por `cargarTodosLosMensajes()` del store para el polling agrupador |

### src/types/index.ts

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 53 (eliminada) | interfaz `Mensaje` | Removida — era el tipo del chat legacy basado en `ordenId`, sin más referencias tras borrar `useChatStore` |
| 62–70 | `MensajePedido` | Agrega `cotizacionId?: string` |

### src/components/ui/Chat.tsx (128 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 6–9 | `ChatProps` | Agrega `cotizacionId?: string` |
| 16, 20 | selector de mensajes | `useMensajesStore((s) => s.mensajesPorPedido[pedidoId] ?? [])` — reemplaza la lectura del array global `s.mensajes` |
| 30–35 | `useEffect([pedidoId])` | Al desmontar llama `limpiarPedidoActivo()` (antes `limpiarMensajes()`, que además vaciaba el Record entero) |
| 48–52 | `handleEnviar()` | Pasa `cotizacionId` como quinto argumento a `enviarMensaje` |

### src/router/AppRouter.tsx (238 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 19, 27 (eliminadas) | imports `ChatComprador`/`ChatProveedor` | Removidos junto con las rutas |
| 187–194 | `cargarTodo()` | Ya no lee `pedidoActivoId` para decidir si sincronizar mensajes. Llama directamente `useMensajesStore.getState().cargarTodosLosMensajes()` en cada tick del `setInterval` de 5 s, agrupando por `pedidoId` para todos los pedidos con mensajes, no solo el abierto |
| 209–224 (rutas) | `/comprador/chat`, `/proveedor/chat` | Eliminadas del `<Routes>` |

### src/components/layout/ChatsActivosPanel.tsx (nuevo — 162 líneas)

Menú de "chats activos" pedido en el diseño original — antes no existía, solo un punto indicador
en la tabla de `ListaPedidosComprador`.

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 26–34 | `pedidosConChat` (comprador) | `pedidos.filter(p => p.compradorId === COMPRADOR_ID && (p.estado === 'en_negociacion' \|\| p.estado === 'adjudicado'))` |
| 35–40 | `pedidosConChat` (proveedor) | Para cada pedido busca mi cotización (`PROV_IDS.includes(proveedorId)`) y exige `estado en ('en_negociacion','aceptada')` |
| 42–68 | `chatsActivos` (`useMemo`) | Por cada pedido: resuelve `otroNombre` (proveedor o "Comprador Demo"), `ultimoMensaje = mensajes[mensajes.length-1]`, `noLeidos = mensajes.filter(m => !m.leido && m.autorRol !== rol).length` — lee `mensajesPorPedido` de `useMensajesStore`, poblado por el polling aunque el chat nunca se haya abierto |
| 70–75 | orden de la lista | Por `timestamp` del último mensaje desc (fallback `pedido.fechaCreacion`) |
| 77–80 | `irAChat(pedidoId)` | `navigate(`/${rol}/pedidos/${pedidoId}`)` + cierra el panel — nunca abre una ruta de chat genérica |

### src/components/layout/TopBar.tsx (135 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 15–26 | `BREADCRUMB_MAP` | Quita las entradas `/comprador/chat` y `/proveedor/chat` |
| 38 | `cantidadChatsNoLeidos` | `useMensajesStore((s) => s.pedidosConMensajeNuevo.length)` |
| botón `IconMessage` | nuevo | Abre `ChatsActivosPanel`; badge rojo igual al de notificaciones pero con `cantidadChatsNoLeidos` |

### Archivos eliminados
`src/store/useChatStore.ts`, `src/pages/comprador/ChatComprador.tsx`, `src/pages/proveedor/ChatProveedor.tsx`.

### Otros archivos tocados (navegación y datos)
- `src/components/layout/Sidebar.tsx` — quita el ítem "Chat activo" de `NAV_COMPRADOR`/`NAV_PROVEEDOR`.
- `src/pages/comprador/MisOrdenesComprador.tsx`, `src/pages/proveedor/MisOrdenesProveedor.tsx` — `onIrChat` navega a `/comprador\|proveedor/pedidos/${orden.pedidoId}` en vez de la ruta de chat global.
- `src/pages/comprador/DetallePedidoComprador.tsx`, `src/pages/proveedor/DetallePedidoProveedor.tsx` — `<Chat>` recibe `cotizacionId`; se agrega un segundo `<Chat>` condicional para el estado `en_negociacion` (antes solo aparecía adjudicado, aunque el banner de negociación del proveedor ya invitaba a "usar el chat").
- `src/data/mockData.ts`, `src/utils/constants.ts` — quitan `MENSAJES_INICIALES` y `STORAGE_KEY_MENSAJES` (dependían del tipo/; store eliminados).
- `db.json` — agrega 4 mensajes semilla con `pedidoId` + `cotizacionId` sobre `ped-003` y `8JQ-AEVQceg`.
- `src/components/layout/NotificacionesPanel.tsx`, `src/components/ui/PedidoStepper.tsx` — fixes de compilación preexistentes (no relacionados al chat) detectados al correr `npm run build` durante esta tarea: mapas `ICONOS_TIPO`/`COLORES_ICONO` no cubrían las 4 variantes de `TipoNotificacion` agregadas en Etapa 4; variable `futuro` sin usar en uno de los dos `.map` de `PedidoStepper`.

---

## Fix v0.3.2 — Chat.tsx: loop infinito por selector de Zustand sin referencia estable

Causa raíz: `Chat.tsx` (línea 21 en la versión previa a este fix) tenía
`const mensajes = useMensajesStore((s) => s.mensajesPorPedido[pedidoId] ?? []);`.
Cuando `pedidoId` todavía no existía como clave en `mensajesPorPedido` (chat recién montado,
antes de que resuelva `cargarMensajes`, o un pedido sin mensajes), el `?? []` construía un
array **literal nuevo** en cada invocación del selector. Zustand v5 usa `useSyncExternalStore`
por debajo, que decide si re-renderizar comparando el snapshot devuelto por el selector con
el anterior usando `Object.is` (igualdad por referencia) — al recibir una referencia distinta
en cada llamada, React tira "The result of getSnapshot should be cached" y entra en un loop de
renders que termina en "Maximum update depth exceeded".

### src/store/useMensajesStore.ts

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 6–9 | `SIN_MENSAJES` | Nueva constante módulo-level: `const SIN_MENSAJES: MensajePedido[] = [];`. Es la única referencia usada como fallback en todo el store — nunca `?? []` inline en un getter expuesto como selector |
| 55 | `getMensajesDePedido(pedidoId)` | `get().mensajesPorPedido[pedidoId] ?? SIN_MENSAJES` (antes `?? []`). No estaba en el camino del bug reportado (nada la llamaba de forma reactiva), pero se corrige por consistencia y porque es la función pensada para ser usada como selector en el futuro |

### src/components/ui/Chat.tsx

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 5 | import `MensajePedido` | Nuevo, tipa la constante local |
| 9 | `SIN_MENSAJES` | Constante módulo-level propia del componente (mismo patrón que en el store; no se comparte instancia entre archivos, cada uno define la suya) |
| 26 | selector de mensajes | `useMensajesStore((s) => s.mensajesPorPedido[pedidoId] ?? SIN_MENSAJES)` — la línea que causaba el crash. Es el ÚNICO selector del archivo con lógica de fallback; el resto (`cargarMensajes`, `enviarMensaje`, `limpiarPedidoActivo`, `marcarMensajesLeidos` en las líneas siguientes, y `rol` de `useRolStore`) seleccionan una acción o un primitivo ya estables por diseño de Zustand (`create()` no recrea las funciones de las acciones entre renders) — no requerían cambios |

### Verificación de que no hay otras instancias del patrón

Se revisó el resto del código en busca de `Store((s) => ({...}))` (selector que agrupa campos en
un objeto nuevo) y `Store((s) => ... ?? []` / `?? {}` (fallback inline dentro del selector):
ningún otro archivo los tiene. `src/components/layout/ChatsActivosPanel.tsx` línea 63 usa
`mensajesPorPedido[pedido.id] ?? []`, pero **dentro de un `useMemo`** que ya depende de
`mensajesPorPedido` (seleccionado sin transformar en la línea 30) — no es el valor que Zustand
usa para comparar snapshots, así que no tiene el mismo problema.

---

## v0.6.0 — Migración a MySQL + funciones serverless de Vercel (rama electroparts-bd)

Reemplaza JSON Server (mock, solo local, no deployable) por un backend real: funciones
serverless de Vercel en `/api/*` que persisten en MySQL vía Prisma. El frontend sigue
llamando a `src/services/api.ts` exactamente igual que antes — solo cambió el `BASE_URL`
(de `http://localhost:3001` a `/api`) y quién responde del otro lado.

### prisma/schema.prisma (nuevo — 155 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 9–12 | `datasource db` | `provider = "mysql"`, `url = env("DATABASE_URL")`. Prisma 6 (no 7: en Prisma 7 `url` en el schema ya no es válido, requiere `prisma.config.ts` + driver adapters — se fijó la versión en 6.19.3 para mantener el patrón simple y ampliamente documentado) |
| 20–70 | enums | `EstadoPedido`, `EstadoCotizacion`, `EstadoOrden`, `EstadoPago`, `Rol`, `TipoNotificacion` — mismos valores string que los union types de `src/types/index.ts`, para que el JSON que devuelve Prisma matche 1:1 lo que el frontend ya espera |
| 74–92 | `model Pedido` | Campos idénticos a la interfaz `Pedido`. `@@index([compradorId])`, `@@index([estado])` — las dos formas más comunes de filtrar pedidos en el frontend |
| 96–110 | `model Cotizacion` | `pedido Pedido @relation(fields: [pedidoId], references: [id], onDelete: Cascade)` — reemplaza el borrado en cascada manual que hacía `usePedidosStore.eliminarPedido()` llamando a `eliminarCotizacionesByPedidoId()`; ahora lo garantiza la FK a nivel de DB |
| 114–135 | `model Orden` | `pedidoId String?` + `onDelete: SetNull` — una orden puede sobrevivir al borrado de su pedido con `pedidoId: null`, mismo comportamiento que ya existía en los datos de `db.json` |
| 139–152 | `model MensajePedido` | FK a `Pedido` con `onDelete: Cascade`, igual que `Cotizacion` |
| 156–166 | `model Notificacion` | Sin relación a `Pedido` (usa `entidadId` como referencia libre, igual que antes) |

### prisma/seed.ts (nuevo — 58 líneas)

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 8–9 | resolución de ruta | `fileURLToPath(import.meta.url)` + `path.resolve(..., 'db.json')` — encuentra `db.json` en la raíz del repo sin depender del cwd desde el que se invoque `tsx` |
| 11–17 | `DbJson` | Interface que tipa cada colección como `Prisma.<Modelo>CreateManyInput[]` — reusa los tipos que genera Prisma en vez de duplicarlos a mano |
| 26–48 | `main()` | `createMany({ data, skipDuplicates: true })` por modelo, en orden Pedido → Cotizacion/Orden/MensajePedido/Notificacion (respeta las FK; `skipDuplicates` permite correr el seed más de una vez sin explotar por PK duplicada) |

### api/_db.ts (nuevo — 15 líneas)

Cliente Prisma singleton cacheado en `globalThis.__prisma`. Sin esto, cada invocación de una
función serverless en un lambda "warm" (reusado por Vercel entre requests) crearía un
`PrismaClient` nuevo y agotaría el pool de conexiones de MySQL en poco tráfico.

### api/_utils.ts (nuevo — 15 líneas)

`sendJson(res, status, body)`, `methodNotAllowed(res, allowed[])` (setea header `Allow` + 405),
`handleError(res, e, context)` (loguea y responde 500 `{error: 'internal_error'}`) — usados por
todos los handlers para no repetir el mismo boilerplate de manejo de errores.

### api/health.ts (nuevo — 14 líneas)

`GET /api/health` → `prisma.$queryRaw\`SELECT 1\`` → `{ok:true, db:'connected'}` o 500. Pensado
para verificar `DATABASE_URL` después de cada deploy, sin tener que probar un flujo completo.

### api/{pedidos,cotizaciones,ordenes,notificaciones,mensajes}/index.ts + [id].ts (nuevos)

Un par de archivos por entidad seguido el file-based routing de Vercel: `index.ts` resuelve
`/api/<entidad>` (`GET` lista, `POST` crea), `[id].ts` resuelve `/api/<entidad>/:id` (`req.query.id`)
con `GET`/`PATCH`/`DELETE` según la entidad lo necesite (ver tabla).

| Archivo | Métodos | Notas |
|---|---|---|
| `pedidos/index.ts` (21 líneas) | GET, POST | orden `fechaCreacion desc` |
| `pedidos/[id].ts` (46 líneas) | GET, PATCH, DELETE | `DELETE` dispara cascade de Cotizacion/MensajePedido vía FK; catch de `Prisma.PrismaClientKnownRequestError` código `P2025` → 404 en vez de 500 (registro no encontrado) |
| `cotizaciones/index.ts` (25 líneas) | GET (`?pedidoId=`), POST | replica el filtro `?pedidoId=` que antes hacía JSON Server |
| `cotizaciones/[id].ts` (38 líneas) | PATCH, DELETE | mismo manejo de P2025 que pedidos |
| `ordenes/index.ts` (21 líneas) | GET, POST | orden `fechaConfirmacion desc` |
| `ordenes/[id].ts` (26 líneas) | PATCH | no expone DELETE — el frontend nunca borra órdenes |
| `notificaciones/index.ts` (21 líneas) | GET, POST | orden `fecha desc` |
| `notificaciones/[id].ts` (38 líneas) | PATCH, DELETE | — |
| `mensajes/index.ts` (25 líneas) | GET (`?pedidoId=`), POST | orden `timestamp asc` (a diferencia de las otras listas, los mensajes se muestran cronológicamente ascendente en el chat) |
| `mensajes/[id].ts` (26 líneas) | PATCH | usado por `marcarMensajesLeidos` para `{leido: true}` |

### src/services/api.ts (1 línea modificada)

| Línea | Cambio |
|-------|--------|
| 3 | `BASE_URL = import.meta.env.VITE_API_URL ?? '/api'` (antes `?? 'http://localhost:3001'`) — el resto del archivo (todas las funciones `get/create/update/delete`) no cambió una sola línea, porque los handlers de `/api/*` replican exactamente los mismos verbos y payloads que JSON Server |

### Configuración de build/tooling

- `tsconfig.api.json` *(nuevo)* — tipa `api/**` y `prisma/seed.ts`; `module: esnext` / `moduleResolution: bundler` (no `nodenext`) porque Vercel empaqueta cada función con esbuild, igual que Vite empaqueta el frontend — con `nodenext` TS exige extensión `.js` en imports relativos (`../_db.js`) que no reflejan cómo esbuild resuelve los módulos en este pipeline.
- `tsconfig.json` — agrega la referencia a `tsconfig.api.json` junto a `app` y `node`, así `tsc -b` (parte de `npm run build`) type-checkea también el backend antes de cada deploy.
- `vercel.json` *(nuevo)* — `rewrites`: `/api/(.*)` → `/api/$1` (passthrough explícito) y `/(.*)` → `/index.html` (fallback SPA, necesario para que rutas de React Router como `/comprador/pedidos/abc123` no den 404 al refrescar el navegador).
- `package.json` — quita `json-server`/`concurrently`; agrega `prisma`, `@prisma/client` (runtime), `@vercel/node`, `vercel`, `tsx` (dev). `"prisma": {"seed": "tsx prisma/seed.ts"}` — config que lee `npx prisma db seed` / `npm run db:seed`.

### Fixes de compilación arrastrados de Etapa 5a (detectados al correr `tsc -b` durante esta migración)

| Archivo | Línea | Fix |
|---|---|---|
| `src/components/cotizaciones/CotizacionCard.tsx` | 89 | Llamaba a `estadoALabel(...)` (no existe) en vez de `getLabelEstadoCotizacion(cotizacion.estado, rol)`, que es la función que ya se usa en la variante `compacto` del mismo componente (línea 66) |
| `src/components/layout/NotificacionesPanel.tsx` | 20–36 | `ICONOS_TIPO`/`COLORES_ICONO` no cubrían los 6 `TipoNotificacion` que agregó Etapa 5a (`orden_en_preparacion`, `orden_enviada`, `orden_entregada`, `orden_pago_confirmado`, `orden_cerrada`, `orden_disputada`) |
| `src/data/mockData.ts` | 115 | `estado: 'en_transito'` — valor que `EstadoOrden` ya no acepta (Etapa 5a lo reemplazó por `'enviado'`); `mockData.ts` es código muerto (nada lo importa) pero igual debe tipar correctamente |
| `src/store/useCotizacionesStore.ts` | 46–57 | La `Orden` construida en `aceptarCotizacion()` no incluía `estadoPago`, campo requerido desde Etapa 5a — se agregó `estadoPago: 'pendiente'` |
