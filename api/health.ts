import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_db';

// GET /api/health — verifica que la función serverless puede conectarse a MySQL.
// Útil para confirmar la configuración de DATABASE_URL después de un deploy.
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ok: true, db: 'connected' });
  } catch (e) {
    console.error('api/health:', e);
    res.status(500).json({ ok: false, error: 'db_unreachable' });
  }
}
