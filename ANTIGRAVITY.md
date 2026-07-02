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

**Autenticación y roles (Etapa 6b)** — usuarios persistidos en `db.json` (colección `usuarios`), contraseñas hasheadas con `bcryptjs`. `useAuthStore.login()` valida contra `usuariosApi.validateCredentials()`:

```
type RolUsuario = 'admin' | 'comprador' | 'proveedor'
```

| Usuario | Contraseña | Rol | Acceso |
|---|---|---|---|
| admin | 123456 | admin | Panel de administración completo (`/admin/*`), solo lectura salvo resolución de disputas y ABM de usuarios |
| comprador | 123456 | comprador | Vistas de comprador (`/comprador/*`) |
| proveedor | 123456 | proveedor | Vistas de proveedor (`/proveedor/*`) |

El rol queda fijado por el usuario logueado — no existe un toggle de rol en la UI. El admin es supervisor total de usuarios (`/admin/usuarios`): crea, edita, cambia contraseña, activa/desactiva y elimina comprador/proveedor. El admin no se puede crear desde el panel y no puede ser eliminado ni desactivado (validado en `useUsuariosStore` y en la UI).

**Usuario**
```
id: string             usuario: string          passwordHash: string
rol: RolUsuario         nombre: string           empresa?: string
activo: boolean         fechaCreacion: string (ISO)   ultimaModificacion: string (ISO)
```
`passwordHash` nunca sale de `src/services/api.ts` hacia componentes o el store `useUsuariosStore` (que tipa su array como `Omit<Usuario, 'passwordHash'>[]`). `usuariosApi.validateCredentials()` es la única función que compara el hash (vía `bcrypt.compare`) y también devuelve el usuario sin `passwordHash`, usado directamente por `useAuthStore`.

**db.json collections:** `usuarios` · `pedidos` · `cotizaciones` · `ordenes` · `notificaciones` · `mensajes` · `calificaciones`

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
calificacionId?: string                            // referencia a la Calificacion creada (Etapa 7)
calificado?: boolean                               // true una vez que el comprador calificó (Etapa 7, default false)
```

**Calificacion (Etapa 7)**
```
id: string           ordenId: string        pedidoId: string
compradorId: string  proveedorId: string    proveedorNombre: string
estrellas: number    // 1 a 5
comentario?: string  // opcional, máximo 300 caracteres
fechaCreacion: string (ISO)
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
- `TipoNotificacion`: `'nueva_cotizacion' | 'pedido_adjudicado' | 'orden_confirmada' | 'nueva_orden' | 'cotizacion_aceptada' | 'cotizacion_en_negociacion' | 'cotizacion_rechazada' | 'mensaje_nuevo' | 'estado_pedido_cambio' | 'orden_en_preparacion' | 'orden_enviada' | 'orden_entregada' | 'orden_pago_confirmado' | 'orden_cerrada' | 'orden_disputada' | 'calificacion_recibida'`

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
| `calificado: false → true` | comprador (modal de calificación) | `POST /calificaciones` + `PATCH /ordenes/:id` con `{calificado, calificacionId}` + `PATCH /cotizaciones/:id` con `{calificacionProveedor}` | `estado === 'cerrado'` (Etapa 7) |

Calificación (Etapa 7) — paso final y opcional del ciclo, no bloquea ni transiciona el `estado` de la orden. Solo el comprador puede calificar, una única vez por orden (`orden.calificado !== true`), solo cuando `orden.estado === 'cerrado'`. Ver regla 18 en la sección 7.

---

## 5. STORES ZUSTAND

| Store | Archivo | Qué maneja | Acciones principales |
|---|---|---|---|
| useAuthStore | useAuthStore.ts | sesión + rol + nombre (localStorage `ep_auth`) | `login(usuario, password)` — async, valida contra `usuariosApi.validateCredentials`; `logout()` |
| useUsuariosStore | useUsuariosStore.ts | `Omit<Usuario, 'passwordHash'>[]` vía API — ABM enterprise | `cargarUsuarios`, `crearUsuario`, `editarUsuario`, `cambiarPassword`, `toggleActivo`, `eliminarUsuario` |
| usePedidosStore | usePedidosStore.ts | `Pedido[]` vía API | `cargarDatos`, `agregarPedido`, `actualizarEstadoPedido`, `incrementarCotizaciones`, `eliminarPedido`, `iniciarNegociacion`, `cancelarNegociacion`, `cancelarPedido` |
| useCotizacionesStore | useCotizacionesStore.ts | `Cotizacion[]` vía API | `cargarDatos`, `agregarCotizacion`, `aceptarCotizacion`, `rechazarCotizacion`, `iniciarNegociacionCotizacion`, `cancelarNegociacionCotizacion`, `eliminarCotizacion`, `eliminarCotizacionesByPedidoId` |
| useOrdenesStore | useOrdenesStore.ts | `Orden[]` vía API | `cargarDatos`, `agregarOrden`, `actualizarEstadoOrden`, `marcarEnPreparacion`, `marcarEnviado`, `confirmarEntrega`, `confirmarPago`, `abrirDisputa`, `cerrarOrden`, `resolverDisputa` (Etapa 6, uso admin) |
| useMensajesStore | useMensajesStore.ts | `mensajesPorPedido: Record<pedidoId, MensajePedido[]>` vía API | `cargarMensajes`, `cargarTodosLosMensajes`, `enviarMensaje`, `marcarMensajesLeidos`, `limpiarPedidoActivo` |
| useNotificacionesStore | useNotificacionesStore.ts | `Notificacion[]` vía API | `cargarDatos`, `agregarNotificacion`, `marcarLeida`, `marcarTodasLeidas`, `eliminarNotificacion`, `limpiarTodas` |
| useCalificacionesStore | useCalificacionesStore.ts | `Calificacion[]` vía API (Etapa 7) | `cargarCalificaciones`, `crearCalificacion`; selectores derivados `getCalificacionesByProveedor(proveedorId)`, `getPromedioProveedor(proveedorId)` (retorna `null` sin calificaciones), `getCalificacionByOrden(ordenId)` — leen `get()` sobre el estado actual, no hacen fetch |

**Etapa 6 — `useRolStore` fue eliminado.** El rol vive únicamente en `useAuthStore` (`useAuthStore((s) => s.rol)`), determinado por el usuario logueado. Todos los consumidores que antes leían `useRolStore` (Sidebar, TopBar, NotificacionesPanel, ChatsActivosPanel, Chat, useMensajesStore, AppRouter) ahora leen `useAuthStore`.

Todos los stores (excepto Auth) arrancan vacíos y se pueblan con `cargarDatos()` desde `AppRouter` al montar. Auth persiste en `localStorage` sin middleware. `useUsuariosStore` no persiste en `localStorage` — su única fuente de verdad es `db.json` vía `usuariosApi`; se carga con `cargarUsuarios()` dentro de `AdminUsuarios.tsx` (no forma parte del polling global de `AppRouter`).

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
| `/admin/usuarios` | AdminUsuarios | admin | ABM enterprise: alta, edición, cambio de contraseña, activar/desactivar, eliminar |
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
15. **Admin de solo lectura salvo excepciones** — todas las vistas `/admin/*` muestran datos de todos los compradores/proveedores sin acciones de negocio, excepto `AdminDisputas` (botón "Resolver disputa" → `useOrdenesStore.getState().resolverDisputa()`) y `AdminUsuarios` (ABM completo de usuarios vía `useUsuariosStore`).
16. **Protección del usuario admin (Etapa 6b)** — el usuario con `rol === 'admin'` no puede ser eliminado ni desactivado bajo ninguna circunstancia. Se valida en dos capas: `useUsuariosStore.eliminarUsuario()` y `toggleActivo()` no-opean con `console.warn` si el target es admin; y en `AdminUsuarios.tsx` los íconos de eliminar y el badge de estado quedan `disabled` con tooltip "El administrador no puede ser eliminado ni desactivado". El admin tampoco se puede crear desde el panel — el `Select` de rol del formulario de alta solo ofrece `comprador`/`proveedor`.
17. **`passwordHash` nunca sale de la capa de servicios hacia el store** — `src/services/api.ts` (`usuariosApi.getAll/getById/create/update`) puede devolver el objeto `Usuario` completo (incluye `passwordHash`), pero `useUsuariosStore` lo omite siempre al guardar en su estado (`const { passwordHash, ...usuarioSeguro } = usuario`), por lo que ningún componente accede a él. `usuariosApi.validateCredentials()` es la única función que lee `passwordHash` para comparar con `bcrypt.compare()`, y devuelve el usuario ya sin ese campo.
18. **Calificaciones: una por orden, solo el comprador (Etapa 7)** — el trigger "Calificar proveedor" solo aparece si `rol === 'comprador' && orden.estado === 'cerrado' && orden.calificado !== true`; una vez calificada, `orden.calificado` queda en `true` y el botón se reemplaza por el badge con `StarRating`. Se valida en la UI (`OrdenCard`/`MisOrdenesComprador`) y no hay endpoint ni acción de store para que el proveedor o el admin creen o borren calificaciones — el admin solo las lee (columna en `AdminUsuarios`, StatCard en `DashboardAdmin`).

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

---

## 10. MIGRACIÓN SUPABASE

`src/services/api.ts` es la única capa de acceso a datos del proyecto — ningún componente ni store hace `fetch` directo. Esto hace que migrar de JSON Server a Supabase sea un reemplazo de implementación, no un cambio de interfaz.

**Contrato de `usuariosApi`** (firmas estables, no cambian con la migración):
```ts
export const usuariosApi = {
  getAll: () => Promise<Usuario[]>
  getById: (id: string) => Promise<Usuario | null>
  getByUsuario: (usuario: string) => Promise<Usuario | null>
  create: (data: Omit<Usuario, 'id' | 'fechaCreacion' | 'ultimaModificacion'>) => Promise<Usuario>
  update: (id: string, data: Partial<Usuario>) => Promise<Usuario>
  delete: (id: string) => Promise<void>
  validateCredentials: (usuario: string, password: string) => Promise<Omit<Usuario, 'passwordHash'> | null>
}
```

**Patrón de reemplazo:**
1. Solo se reescribe el cuerpo de cada función en `src/services/api.ts` (y de las demás funciones de la misma capa: `getPedidos`, `updateOrden`, etc.) usando el cliente de Supabase (`supabase.from('usuarios').select()...`); las firmas y los tipos de retorno no cambian.
2. Los IDs siguen siendo `string` (JSON Server usa strings arbitrarios, Supabase usa UUID strings) — ningún consumidor asume un formato concreto.
3. Los timestamps siguen siendo ISO 8601 strings — formato nativo de las columnas `timestamptz` de Supabase.
4. `passwordHash` deja de calcularse/compararse en el cliente con `bcryptjs` y pasa a resolverse del lado del servidor (Supabase Auth o una Edge Function) — es el único punto donde el cuerpo de `validateCredentials` cambia de forma no trivial; su firma (`Promise<Omit<Usuario, 'passwordHash'> | null>`) se mantiene igual para no tocar `useAuthStore`.
5. Los stores (`useUsuariosStore`, `useAuthStore`) no requieren cambios: siguen llamando a `usuariosApi.*` con `try/catch` y actualizando su estado local con la respuesta.

**Contrato de `calificacionesApi`** (Etapa 7, firmas estables, no cambian con la migración):
```ts
export const calificacionesApi = {
  getAll: () => Promise<Calificacion[]>
  getByProveedor: (proveedorId: string) => Promise<Calificacion[]>
  getByOrden: (ordenId: string) => Promise<Calificacion | null>
  create: (data: Omit<Calificacion, 'id' | 'fechaCreacion'>) => Promise<Calificacion>
}
```
Sigue el mismo patrón que `usuariosApi`: mismo comentario `// SUPABASE MIGRATION` encima del objeto, mismo reemplazo de cuerpo por `supabase.from('calificaciones').select()...` sin tocar firmas ni el store `useCalificacionesStore`.
