import {
  globalCss,
  home,
  managerHtml,
  previewHtml,
  projectUi,
  rendererClientLoaders,
  setupPreview,
  staticStoriesBase,
  storyIdResolver,
  storyModules,
} from 'virtual:storylite/project'
import { normalizeStoryModulesWithDiagnostics } from './lib/storylite/normalize'

const normalizedStories = normalizeStoryModulesWithDiagnostics(storyModules, {
  resolveId: storyIdResolver,
})

export const stories = normalizedStories.stories
export const storyIdCollisions = normalizedStories.idCollisions
export {
  globalCss,
  home,
  managerHtml,
  previewHtml,
  projectUi,
  rendererClientLoaders,
  setupPreview,
  staticStoriesBase,
}
