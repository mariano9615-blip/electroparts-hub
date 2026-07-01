# CHANGELOG — ElectroParts Hub

## [Unreleased] — rama mdemichelis

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
