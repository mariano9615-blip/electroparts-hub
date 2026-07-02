import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { handleError, methodNotAllowed, sendJson } from '../_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const pedidoId = typeof req.query.pedidoId === 'string' ? req.query.pedidoId : undefined;
      const mensajes = await prisma.mensajePedido.findMany({
        where: pedidoId ? { pedidoId } : undefined,
        orderBy: { timestamp: 'asc' },
      });
      return sendJson(res, 200, mensajes);
    }

    if (req.method === 'POST') {
      const mensaje = await prisma.mensajePedido.create({ data: req.body });
      return sendJson(res, 201, mensaje);
    }

    return methodNotAllowed(res, ['GET', 'POST']);
  } catch (e) {
    return handleError(res, e, 'api/mensajes');
  }
}
