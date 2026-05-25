import { describe, expect, it } from 'vitest'
import {
  escapeAttribute,
  escapeHtml,
  isBareImportSpecifier,
  isNodeLike,
  isPrimitive,
  isRecord,
  isValidAttributeName,
  kebabCase,
  renderAttrs,
} from './utils.js'

describe('storylite utils', () => {
  it('escapes HTML text and quoted attribute values', () => {
    expect(escapeHtml(`Tom & "Jerry" <Cartoon> 'Show'`)).toBe(
      'Tom &amp; &quot;Jerry&quot; &lt;Cartoon&gt; &#39;Show&#39;',
    )
    expect(escapeAttribute('value`<&"\'>')).toBe('value&#96;&lt;&amp;&quot;&#39;&gt;')
  })

  it('renders valid attributes and omits empty or unsafe attributes', () => {
    expect(
      renderAttrs({
        lang: 'en',
        hidden: true,
        inert: false,
        title: 'A&B`',
        'bad attr': 'ignored',
        empty: null,
        missing: undefined,
      }),
    ).toBe(' lang="en" hidden title="A&amp;B&#96;"')
  })

  it('validates HTML attribute names', () => {
    expect(isValidAttributeName('data-story-id')).toBe(true)
    expect(isValidAttributeName('aria-label')).toBe(true)
    expect(isValidAttributeName('bad attr')).toBe(false)
    expect(isValidAttributeName('bad=value')).toBe(false)
  })

  it('detects bare import specifiers', () => {
    expect(isBareImportSpecifier('react')).toBe(true)
    expect(isBareImportSpecifier('@storylite/renderer-react/client')).toBe(true)
    expect(isBareImportSpecifier('./client.ts')).toBe(false)
    expect(isBareImportSpecifier('/absolute/client.ts')).toBe(false)
    expect(isBareImportSpecifier('\0virtual:storylite/project')).toBe(false)
    expect(isBareImportSpecifier('https://example.com/client.js')).toBe(false)
    expect(isBareImportSpecifier('C:\\project\\client.js')).toBe(false)
  })

  it('normalizes names to kebab-case', () => {
    expect(kebabCase('PrimaryButton')).toBe('primary-button')
    expect(kebabCase('story source_example')).toBe('story-source-example')
    expect(kebabCase('--Already--Spaced--')).toBe('already-spaced')
  })

  it('detects common value shapes', () => {
    expect(isRecord({ ok: true })).toBe(true)
    expect(isRecord(null)).toBe(false)
    expect(isRecord([])).toBe(false)

    expect(isPrimitive('label')).toBe(true)
    expect(isPrimitive(1)).toBe(true)
    expect(isPrimitive(false)).toBe(true)
    expect(isPrimitive({})).toBe(false)

    expect(isNodeLike({ nodeType: 1 })).toBe(true)
    expect(isNodeLike({ nodeType: '1' })).toBe(false)
  })
})
