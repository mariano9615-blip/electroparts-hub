# ANTIGRAVITY.md — ElectroParts Hub
Referencia técnica densa. Leer antes de cualquier cambio. Detalles narrativos en CODEMAP.md.

---

## 1. PROYECTO
- **Nombre:** ElectroParts Hub — marketplace B2B de compras de componentes eléctricos
- **Stack:** React 19.2 · React Router 7.18 · Zustand 5.0 · TypeScript 6.0 · Vite 8.1 · Tailwind CSS 4.3 (config vía `@theme` en CSS, sin `tailwind.config.js`) · `@tailwindcss/postcss` (PostCSS plugin v4) · `@tabler/icons-react` 3.44
- **Dev deps:** oxlint 1.69 · prettier 3.8 · `@vitejs/plugin-react` 6.0 · autoprefixer 10.5
- **Repo/rama activa:** `electroparts-bd` (creada desde `fchiotti` para migrar a MySQL + deploy Vercel)
- **Ruta local:** `c:\Proyectos\electroparts-hub`
- **Backend (desde electroparts-bd):** funciones serverless de Vercel en `/api/*` (Node, TypeScript) · Prisma 6 como ORM · MySQL como base de datos · Vite sirve el frontend
- **Backend (histórico, ramas anteriores a electroparts-bd):** JSON Server sobre `db.json` (puerto 3001) — reemplazado por completo, ya no se usa

---

## 2. ESTRUCTURA DE CARPETAS
```
api/             # Funciones serverless de Vercel (backend real, reemplaza a JSON Server)
  _db.ts         # Cliente Prisma singleton (patrón cacheado en globalThis para serverless)
  _utils.ts      # sendJson, methodNotAllowed, handleError — helpers compartidos
  health.ts      # GET /api/health — chequea conexión a MySQL
  pedidos/       # index.ts (GET/POST /api/pedidos), [id].ts (GET/PATCH/DELETE /api/pedidos/:id)
  cotizaciones/  # index.ts (GET ?pedidoId=/POST), [id].ts (PATCH/DELETE)
  ordenes/       # index.ts (GET/POST), [id].ts (PATCH)
  notificaciones/# index.ts (GET/POST), [id].ts (PATCH/DELETE)
  mensajes/      # index.ts (GET ?pedidoId=/POST), [id].ts (PATCH)
prisma/
  schema.prisma  # Modelos: Pedido, Cotizacion, Orden, MensajePedido, Notificacion (+ enums)
  seed.ts        # Importa db.json a MySQL — `npm run db:seed`
src/
  assets/
  components/
    ui/          # Button, Badge, Card, Input, TextArea, Select, Modal,
                 # Spinner, StatCard, EmptyState, PageHeader, Chat, Toast,
                 # ToastContainer, PedidoStepper  (barrel: index.ts)
    layout/      # AppShell, Sidebar, TopBar, NotificacionesPanel, ChatsActivosPanel
    pedidos/     # PedidoCard
    cotizaciones/# CotizacionCard, CotizacionForm
    ordenes/     # OrdenCard, OrdenStepper
    domain/      # PedidosTable, CotizacionesTable
  pages/
    comprador/   # DashboardComprador, PublicarPedido, ListaPedidosComprador,
                 # DetallePedidoComprador, MisCotizacionesComprador, MisOrdenesComprador
    proveedor/   # DashboardProveedor, PedidosDisponibles, DetallePedidoProveedor,
                 # MisCotizacionesProveedor, MisOrdenesProveedor
  store/         # useAuthStore, useRolStore, usePedidosStore, useCotizacionesStore,
                 # useOrdenesStore, useMensajesStore, useNotificacionesStore
  types/         # index.ts — todos los tipos e interfaces del dominio
  data/          # mockData.ts (PEDIDOS_INICIALES, COTIZACIONES_INICIALES, ORDENES_INICIALES)
  hooks/         # useLocalStorage.ts, useSimuladorCotizaciones.ts, useNotificationSound.ts
  utils/         # constants.ts, formatters.ts, sounds.ts
  services/      # api.ts — única capa fetch del proyecto, pega contra /api/*
  router/        # AppRouter.tsx
db.json          # YA NO se sirve en runtime. Solo fuente de datos para `npm run db:seed`
vercel.json      # rewrites SPA + config de build para Vercel
tsconfig.api.json # tipa api/ y prisma/seed.ts (module: esnext, moduleResolution: bundler — igual que Vite, porque Vercel empaqueta cada función con esbuild)
```

---

## 3. ENTIDADES Y BASE DE DATOS

Fuente de verdad: `prisma/schema.prisma` (MySQL). Los mismos campos existían antes en
`db.json` (JSON Server) — la migración fue 1:1, ver CHANGELOG v0.6.0.

**Tablas:** `Pedido` · `Cotizacion` · `Orden` · `MensajePedido` · `Notificacion`

**Pedido**
```
id: string               compradorId: string        titulo: string
descripcion: string      cantidad: number           unidad: string
categoria: string        presupuestoMax?: number    fechaLimite: string (ISO)
estado: EstadoPedido     cotizacionesRecibidas: number
fechaCreacion: string (ISO)
cotizacionEnNegociacionId?: string   observacionBaja?: string   fechaBaja?: string (ISO)
```

**Cotizacion**
```
id: string        pedidoId: string       proveedorId: string     proveedorNombre: string
precio: number    tiempoEntrega: string  notas?: string          calificacionProveedor: number
estado: EstadoCotizacion                fechaCreacion: string (ISO)
```

**Orden**
```
id: string              pedidoId: string | null    cotizacionId: string    compradorId: string
proveedorId: string     proveedorNombre: string    monto: number
estado: EstadoOrden     fechaConfirmacion: string (ISO)
chatHabilitado: boolean
estadoPago: EstadoPago                             // default: 'pendiente' al crear orden
numeroSeguimiento?: string                         // cargado por proveedor al marcar enviado
fechaEnvio?: string (ISO)                          // seteado al marcar enviado
fechaEntrega?: string (ISO)                        // seteado al confirmar entrega
comprobantePago?: string                           // texto libre: número de transferencia, CBU, etc.
fechaPagoConfirmado?: string (ISO)                 // seteado al confirmar pago
observacionDisputa?: string                        // texto de la disputa abierta por el comprador
```

**MensajePedido**
```
id: string        pedidoId: string    cotizacionId?: string
autorRol: 'comprador'|'proveedor'     autorNombre: string
texto: string     timestamp: string (ISO)               leido?: boolean
```

**Notificacion**
```
id: string   tipo: TipoNotificacion   titulo: string   mensaje: string
fecha: string (ISO)    leida: boolean   rolDestino: 'comprador'|'proveedor'   entidadId?: string
```

**Tipos de estado**
- `EstadoPedido`: `'abierto' | 'en_cotizacion' | 'en_negociacion' | 'adjudicado' | 'cancelado'`
- `EstadoCotizacion`: `'pendiente' | 'en_negociacion' | 'aceptada' | 'rechazada'`
- `EstadoOrden`: `'confirmada' | 'en_preparacion' | 'enviado' | 'entregado' | 'cerrado' | 'disputada'`
- `EstadoPago`: `'pendiente' | 'en_proceso' | 'confirmado'`
- `TipoNotificacion`: `'nueva_cotizacion' | 'pedido_adjudicado' | 'orden_confirmada' | 'nueva_orden' | 'cotizacion_aceptada' | 'cotizacion_en_negociacion' | 'cotizacion_rechazada' | 'mensaje_nuevo' | 'estado_pedido_cambio' | 'orden_en_preparacion' | 'orden_enviada' | 'orden_entregada' | 'orden_pago_confirmado' | 'orden_cerrada' | 'orden_disputada'`

---

## 4. CICLO DE VIDA DEL PEDIDO

> Nota: todos los endpoints de esta sección y la 4b tienen prefijo `/api/` desde
> `electroparts-bd` (ej. `PATCH /pedidos/:id` → `PATCH /api/pedidos/:id`). El verbo y el
> payload no cambiaron — solo el prefijo, porque ahora responden funciones serverless
> (Prisma + MySQL) en vez de JSON Server. Ver `api/` en la sección 2 y CHANGELOG v0.6.0.

```
abierto → en_cotizacion → en_negociacion → adjudicado
abierto → cancelado  (desde cualquier estado no-adjudicado)
```

| Transición | Quién | Endpoint |
|---|---|---|
| `abierto → en_cotizacion` | automático al recibir 1ª cotización | `PATCH /pedidos/:id` |
| `en_cotizacion → en_negociacion` | comprador (botón "Negociar") | `PATCH /pedidos/:id` + `PATCH /cotizaciones/:id` |
| `en_negociacion → abierto` | comprador (botón "Cancelar negociación") | `PATCH /pedidos/:id` + `PATCH /cotizaciones/:id` |
| `en_negociacion → adjudicado` | comprador (botón "Adjudicar") | `PATCH /pedidos/:id` · `PATCH /cotizaciones/:id` ×N · `POST /ordenes` |
| `en_cotizacion → adjudicado` | comprador (botón "Adjudicar") | ídem fila anterior |
| `* → cancelado` | comprador (modal con observación ≥10 chars) | `PATCH /pedidos/:id` con `{estado, observacionBaja, fechaBaja}` |

## 4b. CICLO DE VIDA DE LA ORDEN

```
confirmada → en_preparacion → enviado → entregado → cerrado
* → disputada  (comprador, desde cualquier estado antes de entregado)
entregado + estadoPago=confirmado → cerrado  (automático)
```

| Transición | Quién | Endpoint | Condición |
|---|---|---|---|
| `confirmada → en_preparacion` | proveedor (botón) | `PATCH /ordenes/:id` | — |
| `en_preparacion → enviado` | proveedor (modal, tracking opcional) | `PATCH /ordenes/:id` con `{estado, numeroSeguimiento?, fechaEnvio}` | — |
| `enviado → entregado` | comprador (modal de confirmación) | `PATCH /ordenes/:id` con `{estado, fechaEntrega}` | — |
| `entregado → cerrado` | automático | `PATCH /ordenes/:id` | `estadoPago === 'confirmado'` al confirmar entrega, o entregado al confirmar pago |
| `estadoPago: pendiente → confirmado` | proveedor (modal, comprobante opcional) | `PATCH /ordenes/:id` con `{estadoPago, comprobantePago?, fechaPagoConfirmado}` | — |
| `* → disputada` | comprador (modal, observación ≥20 chars) | `PATCH /ordenes/:id` con `{estado, observacionDisputa}` | estado ∈ {confirmada, en_preparacion, enviado} |

---

## 5. STORES ZUSTAND

| Store | Archivo | Qué maneja | Acciones principales |
|---|---|---|---|
| useAuthStore | useAuthStore.ts | sesión (localStorage `ep_auth`) | `login()`, `logout()` |
| useRolStore | useRolStore.ts | rol activo (localStorage `ep_rol`) | `setRol()` |
| usePedidosStore | usePedidosStore.ts | `Pedido[]` vía API | `cargarDatos`, `agregarPedido`, `actualizarEstadoPedido`, `incrementarCotizaciones`, `eliminarPedido`, `iniciarNegociacion`, `cancelarNegociacion`, `cancelarPedido` |
| useCotizacionesStore | useCotizacionesStore.ts | `Cotizacion[]` vía API | `cargarDatos`, `agregarCotizacion`, `aceptarCotizacion`, `rechazarCotizacion`, `iniciarNegociacionCotizacion`, `cancelarNegociacionCotizacion`, `eliminarCotizacion`, `eliminarCotizacionesByPedidoId` |
| useOrdenesStore | useOrdenesStore.ts | `Orden[]` vía API | `cargarDatos`, `agregarOrden`, `actualizarEstadoOrden`, `marcarEnPreparacion`, `marcarEnviado`, `confirmarEntrega`, `confirmarPago`, `abrirDisputa`, `cerrarOrden` |
| useMensajesStore | useMensajesStore.ts | `mensajesPorPedido: Record<pedidoId, MensajePedido[]>` vía API | `cargarMensajes`, `cargarTodosLosMensajes`, `enviarMensaje`, `marcarMensajesLeidos`, `limpiarPedidoActivo` |
| useNotificacionesStore | useNotificacionesStore.ts | `Notificacion[]` vía API | `cargarDatos`, `agregarNotificacion`, `marcarLeida`, `marcarTodasLeidas`, `eliminarNotificacion`, `limpiarTodas` |

Todos los stores (excepto Auth y Rol) arrancan vacíos y se pueblan con `cargarDatos()` desde `AppRouter` al montar. Auth y Rol persisten en `localStorage` sin middleware.

---

## 6. RUTAS

| Ruta | Componente | Rol | Nota |
|---|---|---|---|
| `/login` | Login | — | |
| `/` | → Navigate `/comprador` | — | |
| `/comprador` | DashboardComprador | comprador | |
| `/comprador/publicar` | PublicarPedido | comprador | |
| `/comprador/pedidos` | ListaPedidosComprador | comprador | soporta `?tab=` |
| `/comprador/pedidos/:id` | DetallePedidoComprador | comprador | |
| `/comprador/cotizaciones-recibidas` | MisCotizacionesComprador | comprador | |
| `/comprador/mis-compras` | MisOrdenesComprador | comprador | |
| `/comprador/cotizaciones` | → `/comprador/cotizaciones-recibidas` | — | redirect |
| `/comprador/ordenes` | → `/comprador/mis-compras` | — | redirect |
| `/proveedor` | DashboardProveedor | proveedor | |
| `/proveedor/explorar` | PedidosDisponibles | proveedor | |
| `/proveedor/pedidos/:id` | DetallePedidoProveedor | proveedor | |
| `/proveedor/cotizaciones` | MisCotizacionesProveedor | proveedor | |
| `/proveedor/mis-ventas` | MisOrdenesProveedor | proveedor | |
| `/proveedor/pedidos` | → `/proveedor/explorar` | — | redirect |
| `/proveedor/ordenes` | → `/proveedor/mis-ventas` | — | redirect |
| `*` | → Navigate `/comprador` | — | |

Chat vive dentro de `/comprador|proveedor/pedidos/:id` (componente `<Chat>`). Las rutas `/comprador/chat` y `/proveedor/chat` fueron eliminadas en v0.3.1.

## 6b. TERMINOLOGÍA UI vs VALORES INTERNOS

Los valores internos del store y db.json NO cambian. Solo cambia el texto visible.

| Estado interno | Rol | Label UI |
|---|---|---|
| `pedido.estado = 'adjudicado'` | comprador | "Comprado" |
| `pedido.estado = 'adjudicado'` | proveedor | "Vendido" |
| `cotizacion.estado = 'aceptada'` | comprador | "Aceptada" |
| `cotizacion.estado = 'aceptada'` | proveedor | "Ganada" |
| `orden.estado = 'confirmada'` | ambos | "Confirmada" |
| `orden.estado = 'en_preparacion'` | comprador | "En preparación" |
| `orden.estado = 'en_preparacion'` | proveedor | "Preparando pedido" |
| `orden.estado = 'enviado'` | comprador | "En camino" |
| `orden.estado = 'enviado'` | proveedor | "Enviado" |
| `orden.estado = 'entregado'` | comprador | "Recibido" |
| `orden.estado = 'entregado'` | proveedor | "Entregado" |
| `orden.estado = 'cerrado'` | ambos | "Cerrado" |
| `orden.estado = 'disputada'` | ambos | "En disputa" |
| `orden.estadoPago = 'pendiente'` | ambos | "Pago pendiente" |
| `orden.estadoPago = 'en_proceso'` | ambos | "Pago en proceso" |
| `orden.estadoPago = 'confirmado'` | ambos | "Pago confirmado" |
| Botón acción | comprador | "Confirmar compra" (antes "Adjudicar") |
| Banner post-compra | comprador | "Compra confirmada con [proveedor]" |
| Toast cotización ganada | proveedor | "¡Ganaste la venta! [nombre pedido]" |
| Toast compra comprador | comprador | "Compra confirmada para [nombre pedido]" |

Helper functions en `src/utils/formatters.ts`: `getLabelEstadoPedido(estado, rol)`, `getLabelEstadoCotizacion(estado, rol)`, `getLabelEstadoOrden(estado, rol)`, `getLabelEstadoPago(estado)`.

## 6c. SIDEBAR — ESTRUCTURA POR ROL

**Comprador:**
- Dashboard → `/comprador`
- [Botón destacado verde] Publicar pedido → `/comprador/publicar`
- [separador "MIS VISTAS"]
- Mis pedidos → `/comprador/pedidos` · badge: pedidos abierto|en_negociacion
- Cotizaciones recibidas → `/comprador/cotizaciones-recibidas` · badge: cotizaciones pendiente
- Mis compras → `/comprador/mis-compras`

**Proveedor:**
- Dashboard → `/proveedor`
- [separador "MIS VISTAS"]
- Explorar pedidos → `/proveedor/explorar` · badge: pedidos disponibles
- Mis cotizaciones → `/proveedor/cotizaciones` · badge: cotizaciones en_negociacion
- Mis ventas → `/proveedor/mis-ventas`

---

## 7. REGLAS DE NEGOCIO CRÍTICAS

1. **Rechazar una cotización no toca las demás** — `rechazarCotizacion()` solo parchea esa cotización; adjudicar sí pone todas las demás en `rechazada`.
2. **`aceptarCotizacion()` es transacción** — marca aceptada, rechaza el resto del pedido, crea Orden, actualiza estado del pedido a `adjudicado`. Todo en cascada dentro del store.
3. **`eliminarPedido()` es cascade** — DELETE pedido → DELETE todas sus cotizaciones.
4. **Cancelar pedido es PATCH, no DELETE** — guarda `observacionBaja` y `fechaBaja`; el pedido queda visible con estado `cancelado`.
5. **Selectores Zustand: nunca objetos ni arrays inline** — `useMensajesStore((s) => s.campo ?? [])` crea referencia nueva en cada render → loop infinito. Usar constante módulo-level estable: `const SIN_MENSAJES: MensajePedido[] = []`. Ver fix de v0.3.2.
6. **Tampoco agrupar campos en un selector** — `(s) => ({ a: s.a, b: s.b })` crea objeto nuevo en cada snapshot. Usar un hook por campo.
7. **`cargarTodosLosMensajes()` es el polling global** — trae GET /mensajes (sin filtro), agrupa por `pedidoId`, compara contra snapshot previo para detectar nuevos mensajes. Primera vez que ve un `pedidoId` no dispara toast (baseline).
8. **Ids demo fijos** — `COMPRADOR_ID = 'comprador-demo-001'`; `PROV_IDS = ['prov-1','prov-2','prov-3','prov-4','prov-demo-001']`. Proveedor logueado: `'prov-demo-001'`.
9. **Chat habilitado** — `chatHabilitado: true` en db.json; visible en órdenes `en_negociacion`, `adjudicado`, `enviado`, `entregado`, `cerrado`. Solo navega al chat si `pedidoId` no es null.
10. **Polling cada 5s en AppRouter** — llama `cargarDatos()` de los 4 stores + `cargarTodosLosMensajes()`. Suscripciones Zustand despachan CustomEvents para toasts.
11. **Cierre automático de orden** — `cerrarOrden()` se llama automáticamente desde `confirmarEntrega()` si `estadoPago === 'confirmado'`, y desde `confirmarPago()` si `orden.estado === 'entregado'`.
12. **`estadoPago` tiene fallback** — órdenes sin el campo usan `?? 'pendiente'` como default para compatibilidad con datos pre-etapa-5a.

---

## 8. CONVENCIONES

- **UI:** español. Archivos, funciones y variables: inglés (convención React/TS).
- **Tailwind v4:** tokens de color en `src/index.css` con `@theme`. Prefijo `ep-*`. Nunca `gray-*`.
- **Estado global:** Zustand. `useState` solo para estado de UI local.
- **Persistencia:** Auth y Rol en `localStorage` manual (sesión de cliente, no es dato de negocio). El resto vía `/api/*` (Prisma + MySQL).
- **Selector Zustand estable:**
  ```ts
  const SIN_MENSAJES: MensajePedido[] = []; // módulo-level
  const mensajes = useMensajesStore((s) => s.mensajesPorPedido[pedidoId] ?? SIN_MENSAJES);
  const enviar = useMensajesStore((s) => s.enviarMensaje); // campo por campo
  ```
- **Fechas:** ISO 8601 strings. Formatear con `formatters.ts`.
- **Moneda:** pesos argentinos. `font-mono` para precios e IDs en UI.
- **API base URL:** `VITE_API_URL` (default `/api`, mismo origen). Solo se define si frontend y backend viven en dominios distintos.
- **DB connection:** `DATABASE_URL` (server-side, usada por Prisma en `api/_db.ts` y `prisma/seed.ts`) — nunca se expone al cliente, va en `.env`/env vars de Vercel, no en `VITE_*`.
- **Componentes:** un archivo por componente. Export nombrado para reutilizables, default para páginas.
- **Props:** siempre tipadas con `interface NombreComponenteProps`.
- **Llamar otros stores desde una action:** `useOtroStore.getState().accion()`.

---

## 9. COMANDOS ÚTILES

```bash
npm run dev        # vercel dev — Vite + funciones /api en el mismo origen (requiere DATABASE_URL en .env)
npm run dev:vite   # Solo Vite, sin backend — las llamadas a /api van a fallar
npm run build      # tsc -b && vite build
npm run lint       # oxlint

npm run db:push    # aplica prisma/schema.prisma a MySQL (crea/actualiza tablas)
npm run db:seed    # importa db.json a MySQL (datos de ejemplo)
npm run db:studio  # Prisma Studio — explorador visual de la base

git push origin electroparts-bd   # push a la rama de trabajo
```
