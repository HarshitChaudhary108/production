// HC-2 manual check driver — drives the real built UI in headless Chrome via
// CDP against the live backend on :8000. Not part of npm test.
import { spawn } from 'node:child_process'
import { connectPage } from './visual/cdp.mjs'

const APP = 'http://localhost:5173'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const debugPort = 9688
const profile = `C:/Users/theha/AppData/Local/Temp/outmate-hc2-${process.pid}`
const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profile}`,
  '--no-first-run',
  '--disable-gpu',
  '--window-size=1400,1000',
  'about:blank',
], { stdio: 'ignore' })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let failures = 0
const check = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`)
  if (!cond) failures += 1
}

async function evalJson(cdp, expr) {
  const v = await cdp.eval(`JSON.stringify(${expr})`)
  return JSON.parse(v ?? 'null')
}

async function waitFor(cdp, expr, timeoutMs = 90000, pollMs = 400) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeoutMs) {
    const v = await cdp.eval(expr).catch(() => null)
    if (v) return v
    await sleep(pollMs)
  }
  return null
}

const text = () => `document.body.innerText`
const startBtn = `(() => {
  const els = [...document.querySelectorAll('span')]
  const b = els.find(e => ['Start research →','Starting…','Running…'].includes(e.textContent.trim()))
  if (!b) return null
  const cs = getComputedStyle(b)
  return { label: b.textContent.trim(), disabled: cs.cursor !== 'pointer' }
})()`

try {
  const cdp = await connectPage(debugPort)
  await cdp.send('Page.enable')
  const consoleErrors = []
  cdp.on('Runtime.consoleAPICalled', (p) => {
    if (p.type === 'error') consoleErrors.push(p.args?.[0]?.value ?? 'console error')
  })
  await cdp.send('Runtime.enable')
  await cdp.send('Page.navigate', { url: APP })
  await waitFor(cdp, `document.querySelector('textarea') !== null`, 20000)

  const PROMPT = 'find 20 companies in delhi, india. startup with technology category.'

  // 1) Type the screenshot prompt and send.
  await cdp.eval(`(() => {
    const t = document.querySelector('textarea')
    t.focus()
    document.execCommand('insertText', false, ${JSON.stringify(PROMPT)})
    return t.value
  })()`)
  await cdp.eval(`(() => {
    const box = document.querySelector('textarea').closest('div')
    const b = [...box.querySelectorAll('button')].find(x => x.textContent.includes('Start research'))
    b.click()
    return true
  })()`)

  // 2) Preview card appears with "up to 20 companies".
  const previewOk = await waitFor(cdp, `${text()}.includes("up to 20 companies")`, 30000)
  check('preview shows "up to 20 companies"', !!previewOk)

  const threadText = `(() => { const i = document.body.innerText.indexOf('Research session'); const j = document.body.innerText.indexOf('Connect your stack'); return document.body.innerText.slice(i, j) })()`
  const body1 = await evalJson(cdp, threadText)
  check('no Decision makers tile', !/Decision makers/i.test(body1 || ''))
  check('no credits estimate tile', !/Estimated credits/i.test(body1 || ''))
  check('columns from plan', /Company Name/.test(body1) && /Domain/.test(body1) && /Employee Count/.test(body1) && /Location/.test(body1))
  check('nothing-runs note', /Nothing runs until you confirm/.test(body1 || ''))
  check('search chip', /Search: “find 20 companies in delhi/.test(body1 || ''))

  // 3) Double-click Start: second click must be a no-op.
  await cdp.eval(`(() => {
    const els = [...document.querySelectorAll('span')]
    const b = els.find(e => e.textContent.trim() === 'Start research →')
    if (!b) return 'missing'
    b.click(); b.click()
    return 'clicked'
  })()`)

  const running = await waitFor(cdp, `${text()}.includes("Searching for up to 20 companies")`, 15000)
  check('running text shows', !!running)

  // 4) Done: extract "Found N ... companies".
  const doneOk = await waitFor(cdp, `${text()}.match(/Found [0-9,]+ companies/) || ${text()}.match(/Found [0-9,]+ of [0-9,]+ requested companies/) || (${text()}.includes("No companies matched"))`, 240000, 1000)
  check('done text reached', !!doneOk, doneOk ? JSON.stringify(doneOk) : 'timeout')
  const mFound = doneOk && doneOk !== true && doneOk[0] ? doneOk[0].match(/[0-9,]+/) : null
  const shownN = mFound ? Number(mFound[0].replace(/,/g, '')) : (doneOk === true ? 0 : null)
  const body2 = await evalJson(cdp, threadText)
  check('found+requested tiles', /Companies found/.test(body2 || '') && /Requested/.test(body2 || ''))
  check('start button hidden after done', !(await evalJson(cdp, startBtn)))
  check('threadMeta companies', /1 request · \d+ companies/.test(body2 || ''))
  console.log('REPORTED_N=' + shownN)

  // 5) Second ask, then clear session while running — source must close, no errors.
  await cdp.eval(`(() => {
    const t = document.querySelector('textarea')
    t.focus()
    document.execCommand('insertText', false, 'find 5 companies in Berlin')
    return true
  })()`)
  await cdp.eval(`(() => {
    const box = document.querySelector('textarea').closest('div')
    const b = [...box.querySelectorAll('button')].find(x => x.textContent.includes('Start research'))
    b.click(); return true
  })()`)
  await waitFor(cdp, `${text()}.includes("up to 5 companies")`, 30000)
  await cdp.eval(`(() => {
    const els = [...document.querySelectorAll('span')]
    const b = els.filter(e => e.textContent.trim() === 'Start research →').pop()
    b.click(); return true
  })()`)
  const running2 = await waitFor(cdp, `${text()}.includes("Searching for up to 5 companies")`, 15000)
  check('second job running', !!running2)
  await cdp.eval(`(() => {
    const b = [...document.querySelectorAll('span')].find(e => e.textContent.trim() === 'Clear session')
    b.click(); return true
  })()`)
  await sleep(1500)
  const body3 = await evalJson(cdp, text())
  check('thread cleared', !/Research session/.test(body3 || '') || !/Searching for up to 5/.test(body3 || ''))
  check('no console errors after clear', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '))

  cdp.close()
} finally {
  chrome.kill('SIGKILL')
}
process.exit(failures ? 1 : 0)
