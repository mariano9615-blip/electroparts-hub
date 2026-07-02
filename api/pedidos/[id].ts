import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Prisma } from '@prisma/client';
import { prisma } from '../_db';
import { handleError, methodNotAllowed, sendJson } from '../_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = String(req.query.id);

  try {
    if (req.method === 'GET') {
      const pedido = await prisma.pedido.findUnique({ where: { id } });
      if (!pedido) return sendJson(res, 404, { error: 'not_found' });
      return sendJson(res, 200, pedido);
    }

    if (req.method === 'PATCH') {
      try {
        const pedido = await prisma.pedido.update({ where: { id }, data: req.body });
        return sendJson(res, 200, pedido);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
          return sendJson(res, 404, { error: 'not_found' });
        }
        throw e;
      }
    }

    if (req.method === 'DELETE') {
      try {
        // Cascade a nivel de DB: cotizaciones y mensajes del pedido se borran solos (onDelete: Cascade),
        // las ordenes asociadas quedan con pedidoId=null (onDelete: SetNull) — igual comportamiento que db.json.
        await prisma.pedido.delete({ where: { id } });
        return res.status(200).json({ ok: true });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
          return sendJson(res, 404, { error: 'not_found' });
        }
        throw e;
      }
    }

    return methodNotAllowed(res, ['GET', 'PATCH', 'DELETE']);
  } catch (e) {
    return handleError(res, e, 'api/pedidos/[id]');
  }
}
