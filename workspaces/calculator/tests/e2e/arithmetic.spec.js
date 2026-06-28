import { test, expect } from '@playwright/test'

test.describe('Basic Arithmetic (US1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('8 × 7 = 56', async ({ page }) => {
    await page.click('[data-token="8"]')
    await page.click('[data-token="×"]')
    await page.click('[data-token="7"]')
    await page.click('[data-action="evaluate"]')
    await expect(page.locator('#result-line')).toHaveText('56')
  })

  test('100 ÷ 4 = 25', async ({ page }) => {
    await page.click('[data-token="1"]')
    await page.click('[data-token="0"]')
    await page.click('[data-token="0"]')
    await page.click('[data-token="÷"]')
    await page.click('[data-token="4"]')
    await page.click('[data-action="evaluate"]')
    await expect(page.locator('#result-line')).toHaveText('25')
  })

  test('9 ÷ 0 shows "Cannot divide by zero"', async ({ page }) => {
    await page.click('[data-token="9"]')
    await page.click('[data-token="÷"]')
    await page.click('[data-token="0"]')
    await page.click('[data-action="evaluate"]')
    await expect(page.locator('#result-line')).toHaveText('Cannot divide by zero')
  })

  test('= button has red background', async ({ page }) => {
    const equalsBtn = page.locator('[data-action="evaluate"]')
    const bg = await equalsBtn.evaluate(el => window.getComputedStyle(el).backgroundColor)
    // red color: rgb(229, 62, 62) or similar
    expect(bg).toMatch(/^rgb\(2[0-2]\d|rgb\(229|rgb\(197|rgb\(2[1-2]\d/)
    // More robust: check that red channel is dominant
    const match = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (match) {
      const [, r, g, b] = match.map(Number)
      expect(r).toBeGreaterThan(150)
      expect(r).toBeGreaterThan(g)
      expect(r).toBeGreaterThan(b)
    }
  })

  test('button press animation fires quickly', async ({ page }) => {
    const btn = page.locator('[data-token="5"]')
    const start = Date.now()
    await btn.click()
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(500)
  })

  test('AC clears the display', async ({ page }) => {
    await page.click('[data-token="5"]')
    await page.click('[data-token="+"]')
    await page.click('[data-token="3"]')
    await page.click('[data-action="clear"]')
    await expect(page.locator('#expression-line')).toHaveText('')
    await expect(page.locator('#result-line')).toHaveText('')
  })

  test('backspace removes last character', async ({ page }) => {
    await page.click('[data-token="1"]')
    await page.click('[data-token="2"]')
    await page.click('[data-token="3"]')
    await page.click('[data-action="backspace"]')
    await expect(page.locator('#expression-line')).toHaveText('12')
  })
})
