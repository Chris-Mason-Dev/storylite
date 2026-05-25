export const PACKAGE_NAME = '@storylite/preview-host' as const

export const PREVIEW_CSS_SLOT_ID = 'ss-app-css' as const
export const PREVIEW_CANVAS_ID = 'ss-canvas' as const
export const PREVIEW_DOCUMENT_CLASS = 'ss-preview-document' as const

export const PREVIEW_BUNDLE_FILE_ORDER = [
  'reset.css',
  'tokens.css',
  'base.css',
  'utilities.css',
  'components.css',
  'animations.css',
  'app.css',
] as const

export type PreviewBundleFile = (typeof PREVIEW_BUNDLE_FILE_ORDER)[number]
export type PreviewCssBundle = Readonly<Record<string, string>>
