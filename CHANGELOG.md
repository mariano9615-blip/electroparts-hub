# CHANGELOG -- ElectroParts Hub

## [v0.1.0] -- 2026-06-26 -- Scaffolding inicial

### Archivos creados por script PowerShell

- `package.json` -- dependencias del proyecto (React 18, Zustand, React Router, Tabler Icons, Tailwind v3, Prettier)
- `vite.config.ts` -- configuracion Vite con template react-ts
- `tailwind.config.js` lineas 1-45 -- paleta EP hardcodeada en hex (ep.green, ep.blue, ep.amber, ep.red, ep.bg, ep.surface, ep.border, ep.text-primary, ep.text-secondary, ep.text-muted), tipografias Inter y JetBrains Mono
- `src/index.css` lineas 1-20 -- import Google Fonts (Inter + JetBrains Mono), directivas Tailwind, reset box-sizing, estilos base body
- `src/types/index.ts` lineas 1-65 -- tipos TypeScript del dominio: Rol, EstadoPedido, EstadoCotizacion, EstadoOrden, interfaces Pedido (11 campos), Cotizacion (10 campos), Orden (10 campos), Mensaje (6 campos), Proveedor (6 campos)
- `src/utils/constants.ts` lineas 1-35 -- CATEGORIAS (10 categorias de electronica), UNIDADES (6 tipos), PROVEEDORES_SIMULADOS (4 proveedores con datos completos), COMPRADOR_ID, claves de localStorage (6 constantes)
- `src/utils/formatters.ts` lineas 1-65 -- formatARS() formato moneda ARS con Intl, formatFecha() fecha legible en espanol, formatFechaRelativa() hace X horas/dias, diasHasta() dias hasta fecha limite, getColorEstadoPedido() clases Tailwind por estado, getColorEstadoCotizacion() clases Tailwind, getColorEstadoOrden() clases Tailwind
- `src/data/mockData.ts` lineas 1-110 -- PEDIDOS_INICIALES (3 pedidos: en_cotizacion/abierto/adjudicado), COTIZACIONES_INICIALES (4 cotizaciones: 2 pendientes/1 aceptada/1 rechazada), ORDENES_INICIALES (1 orden en_transito con chat habilitado), MENSAJES_INICIALES (3 mensajes de conversacion de ejemplo)
- `src/assets/` -- carpeta de assets estaticos (vacia)
- `src/components/ui/` -- carpeta componentes UI base (vacia, Claude Code implementa)
- `src/components/layout/` -- carpeta layout (vacia, Claude Code implementa)
- `src/components/pedidos/` -- carpeta componentes pedidos (vacia, Claude Code implementa)
- `src/components/cotizaciones/` -- carpeta componentes cotizaciones (vacia, Claude Code implementa)
- `src/components/ordenes/` -- carpeta componentes ordenes (vacia, Claude Code implementa)
- `src/components/chat/` -- carpeta componentes chat (vacia, Claude Code implementa)
- `src/pages/comprador/` -- carpeta paginas comprador (vacia, Claude Code implementa)
- `src/pages/proveedor/` -- carpeta paginas proveedor (vacia, Claude Code implementa)
- `src/store/` -- carpeta stores Zustand (vacia, Claude Code implementa)
- `src/hooks/` -- carpeta hooks custom (vacia, Claude Code implementa)
- `src/router/` -- carpeta router (vacia, Claude Code implementa)
- `.prettierrc` -- semi, singleQuote, tabWidth 2, trailingComma es5, printWidth 100
- `.gitignore` -- excluye node_modules, dist, .env, archivos de sistema
- `README.md` -- descripcion del proyecto, instrucciones de inicio, stack
- `ANTIGRAVITY.md` -- esqueleto arquitectonico inicial, Claude Code debe completar post-implementacion
- `CHANGELOG.md` -- este archivo

---

## [v0.2.0] -- 2026-06-26 -- Base tecnica: Tailwind v4 paleta EP, stores Zustand, hooks, router, inicializacion

### Archivos modificados

- `postcss.config.js` -- cambiado plugin de 'tailwindcss' a '@tailwindcss/postcss' requerido por Tailwind v4; instalado paquete @tailwindcss/postcss

- `src/index.css` -- reemplazado contenido completo: @import "tailwindcss" (sintaxis v4), @theme con 20 tokens de color EP (ep-green, ep-blue, ep-amber, ep-red, ep-bg, ep-surface, ep-surface-raised, ep-border, ep-border-strong, ep-text-primary, ep-text-secondary, ep-text-muted, ep-text-disabled y variantes), tipografias Inter y JetBrains Mono, reset global box-sizing, estilos base body con font-family var(--font-sans), scrollbar custom discreto

- `src/main.tsx` -- reemplazado: agrega funcion initializarDatos() que escribe PEDIDOS_INICIALES/COTIZACIONES_INICIALES/ORDENES_INICIALES/MENSAJES_INICIALES en localStorage si 'ep_initialized' no existe; monta AppRouter en lugar de App

### Archivos creados

- `src/store/useRolStore.ts` lineas 1-20 -- store Zustand para Rol; state: { rol: Rol }; action setRol(rol): persiste en 'ep_rol' y actualiza estado; inicializa leyendo 'ep_rol' de localStorage, default 'comprador'

- `src/store/usePedidosStore.ts` lineas 1-55 -- store Zustand para Pedido[]; actions: agregarPedido() push+persistir, actualizarEstadoPedido() muta por id+persistir, incrementarCotizaciones() suma 1 a cotizacionesRecibidas y si pasa de 0→1 cambia estado a 'en_cotizacion'+persistir; inicializa desde 'ep_pedidos' o PEDIDOS_INICIALES

- `src/store/useOrdenesStore.ts` lineas 1-40 -- store Zustand para Orden[]; actions: agregarOrden() push+persistir, actualizarEstadoOrden() muta por id+persistir; inicializa desde 'ep_ordenes' o ORDENES_INICIALES

- `src/store/useCotizacionesStore.ts` lineas 1-75 -- store Zustand para Cotizacion[]; action agregarCotizacion() push+persistir; action aceptarCotizacion(id) lineas 38-61: cambia cotizacion a 'aceptada', itera cotizaciones del mismo pedidoId y las pasa a 'rechazada', construye objeto Orden con crypto.randomUUID() y llama useOrdenesStore.getState().agregarOrden(), llama usePedidosStore.getState().actualizarEstadoPedido() con 'adjudicado', persiste en 'ep_cotizaciones'; action rechazarCotizacion() cambia estado a 'rechazada'+persistir; inicializa desde 'ep_cotizaciones' o COTIZACIONES_INICIALES

- `src/store/useChatStore.ts` lineas 1-40 -- store Zustand para Mensaje[]; action agregarMensaje() push+persistir en 'ep_mensajes'; selector getMensajesPorOrden(ordenId) filtra mensajes por ordenId (no muta estado); inicializa desde 'ep_mensajes' o MENSAJES_INICIALES

- `src/hooks/useLocalStorage.ts` lineas 1-20 -- hook generico useLocalStorage<T>(key, initialValue): lee y parsea JSON de localStorage al montar, setter persiste en localStorage, retorna [valor, setter]; para preferencias de UI en componentes (los stores usan su propia persistencia)

- `src/hooks/useSimuladorCotizaciones.ts` lineas 1-65 -- hook useSimuladorCotizaciones(pedidoId, presupuestoMax?): programa 4 timeouts (5s/12s/22s/35s) que disparan cotizaciones simuladas de PROVEEDORES_SIMULADOS; cada cotizacion tiene precio aleatorio ±20% del presupuestoMax, tiempoEntrega aleatorio, notas fijas por proveedor; llama useCotizacionesStore.getState().agregarCotizacion() y usePedidosStore.getState().incrementarCotizaciones() via getState(); retorna { simulando: boolean }; cleanup limpia todos los timeouts al desmontarse

- `src/router/AppRouter.tsx` lineas 1-55 -- AppRouter con BrowserRouter+Routes+Route; 11 rutas definidas (/comprador, /comprador/publicar, /comprador/cotizaciones, /comprador/ordenes, /comprador/chat, /proveedor, /proveedor/pedidos, /proveedor/cotizaciones, /proveedor/ordenes, /proveedor/chat, * → /comprador); PlaceholderPage y AppShell como componentes temporales para Sesion 1; rutas / y * redirigen a /comprador

---
<!-- Claude Code: agregar entradas siguientes a partir de aqui en formato:
## [vX.Y.Z] -- YYYY-MM-DD -- Descripcion
### Archivos creados/modificados
- ruta/archivo.tsx lineas X-Y -- descripcion de funcionalidad especifica
-->
