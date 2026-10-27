import { Fragment } from 'react'
import { cssToObj } from '../../../lib/css'
import type { CopilotValues } from '../types'

export function RadarView({ m }: { m: CopilotValues }) {
  const { bubbles, goCopilot, gridCells, radarFilters, toggleContext } = m
  return (
    <>
                    {'\n        '}
                    <div className="flex-1 [min-height:0] flex flex-col">
                      {'\n          '}
                      <div className="flex-none h-[50px] flex items-center justify-between py-[0] px-[20px] [border-bottom:1px_solid_#EFEFF2]">
                        {'\n            '}
                        <div className="flex flex-col">
                          {'\n              '}
                          <span className="text-[13px] font-[650] tracking-[-0.01em]">
                            {'GTM Radar'}
                          </span>
                          {'\n              '}
                          <span className="text-[11px] text-[#8E8E96]">
                            {'Accounts plotted by intent and ICP fit · bubble size = signal strength'}
                          </span>
                          {'\n            '}
                        </div>
                        {'\n            '}
                        <div className="flex items-center gap-[6px]">
                          {'\n              '}
                          <button
                            onClick={goCopilot}
                            className="h-[28px] py-[0] px-[10px] [border:1px_solid_#E4E4E8] bg-[#FFFFFF] rounded-[7px] text-[12px] text-[#3F3F46] font-[550] cursor-pointer hv-u4v0t1"
                          >
                            {'Back to Copilot'}
                          </button>
                          {'\n              '}
                          <button
                            onClick={toggleContext}
                            className="h-[28px] py-[0] px-[10px] [border:1px_solid_#E4E4E8] bg-[#FFFFFF] rounded-[7px] text-[12px] text-[#52525B] font-[550] cursor-pointer hv-u4v0t1"
                          >
                            {'Context'}
                          </button>
                          {'\n            '}
                        </div>
                        {'\n          '}
                      </div>
                      {'\n\n          '}
                      <div className="flex-none flex items-center gap-[5px] py-[9px] px-[20px] [border-bottom:1px_solid_#EFEFF2] flex-wrap">
                        {'\n            '}
                        {(radarFilters ?? []).map((f: any, __i: number) => (
                          <Fragment key={__i}>
                            {'\n              '}
                            <span onClick={f.pick} style={cssToObj(f.style)}>
                              <span>{f.label}</span>
                            </span>
                            {'\n            '}
                          </Fragment>
                        ))}
                        {'\n          '}
                      </div>
                      {'\n\n          '}
                      <div className="flex-1 [min-height:0] pt-[20px] px-[24px] pb-[16px] flex flex-col">
                        {'\n            '}
                        <div className="flex-1 [min-height:0] relative [border:1px_solid_#EDEDF0] rounded-[12px] bg-[#FCFCFD]">
                          {'\n              '}
                          <div className="absolute [inset:0] grid [grid-template-columns:repeat(4,1fr)] [grid-template-rows:repeat(4,1fr)]">
                            {'\n                '}
                            {(gridCells ?? []).map((g: any, __i: number) => (
                              <Fragment key={__i}>
                                {'\n                  '}
                                <div className="[border-right:1px_solid_#F3F3F5] [border-bottom:1px_solid_#F3F3F5]"></div>
                                {'\n                '}
                              </Fragment>
                            ))}
                            {'\n              '}
                          </div>
                          {'\n              '}
                          <div className="absolute right-[14px] top-[12px] text-[10px] font-[650] text-[#B9A9E8] tracking-[.05em] uppercase">
                            {'Act now'}
                          </div>
                          {'\n              '}
                          <div className="absolute left-[14px] bottom-[12px] text-[10px] font-[650] text-[#C9C9D0] tracking-[.05em] uppercase">
                            {'Monitor'}
                          </div>
                          {'\n              '}
                          {(bubbles ?? []).map((b: any, __i: number) => (
                            <Fragment key={__i}>
                              {'\n                '}
                              <div
                                onClick={b.open}
                                title={b.title}
                                className="hv-1a8qwuj"
                                style={cssToObj(
                                  `position:absolute; left:${b.x}; bottom:${b.y}; width:${b.size}; height:${b.size}; margin-left:${b.off}; margin-bottom:${b.off}; border-radius:50%; background:${b.bg}; border:1.5px solid ${b.border}; opacity:${b.opacity}; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:9.5px; font-weight:700; color:${b.fg}`,
                                )}
                              >
                                <span>{b.logo}</span>
                              </div>
                              {'\n              '}
                            </Fragment>
                          ))}
                          {'\n            '}
                        </div>
                        {'\n            '}
                        <div className="flex items-center justify-between pt-[10px]">
                          {'\n              '}
                          <span className="text-[11px] text-[#8E8E96]">{'Intent score →'}</span>
                          {'\n              '}
                          <span className="text-[11px] text-[#8E8E96]">
                            {'Opacity = signal freshness · click a bubble to inspect the account'}
                          </span>
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
