import { expect, test } from './fixtures.ts'
import { PREVIEW_IFRAME, expectStoryShell } from './test-utils.ts'

test('viewport selector resizes the canvas frame', async ({ page }) => {
  await page.goto('/#/story/basic--layout')
  await expectStoryShell(page, 'Layout')

  const canvasFrame = page.getByLabel('Isolated story preview')
  await expect(canvasFrame).toBeVisible()

  await page.getByRole('button', { name: 'Choose viewport' }).click()
  await page.getByLabel('Viewports').getByRole('button').filter({ hasText: 'Mobile' }).click()
  await expect(canvasFrame).toHaveCSS('width', '360px')

  await page.getByRole('button', { name: 'Choose viewport' }).click()
  await page.getByLabel('Viewports').getByRole('button').filter({ hasText: 'Desktop' }).click()
  await expect(canvasFrame).toHaveCSS('width', '1280px')
})

test('preview theme and custom toolbar controls update the iframe body', async ({ page }) => {
  await page.goto('/#/story/basic--button')
  await expectStoryShell(page, 'Button')

  const frame = page.frameLocator(PREVIEW_IFRAME)
  const body = frame.locator('body')

  await page.getByRole('button', { name: 'Use dark theme' }).click()
  await expect(frame.locator('html')).toHaveAttribute('data-theme', 'dark')

  await page.getByRole('button', { name: 'A11y outlines' }).click()
  await expect(body).toHaveClass(/show-a11y-outlines/)

  await page.getByRole('button', { name: 'Density' }).click()
  await page.getByLabel('Density').getByRole('button', { name: 'Compact' }).click()
  await expect(body).toHaveClass(/density-compact/)
})

test('background selector applies the selected preview background', async ({ page }) => {
  await page.goto('/#/story/basic--card')
  await expectStoryShell(page, 'Card')

  await page.getByRole('button', { name: 'Choose canvas background' }).click()
  await page.getByLabel('Canvas backgrounds').getByRole('button', { name: 'Mint' }).click()

  const background = await page
    .frameLocator(PREVIEW_IFRAME)
    .locator('body')
    .evaluate((body) => body.style.background)
  expect(background).toBe('rgb(236, 253, 245)')
})

test('workspace can be maximized and restored', async ({ page }) => {
  await page.goto('/#/story/basic--button')
  await expectStoryShell(page, 'Button')

  await page.getByRole('button', { name: 'Expand workspace' }).click()
  await expect(page.getByRole('complementary', { name: 'Stories' })).toHaveCount(0)
  await expect(page.getByRole('complementary', { name: 'Story controls' })).toHaveCount(0)

  await page.getByRole('button', { name: 'Shrink workspace' }).click()
  await expectStoryShell(page, 'Button')
})
