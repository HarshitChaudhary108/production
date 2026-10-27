// HC-2 edge checks: clear-session mid-run closes the EventSource; and (run
// with APP pointing at a no-env build) backend_not_configured text, no numbers.
import { spawn } from 'node:child_process'
import { connectPage } from './visual/cdp.mjs'

const APP = process.env.APP_URL || 'http://localhost:5173'
const MODE = process.env.CHECK_MODE || 'clear' // 'clear' | 'noenv'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const chrome = spawn(CHROME, [
  '--headless=new', '--remote-debugging-port=9691',
  `--user-data-dir=C:/Users/theha/AppData/Local/Temp/outmate-edge-${process.pid}`,
  '--no-first-run', '--disable-gpu', '--window-size=1400,1000', 'about:blank',
], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let failures = 0
const check = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`)
  if (!cond) failures += 1
}
const thread = `(() => { const t = document.body.innerText; const i = t.indexOf('Research session'); const j = t.indexOf('Connect your stack'); return i < 0 ? '' : t.slice(i, j) })()`
async function waitFor(cdp, expr, timeoutMs, pollMs = 500) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeoutMs) {
    const v = await cdp.eval(expr).catch(() => null)
    if (v) return v
    await sleep(pollMs)
  }
  return null
}
const send = async (cdp, text) => {
  await cdp.eval(`document.querySelector('textarea').focus()`)
  await cdp.send('Input.insertText', { text })
  await cdp.eval(`[...document.querySelector('textarea').closest('div').querySelectorAll('button')].find(x => x.textContent.includes('Start research')).click()`)
}

try {
  const cdp = await connectPage(9691)
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Network.enable')
  const consoleErrors = []
  const sseRequests = []
  cdp.on('Runtime.consoleAPICalled', (p) => {
    if (p.type === 'error') consoleErrors.push(String(p.args?.[0]?.value ?? '').slice(0, 160))
  })
  cdp.on('Network.requestWillBeSent', (p) => {
    if (p.request.url.includes('/events')) sseRequests.push(p.requestId)
  })
  const finished = []
  cdp.on('Network.loadingFinished', (p) => finished.push(p.requestId))
  cdp.on('Network.loadingFailed', (p) => finished.push(p.requestId))

  await cdp.send('Page.navigate', { url: APP })
  await waitFor(cdp, `!!document.querySelector('textarea')`, 20000)

  if (MODE === 'noenv') {
    await send(cdp, 'find 5 companies in Berlin')
    const bad = await waitFor(cdp, `${thread}.includes("backend URL is not configured")`, 15000)
    check('backend_not_configured text shown', !!bad)
    const tx = await cdp.eval(thread)
    check('no numbers in failed card', !/[0-9]/.test((tx.match(/OUTMATE\n([^\n]+)/) || ['', ''])[1] || ''))
    check('no start button', !tx.includes('Start research →'))
    cdp.close(); chrome.kill('SIGKILL')
    process.exit(failures ? 1 : 0)
  }

  // MODE=clear: start a run, clear mid-flight.
  await send(cdp, 'find 30 companies in Toronto')
  const prev = await waitFor(cdp, `${thread}.includes("up to 30 companies")`, 30000)
  check('preview up', !!prev)
  await cdp.eval(`[...document.querySelectorAll('span')].filter(e => e.textContent.trim() === 'Start research →').pop().click()`)
  const run = await waitFor(cdp, `${thread}.includes("Searching for up to 30 companies")`, 15000)
  check('running text', !!run)
  check('EventSource opened', sseRequests.length >= 1, `${sseRequests.length} sse request(s)`)
  await cdp.eval(`[...document.querySelectorAll('span')].find(e => e.textContent.trim() === 'Clear session').click()`)
  await sleep(2500)
  check('thread cleared', !(await cdp.eval(`document.body.innerText`)).includes('Research session'))
  check('SSE request closed', sseRequests.every((id) => finished.includes(id)), `${sseRequests.length} open`)
  check('no console errors', consoleErrors.length === 0, consoleErrors.slice(0, 2).join(' | '))
  await sleep(90000) // let the backend finish; confirm nothing resurrects
  check('thread stays cleared after job completes', !(await cdp.eval(`document.body.innerText`)).includes('Research session'))
  cdp.close()
} finally {
  chrome.kill('SIGKILL')
}
process.exit(failures ? 1 : 0)
