import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'

const DIST = resolve('dist')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
}

async function exists(path) {
  try {
    return (await stat(path)).isFile()
  } catch {
    return false
  }
}

export function startServer(port = 4100) {
  const server = createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    let file = join(DIST, path)
    if (!(await exists(file))) file = join(DIST, 'index.html')
    if (!file.startsWith(DIST)) {
      res.writeHead(403).end()
      return
    }
    try {
      const body = await readFile(file)
      res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' })
      res.end(body)
    } catch {
      res.writeHead(404).end('not found')
    }
  })
  return new Promise((done) => server.listen(port, () => done(server)))
}
