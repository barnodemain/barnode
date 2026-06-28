import type { MissingItemWithRelation } from '../types'

// Store in-memory condiviso per gli articoli mancanti: evita il refetch ad ogni
// cambio pagina (stesso pattern di articoliStore). Non persiste.

let cache: MissingItemWithRelation[] | null = null
const listeners = new Set<() => void>()

export function getMissingCache(): MissingItemWithRelation[] | null {
  return cache
}

export function setMissingCache(next: MissingItemWithRelation[]) {
  cache = next
  listeners.forEach(l => l())
}

export function clearMissingCache() {
  cache = null
}

export function subscribeMissing(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
