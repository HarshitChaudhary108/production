import { Fragment } from 'react'
import { cssToObj } from '../../../lib/css'
import type { WorkspaceValues } from '../types'

export function RadarView({ m }: { m: WorkspaceValues }) {
  const { bubbles, goCopilot, gridCells, viewChips } = m
  return (
    <>
                    {'\n        '}
                    <div className="flex-1 [min-height:0] flex flex-col">
                      {'\n          '}
                      <div className="flex-none pt-[12px] px-[16px] pb-[10px] [border-bottom:1px_solid_#EFEFF2] flex items-center justify-between">
                        {'\n            '}
                        <div>
                          {'\n              '}
                          <div className="text-[13px] font-[650]">{'GTM Radar'}</div>
                          {'\n              '}
                          <div className="text-[11px] text-[#8E8E96]">
                            {'Intent × ICP fit · bubble size = signal count · opacity = freshness'}
                          </div>
                          {'\n            '}
                        </div>
                        {'\n            '}
                        <button
                          onClick={goCopilot}
                          className="h-[27px] py-[0] px-[10px] [border:1px_solid_#E4E4E8] bg-[#FFFFFF] rounded-[6px] text-[11.5px] text-[#3F3F46] font-[550] cursor-pointer hv-u4v0t1"
                        >
                          {'Back to table'}
                        </button>
                        {'\n          '}
                      </div>
                      {'\n          '}
                      <div className="flex-none flex items-center gap-[5px] py-[8px] px-[16px] [border-bottom:1px_solid_#EFEFF2] flex-wrap">
                        {'\n            '}
                        {(viewChips ?? []).map((f: any, __i: number) => (
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
                      {'\n          '}
                      <div className="flex-1 [min-height:0] pt-[18px] px-[20px] pb-[14px] flex flex-col">
                        {'\n            '}
                        <div className="flex-1 [min-height:0] relative [border:1px_solid_#EDEDF0] rounded-[10px] bg-[#FCFCFD]">
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
                          <div className="absolute right-[12px] top-[10px] text-[10px] font-[650] text-[#BCACE9] tracking-[.05em] uppercase">
                            {'Act now'}
                          </div>
                          {'\n              '}
                          <div className="absolute left-[12px] bottom-[10px] text-[10px] font-[650] text-[#C9C9D0] tracking-[.05em] uppercase">
                            {'Monitor'}
                          </div>
                          {'\n              '}
                          {(bubbles ?? []).map((b: any, __i: number) => (
                            <Fragment key={__i}>
                              {'\n                '}
                              <div
                                onClick={b.open}
                                title={b.title}
                                className="hv-1a8qwrs"
                                style={cssToObj(
                                  `position:absolute; left:${b.x}; bottom:${b.y}; width:${b.size}; height:${b.size}; margin-left:${b.off}; margin-bottom:${b.off}; border-radius:50%; background:${b.bg}; border:1.5px solid #FFFFFF; opacity:${b.opacity}; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:700; color:#FFFFFF`,
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
                        <div className="flex justify-between pt-[8px]">
                          {'\n              '}
                          <span className="text-[10.5px] text-[#8E8E96]">{'Intent score →'}</span>
                          {'\n              '}
                          <span className="text-[10.5px] text-[#8E8E96]">
                            {'Click a bubble to open the account panel'}
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
