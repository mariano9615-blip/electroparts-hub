import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { handleError, methodNotAllowed, sendJson } from '../_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const pedidos = await prisma.pedido.findMany({ orderBy: { fechaCreacion: 'desc' } });
      return sendJson(res, 200, pedidos);
    }

    if (req.method === 'POST') {
      const pedido = await prisma.pedido.create({ data: req.body });
      return sendJson(res, 201, pedido);
    }

    return methodNotAllowed(res, ['GET', 'POST']);
  } catch (e) {
    return handleError(res, e, 'api/pedidos');
  }
}
