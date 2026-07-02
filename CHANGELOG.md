# CHANGELOG — ElectroParts Hub

## [Unreleased] — rama mdemichelis

### Etapa 7 — 2026-07-01
#### Added — Sistema de calificaciones, StarRating, promedio por proveedor, panel admin

- `db.json` *(modificado)* — agrega colección `calificaciones: []`.
- `src/types/index.ts` *(modificado)* — agrega interfaz `Calificacion` (`id`, `ordenId`, `pedidoId`, `compradorId`, `proveedorId`, `proveedorNombre`, `estrellas`, `comentario?`, `fechaCreacion`); agrega campos opcionales `calificacionId?` y `calificado?` a `Orden`.
- `src/services/api.ts` *(modificado)* — agrega `calificacionesApi` (`getAll`, `getByProveedor`, `getByOrden`, `create`) con comentario de migración a Supabase, siguiendo el mismo patrón que `usuariosApi`.
- `src/store/useCalificacionesStore.ts` *(nuevo)* — store de calificaciones: `calificaciones: Calificacion[]`, `cargarCalificaciones`, `crearCalificacion`, y tres selectores derivados (`getCalificacionesByProveedor`, `getPromedioProveedor`, `getCalificacionByOrden`) que leen sobre el estado actual sin disparar fetch.
- `src/store/useOrdenesStore.ts` *(modificado)* — agrega acción `marcarCalificada(ordenId, calificacionId)` que hace `PATCH {calificado:true, calificacionId}`.
- `src/store/useCotizacionesStore.ts` *(modificado)* — agrega acción `actualizarCalificacionProveedor(cotizacionId, promedio)` que hace `PATCH {calificacionProveedor}`; agrega `calificado: false` por defecto al construir la `Orden` en `aceptarCotizacion`.
- `src/store/useNotificacionesStore.ts` *(modificado)* — agrega tipo `'calificacion_recibida'` a `TipoNotificacion`.
- `src/components/ui/StarRating.tsx` *(nuevo)* — componente reutilizable de estrellas, modo display (decimales, medias estrellas) y modo interactivo (hover + click), 3 tamaños, color progresivo por cantidad de estrellas seleccionadas/hovereadas. Exportado desde el barrel `src/components/ui/index.ts`.
- `src/components/ordenes/OrdenCard.tsx` *(modificado)* — reemplaza el placeholder "Calificar (próximamente)" por el flujo real: botón "Calificar proveedor" (`onCalificar`) si `!orden.calificado`, o badge con `StarRating` si ya fue calificada. Solo visible para `rol === 'comprador'` en órdenes `cerrado`.
- `src/pages/comprador/MisOrdenesComprador.tsx` *(modificado)* — agrega modal de calificación completo: selector de estrellas interactivo, label contextual por cantidad de estrellas, textarea de comentario opcional (máx. 300 chars), envío que crea la calificación, marca la orden como calificada, recalcula y persiste el promedio en la cotización ganadora, notifica al proveedor y dispara un toast de confirmación.
- `src/pages/proveedor/MisCotizacionesProveedor.tsx` *(modificado)* — para cotizaciones `aceptada`, muestra la calificación específica de esa venta (estrellas + comentario) si existe, o "Sin calificación aún".
- `src/pages/proveedor/DetallePedidoProveedor.tsx` *(modificado)* — agrega sección "Tu calificación en este pedido" cuando la orden propia está `cerrado` y `calificado`.
- `src/pages/comprador/DetallePedidoComprador.tsx` *(modificado)* — en la tabla de cotizaciones recibidas, muestra el promedio de calificaciones del proveedor (`⭐ X.X (N calificaciones)`) o "Sin calificaciones aún".
- `src/pages/admin/DashboardAdmin.tsx` *(modificado)* — agrega StatCard "Calificaciones" con el total recibido en la plataforma y el promedio global como métrica secundaria.
- `src/pages/admin/AdminUsuarios.tsx` *(modificado)* — agrega columna "Calificación" en la tabla, visible para usuarios con `rol === 'proveedor'` (promedio + cantidad de reseñas, o "-").
- `src/router/AppRouter.tsx` *(modificado)* — agrega `useCalificacionesStore.getState().cargarCalificaciones()` al polling global de 5s.
- `src/components/layout/NotificacionesPanel.tsx` *(modificado)* — agrega ícono/color para el nuevo tipo `calificacion_recibida`.
- `src/components/ui/ToastContainer.tsx` *(modificado)* — agrega el evento `calificacion-enviada-toast` (reutiliza el tipo visual `estado_cambio`) para el toast de confirmación tras calificar.

### Etapa 6b — 2026-07-01
#### Added — ABM enterprise de usuarios, bcryptjs, auth desde db.json, preparado para Supabase

- `package.json` *(modificado)* — agrega dependencia `bcryptjs` y dev dependency `@types/bcryptjs`.
- `db.json` *(modificado)* — agrega colección `usuarios` con los 3 usuarios fijos (`admin`/`comprador`/`proveedor`, contraseña `123456`), ahora con `passwordHash` (bcrypt, 10 salt rounds) en vez de contraseña en texto plano.
- `src/types/index.ts` *(modificado)* — agrega interfaces `Usuario` (`id`, `usuario`, `passwordHash`, `rol`, `nombre`, `empresa?`, `activo`, `fechaCreacion`, `ultimaModificacion`) y `UsuarioFormData` (para los formularios de alta del panel).
- `src/services/api.ts` *(modificado)* — agrega `usuariosApi` (`getAll`, `getById`, `getByUsuario`, `create`, `update`, `delete`, `validateCredentials`); `validateCredentials` compara con `bcrypt.compare` y devuelve el usuario sin `passwordHash`. Comentario de migración a Supabase encima del objeto.
- `src/store/useUsuariosStore.ts` *(nuevo)* — store del ABM: `usuarios: Omit<Usuario,'passwordHash'>[]`, `cargarUsuarios`, `crearUsuario` (valida unicidad + hashea password), `editarUsuario`, `cambiarPassword` (hashea), `toggleActivo` y `eliminarUsuario` (ambas no-opean con `console.warn` si el target es admin). No persiste en `localStorage`.
- `src/store/useAuthStore.ts` *(reescrito)* — `login()` ahora es async y valida contra `usuariosApi.validateCredentials()` en vez del diccionario hardcodeado; agrega campo `nombre` y `errorLogin` (mensaje distinto para credenciales inválidas vs. cuenta desactivada); persiste `{ usuario, rol, nombre }` en `localStorage['ep_auth']`.
- `src/pages/Login.tsx` *(modificado)* — `intentarLogin` ahora espera el `Promise<boolean>` de `login()` y muestra el mensaje de `errorLogin` (antes: texto fijo "Usuario o contraseña incorrectos").
- `src/components/layout/Sidebar.tsx`, `SidebarAdmin.tsx`, `TopBar.tsx` *(modificados)* — muestran `nombre` (fallback a `usuario`) en vez del username crudo.
- `src/components/ui/Input.tsx` *(modificado)* — agrega prop opcional `onBlur` para soportar validación en tiempo real (onBlur + onChange) en los formularios del ABM.
- `src/pages/admin/AdminUsuarios.tsx` *(reescrito)* — ABM enterprise completo: búsqueda + filtros (rol/estado) + tabla ordenable + paginación de 10; modales de alta, edición, cambio de contraseña y confirmación de eliminación; popover inline de confirmación para activar/desactivar; skeleton loader mientras carga, `EmptyState` para error/sin resultados/sin usuarios; aviso local de éxito/error tras cada operación (no reutiliza el sistema global de toasts). El admin no se puede crear ni editar su rol a admin, y sus acciones de eliminar/desactivar quedan deshabilitadas con tooltip.

### Fix TypeScript build errors — 2026-07-01

Errores preexistentes identificados en Etapa 6 (dejados fuera de scope en ese commit) que bloqueaban `npm run build`/deploy en Vercel. Se corrigen 5 errores en total: los 4 previstos más uno adicional descubierto al correr el build.

- `src/components/cotizaciones/CotizacionCard.tsx` *(fix)* — reemplaza la referencia a `estadoALabel` (nombre inexistente, quedó de un refactor previo) por `getLabelEstadoCotizacion(cotizacion.estado, rol)`, ya usada en el resto del componente.
- `src/components/layout/NotificacionesPanel.tsx` *(fix)* — agrega los 6 tipos de notificación de órdenes (`orden_en_preparacion`, `orden_enviada`, `orden_entregada`, `orden_pago_confirmado`, `orden_cerrada`, `orden_disputada`) a los mapas `ICONOS_TIPO` y `COLORES_ICONO`, que quedaron desactualizados desde Etapa 5a.
- `src/data/mockData.ts` *(fix)* — reemplaza el estado obsoleto `'en_transito'` por `'enviado'` en `ORDENES_INICIALES`; agrega el campo requerido `estadoPago: 'pendiente'` faltante en la misma orden de ejemplo (error adicional no listado originalmente).
- `src/store/useCotizacionesStore.ts` *(fix)* — agrega `estadoPago: 'pendiente'` al objeto `Orden` construido en `aceptarCotizacion`, campo requerido desde Etapa 5a que faltaba en esta construcción.

### v0.6.0 — 2026-07-01
#### Added — Etapa 6 — Autenticación por rol, panel de administración, protección de rutas

- `src/types/index.ts` *(modificado)* — agrega `RolUsuario = 'admin' | 'comprador' | 'proveedor'`; agrega campos opcionales `resolucionDisputa` y `resolvedBy` a `Orden`.
- `src/store/useAuthStore.ts` *(refactorizado)* — reemplaza el login hardcodeado de un solo usuario admin por 3 usuarios fijos (`admin`/`comprador`/`proveedor`, contraseña `123456`); el store ahora guarda `{ autenticado, usuario, rol, login, logout }` y persiste `{ usuario, rol }` en `localStorage 'ep_auth'`.
- `src/store/useRolStore.ts` *(eliminado)* — el rol vive únicamente en `useAuthStore`. Reemplazados todos sus usos por `useAuthStore((s) => s.rol)` en `AppRouter.tsx`, `Sidebar.tsx`, `TopBar.tsx`, `NotificacionesPanel.tsx`, `ChatsActivosPanel.tsx`, `Chat.tsx` y `useMensajesStore.ts`.
- `src/utils/constants.ts` *(modificado)* — elimina `STORAGE_KEY_ROL` (dead code tras eliminar `useRolStore`).
- `src/pages/Login.tsx` *(reescrito)* — agrega 3 botones de "Acceso rápido demo" que autocompletan usuario/contraseña y loguean directo; redirige según rol (`admin→/admin`, `comprador→/comprador`, `proveedor→/proveedor`).
- `src/components/layout/Sidebar.tsx` *(refactorizado)* — elimina el toggle Comprador/Proveedor; agrega usuario logueado + badge de rol arriba, y botón de logout abajo.
- `src/components/layout/SidebarAdmin.tsx` *(nuevo)* — sidebar exclusivo del admin: Dashboard, Pedidos, Órdenes, Disputas (con badge de cantidad abierta), Usuarios; badge ADMIN en rojo.
- `src/components/layout/AppShell.tsx` *(modificado)* — elige entre `Sidebar` y `SidebarAdmin` según `useAuthStore((s) => s.rol)`.
- `src/components/layout/TopBar.tsx` *(modificado)* — muestra el usuario real logueado (antes "Mi Empresa" hardcodeado) y un badge de rol con color por los 3 roles (admin=rojo, comprador=verde, proveedor=azul); oculta notificaciones y chats activos cuando el rol es admin.
- `src/router/AppRouter.tsx` *(reescrito)* — reemplaza `LayoutProtegido`/`RutaProtegida` únicos por `LayoutPorRol({ rolRequerido })` por sección (`/admin`, `/comprador`, `/proveedor`): sin sesión → `/login`; sesión con rol distinto → redirige al dashboard propio. Agrega rutas `/admin`, `/admin/pedidos`, `/admin/ordenes`, `/admin/disputas`, `/admin/usuarios`. El polling de 5s ahora chequea el rol en cada tick y no vuelve a cargar datos si es `admin` (sí hay una carga inicial única al montar).
- `src/store/useOrdenesStore.ts` *(modificado)* — agrega acción `resolverDisputa(ordenId, resolucion)`: PATCH `{ estado: 'cerrado', resolucionDisputa, resolvedBy: 'admin' }` y notifica a comprador y proveedor.
- `src/pages/admin/DashboardAdmin.tsx` *(nuevo)* — StatCards (total pedidos, órdenes activas, disputas abiertas, órdenes cerradas), monto total transaccionado (excluye órdenes disputadas), tabla de actividad reciente (últimas 5 órdenes).
- `src/pages/admin/AdminPedidos.tsx` *(nuevo)* — tabla de todos los pedidos con filtro por estado; modal de detalle solo lectura.
- `src/pages/admin/AdminOrdenes.tsx` *(nuevo)* — tabla de todas las órdenes con filtro por estado de orden y de pago; modal de detalle solo lectura.
- `src/pages/admin/AdminDisputas.tsx` *(nuevo)* — lista de órdenes `disputada` con observación, comprador, proveedor, monto y fecha; modal "Resolver disputa" (favor comprador/proveedor + textarea) que llama `resolverDisputa`.
- `src/pages/admin/AdminUsuarios.tsx` *(nuevo)* — lista solo lectura de los 3 usuarios fijos con badge "Activo"; botón "Agregar usuario" deshabilitado con tooltip "Próximamente".

---

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
