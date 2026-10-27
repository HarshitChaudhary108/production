import { Fragment } from 'react'
import { cssToObj } from '../../../../lib/css'
import type { CopilotValues } from '../../types'

export function Composer({ m }: { m: CopilotValues }) {
  const { addAttachment, agent, cancelVoice, clearAttachment, composerMargin, composerRadius, creditsLabel, creditsWarn, draft, enrich, enrichMenuOpen, enrichments, hasAttachment, micColor, onInput, openCredits, send, sendBg, startVoice, toggleAgent, toggleEnrichMenu, toggleTools, typingMode, useVoice, voiceMode, waveBars } = m
  return (
    <>
                          {'\n            '}
                          <div className="flex-none [border-top:1px_solid_#EFEFF2] bg-[#FFFFFF] pt-[0] px-[22px] pb-[14px]">
                            {'\n              '}
                            <div className="[max-width:800px] my-[0] mx-[auto]">
                              {'\n                '}
                              {hasAttachment ? (
                                <>
                                  {'\n                  '}
                                  <div className="mt-[12px] flex items-center gap-[10px] [border:1px_solid_#E4E4E8] rounded-[9px] py-[9px] px-[11px] bg-[#FBFBFC]">
                                    {'\n                    '}
                                    <div className="w-[26px] h-[26px] rounded-[6px] bg-[#ECFDF3] flex items-center justify-center flex-none">
                                      {'\n                      '}
                                      <svg
                                        width="13"
                                        height="13"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        stroke="#15803D"
                                        strokeWidth="1.6"
                                      >
                                        <path d="M5 4.5h6l4 4V16a1 1 0 01-1 1H6a1 1 0 01-1-1z"></path>
                                        <path d="M11 4.5v4h4"></path>
                                      </svg>
                                      {'\n                    '}
                                    </div>
                                    {'\n                    '}
                                    <div className="[min-width:0] flex-1">
                                      {'\n                      '}
                                      <div className="text-[12px] font-[600]">
                                        {'target_accounts.csv'}
                                      </div>
                                      {'\n                      '}
                                      <div className="text-[10.5px] text-[#A1A1AA]">
                                        {'1,284 rows · ready to analyze'}
                                      </div>
                                      {'\n                    '}
                                    </div>
                                    {'\n                    '}
                                    <button className="h-[25px] py-[0] px-[9px] [border:1px_solid_#E4E4E8] bg-[#FFFFFF] rounded-[6px] text-[11.5px] text-[#3F3F46] cursor-pointer hv-u4v0t1">
                                      {'Analyze'}
                                    </button>
                                    {'\n                    '}
                                    <button
                                      onClick={enrich}
                                      className="h-[25px] py-[0] px-[9px] [border:1px_solid_#DDD6F3] bg-[#F5F1FD] text-[#5B21B6] rounded-[6px] text-[11.5px] font-[600] cursor-pointer hv-ttjng3"
                                    >
                                      {'Enrich'}
                                    </button>
                                    {'\n                    '}
                                    <button
                                      onClick={clearAttachment}
                                      className="w-[25px] h-[25px] [border:none] bg-transparent rounded-[6px] cursor-pointer text-[#A1A1AA] text-[14px] leading-[1] hv-u2196x"
                                    >
                                      {'×'}
                                    </button>
                                    {'\n                  '}
                                  </div>
                                  {'\n                '}
                                </>
                              ) : null}
                              {'\n\n                '}
                              {creditsWarn ? (
                                <>
                                  {'\n                  '}
                                  <div
                                    style={cssToObj(
                                      'margin-top:12px; display:flex; align-items:center; justify-content:space-between; border:1px solid #FED7AA; border-bottom:none; border-radius:10px 10px 0 0; background:#FFF8F1; padding:8px 12px',
                                    )}
                                  >
                                    {'\n                    '}
                                    <span className="flex items-center gap-[7px] text-[12px] font-[600] text-[#C2410C]">
                                      {'\n                      '}
                                      <svg
                                        width="13"
                                        height="13"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        stroke="#EA580C"
                                        strokeWidth="1.8"
                                      >
                                        <path d="M11 2.5L4.5 11.5H9l-.6 6 6.6-9H10.4z"></path>
                                      </svg>
                                      {'\n                      '}
                                      <span>{creditsLabel}</span>
                                      {' remaining\n                    '}
                                    </span>
                                    {'\n                    '}
                                    <button
                                      onClick={openCredits}
                                      className="h-[25px] py-[0] px-[10px] [border:1px_solid_#F3C99B] bg-[#FFFFFF] text-[#C2410C] rounded-[6px] text-[11.5px] font-[600] cursor-pointer hv-ugv1h8"
                                    >
                                      {'Top up'}
                                    </button>
                                    {'\n                  '}
                                  </div>
                                  {'\n                '}
                                </>
                              ) : null}
                              {'\n\n                '}
                              <div
                                style={cssToObj(
                                  `border:1px solid #E4E4E8; border-radius:${composerRadius}; background:#FFFFFF; box-shadow:0 1px 3px rgba(24,24,27,.05); margin-top:${composerMargin}`,
                                )}
                              >
                                {'\n                  '}
                                {voiceMode ? (
                                  <>
                                    {'\n                    '}
                                    <div className="pt-[15px] px-[14px] pb-[11px] flex items-center gap-[14px]">
                                      {'\n                      '}
                                      <span className="flex items-center gap-[7px] text-[12.5px] font-[600] text-[#B91C1C] whitespace-nowrap">
                                        <span className="w-[7px] h-[7px] rounded-full bg-[#DC2626] [animation:pulse_1.2s_ease-in-out_infinite]"></span>
                                        {'Listening…'}
                                      </span>
                                      {'\n                      '}
                                      <div className="flex-1 flex items-center gap-[3px] h-[26px]">
                                        {'\n                        '}
                                        {(waveBars ?? []).map((w: any, __i: number) => (
                                          <Fragment key={__i}>
                                            {'\n                          '}
                                            <span
                                              style={cssToObj(
                                                `flex:1; height:22px; border-radius:2px; background:#DDD6F3; transform-origin:center; animation:bar ${w.dur} ease-in-out infinite; animation-delay:${w.delay}`,
                                              )}
                                            ></span>
                                            {'\n                        '}
                                          </Fragment>
                                        ))}
                                        {'\n                      '}
                                      </div>
                                      {'\n                      '}
                                      <span className="text-[11.5px] text-[#A1A1AA] tabular-nums">
                                        {'0:07'}
                                      </span>
                                      {'\n                      '}
                                      <div className="flex gap-[6px]">
                                        {'\n                        '}
                                        <button className="h-[27px] py-[0] px-[10px] [border:1px_solid_#E4E4E8] bg-[#FFFFFF] rounded-[7px] text-[11.5px] text-[#52525B] cursor-pointer hv-u4v0t1">
                                          {'Pause'}
                                        </button>
                                        {'\n                        '}
                                        <button
                                          onClick={cancelVoice}
                                          className="h-[27px] py-[0] px-[10px] [border:1px_solid_#E4E4E8] bg-[#FFFFFF] rounded-[7px] text-[11.5px] text-[#52525B] cursor-pointer hv-u4v0t1"
                                        >
                                          {'Discard'}
                                        </button>
                                        {'\n                        '}
                                        <button
                                          onClick={useVoice}
                                          className="h-[27px] py-[0] px-[11px] [border:1px_solid_#6D28D9] bg-[#6D28D9] text-[#FFFFFF] rounded-[7px] text-[11.5px] font-[600] cursor-pointer whitespace-nowrap hv-jdi8ic"
                                        >
                                          {'Use voice message'}
                                        </button>
                                        {'\n                      '}
                                      </div>
                                      {'\n                    '}
                                    </div>
                                    {'\n                  '}
                                  </>
                                ) : null}
                                {'\n\n                  '}
                                {typingMode ? (
                                  <>
                                    {'\n                    '}
                                    <div className="pt-[12px] px-[14px] pb-[0]">
                                      {'\n                      '}
                                      <textarea
                                        onChange={onInput}
                                        value={draft}
                                        placeholder="Find leads, enrich data, analyze signals…"
                                        className="w-full [border:none] outline-none resize-none text-[13.5px] leading-[1.55] text-[#27272A] [min-height:44px] bg-transparent"
                                      ></textarea>
                                      {'\n                    '}
                                    </div>
                                    {'\n                  '}
                                  </>
                                ) : null}
                                {'\n\n                  '}
                                <div className="flex items-center justify-between pt-[8px] px-[10px] pb-[9px] relative">
                                  {'\n                    '}
                                  <div className="flex items-center gap-[4px]">
                                    {'\n                      '}
                                    <div
                                      onClick={toggleAgent}
                                      className="flex items-center gap-[6px] h-[27px] py-[0] px-[8px] rounded-[7px] cursor-pointer text-[12px] text-[#52525B] font-[550] hv-u45kwi"
                                    >
                                      {'\n                        '}
                                      <svg
                                        width="13"
                                        height="13"
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
                                      {'\n                        '}
                                      <span>{agent}</span>
                                      {'\n                        '}
                                      <svg
                                        width="9"
                                        height="9"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        stroke="#A1A1AA"
                                        strokeWidth="2.2"
                                      >
                                        <path d="M5 8l5 5 5-5"></path>
                                      </svg>
                                      {'\n                      '}
                                    </div>
                                    {'\n                      '}
                                    <button
                                      onClick={toggleTools}
                                      className="flex items-center gap-[6px] h-[27px] py-[0] px-[8px] [border:none] bg-transparent rounded-[7px] cursor-pointer text-[12px] text-[#52525B] font-[550] hv-u45kwi"
                                    >
                                      {'\n                        '}
                                      <svg
                                        width="13"
                                        height="13"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                      >
                                        <path d="M13.4 3.4a4 4 0 00-5 5L3.6 13.2a1.6 1.6 0 002.2 2.2l4.8-4.8a4 4 0 005-5l-2.3 2.3-2.1-.6-.6-2.1z"></path>
                                      </svg>
                                      {'\n                        Tools\n                      '}
                                    </button>
                                    {'\n                      '}
                                    <button
                                      onClick={toggleEnrichMenu}
                                      className="flex items-center gap-[6px] h-[27px] py-[0] px-[8px] [border:none] bg-transparent rounded-[7px] cursor-pointer text-[12px] text-[#52525B] font-[550] hv-u45kwi"
                                    >
                                      {'\n                        '}
                                      <svg
                                        width="13"
                                        height="13"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                      >
                                        <path d="M10 3.4l1.6 3.8 3.8 1.6-3.8 1.6L10 14.2l-1.6-3.8L4.6 8.8l3.8-1.6z"></path>
                                      </svg>
                                      {'\n                        Enrichment\n                      '}
                                    </button>
                                    {'\n                      '}
                                    {enrichMenuOpen ? (
                                      <>
                                        {'\n                        '}
                                        <div className="absolute bottom-[36px] left-[104px] w-[246px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[10px] shadow-[0_14px_34px_rgba(24,24,27,.14)] p-[5px] z-[40] [animation:pop_.13s_ease-out]">
                                          {'\n                          '}
                                          <div className="pt-[6px] px-[8px] pb-[4px] text-[10px] font-[650] text-[#A1A1AA] tracking-[.05em] uppercase">
                                            {'Enrichment actions'}
                                          </div>
                                          {'\n                          '}
                                          {(enrichments ?? []).map((e: any, __i: number) => (
                                            <Fragment key={__i}>
                                              {'\n                            '}
                                              <div
                                                onClick={e.pick}
                                                className="flex items-center justify-between gap-[10px] py-[6px] px-[8px] rounded-[6px] cursor-pointer text-[12px] text-[#3F3F46] hv-u4v0t1"
                                              >
                                                {'\n                              '}
                                                <span>
                                                  <span>{e.label}</span>
                                                </span>
                                                {'\n                              '}
                                                <span className="text-[10.5px] text-[#A1A1AA] whitespace-nowrap">
                                                  <span>{e.cost}</span>
                                                </span>
                                                {'\n                            '}
                                              </div>
                                              {'\n                          '}
                                            </Fragment>
                                          ))}
                                          {'\n                        '}
                                        </div>
                                        {'\n                      '}
                                      </>
                                    ) : null}
                                    {'\n                    '}
                                  </div>
                                  {'\n                    '}
                                  <div className="flex items-center gap-[4px]">
                                    {'\n                      '}
                                    <button
                                      onClick={addAttachment}
                                      className="w-[28px] h-[28px] flex items-center justify-center [border:none] bg-transparent rounded-[7px] cursor-pointer hv-u45kwi"
                                    >
                                      {'\n                        '}
                                      <svg
                                        width="15"
                                        height="15"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        stroke="#71717A"
                                        strokeWidth="1.5"
                                      >
                                        <path d="M14.5 9.2l-5.2 5.2a3.2 3.2 0 01-4.5-4.5l5.7-5.7a2.1 2.1 0 013 3l-5.7 5.7a1 1 0 01-1.5-1.5l5.2-5.2"></path>
                                      </svg>
                                      {'\n                      '}
                                    </button>
                                    {'\n                      '}
                                    <button
                                      onClick={startVoice}
                                      className="w-[28px] h-[28px] flex items-center justify-center [border:none] bg-transparent rounded-[7px] cursor-pointer hv-u45kwi"
                                    >
                                      {'\n                        '}
                                      <svg
                                        width="15"
                                        height="15"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        stroke={micColor}
                                        strokeWidth="1.5"
                                      >
                                        <rect x="7.6" y="3" width="4.8" height="9" rx="2.4"></rect>
                                        <path d="M4.8 9.6a5.2 5.2 0 0010.4 0M10 14.8V17"></path>
                                      </svg>
                                      {'\n                      '}
                                    </button>
                                    {'\n                      '}
                                    <button
                                      onClick={send}
                                      className="hv-1a8qwtm"
                                      style={cssToObj(
                                        `width:30px; height:30px; display:flex; align-items:center; justify-content:center; border:none; background:${sendBg}; border-radius:8px; cursor:pointer; margin-left:2px`,
                                      )}
                                    >
                                      {'\n                        '}
                                      <svg
                                        width="15"
                                        height="15"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        stroke="#FFFFFF"
                                        strokeWidth="2"
                                      >
                                        <path d="M10 16V5M5.5 9.5L10 5l4.5 4.5"></path>
                                      </svg>
                                      {'\n                      '}
                                    </button>
                                    {'\n                    '}
                                  </div>
                                  {'\n                  '}
                                </div>
                                {'\n                '}
                              </div>
                              {'\n                '}
                              <div className="flex items-center justify-between mt-[6px]">
                                {'\n                  '}
                                <span className="text-[10.5px] text-[#B4B4BB]">
                                  {
                                    'Outmate reads your Radar signals, CRM and enrichment history for context.'
                                  }
                                </span>
                                {'\n                  '}
                                <span className="text-[10.5px] text-[#B4B4BB]">
                                  {'Enter to send · Shift+Enter for newline'}
                                </span>
                                {'\n                '}
                              </div>
                              {'\n              '}
                            </div>
                            {'\n            '}
                          </div>
                          {'\n          '}
                        </>
  )
}
