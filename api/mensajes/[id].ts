import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Prisma } from '@prisma/client';
import { prisma } from '../_db';
import { handleError, methodNotAllowed, sendJson } from '../_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = String(req.query.id);

  try {
    if (req.method === 'PATCH') {
      try {
        const mensaje = await prisma.mensajePedido.update({ where: { id }, data: req.body });
        return sendJson(res, 200, mensaje);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
          return sendJson(res, 404, { error: 'not_found' });
        }
        throw e;
      }
    }

    return methodNotAllowed(res, ['PATCH']);
  } catch (e) {
    return handleError(res, e, 'api/mensajes/[id]');
  }
}
