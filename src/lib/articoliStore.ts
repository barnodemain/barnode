import type { Articolo } from '../types'

// Store in-memory condiviso per gli articoli: evita il refetch ad ogni cambio
// pagina. I dati vengono caricati una volta e riusati; le mutazioni aggiornano
// la cache e notificano tutte le viste montate. Non persiste (solo durante la sessione).

let cache: Articolo[] | null = null
const listeners = new Set<() => void>()

export function getArticoliCache(): Articolo[] | null {
  return cache
}

export function setArticoliCache(next: Articolo[]) {
  cache = next
  listeners.forEach(l => l())
}

export function clearArticoliCache() {
  cache = null
}

export function subscribeArticoli(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
