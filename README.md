# ElectroParts Hub

Marketplace B2B de electronica mayorista para Argentina.
Modelo reverse marketplace: compradores publican necesidades, proveedores compiten con cotizaciones.

## Iniciar el proyecto

```
npm install
npm run dev:full
```

Abre en http://localhost:5173

## Documentacion
- ANTIGRAVITY.md -- arquitectura completa del proyecto
- CHANGELOG.md -- historial de cambios con detalle de archivos y lineas

## Stack
React 19 - TypeScript - Vite - Tailwind CSS v4 - Zustand - React Router v7 - @tabler/icons-react - JSON Server

---

## Desarrollo en equipo

Los datos se comparten via JSON Server (REST API local). Dos usuarios en la misma red pueden trabajar con el mismo conjunto de datos.

### Requisitos

- Node 18+
- Git

### Como levantar como host (quien sirve los datos)

```bash
npm install
npm run dev:full
```

Esto levanta JSON Server en el puerto 3001 y Vite en el puerto 5173 en paralelo.

### Como levantar como colaborador (quien se conecta al host)

1. Busca tu IP local en Windows: abre una terminal y ejecuta `ipconfig`. Busca la entrada **Dirección IPv4** (ejemplo: `192.168.1.100`).
2. Crea un archivo `.env.local` en la raíz del proyecto con la IP del host:

```
VITE_API_URL=http://192.168.1.100:3001
```

3. Inicia solo el frontend:

```bash
npm run dev
```

El colaborador se conecta al JSON Server del host. Ambos ven y modifican los mismos datos en tiempo real (previo refresh).

### Notas

- El archivo `db.json` en la raíz contiene los datos iniciales del demo.
- JSON Server expone los endpoints en `http://localhost:3001/pedidos`, `/cotizaciones`, `/ordenes`, `/notificaciones`.
- Para resetear los datos al estado inicial: restaura `db.json` desde git (`git checkout db.json`).
