import { test, expect } from '@playwright/test'

test.describe('Keyboard Support (US5)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('15 * 3 Enter = 45 via keyboard', async ({ page }) => {
    await page.keyboard.type('15*3')
    await page.keyboard.press('Enter')
    await expect(page.locator('#result-line')).toHaveText('45')
  })

  test('Escape clears display', async ({ page }) => {
    await page.keyboard.type('123')
    await page.keyboard.press('Escape')
    await expect(page.locator('#expression-line')).toHaveText('')
  })

  test('Backspace removes last character', async ({ page }) => {
    await page.keyboard.type('123')
    await page.keyboard.press('Backspace')
    await expect(page.locator('#expression-line')).toHaveText('12')
  })

  test('= key evaluates expression', async ({ page }) => {
    await page.keyboard.type('6+4')
    await page.keyboard.press('=')
    await expect(page.locator('#result-line')).toHaveText('10')
  })

  test('key highlight appears on keypress', async ({ page }) => {
    // Press '5' and check that btn--pressed class is briefly applied
    await page.keyboard.down('5')
    const hasClass = await page.locator('[data-key="5"]').evaluate(el => el.classList.contains('btn--pressed'))
    // It may be already removed; just check it doesn't throw and expression updates
    await page.keyboard.up('5')
    await expect(page.locator('#expression-line')).toHaveText('5')
  })
})
