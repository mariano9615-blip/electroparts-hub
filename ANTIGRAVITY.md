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
    layout/      # AppShell, Sidebar, TopBar, NotificacionesPanel, ChatsActivosPanel
    pedidos/     # PedidoCard
    cotizaciones/# CotizacionCard, CotizacionForm
    ordenes/     # OrdenCard
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
  services/      # api.ts — única capa fetch del proyecto
  router/        # AppRouter.tsx
db.json          # fuente de verdad de datos (JSON Server)
```

---

## 3. ENTIDADES Y DB.JSON

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
id: string        pedidoId: string    cotizacionId: string    compradorId: string
proveedorId: string                   proveedorNombre: string monto: number
estado: EstadoOrden                   fechaConfirmacion: string (ISO)
chatHabilitado: boolean
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
- `EstadoOrden`: `'confirmada' | 'en_transito' | 'entregada' | 'disputada'`
- `TipoNotificacion`: `'nueva_cotizacion' | 'pedido_adjudicado' | 'orden_confirmada' | 'nueva_orden' | 'cotizacion_aceptada' | 'cotizacion_en_negociacion' | 'cotizacion_rechazada' | 'mensaje_nuevo' | 'estado_pedido_cambio'`

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

---

## 5. STORES ZUSTAND

| Store | Archivo | Qué maneja | Acciones principales |
|---|---|---|---|
| useAuthStore | useAuthStore.ts | sesión (localStorage `ep_auth`) | `login()`, `logout()` |
| useRolStore | useRolStore.ts | rol activo (localStorage `ep_rol`) | `setRol()` |
| usePedidosStore | usePedidosStore.ts | `Pedido[]` vía API | `cargarDatos`, `agregarPedido`, `actualizarEstadoPedido`, `incrementarCotizaciones`, `eliminarPedido`, `iniciarNegociacion`, `cancelarNegociacion`, `cancelarPedido` |
| useCotizacionesStore | useCotizacionesStore.ts | `Cotizacion[]` vía API | `cargarDatos`, `agregarCotizacion`, `aceptarCotizacion`, `rechazarCotizacion`, `iniciarNegociacionCotizacion`, `cancelarNegociacionCotizacion`, `eliminarCotizacion`, `eliminarCotizacionesByPedidoId` |
| useOrdenesStore | useOrdenesStore.ts | `Orden[]` vía API | `cargarDatos`, `agregarOrden`, `actualizarEstadoOrden` |
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
| Botón acción | comprador | "Confirmar compra" (antes "Adjudicar") |
| Banner post-compra | comprador | "Compra confirmada con [proveedor]" |
| Toast cotización ganada | proveedor | "¡Ganaste la venta! [nombre pedido]" |
| Toast compra comprador | comprador | "Compra confirmada para [nombre pedido]" |

Helper functions en `src/utils/formatters.ts`: `getLabelEstadoPedido(estado, rol)`, `getLabelEstadoCotizacion(estado, rol)`.

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
9. **Chat habilitado** — visible cuando `pedido.estado === 'en_negociacion'` o `'adjudicado'`.
10. **Polling cada 5s en AppRouter** — llama `cargarDatos()` de los 4 stores + `cargarTodosLosMensajes()`. Suscripciones Zustand despachan CustomEvents para toasts.

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
