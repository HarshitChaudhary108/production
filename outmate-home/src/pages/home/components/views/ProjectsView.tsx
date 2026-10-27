import { Fragment } from 'react'
import { cssToObj } from '../../../../lib/css'
import type { HomeValues } from '../../types'

const S = cssToObj

export function ProjectsView({ m }: { m: HomeValues }) {
  const { filterSelects, newResearch, onQ, projectCols, projectGrid, projectRows, projectSummary, projectsEmpty, q, sortLabel, statusChips, toggleSort } = m
  return (
    <div style={S('max-width:1300px; margin:0 auto; padding:30px 36px 64px')}>
      <div style={S('display:flex; align-items:flex-start; justify-content:space-between; gap:20px')}>
        <div>
          <h1 style={S('margin:0; font-size:24px; font-weight:700; letter-spacing:-.018em')}>Projects</h1>
          <p style={S('margin:7px 0 0; font-size:14px; color:#71717A')}>Manage your GTM research workflows, datasets, and enrichment runs.</p>
        </div>
        <button onClick={newResearch} className="hv2-purple" style={S('flex:none; height:36px; padding:0 15px; border:1px solid #6D28D9; background:#6D28D9; color:#FFFFFF; border-radius:3px; font-size:13.5px; font-weight:600; cursor:pointer; font-family:inherit')}>+ New project</button>
      </div>

      <div style={S('margin-top:20px; display:flex; border:1px solid #E4E4E7; border-radius:3px')}>
        {(projectSummary ?? []).map((k: any, __i: number) => (
          <Fragment key={__i}>
            <div style={S(k.style)}>
              <div style={S('font-size:12px; color:#71717A; letter-spacing:.02em')}>{k.label}</div>
              <div style={S('font-size:21px; font-weight:700; color:#18181B; font-variant-numeric:tabular-nums; margin-top:5px; letter-spacing:-.01em')}>{k.value}</div>
            </div>
          </Fragment>
        ))}
      </div>

      <div style={S('margin-top:18px; display:flex; align-items:center; gap:8px; flex-wrap:wrap')}>
        <div style={S('display:flex; align-items:center; gap:7px; height:34px; padding:0 10px; border:1px solid #E4E4E7; border-radius:3px; width:250px')}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#A1A1AA" strokeWidth="1.8" style={S('flex:none')}><circle cx="9" cy="9" r="5.6"></circle><path d="M13.2 13.2L17 17"></path></svg>
          <input onChange={onQ} value={q} placeholder="Search projects" style={S('border:none; outline:none; background:transparent; font-size:13px; width:100%; min-width:0; color:#3F3F46; font-family:inherit')}></input>
        </div>
        {(statusChips ?? []).map((c: any, __i: number) => (
          <Fragment key={__i}>
            <span onClick={c.pick} style={S(c.style)}>{c.label}</span>
          </Fragment>
        ))}
        {(filterSelects ?? []).map((f: any, __i: number) => (
          <Fragment key={__i}>
            <span onClick={f.act} className="hv2-border-soft" style={S('display:flex; align-items:center; gap:6px; height:34px; padding:0 11px; border:1px solid #E4E4E7; background:#FFFFFF; border-radius:3px; font-size:13px; color:#52525B; font-weight:500; cursor:pointer')}>
              {f.label}
              <svg width="11" height="11" viewBox="0 0 20 20" fill="none" stroke="#A1A1AA" strokeWidth="2.4"><path d="M5 8l5 5 5-5"></path></svg>
            </span>
          </Fragment>
        ))}
        <span onClick={toggleSort} className="hv2-border-soft" style={S('margin-left:auto; display:flex; align-items:center; gap:6px; height:34px; padding:0 11px; border:1px solid #E4E4E7; background:#FFFFFF; border-radius:3px; font-size:13px; color:#52525B; font-weight:500; cursor:pointer; white-space:nowrap')}>{sortLabel}</span>
      </div>

      <div style={S('margin-top:14px; border:1px solid #E4E4E7; border-radius:3px; overflow:hidden')}>
        <div style={S(`display:grid; grid-template-columns:${projectGrid}; background:#F6F6F7; border-bottom:1px solid #E4E4E7`)}>
          {(projectCols ?? []).map((c: any, __i: number) => (
            <Fragment key={__i}>
              <span style={S(c.style)}>{c.label}</span>
            </Fragment>
          ))}
        </div>
        {(projectRows ?? []).map((r: any, __i: number) => (
          <Fragment key={__i}>
            <div onClick={r.act} className="hv2-bg" style={S(`display:grid; grid-template-columns:${projectGrid}; border-bottom:1px solid #EFEFF0; cursor:pointer; background:#FFFFFF; position:relative; min-height:52px`)}>
              <span style={S('padding:11px 13px; min-width:0')}>
                <span style={S('display:block; font-size:13.5px; font-weight:600; color:#18181B; overflow:hidden; text-overflow:ellipsis; white-space:nowrap')}>{r.name}</span>
                <span style={S('display:block; font-size:12px; color:#A1A1AA; margin-top:3px')}>{r.type}</span>
              </span>
              <span style={S('padding:11px 13px; display:flex; align-items:center')}><span style={S(r.statusStyle)}>{r.status}</span></span>
              <span style={S(m.numCell)}>{r.companies}</span>
              <span style={S(m.numCell)}>{r.leaders}</span>
              <span style={S(m.numCell)}>{r.signals}</span>
              <span style={S(m.numCell)}>{r.enriched}</span>
              <span style={S(m.textCell)}>{r.lastRun}</span>
              <span style={S(m.numCell)}>{r.creditsUsed}</span>
              <span style={S(m.textCell)}>{r.updated}</span>
              <span onClick={r.menu} title="Actions" className="hv2-gray" style={S('display:flex; align-items:center; justify-content:center; color:#A1A1AA; font-size:13px')}>•••</span>
              {r.menuOpen ? (
                <span style={S('position:absolute; top:44px; right:12px; width:170px; background:#FFFFFF; border:1px solid #D4D4D8; border-radius:3px; box-shadow:0 14px 34px rgba(24,24,27,.14); padding:4px; z-index:30; display:flex; flex-direction:column; animation:pop .12s ease-out')}>
                  {(r.items ?? []).map((i: any, __j: number) => (
                    <Fragment key={__j}>
                      <span onClick={i.act} className="hv2-bg-f4" style={S(`padding:8px 9px; border-radius:2px; font-size:12.5px; color:${i.color}; cursor:pointer`)}>{i.label}</span>
                    </Fragment>
                  ))}
                </span>
              ) : null}
            </div>
          </Fragment>
        ))}
        {projectsEmpty ? (
          <div style={S('padding:48px 24px; display:flex; flex-direction:column; align-items:center; gap:7px; background:#FCFCFC')}>
            <div style={S('font-size:14px; font-weight:600; color:#3F3F46')}>No projects match these filters</div>
            <div style={S('font-size:13px; color:#71717A')}>Clear the search or status filter to see all projects.</div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
