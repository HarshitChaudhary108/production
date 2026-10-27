import { Fragment } from 'react'
import { cssToObj } from '../../../lib/css'
import type { HomeValues } from '../types'

const S = cssToObj

export function ColumnPanel({ m }: { m: HomeValues }) {
  const { closeColumnPanel, createEnrich, creditsLeft, cycleEnrichSort, enrichPrompt, enrichQ, enrichSortLabel, enrichments, onEnrichPrompt, onEnrichQ } = m
  return (
    <div onClick={closeColumnPanel} style={S('position:absolute; inset:0; background:rgba(24,24,27,.28); z-index:74; display:flex; justify-content:flex-end')}>
      <div style={S('width:452px; height:100%; background:#FFFFFF; border-left:1px solid #D4D4D8; display:flex; flex-direction:column')}>
        <div style={S('flex:none; display:flex; align-items:center; justify-content:space-between; padding:14px 18px; border-bottom:1px solid #E4E4E7')}>
          <div>
            <div style={S('font-size:15px; font-weight:650')}>Create column</div>
            <div style={S('font-size:12.5px; color:#71717A; margin-top:3px')}>Runs on every row of the active sheet.</div>
          </div>
          <button onClick={closeColumnPanel} className="hv2-bg-f4" style={S('width:28px; height:28px; border:1px solid #E4E4E7; background:#FFFFFF; border-radius:3px; cursor:pointer; color:#52525B; font-size:15px; line-height:1')}>×</button>
        </div>
        <div style={S('flex:none; padding:15px 18px; border-bottom:1px solid #E4E4E7')}>
          <div style={S('font-size:13px; font-weight:600; color:#3F3F46')}>What should this column do?</div>
          <textarea onChange={onEnrichPrompt} value={enrichPrompt} placeholder="Find whether the company is B2B or B2C" style={S('width:100%; margin-top:8px; height:70px; resize:none; border:1px solid #D4D4D8; border-radius:3px; padding:10px 11px; font-size:13px; font-family:inherit; color:#3F3F46; outline:none; line-height:1.55')}></textarea>
          <button onClick={createEnrich} className="hv2-purple" style={S('width:100%; margin-top:10px; height:36px; border:1px solid #6D28D9; background:#6D28D9; color:#FFFFFF; border-radius:3px; font-size:13.5px; font-weight:600; cursor:pointer; font-family:inherit')}>Add column</button>
          <div style={S('display:flex; align-items:center; justify-content:space-between; margin-top:9px; font-size:12px; color:#71717A; font-variant-numeric:tabular-nums')}>
            <span>AI column · ~3 credits / cell · 400 rows</span>
            <span>{creditsLeft} available</span>
          </div>
        </div>
        <div style={S('flex:none; display:flex; align-items:center; gap:7px; padding:11px 18px; border-bottom:1px solid #E4E4E7')}>
          <div style={S('display:flex; align-items:center; gap:7px; height:32px; padding:0 10px; border:1px solid #E4E4E7; border-radius:3px; flex:1')}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#A1A1AA" strokeWidth="1.8" style={S('flex:none')}><circle cx="9" cy="9" r="5.6"></circle><path d="M13.2 13.2L17 17"></path></svg>
            <input onChange={onEnrichQ} value={enrichQ} placeholder="Search enrichments" style={S('border:none; outline:none; background:transparent; font-size:13px; width:100%; min-width:0; color:#3F3F46; font-family:inherit')}></input>
          </div>
          <span onClick={cycleEnrichSort} className="hv2-border-soft" style={S('height:32px; padding:0 10px; border:1px solid #E4E4E7; border-radius:3px; display:flex; align-items:center; font-size:12.5px; color:#52525B; font-weight:500; cursor:pointer; white-space:nowrap')}>{enrichSortLabel}</span>
        </div>
        <div style={S('flex:1; min-height:0; overflow-y:auto')}>
          {(enrichments ?? []).map((e: any, __i: number) => (
            <Fragment key={__i}>
              <div onClick={e.add} className="hv2-bg" style={S('display:flex; align-items:center; gap:12px; padding:12px 18px; border-bottom:1px solid #F4F4F5; cursor:pointer')}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#52525B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={S('flex:none')}><path d={e.path}></path></svg>
                <span style={S('flex:1; min-width:0')}>
                  <span style={S('display:block; font-size:13.5px; font-weight:600; color:#18181B; overflow:hidden; text-overflow:ellipsis; white-space:nowrap')}>{e.name}</span>
                  <span style={S('display:block; font-size:12.5px; color:#71717A; margin-top:3px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap')}>{e.desc}</span>
                </span>
                {e.hasSrc ? <span style={S(e.srcStyle)}>{e.src}</span> : null}
                <span style={S('flex:none; font-size:12.5px; color:#52525B; font-weight:500; white-space:nowrap; font-variant-numeric:tabular-nums')}>{e.cost}</span>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PreviewDrawer({ m }: { m: HomeValues }) {
  const { closePreview, pv } = m
  return (
    <div onClick={closePreview} style={S('position:absolute; inset:0; background:rgba(24,24,27,.28); z-index:75; display:flex; justify-content:flex-end')}>
      <div style={S('width:620px; height:100%; background:#FFFFFF; border-left:1px solid #D4D4D8; display:flex; flex-direction:column')}>
        <div style={S('flex:none; display:flex; align-items:flex-start; justify-content:space-between; gap:14px; padding:16px 20px; border-bottom:1px solid #E4E4E7')}>
          <div style={S('display:flex; align-items:flex-start; gap:11px; min-width:0')}>
            <span style={S('flex:none; width:32px; height:32px; border:1px solid #DED2F7; background:#F6F3FE; border-radius:3px; display:flex; align-items:center; justify-content:center')}>
              <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="#6D28D9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={pv.path}></path></svg>
            </span>
            <span style={S('min-width:0')}>
              <span style={S('display:block; font-size:16px; font-weight:650; letter-spacing:-.01em; color:#18181B')}>{pv.name}</span>
              <span style={S('display:block; font-size:12px; font-weight:600; color:#71717A; letter-spacing:.04em; text-transform:uppercase; margin-top:3px')}>{pv.cat}</span>
            </span>
          </div>
          <button onClick={closePreview} className="hv2-bg-f4" style={S('flex:none; width:28px; height:28px; border:1px solid #E4E4E7; background:#FFFFFF; border-radius:3px; cursor:pointer; color:#52525B; font-size:15px; line-height:1')}>×</button>
        </div>

        <div style={S('flex:1; min-height:0; overflow-y:auto; padding:18px 20px 24px')}>
          <div style={S('font-size:13.5px; color:#3F3F46; line-height:1.6; text-wrap:pretty')}>{pv.desc}</div>

          <div style={S('margin-top:20px; font-size:11.5px; font-weight:700; color:#A1A1AA; letter-spacing:.09em; text-transform:uppercase')}>Input</div>
          <div style={S('margin-top:8px; border:1px solid #E4E4E7; border-radius:3px; padding:11px 13px; display:flex; align-items:center; gap:10px; background:#FCFCFC')}>
            <span style={S('font-size:13px; font-weight:600; color:#18181B')}>{pv.input}</span>
            <span style={S('font-size:12.5px; color:#71717A')}>{pv.inputHint}</span>
          </div>

          <div style={S('margin-top:20px; font-size:11.5px; font-weight:700; color:#A1A1AA; letter-spacing:.09em; text-transform:uppercase')}>Research steps</div>
          <div style={S('margin-top:8px; border:1px solid #E4E4E7; border-radius:3px')}>
            {(pv.steps ?? []).map((st: any, __i: number) => (
              <Fragment key={__i}>
                <div style={S(st.style)}>
                  <span style={S('flex:none; width:20px; height:20px; border:1px solid #E4E4E7; background:#FAFAFA; border-radius:2px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#52525B; font-variant-numeric:tabular-nums')}>{st.n}</span>
                  <span style={S('flex:1; font-size:13px; color:#3F3F46')}>{st.label}</span>
                </div>
              </Fragment>
            ))}
          </div>

          <div style={S('margin-top:20px; font-size:11.5px; font-weight:700; color:#A1A1AA; letter-spacing:.09em; text-transform:uppercase')}>Columns created</div>
          <div style={S('margin-top:8px; border:1px solid #E4E4E7; border-radius:3px; overflow:hidden')}>
            <div style={S('display:grid; grid-template-columns:1.3fr 1fr 1fr .9fr; background:#F6F6F7; border-bottom:1px solid #E4E4E7')}>
              <span style={S('padding:8px 11px; font-size:11.5px; font-weight:600; color:#52525B; border-right:1px solid #E9E9EC')}>Column</span>
              <span style={S('padding:8px 11px; font-size:11.5px; font-weight:600; color:#52525B; border-right:1px solid #E9E9EC')}>Data type</span>
              <span style={S('padding:8px 11px; font-size:11.5px; font-weight:600; color:#52525B; border-right:1px solid #E9E9EC')}>Source</span>
              <span style={S('padding:8px 11px; font-size:11.5px; font-weight:600; color:#52525B')}>Est. cost</span>
            </div>
            {(pv.columns ?? []).map((c: any, __i: number) => (
              <Fragment key={__i}>
                <div style={S('display:grid; grid-template-columns:1.3fr 1fr 1fr .9fr; border-bottom:1px solid #F1F1F2')}>
                  <span style={S('padding:9px 11px; font-size:12.5px; font-weight:600; color:#18181B; border-right:1px solid #F4F4F5; overflow:hidden; text-overflow:ellipsis; white-space:nowrap')}>{c.name}</span>
                  <span style={S('padding:9px 11px; font-size:12.5px; color:#52525B; border-right:1px solid #F4F4F5')}>{c.type}</span>
                  <span style={S('padding:9px 11px; font-size:12.5px; color:#52525B; border-right:1px solid #F4F4F5; overflow:hidden; text-overflow:ellipsis; white-space:nowrap')}>{c.src}</span>
                  <span style={S('padding:9px 11px; font-size:12.5px; color:#52525B; font-variant-numeric:tabular-nums')}>{c.cost}</span>
                </div>
              </Fragment>
            ))}
          </div>

          <div style={S('margin-top:20px; font-size:11.5px; font-weight:700; color:#A1A1AA; letter-spacing:.09em; text-transform:uppercase')}>Output preview</div>
          <div style={S('margin-top:8px; border:1px solid #E4E4E7; border-radius:3px; overflow:hidden')}>
            <div style={S(`display:grid; grid-template-columns:${pv.outGrid}; background:#F6F6F7; border-bottom:1px solid #E4E4E7`)}>
              {(pv.outCols ?? []).map((c: any, __i: number) => (
                <Fragment key={__i}>
                  <span style={S('padding:8px 10px; font-size:11.5px; font-weight:600; color:#52525B; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; border-right:1px solid #E9E9EC')}>{c}</span>
                </Fragment>
              ))}
            </div>
            {(pv.outRows ?? []).map((row: any, __i: number) => (
              <Fragment key={__i}>
                <div style={S(`display:grid; grid-template-columns:${pv.outGrid}; border-bottom:1px solid #F1F1F2`)}>
                  {(row.cells ?? []).map((v: any, __j: number) => (
                    <Fragment key={__j}>
                      <span style={S('padding:9px 10px; font-size:12.5px; color:#3F3F46; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; border-right:1px solid #F4F4F5; font-variant-numeric:tabular-nums')}>{v}</span>
                    </Fragment>
                  ))}
                </div>
              </Fragment>
            ))}
          </div>
          <div style={S('margin-top:8px; font-size:12px; color:#A1A1AA')}>Sample output. Nothing runs and no credits are spent while previewing.</div>
        </div>

        <div style={S('flex:none; border-top:1px solid #E4E4E7; background:#FCFCFC; padding:13px 20px; display:flex; align-items:center; gap:16px')}>
          <div>
            <div style={S('font-size:12px; color:#71717A')}>Estimated cost</div>
            <div style={S('font-size:13.5px; font-weight:650; color:#18181B; margin-top:2px; font-variant-numeric:tabular-nums')}>{pv.cost}</div>
          </div>
          <div>
            <div style={S('font-size:12px; color:#71717A')}>Estimated output</div>
            <div style={S('font-size:13.5px; font-weight:650; color:#18181B; margin-top:2px')}>{pv.output}</div>
          </div>
          <div style={S('margin-left:auto; display:flex; gap:8px')}>
            <button onClick={closePreview} className="hv2-bg-f4" style={S('height:36px; padding:0 15px; border:1px solid #D4D4D8; background:#FFFFFF; border-radius:3px; font-size:13px; font-weight:600; color:#3F3F46; cursor:pointer; font-family:inherit')}>Cancel</button>
            <button onClick={pv.use} className="hv2-purple" style={S('height:36px; padding:0 16px; border:1px solid #6D28D9; background:#6D28D9; border-radius:3px; font-size:13px; font-weight:600; color:#FFFFFF; cursor:pointer; font-family:inherit')}>Use this workflow</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RunDialog({ m }: { m: HomeValues }) {
  const { closeRun, confirmRun, runBody, runBtnLabel, runBtnStyle, runFacts, runShort, runShortBody, runTitle } = m
  return (
    <div onClick={closeRun} style={S('position:absolute; inset:0; background:rgba(24,24,27,.32); z-index:78; display:flex; align-items:center; justify-content:center')}>
      <div style={S('width:440px; background:#FFFFFF; border:1px solid #D4D4D8; border-radius:4px; box-shadow:0 24px 56px rgba(24,24,27,.22); animation:pop .14s ease-out')}>
        <div style={S('padding:16px 18px; border-bottom:1px solid #E4E4E7; font-size:15px; font-weight:650')}>{runTitle}</div>
        <div style={S('padding:16px 18px')}>
          <div style={S('font-size:13.5px; color:#3F3F46; line-height:1.6')}>{runBody}</div>
          <div style={S('margin-top:14px; border:1px solid #E4E4E7; border-radius:3px')}>
            {(runFacts ?? []).map((f: any, __i: number) => (
              <Fragment key={__i}>
                <div style={S('display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-bottom:1px solid #F4F4F5')}>
                  <span style={S('font-size:13px; color:#71717A')}>{f.label}</span>
                  <span style={S(`font-size:13px; font-weight:600; color:${f.color}; font-variant-numeric:tabular-nums`)}>{f.value}</span>
                </div>
              </Fragment>
            ))}
          </div>
          {runShort ? (
            <div style={S('margin-top:12px; border:1px solid #F0C9A8; background:#FFF8F1; padding:11px 12px')}>
              <div style={S('font-size:13px; font-weight:600; color:#C2410C')}>Insufficient credits</div>
              <div style={S('font-size:12.5px; color:#9A3412; margin-top:4px; font-variant-numeric:tabular-nums')}>{runShortBody}</div>
            </div>
          ) : null}
        </div>
        <div style={S('display:flex; justify-content:flex-end; gap:8px; padding:13px 18px; border-top:1px solid #E4E4E7; background:#FCFCFC')}>
          <button onClick={closeRun} className="hv2-bg-f4" style={S('height:34px; padding:0 14px; border:1px solid #D4D4D8; background:#FFFFFF; border-radius:3px; font-size:13px; font-weight:600; color:#3F3F46; cursor:pointer; font-family:inherit')}>Cancel</button>
          <button onClick={confirmRun} className="hv2-purple" style={S(runBtnStyle)}>{runBtnLabel}</button>
        </div>
      </div>
    </div>
  )
}

export function CreditsModal({ m }: { m: HomeValues }) {
  const { closeCredits, creditsLeft, creditsUsed, packs, rates, usedPct } = m
  return (
    <div onClick={closeCredits} style={S('position:absolute; inset:0; background:rgba(24,24,27,.32); z-index:76; display:flex; align-items:center; justify-content:center')}>
      <div style={S('width:452px; background:#FFFFFF; border:1px solid #D4D4D8; border-radius:4px; box-shadow:0 24px 56px rgba(24,24,27,.22); animation:pop .14s ease-out')}>
        <div style={S('padding:16px 18px; border-bottom:1px solid #E4E4E7; display:flex; align-items:center; justify-content:space-between')}>
          <span style={S('font-size:15px; font-weight:650')}>Credits and billing</span>
          <button onClick={closeCredits} className="hv2-bg-f4" style={S('width:27px; height:27px; border:1px solid #E4E4E7; background:#FFFFFF; border-radius:3px; cursor:pointer; color:#52525B; font-size:15px; line-height:1')}>×</button>
        </div>
        <div style={S('padding:16px 18px')}>
          <div style={S('display:flex; align-items:baseline; gap:9px')}>
            <span style={S('font-size:28px; font-weight:700; font-variant-numeric:tabular-nums; letter-spacing:-.02em')}>{creditsLeft}</span>
            <span style={S('font-size:13px; color:#71717A; font-variant-numeric:tabular-nums')}>credits available · {creditsUsed} used this cycle</span>
          </div>
          <div style={S('height:5px; background:#F0F0F1; overflow:hidden; margin-top:12px')}>
            <div style={S(`height:100%; background:#6D28D9; width:${usedPct}`)}></div>
          </div>
          <div style={S('margin-top:16px; border:1px solid #E4E4E7; border-radius:3px')}>
            <div style={S('display:flex; align-items:center; justify-content:space-between; padding:9px 12px; background:#F6F6F7; border-bottom:1px solid #E4E4E7')}>
              <span style={S('font-size:12px; font-weight:600; color:#52525B; letter-spacing:.03em; text-transform:uppercase')}>Enrichment</span>
              <span style={S('font-size:12px; font-weight:600; color:#52525B; letter-spacing:.03em; text-transform:uppercase')}>Cost</span>
            </div>
            {(rates ?? []).map((r: any, __i: number) => (
              <Fragment key={__i}>
                <div style={S('display:flex; align-items:center; justify-content:space-between; padding:9px 12px; border-bottom:1px solid #F4F4F5')}>
                  <span style={S('font-size:13px; color:#3F3F46')}>{r.label}</span>
                  <span style={S('font-size:13px; font-weight:600; color:#3F3F46; font-variant-numeric:tabular-nums')}>{r.cost}</span>
                </div>
              </Fragment>
            ))}
          </div>
          <div style={S('display:flex; gap:8px; margin-top:16px')}>
            {(packs ?? []).map((p: any, __i: number) => (
              <Fragment key={__i}>
                <button onClick={p.buy} className="hv2-border-only" style={S('flex:1; height:62px; border:1px solid #E4E4E7; background:#FFFFFF; border-radius:3px; cursor:pointer; font-family:inherit; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px')}>
                  <span style={S('font-size:14px; font-weight:700; color:#18181B; font-variant-numeric:tabular-nums')}>{p.amount}</span>
                  <span style={S('font-size:12px; color:#71717A')}>{p.price}</span>
                </button>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Toast({ m }: { m: HomeValues }) {
  const { toast } = m
  return (
    <div style={S('position:absolute; bottom:24px; left:50%; transform:translateX(-50%); z-index:90; padding:10px 15px; background:#18181B; color:#FFFFFF; font-size:13px; font-weight:500; border-radius:3px; box-shadow:0 12px 30px rgba(24,24,27,.26); animation:pop .14s ease-out; white-space:nowrap')}>{toast}</div>
  )
}
