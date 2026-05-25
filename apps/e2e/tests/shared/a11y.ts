import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export function makeAxeBuilder(page: Page): AxeBuilder {
  return new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
}

export async function expectNoBlockingA11yViolations(page: Page, path: string): Promise<void> {
  const results = await makeAxeBuilder(page).analyze()
  const blocking = results.violations.filter((violation) =>
    ['serious', 'critical'].includes(violation.impact ?? ''),
  )

  if (blocking.length > 0) {
    const summary = blocking
      .map((violation) =>
        [
          `[${violation.impact}] ${violation.id}: ${violation.help}`,
          ...violation.nodes.map((node) =>
            [`target: ${node.target.join(', ')}`, `html: ${node.html}`, node.failureSummary]
              .filter(Boolean)
              .join('\n'),
          ),
        ].join('\n'),
      )
      .join('\n\n')

    throw new Error(`Accessibility violations on ${path}:\n${summary}`)
  }

  const moderate = results.violations.filter((violation) => violation.impact === 'moderate')
  if (moderate.length > 0) {
    console.warn(
      `[a11y] ${moderate.length} moderate finding(s) on ${path}: ${moderate
        .map((violation) => violation.id)
        .join(', ')}`,
    )
  }

  expect(blocking).toHaveLength(0)
}
