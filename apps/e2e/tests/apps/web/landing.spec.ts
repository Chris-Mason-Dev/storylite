import { expect, test } from './fixtures.ts'
import { expectHomeReady, openStory } from './test-utils.ts'
import { expectHash, expectNoPageOverflow } from '../../shared/test-utils.ts'

test('home page renders StoryLite project information and sidebar stories', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text())
    }
  })

  const response = await page.goto('/')

  expect(response?.status() ?? 200).toBeLessThan(400)
  await expectHash(page).toBe('')
  await expectHomeReady(page)
  await expect(page.getByText('5 stories')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'HTML/Components' })).toBeVisible()
  for (const story of ['Button html', 'Card html', 'Field html', 'Badge html', 'Layout html']) {
    await expect(page.getByRole('button', { name: story, exact: true })).toBeVisible()
  }
  await expectNoPageOverflow(page)
  expect(consoleErrors).toEqual([])
})

test('story search filters the sidebar without changing the current route', async ({ page }) => {
  await page.goto('/')
  await expectHomeReady(page)

  await page.getByRole('searchbox', { name: 'Search stories' }).fill('badge')

  await expect(page.getByRole('button', { name: 'Badge html', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Button html', exact: true })).toHaveCount(0)
  await expectHash(page).toBe('')
})

test('selecting a story opens the preview route', async ({ page }) => {
  await page.goto('/')
  await expectHomeReady(page)

  await openStory(page, 'Button html', 'basic--button')
  await expect(page.locator('.inspector__header strong')).toHaveText('Button')
})
