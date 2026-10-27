import { Fragment } from 'react'
import { cssToObj } from '../../../../lib/css'
import type { HomeValues } from '../../types'

const S = cssToObj

export function HomeView({ m }: { m: HomeValues }) {
  const { agent, agentOpen, agents, allTemplates, attach, chips, clearThread, connectors, draft, estimateLabel, goProjects, gtmCats, gtmTemplates, hasThread, nextActions, onDraft, openColumnPanel, past7, past7Credits, past7Runs, railNext, railPrev, research, send, signalCols, socialSignals, thinking, thread, threadMeta, toggleAgent, toggleTools, tools, toolsOpen, viewVisitors, visitorCols, visitorSummary, visitorWindows, visitors, workflows } = m
  return (
    <div style={S('max-width:1080px; margin:0 auto; padding:44px 36px 64px')}>
      <h1 style={S("margin:0; font-size:30px; font-weight:700; letter-spacing:-.022em; color:#18181B")}>{"Let's find your next customer"}</h1>
      <p style={S('margin:10px 0 0; font-size:15.5px; color:#71717A')}>{"Tell us what you're looking for and we'll research it for you."}</p>

      <div style={S('margin-top:22px; border:1px solid #D4D4D8; border-radius:4px; background:#FFFFFF')}>
        <textarea
          onChange={onDraft}
          value={draft}
          placeholder="Find CMOs at e-commerce brands in India with 100–1000 employees…"
          style={S('width:100%; height:104px; resize:none; border:none; outline:none; background:transparent; padding:16px 17px 8px; font-family:inherit; font-size:15px; color:#18181B; line-height:1.6')}
        ></textarea>
        <div style={S('display:flex; align-items:center; gap:8px; padding:10px 12px; border-top:1px solid #EFEFF0')}>
          <div onClick={toggleAgent} className="hv2-bg" style={S('position:relative; display:flex; align-items:center; gap:7px; height:32px; padding:0 10px; border:1px solid #E4E4E7; border-radius:3px; cursor:pointer; background:#FFFFFF')}>
            <span style={S('width:18px; height:18px; border-radius:2px; background:#EDE9FE; color:#5B21B6; display:flex; align-items:center; justify-content:center; font-size:9.5px; font-weight:700')}>OA</span>
            <span style={S('font-size:13px; font-weight:600; color:#3F3F46')}>{agent}</span>
            <svg width="11" height="11" viewBox="0 0 20 20" fill="none" stroke="#A1A1AA" strokeWidth="2.4"><path d="M5 8l5 5 5-5"></path></svg>
            {agentOpen ? (
              <span style={S('position:absolute; bottom:38px; left:0; width:250px; background:#FFFFFF; border:1px solid #D4D4D8; border-radius:3px; box-shadow:0 12px 28px rgba(24,24,27,.14); padding:4px; z-index:30; display:flex; flex-direction:column; animation:pop .12s ease-out')}>
                {(agents ?? []).map((a: any, __i: number) => (
                  <Fragment key={__i}>
                    <span onClick={a.pick} className="hv2-bg-f4" style={S('padding:8px 9px; border-radius:2px; cursor:pointer')}>
                      <span style={S('display:block; font-size:13px; font-weight:600; color:#18181B')}>{a.name}</span>
                      <span style={S('display:block; font-size:12px; color:#71717A; margin-top:2px')}>{a.desc}</span>
                    </span>
                  </Fragment>
                ))}
              </span>
            ) : null}
          </div>

          <div onClick={toggleTools} className="hv2-bg" style={S('position:relative; display:flex; align-items:center; gap:7px; height:32px; padding:0 10px; border:1px solid #E4E4E7; border-radius:3px; cursor:pointer; background:#FFFFFF')}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="#52525B" strokeWidth="1.7"><path d="M12.4 3.6a3.4 3.4 0 00-4 4.4L4 12.4V16h3.6l4.4-4.4a3.4 3.4 0 004.4-4l-2.2 2.2-2.2-.6-.6-2.2z"></path></svg>
            <span style={S('font-size:13px; color:#3F3F46; font-weight:500')}>Tools</span>
            {toolsOpen ? (
              <span style={S('position:absolute; bottom:38px; left:0; width:262px; background:#FFFFFF; border:1px solid #D4D4D8; border-radius:3px; box-shadow:0 12px 28px rgba(24,24,27,.14); padding:4px; z-index:30; display:flex; flex-direction:column; animation:pop .12s ease-out')}>
                {(tools ?? []).map((t: any, __i: number) => (
                  <Fragment key={__i}>
                    <span onClick={t.pick} className="hv2-bg-f4" style={S('display:flex; align-items:center; justify-content:space-between; gap:10px; padding:8px 9px; border-radius:2px; font-size:13px; color:#3F3F46; cursor:pointer')}>
                      {t.label}
                      <span style={S('font-size:12px; color:#71717A; white-space:nowrap; font-variant-numeric:tabular-nums')}>{t.cost}</span>
                    </span>
                  </Fragment>
                ))}
              </span>
            ) : null}
          </div>

          <button onClick={openColumnPanel} className="hv2-bg" style={S('display:flex; align-items:center; gap:7px; height:32px; padding:0 10px; border:1px solid #E4E4E7; border-radius:3px; cursor:pointer; background:#FFFFFF; font-family:inherit; font-size:13px; color:#3F3F46; font-weight:500')}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="#6D28D9" strokeWidth="1.9"><path d="M11 2.5L4.5 11.5H9l-.6 6 6.6-9H10.4z"></path></svg>
            Build an enrichment
          </button>
          <button onClick={attach} title="Attach a file" className="hv2-bg" style={S('width:32px; height:32px; display:flex; align-items:center; justify-content:center; border:1px solid #E4E4E7; border-radius:3px; background:#FFFFFF; cursor:pointer')}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#52525B" strokeWidth="1.7"><path d="M13.5 9l-4.6 4.6a2.6 2.6 0 01-3.7-3.7l5.4-5.4a3.4 3.4 0 014.8 4.8L9.6 15"></path></svg>
          </button>
          <span style={S('margin-left:auto; font-size:12.5px; color:#71717A; font-variant-numeric:tabular-nums')}>{estimateLabel}</span>
          <button onClick={send} className="hv2-purple" style={S('height:32px; padding:0 14px; display:flex; align-items:center; gap:7px; border:1px solid #6D28D9; background:#6D28D9; border-radius:3px; cursor:pointer; color:#FFFFFF; font-family:inherit; font-size:13px; font-weight:600')}>
            Start research
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="#FFFFFF" strokeWidth="2"><path d="M4 10h11M11 6l4 4-4 4"></path></svg>
          </button>
        </div>
      </div>

      <div style={S('margin-top:12px; display:flex; align-items:center; flex-wrap:wrap; gap:7px')}>
        {(chips ?? []).map((c: any, __i: number) => (
          <Fragment key={__i}>
            <span onClick={c.pick} className="hv2-border-chip" style={S('display:flex; align-items:center; gap:7px; height:31px; padding:0 11px; border:1px solid #E4E4E7; border-radius:3px; background:#FFFFFF; font-size:12.5px; font-weight:550; color:#3F3F46; cursor:pointer; white-space:nowrap')}>
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke={c.color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={S('flex:none')}><path d={c.path}></path></svg>
              {c.label}
              {c.isNew ? (
                <span style={S('padding:1px 5px; border-radius:2px; background:#F5F1FD; color:#5B21B6; font-size:10px; font-weight:700; letter-spacing:.03em')}>NEW</span>
              ) : null}
            </span>
          </Fragment>
        ))}
      </div>

      {hasThread ? (
        <div style={S('margin-top:20px; border:1px solid #E4E4E7; border-radius:3px; background:#FFFFFF')}>
          <div style={S('display:flex; align-items:center; gap:10px; padding:10px 15px; border-bottom:1px solid #EFEFF0; background:#FAFAFA')}>
            <span style={S('width:6px; height:6px; border-radius:50%; background:#6D28D9')}></span>
            <span style={S('font-size:12.5px; font-weight:600; color:#3F3F46')}>Research session</span>
            <span style={S('font-size:12px; color:#A1A1AA; font-variant-numeric:tabular-nums')}>{threadMeta}</span>
            <span onClick={clearThread} className="hv2-ink" style={S('margin-left:auto; font-size:12px; color:#71717A; cursor:pointer')}>Clear session</span>
          </div>

          {(thread ?? []).map((mt: any, __i: number) => (
            <Fragment key={__i}>
              <div style={S(mt.rowStyle)}>
                <span style={S(mt.avatarStyle)}>{mt.avatar}</span>
                <span style={S('flex:1; min-width:0')}>
                  <span style={S('display:block; font-size:10.5px; font-weight:700; color:#A1A1AA; letter-spacing:.06em; text-transform:uppercase')}>{mt.who}</span>
                  <span style={S('display:block; margin-top:6px; font-size:14px; color:#18181B; line-height:1.6; text-wrap:pretty')}>{mt.text}</span>

                  {mt.hasFilters ? (
                    <span style={S('display:flex; align-items:center; flex-wrap:wrap; gap:6px; margin-top:11px')}>
                      <span style={S('font-size:11.5px; color:#A1A1AA; margin-right:2px')}>Filters applied</span>
                      {(mt.filters ?? []).map((f: any, __j: number) => (
                        <Fragment key={__j}>
                          <span style={S('padding:3px 8px; border:1px solid #E4E4E7; border-radius:2px; background:#FAFAFA; font-size:11.5px; color:#3F3F46; white-space:nowrap')}>{f}</span>
                        </Fragment>
                      ))}
                    </span>
                  ) : null}

                  {mt.hasStats ? (
                    <span style={S('display:flex; flex-wrap:wrap; margin-top:12px; border:1px solid #E4E4E7; border-radius:3px')}>
                      {(mt.stats ?? []).map((st: any, __j: number) => (
                        <Fragment key={__j}>
                          <span style={S('flex:1; min-width:150px; padding:11px 14px; border-right:1px solid #EFEFF0')}>
                            <span style={S('display:block; font-size:11.5px; color:#71717A')}>{st.label}</span>
                            <span style={S(`display:block; margin-top:4px; font-size:17px; font-weight:700; color:${st.color}; font-variant-numeric:tabular-nums; letter-spacing:-.01em`)}>{st.value}</span>
                          </span>
                        </Fragment>
                      ))}
                    </span>
                  ) : null}

                  {mt.hasCols ? (
                    <span style={S('display:flex; align-items:center; flex-wrap:wrap; gap:6px; margin-top:12px')}>
                      <span style={S('font-size:11.5px; color:#A1A1AA; margin-right:2px')}>Columns it will build</span>
                      {(mt.cols ?? []).map((cc: any, __j: number) => (
                        <Fragment key={__j}>
                          <span style={S('padding:3px 8px; border:1px solid #E9E4F8; border-radius:2px; background:#FBFAFF; font-size:11.5px; color:#5B21B6; white-space:nowrap')}>{cc}</span>
                        </Fragment>
                      ))}
                    </span>
                  ) : null}

                  {mt.hasPlan ? (
                    <span style={S('display:block; margin-top:14px; padding-top:13px; border-top:1px solid #EFEFF0')}>
                      <span style={S('display:flex; align-items:center; flex-wrap:wrap; gap:7px')}>
                        {(mt.actions ?? []).map((a: any, __j: number) => (
                          <Fragment key={__j}>
                            <span onClick={a.pick} className="hv2-border-violet" style={S('height:30px; padding:0 11px; display:flex; align-items:center; border:1px solid #D4D4D8; border-radius:3px; background:#FFFFFF; font-size:12.5px; font-weight:600; color:#3F3F46; cursor:pointer; white-space:nowrap')}>{a.label}</span>
                          </Fragment>
                        ))}
                        <span onClick={mt.start} className="hv2-purple" style={S('margin-left:auto; height:32px; padding:0 14px; display:flex; align-items:center; gap:7px; border:1px solid #6D28D9; background:#6D28D9; border-radius:3px; font-size:13px; font-weight:600; color:#FFFFFF; cursor:pointer; white-space:nowrap')}>Start research →</span>
                      </span>
                      <span style={S('display:block; margin-top:9px; font-size:12px; color:#A1A1AA; font-variant-numeric:tabular-nums')}>{mt.costNote}</span>
                    </span>
                  ) : null}
                </span>
              </div>
            </Fragment>
          ))}

          {thinking ? (
            <div style={S('display:flex; gap:12px; padding:15px; border-top:1px solid #EFEFF0; align-items:center')}>
              <span style={S('flex:none; width:26px; height:26px; border-radius:2px; background:#EDE9FE; color:#5B21B6; display:flex; align-items:center; justify-content:center; font-size:9.5px; font-weight:700')}>OA</span>
              <span style={S('display:flex; align-items:center; gap:7px')}>
                <span style={S('width:6px; height:6px; border-radius:50%; background:#6D28D9; animation:pulse 1.1s ease-in-out infinite')}></span>
                <span style={S('font-size:13px; color:#71717A')}>Interpreting your request…</span>
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      <div style={S('margin-top:22px; display:flex; align-items:center; flex-wrap:wrap; gap:8px')}>
        <span style={S('font-size:12.5px; color:#A1A1AA; margin-right:2px')}>Connect your stack</span>
        {(connectors ?? []).map((c: any, __i: number) => (
          <Fragment key={__i}>
            <div onClick={c.act} className="hv2-bg" style={S(`display:flex; align-items:center; gap:8px; height:34px; padding:0 11px; border:1px solid ${c.border}; border-radius:3px; cursor:pointer; background:#FFFFFF`)}>
              <span style={S(`flex:none; width:18px; height:18px; border-radius:2px; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:700; color:#FFFFFF; background:${c.bg}`)}>{c.mark}</span>
              <span style={S('font-size:13px; font-weight:600; color:#18181B; white-space:nowrap')}>{c.label}</span>
              <span style={S(`font-size:12px; color:${c.stateColor}; white-space:nowrap`)}>{c.state}</span>
            </div>
          </Fragment>
        ))}
      </div>

      <div style={S('margin-top:32px; border:1px solid #E4E4E7; border-radius:3px; display:flex; align-items:stretch; flex-wrap:wrap')}>
        <div style={S('padding:13px 16px; display:flex; align-items:center; border-right:1px solid #EFEFF0; background:#FAFAFA')}>
          <span style={S('font-size:12.5px; font-weight:600; color:#52525B; white-space:nowrap')}>Past 7 days</span>
        </div>
        {(past7 ?? []).map((mt: any, __i: number) => (
          <Fragment key={__i}>
            <div style={S('flex:1; min-width:124px; padding:12px 16px; border-right:1px solid #EFEFF0')}>
              <div style={S('font-size:16px; font-weight:700; color:#18181B; font-variant-numeric:tabular-nums; letter-spacing:-.01em')}>{mt.value}</div>
              <div style={S('font-size:12px; color:#71717A; margin-top:3px; white-space:nowrap')}>{mt.label}</div>
            </div>
          </Fragment>
        ))}
        <div style={S('padding:12px 16px; display:flex; flex-direction:column; justify-content:center; gap:4px; background:#FAFAFA')}>
          <span style={S('font-size:12px; color:#71717A; font-variant-numeric:tabular-nums; white-space:nowrap')}>Credits used <strong style={S('color:#18181B; font-weight:600')}>{past7Credits}</strong></span>
          <span style={S('font-size:12px; color:#71717A; font-variant-numeric:tabular-nums; white-space:nowrap')}>Research runs <strong style={S('color:#18181B; font-weight:600')}>{past7Runs}</strong></span>
        </div>
      </div>

      <div style={S('margin-top:40px; display:flex; align-items:flex-start; justify-content:space-between; gap:20px')}>
        <div>
          <h2 style={S('margin:0; font-size:17px; font-weight:650; letter-spacing:-.01em')}>Website visitors</h2>
          <p style={S('margin:5px 0 0; font-size:13px; color:#71717A')}>See companies visiting your website and identify the people behind the activity.</p>
        </div>
        <div style={S('flex:none; display:flex; align-items:center; gap:2px; border:1px solid #E4E4E7; border-radius:3px; padding:2px; background:#FAFAFA')}>
          {(visitorWindows ?? []).map((w: any, __i: number) => (
            <Fragment key={__i}>
              <span onClick={w.pick} style={S(w.style)}>{w.label}</span>
            </Fragment>
          ))}
        </div>
      </div>
      <div style={S('margin-top:12px; border:1px solid #E4E4E7; border-radius:3px; overflow:hidden')}>
        <div style={S('display:grid; grid-template-columns:1.3fr 2fr .6fr .8fr .8fr .6fr 1.5fr; background:#FAFAFA; border-bottom:1px solid #E4E4E7')}>
          {(visitorCols ?? []).map((c: any, __i: number) => (
            <Fragment key={__i}>
              <span style={S('padding:8px 12px; font-size:11.5px; font-weight:600; color:#71717A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis')}>{c}</span>
            </Fragment>
          ))}
        </div>
        {(visitors ?? []).map((v: any, __i: number) => (
          <Fragment key={__i}>
            <div className="hv2-bg" style={S(v.rowStyle)}>
              <span style={S('padding:11px 12px; min-width:0')}>
                <span style={S('display:block; font-size:13px; font-weight:600; color:#18181B; overflow:hidden; text-overflow:ellipsis; white-space:nowrap')}>{v.name}</span>
                <span style={S('display:block; font-size:12px; color:#A1A1AA; margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap')}>{v.domain}</span>
              </span>
              <span style={S('padding:11px 12px; font-size:12.5px; color:#3F3F46; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; align-self:center')}>{v.pages}</span>
              <span style={S('padding:11px 12px; font-size:12.5px; color:#3F3F46; font-variant-numeric:tabular-nums; align-self:center')}>{v.visits}</span>
              <span style={S('padding:11px 12px; font-size:12.5px; color:#71717A; white-space:nowrap; align-self:center')}>{v.last}</span>
              <span style={S('padding:11px 12px; align-self:center')}><span style={S(v.intentStyle)}>{v.intent}</span></span>
              <span style={S(`padding:11px 12px; font-size:12.5px; color:${v.icpColor}; font-weight:600; align-self:center`)}>{v.icp}</span>
              <span style={S('padding:9px 12px; display:flex; align-items:center; justify-content:flex-end; gap:6px')}>
                <span onClick={v.enrich} className="hv2-border-violet" style={S('height:27px; padding:0 9px; display:flex; align-items:center; border:1px solid #D4D4D8; border-radius:3px; background:#FFFFFF; font-size:12px; font-weight:600; color:#3F3F46; cursor:pointer; white-space:nowrap')}>Enrich</span>
                <span onClick={v.findDM} className="hv2-border-violet" style={S('height:27px; padding:0 9px; display:flex; align-items:center; border:1px solid #D4D4D8; border-radius:3px; background:#FFFFFF; font-size:12px; font-weight:600; color:#3F3F46; cursor:pointer; white-space:nowrap')}>Find decision makers</span>
              </span>
            </div>
          </Fragment>
        ))}
        <div style={S('display:flex; align-items:center; gap:12px; padding:10px 12px; background:#FAFAFA')}>
          <span style={S('font-size:12px; color:#71717A; font-variant-numeric:tabular-nums')}>{visitorSummary}</span>
          <span onClick={viewVisitors} className="hv2-border-violet" style={S('margin-left:auto; height:28px; padding:0 11px; display:flex; align-items:center; border:1px solid #D4D4D8; border-radius:3px; background:#FFFFFF; font-size:12.5px; font-weight:600; color:#3F3F46; cursor:pointer')}>View visitors →</span>
        </div>
      </div>

      <div style={S('margin-top:40px; display:flex; align-items:flex-start; justify-content:space-between; gap:20px')}>
        <div>
          <h2 style={S('margin:0; font-size:17px; font-weight:650; letter-spacing:-.01em')}>Social signals</h2>
          <p style={S('margin:5px 0 0; font-size:13px; color:#71717A')}>Post engagement, hiring announcements, launches, job changes, and competitor activity.</p>
        </div>
      </div>
      <div style={S('margin-top:12px; border:1px solid #E4E4E7; border-radius:3px; overflow:hidden')}>
        <div style={S('display:grid; grid-template-columns:1.2fr 1fr 1.1fr 2.2fr .7fr .7fr 1.1fr; background:#FAFAFA; border-bottom:1px solid #E4E4E7')}>
          {(signalCols ?? []).map((c: any, __i: number) => (
            <Fragment key={__i}>
              <span style={S('padding:8px 12px; font-size:11.5px; font-weight:600; color:#71717A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis')}>{c}</span>
            </Fragment>
          ))}
        </div>
        {(socialSignals ?? []).map((g: any, __i: number) => (
          <Fragment key={__i}>
            <div className="hv2-bg" style={S(g.rowStyle)}>
              <span style={S('padding:11px 12px; display:flex; align-items:center; gap:8px; min-width:0')}>
                <span style={S(`flex:none; width:22px; height:22px; border-radius:2px; background:${g.avBg}; color:${g.avFg}; display:flex; align-items:center; justify-content:center; font-size:9.5px; font-weight:700`)}>{g.initials}</span>
                <span style={S('font-size:13px; font-weight:600; color:#18181B; overflow:hidden; text-overflow:ellipsis; white-space:nowrap')}>{g.person}</span>
              </span>
              <span style={S('padding:11px 12px; font-size:12.5px; color:#3F3F46; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; align-self:center')}>{g.company}</span>
              <span style={S('padding:11px 12px; font-size:12.5px; color:#71717A; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; align-self:center')}>{g.title}</span>
              <span style={S('padding:11px 12px; font-size:12.5px; color:#3F3F46; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; align-self:center')}>{g.signal}</span>
              <span style={S('padding:11px 12px; font-size:12.5px; color:#71717A; white-space:nowrap; align-self:center')}>{g.date}</span>
              <span style={S('padding:11px 12px; align-self:center')}><span style={S(g.intentStyle)}>{g.intent}</span></span>
              <span style={S('padding:9px 12px; display:flex; align-items:center; justify-content:flex-end')}>
                <span onClick={g.research} className="hv2-border-violet" style={S('height:27px; padding:0 10px; display:flex; align-items:center; border:1px solid #D4D4D8; border-radius:3px; background:#FFFFFF; font-size:12px; font-weight:600; color:#3F3F46; cursor:pointer; white-space:nowrap')}>Research signal →</span>
              </span>
            </div>
          </Fragment>
        ))}
      </div>

      <div style={S('margin-top:40px')}>
        <h2 style={S('margin:0; font-size:17px; font-weight:650; letter-spacing:-.01em')}>Suggested next actions</h2>
        <p style={S('margin:5px 0 0; font-size:13px; color:#71717A')}>Actions based on your current GTM activity.</p>
      </div>
      <div style={S('margin-top:12px; display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:12px')}>
        {(nextActions ?? []).map((n: any, __i: number) => (
          <Fragment key={__i}>
            <div className="hv2-border-chip" style={S('border:1px solid #E4E4E7; border-radius:3px; background:#FFFFFF; padding:15px; display:flex; flex-direction:column; box-shadow:0 1px 2px rgba(24,24,27,.04)')}>
              <div style={S('display:flex; align-items:center; gap:8px')}>
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="#6D28D9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={S('flex:none')}><path d={n.path}></path></svg>
                <span style={S('font-size:11px; font-weight:600; color:#71717A; letter-spacing:.05em; text-transform:uppercase')}>{n.tag}</span>
              </div>
              <div style={S('margin-top:9px; font-size:14px; font-weight:650; color:#18181B; letter-spacing:-.008em; text-wrap:pretty')}>{n.title}</div>
              <div style={S('margin-top:6px; font-size:12.5px; color:#71717A; line-height:1.55; text-wrap:pretty')}>{n.body}</div>
              <div style={S('margin-top:13px; padding-top:12px; border-top:1px solid #EFEFF0; display:flex; align-items:center; justify-content:space-between; gap:8px')}>
                <span style={S('font-size:12px; color:#A1A1AA; font-variant-numeric:tabular-nums; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap')}>{n.meta}</span>
                <span onClick={n.act} className="hv2-border-violet" style={S('flex:none; height:28px; padding:0 11px; display:flex; align-items:center; border:1px solid #D4D4D8; border-radius:3px; background:#FFFFFF; font-size:12.5px; font-weight:600; color:#3F3F46; cursor:pointer; white-space:nowrap')}>{n.cta}</span>
              </div>
            </div>
          </Fragment>
        ))}
      </div>

      <div style={S('margin-top:40px; display:flex; align-items:baseline; justify-content:space-between')}>
        <div>
          <h2 style={S('margin:0; font-size:17px; font-weight:650; letter-spacing:-.01em')}>Start with a workflow</h2>
          <p style={S('margin:5px 0 0; font-size:13px; color:#71717A')}>Pre-built research runs. Credit cost is shown before anything executes.</p>
        </div>
        <span onClick={allTemplates} style={S('font-size:13px; color:#6D28D9; font-weight:600; cursor:pointer; white-space:nowrap')}>View all workflows →</span>
      </div>
      <div style={S('margin-top:12px; border:1px solid #E4E4E7; border-radius:3px; display:grid; grid-template-columns:1fr 1fr')}>
        {(workflows ?? []).map((t: any, __i: number) => (
          <Fragment key={__i}>
            <div className="hv2-bg" style={S(t.rowStyle)}>
              <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="#6D28D9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={S('flex:none')}><path d={t.path}></path></svg>
              <span style={S('flex:1; min-width:0')}>
                <span style={S('display:block; font-size:13.5px; font-weight:600; color:#18181B; overflow:hidden; text-overflow:ellipsis; white-space:nowrap')}>{t.name}</span>
                <span style={S('display:block; font-size:12.5px; color:#71717A; margin-top:3px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap')}>{t.desc}</span>
              </span>
              <span style={S('flex:none; font-size:12.5px; color:#52525B; white-space:nowrap; font-variant-numeric:tabular-nums')}>{t.cost}</span>
              <span onClick={t.run} className="hv2-border-violet" style={S('flex:none; height:28px; padding:0 12px; border:1px solid #D4D4D8; border-radius:3px; display:flex; align-items:center; font-size:12.5px; font-weight:600; color:#3F3F46; background:#FFFFFF; cursor:pointer')}>Run</span>
            </div>
          </Fragment>
        ))}
      </div>

      <div style={S('margin-top:44px; display:flex; align-items:flex-start; justify-content:space-between; gap:20px')}>
        <div>
          <h2 style={S('margin:0; font-size:17px; font-weight:650; letter-spacing:-.01em')}>Explore GTM workflows</h2>
          <p style={S('margin:5px 0 0; font-size:13px; color:#71717A')}>Pre-built research workflows for prospecting, enrichment, signals, and GTM intelligence.</p>
        </div>
        <span onClick={allTemplates} style={S('font-size:13px; color:#6D28D9; font-weight:600; cursor:pointer; white-space:nowrap; padding-top:2px')}>View all workflows →</span>
      </div>

      <div style={S('margin-top:12px; display:flex; align-items:center; justify-content:space-between; gap:16px; border-bottom:1px solid #E4E4E7')}>
        <div style={S('display:flex; align-items:center; gap:2px')}>
          {(gtmCats ?? []).map((c: any, __i: number) => (
            <Fragment key={__i}>
              <span onClick={c.pick} style={S(c.style)}>{c.label}</span>
            </Fragment>
          ))}
        </div>
        <div style={S('display:flex; align-items:center; gap:6px; padding-bottom:8px')}>
          <span onClick={railPrev} title="Scroll left" className="hv2-border-only" style={S('width:28px; height:28px; border:1px solid #E4E4E7; border-radius:3px; display:flex; align-items:center; justify-content:center; cursor:pointer; background:#FFFFFF')}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="#52525B" strokeWidth="1.9"><path d="M12 5l-5 5 5 5"></path></svg>
          </span>
          <span onClick={railNext} title="Scroll right" className="hv2-border-only" style={S('width:28px; height:28px; border:1px solid #E4E4E7; border-radius:3px; display:flex; align-items:center; justify-content:center; cursor:pointer; background:#FFFFFF')}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="#52525B" strokeWidth="1.9"><path d="M8 5l5 5-5 5"></path></svg>
          </span>
        </div>
      </div>

      <div id="gtmRail" style={S('margin-top:14px; display:flex; gap:12px; overflow-x:auto; padding-bottom:8px; scroll-behavior:smooth')}>
        {(gtmTemplates ?? []).map((t: any, __i: number) => (
          <Fragment key={__i}>
            <div className="hv2-border-chip" style={S('flex:none; width:328px; border:1px solid #E4E4E7; border-radius:3px; background:#FFFFFF; display:flex; flex-direction:column; box-shadow:0 1px 2px rgba(24,24,27,.04)')}>
              <div style={S('border-bottom:1px solid #EFEFF0; background:#FCFCFC')}>
                <div style={S(`display:grid; grid-template-columns:${t.previewGrid}; background:#F6F6F7; border-bottom:1px solid #E4E4E7`)}>
                  {(t.cols ?? []).map((c: any, __j: number) => (
                    <Fragment key={__j}>
                      <span style={S('padding:6px 8px; font-size:10.5px; font-weight:600; color:#52525B; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; border-right:1px solid #E9E9EC')}>{c}</span>
                    </Fragment>
                  ))}
                </div>
                {(t.rows ?? []).map((row: any, __j: number) => (
                  <Fragment key={__j}>
                    <div style={S(`display:grid; grid-template-columns:${t.previewGrid}; border-bottom:1px solid #F1F1F2; background:#FFFFFF`)}>
                      {(row.cells ?? []).map((v: any, __k: number) => (
                        <Fragment key={__k}>
                          <span style={S('padding:6px 8px; font-size:11px; color:#3F3F46; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; border-right:1px solid #F4F4F5; font-variant-numeric:tabular-nums')}>{v}</span>
                        </Fragment>
                      ))}
                    </div>
                  </Fragment>
                ))}
              </div>
              <div style={S('padding:13px 14px; flex:1; display:flex; flex-direction:column')}>
                <div style={S('display:flex; align-items:center; gap:7px')}>
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="#6D28D9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={S('flex:none')}><path d={t.path}></path></svg>
                  <span style={S('font-size:11.5px; font-weight:600; color:#71717A; letter-spacing:.04em; text-transform:uppercase')}>{t.cat}</span>
                </div>
                <div style={S('margin-top:8px; font-size:14.5px; font-weight:650; color:#18181B; letter-spacing:-.01em')}>{t.name}</div>
                <div style={S('margin-top:6px; font-size:12.5px; color:#71717A; line-height:1.55; text-wrap:pretty')}>{t.desc}</div>
                <div style={S('margin-top:12px; padding-top:11px; border-top:1px solid #EFEFF0; min-width:0; display:flex; align-items:center; justify-content:space-between; gap:8px')}>
                  <span style={S('min-width:0; font-size:12.5px; color:#52525B; font-variant-numeric:tabular-nums; overflow:hidden; text-overflow:ellipsis; white-space:nowrap')}>{t.cost}</span>
                  <span style={S('flex:none; font-size:12px; color:#A1A1AA')}>Up to 50 rows</span>
                </div>
                <div style={S('margin-top:10px; min-width:0; display:flex; align-items:center; gap:8px')}>
                  <span onClick={t.preview} className="hv2-bg-f4" style={S('flex:1; min-width:0; height:32px; border:1px solid #D4D4D8; border-radius:3px; display:flex; align-items:center; justify-content:center; font-size:12.5px; font-weight:600; color:#3F3F46; cursor:pointer; background:#FFFFFF')}>Preview</span>
                  <span onClick={t.use} className="hv2-purple" style={S('flex:1; min-width:0; height:32px; border:1px solid #6D28D9; background:#6D28D9; border-radius:3px; display:flex; align-items:center; justify-content:center; font-size:12.5px; font-weight:600; color:#FFFFFF; cursor:pointer')}>Use workflow →</span>
                </div>
              </div>
            </div>
          </Fragment>
        ))}
      </div>

      <div style={S('margin-top:40px; display:flex; align-items:baseline; justify-content:space-between')}>
        <h2 style={S('margin:0; font-size:17px; font-weight:650; letter-spacing:-.01em')}>Continue working</h2>
        <span onClick={goProjects} style={S('font-size:13px; color:#6D28D9; font-weight:600; cursor:pointer')}>All projects →</span>
      </div>
      <div style={S('margin-top:12px; border:1px solid #E4E4E7; border-radius:3px')}>
        {(research ?? []).map((r: any, __i: number) => (
          <Fragment key={__i}>
            <div onClick={r.open} className="hv2-bg" style={S(r.rowStyle)}>
              <span style={S('flex:1; min-width:0')}>
                <span style={S('display:flex; align-items:center; gap:9px')}>
                  <span style={S('font-size:14px; font-weight:600; color:#18181B; overflow:hidden; text-overflow:ellipsis; white-space:nowrap')}>{r.name}</span>
                  <span style={S(r.statusStyle)}>{r.status}</span>
                  <span style={S('font-size:12px; color:#A1A1AA; white-space:nowrap')}>{r.type}</span>
                </span>
                <span style={S('display:block; font-size:13px; color:#52525B; margin-top:5px; font-variant-numeric:tabular-nums')}>{r.stats}</span>
                <span style={S('display:block; font-size:12.5px; color:#A1A1AA; margin-top:3px; font-variant-numeric:tabular-nums')}>{r.spend}</span>
              </span>
              <span style={S('flex:none; font-size:12.5px; color:#71717A; white-space:nowrap')}>{r.updated}</span>
              <span style={S(`flex:none; width:24px; height:24px; border-radius:2px; background:${r.ownerBg}; color:${r.ownerFg}; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700`)}>{r.owner}</span>
              <span onClick={r.open} className="hv2-border-violet" style={S('flex:none; height:29px; padding:0 12px; border:1px solid #D4D4D8; border-radius:3px; display:flex; align-items:center; font-size:12.5px; font-weight:600; color:#3F3F46; background:#FFFFFF')}>Open research →</span>
              <span onClick={r.menu} title="More actions" className="hv2-more" style={S('flex:none; width:26px; height:26px; display:flex; align-items:center; justify-content:center; border-radius:2px; color:#A1A1AA; font-size:13px')}>•••</span>
              {r.menuOpen ? (
                <span style={S('position:absolute; top:46px; right:14px; width:206px; background:#FFFFFF; border:1px solid #D4D4D8; border-radius:3px; box-shadow:0 14px 34px rgba(24,24,27,.14); padding:4px; z-index:30; display:flex; flex-direction:column; animation:pop .12s ease-out')}>
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
      </div>
    </div>
  )
}
