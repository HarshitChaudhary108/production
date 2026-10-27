import { Fragment } from 'react'
import { cssToObj } from '../../../../lib/css'
import type { CopilotValues } from '../../types'

export function LeadersSheet({ m }: { m: CopilotValues }) {
  const { leaderCols, leaders } = m
  return (
    <>
                                {'\n                  '}
                                <div className="overflow-x-auto">
                                  {'\n                    '}
                                  <div className="[min-width:860px]">
                                    {'\n                      '}
                                    <div className="grid [grid-template-columns:184px_178px_158px_200px_108px_92px] bg-[#F7F7F9] [border-bottom:1px_solid_#EFEFF2]">
                                      {'\n                        '}
                                      {(leaderCols ?? []).map((c: any, __i: number) => (
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
                                    {(leaders ?? []).map((p: any, __i: number) => (
                                      <Fragment key={__i}>
                                        {'\n                        '}
                                        <div
                                          onClick={p.open}
                                          className="grid [grid-template-columns:184px_178px_158px_200px_108px_92px] [border-bottom:1px_solid_#F4F4F6] cursor-pointer bg-[#FFFFFF] hv-udcbnc"
                                        >
                                          {'\n                          '}
                                          <div className="py-[8px] px-[10px] flex items-center gap-[8px] [min-width:0]">
                                            {'\n                            '}
                                            <span
                                              style={cssToObj(
                                                `width:22px; height:22px; border-radius:50%; flex:none; display:flex; align-items:center; justify-content:center; font-size:9.5px; font-weight:650; color:#3F3F46; background:${p.bg}`,
                                              )}
                                            >
                                              <span>{p.initials}</span>
                                            </span>
                                            {'\n                            '}
                                            <span className="[min-width:0] flex flex-col">
                                              {'\n                              '}
                                              <span className="text-[12.5px] font-[600] overflow-hidden text-ellipsis whitespace-nowrap">
                                                <span>{p.name}</span>
                                              </span>
                                              {'\n                              '}
                                              <span className="text-[10.5px] text-[#A1A1AA]">
                                                <span>{p.seniority}</span>
                                              </span>
                                              {'\n                            '}
                                            </span>
                                            {'\n                          '}
                                          </div>
                                          {'\n                          '}
                                          <div className="py-[8px] px-[10px] flex items-center text-[11.5px] text-[#52525B] overflow-hidden text-ellipsis whitespace-nowrap">
                                            <span>{p.title}</span>
                                          </div>
                                          {'\n                          '}
                                          <div className="py-[8px] px-[10px] flex items-center gap-[7px] [min-width:0]">
                                            {'\n                            '}
                                            <span
                                              style={cssToObj(
                                                `width:18px; height:18px; border-radius:5px; flex:none; display:flex; align-items:center; justify-content:center; font-size:8.5px; font-weight:700; color:#FFFFFF; background:${p.logoBg}`,
                                              )}
                                            >
                                              <span>{p.logo}</span>
                                            </span>
                                            {'\n                            '}
                                            <span className="text-[11.5px] text-[#3F3F46] overflow-hidden text-ellipsis whitespace-nowrap">
                                              <span>{p.company}</span>
                                            </span>
                                            {'\n                          '}
                                          </div>
                                          {'\n                          '}
                                          <div className="py-[8px] px-[10px] flex items-center gap-[6px] [min-width:0]">
                                            {'\n                            '}
                                            <span className="text-[11px] [font-family:'JetBrains_Mono',_monospace] text-[#52525B] overflow-hidden text-ellipsis whitespace-nowrap">
                                              <span>{p.email}</span>
                                            </span>
                                            {'\n                            '}
                                            <span style={cssToObj(p.statusStyle)}>
                                              <span>{p.status}</span>
                                            </span>
                                            {'\n                          '}
                                          </div>
                                          {'\n                          '}
                                          <div className="py-[8px] px-[10px] flex items-center">
                                            <span style={cssToObj(p.roleStyle)}>
                                              <span>{p.persona}</span>
                                            </span>
                                          </div>
                                          {'\n                          '}
                                          <div className="py-[8px] px-[10px] flex items-center text-[11px] text-[#A1A1AA]">
                                            <span>{p.active}</span>
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
