import type { VercelResponse } from '@vercel/node';

export function sendJson(res: VercelResponse, status: number, body: unknown) {
  res.status(status).json(body);
}

export function methodNotAllowed(res: VercelResponse, allowed: string[]) {
  res.setHeader('Allow', allowed.join(', '));
  res.status(405).json({ error: `Method not allowed. Allowed: ${allowed.join(', ')}` });
}

export function handleError(res: VercelResponse, e: unknown, context: string) {
  console.error(`${context}:`, e);
  res.status(500).json({ error: 'internal_error' });
}
