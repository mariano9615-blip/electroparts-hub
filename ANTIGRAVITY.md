# ANTIGRAVITY.md -- ElectroParts Hub
## Fuente de verdad arquitectonica. Leer completo antes de cualquier cambio.

## Stack y versiones (package.json exacto)
- react: ^19.2.7
- react-dom: ^19.2.7
- react-router-dom: ^7.18.0
- zustand: ^5.0.14
- @tabler/icons-react: ^3.44.0
- tailwindcss: ^4.3.1  (v4 — configuracion via @theme en CSS, NO tailwind.config.js)
- @tailwindcss/postcss: ^4.x  (plugin PostCSS requerido por v4, distinto de v3)
- vite: ^8.1.0
- typescript: ~6.0.2
- @vitejs/plugin-react: ^6.0.2
- autoprefixer: ^10.5.2
- prettier: ^3.8.5
- oxlint: ^1.69.0

## Sistema de diseno — Tailwind v4 + Paleta EP

Tailwind v4 NO usa tailwind.config.js para colores custom. Los tokens se definen
con la directiva @theme dentro del CSS.

Archivo: src/index.css  (unica fuente de verdad del sistema de diseno)

Configuracion PostCSS: postcss.config.js usa '@tailwindcss/postcss' (no 'tailwindcss').

Paleta EP disponible como clases Tailwind:
  bg-ep-green         #16a34a  (verde primario de marca)
  bg-ep-green-light   #dcfce7
  bg-ep-green-dark    #14532d
  bg-ep-green-hover   #15803d
  bg-ep-blue          #2563eb
  bg-ep-blue-light    #dbeafe
  bg-ep-blue-dark     #1e3a8a
  bg-ep-amber         #d97706
  bg-ep-amber-light   #fef3c7
  bg-ep-amber-dark    #92400e
  bg-ep-red           #dc2626
  bg-ep-red-light     #fee2e2
  bg-ep-red-dark      #991b1b
  bg-ep-bg            #f8fafc  (fondo global)
  bg-ep-surface       #ffffff
  bg-ep-surface-raised #f1f5f9
  bg-ep-border        #e2e8f0
  bg-ep-border-strong #cbd5e1
  text-ep-text-primary   #0f172a
  text-ep-text-secondary #475569
  text-ep-text-muted     #94a3b8
  text-ep-text-disabled  #cbd5e1

Tipografias: --font-sans (Inter) / --font-mono (JetBrains Mono), importadas desde Google Fonts.
Prefijos aplicables: bg-*, text-*, border-*, ring-*, etc.

## Stores Zustand (src/store/)

Patron comun a todos los stores:
  - Persistencia manual en localStorage (sin middleware persist de Zustand)
  - Lee localStorage al inicializarse; si no existe usa datos mock de src/data/mockData.ts
  - Cada action que muta estado persiste inmediatamente
  - Para llamar otros stores desde una action: useXxxStore.getState().action()

| Store                   | Entidad     | Clave localStorage    | Depende de                          |
|-------------------------|-------------|----------------------|-------------------------------------|
| useRolStore.ts          | Rol         | ep_rol               | —                                   |
| usePedidosStore.ts      | Pedido[]    | ep_pedidos           | —                                   |
| useOrdenesStore.ts      | Orden[]     | ep_ordenes           | —                                   |
| useCotizacionesStore.ts | Cotizacion[]| ep_cotizaciones      | useOrdenesStore, usePedidosStore     |
| useChatStore.ts         | Mensaje[]   | ep_mensajes          | —                                   |

Flujo critico en useCotizacionesStore.aceptarCotizacion():
  1. Cambia cotizacion seleccionada a 'aceptada'
  2. Cambia todas las demas cotizaciones del mismo pedido a 'rechazada'
  3. Construye objeto Orden con crypto.randomUUID()
  4. Llama useOrdenesStore.getState().agregarOrden(orden)
  5. Llama usePedidosStore.getState().actualizarEstadoPedido(pedidoId, 'adjudicado')
  6. Persiste cotizaciones en localStorage

## Hooks custom (src/hooks/)

useLocalStorage<T>(key, initialValue) → [T, setter]
  - Lee y parsea JSON de localStorage al montar
  - Setter persiste en localStorage automaticamente
  - Para uso en componentes con preferencias de UI (no en stores)

useSimuladorCotizaciones(pedidoId, presupuestoMax?) → { simulando: boolean }
  - Simula llegada de 4 cotizaciones de PROVEEDORES_SIMULADOS
  - Delays: 5s, 12s, 22s, 35s
  - Cada cotizacion llama agregarCotizacion() e incrementarCotizaciones() via getState()
  - simulando=true hasta que se dispara la ultima cotizacion
  - Cleanup de timeouts en desmontaje (evita memory leaks)
  - Usar en la pagina que sigue a PublicarPedido para animar la llegada de cotizaciones

## Router (src/router/AppRouter.tsx)

BrowserRouter + Routes + Route (API de React Router v7).
Todas las rutas estan envueltas en AppShell (layout wrapper, Sesion 2 lo completa).

| Ruta                        | Componente destino           |
|-----------------------------|------------------------------|
| /                           | → Navigate /comprador        |
| /comprador                  | DashboardComprador           |
| /comprador/publicar         | PublicarPedido               |
| /comprador/cotizaciones     | MisCotizacionesComprador     |
| /comprador/ordenes          | MisOrdenesComprador          |
| /comprador/chat             | ChatComprador                |
| /proveedor                  | DashboardProveedor           |
| /proveedor/pedidos          | PedidosDisponibles           |
| /proveedor/cotizaciones     | MisCotizacionesProveedor     |
| /proveedor/ordenes          | MisOrdenesProveedor          |
| /proveedor/chat             | ChatProveedor                |
| *                           | → Navigate /comprador        |

Sesion 1: todas las rutas muestran PlaceholderPage temporal.

## Inicializacion (src/main.tsx)

Flujo al arrancar la app:
  1. initializarDatos(): si 'ep_initialized' no existe en localStorage,
     escribe PEDIDOS_INICIALES, COTIZACIONES_INICIALES, ORDENES_INICIALES,
     MENSAJES_INICIALES y marca 'ep_initialized'='true'
  2. Los stores leen localStorage al instanciarse — ya encuentran datos en el primer arranque
  3. Monta <StrictMode><AppRouter /></StrictMode>

Claves localStorage del sistema:
  ep_initialized, ep_rol, ep_pedidos, ep_cotizaciones, ep_ordenes, ep_mensajes

## Estructura de carpetas
src/
  assets/          -- recursos estaticos
  components/
    ui/            -- componentes base reutilizables (Button, Badge, Card, Input, Modal, Spinner)
    layout/        -- estructura principal (AppShell, Sidebar, TopBar)
    pedidos/       -- componentes de pedidos (PedidoCard, PedidoForm, PedidoList)
    cotizaciones/  -- componentes de cotizaciones (CotizacionCard, CotizacionForm, CotizacionList)
    ordenes/       -- componentes de ordenes (OrdenCard, OrdenList)
    chat/          -- componentes de chat (ChatWindow, ChatMessage)
  pages/
    comprador/     -- paginas del flujo comprador
    proveedor/     -- paginas del flujo proveedor
  store/           -- stores Zustand con persistencia localStorage
  types/           -- tipos TypeScript del dominio
  data/            -- datos mock iniciales
  hooks/           -- hooks custom (useLocalStorage, useSimuladorCotizaciones)
  utils/           -- formatters y constants
  router/          -- definicion de rutas (AppRouter.tsx)

## Modulos y responsabilidades
(Claude Code: completar por modulo post-implementacion Sesion 2)

## Flujos de negocio implementados
(Claude Code: completar al implementar cada flujo en Sesion 2)

## Convenciones del proyecto
- UI completamente en espanol
- Nombres tecnicos de archivos y funciones en ingles (convencion React/TS)
- Tokens de color definidos en src/index.css con @theme (Tailwind v4) -- no en tailwind.config.js
- Estado global via Zustand -- nunca useState para logica de negocio
- Persistencia via localStorage encapsulada en cada store (persistencia manual, sin middleware)
- Un archivo por componente
- Exports nombrados para componentes reutilizables, default para paginas
- Props siempre tipadas con interface NombreComponenteProps
- Comentarios en el codigo en espanol

## Comandos utiles
npm run dev      # Servidor local en http://localhost:5173
npm run build    # Build de produccion
npm run lint     # Linting
