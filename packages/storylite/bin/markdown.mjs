import matter from 'gray-matter'
import { marked } from 'marked'

export function parseMarkdown(source) {
  const { content, data } = matter(source)

  return {
    frontmatter: data && typeof data === 'object' && !Array.isArray(data) ? data : {},
    html: marked.parse(content),
  }
}
