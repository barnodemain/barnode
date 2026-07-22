import type { Page } from '@playwright/test'

// Dati finti per i test: nessuna chiamata al DB reale.
const ARTICOLI = [
  { id: '11111111-1111-1111-1111-111111111111', nome: 'Vodka Belvedere', created_at: '2025-01-01T00:00:00Z' },
  { id: '22222222-2222-2222-2222-222222222222', nome: 'Vodka Grey Goose', created_at: '2025-01-01T00:00:00Z' },
  { id: '33333333-3333-3333-3333-333333333333', nome: 'Gin Bombay', created_at: '2025-01-01T00:00:00Z' },
]
// La Home interroga missing_items con join annidata articoli(nome).
const MISSING = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    articolo_id: '11111111-1111-1111-1111-111111111111',
    articolo_nome: 'Vodka Belvedere',
    created_at: '2025-01-01T00:00:00Z',
    articoli: { nome: 'Vodka Belvedere' },
  },
]

// Intercetta TUTTE le chiamate al dominio Supabase e risponde con dati finti.
// Qualsiasi scrittura (POST/PATCH/DELETE) viene assorbita senza toccare il DB reale.
export async function mockSupabase(page: Page) {
  await page.route(/supabase\.co\/rest\/v1\/.*/, async (route) => {
    const url = route.request().url()
    const method = route.request().method()

    if (method !== 'GET') {
      // Scritture: rispondi ok ma non persistere nulla di reale
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
      return
    }

    let body: unknown = []
    if (url.includes('/articoli')) body = ARTICOLI
    else if (url.includes('/missing_items')) body = MISSING
    else if (url.includes('/backups_barnode')) body = []

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'content-range': '0-2/3' },
      body: JSON.stringify(body),
    })
  })
}

// Salta lo splash screen che appare alla prima apertura per sessione.
export async function skipSplash(page: Page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('hasSeenSplash', 'true')
  })
}
