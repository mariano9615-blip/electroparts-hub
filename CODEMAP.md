# CODEMAP — ElectroParts Hub

Última actualización: 2026-06-30
Rama: mdemichelis

---

## src/pages/comprador/DetallePedidoComprador.tsx

| Líneas | Nombre | Descripción |
|--------|--------|-------------|
| 1–10 | imports | React (`useState`), React Router (`useParams`, `useNavigate`), íconos Tabler, componentes UI (`Badge`, `Button`, `EmptyState`, `Modal`), los cuatro stores necesarios, utilidades de formato (`formatFecha`, `formatARS`), tipo `Cotizacion` de types |
| 12 | `BadgeColor` | Tipo local que restringe las variantes de color permitidas para `Badge` (`green`, `blue`, `amber`, `red`, `gray`) |
| 14–19 | `ESTADO_COLOR` | Mapa de estado de pedido → color de badge. `abierto`→green, `en_cotizacion`→blue, `adjudicado`→gray, `cancelado`→red |
| 21–26 | `ESTADO_LABEL` | Mapa de estado de pedido → etiqueta legible en español para mostrar en el badge |
| 28–33 | `COT_ESTADO_COLOR` | Mapa de estado de cotización → color de badge. `pendiente`→amber, `aceptada`→green, `rechazada`→red |
| 34–38 | `COT_ESTADO_LABEL` | Mapa de estado de cotización → etiqueta legible en español para mostrar en el badge |
| 40 | `TH` | Constante con las clases Tailwind compartidas de todos los `<th>` de la tabla de cotizaciones (padding, tipografía, borde inferior) |
| 42 | `DetallePedidoComprador` | Página exportada por defecto para la ruta `/comprador/pedidos/:id` |
| 43–44 | router hooks | `useParams` extrae el `id` de la URL; `useNavigate` permite navegación programática |
| 46–47 | `useState` modales | `modalAdjudicar: Cotizacion\|null` y `modalRechazar: Cotizacion\|null` — único estado local del componente, controla qué modal está abierto y con qué cotización. No persiste en store |
| 49–53 | suscripciones a stores | Lee reactivamente `pedidos`, `cotizaciones`, `ordenes`; extrae las acciones `aceptarCotizacion` y `rechazarCotizacion` de sus respectivos stores |
| 55 | `pedido` | Busca el pedido cuyo `id` coincide con el parámetro de URL en el array del store |
| 57–75 | guard: pedido no encontrado | Si `pedido` es undefined, renderiza botón "Volver" que navega a `/comprador/cotizaciones` y un `EmptyState` con acción de vuelta. Sale del render normal |
| 77–79 | `cotizacionesPedido` | Filtra las cotizaciones del store para quedarse solo con las del pedido actual, luego las ordena por precio ascendente |
| 81–84 | `precioMinimo` | Calcula el precio mínimo entre todas las cotizaciones del pedido usando `Math.min`. Devuelve `null` si no hay cotizaciones |
| 86 | `pedidoAdjudicado` | Booleano derivado: `true` cuando `pedido.estado === 'adjudicado'`. Controla la visibilidad de la columna Acciones y el banner |
| 87 | `cotizacionAceptada` | Busca la cotización con `estado === 'aceptada'` para mostrar el nombre del proveedor ganador en el banner. Solo relevante cuando `pedidoAdjudicado` es true |
| 88 | `ordenAdjudicada` | Busca en el store de órdenes la orden cuyo `pedidoId` coincide con el pedido actual. Provee la `fechaConfirmacion` para el banner |
| 90–106 | `handleConfirmarAdjudicacion` | Ejecuta el flujo completo de adjudicación: (1) filtra cotizaciones pendientes que no sean la seleccionada y dispara una notificación `pedido_adjudicado` a cada proveedor rechazado vía `useNotificacionesStore.getState()`; (2) llama `aceptarCotizacion(modalAdjudicar.id)` del store (que crea la orden, actualiza el pedido y notifica al ganador); (3) cierra el modal |
| 108–119 | `handleConfirmarRechazo` | Ejecuta el rechazo individual: llama `rechazarCotizacion(modalRechazar.id)` del store y dispara una notificación `pedido_adjudicado` al proveedor afectado vía `useNotificacionesStore.getState()`. Cierra el modal |
| 123–130 | JSX: botón volver | Botón `<button>` nativo con `navigate(-1)`. Estilo: `text-sm text-ep-text-muted hover:text-ep-text-primary`, icono `IconArrowLeft` |
| 132–143 | JSX: header pedido | `flex justify-between` con título `text-2xl font-bold`, subtítulo `categoría · cantidad unidad` en `text-ep-text-muted`, y badge de estado del pedido alineado a la derecha |
| 145–194 | JSX: card información | Card `bg-ep-surface border border-ep-border rounded-lg p-5`. Grid 2 columnas: izquierda muestra descripción completa; derecha usa grid 2-col para mostrar presupuesto máx. (condicional), fecha límite, cantidad+unidad, fecha de publicación y total de cotizaciones |
| 196–200 | JSX: header sección cotizaciones | `<h2>` con estilo de sección (`text-xs font-bold uppercase tracking-widest border-b`) mostrando el count de cotizaciones |
| 202–211 | JSX: banner adjudicado | Se renderiza solo cuando `pedidoAdjudicado && cotizacionAceptada`. Muestra "Pedido adjudicado a [proveedor] el [fecha]". Fondo `bg-ep-green-light border-ep-green rounded-lg`. La fecha solo aparece si existe `ordenAdjudicada` |
| 213–218 | JSX: EmptyState sin cotizaciones | Renderiza `EmptyState` con `IconInbox` cuando `cotizacionesPedido.length === 0` |
| 220–309 | JSX: tabla cotizaciones | Tabla HTML con borde y overflow hidden. Columnas: Proveedor, Precio, Precio unitario, Entrega, Notas, Estado, y Acciones (condicional) |
| 222–233 | JSX: thead | Fila de encabezados. La columna "Acciones" solo se renderiza cuando `!pedidoAdjudicado` |
| 236–243 | JSX: derivados por fila | Por cada `cot`: calcula `esMejorPrecio` (comparación con `precioMinimo`), `precioUnitario` (precio/cantidad), y `notasTruncadas` (truncado a 60 chars con tooltip `title=`) |
| 245–304 | JSX: `<tr>` por cotización | Fila con `bg-ep-green-light` si es mejor precio, `hover:bg-ep-surface-raised` si no. Columna Proveedor incluye badge inline "Mejor precio" cuando corresponde. Precio en `font-mono`. Notas con `title=` para tooltip completo |
| 281–302 | JSX: columna Acciones | Solo se renderiza la celda cuando `!pedidoAdjudicado`. Dentro, solo muestra los botones cuando `cot.estado === 'pendiente'`: Button `primary sm` "Adjudicar" (→ `setModalAdjudicar(cot)`) y Button `secondary sm` "Rechazar" (→ `setModalRechazar(cot)`) |
| 312–370 | JSX: Modal adjudicar | `open={modalAdjudicar !== null}`, `size="md"`. Cuerpo: grid 3 columnas con proveedor, precio (font-mono) y entrega estimada, más aviso amber con `IconAlertTriangle` explicando el efecto en cadena. Footer: "Cancelar" (secondary) + "Confirmar adjudicación" (primary, llama `handleConfirmarAdjudicacion`) |
| 372–398 | JSX: Modal rechazar | `open={modalRechazar !== null}`, `size="sm"`. Cuerpo: texto simple "¿Rechazar la cotización de [proveedor]?". Footer: "Cancelar" (secondary) + "Confirmar rechazo" (danger, llama `handleConfirmarRechazo`) |

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
