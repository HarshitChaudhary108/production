import { Fragment } from 'react'
import { cssToObj } from '../../../../lib/css'
import type { CopilotValues } from '../../types'

export function ChatHeader({ m }: { m: CopilotValues }) {
  const { agent, agentOpen, agents, toggleAgent, toggleContext, toggleTools, tools, toolsOpen } = m
  return (
    <>
                          {'\n            '}
                          <div className="flex-none h-[50px] flex items-center justify-between py-[0] px-[22px] [border-bottom:1px_solid_#EFEFF2]">
                            {'\n              '}
                            <div className="flex flex-col">
                              {'\n                '}
                              <span className="text-[13px] font-[650] tracking-[-0.01em]">
                                {'Ask Outmate'}
                              </span>
                              {'\n                '}
                              <span className="text-[11px] text-[#8E8E96]">
                                {'Research companies, people, signals and GTM opportunities.'}
                              </span>
                              {'\n              '}
                            </div>
                            {'\n              '}
                            <div className="flex items-center gap-[6px] relative">
                              {'\n                '}
                              <div
                                onClick={toggleAgent}
                                className="flex items-center gap-[7px] h-[28px] py-[0] px-[9px] [border:1px_solid_#E8E8EC] rounded-[7px] bg-[#FFFFFF] cursor-pointer text-[12px] font-[550] text-[#3F3F46] hv-u69wm2"
                              >
                                {'\n                  '}
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  stroke="#6D28D9"
                                  strokeWidth="1.6"
                                >
                                  <rect x="3.5" y="6" width="13" height="10" rx="3"></rect>
                                  <path d="M10 3v3"></path>
                                  <circle cx="7.6" cy="11" r="1"></circle>
                                  <circle cx="12.4" cy="11" r="1"></circle>
                                </svg>
                                {'\n                  '}
                                <span>{agent}</span>
                                {'\n                  '}
                                <svg
                                  width="10"
                                  height="10"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  stroke="#A1A1AA"
                                  strokeWidth="2"
                                >
                                  <path d="M5 8l5 5 5-5"></path>
                                </svg>
                                {'\n                '}
                              </div>
                              {'\n                '}
                              <button
                                onClick={toggleTools}
                                className="h-[28px] w-[28px] flex items-center justify-center [border:1px_solid_#E8E8EC] bg-[#FFFFFF] rounded-[7px] cursor-pointer hv-u69wm2"
                              >
                                {'\n                  '}
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  stroke="#52525B"
                                  strokeWidth="1.5"
                                >
                                  <path d="M13.4 3.4a4 4 0 00-5 5L3.6 13.2a1.6 1.6 0 002.2 2.2l4.8-4.8a4 4 0 005-5l-2.3 2.3-2.1-.6-.6-2.1z"></path>
                                </svg>
                                {'\n                '}
                              </button>
                              {'\n                '}
                              <button
                                onClick={toggleContext}
                                className="h-[28px] flex items-center gap-[6px] py-[0] px-[9px] [border:1px_solid_#E8E8EC] bg-[#FFFFFF] rounded-[7px] cursor-pointer text-[12px] text-[#52525B] font-[550] hv-u69wm2"
                              >
                                {'\n                  '}
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                >
                                  <rect x="3" y="4" width="14" height="12" rx="2.5"></rect>
                                  <path d="M12.4 4v12"></path>
                                </svg>
                                {'\n                  Context\n                '}
                              </button>
                              {'\n\n                '}
                              {agentOpen ? (
                                <>
                                  {'\n                  '}
                                  <div className="absolute top-[34px] right-[64px] w-[236px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[10px] shadow-[0_12px_32px_rgba(24,24,27,.12)] p-[5px] z-[40] [animation:pop_.13s_ease-out]">
                                    {'\n                    '}
                                    {(agents ?? []).map((a: any, __i: number) => (
                                      <Fragment key={__i}>
                                        {'\n                      '}
                                        <div
                                          onClick={a.pick}
                                          className="hv-u4v0t1"
                                          style={cssToObj(
                                            `display:flex; align-items:flex-start; gap:9px; padding:7px 8px; border-radius:7px; cursor:pointer; background:${a.bg}`,
                                          )}
                                        >
                                          {'\n                        '}
                                          <div
                                            style={cssToObj(
                                              `width:22px; height:22px; border-radius:6px; flex:none; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; background:${a.chipBg}; color:${a.chipFg}`,
                                            )}
                                          >
                                            <span>{a.abbr}</span>
                                          </div>
                                          {'\n                        '}
                                          <div className="[min-width:0]">
                                            {'\n                          '}
                                            <div className="text-[12px] font-[600] text-[#18181B]">
                                              <span>{a.name}</span>
                                            </div>
                                            {'\n                          '}
                                            <div className="text-[10.5px] text-[#8E8E96] leading-[1.35]">
                                              <span>{a.desc}</span>
                                            </div>
                                            {'\n                        '}
                                          </div>
                                          {'\n                      '}
                                        </div>
                                        {'\n                    '}
                                      </Fragment>
                                    ))}
                                    {'\n                  '}
                                  </div>
                                  {'\n                '}
                                </>
                              ) : null}
                              {'\n\n                '}
                              {toolsOpen ? (
                                <>
                                  {'\n                  '}
                                  <div className="absolute top-[34px] right-[34px] w-[224px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[10px] shadow-[0_12px_32px_rgba(24,24,27,.12)] p-[5px] z-[40] [animation:pop_.13s_ease-out]">
                                    {'\n                    '}
                                    <div className="pt-[6px] px-[8px] pb-[4px] text-[10px] font-[650] text-[#A1A1AA] tracking-[.05em] uppercase">
                                      {'GTM tools'}
                                    </div>
                                    {'\n                    '}
                                    {(tools ?? []).map((t: any, __i: number) => (
                                      <Fragment key={__i}>
                                        {'\n                      '}
                                        <div
                                          onClick={t.pick}
                                          className="flex items-center justify-between gap-[8px] py-[6px] px-[8px] rounded-[6px] cursor-pointer text-[12px] text-[#3F3F46] hv-u4v0t1"
                                        >
                                          {'\n                        '}
                                          <span>
                                            <span>{t.name}</span>
                                          </span>
                                          {'\n                        '}
                                          <span className="text-[10px] text-[#A1A1AA] tabular-nums">
                                            <span>{t.cost}</span>
                                          </span>
                                          {'\n                      '}
                                        </div>
                                        {'\n                    '}
                                      </Fragment>
                                    ))}
                                    {'\n                  '}
                                  </div>
                                  {'\n                '}
                                </>
                              ) : null}
                              {'\n              '}
                            </div>
                            {'\n            '}
                          </div>
                          {'\n          '}
                        </>
  )
}
