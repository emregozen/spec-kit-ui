import { test, expect } from '@playwright/test'

test.describe('Theme Toggle (US4)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/')
    await page.evaluate(() => localStorage.removeItem('calculator-theme'))
    await page.reload()
  })

  test('toggle switches to dark mode', async ({ page }) => {
    await page.click('#theme-toggle')
    const theme = await page.evaluate(() => document.documentElement.dataset.theme)
    expect(theme).toBe('dark')
  })

  test('preference persists after page reload', async ({ page }) => {
    await page.click('#theme-toggle')
    await page.reload()
    const theme = await page.evaluate(() => document.documentElement.dataset.theme)
    expect(theme).toBe('dark')
  })

  test('toggle back restores light mode', async ({ page }) => {
    await page.click('#theme-toggle')
    await page.click('#theme-toggle')
    const theme = await page.evaluate(() => document.documentElement.dataset.theme)
    expect(theme).toBe('light')
  })

  test('no FOUC on load with saved dark preference', async ({ page }) => {
    // Set dark theme in localStorage then reload
    await page.evaluate(() => localStorage.setItem('calculator-theme', 'dark'))
    await page.reload()
    // Check that theme is immediately dark (FOUC script applied it before main.js)
    const theme = await page.evaluate(() => document.documentElement.dataset.theme)
    expect(theme).toBe('dark')
  })
})
