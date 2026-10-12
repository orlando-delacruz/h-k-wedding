// Redirects `@vercel/blob` imports to the in-memory mock, so the Blob storage
// driver can be exercised end-to-end without real credentials.
// Used via: node --import ./scripts/mocks/blob-loader.mjs <script>
import { register } from 'module'
import { pathToFileURL } from 'url'
import path from 'path'

const mockPath = pathToFileURL(path.join(process.cwd(), 'scripts', 'mocks', 'vercel-blob.js')).href

register('data:text/javascript,' + encodeURIComponent(`
export async function resolve(specifier, context, nextResolve) {
  if (specifier === '@vercel/blob') {
    return { url: ${JSON.stringify(mockPath)}, shortCircuit: true }
  }
  return nextResolve(specifier, context)
}
`))
