# ANTIGRAVITY.md — ElectroParts Hub
Referencia técnica densa. Leer antes de cualquier cambio. Detalles narrativos en CODEMAP.md.

---

## 1. PROYECTO
- **Nombre:** ElectroParts Hub — marketplace B2B de compras de componentes eléctricos
- **Stack:** React 19.2 · React Router 7.18 · Zustand 5.0 · TypeScript 6.0 · Vite 8.1 · Tailwind CSS 4.3 (config vía `@theme` en CSS, sin `tailwind.config.js`) · `@tailwindcss/postcss` (PostCSS plugin v4) · `@tabler/icons-react` 3.44
- **Dev deps:** oxlint 1.69 · prettier 3.8 · `@vitejs/plugin-react` 6.0 · autoprefixer 10.5
- **Repo/rama activa:** `mdemichelis`
- **Ruta local:** `c:\Proyectos\electroparts-hub`
- **Backend:** JSON Server en `db.json` (puerto 3001) · Vite en puerto 5173

---

## 2. ESTRUCTURA DE CARPETAS
```
src/
  assets/
  components/
    ui/          # Button, Badge, Card, Input, TextArea, Select, Modal,
                 # Spinner, StatCard, EmptyState, PageHeader, Chat, Toast,
                 # ToastContainer, PedidoStepper  (barrel: index.ts)
    layout/      # AppShell, Sidebar, SidebarAdmin, TopBar, NotificacionesPanel, ChatsActivosPanel
    pedidos/     # PedidoCard
    cotizaciones/# CotizacionCard, CotizacionForm
    ordenes/     # OrdenCard, OrdenStepper
    domain/      # PedidosTable, CotizacionesTable
  pages/
    comprador/   # DashboardComprador, PublicarPedido, ListaPedidosComprador,
                 # DetallePedidoComprador, MisCotizacionesComprador, MisOrdenesComprador
    proveedor/   # DashboardProveedor, PedidosDisponibles, DetallePedidoProveedor,
                 # MisCotizacionesProveedor, MisOrdenesProveedor
    admin/       # DashboardAdmin, AdminPedidos, AdminOrdenes, AdminDisputas, AdminUsuarios
  store/         # useAuthStore, usePedidosStore, useCotizacionesStore,
                 # useOrdenesStore, useMensajesStore, useNotificacionesStore
  types/         # index.ts — todos los tipos e interfaces del dominio
  data/          # mockData.ts (PEDIDOS_INICIALES, COTIZACIONES_INICIALES, ORDENES_INICIALES)
  hooks/         # useLocalStorage.ts, useSimuladorCotizaciones.ts, useNotificationSound.ts
  utils/         # constants.ts, formatters.ts, sounds.ts
  services/      # api.ts — única capa fetch del proyecto
  router/        # AppRouter.tsx
db.json          # fuente de verdad de datos (JSON Server)
```

---

## 3. ENTIDADES Y DB.JSON

**Autenticación y roles (Etapa 6)** — sin backend de auth, usuarios fijos hardcodeados en `useAuthStore.ts`:

```
type RolUsuario = 'admin' | 'comprador' | 'proveedor'
```

| Usuario | Contraseña | Rol | Acceso |
|---|---|---|---|
| admin | 123456 | admin | Panel de administración completo (`/admin/*`), solo lectura salvo resolución de disputas |
| comprador | 123456 | comprador | Vistas de comprador (`/comprador/*`) |
| proveedor | 123456 | proveedor | Vistas de proveedor (`/proveedor/*`) |

El rol queda fijado por el usuario logueado — ya no existe un toggle de rol en la UI.

**db.json collections:** `pedidos` · `cotizaciones` · `ordenes` · `notificaciones` · `mensajes`

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
resolucionDisputa?: string                         // texto de resolución cargado por el admin (Etapa 6)
resolvedBy?: string                                // 'admin' — quién resolvió la disputa (Etapa 6)
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
| useAuthStore | useAuthStore.ts | sesión + rol (localStorage `ep_auth`) | `login(usuario, password)`, `logout()` |
| usePedidosStore | usePedidosStore.ts | `Pedido[]` vía API | `cargarDatos`, `agregarPedido`, `actualizarEstadoPedido`, `incrementarCotizaciones`, `eliminarPedido`, `iniciarNegociacion`, `cancelarNegociacion`, `cancelarPedido` |
| useCotizacionesStore | useCotizacionesStore.ts | `Cotizacion[]` vía API | `cargarDatos`, `agregarCotizacion`, `aceptarCotizacion`, `rechazarCotizacion`, `iniciarNegociacionCotizacion`, `cancelarNegociacionCotizacion`, `eliminarCotizacion`, `eliminarCotizacionesByPedidoId` |
| useOrdenesStore | useOrdenesStore.ts | `Orden[]` vía API | `cargarDatos`, `agregarOrden`, `actualizarEstadoOrden`, `marcarEnPreparacion`, `marcarEnviado`, `confirmarEntrega`, `confirmarPago`, `abrirDisputa`, `cerrarOrden`, `resolverDisputa` (Etapa 6, uso admin) |
| useMensajesStore | useMensajesStore.ts | `mensajesPorPedido: Record<pedidoId, MensajePedido[]>` vía API | `cargarMensajes`, `cargarTodosLosMensajes`, `enviarMensaje`, `marcarMensajesLeidos`, `limpiarPedidoActivo` |
| useNotificacionesStore | useNotificacionesStore.ts | `Notificacion[]` vía API | `cargarDatos`, `agregarNotificacion`, `marcarLeida`, `marcarTodasLeidas`, `eliminarNotificacion`, `limpiarTodas` |

**Etapa 6 — `useRolStore` fue eliminado.** El rol vive únicamente en `useAuthStore` (`useAuthStore((s) => s.rol)`), determinado por el usuario logueado. Todos los consumidores que antes leían `useRolStore` (Sidebar, TopBar, NotificacionesPanel, ChatsActivosPanel, Chat, useMensajesStore, AppRouter) ahora leen `useAuthStore`.

Todos los stores (excepto Auth) arrancan vacíos y se pueblan con `cargarDatos()` desde `AppRouter` al montar. Auth persiste en `localStorage` sin middleware.

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
| `/admin` | DashboardAdmin | admin | métricas globales |
| `/admin/pedidos` | AdminPedidos | admin | todos los pedidos, solo lectura |
| `/admin/ordenes` | AdminOrdenes | admin | todas las órdenes, solo lectura |
| `/admin/disputas` | AdminDisputas | admin | órdenes `disputada`; única acción admin: resolver |
| `/admin/usuarios` | AdminUsuarios | admin | lista solo lectura de los 3 usuarios fijos |
| `*` | → Navigate según rol (o `/login` si no autenticado) | — | |

Chat vive dentro de `/comprador|proveedor/pedidos/:id` (componente `<Chat>`). Las rutas `/comprador/chat` y `/proveedor/chat` fueron eliminadas en v0.3.1. El admin no tiene chat ni notificaciones — esos íconos se ocultan en el `TopBar` cuando `rol === 'admin'`.

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

Comprador y proveedor comparten el componente `Sidebar.tsx`; ambos muestran arriba el usuario logueado y un badge de rol (verde/azul), y abajo un botón de logout. Ya no existe el toggle de rol.

**Admin (Etapa 6, `SidebarAdmin.tsx` — componente separado):**
- [badge ADMIN en rojo] + nombre de usuario, arriba
- Dashboard → `/admin`
- Pedidos → `/admin/pedidos`
- Órdenes → `/admin/ordenes`
- Disputas → `/admin/disputas` · badge: cantidad de disputas abiertas
- Usuarios → `/admin/usuarios`
- Logout, abajo

`AppShell.tsx` decide entre `Sidebar` y `SidebarAdmin` según `useAuthStore((s) => s.rol)`.

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
13. **Protección de rutas por rol (Etapa 6)** — `AppRouter.tsx` define un `LayoutPorRol({ rolRequerido })` por cada sección (`/admin`, `/comprador`, `/proveedor`). Si no hay sesión → redirige a `/login`. Si el rol autenticado no coincide con `rolRequerido` de esa sección → redirige a `/${rol}` (el dashboard propio del usuario), nunca deja pasar. `/login` redirige al dashboard del rol si ya hay sesión. `/` y `*` redirigen según rol (o a `/login` si no hay sesión).
14. **Polling deshabilitado para admin** — el `setInterval` de 5s en `AppRouter` chequea `useAuthStore.getState().rol` en cada tick y no vuelve a llamar `cargarDatos()` si es `'admin'`. Sí hay una carga inicial única al montar, sin importar el rol, para que el admin tenga datos al entrar.
15. **Admin de solo lectura** — todas las vistas `/admin/*` muestran datos de todos los compradores/proveedores sin acciones de negocio, excepto `AdminDisputas`, cuyo único botón ("Resolver disputa") llama `useOrdenesStore.getState().resolverDisputa(ordenId, resolucion)`, que hace `PATCH /ordenes/:id` con `{ estado: 'cerrado', resolucionDisputa, resolvedBy: 'admin' }`.

---

## 8. CONVENCIONES

- **UI:** español. Archivos, funciones y variables: inglés (convención React/TS).
- **Tailwind v4:** tokens de color en `src/index.css` con `@theme`. Prefijo `ep-*`. Nunca `gray-*`.
- **Estado global:** Zustand. `useState` solo para estado de UI local.
- **Persistencia:** Auth y Rol en `localStorage` manual. El resto vía API (JSON Server).
- **Selector Zustand estable:**
  ```ts
  const SIN_MENSAJES: MensajePedido[] = []; // módulo-level
  const mensajes = useMensajesStore((s) => s.mensajesPorPedido[pedidoId] ?? SIN_MENSAJES);
  const enviar = useMensajesStore((s) => s.enviarMensaje); // campo por campo
  ```
- **Fechas:** ISO 8601 strings. Formatear con `formatters.ts`.
- **Moneda:** pesos argentinos. `font-mono` para precios e IDs en UI.
- **API base URL:** `VITE_API_URL` (default `http://localhost:3001`). Definida en `.env.local`.
- **Componentes:** un archivo por componente. Export nombrado para reutilizables, default para páginas.
- **Props:** siempre tipadas con `interface NombreComponenteProps`.
- **Llamar otros stores desde una action:** `useOtroStore.getState().accion()`.

---

## 9. COMANDOS ÚTILES

```bash
npm run dev        # Solo Vite (puerto 5173) — requiere JSON Server corriendo aparte
npm run dev:full   # JSON Server (3001) + Vite (5173) en paralelo con concurrently
npm run build      # tsc -b && vite build
npm run lint       # oxlint

git checkout db.json          # resetear datos al estado inicial
git push origin mdemichelis   # push a rama de trabajo
```
