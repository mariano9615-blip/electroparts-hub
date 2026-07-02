// supabase/seed.ts
// Uso: npx ts-node supabase/seed.ts
// Requiere VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!,
);

async function seed() {
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf-8'));

  const tablas = [
    'usuarios',
    'pedidos',
    'cotizaciones',
    'ordenes',
    'mensajes',
    'notificaciones',
    'calificaciones',
  ];

  for (const tabla of tablas) {
    const registros = db[tabla] ?? [];
    if (registros.length === 0) {
      console.log(`${tabla}: sin datos, saltando`);
      continue;
    }
    const { error } = await supabase.from(tabla).insert(registros);
    if (error) {
      console.error(`Error en ${tabla}:`, error.message);
    } else {
      console.log(`${tabla}: ${registros.length} registros insertados`);
    }
  }

  console.log('Migración completada');
}

seed().catch(console.error);
