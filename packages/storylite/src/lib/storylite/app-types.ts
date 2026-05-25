export type ViewportPreset = {
  readonly label: string
  readonly width: string
  readonly icon: 'fluid' | 'mobile' | 'tablet' | 'desktop'
}

export type Route =
  | { readonly kind: 'home' }
  | { readonly kind: 'story' | 'canvas'; readonly storyId: string }
