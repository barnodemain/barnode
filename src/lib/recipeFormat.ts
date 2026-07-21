// Formattazione della dose di un ingrediente per la UI del ricettario.
// Alcune "misure" sono parole (top, up) dove l'unità sarebbe ridondante.

// Unità di misura selezionabili nel form (fonte unica). Ordine per frequenza d'uso.
// Approvate una a una con l'utente; i dati esistenti sono già normalizzati a queste.
export const RECIPE_UNITS = [
  'oz', 'ml', 'lt', 'dash', 'drop', 'spoon', 'spray', 'top', 'gr', 'kg', 'pz', 'boccette', 'bt',
] as const

// Tipi di ghiaccio selezionabili nel form del cocktail (fonte unica).
// Approvati con l'utente; i dati esistenti sono già normalizzati a queste diciture.
export const RECIPE_ICE = [
  'Ghiaccio a cubi', 'Cubo grande', 'Chunk', 'Ghiaccio tritato',
] as const

const WORD_MEASURES = new Set(['top', 'up', 'q.b.', 'qb', 'top up'])

export function formatDose(misura?: string | null, unita?: string | null): string {
  const m = (misura || '').trim()
  const u = (unita || '').trim()
  if (!m && !u) return ''
  // se la misura è una parola (es. "top"), mostro solo quella; se l'unità è "up"/"top" la unisco
  if (m && WORD_MEASURES.has(m.toLowerCase())) {
    if (u && (u.toLowerCase() === 'up' || u.toLowerCase() === 'top')) return `${m} ${u}`
    return m
  }
  return [m, u].filter(Boolean).join(' ')
}
