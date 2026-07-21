import { editDistance } from './normalize'
import type { Articolo } from '../types'

export interface ArticleGroup {
  id: string          // pairKey stabile: nomi normalizzati ordinati, join "||"
  articles: Articolo[]
  sharedKeywords: string[]  // motivo/i della somiglianza (mostrati come "Parole chiave")
}

/**
 * Normalizza un nome per il confronto di somiglianza:
 * minuscole, senza accenti, senza punteggiatura, spazi compattati.
 */
export function normalizeForCompare(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // via accenti
    .replace(/[^a-z0-9]+/g, ' ')     // via punteggiatura
    .replace(/\s+/g, ' ')
    .trim()
}

function tokensSorted(normalized: string): string {
  return normalized.split(' ').filter(Boolean).sort().join(' ')
}

/** Chiave canonica stabile per una coppia/cluster: nomi normalizzati ordinati. */
export function pairKeyFor(names: string[]): string {
  return names.map(normalizeForCompare).sort().join('||')
}

/**
 * Decide se due nomi sono "simili" secondo il livello B:
 *  - identici a parte case/accenti/punteggiatura
 *  - stesse parole in ordine diverso
 *  - refuso: distanza di edit piccola in rapporto alla lunghezza
 *  - contenimento: un nome è prefisso dell'altro con poca coda aggiunta
 *    (es. "Barolo" / "Barolo Riserva"), MA senza collegare una categoria
 *    generica all'intero catalogo.
 *
 * `categoryWords`: prime parole molto frequenti (es. "vino", "gin", "rum").
 * Se il nome più corto è UNA SOLA di queste parole, il contenimento è
 * disattivato: "Vino"/"Vino Barolo" NON viene collegato, mentre
 * "Barolo"/"Barolo Riserva" sì (perché "barolo" non è una categoria frequente).
 *
 * Ritorna il motivo (stringa) se simili, altrimenti null.
 */
export function similarityReason(
  a: string,
  b: string,
  categoryWords?: Set<string>
): string | null {
  const na = normalizeForCompare(a)
  const nb = normalizeForCompare(b)
  if (!na || !nb) return null
  if (na === nb) return 'identici'

  // parole invertite
  if (tokensSorted(na) === tokensSorted(nb)) return 'parole invertite'

  // refuso: distanza piccola in rapporto alla lunghezza
  const dist = editDistance(na, nb)
  const maxLen = Math.max(na.length, nb.length)
  const ratio = maxLen > 0 ? 1 - dist / maxLen : 0
  if (dist <= 2 && ratio >= 0.8) return 'quasi identici'

  // contenimento (livello B): uno "dentro" l'altro.
  // Requisiti anti-rumore: il più corto deve essere sostanziale (>= 4 char),
  // la coda aggiunta breve (<= 12 char) e a confine di parola.
  const shorter = na.length <= nb.length ? na : nb
  const longer = na.length <= nb.length ? nb : na
  const shorterIsBareCategory =
    !shorter.includes(' ') && !!categoryWords && categoryWords.has(shorter)
  if (
    !shorterIsBareCategory &&
    shorter.length >= 4 &&
    longer.startsWith(shorter) &&
    longer.length - shorter.length <= 12 &&
    longer.charAt(shorter.length) === ' ' // confine di parola: coda = parola/e intere
  ) {
    return 'uno contenuto nell\'altro'
  }

  // contenimento per parole (categoria davanti/dietro): il nome corto compare
  // INTERAMENTE come blocco di parole nel lungo, con 1-2 parole in più
  // (tipicamente la categoria: "Jagermeister" -> "Amaro Jagermeister";
  //  "Noilly Prat" -> "Vermouth Dry Noilly Prat").
  // Anti-rumore: il corto deve avere una parte distintiva (una parola >= 5 char
  // che non sia una categoria), così "Succo Di Lime"/"Succo Di Mango" NON matcha
  // (differiscono nella parte distintiva, non solo per categorie aggiunte).
  const wShort = shorter.split(' ').filter(Boolean)
  const wLong = longer.split(' ').filter(Boolean)
  const wordDiff = wLong.length - wShort.length
  if (
    !shorterIsBareCategory &&
    (wordDiff === 1 || wordDiff === 2) &&
    wShort.length >= 1 &&
    isWordSubsequenceBlock(wShort, wLong) &&
    hasDistinctiveWord(wShort, categoryWords)
  ) {
    return 'uno contenuto nell\'altro'
  }

  return null
}

/** true se `sub` compare come blocco contiguo di parole dentro `full`. */
function isWordSubsequenceBlock(sub: string[], full: string[]): boolean {
  if (sub.length === 0 || sub.length > full.length) return false
  for (let start = 0; start + sub.length <= full.length; start++) {
    let ok = true
    for (let k = 0; k < sub.length; k++) {
      if (full[start + k] !== sub[k]) { ok = false; break }
    }
    if (ok) return true
  }
  return false
}

/** true se tra le parole c'è almeno un termine distintivo (>= 5 char, non categoria). */
function hasDistinctiveWord(words: string[], categoryWords?: Set<string>): boolean {
  return words.some(w => w.length >= 5 && !(categoryWords && categoryWords.has(w)))
}

/** Prime parole che compaiono in >= 3 articoli: categorie di fatto. */
function computeCategoryWords(articoli: Articolo[]): Set<string> {
  const counts = new Map<string, number>()
  for (const a of articoli) {
    const first = normalizeForCompare(a.nome).split(' ').filter(Boolean)[0]
    if (first) counts.set(first, (counts.get(first) || 0) + 1)
  }
  const set = new Set<string>()
  counts.forEach((c, w) => { if (c >= 3) set.add(w) })
  return set
}

/**
 * Trova gruppi di articoli con nomi SIMILI (non per categoria).
 * Usa union-find: articoli collegati da somiglianza a coppie finiscono
 * nello stesso cluster (transitività). Ogni cluster con >= 2 articoli
 * diventa un gruppo con id = pairKey stabile.
 */
export function groupArticlesBySharedKeywords(articoli: Articolo[]): ArticleGroup[] {
  const n = articoli.length
  if (n < 2) return []

  const categoryWords = computeCategoryWords(articoli)

  const parent = Array.from({ length: n }, (_, i) => i)
  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]
      x = parent[x]
    }
    return x
  }
  const union = (x: number, y: number) => {
    const rx = find(x)
    const ry = find(y)
    if (rx !== ry) parent[rx] = ry
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (similarityReason(articoli[i].nome, articoli[j].nome, categoryWords)) {
        union(i, j)
      }
    }
  }

  // raccogli i cluster
  const clusters = new Map<number, number[]>()
  for (let i = 0; i < n; i++) {
    const r = find(i)
    if (!clusters.has(r)) clusters.set(r, [])
    clusters.get(r)!.push(i)
  }

  // ricalcola i motivi per ciascun cluster (solo tra i suoi membri)
  const groups: ArticleGroup[] = []
  clusters.forEach(indices => {
    if (indices.length < 2) return
    const clusterArticles = indices
      .map(i => articoli[i])
      .sort((a, b) => a.nome.localeCompare(b.nome))

    const clusterReasons = new Set<string>()
    for (let i = 0; i < clusterArticles.length; i++) {
      for (let j = i + 1; j < clusterArticles.length; j++) {
        const reason = similarityReason(clusterArticles[i].nome, clusterArticles[j].nome, categoryWords)
        if (reason) clusterReasons.add(reason)
      }
    }

    groups.push({
      id: pairKeyFor(clusterArticles.map(a => a.nome)),
      articles: clusterArticles,
      sharedKeywords: Array.from(clusterReasons),
    })
  })

  // più articoli prima
  return groups.sort((a, b) => b.articles.length - a.articles.length)
}
