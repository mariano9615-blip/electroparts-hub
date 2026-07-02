import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { handleError, methodNotAllowed, sendJson } from '../_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const ordenes = await prisma.orden.findMany({ orderBy: { fechaConfirmacion: 'desc' } });
      return sendJson(res, 200, ordenes);
    }

    if (req.method === 'POST') {
      const orden = await prisma.orden.create({ data: req.body });
      return sendJson(res, 201, orden);
    }

    return methodNotAllowed(res, ['GET', 'POST']);
  } catch (e) {
    return handleError(res, e, 'api/ordenes');
  }
}
