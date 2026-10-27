import { Fragment } from 'react'
import { cssToObj } from '../../../../lib/css'
import type { CopilotValues } from '../../types'

export function TableTabs({ m }: { m: CopilotValues }) {
  const { runPanelOpen, runSteps, sheetTabs, toggleExpand, toggleRunPanel } = m
  return (
    <div className="flex items-center gap-[2px] py-[0] px-[12px] [border-bottom:1px_solid_#EFEFF2] bg-[#FBFBFC]">
                              {'\n                  '}
                              {(sheetTabs ?? []).map((t: any, __i: number) => (
                                <Fragment key={__i}>
                                  {'\n                    '}
                                  <div onClick={t.pick} style={cssToObj(t.style)}>
                                    {'\n                      '}
                                    <span>{t.name}</span>
                                    {'\n                      '}
                                    <span className="text-[10px] text-[#A1A1AA] tabular-nums">
                                      <span>{t.count}</span>
                                    </span>
                                    {'\n                    '}
                                  </div>
                                  {'\n                  '}
                                </Fragment>
                              ))}
                              {'\n                  '}
                              <div className="ml-[auto] flex items-center gap-[6px] relative">
                                {'\n                    '}
                                <div
                                  onClick={toggleRunPanel}
                                  className="flex items-center gap-[6px] h-[24px] py-[0] px-[8px] rounded-[6px] bg-[#ECFDF3] [border:1px_solid_#C6EFD8] cursor-pointer text-[11px] text-[#15803D] font-[600] hv-t69kef"
                                >
                                  {'\n                      '}
                                  <span className="w-[6px] h-[6px] rounded-full bg-[#22A15D] [animation:pulse_1.4s_ease-in-out_infinite]"></span>
                                  {
                                    '\n                      Running 364 / 2,370 cells\n                    '
                                  }
                                </div>
                                {'\n                    '}
                                {runPanelOpen ? (
                                  <>
                                    {'\n                      '}
                                    <div className="absolute top-[30px] right-[0] w-[288px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[11px] shadow-[0_16px_40px_rgba(24,24,27,.15)] z-[40] [animation:pop_.13s_ease-out] overflow-hidden">
                                      {'\n                        '}
                                      <div className="py-[11px] px-[13px] [border-bottom:1px_solid_#F1F1F3] flex items-center justify-between">
                                        {'\n                          '}
                                        <span className="text-[12px] font-[650]">{'Run progress'}</span>
                                        {'\n                          '}
                                        <span className="text-[11px] text-[#8E8E96] tabular-nums">
                                          {'364 / 2,370 cells'}
                                        </span>
                                        {'\n                        '}
                                      </div>
                                      {'\n                        '}
                                      <div className="py-[11px] px-[13px] flex flex-col gap-[9px]">
                                        {'\n                          '}
                                        {(runSteps ?? []).map((s: any, __i: number) => (
                                          <Fragment key={__i}>
                                            {'\n                            '}
                                            <div className="flex items-center gap-[9px]">
                                              {'\n                              '}
                                              <span
                                                style={cssToObj(
                                                  `font-size:12px; color:${s.iconColor}; width:13px; text-align:center`,
                                                )}
                                              >
                                                <span>{s.icon}</span>
                                              </span>
                                              {'\n                              '}
                                              <span
                                                style={cssToObj(
                                                  `font-size:12px; color:${s.color}; font-weight:${s.weight}`,
                                                )}
                                              >
                                                <span>{s.label}</span>
                                              </span>
                                              {'\n                              '}
                                              <span className="ml-[auto] text-[11px] text-[#A1A1AA] tabular-nums">
                                                <span>{s.meta}</span>
                                              </span>
                                              {'\n                            '}
                                            </div>
                                            {'\n                          '}
                                          </Fragment>
                                        ))}
                                        {'\n                          '}
                                        <div className="h-[4px] rounded-[3px] bg-[#F1F1F3] overflow-hidden mt-[2px]">
                                          {'\n                            '}
                                          <div className="h-full w-[15.4%] rounded-[3px] bg-[#6D28D9]"></div>
                                          {'\n                          '}
                                        </div>
                                        {'\n                          '}
                                        <div className="grid [grid-template-columns:1fr_1fr] gap-[7px] mt-[3px]">
                                          {'\n                            '}
                                          <div className="[border:1px_solid_#EDEDF0] rounded-[7px] py-[7px] px-[9px]">
                                            <div className="text-[10px] text-[#A1A1AA]">
                                              {'Credits consumed'}
                                            </div>
                                            <div className="text-[13px] font-[650] tabular-nums">
                                              {'64'}
                                            </div>
                                          </div>
                                          {'\n                            '}
                                          <div className="[border:1px_solid_#EDEDF0] rounded-[7px] py-[7px] px-[9px]">
                                            <div className="text-[10px] text-[#A1A1AA]">
                                              {'Est. remaining'}
                                            </div>
                                            <div className="text-[13px] font-[650] tabular-nums">
                                              {'~4 min'}
                                            </div>
                                          </div>
                                          {'\n                          '}
                                        </div>
                                        {'\n                          '}
                                        <div className="flex items-center justify-between text-[11px] text-[#8E8E96] pt-[3px]">
                                          {'\n                            '}
                                          <span>{'1 failed cell · retry queued'}</span>
                                          {'\n                            '}
                                          <span className="flex gap-[6px]">
                                            {'\n                              '}
                                            <span className="text-[#52525B] cursor-pointer font-[600]">
                                              {'Pause'}
                                            </span>
                                            {'\n                              '}
                                            <span className="text-[#B91C1C] cursor-pointer font-[600]">
                                              {'Stop'}
                                            </span>
                                            {'\n                            '}
                                          </span>
                                          {'\n                          '}
                                        </div>
                                        {'\n                        '}
                                      </div>
                                      {'\n                      '}
                                    </div>
                                    {'\n                    '}
                                  </>
                                ) : null}
                                {'\n                    '}
                                <button
                                  onClick={toggleExpand}
                                  className="w-[24px] h-[24px] flex items-center justify-center [border:1px_solid_#E4E4E8] bg-[#FFFFFF] rounded-[6px] cursor-pointer hv-u4v0t1"
                                >
                                  {'\n                      '}
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    stroke="#52525B"
                                    strokeWidth="1.7"
                                  >
                                    <path d="M12 3h5v5M8 17H3v-5M17 3l-6 6M3 17l6-6"></path>
                                  </svg>
                                  {'\n                    '}
                                </button>
                                {'\n                  '}
                              </div>
                              {'\n                '}
                            </div>
  )
}
