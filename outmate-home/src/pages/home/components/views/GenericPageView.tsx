import { Fragment } from 'react'
import { cssToObj } from '../../../../lib/css'
import type { HomeValues } from '../../types'

const S = cssToObj

export function GenericPageView({ m }: { m: HomeValues }) {
  const { emptyBody, emptyTitle, pageAction, pageActionLabel, pageBlurb, pageCards, pageCols, pageEmpty, pageGrid, pageHasCards, pageHasTable, pageRows, pageTitle } = m
  return (
    <div style={S('max-width:1200px; margin:0 auto; padding:30px 36px 64px')}>
      <div style={S('display:flex; align-items:flex-start; justify-content:space-between; gap:20px')}>
        <div>
          <h1 style={S('margin:0; font-size:24px; font-weight:700; letter-spacing:-.018em')}>{pageTitle}</h1>
          <p style={S('margin:7px 0 0; font-size:14px; color:#71717A')}>{pageBlurb}</p>
        </div>
        <button onClick={pageAction} className="hv2-purple" style={S('flex:none; height:36px; padding:0 15px; border:1px solid #6D28D9; background:#6D28D9; color:#FFFFFF; border-radius:3px; font-size:13.5px; font-weight:600; cursor:pointer; font-family:inherit')}>{pageActionLabel}</button>
      </div>

      {pageHasTable ? (
        <div style={S('margin-top:20px; border:1px solid #E4E4E7; border-radius:3px; overflow:hidden')}>
          <div style={S(`display:grid; grid-template-columns:${pageGrid}; background:#F6F6F7; border-bottom:1px solid #E4E4E7`)}>
            {(pageCols ?? []).map((c: any, __i: number) => (
              <Fragment key={__i}>
                <span style={S(c.style)}>{c.label}</span>
              </Fragment>
            ))}
          </div>
          {(pageRows ?? []).map((r: any, __i: number) => (
            <Fragment key={__i}>
              <div onClick={r.act} className="hv2-bg" style={S(`display:grid; grid-template-columns:${pageGrid}; border-bottom:1px solid #EFEFF0; cursor:pointer; background:#FFFFFF; min-height:46px`)}>
                {(r.cells ?? []).map((v: any, __j: number) => (
                  <Fragment key={__j}>
                    <span style={S('padding:11px 13px; display:flex; align-items:center; font-size:13px; color:#3F3F46; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-variant-numeric:tabular-nums')}>{v}</span>
                  </Fragment>
                ))}
              </div>
            </Fragment>
          ))}
        </div>
      ) : null}

      {pageHasCards ? (
        <div style={S('margin-top:20px; border:1px solid #E4E4E7; border-radius:3px; display:grid; grid-template-columns:1fr 1fr')}>
          {(pageCards ?? []).map((c: any, __i: number) => (
            <Fragment key={__i}>
              <div onClick={c.act} className="hv2-bg" style={S(c.rowStyle)}>
                <span style={S(`flex:none; width:28px; height:28px; border-radius:2px; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:#FFFFFF; background:${c.bg}`)}>{c.mark}</span>
                <span style={S('flex:1; min-width:0')}>
                  <span style={S('display:block; font-size:13.5px; font-weight:600; color:#18181B')}>{c.name}</span>
                  <span style={S('display:block; font-size:12.5px; color:#71717A; margin-top:3px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap')}>{c.desc}</span>
                </span>
                <span style={S(c.stateStyle)}>{c.state}</span>
              </div>
            </Fragment>
          ))}
        </div>
      ) : null}

      {pageEmpty ? (
        <div style={S('margin-top:20px; border:1px solid #E4E4E7; border-radius:3px; padding:56px 24px; display:flex; flex-direction:column; align-items:center; gap:8px; background:#FCFCFC')}>
          <div style={S('font-size:15px; font-weight:600; color:#3F3F46')}>{emptyTitle}</div>
          <div style={S('font-size:13px; color:#71717A; text-align:center; max-width:380px; line-height:1.6')}>{emptyBody}</div>
        </div>
      ) : null}
    </div>
  )
}
