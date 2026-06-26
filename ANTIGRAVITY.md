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

### Componentes UI base (src/components/ui/)

Todos se exportan desde `src/components/ui/index.ts`.

| Componente | Props clave | Variantes | Cuándo usarlo |
|------------|-------------|-----------|----------------|
| **Button** | variant, size, loading, fullWidth | primary / secondary / danger / ghost | Toda acción del usuario. Primary para CTA principal, secondary para acciones secundarias, danger para destruir/rechazar, ghost para acciones de baja jerarquía (cerrar, icono). |
| **Badge** | color, dot | green / blue / amber / red / gray | Estados de entidades (pedido, cotización, orden), roles de usuario, etiquetas. Dot para indicadores de estado activo. |
| **Card** | padding, hoverable | none / sm / md / lg | Contenedor de unidades de información. hoverable=true para listas clickeables. |
| **Input** | label, error, hint, required | estados: normal / focus / error / disabled | Campos de texto de formularios. hint para ayuda contextual, error para validación. |
| **TextArea** | label, error, rows | igual que Input | Texto multilínea (descripciones, notas). |
| **Select** | options, placeholder | igual que Input | Selección de un valor de lista cerrada (categoría, unidad). |
| **Modal** | open, onClose, title, size, footer | sm / md / lg | Confirmaciones, formularios cortos, detalle de entidad. footer para botones de acción. |
| **Spinner** | size, color | sm / md / lg | Indicador de carga inline. Automático dentro de Button cuando loading=true. |

#### Convenciones de diseño que aplican a todos

- **Colores**: siempre clases `ep-*`. Nunca `gray-*` ni variables CSS del sistema.
- **Bordes**: `border-ep-border` para superficies, `border-ep-border-strong` para énfasis.
- **Texto**: `text-ep-text-primary` → títulos y datos importantes; `text-ep-text-secondary` → descripción y metadatos; `text-ep-text-muted` → labels y fechas; `text-ep-text-disabled` → campos inactivos.
- **Border radius**: `rounded-lg` para inputs/botones, `rounded-xl` para cards, `rounded-2xl` para modales.
- **Sombras**: `shadow-sm` en surfaces elevadas únicamente. Nunca `shadow-lg` en elementos inline.
- **Transiciones**: `transition-colors duration-150` en todos los elementos interactivos.
- **Tipografía numérica**: `font-mono` (JetBrains Mono) para precios, IDs y cantidades. `font-sans` (Inter) para el resto.

#### Cuándo usar cada color de Badge

| Color | Usar para |
|-------|-----------|
| green | Estado activo/positivo, rol comprador, pedido abierto, cotización aceptada, orden entregada |
| blue | En proceso, rol proveedor, pedido en cotización, orden confirmada |
| amber | Pendiente de acción, orden en tránsito, cotización pendiente |
| red | Error o rechazo, pedido cancelado, cotización rechazada, orden disputada |
| gray | Finalizado neutro, pedido adjudicado, elementos archivados |

---

### Componentes de dominio

#### PedidoCard (src/components/pedidos/PedidoCard.tsx)

Props:
- `pedido: Pedido` — datos del pedido
- `compacto?: boolean` — modo resumen para dashboards (default false)
- `onCotizar?: () => void` — si existe, muestra botón "Cotizar"

Modos:
- **Normal**: muestra título, badge de estado, metadatos (cantidad, categoría, fecha límite), descripción, presupuesto máx y contador de cotizaciones. Fecha urgente (< 3 días) resalta en rojo con ícono de alerta.
- **Compacto**: solo título + badge, categoría + fecha, contador de cotizaciones.

Sin dependencias de store (recibe el pedido por prop).

#### CotizacionCard (src/components/cotizaciones/CotizacionCard.tsx)

Props:
- `cotizacion: Cotizacion` — datos de la cotización
- `onAceptar?: () => void` — callback aceptar (solo visible si estado === 'pendiente' y ambas funciones definidas)
- `onRechazar?: () => void` — callback rechazar (ídem)
- `compacto?: boolean` — modo resumen

Modos:
- **Normal**: nombre proveedor, badge estado, zona, badge "Verificado" (si aplica), estrellas de calificación, precio en font-mono grande, tiempo de entrega, notas en caja destacada, fecha relativa, botones de acción si pendiente.
- **Compacto**: solo nombre, precio, badge estado, tiempo de entrega.

Dependencia: `PROVEEDORES_SIMULADOS` de `src/utils/constants.ts` para obtener `zona` y `verificado` por `proveedorId`.

#### OrdenCard (src/components/ordenes/OrdenCard.tsx)

Props:
- `orden: Orden` — datos de la orden
- `onIrChat?: () => void` — si existe, muestra botón "Ir al chat"

Muestra: ID abreviado en font-mono, badge de estado, nombre proveedor con ícono, monto en font-mono, fecha de confirmación. Sin modos compacto/normal.

---

### Layout principal (src/components/layout/)

#### AppShell (AppShell.tsx)

Envuelve toda la aplicación. Gestiona el estado `sidebarAbierto` (useState) para mobile.

Estructura desktop (≥ md):
```
flex h-screen overflow-hidden
├── div.hidden.md:flex (w-64) → <Sidebar />
└── div.flex-1 (flex-col, overflow-hidden)
    ├── <TopBar onToggleSidebar />
    └── main (flex-1, overflow-y-auto, bg-ep-bg, p-6) → {children}
```

Comportamiento mobile (< md):
- Sidebar oculto por defecto.
- Al tocar hamburger en TopBar → `sidebarAbierto=true` → aparece drawer con overlay semitransparente.
- Click en overlay → `cerrarSidebar()`.

#### Sidebar (Sidebar.tsx)

Lee `useRolStore` y `useCotizacionesStore` directamente (sin props).

Secciones de arriba a abajo:
1. **Branding**: logo IconBolt + "ElectroParts Hub" + subtítulo "Marketplace B2B".
2. **Toggle de rol**: dos botones 50/50 en pill. Click → `setRol()` + `navigate()` al dashboard correspondiente.
3. **Etiqueta de sección**: "Comprador" o "Proveedor" en uppercase tracking-wider.
4. **Navegación**: ítems según rol. Ítem activo detectado por `pathname === item.ruta` (useLocation). Badge amber sobre cotizaciones = cantidad de cotizaciones con `estado === 'pendiente'`.
5. **Footer**: versión "v0.1.0".

Ítems comprador: Dashboard, Publicar pedido, Cotizaciones (badge), Mis órdenes, Chat activo.
Ítems proveedor: Dashboard, Pedidos disponibles, Mis cotizaciones (badge), Mis órdenes, Chat activo.

#### TopBar (TopBar.tsx)

Props: `onToggleSidebar: () => void`.

Slot izquierdo:
- Mobile: botón IconMenu2 → llama `onToggleSidebar`.
- Desktop: nombre de la sección activa derivado de `BREADCRUMB_MAP[pathname]`.

Slot derecho:
- Badge de rol (green=comprador, blue=proveedor).
- Separador vertical.
- Avatar "ME" (iniciales de Mi Empresa) + nombre "Mi Empresa" (oculto en mobile).

---

## Flujos de negocio implementados

### Flujo de cambio de rol
Usuario hace click en toggle Comprador/Proveedor del Sidebar →
`useRolStore.setRol(nuevoRol)` (persiste en localStorage) →
`navigate('/comprador' | '/proveedor')` →
Sidebar actualiza ítems y badge → TopBar actualiza badge de rol.

### Flujo visual de cotizaciones pendientes (badge)
`useCotizacionesStore.cotizaciones` filtra por `estado === 'pendiente'` →
count se muestra como badge amber sobre el ítem "Cotizaciones" en el Sidebar.
Con datos mock iniciales: 2 cotizaciones pendientes (cot-001, cot-002).

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
