import { defineConfig, devices } from '@playwright/test'

// Suite E2E isolata: NON entra nel bundle di produzione.
// I test mockano le chiamate Supabase: nessuna scrittura su dati reali.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Mobile su chromium (Pixel 5) per non richiedere il download di WebKit:
    // sufficiente per test funzionali e di navigazione su viewport mobile.
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  // Avvia il dev server prima dei test e lo spegne alla fine
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5001',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
