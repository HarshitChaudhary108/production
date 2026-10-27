import { Fragment } from 'react'
import type { WorkspaceValues } from '../../types'

export function TableHeaderBar({ m }: { m: WorkspaceValues }) {
  const { headerStats, projectName } = m
  return (
    <div className="flex-none pt-[11px] px-[16px] pb-[10px] [border-bottom:1px_solid_#EFEFF2]">
                        {'\n            '}
                        <div className="flex items-center gap-[9px]">
                          {'\n              '}
                          <span className="text-[14px] font-[650] tracking-[-0.015em]">
                            <span>{projectName}</span>
                          </span>
                          {'\n              '}
                          <span className="flex items-center gap-[5px] py-[2px] px-[7px] rounded-[5px] bg-[#ECFDF3] text-[#15803D] text-[10.5px] font-[600]">
                            {'\n                '}
                            <span className="w-[5px] h-[5px] rounded-full bg-[#22A15D] [animation:pulse_1.8s_ease-in-out_infinite]"></span>
                            {'Live\n              '}
                          </span>
                          {'\n            '}
                        </div>
                        {'\n            '}
                        <div className="flex items-center gap-[10px] mt-[6px]">
                          {'\n              '}
                          <span className="text-[11.5px] text-[#71717A] leading-[1.45] overflow-hidden text-ellipsis whitespace-nowrap [max-width:560px]">
                            {
                              "“Find B2B SaaS companies with 50–500 employees that currently use HubSpot or Salesforce but don't have a unified GTM platform.”"
                            }
                          </span>
                          {'\n              '}
                          <div className="ml-[auto] flex items-center gap-[12px] whitespace-nowrap">
                            {'\n                '}
                            {(headerStats ?? []).map((h: any, __i: number) => (
                              <Fragment key={__i}>
                                {'\n                  '}
                                <span className="text-[11px] text-[#8E8E96]">
                                  <strong className="font-[650] text-[#18181B] tabular-nums">
                                    <span>{h.value}</span>
                                  </strong>{' '}
                                  <span>{h.label}</span>
                                </span>
                                {'\n                '}
                              </Fragment>
                            ))}
                            {'\n              '}
                          </div>
                          {'\n            '}
                        </div>
                        {'\n          '}
                      </div>
  )
}
