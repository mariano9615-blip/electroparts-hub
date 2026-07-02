import { createClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// createClient valida que supabaseUrl sea una URL http(s) real y tira excepción si no lo es.
// Mientras las claves reales no estén configuradas (Parte B), api.ts importa este módulo
// igual en modo 'jsonserver', así que hace falta una URL dummy válida para que no rompa el arranque.
const supabaseUrl = envUrl && envUrl !== 'PENDIENTE' ? envUrl : 'https://placeholder.supabase.co';
const supabaseAnonKey = envAnonKey && envAnonKey !== 'PENDIENTE' ? envAnonKey : 'placeholder-anon-key';

// El cliente se exporta pero solo se usa cuando VITE_DATA_SOURCE === 'supabase'.
// Si las claves son PENDIENTE, el cliente existe pero no se llama.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
