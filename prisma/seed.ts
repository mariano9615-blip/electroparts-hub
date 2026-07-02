// Importa los datos actuales de db.json (JSON Server) a MySQL.
// Uso: npx prisma db seed   (requiere DATABASE_URL configurado en .env)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { PrismaClient, type Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbJsonPath = path.resolve(__dirname, '..', 'db.json');

interface DbJson {
  pedidos: Prisma.PedidoCreateManyInput[];
  cotizaciones: Prisma.CotizacionCreateManyInput[];
  ordenes: Prisma.OrdenCreateManyInput[];
  notificaciones: Prisma.NotificacionCreateManyInput[];
  mensajes: Prisma.MensajePedidoCreateManyInput[];
}

async function main() {
  const raw = readFileSync(dbJsonPath, 'utf-8');
  const data = JSON.parse(raw) as DbJson;

  console.log(`Sembrando desde ${dbJsonPath}...`);

  // Orden de inserción respeta las FK: Pedido primero, después lo que depende de él.
  const pedidos = await prisma.pedido.createMany({ data: data.pedidos, skipDuplicates: true });
  console.log(`  pedidos: ${pedidos.count}`);

  const cotizaciones = await prisma.cotizacion.createMany({
    data: data.cotizaciones,
    skipDuplicates: true,
  });
  console.log(`  cotizaciones: ${cotizaciones.count}`);

  const ordenes = await prisma.orden.createMany({ data: data.ordenes, skipDuplicates: true });
  console.log(`  ordenes: ${ordenes.count}`);

  const notificaciones = await prisma.notificacion.createMany({
    data: data.notificaciones,
    skipDuplicates: true,
  });
  console.log(`  notificaciones: ${notificaciones.count}`);

  const mensajes = await prisma.mensajePedido.createMany({
    data: data.mensajes,
    skipDuplicates: true,
  });
  console.log(`  mensajes: ${mensajes.count}`);

  console.log('Listo.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
