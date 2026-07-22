// Formattazione della dose di un ingrediente per la UI del ricettario.
// Alcune "misure" sono parole (top, up) dove l'unità sarebbe ridondante.
import { normalizeForCompare } from './analysisGrouping'
import type { Preparation } from '../types'

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

// Cerca nel testo del garnish (o di qualsiasi testo libero) una preparazione
// citata: la prima il cui nome normalizzato è contenuto come blocco di parole
// nel testo. Serve a mostrare l'icona "ricetta" anche nel garnish, come per
// gli ingredienti collegati. A parità, preferisce il nome più lungo (match più
// specifico). Restituisce la preparazione o null.
export function findPreparationInText(
  text: string | null | undefined,
  preparations: Preparation[],
): Preparation | null {
  const t = normalizeForCompare(text || '')
  if (!t) return null
  const haystack = ` ${t} `
  let best: Preparation | null = null
  let bestLen = 0
  for (const p of preparations) {
    const n = normalizeForCompare(p.nome)
    if (!n) continue
    // match a confine di parola (evita "aria" dentro "ariano")
    if (haystack.includes(` ${n} `) && n.length > bestLen) {
      best = p
      bestLen = n.length
    }
  }
  return best
}

// Separa una stringa garnish nelle sue due parti logiche: la preparazione
// collegata (se il testo la cita) e il "resto" (testo libero senza il nome
// della preparazione, ripulito da virgole/spazi ai bordi). Serve al form per
// mostrare la preparazione come chip non modificabile + il resto come testo.
export function splitGarnish(
  garnish: string | null | undefined,
  preparations: Preparation[],
): { prep: Preparation | null; rest: string } {
  const text = (garnish || '').trim()
  const prep = findPreparationInText(text, preparations)
  if (!prep) return { prep: null, rest: text }
  // rimuove il nome della preparazione dal testo, gestendo la virgola adiacente
  const escaped = prep.nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const rest = text
    .replace(new RegExp(`\\s*,?\\s*${escaped}\\s*,?\\s*`, 'i'), ' ')
    .replace(/\s+/g, ' ')
    .replace(/^\s*,\s*|\s*,\s*$/g, '')
    .trim()
  return { prep, rest }
}

// Ricompone la stringa garnish da salvare: nome della preparazione (se presente)
// + testo libero, uniti con uno spazio (niente virgola automatica). Inverso di splitGarnish.
export function joinGarnish(prepName: string | null | undefined, rest: string): string {
  const r = (rest || '').trim()
  const p = (prepName || '').trim()
  if (p && r) return `${p} ${r}`
  return p || r
}
