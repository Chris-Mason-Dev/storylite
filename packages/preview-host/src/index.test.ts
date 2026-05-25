import { describe, expect, it } from 'vitest'
import {
  applyBundle,
  bootstrapPreview,
  commitTokens,
  getPackageName,
  normalizeBundleCss,
  PACKAGE_NAME,
  PREVIEW_CANVAS_ID,
  PREVIEW_CSS_SLOT_ID,
  PreviewHostError,
  setToken,
  setVariant,
  setViewport,
} from './index.js'

describe('@storylite/preview-host', () => {
  it('exports package name', () => {
    expect(getPackageName()).toBe(PACKAGE_NAME)
  })

  it('bootstraps a deterministic preview document', () => {
    const iframe = createIframeFixture()

    const result = bootstrapPreview(iframe, {
      title: 'Preview <Test>',
      initialBundle: {
        'tokens.css': ':root { --fg-primary: black; }',
        'app.css': "@import './tokens.css' layer(tokens);\n@layer tokens;",
      },
    })

    expect(iframe.contentDocument.doctype?.name).toBe('html')
    expect(iframe.contentDocument.openCount).toBe(1)
    expect(iframe.contentDocument.closeCount).toBe(1)
    expect(iframe.contentDocument.documentElement.classList.contains('ss-preview-document')).toBe(
      true,
    )
    expect(iframe.contentDocument.documentElement.attributes.get('lang')).toBe('en')
    expect(iframe.contentDocument.head.children.map((child) => child.tagName)).toEqual([
      'meta',
      'meta',
      'meta',
      'title',
      'style',
    ])
    expect(result.cssSlot.id).toBe(PREVIEW_CSS_SLOT_ID)
    expect(result.cssSlot.textContent).toContain('@layer tokens;')
    expect(result.cssSlot.textContent).toContain(':root { --fg-primary: black; }')
    expect(result.canvas.id).toBe(PREVIEW_CANVAS_ID)
  })

  it('applies preview document customization around the managed canvas and css slot', () => {
    const iframe = createIframeFixture()

    bootstrapPreview(iframe, {
      htmlAttrs: {
        lang: 'fr',
        class: 'demo-preview',
        'data-mode': 'custom & checked',
      },
      bodyAttrs: {
        'data-shell': 'preview',
        hidden: true,
        inert: false,
      },
      headHtml: '<script data-preview-head>window.__previewHead = true</script>',
      bodyStartHtml: '<div data-preview-start></div>',
      bodyEndHtml: '<script data-preview-end>window.__previewEnd = true</script>',
    })

    expect(iframe.contentDocument.documentElement.attributes.get('lang')).toBe('fr')
    expect(iframe.contentDocument.documentElement.attributes.get('class')).toBe(
      'ss-preview-document demo-preview',
    )
    expect(iframe.contentDocument.documentElement.attributes.get('data-mode')).toBe(
      'custom &amp; checked',
    )
    expect(iframe.contentDocument.body.attributes.get('data-shell')).toBe('preview')
    expect(iframe.contentDocument.body.attributes.get('hidden')).toBe('')
    expect(iframe.contentDocument.body.attributes.has('inert')).toBe(false)
    expect(iframe.contentDocument.head.children.map((child) => child.tagName)).toEqual([
      'meta',
      'meta',
      'meta',
      'title',
      'script',
      'style',
    ])
    expect(iframe.contentDocument.body.children.map((child) => child.tagName)).toEqual([
      'div',
      'main',
      'script',
    ])
  })

  it('replaces prior CSS without replacing the iframe document', () => {
    const iframe = createBootstrappedIframe()
    const documentBefore = iframe.contentDocument
    const firstCssSlot = documentBefore.getElementById(PREVIEW_CSS_SLOT_ID)

    applyBundle(iframe, { 'reset.css': '* { box-sizing: border-box; }' })
    const css = applyBundle(iframe, { 'base.css': 'body { margin: 0; }' })

    expect(iframe.contentDocument).toBe(documentBefore)
    expect(documentBefore.getElementById(PREVIEW_CSS_SLOT_ID)).toBe(firstCssSlot)
    expect(css).toBe('/* base.css */\nbody { margin: 0; }\n')
    expect(firstCssSlot?.textContent).toBe(css)
    expect(firstCssSlot?.textContent).not.toContain('box-sizing')
  })

  it('normalizes bundles in engine file order and preserves layer declarations from app.css', () => {
    expect(
      normalizeBundleCss({
        'utilities.css': '.container { margin-inline: auto; }',
        'app.css':
          "@import './reset.css' layer(reset);\n@import './tokens.css' layer(tokens);\n@layer reset, tokens, base, utilities;",
        'reset.css': '* { box-sizing: border-box; }',
        'custom.css': '.custom { color: red; }',
        'tokens.css': ':root { --color-blue-500: blue; }',
      }),
    ).toBe(`@layer reset, tokens, base, utilities;

/* reset.css */
* { box-sizing: border-box; }

/* tokens.css */
:root { --color-blue-500: blue; }

/* utilities.css */
.container { margin-inline: auto; }

/* custom.css */
.custom { color: red; }
`)
  })

  it('mutates a root custom property directly', () => {
    const iframe = createBootstrappedIframe()

    setToken(iframe, '--accent-blue', 'oklch(60% 0.2 250)')

    expect(iframe.contentDocument.documentElement.style.getPropertyValue('--accent-blue')).toBe(
      'oklch(60% 0.2 250)',
    )
  })

  it('commits a bundle and clears hot-path divergence through full CSS replacement', () => {
    const iframe = createBootstrappedIframe()
    const cssSlot = iframe.contentDocument.getElementById(PREVIEW_CSS_SLOT_ID)

    setToken(iframe, '--accent-blue', 'red')
    const css = commitTokens(iframe, {
      bundle: {
        'tokens.css': ':root { --accent-blue: blue; }',
      },
    })

    expect(css).toBe('/* tokens.css */\n:root { --accent-blue: blue; }\n')
    expect(cssSlot?.textContent).toBe(css)
    expect(iframe.contentDocument.documentElement.style.getPropertyValue('--accent-blue')).toBe(
      'red',
    )
  })

  it('toggles one theme class while preserving unrelated classes', () => {
    const iframe = createBootstrappedIframe()
    const root = iframe.contentDocument.documentElement

    root.classList.add('ss-preview-document', 'layout-debug', 'theme-dark')
    setVariant(iframe, 'theme-light')

    expect([...root.classList]).toEqual(['ss-preview-document', 'layout-debug', 'theme-light'])

    setVariant(iframe, null)

    expect([...root.classList]).toEqual(['ss-preview-document', 'layout-debug'])
  })

  it('sets viewport width without replacing preview content', () => {
    const iframe = createBootstrappedIframe()
    const documentBefore = iframe.contentDocument
    const canvasBefore = documentBefore.getElementById(PREVIEW_CANVAS_ID)

    setViewport(iframe, 768)
    expect(iframe.style.width).toBe('768px')

    setViewport(iframe, 'min(100%, 1024px)')
    expect(iframe.style.width).toBe('min(100%, 1024px)')
    expect(iframe.contentDocument).toBe(documentBefore)
    expect(documentBefore.getElementById(PREVIEW_CANVAS_ID)).toBe(canvasBefore)
  })

  it('throws typed failures for missing documents and invalid inputs', () => {
    const inaccessibleIframe = { contentDocument: null, style: createStyleDeclaration() }

    expect(() => bootstrapPreview(inaccessibleIframe as unknown as HTMLIFrameElement)).toThrow(
      PreviewHostError,
    )

    const iframe = createBootstrappedIframe()

    expect(() => setToken(iframe, 'accent-blue', 'red')).toThrow(PreviewHostError)
    expect(() => setVariant(iframe, '.theme-dark')).toThrow(PreviewHostError)
    expect(() => setViewport(iframe, 0)).toThrow(PreviewHostError)
  })

  it('throws when a document is missing required preview parts', () => {
    const iframe = createIframeFixture()

    expect(() => applyBundle(iframe, { 'tokens.css': ':root {}' })).toThrow(PreviewHostError)
  })
})

function createBootstrappedIframe(): FakeIframe {
  const iframe = createIframeFixture()
  bootstrapPreview(iframe)
  return iframe
}

function createIframeFixture(): FakeIframe {
  return {
    contentDocument: new FakeDocument(),
    style: createStyleDeclaration(),
  } as unknown as FakeIframe
}

function readAttributes(html: string, tagName: string): Map<string, string> {
  const attrs = new Map<string, string>()
  const openingTag = html.match(new RegExp(`<${tagName}([^>]*)>`, 'i'))?.[1] ?? ''
  const attrPattern = /([^\s"'<>/=]+)(?:="([^"]*)")?/g
  let match: RegExpExecArray | null = null

  while ((match = attrPattern.exec(openingTag))) {
    const name = match[1]
    if (name) {
      attrs.set(name, match[2] ?? '')
    }
  }

  return attrs
}

type FakeIframe = HTMLIFrameElement & {
  readonly contentDocument: FakeDocument
  readonly style: FakeStyleDeclaration
}

class FakeDocument {
  doctype?: { readonly name: string }
  documentElement: FakeElement = new FakeElement('html')
  head: FakeElement = new FakeElement('head')
  body: FakeElement = new FakeElement('body')
  openCount = 0
  closeCount = 0

  #elementsById = new Map<string, FakeElement>()

  open(): void {
    this.openCount += 1
    this.#elementsById.clear()
  }

  write(html: string): void {
    this.doctype = html.trimStart().toLowerCase().startsWith('<!doctype html>')
      ? { name: 'html' }
      : undefined

    this.documentElement = new FakeElement('html')
    readAttributes(html, 'html').forEach((value, name) =>
      this.documentElement.attributes.set(name, value),
    )
    this.documentElement.classList.add(
      ...(this.documentElement.attributes.get('class') ?? '').split(' ').filter(Boolean),
    )
    this.head = new FakeElement('head')
    this.body = new FakeElement('body')
    readAttributes(html, 'body').forEach((value, name) => this.body.attributes.set(name, value))

    this.head.append(new FakeElement('meta'))
    this.head.append(new FakeElement('meta'))
    this.head.append(new FakeElement('meta'))
    this.head.append(new FakeElement('title'))

    const cssSlot = new FakeElement('style', PREVIEW_CSS_SLOT_ID)
    const canvas = new FakeElement('main', PREVIEW_CANVAS_ID)

    if (html.includes('data-preview-head')) {
      this.head.append(new FakeElement('script'))
    }

    this.head.append(cssSlot)
    if (html.includes('data-preview-start')) {
      this.body.append(new FakeElement('div'))
    }
    this.body.append(canvas)
    if (html.includes('data-preview-end')) {
      this.body.append(new FakeElement('script'))
    }
    this.#elementsById.set(PREVIEW_CSS_SLOT_ID, cssSlot)
    this.#elementsById.set(PREVIEW_CANVAS_ID, canvas)
  }

  close(): void {
    this.closeCount += 1
  }

  getElementById(id: string): FakeElement | null {
    return this.#elementsById.get(id) ?? null
  }
}

class FakeElement {
  readonly attributes = new Map<string, string>()
  readonly children: FakeElement[] = []
  readonly classList = new FakeClassList()
  readonly style = createStyleDeclaration()
  textContent = ''

  constructor(
    readonly tagName: string,
    readonly id = '',
  ) {}

  append(child: FakeElement): void {
    this.children.push(child)
  }
}

class FakeClassList {
  #tokens: string[] = []

  add(...tokens: string[]): void {
    for (const token of tokens) {
      if (!this.#tokens.includes(token)) {
        this.#tokens.push(token)
      }
    }
  }

  remove(...tokens: string[]): void {
    this.#tokens = this.#tokens.filter((token) => !tokens.includes(token))
  }

  contains(token: string): boolean {
    return this.#tokens.includes(token)
  }

  [Symbol.iterator](): IterableIterator<string> {
    return this.#tokens[Symbol.iterator]()
  }
}

type FakeStyleDeclaration = CSSStyleDeclaration & {
  readonly values: ReadonlyMap<string, string>
}

function createStyleDeclaration(): FakeStyleDeclaration {
  const values = new Map<string, string>()

  return {
    values,
    width: '',
    setProperty(property: string, value: string): void {
      values.set(property, value)
    },
    getPropertyValue(property: string): string {
      return values.get(property) ?? ''
    },
  } as unknown as FakeStyleDeclaration
}
