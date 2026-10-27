// HC-2 focused e2e: preview -> start -> running -> done, one project.
import { spawn } from 'node:child_process'
import { connectPage } from './visual/cdp.mjs'

const APP = 'http://localhost:5173'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const chrome = spawn(CHROME, [
  '--headless=new', '--remote-debugging-port=9690',
  `--user-data-dir=C:/Users/theha/AppData/Local/Temp/outmate-e2e-${process.pid}`,
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
try {
  const cdp = await connectPage(9690)
  await cdp.send('Page.enable')
  await cdp.send('Page.navigate', { url: APP })
  await waitFor(cdp, `!!document.querySelector('textarea')`, 20000)

  await cdp.eval(`document.querySelector('textarea').focus()`)
  await cdp.send('Input.insertText', { text: 'find 20 companies in delhi, india. startup with technology category.' })
  await cdp.eval(`[...document.querySelector('textarea').closest('div').querySelectorAll('button')].find(x => x.textContent.includes('Start research')).click()`)

  const prev = await waitFor(cdp, `${thread}.includes("up to 20 companies")`, 30000)
  check('preview "up to 20 companies"', !!prev)

  await cdp.eval(`(() => {
    const b = [...document.querySelectorAll('span')].filter(e => e.textContent.trim() === 'Start research →').pop()
    b.click(); b.click()
    return 'dblclicked'
  })()`)

  const run = await waitFor(cdp, `${thread}.includes("Searching for up to 20 companies")`, 15000)
  check('running text', !!run)

  const done = await waitFor(cdp, `${thread}.match(/Found/)`, 180000, 800)
  check('done text', !!done, done ? String(done[0]).slice(0, 80) : 'timeout')
  if (done) {
    const tx = await cdp.eval(thread)
    console.log('THREAD>>>', JSON.stringify(tx))
    check('found+requested tiles', /Companies found/.test(tx) && /Requested/.test(tx))
    check('start hidden', !tx.includes('Start research →') && !tx.includes('Running…') && !tx.includes('Starting…'))
    const m = tx.match(/Found ([0-9,]+)/)
    console.log('REPORTED_N=' + (m ? m[1] : 'none'))
    console.log('META=' + (tx.match(/1 request[^\n]*/) || [''])[0])
  }
  cdp.close()
} finally {
  chrome.kill('SIGKILL')
}
process.exit(failures ? 1 : 0)
