import { test, expect } from '@playwright/test'
import { mockSupabase, skipSplash } from './helpers'

// Screenshot delle pagine principali (regressioni visive evidenti).
// Gli screenshot finiscono in test-results/ (ignorato da git).
const pages = [
  { name: 'home', path: '/' },
  { name: 'archivio', path: '/archivio' },
  { name: 'note', path: '/settings/notes' },
]

test.beforeEach(async ({ page }) => {
  await skipSplash(page)
  await mockSupabase(page)
})

for (const p of pages) {
  test(`screenshot ${p.name}`, async ({ page }, testInfo) => {
    await page.goto(p.path)
    await page.waitForLoadState('networkidle')
    const shot = await page.screenshot({ fullPage: true })
    await testInfo.attach(`${p.name}-${testInfo.project.name}`, {
      body: shot,
      contentType: 'image/png',
    })
    // sanity: la pagina ha renderizzato qualcosa
    await expect(page.locator('#root')).not.toBeEmpty()
  })
}
