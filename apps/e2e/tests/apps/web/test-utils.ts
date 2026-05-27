import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

import { expectHash, expectRouteDocumentReady } from '../../shared/test-utils.ts'

export const PREVIEW_IFRAME = 'iframe[title="StoryLite isolated preview"]'

export async function expectHomeReady(page: Page): Promise<void> {
  await expectRouteDocumentReady(page)
  const home = page.locator('.home-page')
  await expect(home.getByRole('heading', { name: 'StoryLite', exact: true })).toBeVisible()
  await expect(home.getByText('lightweight, Vite-powered alternative')).toBeVisible()
}

export async function openStory(
  page: Page,
  storyButtonName: string,
  storyId: string,
): Promise<void> {
  await page.getByRole('link', { name: storyButtonName, exact: true }).click()
  await expectHash(page).toBe(`#/story/${storyId}`)
  await expect(page.locator(PREVIEW_IFRAME)).toBeVisible()
}

export async function expectStoryShell(page: Page, storyName: string): Promise<void> {
  await expect(page.getByRole('complementary', { name: 'Stories' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Preview workspace' })).toBeVisible()
  await expect(page.getByRole('complementary', { name: 'Story controls' })).toBeVisible()
  await expect(page.locator('.inspector__header strong')).toHaveText(storyName)
}
