import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { handleError, methodNotAllowed, sendJson } from '../_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const notificaciones = await prisma.notificacion.findMany({ orderBy: { fecha: 'desc' } });
      return sendJson(res, 200, notificaciones);
    }

    if (req.method === 'POST') {
      const notificacion = await prisma.notificacion.create({ data: req.body });
      return sendJson(res, 201, notificacion);
    }

    return methodNotAllowed(res, ['GET', 'POST']);
  } catch (e) {
    return handleError(res, e, 'api/notificaciones');
  }
}
