/**
 * Normalize article names to Title Case
 * Each word: first letter uppercase, rest lowercase
 * Collapses multiple spaces into single space
 */
export function normalizeArticleName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Calculate Levenshtein edit distance between two strings
 * Used for fuzzy matching in Analysis algorithm
 */
export function editDistance(a: string, b: string): number {
  const len1 = a.length
  const len2 = b.length
  const matrix: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0))

  for (let i = 0; i <= len1; i++) matrix[i][0] = i
  for (let j = 0; j <= len2; j++) matrix[0][j] = j

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }

  return matrix[len1][len2]
}

/**
 * Check if two non-stopword tokens are fuzzily similar
 * For tokens of length >= 3, consider them similar if edit distance <= 1
 */
export function isFuzzySimilar(token1: string, token2: string): boolean {
  // Normalize tokens for comparison
  const t1 = token1.toLowerCase().trim()
  const t2 = token2.toLowerCase().trim()

  // Exact match
  if (t1 === t2) return true

  // Both must be length >= 3 for fuzzy matching
  if (t1.length < 3 || t2.length < 3) return false

  // Use edit distance <= 1 (conservative fuzzy matching)
  return editDistance(t1, t2) <= 1
}
