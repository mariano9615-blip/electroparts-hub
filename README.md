# ElectroParts Hub

Marketplace B2B de electronica mayorista para Argentina.
Modelo reverse marketplace: compradores publican necesidades, proveedores compiten con cotizaciones.

## Stack
React 19 · TypeScript · Vite · Tailwind CSS v4 · Zustand · React Router v7 · @tabler/icons-react
Backend: funciones serverless de Vercel (`/api/*`) + Prisma + PostgreSQL (Supabase).

## Documentacion
- ANTIGRAVITY.md — arquitectura completa del proyecto
- CHANGELOG.md — historial de cambios con detalle de archivos y lineas
- CODEMAP.md — mapa detallado del código con números de línea

---

## Iniciar el proyecto (primera vez)

1. **Base de datos Postgres**: necesitás dos connection strings de Supabase (pooler + directo).
   Ver "Crear una base en Supabase" más abajo si no tenés proyecto todavía.
2. Copiá `.env.example` a `.env` y completá `DATABASE_URL` y `DIRECT_URL`.
3. Instalá dependencias y aplicá el schema:

```bash
npm install
npm run db:push    # crea las tablas en Supabase a partir de prisma/schema.prisma
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

## Crear una base en Supabase (gratis)

Vercel no hostea bases de datos — la Postgres vive en Supabase. El plan free de Supabase
da 500MB de base persistente (no expira por inactividad como otros free tiers) más un pooler
de conexiones (PgBouncer) ya integrado, ideal para funciones serverless.

1. Andá a https://supabase.com y creá una cuenta gratis.
2. Creá un proyecto nuevo (elegí la región más cercana; guardá la contraseña de la base que
   te pide al crearlo, la vas a necesitar para el connection string).
3. Andá a **Project Settings → Database → Connection string**. Ahí vas a ver dos:
   - **Transaction pooler** (puerto 6543) → va en `DATABASE_URL`, agregá `?pgbouncer=true` al final.
   - **Direct connection** (puerto 5432) → va en `DIRECT_URL`, la usa Prisma solo para migraciones.
4. Pegá ambas en `.env` (ver `.env.example` para el formato exacto).
5. Corré `npm run db:push` para crear las tablas.

Alternativas si preferís otro proveedor: cualquier Postgres 14+ accesible públicamente (Neon,
Railway, AWS RDS, un VPS propio) — el schema de Prisma (`prisma/schema.prisma`) es estándar.
Si el proveedor no da pooler propio, `DATABASE_URL` y `DIRECT_URL` pueden apuntar al mismo string.

## Deploy en Vercel

1. Importá el repo en Vercel (vercel.com → Add New → Project).
2. En **Environment Variables**, agregá `DATABASE_URL` y `DIRECT_URL` con los mismos connection
   strings de Supabase.
3. Deploy. Vercel detecta `vercel.json` (build de Vite + funciones en `/api`) automáticamente.
4. Verificá la conexión en `https://tu-deploy.vercel.app/api/health` — debería responder
   `{"ok":true,"db":"connected"}`.

## Notas

- `db.json` ya no se sirve en runtime (se eliminó JSON Server) — solo se usa como fuente de
  datos de ejemplo para `npm run db:seed`. Para resetear los datos de un ambiente, hay que
  borrar las filas en la base manualmente o recrear el proyecto de Supabase.
- `npm run db:studio` abre Prisma Studio (explorador visual de la base) contra el
  `DATABASE_URL` configurado. Supabase también trae su propio editor de tablas en el dashboard.
- `DIRECT_URL` solo la usa el Prisma CLI (`db:push`, `db:seed`) — las funciones en `/api` en
  runtime siempre usan el pooler (`DATABASE_URL`), nunca la conexión directa.
