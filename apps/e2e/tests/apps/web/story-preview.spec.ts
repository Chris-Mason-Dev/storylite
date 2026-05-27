import { expect, test } from './fixtures.ts'
import { PREVIEW_IFRAME, expectStoryShell, openStory } from './test-utils.ts'
import { expectHash } from '../../shared/test-utils.ts'

test('button story renders in the isolated preview iframe', async ({ page }) => {
  await page.goto('/#/story/basic--button')
  await expectStoryShell(page, 'Button')

  const frame = page.frameLocator(PREVIEW_IFRAME)
  const button = frame.locator('.demo-btn').first()

  await expectHash(page).toBe('#/story/basic--button')
  await expect(button).toHaveText('Run storylite build')
  await expect(button).toHaveAttribute('data-variant', 'primary')
})

test('controls update story args inside the iframe and reset to defaults', async ({ page }) => {
  await page.goto('/#/story/basic--button')
  await expectStoryShell(page, 'Button')

  await control(page, 'label').locator('input').fill('Ship preview')
  await control(page, 'variant').locator('select').selectOption('secondary')

  const button = page.frameLocator(PREVIEW_IFRAME).locator('.demo-btn').first()
  await expect(button).toHaveText('Ship preview')
  await expect(button).toHaveAttribute('data-variant', 'secondary')

  await page.getByRole('button', { name: 'Reset controls' }).click()
  await expect(button).toHaveText('Run storylite build')
  await expect(button).toHaveAttribute('data-variant', 'primary')
})

test('field story exposes typed controls and renders accessible input markup', async ({ page }) => {
  await page.goto('/')
  await openStory(page, 'Field', 'basic--field')
  await expectStoryShell(page, 'Field')

  await control(page, 'label').locator('input').fill('Search terms')
  await control(page, 'placeholder').locator('input').fill('Find a component')
  await control(page, 'type').locator('select').selectOption('search')

  const frame = page.frameLocator(PREVIEW_IFRAME)
  await expect(frame.getByLabel('Search terms')).toHaveAttribute('type', 'search')
  await expect(frame.getByLabel('Search terms')).toHaveAttribute('placeholder', 'Find a component')
})

test('unknown story ids fall back to the first story without changing the URL', async ({
  page,
}) => {
  await page.goto('/#/story/does-not-exist')

  await expectHash(page).toBe('#/story/does-not-exist')
  await expectStoryShell(page, 'Button')
  await expect(page.frameLocator(PREVIEW_IFRAME).locator('.demo-btn').first()).toHaveText(
    'Run storylite build',
  )
})

function control(page: import('@playwright/test').Page, name: string) {
  return page.locator('.control').filter({ has: page.locator('span', { hasText: name }) })
}
