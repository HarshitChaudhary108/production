import { Fragment } from 'react'
import { cssToObj } from '../../../lib/css'
import type { RadarValues } from '../types'

export function RadarPanel({ m }: { m: RadarValues }) {
  const { bubbles, chips, hover, ranges, showZoneLabels, weights } = m
  return (
    <section className="[border:1px_solid_#E5E7EB] rounded-[12px] bg-[#FFFFFF] overflow-hidden">
                    {'\n          '}
                    <div className="flex items-start justify-between pt-[15px] px-[16px] pb-[12px]">
                      {'\n            '}
                      <div>
                        {'\n              '}
                        <div className="text-[14.5px] font-[600] tracking-[-0.01em]">{'GTM Radar'}</div>
                        {'\n              '}
                        <div className="mt-[3px] text-[12.5px] text-[#71717A]">
                          {'Accounts ranked by fit, intent and freshness.'}
                        </div>
                        {'\n            '}
                      </div>
                      {'\n            '}
                      <div className="flex gap-[6px]">
                        {'\n              '}
                        {(ranges ?? []).map((r: any, __i: number) => (
                          <Fragment key={__i}>
                            {'\n                '}
                            <button onClick={r.onClick} style={cssToObj(r.style)}>
                              <span>{r.label}</span>
                            </button>
                            {'\n              '}
                          </Fragment>
                        ))}
                        {'\n            '}
                      </div>
                      {'\n          '}
                    </div>
                    {'\n\n          '}
                    <div className="flex flex-wrap gap-[6px] pt-[0] px-[16px] pb-[12px]">
                      {'\n            '}
                      {(chips ?? []).map((c: any, __i: number) => (
                        <Fragment key={__i}>
                          {'\n              '}
                          <button onClick={c.onClick} style={cssToObj(c.style)}>
                            <span>{c.label}</span>
                          </button>
                          {'\n            '}
                        </Fragment>
                      ))}
                      {'\n          '}
                    </div>
                    {'\n\n          '}
                    <div className="flex items-center gap-[14px] pt-[0] px-[16px] pb-[12px] [border-bottom:1px_solid_#F1F1F3]">
                      {'\n            '}
                      <span className="text-[10.5px] tracking-[0.06em] uppercase text-[#A1A1AA] font-[600]">
                        {'Weight'}
                      </span>
                      {'\n            '}
                      {(weights ?? []).map((w: any, __i: number) => (
                        <Fragment key={__i}>
                          {'\n              '}
                          <button onClick={w.onClick} style={cssToObj(w.style)}>
                            <span>{w.label}</span>
                          </button>
                          {'\n            '}
                        </Fragment>
                      ))}
                      {'\n            '}
                      <div className="ml-[auto] flex items-center gap-[14px] text-[11px] text-[#A1A1AA]">
                        {'\n              '}
                        <span>{'Bubble size = signal strength'}</span>
                        {'\n              '}
                        <span>{'Opacity = freshness'}</span>
                        {'\n            '}
                      </div>
                      {'\n          '}
                    </div>
                    {'\n\n          '}
                    <div className="relative pt-[18px] pr-[20px] pb-[30px] pl-[44px]">
                      {'\n            '}
                      <div className="relative h-[352px] [border-left:1px_solid_#E5E7EB] [border-bottom:1px_solid_#E5E7EB]">
                        {'\n              '}
                        <div className="absolute [inset:0] [background-image:linear-gradient(to_right,_#F4F4F5_1px,_transparent_1px),_linear-gradient(to_top,_#F4F4F5_1px,_transparent_1px)] [background-size:12.5%_25%]"></div>
                        {'\n              '}
                        <div className="absolute left-[55%] right-[0] top-[0] bottom-[45%] [background:linear-gradient(135deg,_rgba(124,58,237,0.09),_rgba(124,58,237,0.03))] [border-left:1px_dashed_#C4B5FD] [border-bottom:1px_dashed_#C4B5FD]"></div>
                        {'\n\n              '}
                        {showZoneLabels ? (
                          <>
                            {'\n                '}
                            <div className="absolute [inset:0] pointer-events-none">
                              {'\n                  '}
                              <span className="absolute left-[12px] bottom-[10px] text-[10.5px] tracking-[0.08em] uppercase text-[#D4D4D8] font-[600]">
                                {'Low priority'}
                              </span>
                              {'\n                  '}
                              <span className="absolute left-[12px] top-[10px] text-[10.5px] tracking-[0.08em] uppercase text-[#C7C7CC] font-[600]">
                                {'Watch'}
                              </span>
                              {'\n                  '}
                              <span className="absolute right-[14px] bottom-[10px] text-[10.5px] tracking-[0.08em] uppercase text-[#A78BFA] font-[600]">
                                {'High intent'}
                              </span>
                              {'\n                  '}
                              <span className="absolute right-[14px] top-[10px] flex items-center gap-[6px] text-[10.5px] tracking-[0.08em] uppercase text-[#6D28D9] font-[700]">
                                {'\n                    '}
                                <span className="w-[6px] h-[6px] rounded-full bg-[#7C3AED]"></span>
                                {'Act now\n                  '}
                              </span>
                              {'\n                '}
                            </div>
                            {'\n              '}
                          </>
                        ) : null}
                        {'\n\n              '}
                        {(bubbles ?? []).map((b: any, __i: number) => (
                          <Fragment key={__i}>
                            {'\n                '}
                            <div
                              onMouseEnter={b.onEnter}
                              onMouseLeave={b.onLeave}
                              onClick={b.onClick}
                              style={cssToObj(b.wrapStyle)}
                            >
                              {'\n                  '}
                              <div style={cssToObj(b.dotStyle)}></div>
                              {'\n                  '}
                              <span style={cssToObj(b.labelStyle)}>
                                <span>{b.name}</span>
                              </span>
                              {'\n                '}
                            </div>
                            {'\n              '}
                          </Fragment>
                        ))}
                        {'\n\n              '}
                        {hover ? (
                          <>
                            {'\n                '}
                            <div style={cssToObj(hover.tipStyle)}>
                              {'\n                  '}
                              <div className="flex items-center justify-between gap-[12px]">
                                {'\n                    '}
                                <span className="text-[12.5px] font-[600] tracking-[0.02em]">
                                  <span>{hover.name}</span>
                                </span>
                                {'\n                    '}
                                <span className="text-[10px] font-[700] tracking-[0.06em] uppercase text-[#6D28D9] bg-[#F5F3FF] rounded-[5px] py-[2px] px-[6px]">
                                  <span>{hover.zone}</span>
                                </span>
                                {'\n                  '}
                              </div>
                              {'\n                  '}
                              <div className="grid [grid-template-columns:repeat(4,1fr)] gap-[8px] mt-[9px]">
                                {'\n                    '}
                                <div>
                                  <div className="text-[9.5px] tracking-[0.06em] uppercase text-[#A1A1AA] font-[600]">
                                    {'ICP fit'}
                                  </div>
                                  <div className="[font-family:'IBM_Plex_Mono',monospace] text-[14px] font-[600]">
                                    <span>{hover.fit}</span>
                                  </div>
                                </div>
                                {'\n                    '}
                                <div>
                                  <div className="text-[9.5px] tracking-[0.06em] uppercase text-[#A1A1AA] font-[600]">
                                    {'Intent'}
                                  </div>
                                  <div className="[font-family:'IBM_Plex_Mono',monospace] text-[14px] font-[600]">
                                    <span>{hover.intent}</span>
                                  </div>
                                </div>
                                {'\n                    '}
                                <div>
                                  <div className="text-[9.5px] tracking-[0.06em] uppercase text-[#A1A1AA] font-[600]">
                                    {'Fresh'}
                                  </div>
                                  <div className="[font-family:'IBM_Plex_Mono',monospace] text-[14px] font-[600]">
                                    <span>{hover.fresh}</span>
                                  </div>
                                </div>
                                {'\n                    '}
                                <div>
                                  <div className="text-[9.5px] tracking-[0.06em] uppercase text-[#A1A1AA] font-[600]">
                                    {'Signals'}
                                  </div>
                                  <div className="[font-family:'IBM_Plex_Mono',monospace] text-[14px] font-[600]">
                                    <span>{hover.signals}</span>
                                  </div>
                                </div>
                                {'\n                  '}
                              </div>
                              {'\n                  '}
                              <div className="mt-[9px] pt-[8px] [border-top:1px_solid_#F1F1F3] text-[11.5px] text-[#52525B]">
                                {'Latest: '}
                                <span className="text-[#18181B] font-[500]">
                                  <span>{hover.latest}</span>
                                </span>
                              </div>
                              {'\n                  '}
                              <div className="mt-[9px] text-center text-[11.5px] font-[600] text-[#6D28D9] bg-[#F5F3FF] rounded-[7px] p-[6px]">
                                {'View intelligence'}
                              </div>
                              {'\n                '}
                            </div>
                            {'\n              '}
                          </>
                        ) : null}
                        {'\n            '}
                      </div>
                      {'\n\n            '}
                      <div className="absolute left-[0] top-[0] bottom-[30px] flex items-center">
                        {'\n              '}
                        <span className="text-[10.5px] tracking-[0.08em] uppercase text-[#A1A1AA] font-[600] [transform:rotate(-90deg)] whitespace-nowrap">
                          {'ICP fit →'}
                        </span>
                        {'\n            '}
                      </div>
                      {'\n            '}
                      <div className="flex justify-between pt-[8px] pr-[0] pb-[0] pl-[0]">
                        {'\n              '}
                        <span className="[font-family:'IBM_Plex_Mono',monospace] text-[10.5px] text-[#A1A1AA]">
                          {'0'}
                        </span>
                        {'\n              '}
                        <span className="text-[10.5px] tracking-[0.08em] uppercase text-[#A1A1AA] font-[600]">
                          {'Intent →'}
                        </span>
                        {'\n              '}
                        <span className="[font-family:'IBM_Plex_Mono',monospace] text-[10.5px] text-[#A1A1AA]">
                          {'100'}
                        </span>
                        {'\n            '}
                      </div>
                      {'\n          '}
                    </div>
                    {'\n        '}
                  </section>
  )
}
