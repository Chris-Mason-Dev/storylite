export function trustedHtml(node: HTMLElement, html: string) {
  function render(value: string): void {
    const template = document.createElement('template')
    template.innerHTML = value
    node.replaceChildren(template.content.cloneNode(true))
  }

  render(html)

  return {
    update: render,
  }
}
