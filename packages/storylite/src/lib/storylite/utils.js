/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
export function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * @param {unknown} value
 * @returns {value is Node | DocumentFragment}
 */
export function isNodeLike(value) {
  return isRecord(value) && typeof value.nodeType === 'number'
}

/**
 * @param {unknown} value
 * @returns {value is string | number | boolean}
 */
export function isPrimitive(value) {
  return ['string', 'number', 'boolean'].includes(typeof value)
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function kebabCase(value) {
  return String(value)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('`', '&#96;')
}

/**
 * @param {Record<string, unknown> | null | undefined} attrs
 * @returns {string}
 */
export function renderAttrs(attrs) {
  return Object.entries(attrs ?? {})
    .filter(
      ([name, value]) =>
        isValidAttributeName(name) && value !== false && value !== null && value !== undefined,
    )
    .map(([name, value]) => (value === true ? ` ${name}` : ` ${name}="${escapeAttribute(value)}"`))
    .join('')
}

/**
 * @param {string} name
 * @returns {boolean}
 */
export function isValidAttributeName(name) {
  return /^[^\s"'<>/=]+$/.test(name)
}

/**
 * @param {string} specifier
 * @returns {boolean}
 */
export function isBareImportSpecifier(specifier) {
  return (
    specifier.length > 0 &&
    !specifier.startsWith('.') &&
    !specifier.startsWith('/') &&
    !specifier.startsWith('\0') &&
    !specifier.includes('://') &&
    !/^[A-Za-z]:[\\/]/.test(specifier)
  )
}
