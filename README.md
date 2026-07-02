# ElectroParts Hub

Marketplace B2B de electronica mayorista para Argentina.
Modelo reverse marketplace: compradores publican necesidades, proveedores compiten con cotizaciones.

## Stack
React 19 · TypeScript · Vite · Tailwind CSS v4 · Zustand · React Router v7 · @tabler/icons-react
Backend: funciones serverless de Vercel (`/api/*`) + Prisma + MySQL.

## Documentacion
- ANTIGRAVITY.md — arquitectura completa del proyecto
- CHANGELOG.md — historial de cambios con detalle de archivos y lineas
- CODEMAP.md — mapa detallado del código con números de línea

---

## Iniciar el proyecto (primera vez)

1. **Base de datos MySQL**: necesitás un connection string. Cualquier proveedor MySQL sirve
   (ver "Crear una base MySQL gratis" más abajo si no tenés una).
2. Copiá `.env.example` a `.env` y completá `DATABASE_URL` con tu connection string.
3. Instalá dependencias y aplicá el schema:

```bash
npm install
npm run db:push    # crea las tablas en tu MySQL a partir de prisma/schema.prisma
npm run db:seed    # (opcional) carga los datos de ejemplo de db.json
```

4. Levantá el proyecto (frontend + funciones `/api` juntos):

```bash
npm run dev
```

Esto corre `vercel dev`, que sirve Vite y las funciones serverless en el mismo origen
(`http://localhost:3000` por default). La primera vez te va a pedir loguearte con
`vercel login` y linkear el proyecto (`vercel link`) — es un paso único.

Si solo necesitás tocar UI sin backend, `npm run dev:vite` levanta nada más el frontend
(las llamadas a `/api` van a fallar sin el backend corriendo).

## Crear una base MySQL gratis (TiDB Cloud Serverless)

Vercel no hostea bases de datos — la MySQL vive en un proveedor aparte. TiDB Cloud
Serverless es compatible con el protocolo MySQL, tiene un tier gratuito real (sin tarjeta)
y está pensado para funciones serverless (pooling incluido), que es exactamente el caso de uso acá.

1. Andá a https://tidbcloud.com y creá una cuenta gratis.
2. Creá un cluster **Serverless** (tier gratuito, elegí la región más cercana).
3. En el cluster, andá a **Connect** → seleccioná driver "General" → copiá el connection
   string. Va a tener esta forma:
   ```
   mysql://<usuario>.root:<password>@gateway01.<region>.prod.aws.tidbcloud.com:4000/test?sslaccept=strict
   ```
4. Cambiá `test` por el nombre que quieras para la base (ej: `electroparts`) y pegalo en
   `.env` como `DATABASE_URL`.
5. Corré `npm run db:push` para crear las tablas.

Alternativas si preferís otro proveedor: Railway (MySQL con crédito de prueba), PlanetScale,
o cualquier MySQL 8+ accesible públicamente (AWS RDS, un VPS propio, etc.) — el schema de
Prisma (`prisma/schema.prisma`) es estándar y no depende del proveedor.

## Deploy en Vercel

1. Importá el repo en Vercel (vercel.com → Add New → Project).
2. En **Environment Variables**, agregá `DATABASE_URL` con el mismo connection string.
3. Deploy. Vercel detecta `vercel.json` (build de Vite + funciones en `/api`) automáticamente.
4. Verificá la conexión en `https://tu-deploy.vercel.app/api/health` — debería responder
   `{"ok":true,"db":"connected"}`.

## Notas

- `db.json` ya no se sirve en runtime (se eliminó JSON Server) — solo se usa como fuente de
  datos de ejemplo para `npm run db:seed`. Para resetear los datos de un ambiente, hay que
  borrar las filas en MySQL manualmente o recrear la base.
- `npm run db:studio` abre Prisma Studio (explorador visual de la base) contra el
  `DATABASE_URL` configurado.
