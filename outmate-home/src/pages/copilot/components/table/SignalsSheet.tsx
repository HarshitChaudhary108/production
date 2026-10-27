import { Fragment } from 'react'
import { cssToObj } from '../../../../lib/css'
import type { CopilotValues } from '../../types'

export function SignalsSheet({ m }: { m: CopilotValues }) {
  const { signalCols, signalRows } = m
  return (
    <>
                                {'\n                  '}
                                <div className="overflow-x-auto">
                                  {'\n                    '}
                                  <div className="[min-width:860px]">
                                    {'\n                      '}
                                    <div className="grid [grid-template-columns:150px_168px_240px_118px_100px_104px] bg-[#F7F7F9] [border-bottom:1px_solid_#EFEFF2]">
                                      {'\n                        '}
                                      {(signalCols ?? []).map((c: any, __i: number) => (
                                        <Fragment key={__i}>
                                          {'\n                          '}
                                          <div className="py-[7px] px-[10px] text-[10px] font-[650] text-[#71717A] tracking-[.04em] uppercase whitespace-nowrap">
                                            <span>{c}</span>
                                          </div>
                                          {'\n                        '}
                                        </Fragment>
                                      ))}
                                      {'\n                      '}
                                    </div>
                                    {'\n                      '}
                                    {(signalRows ?? []).map((s: any, __i: number) => (
                                      <Fragment key={__i}>
                                        {'\n                        '}
                                        <div
                                          onClick={s.open}
                                          className="grid [grid-template-columns:150px_168px_240px_118px_100px_104px] [border-bottom:1px_solid_#F4F4F6] cursor-pointer bg-[#FFFFFF] hv-udcbnc"
                                        >
                                          {'\n                          '}
                                          <div className="py-[8px] px-[10px] flex items-center gap-[7px] [min-width:0]">
                                            {'\n                            '}
                                            <span
                                              style={cssToObj(
                                                `width:20px; height:20px; border-radius:5px; flex:none; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:700; color:#FFFFFF; background:${s.logoBg}`,
                                              )}
                                            >
                                              <span>{s.logo}</span>
                                            </span>
                                            {'\n                            '}
                                            <span className="text-[12px] font-[600] overflow-hidden text-ellipsis whitespace-nowrap">
                                              <span>{s.company}</span>
                                            </span>
                                            {'\n                          '}
                                          </div>
                                          {'\n                          '}
                                          <div className="py-[8px] px-[10px] flex items-center gap-[6px]">
                                            <span className="text-[12px]">
                                              <span>{s.icon}</span>
                                            </span>
                                            <span className="text-[11.5px] text-[#3F3F46] font-[550]">
                                              <span>{s.type}</span>
                                            </span>
                                          </div>
                                          {'\n                          '}
                                          <div className="py-[8px] px-[10px] flex items-center text-[11.5px] text-[#52525B] overflow-hidden text-ellipsis whitespace-nowrap">
                                            <span>{s.detail}</span>
                                          </div>
                                          {'\n                          '}
                                          <div className="py-[8px] px-[10px] flex items-center text-[11.5px] text-[#71717A]">
                                            <span>{s.source}</span>
                                          </div>
                                          {'\n                          '}
                                          <div className="py-[8px] px-[10px] flex items-center text-[11.5px] text-[#A1A1AA]">
                                            <span>{s.time}</span>
                                          </div>
                                          {'\n                          '}
                                          <div className="py-[8px] px-[10px] flex items-center">
                                            <span style={cssToObj(s.confStyle)}>
                                              <span>{s.conf}</span>
                                            </span>
                                          </div>
                                          {'\n                        '}
                                        </div>
                                        {'\n                      '}
                                      </Fragment>
                                    ))}
                                    {'\n                    '}
                                  </div>
                                  {'\n                  '}
                                </div>
                                {'\n                '}
                              </>
  )
}
