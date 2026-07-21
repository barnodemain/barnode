export interface Articolo {
  id: string
  nome: string
  created_at: string
}

export interface MissingItem {
  id: string
  articolo_id: string
  created_at: string
}

export interface MissingItemWithRelation {
  id: string
  articoloId: string
  articoloNome: string
}

// ---- Ricettario ----

export interface RecipeIngredient {
  id: string
  nome: string
  misura: string | null
  unita: string | null
  preparationId?: string | null   // solo per ingredienti cocktail: link a una preparazione
  sortOrder: number
}

export interface Cocktail {
  id: string
  nome: string
  bicchiere: string | null
  ghiaccio: string | null
  metodo: string | null
  garnish: string | null
  note: string | null
  sortOrder: number
  ingredienti: RecipeIngredient[]
}

export interface Preparation {
  id: string
  nome: string
  categoria: string | null
  procedimento: string | null
  note: string | null
  sortOrder: number
  ingredienti: RecipeIngredient[]
}
