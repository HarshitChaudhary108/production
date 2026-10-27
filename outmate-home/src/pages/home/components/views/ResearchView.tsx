import { Fragment } from 'react'
import { cssToObj } from '../../../../lib/css'
import type { HomeValues } from '../../types'

const S = cssToObj

export function ResearchView({ m }: { m: HomeValues }) {
  const { newResearch, onQ, q, researchChips, researchCols, researchGrid, researchRows } = m
  return (
    <div style={S('max-width:1300px; margin:0 auto; padding:30px 36px 64px')}>
      <div style={S('display:flex; align-items:flex-start; justify-content:space-between; gap:20px')}>
        <div>
          <h1 style={S('margin:0; font-size:24px; font-weight:700; letter-spacing:-.018em')}>Recent Research</h1>
          <p style={S('margin:7px 0 0; font-size:14px; color:#71717A')}>Pick up your previous GTM research exactly where you left off.</p>
        </div>
        <button onClick={newResearch} className="hv2-purple" style={S('flex:none; height:36px; padding:0 15px; border:1px solid #6D28D9; background:#6D28D9; color:#FFFFFF; border-radius:3px; font-size:13.5px; font-weight:600; cursor:pointer; font-family:inherit')}>+ New research</button>
      </div>
      <div style={S('margin-top:20px; display:flex; align-items:center; gap:8px; flex-wrap:wrap')}>
        <div style={S('display:flex; align-items:center; gap:7px; height:34px; padding:0 10px; border:1px solid #E4E4E7; border-radius:3px; width:250px')}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#A1A1AA" strokeWidth="1.8" style={S('flex:none')}><circle cx="9" cy="9" r="5.6"></circle><path d="M13.2 13.2L17 17"></path></svg>
          <input onChange={onQ} value={q} placeholder="Search research" style={S('border:none; outline:none; background:transparent; font-size:13px; width:100%; min-width:0; color:#3F3F46; font-family:inherit')}></input>
        </div>
        {(researchChips ?? []).map((c: any, __i: number) => (
          <Fragment key={__i}>
            <span onClick={c.pick} style={S(c.style)}>{c.label}</span>
          </Fragment>
        ))}
      </div>
      <div style={S('margin-top:14px; border:1px solid #E4E4E7; border-radius:3px; overflow:hidden')}>
        <div style={S(`display:grid; grid-template-columns:${researchGrid}; background:#F6F6F7; border-bottom:1px solid #E4E4E7`)}>
          {(researchCols ?? []).map((c: any, __i: number) => (
            <Fragment key={__i}>
              <span style={S(c.style)}>{c.label}</span>
            </Fragment>
          ))}
        </div>
        {(researchRows ?? []).map((r: any, __i: number) => (
          <Fragment key={__i}>
            <div onClick={r.act} className="hv2-bg" style={S(`display:grid; grid-template-columns:${researchGrid}; border-bottom:1px solid #EFEFF0; cursor:pointer; background:#FFFFFF; min-height:50px`)}>
              <span style={S('padding:11px 13px; display:flex; align-items:center; font-size:13.5px; font-weight:600; color:#18181B; overflow:hidden; text-overflow:ellipsis; white-space:nowrap')}>{r.name}</span>
              <span style={S(m.textCell)}>{r.type}</span>
              <span style={S(m.numCell)}>{r.companies}</span>
              <span style={S(m.numCell)}>{r.leaders}</span>
              <span style={S(m.numCell)}>{r.signals}</span>
              <span style={S(m.numCell)}>{r.enriched}</span>
              <span style={S(m.numCell)}>{r.creditsUsed}</span>
              <span style={S(m.textCell)}>{r.updated}</span>
              <span style={S('padding:11px 13px; display:flex; align-items:center')}><span style={S(r.statusStyle)}>{r.status}</span></span>
              <span style={S('padding:11px 13px; display:flex; align-items:center; font-size:12.5px; font-weight:600; color:#6D28D9; white-space:nowrap')}>Open →</span>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
