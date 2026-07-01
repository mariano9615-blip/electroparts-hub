# CHANGELOG — ElectroParts Hub

## [Unreleased] — rama mdemichelis

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
