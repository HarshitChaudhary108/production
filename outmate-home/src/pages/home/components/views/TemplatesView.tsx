import { Fragment } from 'react'
import { cssToObj } from '../../../../lib/css'
import type { HomeValues } from '../../types'

const S = cssToObj

export function TemplatesView({ m }: { m: HomeValues }) {
  const { catChips, newTemplate, onQ, q, templateCols, templateGrid, workflowRows } = m
  return (
    <div style={S('max-width:1300px; margin:0 auto; padding:30px 36px 64px')}>
      <div style={S('display:flex; align-items:flex-start; justify-content:space-between; gap:20px')}>
        <div>
          <h1 style={S('margin:0; font-size:24px; font-weight:700; letter-spacing:-.018em')}>Templates</h1>
          <p style={S('margin:7px 0 0; font-size:14px; color:#71717A')}>Pre-built GTM intelligence workflows you can run and customize.</p>
        </div>
        <button onClick={newTemplate} className="hv2-purple" style={S('flex:none; height:36px; padding:0 15px; border:1px solid #6D28D9; background:#6D28D9; color:#FFFFFF; border-radius:3px; font-size:13.5px; font-weight:600; cursor:pointer; font-family:inherit')}>+ New template</button>
      </div>

      <div style={S('margin-top:20px; display:flex; align-items:center; gap:8px; flex-wrap:wrap')}>
        <div style={S('display:flex; align-items:center; gap:7px; height:34px; padding:0 10px; border:1px solid #E4E4E7; border-radius:3px; width:250px')}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#A1A1AA" strokeWidth="1.8" style={S('flex:none')}><circle cx="9" cy="9" r="5.6"></circle><path d="M13.2 13.2L17 17"></path></svg>
          <input onChange={onQ} value={q} placeholder="Search workflows..." style={S('border:none; outline:none; background:transparent; font-size:13px; width:100%; min-width:0; color:#3F3F46; font-family:inherit')}></input>
        </div>
        {(catChips ?? []).map((c: any, __i: number) => (
          <Fragment key={__i}>
            <span onClick={c.pick} style={S(c.style)}>{c.label}</span>
          </Fragment>
        ))}
      </div>

      <div style={S('margin-top:14px; border:1px solid #E4E4E7; border-radius:3px; overflow:hidden')}>
        <div style={S(`display:grid; grid-template-columns:${templateGrid}; background:#F6F6F7; border-bottom:1px solid #E4E4E7`)}>
          {(templateCols ?? []).map((c: any, __i: number) => (
            <Fragment key={__i}>
              <span style={S(c.style)}>{c.label}</span>
            </Fragment>
          ))}
        </div>
        {(workflowRows ?? []).map((w: any, __i: number) => (
          <Fragment key={__i}>
            <div className="hv2-bg" style={S(`display:grid; grid-template-columns:${templateGrid}; border-bottom:1px solid #EFEFF0; background:#FFFFFF; min-height:50px`)}>
              <span style={S('padding:11px 13px; display:flex; align-items:center; gap:10px; min-width:0')}>
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="#6D28D9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={S('flex:none')}><path d={w.path}></path></svg>
                <span style={S('font-size:13.5px; font-weight:600; color:#18181B; overflow:hidden; text-overflow:ellipsis; white-space:nowrap')}>{w.name}</span>
              </span>
              <span style={S(m.textCell)}>{w.desc}</span>
              <span style={S('padding:11px 13px; display:flex; align-items:center')}><span style={S('flex:none; padding:2px 7px; border:1px solid #E4E4E7; background:#FAFAFA; border-radius:2px; font-size:11.5px; font-weight:600; color:#52525B')}>{w.cat}</span></span>
              <span style={S(m.numCell)}>{w.cost}</span>
              <span style={S(m.textCell)}>{w.used}</span>
              <span style={S('padding:8px 11px; display:flex; align-items:center; gap:7px')}>
                <span onClick={w.run} className="hv2-purple" style={S('height:28px; padding:0 11px; border:1px solid #6D28D9; background:#6D28D9; color:#FFFFFF; border-radius:3px; display:flex; align-items:center; font-size:12.5px; font-weight:600; cursor:pointer; white-space:nowrap')}>Run template</span>
                <span onClick={w.preview} className="hv2-bg-f4" style={S('height:28px; padding:0 11px; border:1px solid #D4D4D8; border-radius:3px; display:flex; align-items:center; font-size:12.5px; font-weight:600; color:#3F3F46; cursor:pointer')}>Preview</span>
                <span onClick={w.duplicate} title="Duplicate" className="hv2-bg-f4" style={S('width:28px; height:28px; border:1px solid #D4D4D8; border-radius:3px; display:flex; align-items:center; justify-content:center; color:#71717A; cursor:pointer')}>
                  <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="7" y="7" width="9" height="9" rx="1"></rect><path d="M13 7V6a2 2 0 00-2-2H6a2 2 0 00-2 2v5a2 2 0 002 2h1"></path></svg>
                </span>
              </span>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
