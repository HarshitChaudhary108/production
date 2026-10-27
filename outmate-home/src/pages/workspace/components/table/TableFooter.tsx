import { Fragment } from 'react'
import type { WorkspaceValues } from '../../types'

export function TableFooter({ m }: { m: WorkspaceValues }) {
  const { footerRun, footerStats } = m
  return (
    <div className="flex-none flex items-center gap-[14px] py-[6px] px-[16px] [border-top:1px_solid_#E5E5EA] bg-[#FAFAFB]">
                        {'\n            '}
                        {(footerStats ?? []).map((f: any, __i: number) => (
                          <Fragment key={__i}>
                            {'\n              '}
                            <span className="text-[11px] text-[#8E8E96] whitespace-nowrap">
                              <strong className="font-[650] text-[#3F3F46] tabular-nums">
                                <span>{f.value}</span>
                              </strong>{' '}
                              <span>{f.label}</span>
                            </span>
                            {'\n            '}
                          </Fragment>
                        ))}
                        {'\n            '}
                        <span className="ml-[auto] text-[11px] text-[#8E8E96] tabular-nums whitespace-nowrap">
                          <span>{footerRun}</span>
                        </span>
                        {'\n          '}
                      </div>
  )
}
