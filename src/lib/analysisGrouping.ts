import type { Articolo } from '../types'

export interface ArticleGroup {
  id: string
  articles: Articolo[]
  sharedKeywords: string[]
}

export function getCategory(name: string): string | null {
  const normalized = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
  const firstWord = normalized.split(/\s+/).find(Boolean)
  return firstWord || null
}

export function groupArticlesBySharedKeywords(articoli: Articolo[]): ArticleGroup[] {
  if (articoli.length === 0) return []

  // Raggruppa per parola chiave principale (prima parola normalizzata)
  const categoryMap = new Map<string, Articolo[]>()
  articoli.forEach(article => {
    const category = getCategory(article.nome)
    if (!category) return
    if (!categoryMap.has(category)) {
      categoryMap.set(category, [])
    }
    categoryMap.get(category)!.push(article)
  })

  const allGroups: ArticleGroup[] = []

  categoryMap.forEach(categoryArticles => {
    if (categoryArticles.length < 2) return
    // Tutti gli articoli con la stessa categoria (prima parola) formano un unico gruppo
    const sortedArticles = [...categoryArticles].sort((a, b) => a.nome.localeCompare(b.nome))
    const groupIds = sortedArticles.map(a => a.id)
    // ID di gruppo stabile: insieme di ID ordinati alfabeticamente, indipendente dall'ordine o da rinomini
    const stableGroupKey = [...groupIds].sort().join('|')

    allGroups.push({
      id: stableGroupKey,
      articles: sortedArticles,
      sharedKeywords: [getCategory(sortedArticles[0].nome) || '']
    })
  })

  // Deduplica globalmente per insieme di articoli
  const uniqueGroups = new Map<string, ArticleGroup>()
  allGroups.forEach(group => {
    const key = group.articles.map(a => a.id).sort().join('|')
    if (!uniqueGroups.has(key)) {
      uniqueGroups.set(key, group)
    }
  })

  return Array.from(uniqueGroups.values()).sort((a, b) => b.articles.length - a.articles.length)
}
