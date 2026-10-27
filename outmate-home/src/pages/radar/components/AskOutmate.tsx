import { Fragment } from 'react'
import type { RadarValues } from '../types'

export function AskOutmate({ m }: { m: RadarValues }) {
  const { answer, onQueryChange, onQueryKey, prompts, query } = m
  return (
    <section className="[border:1px_solid_#DDD6FE] rounded-[12px] bg-[#FBFAFF] overflow-hidden">
                    {'\n          '}
                    <div className="pt-[13px] px-[14px] pb-[0] flex items-center gap-[7px]">
                      {'\n            '}
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="#7C3AED"
                        strokeWidth="1.5"
                      >
                        <path d="M8 2l1.5 3.6L13 7.1 9.5 8.6 8 12.2 6.5 8.6 3 7.1l3.5-1.5z"></path>
                      </svg>
                      {'\n            '}
                      <span className="text-[13.5px] font-[600] tracking-[-0.01em]">
                        {'Ask Outmate'}
                      </span>
                      {'\n          '}
                    </div>
                    {'\n          '}
                    <div className="pt-[10px] px-[14px] pb-[12px]">
                      {'\n            '}
                      <input
                        value={query}
                        onChange={onQueryChange}
                        onKeyDown={onQueryKey}
                        placeholder="Ask Outmate about your revenue..."
                        className="w-full h-[36px] py-[0] px-[11px] [border:1px_solid_#DDD6FE] rounded-[9px] bg-[#FFFFFF] [font-family:inherit] text-[12.5px] text-[#18181B] outline-none"
                      />
                      {'\n            '}
                      <div className="flex flex-col gap-[5px] mt-[10px]">
                        {'\n              '}
                        {(prompts ?? []).map((p: any, __i: number) => (
                          <Fragment key={__i}>
                            {'\n                '}
                            <button
                              onClick={p.onClick}
                              className="text-left py-[7px] px-[10px] [border:1px_solid_#EDE9FE] rounded-[8px] bg-[#FFFFFF] [font-family:inherit] text-[12px] text-[#3F3F46] cursor-pointer hv-1aor8ml"
                            >
                              <span>{p.label}</span>
                            </button>
                            {'\n              '}
                          </Fragment>
                        ))}
                        {'\n            '}
                      </div>
                      {'\n          '}
                    </div>
                    {'\n\n          '}
                    {answer ? (
                      <>
                        {'\n            '}
                        <div className="[border-top:1px_solid_#EDE9FE] bg-[#FFFFFF] pt-[13px] px-[14px] pb-[14px]">
                          {'\n              '}
                          <div className="text-[11.5px] text-[#A1A1AA]">{'You asked'}</div>
                          {'\n              '}
                          <div className="mt-[3px] text-[12.5px] font-[500] text-[#18181B]">
                            <span>{answer.question}</span>
                          </div>
                          {'\n              '}
                          <div className="mt-[11px] text-[13px] font-[600] text-[#5B21B6]">
                            <span>{answer.summary}</span>
                          </div>
                          {'\n              '}
                          <div className="flex flex-col mt-[9px] [border:1px_solid_#F1F1F3] rounded-[10px] overflow-hidden">
                            {'\n                '}
                            {(answer.rows ?? []).map((r: any, __i: number) => (
                              <Fragment key={__i}>
                                {'\n                  '}
                                <div
                                  onClick={r.onClick}
                                  className="flex gap-[10px] py-[9px] px-[11px] [border-bottom:1px_solid_#F4F4F5] cursor-pointer hv-udcbnb"
                                >
                                  {'\n                    '}
                                  <span className="[font-family:'IBM_Plex_Mono',monospace] text-[11px] text-[#C4B5FD] font-[600] pt-[2px]">
                                    <span>{r.rank}</span>
                                  </span>
                                  {'\n                    '}
                                  <div className="flex-1 [min-width:0]">
                                    {'\n                      '}
                                    <div className="flex items-baseline justify-between gap-[8px]">
                                      {'\n                        '}
                                      <span className="text-[12.5px] font-[600]">
                                        <span>{r.name}</span>
                                      </span>
                                      {'\n                        '}
                                      <span className="[font-family:'IBM_Plex_Mono',monospace] text-[11.5px] font-[600] text-[#6D28D9]">
                                        <span>{r.score}</span>
                                      </span>
                                      {'\n                      '}
                                    </div>
                                    {'\n                      '}
                                    <div className="mt-[2px] text-[11.5px] text-[#71717A] leading-[1.4]">
                                      <span>{r.why}</span>
                                    </div>
                                    {'\n                    '}
                                  </div>
                                  {'\n                  '}
                                </div>
                                {'\n                '}
                              </Fragment>
                            ))}
                            {'\n              '}
                          </div>
                          {'\n              '}
                          <div className="flex gap-[7px] mt-[11px]">
                            {'\n                '}
                            <button className="flex-1 h-[31px] [border:1px_solid_#6D28D9] rounded-[8px] bg-[#6D28D9] text-[#FFFFFF] [font-family:inherit] text-[12px] font-[600] cursor-pointer hv-jdi8ic">
                              {'View priority accounts'}
                            </button>
                            {'\n                '}
                            <button className="flex-1 h-[31px] [border:1px_solid_#E5E7EB] rounded-[8px] bg-[#FFFFFF] text-[#3F3F46] [font-family:inherit] text-[12px] font-[500] cursor-pointer hv-udcbnb">
                              {'Create outreach'}
                            </button>
                            {'\n              '}
                          </div>
                          {'\n            '}
                        </div>
                        {'\n          '}
                      </>
                    ) : null}
                    {'\n        '}
                  </section>
  )
}
