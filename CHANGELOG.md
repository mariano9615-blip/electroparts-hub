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
