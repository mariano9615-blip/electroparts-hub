# CHANGELOG — ElectroParts Hub

## [Unreleased] — rama electroparts-bd

### v0.6.1 — 2026-07-01
#### Changed — Motor de base de datos: MySQL → PostgreSQL (Supabase)

Se cambió el motor definido en v0.6.0 antes de tener credenciales reales cargadas — no hubo
datos en producción que migrar. Motivo: el free tier de Supabase (500MB persistentes, no
expira por inactividad) es más generoso que las alternativas MySQL evaluadas, y ya trae
pooler de conexiones (PgBouncer) integrado.

- `prisma/schema.prisma` *(modificado)* — `datasource db`: `provider` de `"mysql"` a `"postgresql"`; agrega `directUrl = env("DIRECT_URL")` (Supabase separa el pooler de conexiones del acceso directo que necesita Prisma para migraciones — ver ANTIGRAVITY.md). El resto del schema (modelos, enums, índices, relaciones) no cambió: son válidos en ambos motores.
- `.env.example` *(modificado)* — `DATABASE_URL` pasa a formato `postgresql://...?pgbouncer=true` (pooler, puerto 6543); se agrega `DIRECT_URL` (conexión directa, puerto 5432, solo la usa el Prisma CLI).
- `README.md` *(modificado)* — la guía "Crear una base MySQL gratis (TiDB Cloud)" se reemplaza por "Crear una base en Supabase (gratis)"; sección de deploy en Vercel actualizada para cargar también `DIRECT_URL`.
- `ANTIGRAVITY.md`, `CODEMAP.md` *(modificados)* — referencias a MySQL actualizadas a PostgreSQL/Supabase.
- Sin cambios en `api/*`, `src/services/api.ts` ni `vercel.json` — los handlers de Prisma y el frontend son agnósticos al motor de base de datos.

### v0.6.0 — 2026-07-01
#### Changed — Migración de JSON Server (mock) a MySQL + funciones serverless de Vercel

Objetivo: dejar la rama lista para deploy en Vercel. JSON Server solo corre en local y no
es deployable; se reemplaza por un backend real (`/api/*`, funciones serverless de Node)
que persiste en MySQL vía Prisma. El frontend no cambió su forma de consumir datos —
`src/services/api.ts` sigue siendo la única capa fetch, solo cambió a qué URL apunta.

- `prisma/schema.prisma` *(nuevo)* — modelos `Pedido`, `Cotizacion`, `Orden`, `MensajePedido`, `Notificacion` + enums (`EstadoPedido`, `EstadoCotizacion`, `EstadoOrden`, `EstadoPago`, `Rol`, `TipoNotificacion`), migrados 1:1 desde los tipos de `src/types/index.ts`. `Cotizacion` y `MensajePedido` tienen FK a `Pedido` con `onDelete: Cascade` (reemplaza el borrado en cascada que antes hacía el frontend a mano); `Orden.pedidoId` es `onDelete: SetNull` (una orden puede quedar con `pedidoId: null` si se borra el pedido, igual que en db.json).
- `prisma/seed.ts` *(nuevo)* — lee `db.json` y hace `createMany` (`skipDuplicates: true`) en MySQL, en orden de dependencias (Pedido → Cotizacion/Orden/MensajePedido). Se corre con `npm run db:seed`.
- `api/_db.ts` *(nuevo)* — cliente Prisma singleton cacheado en `globalThis`, patrón estándar para evitar agotar el pool de conexiones cuando una función serverless queda "warm" y se reinvoca.
- `api/_utils.ts` *(nuevo)* — `sendJson`, `methodNotAllowed`, `handleError`: helpers compartidos por todos los handlers.
- `api/health.ts` *(nuevo)* — `GET /api/health`, hace `SELECT 1` contra MySQL para verificar la conexión post-deploy.
- `api/pedidos/index.ts` + `[id].ts`, `api/cotizaciones/index.ts` + `[id].ts`, `api/ordenes/index.ts` + `[id].ts`, `api/notificaciones/index.ts` + `[id].ts`, `api/mensajes/index.ts` + `[id].ts` *(nuevos)* — reimplementan cada endpoint que antes servía JSON Server (`GET`/`POST` en `index.ts`, `GET`/`PATCH`/`DELETE` por id en `[id].ts`), incluyendo el filtro `?pedidoId=` que usaban `cotizaciones` y `mensajes`. Mismos verbos y payloads que antes — el frontend no tuvo que cambiar su forma de llamarlos.
- `src/services/api.ts` *(modificado)* — `BASE_URL` pasa de `http://localhost:3001` a `/api` (mismo origen); sigue siendo overrideable con `VITE_API_URL`.
- `package.json` *(modificado)* — quita `json-server` y `concurrently`; agrega `prisma`, `@prisma/client`, `@vercel/node`, `vercel`, `tsx`. Nuevos scripts: `dev` ahora es `vercel dev` (Vite + `/api` en el mismo proceso), `dev:vite` (solo frontend, reemplaza al viejo `dev`), `db:push`, `db:seed`, `db:studio`. `postinstall: prisma generate`.
- `tsconfig.api.json` *(nuevo)* + `tsconfig.json` *(modificado)* — nueva referencia de proyecto que tipa `api/**` y `prisma/seed.ts` con `module: esnext` / `moduleResolution: bundler` (igual que el frontend, porque Vercel empaqueta cada función con esbuild y no necesita extensiones `.js` en imports relativos).
- `vercel.json` *(nuevo)* — `buildCommand`/`outputDirectory` para el build de Vite, más rewrites: `/api/*` a las funciones, el resto a `index.html` (necesario para que las rutas del SPA de React Router no den 404 al refrescar).
- `.env.example` *(modificado)* — agrega `DATABASE_URL`; `VITE_API_URL` queda documentado como opcional.
- `db.json` *(modificado)* — ya no se sirve en runtime; queda solo como fuente de datos para `prisma/seed.ts`. Se quitó la key `$schema` (apuntaba a `json-server/schema.json`, paquete ya no instalado).
- `README.md` *(reescrito)* — instrucciones de setup (MySQL + `db:push` + `db:seed` + `vercel dev`), guía para crear una base MySQL gratis en TiDB Cloud Serverless, y pasos de deploy en Vercel.
- Fixes de compilación preexistentes encontrados al correr `tsc -b` durante esta migración (no relacionados a la migración en sí, arrastrados de la Etapa 5a): `CotizacionCard.tsx` llamaba a una función inexistente `estadoALabel` en vez de `getLabelEstadoCotizacion`; `NotificacionesPanel.tsx` no mapeaba los 6 `TipoNotificacion` nuevos de Etapa 5a (`orden_en_preparacion`, `orden_enviada`, `orden_entregada`, `orden_pago_confirmado`, `orden_cerrada`, `orden_disputada`); `mockData.ts` tenía `estado: 'en_transito'`, valor que ya no existe en `EstadoOrden`; `useCotizacionesStore.aceptarCotizacion` construía una `Orden` sin el campo `estadoPago`, ahora requerido.

### v0.5.1 — 2026-07-01
#### Added — Etapa 5a — Ciclo de vida de orden: preparación, envío, entrega, pago y disputa

- `src/types/index.ts` *(modificado)* — reemplaza `EstadoOrden` con nuevo tipo de 6 estados (`confirmada | en_preparacion | enviado | entregado | cerrado | disputada`); agrega tipo `EstadoPago`; agrega campos opcionales a `Orden`: `estadoPago`, `numeroSeguimiento`, `fechaEnvio`, `fechaEntrega`, `comprobantePago`, `fechaPagoConfirmado`, `observacionDisputa`; `pedidoId` ahora acepta `string | null`.
- `src/store/useNotificacionesStore.ts` *(modificado)* — extiende `TipoNotificacion` con 6 nuevos tipos: `orden_en_preparacion`, `orden_enviada`, `orden_entregada`, `orden_pago_confirmado`, `orden_cerrada`, `orden_disputada`.
- `src/store/useOrdenesStore.ts` *(refactorizado)* — agrega 6 nuevas acciones async: `marcarEnPreparacion`, `marcarEnviado`, `confirmarEntrega`, `confirmarPago`, `abrirDisputa`, `cerrarOrden`. Cada una hace PATCH a la API, actualiza el store local y dispara notificación al otro rol. `confirmarEntrega` y `confirmarPago` llaman `cerrarOrden` automáticamente cuando corresponde.
- `src/utils/formatters.ts` *(modificado)* — agrega `getLabelEstadoOrden(estado, rol)`, `getLabelEstadoPago(estado)`, `getColorEstadoPago(estado)`. Actualiza `getColorEstadoOrden` para los nuevos estados.
- `src/components/ordenes/OrdenStepper.tsx` *(nuevo)* — stepper horizontal de 5 pasos (Confirmada → En preparación → Enviado → Entregado → Cerrado), con texto contextual por rol y estado. Si `estado === 'disputada'`: panel rojo con ícono de alerta, independiente de los pasos.
- `src/components/ordenes/OrdenCard.tsx` *(refactorizado)* — nueva estructura: título del pedido, badges de estado y pago, fecha, N° de seguimiento, botones de acción pasados via prop `acciones[]`, chat button, toggle "Ver detalles" que expande `OrdenStepper` + panel de estado de pago + motivo de disputa.
- `src/pages/comprador/MisOrdenesComprador.tsx` *(refactorizado)* — 7 tabs de filtro (Todas/Confirmadas/En preparación/En camino/Recibidas/Cerradas/Disputas); modales para "Confirmar recepción" y "Abrir disputa" (mínimo 20 chars); `acciones` calculadas por estado; obtiene `pedidoTitulo` cruzando con `usePedidosStore`.
- `src/pages/proveedor/MisOrdenesProveedor.tsx` *(refactorizado)* — 7 tabs de filtro (Todas/Confirmadas/Preparando/Enviadas/Entregadas/Cerradas/Disputas); modales para "Marcar en preparación", "Marcar como enviado" (tracking opcional), "Confirmar pago recibido" (comprobante opcional).
- `src/router/AppRouter.tsx` *(modificado)* — agrega `ordenesEstadoRef` para snapshot de estado+estadoPago; suscripción a `useOrdenesStore` que detecta cambios de `orden.estado` y `orden.estadoPago` y despacha `CustomEvent 'orden-estado-toast'` con mensaje contextual por rol.
- `db.json` *(modificado)* — agrega `estadoPago: "pendiente"` a todas las órdenes existentes; migra la orden `en_transito` (ord-001) → `enviado` con `numeroSeguimiento` de ejemplo; mantiene estructura existente de pedidos, cotizaciones, notificaciones y mensajes.

---

### v0.5.0 — 2026-07-01
#### Changed — Refactor sidebar, terminología comercial, tabs de filtro, métricas y actividad reciente

- `src/utils/formatters.ts` *(modificado)* — agrega `getLabelEstadoPedido(estado, rol)` y `getLabelEstadoCotizacion(estado, rol)`: helpers centralizados para labels con conciencia de rol (comprador vs proveedor). Sin estos helpers, cada componente duplicaba el mapeo.
- `src/components/ui/StatCard.tsx` *(modificado)* — agrega prop `onClick?: () => void`; el card se vuelve clickeable con hover si se provee.
- `src/components/domain/PedidosTable.tsx` *(modificado)* — agrega prop `rol?: Rol` (default `'comprador'`); usa `getLabelEstadoPedido` para mostrar "Comprado"/"Vendido" según contexto.
- `src/components/cotizaciones/CotizacionCard.tsx` *(modificado)* — agrega prop `rol?: Rol` (default `'comprador'`); usa `getLabelEstadoCotizacion` para mostrar "Ganada" en contexto proveedor; agrega color `en_negociacion` al badge.
- `src/components/layout/Sidebar.tsx` *(refactorizado)* — nueva estructura por rol: "Publicar pedido" como botón destacado verde (solo comprador); separador "MIS VISTAS"; nuevos nombres de ítems (Cotizaciones recibidas, Mis compras, Explorar pedidos, Mis ventas); badges dinámicos por rol desde stores; activo detectado por `matchPrefix` para rutas con sub-páginas.
- `src/router/AppRouter.tsx` *(modificado)* — nuevas rutas canónicas (`/comprador/cotizaciones-recibidas`, `/comprador/mis-compras`, `/proveedor/explorar`, `/proveedor/mis-ventas`); redirects desde rutas viejas; toast proveedor ahora dice "¡Ganaste la venta! [nombre pedido]"; toast comprador adjudicación dice "Compra confirmada para [nombre pedido]".
- `src/pages/comprador/ListaPedidosComprador.tsx` *(refactorizado)* — sistema de tabs (Todos/Activos/En negociación/Comprados/Cancelados) con soporte de `?tab=` via URL; resumen por fila (count cotizaciones + mejor precio); indicador de actividad reciente (punto verde/ámbar basado en timestamps de cotizaciones y mensajes); "Publicado hace N días"; ESTADO_LABEL actualizado con "Comprado".
- `src/pages/comprador/DetallePedidoComprador.tsx` *(modificado)* — botón "Adjudicar" → "Confirmar compra"; modal "Confirmar adjudicación" → "Confirmar compra"; banner "Pedido adjudicado a" → "Compra confirmada con"; ESTADO_LABEL `adjudicado` → "Comprado".
- `src/pages/comprador/MisOrdenesComprador.tsx` *(modificado)* — PageHeader título "Mis órdenes" → "Mis compras"; navigate a `cotizaciones-recibidas`.
- `src/pages/comprador/MisCotizacionesComprador.tsx` *(modificado)* — PageHeader título → "Cotizaciones recibidas"; navigate post-aceptar → `/comprador/mis-compras`.
- `src/pages/comprador/DashboardComprador.tsx` *(refactorizado)* — 4 StatCards clickeables (Pedidos activos, En negociación, Mis compras, Cancelados); métrica secundaria "Cotizaciones esta semana"; navigate a "/comprador/cotizaciones-recibidas".
- `src/pages/proveedor/PedidosDisponibles.tsx` *(modificado)* — PageHeader → "Explorar pedidos"; indicadores de actividad reciente (punto verde/ámbar); contador de días publicado con colores por antigüedad (<7d gris, 7-14d ámbar, >14d rojo).
- `src/pages/proveedor/MisCotizacionesProveedor.tsx` *(refactorizado)* — tabs (Todas/Pendientes/En negociación/Ganadas/Rechazadas); vista rápida por fila (pedido, badge con label proveedor, precio, fecha relativa); click navega al detalle del pedido; usa `getLabelEstadoCotizacion`.
- `src/pages/proveedor/MisOrdenesProveedor.tsx` *(modificado)* — PageHeader título "Mis órdenes" → "Mis ventas"; tabs (Todas/Ganadas/En tránsito/Cerradas).
- `src/pages/proveedor/DashboardProveedor.tsx` *(refactorizado)* — 4 StatCards clickeables (Pedidos disponibles, Mis cotizaciones, Mis ventas, Rechazadas); tasa de éxito en StatCard secundario; navigate actualizado a rutas nuevas.

---

### v0.4.0 — 2026-06-30
#### Added
- **Etapa 4 — Ciclo de vida completo, negociación, mensajes vistos, stepper, sonido y baja con observación**

  - `src/types/index.ts` *(modificado)* — agrega `'en_negociacion'` a `EstadoPedido` y `EstadoCotizacion`; campos opcionales `cotizacionEnNegociacionId`, `observacionBaja`, `fechaBaja` en `Pedido`; campo `leido?: boolean` en `MensajePedido`.
  - `src/utils/constants.ts` *(modificado)* — exporta `PROV_IDS` (`string[]` con IDs de todos los proveedores del sistema).
  - `src/utils/sounds.ts` *(nuevo)* — Web Audio API sin dependencias externas. `playNotificationSound(tipo)`: pedido=880Hz/150ms, cotizacion=660→880Hz/100ms, mensaje=440Hz/80ms. Respeta `localStorage 'ep_sonido_silenciado'`.
  - `src/services/api.ts` *(modificado)* — agrega `updateMensaje(id, data)` para PATCH /mensajes/:id (usado para marcar leído).
  - `src/store/useNotificacionesStore.ts` *(modificado)* — extiende `TipoNotificacion` con: `'cotizacion_en_negociacion'`, `'cotizacion_rechazada'`, `'mensaje_nuevo'`, `'estado_pedido_cambio'`.
  - `src/store/usePedidosStore.ts` *(modificado)* — agrega `iniciarNegociacion(pedidoId, cotizacionId)`, `cancelarNegociacion(pedidoId)`, `cancelarPedido(id, observacion)` con PATCH a API.
  - `src/store/useCotizacionesStore.ts` *(modificado)* — agrega `iniciarNegociacionCotizacion(id)` y `cancelarNegociacionCotizacion(id)` con PATCH a API.
  - `src/store/useMensajesStore.ts` *(modificado)* — agrega `pedidosConMensajeNuevo: string[]`, `marcarMensajesLeidos(pedidoId, miRol)`. `cargarMensajes` detecta mensajes no leídos en primera carga y nuevos mensajes en polls subsiguientes (dispara `CustomEvent 'mensaje-nuevo-toast'`).
  - `src/hooks/useNotificationSound.ts` *(nuevo)* — hook `{ silenciado, toggleSilencio }`. Persiste en `localStorage 'ep_sonido_silenciado'`. Usado por TopBar para mostrar ícono de mute.
  - `src/components/ui/Toast.tsx` *(refactorizado)* — soporte para 7 tipos de toast (`ToastTipo`), cada uno con color, ícono, duración propios. `cotizacion_adjudicada` dura 8s y usa `IconTrophy`.
  - `src/components/ui/ToastContainer.tsx` *(refactorizado)* — escucha 7 CustomEvents, invoca `playNotificationSound` al recibir cada toast, máximo 4 toasts en cola.
  - `src/components/ui/PedidoStepper.tsx` *(nuevo)* — stepper horizontal 4 pasos (Abierto → En negociación → Adjudicado → Cerrado). Estado `cancelado` muestra banner rojo con observacionBaja. Texto contextual diferente por rol+estado. Exportado desde `index.ts`.
  - `src/components/ui/Chat.tsx` *(modificado)* — llama `marcarMensajesLeidos` en `useEffect([mensajes])`. Mensajes no leídos del otro lado muestran punto azul + ring.
  - `src/components/ui/index.ts` *(modificado)* — exporta `PedidoStepper`.
  - `src/components/layout/TopBar.tsx` *(modificado)* — agrega botón toggle mute (`IconBellOff`/`IconBell`) junto a notificaciones.
  - `src/router/AppRouter.tsx` *(modificado)* — suscripciones Zustand para pedidos (nuevos + cambio estado) y cotizaciones (nuevas + cambio estado); despacha CustomEvents para todos los tipos de toast.
  - `src/pages/comprador/ListaPedidosComprador.tsx` *(refactorizado)* — badge circular azul con count cotizaciones por pedido; badge "mensaje nuevo" desde `pedidosConMensajeNuevo`; modal de baja con textarea obligatoria (mínimo 10 chars, botón deshabilitado); `cancelarPedido` (PATCH, no DELETE); tooltip con `observacionBaja`; filtro "En negociación" en el select de estado.
  - `src/pages/comprador/DetallePedidoComprador.tsx` *(modificado)* — agrega `PedidoStepper`; botón "Negociar" por cotizacion pendiente; modal de confirmación de negociación; banner amber con botón "Cancelar negociación" cuando `en_negociacion`; estados `en_negociacion` en color/label maps.
  - `src/pages/proveedor/DetallePedidoProveedor.tsx` *(modificado)* — agrega `PedidoStepper`; indicador amber "Tu cotización está siendo evaluada" cuando `miCotizacionEnNegociacion`; estados `en_negociacion` en maps.

### v0.3.2 — 2026-07-01
#### Fixed
- **Loop infinito en Chat.tsx ("Maximum update depth exceeded")**: el selector de Zustand `useMensajesStore((s) => s.mensajesPorPedido[pedidoId] ?? [])` devolvía un array **nuevo** (`[]` literal) en cada render cuando el pedido todavía no tenía mensajes en el `Record`. Zustand v5 usa `useSyncExternalStore`, que compara el snapshot por referencia (`Object.is`) para decidir si re-renderizar; al recibir una referencia distinta en cada llamada, React lo detecta como "The result of getSnapshot should be cached" y entra en loop de renders hasta tirar "Maximum update depth exceeded".
  - `src/store/useMensajesStore.ts` *(modificado)* — agrega constante módulo-level `SIN_MENSAJES: MensajePedido[] = []` como referencia estable; reemplaza el `?? []` de `getMensajesDePedido` por `?? SIN_MENSAJES`.
  - `src/components/ui/Chat.tsx` *(modificado)* — mismo fix: agrega su propia constante `SIN_MENSAJES` y la usa como fallback del selector en la línea del `mensajes = useMensajesStore(...)`. Se revisaron el resto de selectores del archivo (`cargarMensajes`, `enviarMensaje`, `limpiarPedidoActivo`, `marcarMensajesLeidos`, `rol`) — todos seleccionan una acción o un primitivo ya estable, sin objetos/arrays computados inline, por lo que no requerían cambios.
  - Se verificó que no exista el mismo patrón (`Store((s) => ({...}))` o `Store((s) => ... ?? []/{}`) en el resto del código — `ChatsActivosPanel.tsx` usa `?? []` pero dentro de un `useMemo`, no dentro del selector de Zustand, así que no tiene el mismo problema.

### v0.3.1 — 2026-07-01
#### Fixed
- **Chat "global" corregido — mensajes segmentados por pedido**: existía un chat legacy (`ChatComprador`/`ChatProveedor`, rutas `/comprador/chat` y `/proveedor/chat`) que usaba un store separado (`useChatStore`, array plano en `localStorage`) y solo mostraba la *primera* orden con `chatHabilitado`, sin forma de elegir otra — el síntoma de "todos los chats muestran los mismos mensajes". Se eliminó ese camino completo y se reforzó el store por-pedido (`useMensajesStore`, ya usado por el `<Chat>` de `DetallePedido*`) para que sea la única fuente de verdad.
  - `src/store/useChatStore.ts` *(eliminado)* — store legacy basado en `ordenId` y `localStorage`.
  - `src/pages/comprador/ChatComprador.tsx`, `src/pages/proveedor/ChatProveedor.tsx` *(eliminados)* — páginas del chat global; solo mostraban la primera orden con chat habilitado, ignorando el resto.
  - `src/types/index.ts` *(modificado)* — elimina la interfaz `Mensaje` (basada en `ordenId`, sin uso); agrega `cotizacionId?: string` a `MensajePedido`.
  - `src/store/useMensajesStore.ts` *(reescrito)* — pasa de un array plano `mensajes[]` a `mensajesPorPedido: Record<string, MensajePedido[]>` con `getMensajesDePedido(pedidoId)`, `setMensajesPorPedido`, `agregarMensaje`, `setPedidoActivo`. Nueva acción `cargarTodosLosMensajes()`: trae **todos** los mensajes (`GET /mensajes`), los agrupa por `pedidoId` y dispara `mensaje-nuevo-toast` (toast + sonido, vía `ToastContainer` existente) comparando contra el snapshot previo de *cada* pedido — ya no solo el pedido abierto. `enviarMensaje` ahora acepta `cotizacionId` opcional y lo persiste en el mensaje.
  - `src/services/api.ts` *(modificado)* — agrega `getMensajes()` (GET /mensajes sin filtro, usado por el polling agrupador).
  - `src/components/ui/Chat.tsx` *(modificado)* — lee de `mensajesPorPedido[pedidoId]` en vez del array global; acepta prop `cotizacionId` y la pasa a `enviarMensaje`.
  - `src/router/AppRouter.tsx` *(modificado)* — el polling de 5s ya no restringe la sincronización de mensajes al `pedidoActivoId`; llama `cargarTodosLosMensajes()` en cada ciclo para detectar mensajes nuevos en cualquier pedido (necesario para el badge del menú de chats activos). Se eliminan las rutas `/comprador/chat` y `/proveedor/chat`.
  - `src/pages/comprador/DetallePedidoComprador.tsx`, `src/pages/proveedor/DetallePedidoProveedor.tsx` *(modificados)* — el `<Chat>` ahora recibe `cotizacionId`; se habilita también durante `en_negociacion` (antes solo aparecía con el pedido `adjudicado`, aunque la UI ya invitaba a "usar el chat" durante la negociación).
  - `src/components/layout/ChatsActivosPanel.tsx` *(nuevo)* — panel lateral "Chats activos" (mismo patrón visual que `NotificacionesPanel`): lista pedidos en `en_negociacion` o `adjudicado` con chat habilitado, mostrando el otro participante, el último mensaje truncado y un badge de no leídos por pedido (`mensajesPorPedido[pedidoId].filter(m => !m.leido && m.autorRol !== rolActual).length`). Al hacer click navega a `/comprador|proveedor/pedidos/:pedidoId`.
  - `src/components/layout/TopBar.tsx` *(modificado)* — agrega botón `IconMessage` con badge (`pedidosConMensajeNuevo.length`) que abre `ChatsActivosPanel`; quita el breadcrumb del chat viejo.
  - `src/components/layout/Sidebar.tsx` *(modificado)* — quita el ítem "Chat activo" (`/comprador/chat`, `/proveedor/chat`).
  - `src/pages/comprador/MisOrdenesComprador.tsx`, `src/pages/proveedor/MisOrdenesProveedor.tsx` *(modificados)* — el botón de chat de cada orden navega a `/comprador|proveedor/pedidos/:pedidoId` (detalle del pedido) en vez de la ruta de chat global eliminada.
  - `src/data/mockData.ts` *(modificado)* — elimina `MENSAJES_INICIALES` (dependía del tipo `Mensaje` eliminado).
  - `src/utils/constants.ts` *(modificado)* — elimina `STORAGE_KEY_MENSAJES` (sin uso tras retirar `useChatStore`).
  - `db.json` *(modificado)* — agrega 4 mensajes de prueba con `pedidoId` y `cotizacionId` sobre los dos pedidos adjudicados existentes (`ped-003`, `8JQ-AEVQceg`), incluyendo un mensaje `leido: false` en cada uno para poder validar el badge de no leídos.
  - `src/components/layout/NotificacionesPanel.tsx`, `src/components/ui/PedidoStepper.tsx` *(modificados)* — fix de errores de compilación preexistentes (`TipoNotificacion` con variantes sin ícono/color mapeado; variable `futuro` sin usar) encontrados al correr `npm run build` durante esta tarea; no relacionados al chat pero bloqueaban el build.

### v0.3.0 — 2026-06-30
#### Added
- **Chat por pedido adjudicado**: panel de mensajes en tiempo real accesible desde el detalle de pedido del comprador y del proveedor. Solo visible cuando `pedido.estado === 'adjudicado'`.
  - `db.json` *(modificado)* — agrega colección `"mensajes": []`.
  - `src/types/index.ts` *(modificado)* — agrega interfaz `MensajePedido { id, pedidoId, autorRol, autorNombre, texto, timestamp }`.
  - `src/services/api.ts` *(modificado)* — agrega `getMensajesByPedidoId(pedidoId)`, `createMensaje(data)`, `deletePedido(id)`, `deleteCotizacion(id)`.
  - `src/store/useMensajesStore.ts` *(nuevo, 46 líneas)* — store Zustand con `mensajes[]`, `pedidoActivoId`, acciones `cargarMensajes`, `enviarMensaje`, `limpiarMensajes`. `pedidoActivoId` es leído por el polling en AppRouter para sincronizar solo cuando hay chat activo.
  - `src/components/ui/Chat.tsx` *(nuevo, 97 líneas)* — panel `h-96` con scroll interno, burbujas por rol (propia: `bg-ep-blue text-white rounded-tr-sm`; otra: `bg-ep-surface border rounded-tl-sm`), auto-scroll al último mensaje via `useRef + scrollIntoView`, input con Enter para enviar, botón `IconSend`.
  - `src/components/ui/index.ts` *(modificado)* — exporta `Chat`.
  - `src/pages/comprador/DetallePedidoComprador.tsx` *(modificado)* — monta `<Chat pedidoId otroNombre>` debajo de la tabla de cotizaciones cuando el pedido está adjudicado.
  - `src/pages/proveedor/DetallePedidoProveedor.tsx` *(nuevo, 104 líneas)* — página de detalle de pedido para el proveedor: resumen del pedido, card con datos de la cotización aceptada (precio, entrega, fecha), componente `<Chat>`. Ruta: `/proveedor/pedidos/:id`.
  - `src/router/AppRouter.tsx` *(modificado)* — agrega ruta `/proveedor/pedidos/:id` → `DetallePedidoProveedor`; extiende `cargarTodo()` para llamar `cargarMensajes(pedidoActivoId)` si hay chat activo.
  - `src/pages/proveedor/MisCotizacionesProveedor.tsx` *(modificado)* — agrega link "Ver chat" para cotizaciones aceptadas → `/proveedor/pedidos/:pedidoId`.

- **Borrado de pedidos y cotizaciones** con eliminación en cascada:
  - `src/store/usePedidosStore.ts` *(modificado)* — agrega `eliminarPedido(id)`: DELETE /pedidos/:id → cascade `eliminarCotizacionesByPedidoId` → actualiza store local.
  - `src/store/useCotizacionesStore.ts` *(modificado)* — agrega `eliminarCotizacion(id)` y `eliminarCotizacionesByPedidoId(pedidoId)`: DELETE en API e iterar en cascada.
  - `src/pages/comprador/ListaPedidosComprador.tsx` *(modificado)* — columna "Acciones" con `IconTrash` + modal de confirmación que advierte del borrado en cascada de cotizaciones.
  - `src/pages/proveedor/MisCotizacionesProveedor.tsx` *(modificado)* — botón `IconTrash` debajo de cada cotización + modal de confirmación.

### v0.2.1 — 2026-06-30
#### Added
- **Toast enterprise para proveedor**: notificación visual en tiempo real cuando el polling detecta un pedido nuevo.
  - `src/components/ui/Toast.tsx` *(nuevo, 78 líneas)* — componente individual con slide-in desde la derecha, barra de progreso CSS (`border-l-4 border-ep-blue`, `shadow-lg`), auto-cierre a los 6 s y botón "Ver pedido" que navega a `/proveedor/pedidos`.
  - `src/components/ui/ToastContainer.tsx` *(nuevo, 57 líneas)* — cola de hasta 3 toasts con `useState`; escucha el `CustomEvent` `nuevo-pedido-toast` en `window`; renderizado `fixed bottom-6 right-6 z-50`.
  - `src/router/AppRouter.tsx` *(modificado)* — `usePedidosStore.subscribe` con `useRef<Set<string>>` para comparar IDs de pedidos antes/después de cada ciclo; despacha `CustomEvent` por cada pedido nuevo cuando el rol es `'proveedor'`.
  - `src/components/layout/AppShell.tsx` *(modificado)* — monta `<ToastContainer />` en el layout protegido para que esté disponible en todas las rutas.

### v0.2.0 — 2026-06-30
#### Added
- Polling automático cada 5 segundos en `AppRouter.tsx`: llama `cargarDatos()` de los 4 stores (pedidos, cotizaciones, órdenes, notificaciones) en un `setInterval` que se limpia al desmontar. Permite sincronización en tiempo real entre usuarios en red local sin recargar la página.

### v0.1.9 — 2026-06-30
#### Added
- JSON Server como backend de desarrollo (`db.json` en raíz).
- `src/services/api.ts`: capa de acceso REST con funciones `get/create/update/delete` para las 4 entidades.
- `npm run dev:full`: levanta JSON Server (puerto 3001) + Vite (5173) en paralelo vía `concurrently`.
- `.env.example` con `VITE_API_URL` para que colaboradores en red local apunten al host.
- Los 4 stores reescritos para consumir la API: `usePedidosStore`, `useCotizacionesStore`, `useOrdenesStore`, `useNotificacionesStore`.
- `cargarDatos()` en cada store; `AppRouter.tsx` los dispara al montar.

### v0.1.8 — 2026-06-30
#### Added
- Adjudicar y rechazar cotizaciones desde `DetallePedidoComprador` con modales de confirmación.
- Filtros de cotizaciones en `DetallePedidoComprador`: estado, proveedor, orden por precio.
- Banner de adjudicación verde cuando el pedido pasa a estado `adjudicado`.

### v0.1.7 — 2026-06-30
#### Added
- `ListaPedidosComprador` (`/comprador/pedidos`): tabla de mis pedidos con filtros de estado, categoría y rango de fechas.
- Filtros de historial en listas de pedidos y cotizaciones.
- Ítem "Mis pedidos" en el sidebar comprador con ícono `IconClipboardList`.
- `DetallePedidoComprador` (`/comprador/pedidos/:id`): página de detalle con información completa del pedido y tabla de cotizaciones recibidas.

### v0.1.6 — anterior
#### Added
- Autenticación cliente con `useAuthStore`, login hardcodeado y persistencia en `localStorage`.
- Stores Zustand para pedidos, cotizaciones, órdenes, notificaciones y chat con persistencia manual en `localStorage`.
- Flujo comprador completo: publicar pedido → simulador de cotizaciones → adjudicar → órdenes → chat.
- Flujo proveedor completo: pedidos disponibles → cotizar → mis cotizaciones → órdenes → chat.
- Sistema de notificaciones con badge en TopBar y panel lateral.
- Panel de notificaciones con animación slide-in.
- Cambio de rol comprador/proveedor en Sidebar.
- Dashboard comprador y proveedor con StatCards.
- Simulador de cotizaciones (`useSimuladorCotizaciones`) con delays escalonados.
