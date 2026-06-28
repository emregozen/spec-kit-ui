import { test, expect } from '@playwright/test'

async function calc(page, tokens, evaluate = true) {
  for (const token of tokens) {
    if (token === '=') {
      await page.click('[data-action="evaluate"]')
    } else {
      const btn = page.locator(`[data-token="${token}"]`).first()
      await btn.click()
    }
  }
  if (evaluate && !tokens.includes('=')) {
    await page.click('[data-action="evaluate"]')
  }
}

test.describe('Calculation History (US3)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('three calculations appear newest-first', async ({ page }) => {
    await calc(page, ['1', '+', '1'])
    await calc(page, ['2', '+', '2'])
    await calc(page, ['3', '+', '3'])

    await page.click('.btn-history-toggle')
    const items = page.locator('.history-item')
    await expect(items).toHaveCount(3)

    // Newest first: 3+3, then 2+2, then 1+1
    await expect(items.nth(0).locator('.history-item__result')).toHaveText('6')
    await expect(items.nth(1).locator('.history-item__result')).toHaveText('4')
    await expect(items.nth(2).locator('.history-item__result')).toHaveText('2')
  })

  test('clicking history entry populates display', async ({ page }) => {
    await calc(page, ['5', '+', '5'])
    await page.click('.btn-history-toggle')
    await page.locator('.history-item').first().click()
    await expect(page.locator('#expression-line')).toHaveText('10')
  })

  test('trash icon clears list', async ({ page }) => {
    await calc(page, ['4', '+', '4'])
    await page.click('.btn-history-toggle')
    await page.click('#history-clear')
    await expect(page.locator('.history-item')).toHaveCount(0)
  })

  test('51st calculation silently removes oldest', async ({ page }) => {
    for (let i = 0; i < 51; i++) {
      await calc(page, ['1', '+', '1'])
    }
    await page.click('.btn-history-toggle')
    const items = page.locator('.history-item')
    await expect(items).toHaveCount(50)
  })
})
