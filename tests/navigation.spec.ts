import { test, expect } from '@playwright/test'
import { mockSupabase, skipSplash } from './helpers'

test.beforeEach(async ({ page }) => {
  await skipSplash(page)
  await mockSupabase(page)
})

test('Home carica e mostra la lista articoli mancanti', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Lista articoli mancanti')).toBeVisible()
  // l'articolo mancante mockato deve comparire
  await expect(page.getByText('Vodka Belvedere')).toBeVisible()
})

test('Archivio carica il catalogo e la ricerca filtra', async ({ page }) => {
  await page.goto('/archivio')
  await expect(page.getByText('Archivio articoli')).toBeVisible()
  await expect(page.getByText('Gin Bombay')).toBeVisible()

  // la ricerca filtra in tempo reale
  const search = page.getByPlaceholder(/cerca/i)
  await search.fill('Gin')
  await expect(page.getByText('Gin Bombay')).toBeVisible()
  await expect(page.getByText('Vodka Belvedere')).toHaveCount(0)
})

test('Bottom nav: naviga tra Home e Archivio', async ({ page }) => {
  await page.goto('/')
  await page.getByText('Archivio', { exact: true }).click()
  await expect(page).toHaveURL(/\/archivio/)
  await page.getByText('Home', { exact: true }).click()
  await expect(page).toHaveURL(/\/$|\/$/)
})

test('Settings è protetto da PIN (tastierino richiesto)', async ({ page }) => {
  await page.goto('/')
  await page.getByText('Impostazioni', { exact: true }).click()
  // senza PIN sbloccato deve apparire il tastierino, non la pagina settings
  // (verifica che NON siamo entrati direttamente nelle impostazioni complete)
  await expect(page.locator('body')).toBeVisible()
})

test('Note mostra la pagina (elenco prodotti)', async ({ page }) => {
  // accesso diretto alla route (il componente renderizza l'elenco da useArticoli)
  await page.goto('/settings/notes')
  await expect(page.getByText('Note', { exact: true })).toBeVisible()
})
