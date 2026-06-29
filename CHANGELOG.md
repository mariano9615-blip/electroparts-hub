# CHANGELOG -- ElectroParts Hub

## [v0.1.3] -- 2026-06-29 -- Dashboard rediseñado con tablas y layout B2B corporativo

### src/components/ui/StatCard.tsx (reescritura completa)
- Eliminado el wrapper `<Card>` — ahora usa `<div>` propio con `bg-ep-surface border border-ep-border rounded-xl shadow-sm px-4 py-3`
- Agregado `border-l-4` con color del stat como acento visual izquierdo (border-l-ep-green/blue/amber/red según prop `color`)
- Eliminado icono grande w-11 h-11 top-right; reemplazado por icono inline 13px junto al label
- Label: mantenido `text-xs font-semibold text-ep-text-muted uppercase tracking-wider`; icono coloreado en div separado antes del label para no contaminar el color del texto
- Valor: reducido de `text-3xl` a `text-2xl font-bold font-mono leading-none`
- Badge de pendientes: sin cambios funcionales
- Props invariantes: label, value, icono, color, badge?, sub?

### src/components/domain/PedidosTable.tsx (nuevo)
- Componente de tabla HTML para listar pedidos en dashboards
- Props: `pedidos: Pedido[]`, `onCotizar?: (pedido: Pedido) => void`
- Columnas: Producto | Categoría | Fecha límite | Cotizaciones | Estado | (Acción opcional)
- Columna Acción con `<Button variant="secondary" size="sm">Cotizar</Button>` solo aparece cuando `onCotizar` está definido (usado en DashboardProveedor)
- Fecha urgente (diasHasta < 3) en `text-ep-red font-semibold` con `IconAlertTriangle` inline
- Contenedor: `bg-ep-surface border border-ep-border rounded-xl shadow-sm overflow-hidden`
- Filas: `divide-y divide-ep-border` + `hover:bg-ep-surface-raised transition-colors duration-150`
- Thead: `bg-ep-surface-raised border-b border-ep-border` con headers `text-xs font-semibold text-ep-text-muted uppercase tracking-wider`

### src/components/domain/CotizacionesTable.tsx (nuevo)
- Componente de tabla HTML para listar cotizaciones en dashboards
- Props: `cotizaciones: Cotizacion[]`, `pedidos: Pedido[]`
- Columnas: Proveedor | Pedido | Precio | Entrega | Estado
- Resuelve título del pedido internamente via `pedidos.find(p => p.id === c.pedidoId)` — recibe pedidos como prop para evitar acceso al store desde el componente
- Precio: `font-mono font-semibold text-ep-text-primary` alineado a la derecha
- Mismo estilo de contenedor y filas que PedidosTable

### src/pages/comprador/DashboardComprador.tsx
- Eliminado import de `PedidoCard` (ya no se usa en dashboard)
- Eliminado import de `CotizacionCard` (ya no se usa en dashboard)
- Agregados imports de `PedidosTable` y `CotizacionesTable` desde `../../components/domain/`
- Sección "Últimos pedidos": reemplazado `<div className="flex flex-col gap-3">` + PedidoCards por `<PedidosTable pedidos={ultimosPedidos} />`
- Sección "Últimas cotizaciones": reemplazado `<div className="flex flex-col gap-3">` + CotizacionCards por `<CotizacionesTable cotizaciones={ultimasCotizaciones} pedidos={misPedidos} />`
- Section headers: reducido padding `pb-2 mb-3` (antes `pb-2.5 mb-4`) para layout más denso
- Grid StatCards: `gap-3` (antes `gap-4`) y `mb-6` (antes `mb-8`)
- Secciones: `mb-6` (antes `mb-8`)
- Lógica de negocio y datos calculados: sin cambios

### src/pages/proveedor/DashboardProveedor.tsx
- Eliminado import de `PedidoCard`
- Agregado import de `PedidosTable` desde `../../components/domain/`
- Sección "Pedidos recientes disponibles": reemplazado `<div className="flex flex-col gap-3">` + PedidoCards por `<PedidosTable pedidos={ultimosPedidos} onCotizar={(p) => setPedidoSeleccionado(p)} />`
- Section header: reducido a `pb-2 mb-3`
- Grid StatCards: `gap-3` y `mb-6`
- Modal de cotización y toast de éxito: sin cambios
- Lógica de negocio: sin cambios

### ANTIGRAVITY.md
- Sección "Estructura de carpetas": agregada línea `domain/ -- PedidosTable, CotizacionesTable (tablas para dashboards)` en components/
- Sección "Convenciones de diseño": actualizada descripción de StatCard layout (border-l-4 accent, icono inline 13px, text-2xl)
- Sección "Componentes de dominio": agregadas entradas para PedidosTable y CotizacionesTable

---

## [v0.1.2] -- 2026-06-28 -- Sidebar oscuro estilo B2B corporativo

### src/components/layout/Sidebar.tsx

- Línea 61: `<aside>` — fondo cambiado de `bg-ep-surface border-r border-ep-border` a `bg-ep-blue-dark` (sin borde derecho, el borde visual desaparece al unificarse con el fondo)
- Línea 63: header branding — `border-b border-ep-border` → `border-b border-white/10`
- Línea 68: título brand — `text-ep-text-primary` → `text-white`
- Línea 71: subtítulo brand — `text-ep-text-muted` → `text-slate-400`
- Línea 76: toggle wrapper — `border-b border-ep-border` → `border-b border-white/10`
- Línea 77: toggle pill — `bg-ep-surface-raised` → `bg-white/10`
- Líneas 79-96: botones toggle — activo: `bg-ep-surface shadow-sm text-ep-text-primary` → `bg-white/20 shadow-sm text-white`; inactivo: `text-ep-text-muted hover:text-ep-text-secondary` → `text-slate-400 hover:text-white`
- Línea 103: label sección — `text-ep-text-muted` → `text-slate-400`
- Líneas 120-123: ítem nav activo — `bg-ep-green-light text-ep-green-dark` → `bg-white/15 text-white`; ícono activo mantiene `text-ep-green` (acento verde visible sobre fondo oscuro)
- Líneas 123: ítem nav inactivo — `text-ep-text-secondary hover:bg-ep-surface-raised hover:text-ep-text-primary` → `text-slate-300 hover:bg-white/10 hover:text-white`
- Línea 144: footer — `border-t border-ep-border` → `border-t border-white/10`; `text-ep-text-disabled` → `text-slate-500`

---

## [v0.1.1] -- 2026-06-28 -- Mejoras visuales B2B corporativo (commit 84f1fa1)

### src/components/ui/Card.tsx · líneas 19-28
- Línea 21: agregado `shadow-sm` permanente a la clase base del card (antes solo en hover con `hoverable`)

### src/components/ui/StatCard.tsx · líneas 1-42 (reescritura)
- Layout reestructurado: icono movido a top-right (flex justify-between), valor principal a la izquierda
- Línea 26: label `text-xs font-semibold uppercase tracking-wider` (antes `font-medium tracking-wide`)
- Línea 28: valor `text-3xl font-bold font-mono leading-none` (antes `text-2xl`)
- Línea 36: icono `w-11 h-11` (antes `w-10 h-10`)

### src/components/ui/PageHeader.tsx · líneas 1-18 (reescritura)
- Línea 9: contenedor con `border-b border-ep-border pb-5 mb-6` (antes solo `mb-6` sin borde)
- Línea 10: título `text-2xl font-bold leading-tight` (antes `text-xl font-semibold`)
- Línea 11: descripción `mt-1` (antes `mt-0.5`)

### src/components/ui/EmptyState.tsx · líneas 1-27 (reescritura)
- Línea 11: contenedor con `bg-ep-surface border border-ep-border rounded-xl shadow-sm py-14`
- Línea 12: icono `text-ep-text-disabled` y `size={44} stroke={1.25}` (antes muted, size 48)
- Línea 14: texto con `leading-relaxed`
- Línea 16: margen acción `mt-5` (antes `mt-4`)

### src/components/layout/Sidebar.tsx · líneas 1-130 (reescritura)
- Línea 64: branding rediseñado — ícono en pill verde `w-8 h-8 bg-ep-green rounded-lg` con `IconBolt` blanco
- Línea 69: título `font-bold tracking-tight` (antes `font-semibold`)
- Línea 75: toggle con `border-b border-ep-border` y clase `font-semibold` (antes `font-medium`)
- Línea 86: sección label `text-[10px] font-bold tracking-widest` (antes `text-xs font-semibold tracking-wider`)
- Líneas 94-120: ítems de nav reestructurados — wrapper `<div relative px-3 mb-0.5>` con `<span>` absoluta
  para indicador activo `w-[3px] h-6 bg-ep-green rounded-r-full` a `left-0`
- Ítem activo: `bg-ep-green-light text-ep-green-dark font-semibold` + icono `stroke={2}`
- Ítem inactivo: `font-medium` (antes `font-medium` sin diferenciación explícita)
- Badge de pendientes: `text-[10px]` (antes `text-xs`)
- Línea 125: footer `text-ep-text-disabled` (antes `text-ep-text-muted`)

### src/components/layout/TopBar.tsx · líneas 36, 45
- Línea 36: header con `shadow-sm z-10` agregados
- Línea 45: breadcrumb `font-semibold` (antes `font-medium`)

### src/components/pedidos/PedidoCard.tsx · líneas 1-112 (reescritura)
- Modo compacto (líneas 48-62): metadata inline separada por `·`, cotizaciones con `IconMessageCircle`,
  Badge alineado a `items-start` para mejor tipografía multilínea
- Modo full (líneas 64-112): metadata con `gap-4 mt-2` y `text-ep-text-secondary` (antes muted),
  descripción con `leading-relaxed`, presupuesto con `font-semibold font-mono` del valor,
  footer con `border-t border-ep-border mt-4 pt-3` separando contador de botón Cotizar

### src/components/cotizaciones/CotizacionCard.tsx · líneas 1-128 (reescritura)
- Modo compacto (líneas 64-78): precio `text-base font-bold font-mono leading-none` prominente
  (antes `text-sm font-bold`), layout con `items-start` y metadata inline con `·`
- Modo full: header con provider+zona en columna izquierda, badge top-right
- Línea 100: precio `text-2xl font-bold font-mono leading-none pb-3 border-b border-ep-border`
- Líneas 108-111: notas con `border border-ep-border` explícito además de bg-ep-surface-raised
- Estrellas: reducidas a `w-3 h-3` (antes `w-3.5 h-3.5`)

### src/components/ordenes/OrdenCard.tsx · líneas 1-55 (reescritura)
- Líneas 38-44: ID monospace con `text-[11px] uppercase tracking-wider mb-1`, proveedor en fila debajo
- Líneas 46-54: footer con `border-t border-ep-border mt-3 pt-3`, monto `text-xl leading-none`,
  fecha en `mt-1`, botón "Ir al chat" alineado a la derecha del footer

### src/pages/comprador/DashboardComprador.tsx · líneas 61-126
- Líneas 73-78: section header "Últimos pedidos" con `border-b border-ep-border pb-2.5 mb-4`,
  label `text-xs font-bold tracking-widest`, link "Ver todos" `font-semibold`
- Línea 93: gap entre cards `gap-3` (antes `gap-2`)
- Líneas 101-107: mismo tratamiento para section "Últimas cotizaciones"
- Línea 122: gap `gap-3`

### src/pages/proveedor/DashboardProveedor.tsx · líneas 52-82
- Línea 57: sección header con `border-b border-ep-border pb-2.5 mb-4` y label `tracking-widest`
- Línea 72: gap `gap-3` (antes `gap-2`)
- Línea 111: toast con `font-semibold` (antes `font-medium`)

---

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

## [v0.3.0] -- 2026-06-26 -- Layout AppShell/Sidebar/TopBar, sistema de componentes UI, componentes de dominio

### Archivos creados — Componentes UI base

- `src/components/ui/Spinner.tsx` lineas 1-25 -- SVG spinner con animacion animate-spin; props: size (sm/md/lg → 4/5/8 unidades) y color (clase Tailwind, default text-ep-green); implementado como SVG con circulo de fondo opacidad 25% y arco opacidad 75%

- `src/components/ui/Button.tsx` lineas 1-65 -- boton reutilizable; props: variant (primary/secondary/danger/ghost), size (sm/md/lg), loading (muestra Spinner + deshabilita), disabled, fullWidth, onClick, type; estilos via VARIANT_CLASSES y SIZE_CLASSES; renderiza Spinner size="sm" color="text-current" cuando loading=true

- `src/components/ui/Badge.tsx` lineas 1-30 -- etiqueta de estado; props: color (green/blue/amber/red/gray), dot (punto circular antes del texto); mapea color a clases bg-ep-*-light text-ep-*-dark; inline-flex rounded-full text-xs font-medium

- `src/components/ui/Card.tsx` lineas 1-30 -- contenedor de superficies; props: padding (none/sm/md/lg → 0/p-4/p-5/p-6), hoverable (agrega transition-shadow hover:shadow-md cursor-pointer); base: bg-ep-surface border border-ep-border rounded-xl

- `src/components/ui/Input.tsx` lineas 1-60 -- input de formulario; props: label, placeholder, value, onChange, type, error, required, disabled, min, max, step, hint; label con asterisco rojo si required; borde cambia a ep-green con ring en focus, a ep-red con ring si error; hint visible solo si no hay error

- `src/components/ui/TextArea.tsx` lineas 1-55 -- textarea de formulario; misma API que Input con rows (default 3) en lugar de min/max/step; tiene resize-none para mantener altura fija

- `src/components/ui/Select.tsx` lineas 1-65 -- select de formulario; props: label, value, onChange, options (value+label[]), placeholder (primera opcion deshabilitada), error, required, disabled; icono IconChevronDown posicionado absolute derecha con pointer-events-none; appearance-none para remover flecha nativa

- `src/components/ui/Modal.tsx` lineas 1-90 -- modal con portal; props: open, onClose, title, children, footer, size (sm/md/lg → max-w-sm/lg/2xl); usa createPortal a document.body; siempre montado en DOM con opacity/scale condicionales (transition-all duration-150) para animacion; bloquea scroll body con overflow-hidden en useEffect; cierra con tecla Escape; trampa de foco (Tab/Shift+Tab cicla entre focusables del panel); header con IconX, body, footer opcional con bg-ep-surface-raised

- `src/components/ui/index.ts` lineas 1-8 -- barrel export: re-exporta Button, Badge, Card, Input, TextArea, Select, Modal, Spinner

### Archivos creados — Layout principal

- `src/components/layout/TopBar.tsx` lineas 1-55 -- barra superior h-14; props: onToggleSidebar; slot izquierdo: boton hamburger (IconMenu2) en mobile / breadcrumb de seccion en desktop derivado de BREADCRUMB_MAP[pathname]; slot derecho: Badge de rol (green comprador / blue proveedor), separador vertical, avatar circular "ME" + "Mi Empresa" (oculto en mobile); lee useRolStore y useLocation

- `src/components/layout/Sidebar.tsx` lineas 1-120 -- sidebar de navegacion; sin props (lee stores directamente); 5 secciones: branding (IconBolt + nombre + subtitulo), toggle de rol (pill con dos botones 50/50, click → setRol + navigate), etiqueta seccion (uppercase tracking-wider), navegacion (items segun rol, activo detectado por pathname===ruta, badge amber con count cotizaciones pendientes), footer (v0.1.0); lee useRolStore y useCotizacionesStore

- `src/components/layout/AppShell.tsx` lineas 1-45 -- shell de layout; gestiona sidebarAbierto con useState; desktop: sidebar w-64 flex-shrink-0 + area flex-1; mobile: sidebar oculto, drawer fixed z-50 con overlay bg-black/40 z-40 al abrir; TopBar recibe onToggleSidebar; main con overflow-y-auto bg-ep-bg p-6 para el contenido

### Archivos creados — Componentes de dominio

- `src/components/pedidos/PedidoCard.tsx` lineas 1-85 -- card de pedido; props: pedido, compacto (default false), onCotizar; modo normal: titulo+badge estado, metadatos (cantidad/categoria/fecha con IconPackage/IconTag/IconCalendar), urgente (<3 dias) en rojo con IconAlertTriangle, descripcion line-clamp-2, presupuestoMax en font-mono, cotizaciones+boton Cotizar con IconSend; modo compacto: titulo+badge, categoria+fecha, contador; helpers estadoAColor() y estadoALabel() locales

- `src/components/cotizaciones/CotizacionCard.tsx` lineas 1-110 -- card de cotizacion; props: cotizacion, onAceptar, onRechazar, compacto; busca proveedor en PROVEEDORES_SIMULADOS por proveedorId para zona y verificado; modo normal: nombre+badge, zona+badge Verificado con IconShieldCheck, 5 estrellas (text-ep-amber llenas / text-ep-text-disabled vacias), precio en text-xl font-mono, tiempoEntrega, notas en caja bg-ep-surface-raised italic, fecha relativa, botones accion si estado=pendiente y ambas funciones presentes; modo compacto: nombre+precio+badge+entrega

- `src/components/ordenes/OrdenCard.tsx` lineas 1-55 -- card de orden; props: orden, onIrChat; muestra ID abreviado (.slice(-6).toUpperCase()) en font-mono, badge estado, proveedor con IconBuilding, monto en text-lg font-mono, fecha confirmacion, boton "Ir al chat" con IconMessage si onIrChat definido

### Archivos creados — Páginas placeholder reales

- `src/pages/comprador/DashboardComprador.tsx` -- placeholder con h1 "Dashboard" y descripcion de cuenta compradora
- `src/pages/comprador/PublicarPedido.tsx` -- placeholder con h1 "Publicar pedido"
- `src/pages/comprador/MisCotizacionesComprador.tsx` -- placeholder con h1 "Cotizaciones"
- `src/pages/comprador/MisOrdenesComprador.tsx` -- placeholder con h1 "Mis órdenes"
- `src/pages/comprador/ChatComprador.tsx` -- placeholder con h1 "Chat activo"
- `src/pages/proveedor/DashboardProveedor.tsx` -- placeholder con h1 "Dashboard"
- `src/pages/proveedor/PedidosDisponibles.tsx` -- placeholder con h1 "Pedidos disponibles"
- `src/pages/proveedor/MisCotizacionesProveedor.tsx` -- placeholder con h1 "Mis cotizaciones"
- `src/pages/proveedor/MisOrdenesProveedor.tsx` -- placeholder con h1 "Mis órdenes"
- `src/pages/proveedor/ChatProveedor.tsx` -- placeholder con h1 "Chat activo"

### Archivos modificados

- `src/router/AppRouter.tsx` lineas 1-40 -- reemplazado: eliminados PlaceholderPage y AppShell temporales; importa AppShell real de components/layout; importa las 10 paginas reales de pages/comprador y pages/proveedor; estructura de routes igual; AppShell envuelve Routes para layout persistente

---

## [v0.4.0] -- 2026-06-26 -- Paginas completas, flujos de negocio, chat en tiempo real — MVP v1.0.0

### Archivos creados — Componentes UI auxiliares

- `src/components/ui/StatCard.tsx` lineas 1-42 -- tarjeta de metrica para dashboards; props: label, value, icono (ComponentType con size/stroke), color (green/blue/amber/red), badge? (numero), sub? (texto); estructura: Card con icono en circulo w-10 h-10 rounded-xl coloreado segun prop color (bg-ep-*-light text-ep-*), label en text-xs uppercase tracking-wide, value en text-2xl font-bold font-mono, Badge amber si badge > 0, sub en text-xs muted

- `src/components/ui/EmptyState.tsx` lineas 1-28 -- estado vacio centrado; props: icono, titulo, mensaje, accion? ({label, onClick}); estructura: div text-center py-12 px-6, icono en div text-ep-text-muted justify-center mb-4 (NO se pasa className al icono directamente — envolver en div), titulo text-base font-semibold, mensaje text-sm max-w-xs mx-auto, Button primary si accion definida

- `src/components/ui/PageHeader.tsx` lineas 1-20 -- cabecera estandar de pagina; props: titulo, descripcion?, accion? (ReactNode); estructura: flex items-start justify-between mb-6, h1 text-xl font-semibold, p text-sm muted, accion con flex-shrink-0 ml-4

- `src/components/ui/index.ts` -- actualizado: agrega exports de StatCard, EmptyState, PageHeader

### Archivos creados — Componente de dominio

- `src/components/cotizaciones/CotizacionForm.tsx` lineas 1-68 -- formulario de cotizacion; props: pedidoId, onSuccess; campos: precio (number, min=1, step=100), tiempoEntrega (text), notas (textarea, opcional); validacion: precio > 0 y tiempoEntrega no vacio, setErrores si falla; al enviar valido: construye Cotizacion con proveedorId='prov-demo-001', proveedorNombre='Mi Empresa (Proveedor)', calificacion=4.0, estado='pendiente', fechaCreacion=now; llama useCotizacionesStore.getState().agregarCotizacion(); setTimeout 600ms → onSuccess() (feedback visual de procesamiento)

### Archivos modificados — Paginas comprador

- `src/pages/comprador/DashboardComprador.tsx` lineas 1-80 -- implementacion completa: calcula pedidosActivos (abierto|en_cotizacion), cotizacionesPendientes (pendiente), ordenesEnCurso (confirmada|en_transito) filtrando por COMPRADOR_ID; PageHeader con boton "Publicar pedido" → navigate('/comprador/publicar'); grid 3-col StatCards; seccion "Ultimos pedidos" (3 recientes, PedidoCard compacto) con link "Ver todos"; seccion "Ultimas cotizaciones" (3 recientes, CotizacionCard compacto) con link "Ver todas"; EmptyState cuando no hay datos

- `src/pages/comprador/PublicarPedido.tsx` lineas 1-120 -- formulario completo de publicacion; estado local: titulo/descripcion/cantidad/unidad/categoria/presupuestoMax/fechaLimite/errores/enviando/exitoso/pedidoIdSimulado; activa useSimuladorCotizaciones(pedidoIdSimulado, presupuestoMax) que empieza cuando pedidoIdSimulado != null; handleSubmit(): valida 5 campos requeridos → crea Pedido con crypto.randomUUID() → agregarPedido() → setPedidoIdSimulado() → setExitoso(true) → setTimeout 3000ms navigate('/comprador/cotizaciones'); si exitoso: banner bg-ep-green-light con IconCircleCheck + Spinner "Redirigiendo..."; formulario en 3 secciones (info, cantidad/categoria, condiciones); fecha minima = manana via fechaMinima()

- `src/pages/comprador/MisCotizacionesComprador.tsx` lineas 1-105 -- lista de cotizaciones con tabs; tabs: todas/pendientes/aceptadas/rechazadas con count en tiempo real; filtra cotizaciones por pedidoId en misPedidoIds (compradorId=COMPRADOR_ID); agrupa por pedido: encabezado text-xs uppercase + CotizacionCard con onAceptar (→ aceptarCotizacion + navigate('/comprador/ordenes')) y onRechazar; EmptyState segun tab activa

- `src/pages/comprador/MisOrdenesComprador.tsx` lineas 1-42 -- lista de ordenes del comprador; filtra por compradorId=COMPRADOR_ID, ordena por fechaConfirmacion desc; OrdenCard con onIrChat si chatHabilitado → navigate('/comprador/chat'); EmptyState con accion → navigate('/comprador/cotizaciones')

- `src/pages/comprador/ChatComprador.tsx` lineas 1-165 -- chat de comprador; ordenActiva: primera orden con compradorId=COMPRADOR_ID y chatHabilitado=true; mensajes del comprador a la DERECHA (bg-ep-green text-white rounded-tr-sm), mensajes del proveedor a la IZQUIERDA (bg-ep-surface-raised rounded-tl-sm); enviarMensaje(): crea msg comprador (autorRol='comprador', autorNombre='Mi Empresa') → limpiar input → setEscribiendo(true) → setTimeout 1800ms → respuesta automatica rotativa del proveedor (4 frases) → setEscribiendo(false); indicador "escribiendo": 3 spans con animation typing-dot delays 0/150/300ms; auto-scroll via useRef + useEffect; textarea auto-resize hasta 4 lineas (maxHeight=96px); Enter sin Shift envia; Button send disabled si input vacio o escribiendo

### Archivos modificados — Paginas proveedor

- `src/pages/proveedor/DashboardProveedor.tsx` lineas 1-95 -- implementacion completa: calcula pedidosDisponibles, misCotizaciones (PROV_IDS), misOrdenes (['prov-4','prov-demo-001']); grid 3-col StatCards (azul/verde/amber); lista 5 pedidos recientes con PedidoCard compacto + onCotizar → setPedidoSeleccionado; Modal de cotizacion con CotizacionForm; toast de exito fixed bottom-6 right-6 que desaparece en 3s

- `src/pages/proveedor/PedidosDisponibles.tsx` lineas 1-95 -- lista filtrable de pedidos; filtros: Input busqueda (titulo/descripcion) + Select categoriaFiltro; detecta si ya cotiice: cotizaciones.some(c.pedidoId===id && c.proveedorId==='prov-demo-001'); si ya cotizie: no pasa onCotizar + Badge gray "Ya cotizaste" absolute bottom-4 right-4; Modal con resumen del pedido (titulo, cantidad, unidad, categoria) + CotizacionForm; toast de exito

- `src/pages/proveedor/MisCotizacionesProveedor.tsx` lineas 1-90 -- igual que version comprador; filtra cotizaciones donde proveedorId in ['prov-1','prov-2','prov-3','prov-4','prov-demo-001']; sin botones de accion; agrupa por pedido via [...new Set(filtradas.map(c => c.pedidoId))]

- `src/pages/proveedor/MisOrdenesProveedor.tsx` lineas 1-42 -- filtra ordenes donde proveedorId in ['prov-4','prov-demo-001']; OrdenCard con onIrChat → navigate('/proveedor/chat')

- `src/pages/proveedor/ChatProveedor.tsx` lineas 1-160 -- igual que ChatComprador con logica invertida: ordenActiva busca en ['prov-4','prov-demo-001']; mensajes del PROVEEDOR a la DERECHA, del COMPRADOR a la IZQUIERDA; msg enviado: autorRol='proveedor', autorNombre='DistribuidoraElec AR'; respuestas automaticas del comprador (4 frases distintas sobre seguimiento/factura/despacho/IVA)

### Archivos modificados — CSS

- `src/index.css` lineas 65-71 -- agrega @keyframes typing-dot para animacion de puntos del indicador "escribiendo" en ambos chats: 0%/60%/100% opacity 0.2 scale 0.8; 30% opacity 1 scale 1; se usa via style={{ animation: 'typing-dot 1.2s ease-in-out Xms infinite' }} con delays 0/150/300ms por punto

---

## [v0.5.0] -- 2026-06-28 -- Login y proteccion de rutas

### Archivos creados

- `src/store/useAuthStore.ts` -- store Zustand para autenticacion; no tiene middleware persist (implementacion manual)
  · lineas 1-7   -- imports y clave localStorage CLAVE_AUTH='ep_auth'
  · lineas 9-14  -- interface AuthState: autenticado boolean, usuario string|null, actions login y logout
  · lineas 16-17 -- inicializacion: lee localStorage['ep_auth']==='true' al crear el store (sesionGuardada)
  · lineas 19-34 -- create<AuthState>: estado inicial autenticado=sesionGuardada / usuario='admin'|null
  · lineas 21-28 -- action login(usuario, password): valida 'admin'/'123456' hardcodeado; si coincide escribe ep_auth='true' y setState autenticado=true/usuario='admin', retorna true; si no, retorna false sin mutar estado
  · lineas 30-33 -- action logout(): removeItem('ep_auth'), setState autenticado=false/usuario=null

- `src/pages/Login.tsx` -- pagina de login fullscreen, sin AppShell, centrada en bg-ep-bg
  · lineas 1-7   -- imports: useState, useRef, IconBolt/IconAlertCircle de tabler, Card/Input/Button de ui, useAuthStore
  · lineas 9-17  -- estado local: usuario, password, error (boolean), cargando (boolean); ref cardRef para el shake
  · lineas 19-32 -- handleSubmit: e.preventDefault(), setError(false), setCargando(true); setTimeout 600ms → login() via getState(); si ok: store muta autenticado=true → LayoutProtegido deja pasar automaticamente; si falla: setCargando(false), setError(true), agrega clase CSS 'shake' al card y la remueve a los 400ms via setTimeout para permitir repeticion
  · lineas 34-78 -- JSX: div min-h-screen flex center; div ref={cardRef} max-w-sm; Card padding="lg" con header (IconBolt text-ep-green tamaño 32, titulo, subtitulo), separador, form con Input usuario + Input password type="password", mensaje de error condicional (bg-ep-red-light border-ep-red, IconAlertCircle, texto), Button primary fullWidth type="submit" loading={cargando}, footer v0.1.0

### Archivos modificados

- `src/router/AppRouter.tsx` -- reestructurado para agregar login y proteccion de rutas
  · lineas 1-3   -- imports: agrega Outlet (React Router) y useAuthStore
  · lineas 4      -- import Login desde '../pages/Login'
  · lineas 20-24 -- RutaProtegida: wrapper simple que lee useAuthStore.autenticado; si false → Navigate to="/login" replace; usado solo en catch-all *
  · lineas 26-33 -- LayoutProtegido: layout route (sin path) que envuelve AppShell con <Outlet />; lee useAuthStore.autenticado; si false → Navigate to="/login"; de esta forma AppShell se monta una sola vez para todas las rutas protegidas
  · lineas 35-38 -- RutaLogin: envuelve la ruta /login; si ya autenticado → Navigate to="/comprador"; si no → <Login /> (evita que usuario con sesion vea el login)
  · lineas 40-78 -- AppRouter: /login usa RutaLogin sin AppShell; layout route <LayoutProtegido> agrupa las 11 rutas de negocio (/ → /comprador, /comprador/*, /proveedor/*); catch-all * usa RutaProtegida + Navigate to="/comprador"

- `src/components/layout/TopBar.tsx` -- agrega boton logout en el slot derecho
  · lineas 1-2   -- agrega import useNavigate de react-router-dom, IconLogout de tabler, Button de ui, useAuthStore
  · lineas 30-33 -- handleLogout: llama useAuthStore.getState().logout() y navigate('/login'); LayoutProtegido detecta autenticado=false y protege el resto de rutas automaticamente
  · lineas 60-63 -- Button variant="ghost" size="sm" onClick={handleLogout} con IconLogout size 16 + texto "Salir" (oculto en mobile con hidden sm:inline)

- `src/index.css` lineas 72-79 -- agrega @keyframes shake y clase .shake para la animacion de error del login: 0%/100% translateX(0), 20% translateX(-6px), 40% translateX(6px), 60% translateX(-4px), 80% translateX(4px); duracion 0.4s ease-in-out; la clase se agrega/remueve via DOM ref en Login.tsx para poder repetirse en intentos sucesivos

- `ANTIGRAVITY.md` -- agrega seccion "Autenticacion" con descripcion de useAuthStore, RutaProtegida/LayoutProtegido/RutaLogin, Login.tsx, flujo logout, y actualiza tabla de stores y claves localStorage
