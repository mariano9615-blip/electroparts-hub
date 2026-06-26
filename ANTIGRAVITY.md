# ANTIGRAVITY.md -- ElectroParts Hub
## Fuente de verdad arquitectonica. Leer completo antes de cualquier cambio.

> Esqueleto inicial generado por script. Claude Code debe completar y mantener
> este archivo despues de cada sesion de desarrollo.

## Stack y versiones
- React 18
- TypeScript
- Vite 8
- Tailwind CSS v3
- Zustand
- React Router v6
- @tabler/icons-react

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
  router/          -- definicion de rutas

## Modulos y responsabilidades
(Claude Code: completar por modulo post-implementacion)

## Flujos de negocio implementados
(Claude Code: completar al implementar cada flujo)

## Convenciones del proyecto
- UI completamente en espanol
- Nombres tecnicos de archivos y funciones en ingles (convencion React/TS)
- Colores hardcodeados en hex via tailwind.config.js -- nunca variables CSS del sistema
- Estado global via Zustand -- nunca useState para logica de negocio
- Persistencia via localStorage encapsulada en cada store
- Un archivo por componente
- Exports nombrados para componentes reutilizables, default para paginas
- Props siempre tipadas con interface NombreComponenteProps
- Comentarios en el codigo en espanol

## Comandos utiles
npm run dev      # Servidor local en http://localhost:5173
npm run build    # Build de produccion
npm run lint     # Linting
