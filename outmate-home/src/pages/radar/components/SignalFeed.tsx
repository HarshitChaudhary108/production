import { Fragment } from 'react'
import { cssToObj } from '../../../lib/css'
import type { RadarValues } from '../types'

export function SignalFeed({ m }: { m: RadarValues }) {
  const { feed, feedCount, showAiInsight } = m
  return (
    <section className="[border:1px_solid_#E5E7EB] rounded-[12px] bg-[#FFFFFF]">
                    {'\n          '}
                    <div className="flex items-center justify-between py-[14px] px-[16px] [border-bottom:1px_solid_#F1F1F3]">
                      {'\n            '}
                      <div className="flex items-baseline gap-[9px]">
                        {'\n              '}
                        <span className="text-[14.5px] font-[600] tracking-[-0.01em]">
                          {"What's changing?"}
                        </span>
                        {'\n              '}
                        <span className="text-[12px] text-[#A1A1AA]">
                          <span>{feedCount}</span>
                          {' signals · live'}
                        </span>
                        {'\n            '}
                      </div>
                      {'\n            '}
                      <div className="flex items-center gap-[6px] text-[11.5px] text-[#71717A]">
                        {'\n              '}
                        <span className="w-[6px] h-[6px] rounded-full bg-[#22C55E]"></span>
                        {'Streaming\n            '}
                      </div>
                      {'\n          '}
                    </div>
                    {'\n\n          '}
                    <div className="flex flex-col">
                      {'\n            '}
                      {(feed ?? []).map((s: any, __i: number) => (
                        <Fragment key={__i}>
                          {'\n              '}
                          <article style={cssToObj(s.cardStyle)}>
                            {'\n                '}
                            <div className="flex gap-[12px]">
                              {'\n                  '}
                              <div style={cssToObj(s.avatarStyle)}>
                                <span>{s.initials}</span>
                              </div>
                              {'\n                  '}
                              <div className="flex-1 [min-width:0]">
                                {'\n                    '}
                                <div className="flex items-center gap-[8px] flex-wrap">
                                  {'\n                      '}
                                  <span className="text-[13.5px] font-[600]">
                                    <span>{s.company}</span>
                                  </span>
                                  {'\n                      '}
                                  <span style={cssToObj(s.tagStyle)}>
                                    <span>{s.tag}</span>
                                  </span>
                                  {'\n                      '}
                                  <span className="text-[11.5px] text-[#A1A1AA]">
                                    <span>{s.meta}</span>
                                  </span>
                                  {'\n                      '}
                                  <span className="ml-[auto] [font-family:'IBM_Plex_Mono',monospace] text-[11px] text-[#A1A1AA]">
                                    <span>{s.time}</span>
                                  </span>
                                  {'\n                    '}
                                </div>
                                {'\n                    '}
                                <div className="mt-[6px] text-[14px] font-[500] tracking-[-0.01em] text-[#18181B]">
                                  <span>{s.headline}</span>
                                </div>
                                {'\n                    '}
                                {s.quote ? (
                                  <>
                                    {'\n                      '}
                                    <div className="mt-[8px] py-[9px] px-[11px] [border-left:2px_solid_#E4E4E7] bg-[#FAFAFA] rounded-[0_8px_8px_0] text-[12.5px] text-[#3F3F46] leading-[1.5]">
                                      <span>{s.quote}</span>
                                    </div>
                                    {'\n                    '}
                                  </>
                                ) : null}
                                {'\n                    '}
                                {s.badges ? (
                                  <>
                                    {'\n                      '}
                                    <div className="flex gap-[6px] mt-[8px] flex-wrap">
                                      {'\n                        '}
                                      {(s.badges ?? []).map((bd: any, __i: number) => (
                                        <Fragment key={__i}>
                                          {'\n                          '}
                                          <span style={cssToObj(bd.style)}>
                                            <span>{bd.label}</span>
                                          </span>
                                          {'\n                        '}
                                        </Fragment>
                                      ))}
                                      {'\n                      '}
                                    </div>
                                    {'\n                    '}
                                  </>
                                ) : null}
                                {'\n                    '}
                                {showAiInsight ? (
                                  <>
                                    {'\n                      '}
                                    <div className="mt-[10px] [border:1px_solid_#EDE9FE] bg-[#FBFAFF] rounded-[9px] py-[10px] px-[11px]">
                                      {'\n                        '}
                                      <div className="flex items-center gap-[6px]">
                                        {'\n                          '}
                                        <svg
                                          width="12"
                                          height="12"
                                          viewBox="0 0 16 16"
                                          fill="none"
                                          stroke="#7C3AED"
                                          strokeWidth="1.5"
                                        >
                                          <path d="M8 2l1.5 3.6L13 7.1 9.5 8.6 8 12.2 6.5 8.6 3 7.1l3.5-1.5z"></path>
                                        </svg>
                                        {'\n                          '}
                                        <span className="text-[10px] tracking-[0.08em] uppercase text-[#6D28D9] font-[700]">
                                          {'AI insight'}
                                        </span>
                                        {'\n                        '}
                                      </div>
                                      {'\n                        '}
                                      <div className="mt-[6px] text-[12.5px] leading-[1.55] text-[#3F3F46]">
                                        <span>{s.insight}</span>
                                      </div>
                                      {'\n                        '}
                                      <div className="mt-[8px] text-[12px] text-[#52525B]">
                                        <span className="text-[#A1A1AA]">{'Recommends:'}</span>{' '}
                                        <span>{s.recommend}</span>
                                      </div>
                                      {'\n                      '}
                                    </div>
                                    {'\n                    '}
                                  </>
                                ) : null}
                                {'\n                    '}
                                <div className="flex items-center gap-[8px] mt-[11px]">
                                  {'\n                      '}
                                  <button
                                    onClick={s.onOpen}
                                    className="h-[29px] py-[0] px-[12px] [border:1px_solid_#E5E7EB] rounded-[8px] bg-[#FFFFFF] [font-family:inherit] text-[12px] font-[500] text-[#3F3F46] cursor-pointer hv-udcbnb"
                                  >
                                    {'View account'}
                                  </button>
                                  {'\n                      '}
                                  <button className="h-[29px] py-[0] px-[12px] [border:1px_solid_#6D28D9] rounded-[8px] bg-[#6D28D9] [font-family:inherit] text-[12px] font-[600] text-[#FFFFFF] cursor-pointer hv-jdi8ic">
                                    {'Create action'}
                                  </button>
                                  {'\n                      '}
                                  <span className="ml-[auto] flex items-center gap-[6px] text-[11px] text-[#A1A1AA]">
                                    {'Impact '}
                                    <span style={cssToObj(s.impactStyle)}>
                                      <span>{s.impact}</span>
                                    </span>
                                  </span>
                                  {'\n                    '}
                                </div>
                                {'\n                  '}
                              </div>
                              {'\n                '}
                            </div>
                            {'\n              '}
                          </article>
                          {'\n            '}
                        </Fragment>
                      ))}
                      {'\n          '}
                    </div>
                    {'\n        '}
                  </section>
  )
}
