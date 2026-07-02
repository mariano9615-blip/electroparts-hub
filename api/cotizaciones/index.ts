import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { handleError, methodNotAllowed, sendJson } from '../_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const pedidoId = typeof req.query.pedidoId === 'string' ? req.query.pedidoId : undefined;
      const cotizaciones = await prisma.cotizacion.findMany({
        where: pedidoId ? { pedidoId } : undefined,
        orderBy: { fechaCreacion: 'desc' },
      });
      return sendJson(res, 200, cotizaciones);
    }

    if (req.method === 'POST') {
      const cotizacion = await prisma.cotizacion.create({ data: req.body });
      return sendJson(res, 201, cotizacion);
    }

    return methodNotAllowed(res, ['GET', 'POST']);
  } catch (e) {
    return handleError(res, e, 'api/cotizaciones');
  }
}
