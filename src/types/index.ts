export interface Articolo {
  id: string
  nome: string
  created_at: string
}

export interface MissingItem {
  id: string
  articolo_id: string
  articolo_nome: string
  created_at: string
}
