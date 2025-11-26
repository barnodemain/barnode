import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let effectiveUrl = SUPABASE_URL;
let effectiveKey = SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[Barnode Web] VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY mancanti. ' +
      'Verifica le variabili in .env.local. Verrà usato un client di fallback che farà fallire le query.'
  );

  // Client di fallback verso host invalido per evitare crash ma rendere evidenti gli errori.
  effectiveUrl = 'https://example.invalid';
  effectiveKey = 'missing-anon-key';
}

// In futuro si può tipizzare con un Database generato da Supabase.
export const supabase: SupabaseClient = createClient(
  effectiveUrl as string,
  effectiveKey as string
);

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
