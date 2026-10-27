import { spawn } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { connectPage } from './cdp.mjs'
import { startServer } from './server.mjs'

const PORT = 4100
const REPORT = resolve('parity-report', 'responsive')
const ROUTES = [
  { slug: 'home', url: '/' },
  { slug: 'radar', url: '/radar' },
  { slug: 'copilot', url: '/copilot' },
  { slug: 'workspace', url: '/workspace' },
]
const SIZES = [
  [1366, 768],
  [1920, 1080],
]
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

mkdirSync(REPORT, { recursive: true })
const server = await startServer(PORT)
const debugPort = 9630 + (process.pid % 60)
const profile = `/tmp/outmate-responsive-${process.pid}`
const chrome = spawn(
  '/usr/bin/chromium',
  [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--force-device-scale-factor=1',
    'about:blank',
  ],
  { stdio: 'ignore' },
)

let failures = 0
try {
  const cdp = await connectPage(debugPort)
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  for (const [width, height] of SIZES) {
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    })
    for (const route of ROUTES) {
      const loaded = cdp.once('Page.loadEventFired')
      await cdp.send('Page.navigate', { url: `http://localhost:${PORT}${route.url}` })
      await loaded
      await cdp.eval(
        `new Promise((resolve) => {
          let n = 0
          const tick = () => {
            if (document.querySelector('[data-page]')) return resolve(true)
            if (++n > 300) return resolve(false)
            setTimeout(tick, 50)
          }
          tick()
        })`,
        true,
      )
      await cdp.eval('document.fonts.ready.then(() => true)', true)
      await sleep(400)
      const metrics = await cdp.eval(
        `(() => {
          const root = document.querySelector('[data-page]')
          const r = root.getBoundingClientRect()
          return {
            vw: innerWidth,
            vh: innerHeight,
            clientW: document.documentElement.clientWidth,
            scrollW: document.documentElement.scrollWidth,
            scrollH: document.documentElement.scrollHeight,
            rootW: r.width,
            rootH: r.height,
          }
        })()`,
      )
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true })
      const file = resolve(REPORT, `${route.slug}-${width}x${height}.png`)
      writeFileSync(file, Buffer.from(data, 'base64'))
      const fillsWidth = Math.abs(metrics.rootW - metrics.clientW) < 1
      const noHScroll = metrics.scrollW <= metrics.clientW
      const ok = fillsWidth && noHScroll
      if (!ok) failures++
      console.log(
        `[${route.slug} ${width}x${height}] root=${metrics.rootW}x${metrics.rootH} ` +
          `scroll=${metrics.scrollW}x${metrics.scrollH} fills=${fillsWidth} noHScroll=${noHScroll} ${ok ? 'ok' : 'FAIL'}`,
      )
    }
  }
} finally {
  chrome.kill('SIGKILL')
  server.close()
  rmSync(profile, { recursive: true, force: true })
}
console.log(failures ? `RESPONSIVE FAIL (${failures})` : 'RESPONSIVE OK')
process.exit(failures ? 1 : 0)
