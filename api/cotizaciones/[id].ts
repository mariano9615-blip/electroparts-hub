import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Prisma } from '@prisma/client';
import { prisma } from '../_db';
import { handleError, methodNotAllowed, sendJson } from '../_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = String(req.query.id);

  try {
    if (req.method === 'PATCH') {
      try {
        const cotizacion = await prisma.cotizacion.update({ where: { id }, data: req.body });
        return sendJson(res, 200, cotizacion);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
          return sendJson(res, 404, { error: 'not_found' });
        }
        throw e;
      }
    }

    if (req.method === 'DELETE') {
      try {
        await prisma.cotizacion.delete({ where: { id } });
        return res.status(200).json({ ok: true });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
          return sendJson(res, 404, { error: 'not_found' });
        }
        throw e;
      }
    }

    return methodNotAllowed(res, ['PATCH', 'DELETE']);
  } catch (e) {
    return handleError(res, e, 'api/cotizaciones/[id]');
  }
}
