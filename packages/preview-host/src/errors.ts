export type PreviewHostErrorCode =
  | 'missing-content-document'
  | 'missing-document-element'
  | 'missing-css-slot'
  | 'missing-canvas-root'
  | 'invalid-token-name'
  | 'invalid-variant-class'
  | 'invalid-viewport-width'
  | 'invalid-demo-mode'

export class PreviewHostError extends Error {
  constructor(
    readonly code: PreviewHostErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'PreviewHostError'
  }
}
