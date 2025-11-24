import { createClient } from '@supabase/supabase-js';

// In Expo, le variabili pubbliche vanno esposte come EXPO_PUBLIC_*
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Manteniamo un errore esplicito in sviluppo: in produzione queste env devono essere configurate.
  console.warn('[Supabase] Variabili EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY mancanti');
}

export const supabase = createClient(
  SUPABASE_URL ?? 'https://example.invalid',
  SUPABASE_ANON_KEY ?? 'missing-key'
);
