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
