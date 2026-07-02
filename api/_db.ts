import { PrismaClient } from '@prisma/client';

// Patrón singleton para serverless: cachea el cliente en `globalThis` para reusar la
// conexión entre invocaciones de una misma instancia "warm" de la función, en vez de
// abrir una conexión nueva a MySQL en cada request (agotaría el pool rápido en Vercel).
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}
