import { test, expect } from '@playwright/test'

test.describe('Scientific Functions (US2)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('√(49) = 7', async ({ page }) => {
    await page.click('[data-token="√("]')
    await page.click('[data-token="4"]')
    await page.click('[data-token="9"]')
    await page.click('[data-token=")"]')
    await page.click('[data-action="evaluate"]')
    await expect(page.locator('#result-line')).toHaveText('7')
  })

  test('2^10 = 1024', async ({ page }) => {
    await page.click('[data-token="2"]')
    await page.click('[data-token="^"]')
    await page.click('[data-token="1"]')
    await page.click('[data-token="0"]')
    await page.click('[data-action="evaluate"]')
    await expect(page.locator('#result-line')).toHaveText('1024')
  })

  test('sin(30) = 0.5', async ({ page }) => {
    await page.click('[data-token="sin("]')
    await page.click('[data-token="3"]')
    await page.click('[data-token="0"]')
    await page.click('[data-token=")"]')
    await page.click('[data-action="evaluate"]')
    const text = await page.locator('#result-line').textContent()
    expect(parseFloat(text)).toBeCloseTo(0.5, 5)
  })

  test('3 + 4 × 2 = 11 (order of operations)', async ({ page }) => {
    await page.click('[data-token="3"]')
    await page.click('[data-token="+"]')
    await page.click('[data-token="4"]')
    await page.click('[data-token="×"]')
    await page.click('[data-token="2"]')
    await page.click('[data-action="evaluate"]')
    await expect(page.locator('#result-line')).toHaveText('11')
  })

  test('√(-1) shows "Invalid input"', async ({ page }) => {
    await page.click('[data-token="√("]')
    await page.click('[data-token="-"]')
    await page.click('[data-token="1"]')
    await page.click('[data-token=")"]')
    await page.click('[data-action="evaluate"]')
    await expect(page.locator('#result-line')).toHaveText('Invalid input')
  })
})
