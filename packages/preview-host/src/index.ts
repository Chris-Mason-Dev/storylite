import {
  PACKAGE_NAME,
  PREVIEW_BUNDLE_FILE_ORDER,
  PREVIEW_CANVAS_ID,
  PREVIEW_CSS_SLOT_ID,
  PREVIEW_DOCUMENT_CLASS,
  type PreviewBundleFile,
  type PreviewCssBundle,
} from './constants.js'
import { PreviewHostError } from './errors.js'

export {
  PACKAGE_NAME,
  PREVIEW_BUNDLE_FILE_ORDER,
  PREVIEW_CANVAS_ID,
  PREVIEW_CSS_SLOT_ID,
  PREVIEW_DOCUMENT_CLASS,
} from './constants.js'
export type { PreviewBundleFile, PreviewCssBundle } from './constants.js'
export { PreviewHostError } from './errors.js'
export type { PreviewHostErrorCode } from './errors.js'

export type RuntimeHook = (root: ParentNode) => (() => void) | void

export type PreviewHtmlAttributeValue = string | number | boolean | null | undefined

export type PreviewHtmlAttrs = Record<string, PreviewHtmlAttributeValue>

export type BootstrapPreviewOptions = {
  readonly title?: string
  readonly lang?: string
  readonly colorScheme?: string
  readonly htmlAttrs?: PreviewHtmlAttrs
  readonly bodyAttrs?: PreviewHtmlAttrs
  readonly headHtml?: string
  readonly bodyStartHtml?: string
  readonly bodyEndHtml?: string
  readonly initialBundle?: PreviewCssBundle
  readonly runtime?: RuntimeHook
}

export type PreviewBootstrapResult = {
  readonly document: Document
  readonly cssSlot: HTMLStyleElement
  readonly canvas: HTMLElement
}

export type CommitTokensInput =
  | PreviewCssBundle
  | {
      readonly bundle: PreviewCssBundle
    }

export function getPackageName(): typeof PACKAGE_NAME {
  return PACKAGE_NAME
}

export function bootstrapPreview(
  iframe: HTMLIFrameElement,
  options: BootstrapPreviewOptions = {},
): PreviewBootstrapResult {
  const previewDocument = getPreviewDocument(iframe)
  const title = escapeHtml(options.title ?? 'StoryLite preview')
  const colorScheme = escapeAttribute(options.colorScheme ?? 'light dark')
  const htmlAttrs = mergePreviewHtmlAttrs({
    lang: options.lang ?? 'en',
    class: PREVIEW_DOCUMENT_CLASS,
    ...(options.htmlAttrs ?? {}),
  })
  const bodyAttrs = normalizeHtmlAttrs(options.bodyAttrs ?? {})
  const headHtml = options.headHtml ?? ''
  const bodyStartHtml = options.bodyStartHtml ?? ''
  const bodyEndHtml = options.bodyEndHtml ?? ''

  previewDocument.open()
  previewDocument.write(`<!doctype html>
<html${renderHtmlAttrs(htmlAttrs)}>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="${colorScheme}">
    <title>${title}</title>
    ${headHtml}
    <style id="${PREVIEW_CSS_SLOT_ID}"></style>
  </head>
  <body${renderHtmlAttrs(bodyAttrs)}>
    ${bodyStartHtml}
    <main id="${PREVIEW_CANVAS_ID}"></main>
    ${bodyEndHtml}
  </body>
</html>`)
  previewDocument.close()

  if (options.initialBundle) {
    applyBundle(iframe, options.initialBundle)
  }

  if (options.runtime) {
    options.runtime(previewDocument)
  }

  return getPreviewParts(previewDocument)
}

export function applyBundle(iframe: HTMLIFrameElement, bundle: PreviewCssBundle): string {
  const previewDocument = getPreviewDocument(iframe)
  const { cssSlot } = getPreviewParts(previewDocument)
  const css = normalizeBundleCss(bundle)

  cssSlot.textContent = css

  return css
}

export function clearCanvas(iframe: HTMLIFrameElement): HTMLElement {
  const previewDocument = getPreviewDocument(iframe)
  const { canvas } = getPreviewParts(previewDocument)

  canvas.replaceChildren()

  return canvas
}

export function setCanvasContent(
  iframe: HTMLIFrameElement,
  content: string | Node | DocumentFragment,
): HTMLElement {
  const previewDocument = getPreviewDocument(iframe)
  const canvas = clearCanvas(iframe)

  if (typeof content === 'string') {
    const template = previewDocument.createElement('template')
    template.innerHTML = content
    canvas.append(template.content)
    return canvas
  }

  canvas.append(content)
  return canvas
}

export function setToken(iframe: HTMLIFrameElement, tokenName: string, value: string): void {
  const previewDocument = getPreviewDocument(iframe)
  const root = getDocumentElement(previewDocument)
  const property = normalizeTokenName(tokenName)

  root.style.setProperty(property, value)
}

export function commitTokens(iframe: HTMLIFrameElement, input: CommitTokensInput): string {
  return applyBundle(iframe, isBundleWrapper(input) ? input.bundle : input)
}

export function setVariant(iframe: HTMLIFrameElement, variantClassName: string | null): void {
  const previewDocument = getPreviewDocument(iframe)
  const root = getDocumentElement(previewDocument)
  const nextVariant = normalizeVariantClass(variantClassName)

  for (const className of Array.from(root.classList)) {
    if (className.startsWith('theme-')) {
      root.classList.remove(className)
    }
  }

  if (nextVariant) {
    root.classList.add(nextVariant)
  }
}

export function setViewport(iframe: HTMLIFrameElement, width: number | string): void {
  iframe.style.width = normalizeViewportWidth(width)
}

export function normalizeBundleCss(bundle: PreviewCssBundle): string {
  const knownFiles = PREVIEW_BUNDLE_FILE_ORDER.filter((fileName) => bundle[fileName] !== undefined)
  const unknownFiles = Object.keys(bundle)
    .filter((fileName) => !PREVIEW_BUNDLE_FILE_ORDER.includes(fileName as PreviewBundleFile))
    .sort((left, right) => left.localeCompare(right))
  const sections: string[] = []
  const appCss = bundle['app.css']
  const layerDeclarations = appCss ? extractLayerDeclarations(appCss) : ''

  if (layerDeclarations) {
    sections.push(layerDeclarations)
  }

  for (const fileName of [...knownFiles, ...unknownFiles]) {
    const css = bundle[fileName]?.trim()

    if (!css || fileName === 'app.css') {
      continue
    }

    sections.push(`/* ${fileName} */\n${css}`)
  }

  return sections.length > 0 ? `${sections.join('\n\n')}\n` : ''
}

function getPreviewDocument(iframe: HTMLIFrameElement): Document {
  if (!iframe.contentDocument) {
    throw new PreviewHostError(
      'missing-content-document',
      'Cannot access iframe.contentDocument. The preview iframe must be same-origin.',
    )
  }

  return iframe.contentDocument
}

function getPreviewParts(previewDocument: Document): PreviewBootstrapResult {
  const cssSlot = previewDocument.getElementById(PREVIEW_CSS_SLOT_ID)
  const canvas = previewDocument.getElementById(PREVIEW_CANVAS_ID)

  if (!isElementNamed(cssSlot, 'style')) {
    throw new PreviewHostError(
      'missing-css-slot',
      `Preview document is missing <style id="${PREVIEW_CSS_SLOT_ID}">.`,
    )
  }

  if (!isElementNamed(canvas, 'main')) {
    throw new PreviewHostError(
      'missing-canvas-root',
      `Preview document is missing <main id="${PREVIEW_CANVAS_ID}">.`,
    )
  }

  return { document: previewDocument, cssSlot: cssSlot as HTMLStyleElement, canvas }
}

function getDocumentElement(previewDocument: Document): HTMLElement {
  const root = previewDocument.documentElement

  if (!root) {
    throw new PreviewHostError(
      'missing-document-element',
      'Preview document is missing documentElement.',
    )
  }

  return root
}

function normalizeTokenName(tokenName: string): string {
  const property = tokenName.trim()

  if (!property.startsWith('--') || property.includes(' ')) {
    throw new PreviewHostError(
      'invalid-token-name',
      `Token name "${tokenName}" must be a CSS custom property name such as "--color-blue-500".`,
    )
  }

  return property
}

function normalizeVariantClass(variantClassName: string | null): string | null {
  if (variantClassName === null) {
    return null
  }

  const className = variantClassName.trim()

  if (!className) {
    return null
  }

  if (className.includes(' ') || className.startsWith('.')) {
    throw new PreviewHostError(
      'invalid-variant-class',
      `Variant class "${variantClassName}" must be a single class name without a leading dot.`,
    )
  }

  return className
}

function normalizeViewportWidth(width: number | string): string {
  if (typeof width === 'number') {
    if (!Number.isFinite(width) || width <= 0) {
      throw new PreviewHostError(
        'invalid-viewport-width',
        `Viewport width must be a positive finite number. Received ${width}.`,
      )
    }

    return `${width}px`
  }

  const value = width.trim()

  if (!value) {
    throw new PreviewHostError('invalid-viewport-width', 'Viewport width cannot be empty.')
  }

  return value
}

function extractLayerDeclarations(appCss: string): string {
  return appCss
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('@layer ') && line.endsWith(';'))
    .join('\n')
}

function isElementNamed(element: Element | null, tagName: string): element is HTMLElement {
  return element?.tagName.toLowerCase() === tagName
}

function isBundleWrapper(input: CommitTokensInput): input is { readonly bundle: PreviewCssBundle } {
  const bundle = (input as { readonly bundle?: unknown }).bundle
  return typeof bundle === 'object' && bundle !== null
}

function mergePreviewHtmlAttrs(attrs: PreviewHtmlAttrs): Record<string, string | true> {
  const normalized = normalizeHtmlAttrs(attrs)
  const customClass = normalized.class === true ? '' : normalized.class
  const classes = [PREVIEW_DOCUMENT_CLASS, customClass]
    .flatMap((className) => String(className ?? '').split(/\s+/))
    .filter(Boolean)
  normalized.class = Array.from(new Set(classes)).join(' ')

  return normalized
}

function normalizeHtmlAttrs(attrs: PreviewHtmlAttrs): Record<string, string | true> {
  const normalized: Record<string, string | true> = {}

  for (const [name, value] of Object.entries(attrs)) {
    if (!isValidAttributeName(name) || value === false || value === null || value === undefined) {
      continue
    }

    normalized[name] = value === true ? true : String(value)
  }

  return normalized
}

function renderHtmlAttrs(attrs: Record<string, string | true>): string {
  return Object.entries(attrs)
    .map(([name, value]) => (value === true ? ` ${name}` : ` ${name}="${escapeAttribute(value)}"`))
    .join('')
}

function isValidAttributeName(name: string): boolean {
  return /^[^\s"'<>/=]+$/.test(name)
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replaceAll('`', '&#96;')
}
