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
<!-- Claude Code: agregar entradas siguientes a partir de aqui en formato:
## [vX.Y.Z] -- YYYY-MM-DD -- Descripcion
### Archivos creados/modificados
- ruta/archivo.tsx lineas X-Y -- descripcion de funcionalidad especifica
-->
