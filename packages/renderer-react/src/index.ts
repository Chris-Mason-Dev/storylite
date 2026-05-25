import { defineRenderer } from '@storylite/contracts'

export default function reactRenderer() {
  return defineRenderer({
    name: 'react',
    client: '@storylite/renderer-react/client',
    static: '@storylite/renderer-react/static',
  })
}
