import { Fragment } from 'react'
import { cssToObj } from '../../../../lib/css'
import type { WorkspaceValues } from '../../types'

export function ChatPane({ m }: { m: WorkspaceValues }) {
  const { addAttachment, agentOpen, agentShort, agents, answerStats, buildList, cancelVoice, clearAttachment, composerRadius, copy, copyLabel, creditsLabel, creditsWarn, dislike, dislikeColor, draft, enrich, enrichMenuOpen, enrichments, followUps, hasAttachment, like, likeColor, micColor, onInput, openCredits, questions, reasons, regenLabel, regenerate, send, sendBg, share, startVoice, toggleAgent, toggleEnrichMenu, toggleTools, tools, toolsOpen, typingMode, useVoice, voiceMode, waveBars } = m
  return (
    <>
                    {'\n        '}
                    <div className="flex-1 [min-height:0] flex flex-col">
                      {'\n          '}
                      <div className="flex-1 [min-height:0] overflow-y-auto pt-[12px] px-[12px] pb-[6px] flex flex-col gap-[13px]">
                        {'\n\n            '}
                        <div className="flex justify-end">
                          {'\n              '}
                          <div className="[max-width:88%] bg-[#F4F4F6] [border:1px_solid_#EAEAEE] rounded-[10px_10px_3px_10px] py-[9px] px-[11px] text-[12.5px] leading-[1.5] text-[#27272A]">
                            {
                              "Find B2B SaaS companies with 50–500 employees that currently use HubSpot or Salesforce but don't have a unified GTM platform."
                            }
                          </div>
                          {'\n            '}
                        </div>
                        {'\n\n            '}
                        <div className="flex flex-col gap-[9px]">
                          {'\n              '}
                          <div className="text-[12.5px] leading-[1.55] text-[#27272A]">
                            {'Before I build the list — six quick calls:'}
                          </div>
                          {'\n              '}
                          <div className="[border:1px_solid_#E8E8EC] rounded-[9px] overflow-hidden">
                            {'\n                '}
                            {(questions ?? []).map((q: any, __i: number) => (
                              <Fragment key={__i}>
                                {'\n                  '}
                                <div className="py-[9px] px-[10px] [border-bottom:1px_solid_#F3F3F5]">
                                  {'\n                    '}
                                  <div className="flex items-center gap-[7px] mb-[6px]">
                                    {'\n                      '}
                                    <span className="text-[10px] font-[650] text-[#B4B4BB] tabular-nums">
                                      <span>{q.n}</span>
                                    </span>
                                    {'\n                      '}
                                    <span className="text-[11px] font-[600] text-[#52525B]">
                                      <span>{q.label}</span>
                                    </span>
                                    {'\n                    '}
                                  </div>
                                  {'\n                    '}
                                  <div className="flex flex-wrap gap-[5px]">
                                    {'\n                      '}
                                    {(q.chips ?? []).map((c: any, __i: number) => (
                                      <Fragment key={__i}>
                                        {'\n                        '}
                                        <span onClick={c.toggle} style={cssToObj(c.style)}>
                                          <span>{c.v}</span>
                                        </span>
                                        {'\n                      '}
                                      </Fragment>
                                    ))}
                                    {'\n                    '}
                                  </div>
                                  {'\n                  '}
                                </div>
                                {'\n                '}
                              </Fragment>
                            ))}
                            {'\n                '}
                            <div className="flex items-center justify-between py-[9px] px-[10px] bg-[#FAFAFB]">
                              {'\n                  '}
                              <span className="text-[10.5px] text-[#8E8E96]">{'Est. 420 credits'}</span>
                              {'\n                  '}
                              <button
                                onClick={buildList}
                                className="h-[26px] py-[0] px-[11px] [border:1px_solid_#6D28D9] bg-[#6D28D9] text-[#FFFFFF] rounded-[6px] text-[11.5px] font-[600] cursor-pointer hv-jdi8ic"
                              >
                                {'Build target list'}
                              </button>
                              {'\n                '}
                            </div>
                            {'\n              '}
                          </div>
                          {'\n            '}
                        </div>
                        {'\n\n            '}
                        <div className="flex flex-col gap-[10px]">
                          {'\n              '}
                          <p className="m-[0] text-[12.5px] leading-[1.6] text-[#27272A]">
                            <strong className="font-[650]">{'Found 42 qualifying accounts'}</strong>
                            {
                              ' from 1,284 tracked companies. 2,370 cells enriched across firmographics, contacts, CRM fingerprints and signals.'
                            }
                          </p>
                          {'\n              '}
                          <div className="[border:1px_solid_#E8E8EC] rounded-[9px] bg-[#FAFAFB] py-[10px] px-[11px]">
                            {'\n                '}
                            <div className="text-[10px] font-[650] text-[#A1A1AA] tracking-[.06em] uppercase mb-[7px]">
                              {'Why these accounts?'}
                            </div>
                            {'\n                '}
                            {(reasons ?? []).map((r: any, __i: number) => (
                              <Fragment key={__i}>
                                {'\n                  '}
                                <div className="flex items-start gap-[7px] text-[11.5px] text-[#52525B] leading-[1.45] mb-[4px]">
                                  {'\n                    '}
                                  <span className="w-[4px] h-[4px] rounded-full bg-[#C4B5FD] mt-[6px] flex-none"></span>
                                  {'\n                    '}
                                  <span>
                                    <span>{r}</span>
                                  </span>
                                  {'\n                  '}
                                </div>
                                {'\n                '}
                              </Fragment>
                            ))}
                            {'\n              '}
                          </div>
                          {'\n              '}
                          <div className="flex gap-[6px]">
                            {'\n                '}
                            {(answerStats ?? []).map((a: any, __i: number) => (
                              <Fragment key={__i}>
                                {'\n                  '}
                                <div className="flex-1 [border:1px_solid_#EDEDF0] rounded-[8px] py-[7px] px-[9px]">
                                  {'\n                    '}
                                  <div className="text-[14px] font-[650] tabular-nums">
                                    <span>{a.value}</span>
                                  </div>
                                  {'\n                    '}
                                  <div className="text-[10px] text-[#8E8E96] leading-[1.3]">
                                    <span>{a.label}</span>
                                  </div>
                                  {'\n                  '}
                                </div>
                                {'\n                '}
                              </Fragment>
                            ))}
                            {'\n              '}
                          </div>
                          {'\n\n              '}
                          <div className="flex items-center gap-[1px]">
                            {'\n                '}
                            <button
                              onClick={like}
                              className="w-[25px] h-[25px] flex items-center justify-center [border:none] bg-transparent rounded-[5px] cursor-pointer hv-u45kwi"
                            >
                              {'\n                  '}
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 20 20"
                                fill="none"
                                stroke={likeColor}
                                strokeWidth="1.5"
                              >
                                <path d="M6.5 17V8.4l3.4-5a1.4 1.4 0 012.5.8v3.4h3.2a1.5 1.5 0 011.5 1.8l-1.1 5.4A1.9 1.9 0 0114.1 17z"></path>
                                <path d="M6.5 8.6H3.8V17h2.7"></path>
                              </svg>
                              {'\n                '}
                            </button>
                            {'\n                '}
                            <button
                              onClick={dislike}
                              className="w-[25px] h-[25px] flex items-center justify-center [border:none] bg-transparent rounded-[5px] cursor-pointer hv-u45kwi"
                            >
                              {'\n                  '}
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 20 20"
                                fill="none"
                                stroke={dislikeColor}
                                strokeWidth="1.5"
                              >
                                <path d="M13.5 3v8.6l-3.4 5a1.4 1.4 0 01-2.5-.8v-3.4H4.4a1.5 1.5 0 01-1.5-1.8l1.1-5.4A1.9 1.9 0 015.9 3z"></path>
                                <path d="M13.5 11.4h2.7V3h-2.7"></path>
                              </svg>
                              {'\n                '}
                            </button>
                            {'\n                '}
                            <div className="w-[1px] h-[14px] bg-[#EAEAEE] my-[0] mx-[4px]"></div>
                            {'\n                '}
                            <button
                              onClick={copy}
                              className="h-[25px] py-[0] px-[7px] flex items-center gap-[4px] [border:none] bg-transparent rounded-[5px] cursor-pointer text-[11px] text-[#8E8E96] hv-jj6th"
                            >
                              <span>{copyLabel}</span>
                            </button>
                            {'\n                '}
                            <button
                              onClick={regenerate}
                              className="h-[25px] py-[0] px-[7px] flex items-center gap-[4px] [border:none] bg-transparent rounded-[5px] cursor-pointer text-[11px] text-[#8E8E96] hv-jj6th"
                            >
                              <span>{regenLabel}</span>
                            </button>
                            {'\n                '}
                            <button
                              onClick={share}
                              className="h-[25px] py-[0] px-[7px] flex items-center gap-[4px] [border:none] bg-transparent rounded-[5px] cursor-pointer text-[11px] text-[#8E8E96] hv-jj6th"
                            >
                              {'Share'}
                            </button>
                            {'\n              '}
                          </div>
                          {'\n\n              '}
                          <div className="[border-top:1px_solid_#F1F1F3] pt-[9px]">
                            {'\n                '}
                            <div className="text-[10px] font-[650] text-[#A1A1AA] tracking-[.05em] uppercase mb-[4px]">
                              {'Suggested follow-ups'}
                            </div>
                            {'\n                '}
                            {(followUps ?? []).map((f: any, __i: number) => (
                              <Fragment key={__i}>
                                {'\n                  '}
                                <div
                                  onClick={f.pick}
                                  className="flex items-center gap-[8px] py-[8px] px-[6px] [border-bottom:1px_solid_#F4F4F6] cursor-pointer rounded-[5px] hv-udcbnc"
                                >
                                  {'\n                    '}
                                  <svg
                                    width="13"
                                    height="13"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    stroke="#A78BFA"
                                    strokeWidth="1.6"
                                    className="flex-none"
                                  >
                                    <path d="M10 3l1.7 4 4 1.7-4 1.7L10 14.4l-1.7-4-4-1.7 4-1.7z"></path>
                                  </svg>
                                  {'\n                    '}
                                  <span className="flex-1 text-[11.5px] text-[#3F3F46] leading-[1.4]">
                                    <span>{f.text}</span>
                                  </span>
                                  {'\n                    '}
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    stroke="#C4C4CB"
                                    strokeWidth="1.8"
                                    className="flex-none"
                                  >
                                    <path d="M4 10h11M11 6l4 4-4 4"></path>
                                  </svg>
                                  {'\n                  '}
                                </div>
                                {'\n                '}
                              </Fragment>
                            ))}
                            {'\n              '}
                          </div>
                          {'\n            '}
                        </div>
                        {'\n          '}
                      </div>
                      {'\n\n          '}
                      <div className="flex-none pt-[0] px-[12px] pb-[12px]">
                        {'\n            '}
                        {hasAttachment ? (
                          <>
                            {'\n              '}
                            <div className="mb-[8px] flex items-center gap-[8px] [border:1px_solid_#E4E4E8] rounded-[8px] py-[8px] px-[9px] bg-[#FAFAFB]">
                              {'\n                '}
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 20 20"
                                fill="none"
                                stroke="#15803D"
                                strokeWidth="1.6"
                                className="flex-none"
                              >
                                <path d="M5 4.5h6l4 4V16a1 1 0 01-1 1H6a1 1 0 01-1-1z"></path>
                                <path d="M11 4.5v4h4"></path>
                              </svg>
                              {'\n                '}
                              <div className="[min-width:0] flex-1">
                                {'\n                  '}
                                <div className="text-[11.5px] font-[600] overflow-hidden text-ellipsis whitespace-nowrap">
                                  {'target_accounts.csv'}
                                </div>
                                {'\n                  '}
                                <div className="text-[10px] text-[#A1A1AA]">{'1,284 rows · ready'}</div>
                                {'\n                '}
                              </div>
                              {'\n                '}
                              <button
                                onClick={enrich}
                                className="h-[23px] py-[0] px-[8px] [border:1px_solid_#DDD6F3] bg-[#F5F1FD] text-[#5B21B6] rounded-[5px] text-[11px] font-[600] cursor-pointer hv-ttjng3"
                              >
                                {'Enrich'}
                              </button>
                              {'\n                '}
                              <button
                                onClick={clearAttachment}
                                className="w-[22px] h-[22px] [border:none] bg-transparent rounded-[5px] cursor-pointer text-[#A1A1AA] text-[13px] leading-[1] hv-u2196x"
                              >
                                {'×'}
                              </button>
                              {'\n              '}
                            </div>
                            {'\n            '}
                          </>
                        ) : null}
                        {'\n\n            '}
                        {creditsWarn ? (
                          <>
                            {'\n              '}
                            <div
                              style={cssToObj(
                                'display:flex; align-items:center; justify-content:space-between; border:1px solid #FED7AA; border-bottom:none; border-radius:9px 9px 0 0; background:#FFF8F1; padding:7px 10px',
                              )}
                            >
                              {'\n                '}
                              <span className="flex items-center gap-[6px] text-[11.5px] font-[600] text-[#C2410C]">
                                {'\n                  '}
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  stroke="#EA580C"
                                  strokeWidth="1.9"
                                >
                                  <path d="M11 2.5L4.5 11.5H9l-.6 6 6.6-9H10.4z"></path>
                                </svg>
                                {'\n                  '}
                                <span>{creditsLabel}</span>
                                {' remaining\n                '}
                              </span>
                              {'\n                '}
                              <button
                                onClick={openCredits}
                                className="h-[23px] py-[0] px-[9px] [border:1px_solid_#F3C99B] bg-[#FFFFFF] text-[#C2410C] rounded-[5px] text-[11px] font-[600] cursor-pointer hv-ugv1h8"
                              >
                                {'Top up'}
                              </button>
                              {'\n              '}
                            </div>
                            {'\n            '}
                          </>
                        ) : null}
                        {'\n\n            '}
                        <div
                          style={cssToObj(
                            `border:1px solid #E4E4E8; border-radius:${composerRadius}; background:#FFFFFF; box-shadow:0 1px 2px rgba(24,24,27,.05)`,
                          )}
                        >
                          {'\n              '}
                          {voiceMode ? (
                            <>
                              {'\n                '}
                              <div className="pt-[12px] px-[11px] pb-[8px] flex flex-col gap-[9px]">
                                {'\n                  '}
                                <div className="flex items-center gap-[9px]">
                                  {'\n                    '}
                                  <span className="flex items-center gap-[6px] text-[11.5px] font-[600] text-[#B91C1C] whitespace-nowrap">
                                    <span className="w-[6px] h-[6px] rounded-full bg-[#DC2626] [animation:pulse_1.2s_ease-in-out_infinite]"></span>
                                    {'Listening…'}
                                  </span>
                                  {'\n                    '}
                                  <div className="flex-1 flex items-center gap-[2px] h-[22px]">
                                    {'\n                      '}
                                    {(waveBars ?? []).map((w: any, __i: number) => (
                                      <Fragment key={__i}>
                                        {'\n                        '}
                                        <span
                                          style={cssToObj(
                                            `flex:1; height:18px; border-radius:2px; background:#DDD6F3; transform-origin:center; animation:bar ${w.dur} ease-in-out infinite; animation-delay:${w.delay}`,
                                          )}
                                        ></span>
                                        {'\n                      '}
                                      </Fragment>
                                    ))}
                                    {'\n                    '}
                                  </div>
                                  {'\n                    '}
                                  <span className="text-[11px] text-[#A1A1AA] tabular-nums">
                                    {'0:07'}
                                  </span>
                                  {'\n                  '}
                                </div>
                                {'\n                  '}
                                <div className="flex gap-[6px] justify-end">
                                  {'\n                    '}
                                  <button
                                    onClick={cancelVoice}
                                    className="h-[25px] py-[0] px-[9px] [border:1px_solid_#E4E4E8] bg-[#FFFFFF] rounded-[6px] text-[11px] text-[#52525B] cursor-pointer hv-u4v0t1"
                                  >
                                    {'Discard'}
                                  </button>
                                  {'\n                    '}
                                  <button
                                    onClick={useVoice}
                                    className="h-[25px] py-[0] px-[10px] [border:1px_solid_#6D28D9] bg-[#6D28D9] text-[#FFFFFF] rounded-[6px] text-[11px] font-[600] cursor-pointer hv-jdi8ic"
                                  >
                                    {'Use recording'}
                                  </button>
                                  {'\n                  '}
                                </div>
                                {'\n                '}
                              </div>
                              {'\n              '}
                            </>
                          ) : null}
                          {'\n\n              '}
                          {typingMode ? (
                            <>
                              {'\n                '}
                              <div className="pt-[10px] px-[11px] pb-[0]">
                                {'\n                  '}
                                <textarea
                                  onChange={onInput}
                                  value={draft}
                                  placeholder="Find leads, enrich data, analyze signals…"
                                  className="w-full [border:none] outline-none resize-none text-[12.5px] leading-[1.5] text-[#27272A] [min-height:40px] bg-transparent"
                                ></textarea>
                                {'\n                '}
                              </div>
                              {'\n              '}
                            </>
                          ) : null}
                          {'\n\n              '}
                          <div className="flex items-center justify-between pt-[6px] px-[8px] pb-[7px] relative">
                            {'\n                '}
                            <div className="flex items-center gap-[2px]">
                              {'\n                  '}
                              <div
                                onClick={toggleAgent}
                                className="flex items-center gap-[5px] h-[25px] py-[0] px-[7px] rounded-[6px] cursor-pointer text-[11.5px] text-[#52525B] font-[550] hv-u45kwi"
                              >
                                {'\n                    '}
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                >
                                  <rect x="3.5" y="6" width="13" height="10" rx="3"></rect>
                                  <path d="M10 3v3"></path>
                                  <circle cx="7.6" cy="11" r="1"></circle>
                                  <circle cx="12.4" cy="11" r="1"></circle>
                                </svg>
                                {'\n                    '}
                                <span>{agentShort}</span>
                                {'\n                    '}
                                <svg
                                  width="8"
                                  height="8"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  stroke="#A1A1AA"
                                  strokeWidth="2.4"
                                >
                                  <path d="M5 8l5 5 5-5"></path>
                                </svg>
                                {'\n                  '}
                              </div>
                              {'\n                  '}
                              <button
                                onClick={toggleTools}
                                title="Tools"
                                className="w-[25px] h-[25px] flex items-center justify-center [border:none] bg-transparent rounded-[6px] cursor-pointer hv-u45kwi"
                              >
                                {'\n                    '}
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  stroke="#52525B"
                                  strokeWidth="1.5"
                                >
                                  <path d="M13.4 3.4a4 4 0 00-5 5L3.6 13.2a1.6 1.6 0 002.2 2.2l4.8-4.8a4 4 0 005-5l-2.3 2.3-2.1-.6-.6-2.1z"></path>
                                </svg>
                                {'\n                  '}
                              </button>
                              {'\n                  '}
                              <button
                                onClick={toggleEnrichMenu}
                                title="Enrichment"
                                className="w-[25px] h-[25px] flex items-center justify-center [border:none] bg-transparent rounded-[6px] cursor-pointer hv-u45kwi"
                              >
                                {'\n                    '}
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  stroke="#52525B"
                                  strokeWidth="1.6"
                                >
                                  <path d="M10 3.4l1.6 3.8 3.8 1.6-3.8 1.6L10 14.2l-1.6-3.8L4.6 8.8l3.8-1.6z"></path>
                                </svg>
                                {'\n                  '}
                              </button>
                              {'\n                  '}
                              {agentOpen ? (
                                <>
                                  {'\n                    '}
                                  <div className="absolute bottom-[32px] left-[0] w-[230px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[10px] shadow-[0_14px_34px_rgba(24,24,27,.14)] p-[5px] z-[40] [animation:pop_.13s_ease-out]">
                                    {'\n                      '}
                                    {(agents ?? []).map((a: any, __i: number) => (
                                      <Fragment key={__i}>
                                        {'\n                        '}
                                        <div
                                          onClick={a.pick}
                                          className="hv-u4v0t1"
                                          style={cssToObj(
                                            `display:flex; align-items:flex-start; gap:8px; padding:6px 7px; border-radius:6px; cursor:pointer; background:${a.bg}`,
                                          )}
                                        >
                                          {'\n                          '}
                                          <div
                                            style={cssToObj(
                                              `width:20px; height:20px; border-radius:5px; flex:none; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:700; background:${a.chipBg}; color:${a.chipFg}`,
                                            )}
                                          >
                                            <span>{a.abbr}</span>
                                          </div>
                                          {'\n                          '}
                                          <div className="[min-width:0]">
                                            {'\n                            '}
                                            <div className="text-[11.5px] font-[600] text-[#18181B]">
                                              <span>{a.name}</span>
                                            </div>
                                            {'\n                            '}
                                            <div className="text-[10px] text-[#8E8E96] leading-[1.35]">
                                              <span>{a.desc}</span>
                                            </div>
                                            {'\n                          '}
                                          </div>
                                          {'\n                        '}
                                        </div>
                                        {'\n                      '}
                                      </Fragment>
                                    ))}
                                    {'\n                    '}
                                  </div>
                                  {'\n                  '}
                                </>
                              ) : null}
                              {'\n                  '}
                              {toolsOpen ? (
                                <>
                                  {'\n                    '}
                                  <div className="absolute bottom-[32px] left-[26px] w-[216px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[10px] shadow-[0_14px_34px_rgba(24,24,27,.14)] p-[5px] z-[40] [animation:pop_.13s_ease-out]">
                                    {'\n                      '}
                                    <div className="pt-[5px] px-[7px] pb-[3px] text-[9.5px] font-[650] text-[#A1A1AA] tracking-[.05em] uppercase">
                                      {'Research tools'}
                                    </div>
                                    {'\n                      '}
                                    {(tools ?? []).map((t: any, __i: number) => (
                                      <Fragment key={__i}>
                                        {'\n                        '}
                                        <div
                                          onClick={t.pick}
                                          className="flex items-center justify-between gap-[8px] py-[5px] px-[7px] rounded-[5px] cursor-pointer text-[11.5px] text-[#3F3F46] hv-u4v0t1"
                                        >
                                          {'\n                          '}
                                          <span>
                                            <span>{t.name}</span>
                                          </span>
                                          <span className="text-[10px] text-[#A1A1AA]">
                                            <span>{t.cost}</span>
                                          </span>
                                          {'\n                        '}
                                        </div>
                                        {'\n                      '}
                                      </Fragment>
                                    ))}
                                    {'\n                    '}
                                  </div>
                                  {'\n                  '}
                                </>
                              ) : null}
                              {'\n                  '}
                              {enrichMenuOpen ? (
                                <>
                                  {'\n                    '}
                                  <div className="absolute bottom-[32px] left-[52px] w-[222px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[10px] shadow-[0_14px_34px_rgba(24,24,27,.14)] p-[5px] z-[40] [animation:pop_.13s_ease-out]">
                                    {'\n                      '}
                                    <div className="pt-[5px] px-[7px] pb-[3px] text-[9.5px] font-[650] text-[#A1A1AA] tracking-[.05em] uppercase">
                                      {'Enrichment'}
                                    </div>
                                    {'\n                      '}
                                    {(enrichments ?? []).map((e: any, __i: number) => (
                                      <Fragment key={__i}>
                                        {'\n                        '}
                                        <div
                                          onClick={e.pick}
                                          className="flex items-center justify-between gap-[8px] py-[5px] px-[7px] rounded-[5px] cursor-pointer text-[11.5px] text-[#3F3F46] hv-u4v0t1"
                                        >
                                          {'\n                          '}
                                          <span>
                                            <span>{e.label}</span>
                                          </span>
                                          <span className="text-[10px] text-[#A1A1AA]">
                                            <span>{e.cost}</span>
                                          </span>
                                          {'\n                        '}
                                        </div>
                                        {'\n                      '}
                                      </Fragment>
                                    ))}
                                    {'\n                    '}
                                  </div>
                                  {'\n                  '}
                                </>
                              ) : null}
                              {'\n                '}
                            </div>
                            {'\n                '}
                            <div className="flex items-center gap-[2px]">
                              {'\n                  '}
                              <button
                                onClick={startVoice}
                                className="w-[26px] h-[26px] flex items-center justify-center [border:none] bg-transparent rounded-[6px] cursor-pointer hv-u45kwi"
                              >
                                {'\n                    '}
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  stroke={micColor}
                                  strokeWidth="1.5"
                                >
                                  <rect x="7.6" y="3" width="4.8" height="9" rx="2.4"></rect>
                                  <path d="M4.8 9.6a5.2 5.2 0 0010.4 0M10 14.8V17"></path>
                                </svg>
                                {'\n                  '}
                              </button>
                              {'\n                  '}
                              <button
                                onClick={addAttachment}
                                className="w-[26px] h-[26px] flex items-center justify-center [border:none] bg-transparent rounded-[6px] cursor-pointer hv-u45kwi"
                              >
                                {'\n                    '}
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  stroke="#71717A"
                                  strokeWidth="1.5"
                                >
                                  <path d="M14.5 9.2l-5.2 5.2a3.2 3.2 0 01-4.5-4.5l5.7-5.7a2.1 2.1 0 013 3l-5.7 5.7a1 1 0 01-1.5-1.5l5.2-5.2"></path>
                                </svg>
                                {'\n                  '}
                              </button>
                              {'\n                  '}
                              <button
                                onClick={send}
                                className="hv-1a8qwtm"
                                style={cssToObj(
                                  `width:28px; height:28px; display:flex; align-items:center; justify-content:center; border:none; background:${sendBg}; border-radius:7px; cursor:pointer; margin-left:2px`,
                                )}
                              >
                                {'\n                    '}
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  stroke="#FFFFFF"
                                  strokeWidth="2"
                                >
                                  <path d="M10 16V5M5.5 9.5L10 5l4.5 4.5"></path>
                                </svg>
                                {'\n                  '}
                              </button>
                              {'\n                '}
                            </div>
                            {'\n              '}
                          </div>
                          {'\n            '}
                        </div>
                        {'\n          '}
                      </div>
                      {'\n        '}
                    </div>
                    {'\n      '}
                  </>
  )
}
