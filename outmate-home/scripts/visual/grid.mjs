import { spawn } from 'node:child_process'
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { connectPage } from './cdp.mjs'
import { startServer } from './server.mjs'

const PORT = 4101
const server = await startServer(PORT)
const debugPort = 9690
const profile = `/tmp/outmate-grid-${process.pid}`
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
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1600,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await cdp.send('Browser.grantPermissions', {
    origin: `http://localhost:${PORT}`,
    permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
  })
  await cdp.send('Page.bringToFront')
  await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: true })
  const loaded = cdp.once('Page.loadEventFired')
  await cdp.send('Page.navigate', { url: `http://localhost:${PORT}/workspace` })
  await loaded
  await cdp.eval(
    `new Promise((resolve) => {
      let n = 0
      const tick = () => {
        if (document.querySelector('[data-cell="Acme|domain"]')) return resolve(true)
        if (++n > 300) return resolve(false)
        setTimeout(tick, 50)
      }
      tick()
    })`,
    true,
  )
  await cdp.eval('document.fonts.ready.then(() => true)', true)

  const results = await cdp.eval(
    `(async () => {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms))
      const fire = (el, type, init = {}) =>
        el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, ...init }))
      const key = (el, name, init = {}) =>
        el.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...init }))
      const cell = (id) => document.querySelector('[data-cell="' + id + '"]')
      const click = async (id) => {
        const el = cell(id)
        fire(el, 'mousedown')
        window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
        await wait(60)
        return el
      }
      const grid = document.querySelector('[role="grid"]')
      const out = {}
      out.gridFound = !!grid && grid.tabIndex === 0

      await click('Acme|domain')
      out.activeCell = grid.getAttribute('aria-activedescendant') === cell('Acme|domain').id
      key(grid, 'ArrowRight')
      await wait(60)
      out.arrowRight = grid.getAttribute('aria-activedescendant') === cell('Acme|linkedin').id

      await click('Acme|domain')
      key(grid, 'ArrowDown', { shiftKey: true })
      await wait(60)
      out.rangeSelection =
        cell('Acme|domain').getAttribute('aria-selected') === 'true' &&
        cell('RevenueFlow|domain').getAttribute('aria-selected') === 'true'

      key(grid, 'c', { ctrlKey: true })
      await wait(200)
      try {
        out.copyRange = (await navigator.clipboard.readText()) === 'acme.io\\nrevenueflow.com'
      } catch {
        out.copyRange = false
      }

      await click('Acme|domain')
      key(grid, 'Enter')
      await wait(60)
      const input = cell('Acme|domain').querySelector('input')
      out.inlineEdit = !!input
      if (input) {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
        setter.call(input, 'acme.dev')
        input.dispatchEvent(new Event('input', { bubbles: true }))
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
        await wait(80)
      }
      out.editCommitted = cell('Acme|domain').getAttribute('data-text') === 'acme.dev'

      await click('Acme|loc')
      key(grid, 'Enter')
      await wait(60)
      const cancelInput = cell('Acme|loc').querySelector('input')
      if (cancelInput) {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
        setter.call(cancelInput, 'SHOULD NOT SAVE')
        cancelInput.dispatchEvent(new Event('input', { bubbles: true }))
        cancelInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
        await wait(60)
      }
      out.escapeCancels = !cell('Acme|loc').querySelector('input') &&
        cell('Acme|loc').getAttribute('data-text') !== 'SHOULD NOT SAVE'

      await click('Acme|emp')
      const dt = new DataTransfer()
      dt.setData('text/plain', '300\\tLondon, UK\\n450\\tBerlin, DE')
      cell('Acme|emp').dispatchEvent(
        new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }),
      )
      await wait(120)
      out.pasteEditable =
        cell('Acme|emp').getAttribute('data-text') === '300 employees' &&
        cell('Acme|loc').getAttribute('data-text') === 'London, UK' &&
        cell('RevenueFlow|emp').getAttribute('data-text') === '450 employees' &&
        cell('RevenueFlow|loc').getAttribute('data-text') === 'Berlin, DE'

      await click('Acme|company')
      const panel = () => [...document.querySelectorAll('[data-page="workspace"] aside')].pop()
      const before = panel()?.textContent ?? ''
      const companySpan = [...cell('RevenueFlow|company').querySelectorAll('span')].find(
        (s) => s.textContent === 'RevenueFlow',
      )
      companySpan?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      await wait(120)
      const after = panel()?.textContent ?? ''
      out.recordOpens = before.includes('acme.io') && after.includes('revenueflow.com')

      const headers = [...document.querySelectorAll('[role="columnheader"]')]
      const domainHead = headers.find((h) => h.textContent.includes('Domain'))
      const beforeWidth = domainHead.getBoundingClientRect().width
      const handle = domainHead.querySelector('.cursor-col-resize')
      const rect = domainHead.getBoundingClientRect()
      handle.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: rect.right }),
      )
      window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: rect.right + 60 }))
      window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
      await wait(120)
      out.columnResize = domainHead.getBoundingClientRect().width >= beforeWidth + 40

      const label = domainHead.querySelector('span.overflow-hidden')
      label.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      await wait(60)
      out.headerSelectsColumn = cell('Brightpath|domain').getAttribute('aria-selected') === 'true'

      const checkCell = cell('Acme|check')
      checkCell.querySelector('span').dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true }),
      )
      await wait(80)
      out.bulkSelection = checkCell.querySelector('span span')?.textContent === '✓'

      await click('Acme|company')
      const skip = new DataTransfer()
      skip.setData('text/plain', 'Hacked')
      cell('Acme|company').dispatchEvent(
        new ClipboardEvent('paste', { clipboardData: skip, bubbles: true, cancelable: true }),
      )
      await wait(100)
      out.readOnlyPasteSkipped = cell('Acme|company').getAttribute('data-text') === 'Acme'

      const tab = (name) => document.querySelector('[data-sheet-tab="' + name + '"]')
      const press = async (el) => {
        fire(el, 'mousedown')
        window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
        await wait(60)
      }
      const firstCell = (sheet, key) =>
        [...document.querySelectorAll('[data-sheet="' + sheet + '"] [role="gridcell"]')].find(
          (el) => el.getAttribute('data-cell').endsWith('|' + key),
        )

      tab('Leaders').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      await wait(120)
      const leaderGrid = document.querySelector('[data-sheet="leaders"]')
      out.leadersGrid = !!leaderGrid && leaderGrid.getAttribute('role') === 'grid'
      const leaderPerson = firstCell('leaders', 'person')
      await press(leaderPerson)
      out.leadersActive = leaderGrid.getAttribute('aria-activedescendant') === leaderPerson.id
      key(leaderGrid, 'ArrowRight')
      await wait(60)
      out.leadersArrow =
        leaderGrid.getAttribute('aria-activedescendant') === firstCell('leaders', 'title').id

      await press(leaderPerson)
      key(leaderGrid, 'ArrowDown', { shiftKey: true })
      await wait(60)
      const secondLeader = [
        ...document.querySelectorAll('[data-sheet="leaders"] [data-cell$="|person"]'),
      ][1]
      out.leadersRange =
        leaderPerson.getAttribute('aria-selected') === 'true' &&
        secondLeader.getAttribute('aria-selected') === 'true'

      key(leaderGrid, 'c', { ctrlKey: true })
      await wait(200)
      try {
        out.leadersCopy =
          (await navigator.clipboard.readText()) ===
          leaderPerson.getAttribute('data-text') + '\\n' + secondLeader.getAttribute('data-text')
      } catch {
        out.leadersCopy = false
      }

      const leaderHead = [
        ...document.querySelectorAll('[data-sheet="leaders"] [role="columnheader"]'),
      ].find((h) => h.textContent.includes('Person'))
      const beforeLeaderWidth = leaderHead.getBoundingClientRect().width
      const leaderRect = leaderHead.getBoundingClientRect()
      leaderHead.querySelector('.cursor-col-resize').dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: leaderRect.right }),
      )
      window.dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true, clientX: leaderRect.right + 50 }),
      )
      window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
      await wait(120)
      out.leadersResize = leaderHead.getBoundingClientRect().width >= beforeLeaderWidth + 30

      tab('Signals').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      await wait(120)
      const signalGrid = document.querySelector('[data-sheet="signals"]')
      out.signalsGrid = !!signalGrid && signalGrid.getAttribute('role') === 'grid'
      const signalCompany = firstCell('signals', 'company')
      await press(signalCompany)
      out.signalsActive = signalGrid.getAttribute('aria-activedescendant') === signalCompany.id

      key(signalGrid, 'c', { ctrlKey: true })
      await wait(200)
      try {
        out.signalsCopy =
          (await navigator.clipboard.readText()) === signalCompany.getAttribute('data-text')
      } catch {
        out.signalsCopy = false
      }

      key(signalGrid, 'ArrowRight')
      await wait(60)
      out.signalsArrow =
        signalGrid.getAttribute('aria-activedescendant') === firstCell('signals', 'type').id

      return out
    })()`,
    true,
  )

  for (const [name, value] of Object.entries(results)) {
    const failed = value === false
    if (failed) failures += 1
    console.log(`[grid] ${name}: ${failed ? 'FAIL' : 'ok'}`)
  }
} finally {
  chrome.kill('SIGKILL')
  server.close()
  rmSync(profile, { recursive: true, force: true })
}

console.log(failures ? `GRID FAIL (${failures})` : 'GRID OK')
process.exit(failures ? 1 : 0)
