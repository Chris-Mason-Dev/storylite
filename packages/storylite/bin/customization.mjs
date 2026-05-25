import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { isValidAttributeName, renderAttrs } from '../src/lib/storylite/utils.js'

export { escapeAttribute, escapeHtml, renderAttrs } from '../src/lib/storylite/utils.js'

export const defaultBrandMarkHtml =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>'
export const defaultBrandTitleHtml = '<strong>StoryLite</strong>'
export const defaultBrandSubtitle = null
export const defaultGridBackground = [
  'linear-gradient(var(--storylite-grid-line-color) var(--storylite-grid-line-width), transparent var(--storylite-grid-line-width)) var(--storylite-grid-offset) var(--storylite-grid-offset) / var(--storylite-grid-major-size) var(--storylite-grid-major-size)',
  'linear-gradient(90deg, var(--storylite-grid-line-color) var(--storylite-grid-line-width), transparent var(--storylite-grid-line-width)) var(--storylite-grid-offset) var(--storylite-grid-offset) / var(--storylite-grid-major-size) var(--storylite-grid-major-size)',
  'linear-gradient(var(--storylite-grid-line-color-2) var(--storylite-grid-line-width), transparent var(--storylite-grid-line-width)) var(--storylite-grid-offset) var(--storylite-grid-offset) / var(--storylite-grid-size) var(--storylite-grid-size)',
  'linear-gradient(90deg, var(--storylite-grid-line-color-2) var(--storylite-grid-line-width), transparent var(--storylite-grid-line-width)) var(--storylite-grid-offset) var(--storylite-grid-offset) / var(--storylite-grid-size) var(--storylite-grid-size)',
  'linear-gradient(var(--storylite-grid-background-color), var(--storylite-grid-background-color))',
].join(', ')
export const defaultBackgrounds = [
  { label: 'Canvas', value: 'light-dark(#f7f7f7, #111111)' },
  { label: 'White', value: '#ffffff' },
  { label: 'Dark', value: '#111111' },
  { label: 'Grid', value: defaultGridBackground },
]
export const defaultViewports = [
  { label: 'Fluid', width: '100%', icon: 'fluid' },
  { label: 'Mobile', width: '390px', icon: 'mobile' },
  { label: 'Tablet', width: '768px', icon: 'tablet' },
  { label: 'Desktop', width: '1120px', icon: 'desktop' },
]
export const defaultToolbarTools = []
export const defaultMenuLinks = [
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com/itsjavi/storylite',
    icon: 'globe',
    target: '_blank',
    rel: 'noreferrer',
  },
]

const defaultManagerHtmlAttrs = { lang: 'en' }
const defaultManagerBodyAttrs = {}
const defaultPreviewHtmlAttrs = { lang: 'en' }
const defaultPreviewBodyAttrs = {}

export async function resolveStoryliteCustomization(root, config = {}) {
  const convention = await readConventionFiles(root)

  return {
    projectUi: resolveProjectUi(config.ui, convention),
    manager: {
      htmlAttrs: resolveAttrs(defaultManagerHtmlAttrs, config.managerHtmlAttrs),
      bodyAttrs: resolveAttrs(defaultManagerBodyAttrs, config.managerBodyAttrs),
      headHtml: resolveFragment(convention.managerHead, config.managerHead),
      bodyStartHtml: resolveFragment(convention.managerBodyStart, config.managerBodyStart),
      bodyEndHtml: resolveFragment(convention.managerBodyEnd, config.managerBodyEnd),
    },
    preview: {
      htmlAttrs: resolveAttrs(defaultPreviewHtmlAttrs, config.previewHtmlAttrs),
      bodyAttrs: resolveAttrs(defaultPreviewBodyAttrs, config.previewBodyAttrs),
      headHtml: resolveFragment(convention.previewHead, config.previewHead),
      bodyStartHtml: resolveFragment(convention.previewBodyStart, config.previewBodyStart),
      bodyEndHtml: resolveFragment(convention.previewBodyEnd, config.previewBodyEnd),
    },
  }
}

export function resolveProjectUi(ui = {}, convention = {}) {
  return {
    brand: {
      markHtml: ui.brand?.markHtml ?? defaultBrandMarkHtml,
      titleHtml: ui.brand?.titleHtml ?? defaultBrandTitleHtml,
      subtitle: ui.brand?.subtitle ?? defaultBrandSubtitle,
    },
    backgrounds: resolveBackgrounds(ui.backgrounds),
    viewports: resolveViewports(ui.viewports),
    toolbar: resolveToolbarTools(ui.toolbar),
    menuLinks: resolveMenuLinks(ui.menuLinks),
    css: resolveFragment(convention.managerCss ?? '', ui.css),
  }
}

export function resolveBackgrounds(backgrounds) {
  const configured =
    typeof backgrounds === 'function'
      ? backgrounds(defaultBackgrounds.map((background) => ({ ...background })))
      : backgrounds
  const normalized = Array.isArray(configured)
    ? configured
        .map((background) => ({
          label: typeof background?.label === 'string' ? background.label : '',
          value: typeof background?.value === 'string' ? background.value : '',
        }))
        .filter((background) => background.label && background.value)
    : defaultBackgrounds

  return normalized.length > 0 ? normalized : defaultBackgrounds
}

export function resolveViewports(viewports) {
  const configured =
    typeof viewports === 'function'
      ? viewports(defaultViewports.map((viewport) => ({ ...viewport })))
      : viewports
  const normalized = Array.isArray(configured)
    ? configured
        .map((viewport) => ({
          label: typeof viewport?.label === 'string' ? viewport.label : '',
          width: normalizeViewportWidth(viewport?.width),
          icon: isViewportIcon(viewport?.icon) ? viewport.icon : null,
        }))
        .filter((viewport) => viewport.label && viewport.width && viewport.icon)
    : defaultViewports

  return normalized.some((viewport) => viewport.icon === 'fluid')
    ? normalized
    : [defaultViewports[0], ...normalized]
}

export function resolveToolbarTools(toolbar) {
  const configured =
    typeof toolbar === 'function'
      ? toolbar(defaultToolbarTools.map((tool) => ({ ...tool })))
      : toolbar
  const normalized = Array.isArray(configured)
    ? configured.map((tool) => normalizeToolbarTool(tool)).filter(Boolean)
    : defaultToolbarTools

  return dedupeById(normalized)
}

export function resolveMenuLinks(menuLinks) {
  const configured =
    typeof menuLinks === 'function'
      ? menuLinks(defaultMenuLinks.map((link) => ({ ...link })))
      : menuLinks
  const normalized = Array.isArray(configured)
    ? configured.map((link) => normalizeLink(link)).filter(Boolean)
    : defaultMenuLinks

  return dedupeById(normalized).length > 0 ? dedupeById(normalized) : defaultMenuLinks
}

export function resolveAttrs(defaultAttrs, attrsConfig) {
  const configured =
    typeof attrsConfig === 'function'
      ? attrsConfig({ ...defaultAttrs })
      : { ...defaultAttrs, ...(attrsConfig ?? {}) }
  const attrs = {}

  for (const [name, value] of Object.entries(configured ?? {})) {
    if (!isValidAttributeName(name) || value === false || value === null || value === undefined) {
      continue
    }

    attrs[name] = value === true ? true : String(value)
  }

  return attrs
}

function normalizeViewportWidth(width) {
  if (typeof width === 'number' && Number.isFinite(width) && width > 0) {
    return `${width}px`
  }

  if (typeof width !== 'string') {
    return ''
  }

  const trimmed = width.trim()
  return trimmed ? trimmed : ''
}

function isViewportIcon(icon) {
  return icon === 'fluid' || icon === 'mobile' || icon === 'tablet' || icon === 'desktop'
}

function normalizeToolbarTool(tool) {
  if (!tool || typeof tool !== 'object') {
    return null
  }

  if (tool.type === 'toggle') {
    const base = normalizeToolBase(tool)
    if (!base) return null

    return {
      ...base,
      type: 'toggle',
      defaultValue: tool.defaultValue === true,
      persist: tool.persist !== false,
      target: normalizeToolbarTarget(tool.target, 'toggle'),
    }
  }

  if (tool.type === 'link') {
    return normalizeLink(tool, { type: 'link' })
  }

  if (tool.type === 'select') {
    const base = normalizeToolBase(tool)
    const options = normalizeToolbarOptions(tool.options)
    if (!base || options.length === 0) return null

    const optionValues = options.map((option) => option.value)
    const defaultValue = optionValues.includes(tool.defaultValue)
      ? tool.defaultValue
      : options[0].value

    return {
      ...base,
      type: 'select',
      defaultValue,
      options,
      persist: tool.persist !== false,
      target: normalizeToolbarTarget(tool.target, 'select'),
    }
  }

  return null
}

function normalizeToolBase(tool) {
  const id = normalizeId(tool.id)
  const label = normalizeLabel(tool.label)

  if (!id || !label) {
    return null
  }

  return {
    id,
    label,
    ...(normalizeIcon(tool.icon) ? { icon: normalizeIcon(tool.icon) } : {}),
  }
}

function normalizeToolbarOptions(options) {
  return Array.isArray(options)
    ? dedupeByValue(
        options
          .map((option) => ({
            label: normalizeLabel(option?.label),
            value: normalizeOptionValue(option?.value),
          }))
          .filter((option) => option.label && option.value),
      )
    : []
}

function normalizeToolbarTarget(target, toolType) {
  if (!target || typeof target !== 'object') {
    return undefined
  }

  if (target.type === 'preview-attribute' || target.type === 'manager-attribute') {
    const name = normalizeDataAttributeName(target.name)
    return name ? { type: target.type, name } : undefined
  }

  if (target.type === 'preview-class') {
    const name = normalizeClassName(target.name)
    const prefix = normalizeClassPrefix(target.prefix)

    if (toolType === 'toggle') {
      return name ? { type: target.type, name } : undefined
    }

    if (prefix) {
      return { type: target.type, prefix }
    }

    return name ? { type: target.type, name } : undefined
  }

  if (target.type === 'url-query' || target.type === 'url-hash') {
    const name = normalizeParamName(target.name)
    return name ? { type: target.type, name } : undefined
  }

  return undefined
}

function normalizeLink(link, extra = {}) {
  if (!link || typeof link !== 'object') {
    return null
  }

  const id = normalizeId(link.id)
  const label = normalizeLabel(link.label)
  const href = normalizeHref(link.href)

  if (!id || !label || !href) {
    return null
  }

  const target = link.target === '_blank' || link.target === '_self' ? link.target : undefined
  const rel = normalizeRel(link.rel, target)

  return {
    ...extra,
    id,
    label,
    href,
    ...(normalizeIcon(link.icon) ? { icon: normalizeIcon(link.icon) } : {}),
    ...(target ? { target } : {}),
    ...(rel ? { rel } : {}),
  }
}

function normalizeId(id) {
  return typeof id === 'string' && /^[a-zA-Z][\w:-]{0,63}$/.test(id) ? id : ''
}

function normalizeLabel(label) {
  return typeof label === 'string' ? label.trim() : ''
}

function normalizeOptionValue(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

function normalizeIcon(icon) {
  return isToolbarIcon(icon) ? icon : undefined
}

function isToolbarIcon(icon) {
  return (
    icon === 'accessibility' ||
    icon === 'bug' ||
    icon === 'external-link' ||
    icon === 'eye' ||
    icon === 'flag' ||
    icon === 'globe' ||
    icon === 'info' ||
    icon === 'layout' ||
    icon === 'monitor' ||
    icon === 'moon' ||
    icon === 'paint-bucket' ||
    icon === 'settings' ||
    icon === 'sun' ||
    icon === 'zap'
  )
}

function normalizeDataAttributeName(name) {
  return typeof name === 'string' && /^data-[a-zA-Z0-9_.:-]+$/.test(name) ? name : ''
}

function normalizeClassName(name) {
  return typeof name === 'string' && /^[a-zA-Z_][\w:-]*$/.test(name) ? name : ''
}

function normalizeClassPrefix(prefix) {
  return typeof prefix === 'string' && /^[a-zA-Z_][\w:-]*$/.test(prefix) ? prefix : ''
}

function normalizeParamName(name) {
  return typeof name === 'string' && /^[a-zA-Z0-9_.:-]+$/.test(name) ? name : ''
}

function normalizeHref(href) {
  if (typeof href !== 'string') {
    return ''
  }

  const trimmed = href.trim()
  return trimmed && !/^[\u0000-\u001f\s]*javascript:/i.test(trimmed) ? trimmed : ''
}

function normalizeRel(rel, target) {
  if (typeof rel === 'string' && /^[a-z\s-]+$/i.test(rel.trim())) {
    return rel.trim()
  }

  return target === '_blank' ? 'noreferrer' : ''
}

function dedupeById(items) {
  const seen = new Set()
  const deduped = []

  for (const item of items) {
    if (seen.has(item.id)) {
      continue
    }

    seen.add(item.id)
    deduped.push(item)
  }

  return deduped
}

function dedupeByValue(items) {
  const seen = new Set()
  const deduped = []

  for (const item of items) {
    if (seen.has(item.value)) {
      continue
    }

    seen.add(item.value)
    deduped.push(item)
  }

  return deduped
}

export function resolveFragment(defaultHtml, fragmentConfig) {
  if (typeof fragmentConfig === 'function') {
    return fragmentConfig(defaultHtml)
  }

  return `${defaultHtml}${fragmentConfig ?? ''}`
}

export function transformManagerHtml(html, manager) {
  const managerHeadHtml = manager.headHtml ?? ''
  const withDocumentHead = replaceManagedHead(html, managerHeadHtml)

  return injectBeforeBodyEnd(
    injectAfterBodyStart(
      injectManagerHead(
        applyAttrsToTag(
          applyAttrsToTag(withDocumentHead, 'html', manager.htmlAttrs ?? defaultManagerHtmlAttrs),
          'body',
          manager.bodyAttrs ?? defaultManagerBodyAttrs,
        ),
        managerHeadHtml,
      ),
      manager.bodyStartHtml ?? '',
    ),
    manager.bodyEndHtml ?? '',
  )
}

export function renderManagerDocumentHead(options = {}) {
  const includeDefaultTitle = options.includeDefaultTitle ?? true
  const tags = [
    '<meta charset="utf-8">',
    `<script>
      ;(() => {
        try {
          const root = document.documentElement
          const theme = localStorage.getItem('storylite:app-theme')
          if (theme === 'light' || theme === 'dark') {
            root.dataset.storyliteAppTheme = theme
            root.style.colorScheme = theme
          } else {
            delete root.dataset.storyliteAppTheme
            root.style.removeProperty('color-scheme')
          }
        } catch {
          document.documentElement.style.removeProperty('color-scheme')
        }
      })()
    </script>`,
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
  ]

  if (includeDefaultTitle) {
    tags.push('<title>StoryLite</title>')
  }

  tags.push('<!--storylite-manager-head-->')
  tags.push('<!--app-head-->')

  return tags.join('\n    ')
}

async function readConventionFiles(root) {
  const [
    managerHead,
    managerBodyStart,
    managerBodyEnd,
    managerCss,
    uiCss,
    previewHead,
    previewBody,
    previewBodyStart,
    previewBodyEnd,
  ] = await Promise.all([
    readStoryliteFile(root, 'manager-head.html'),
    readStoryliteFile(root, 'manager-body-start.html'),
    readStoryliteFile(root, 'manager-body-end.html'),
    readStoryliteFile(root, 'manager.css'),
    readStoryliteFile(root, 'ui.css'),
    readStoryliteFile(root, 'preview-head.html'),
    readStoryliteFile(root, 'preview-body.html'),
    readStoryliteFile(root, 'preview-body-start.html'),
    readStoryliteFile(root, 'preview-body-end.html'),
  ])

  return {
    managerHead,
    managerBodyStart,
    managerBodyEnd,
    managerCss: joinFragments(managerCss, uiCss),
    previewHead,
    previewBodyStart,
    previewBodyEnd: joinFragments(previewBody, previewBodyEnd),
  }
}

async function readStoryliteFile(root, fileName) {
  const path = resolve(root, '.storylite', fileName)
  return existsSync(path) ? readFile(path, 'utf8') : ''
}

function applyAttrsToTag(html, tagName, attrs) {
  const openingTag = new RegExp(`<${tagName}([^>]*)>`, 'i')
  return html.replace(openingTag, (_match, existingAttrs) => {
    const cleanedAttrs = Object.keys(attrs ?? {}).reduce(
      (nextAttrs, name) => removeAttribute(nextAttrs, name),
      existingAttrs,
    )
    return `<${tagName}${cleanedAttrs}${renderAttrs(attrs)}>`
  })
}

function injectManagerHead(html, headHtml) {
  if (!headHtml) {
    return html
  }

  if (html.includes('<!--storylite-manager-head-->')) {
    return html.replace(
      '<!--storylite-manager-head-->',
      `${headHtml}\n    <!--storylite-manager-head-->`,
    )
  }

  return html.replace('</head>', `${headHtml}\n  </head>`)
}

function injectAfterBodyStart(html, bodyStartHtml) {
  return bodyStartHtml
    ? html.replace(/<body([^>]*)>/i, (match) => `${match}\n    ${bodyStartHtml}`)
    : html
}

function injectBeforeBodyEnd(html, bodyEndHtml) {
  return bodyEndHtml ? html.replace('</body>', `    ${bodyEndHtml}\n  </body>`) : html
}

function removeAttribute(attrs, name) {
  return attrs.replace(
    new RegExp(`\\s${escapeRegExp(name)}(?:\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]*))?`, 'gi'),
    '',
  )
}

function joinFragments(...fragments) {
  return fragments.filter(Boolean).join('\n')
}

function replaceManagedHead(html, managerHeadHtml = '') {
  const hasProjectTitle = /<title(?:\s[^>]*)?>/i.test(managerHeadHtml)

  return html.replace(
    /<head>[\s\S]*?<\/head>/i,
    `<head>\n    ${renderManagerDocumentHead({ includeDefaultTitle: !hasProjectTitle })}\n  </head>`,
  )
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
