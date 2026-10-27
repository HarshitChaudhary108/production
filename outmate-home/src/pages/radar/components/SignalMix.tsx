import { Fragment } from 'react'
import { cssToObj } from '../../../lib/css'
import type { RadarValues } from '../types'

export function SignalMix({ m }: { m: RadarValues }) {
  const { mix } = m
  return (
    <section className="[border:1px_solid_#E5E7EB] rounded-[12px] bg-[#FFFFFF] py-[13px] px-[14px]">
                    {'\n          '}
                    <div className="text-[10.5px] tracking-[0.06em] uppercase text-[#A1A1AA] font-[600]">
                      {'Signal mix · 7 days'}
                    </div>
                    {'\n          '}
                    <div className="flex flex-col gap-[8px] mt-[11px]">
                      {'\n            '}
                      {(mix ?? []).map((m: any, __i: number) => (
                        <Fragment key={__i}>
                          {'\n              '}
                          <div className="flex items-center gap-[9px]">
                            {'\n                '}
                            <span className="w-[96px] text-[12px] text-[#52525B]">
                              <span>{m.label}</span>
                            </span>
                            {'\n                '}
                            <div className="flex-1 h-[5px] rounded-[4px] bg-[#F4F4F5] overflow-hidden">
                              {'\n                  '}
                              <div style={cssToObj(m.barStyle)}></div>
                              {'\n                '}
                            </div>
                            {'\n                '}
                            <span className="w-[30px] text-right [font-family:'IBM_Plex_Mono',monospace] text-[11px] text-[#71717A]">
                              <span>{m.value}</span>
                            </span>
                            {'\n              '}
                          </div>
                          {'\n            '}
                        </Fragment>
                      ))}
                      {'\n          '}
                    </div>
                    {'\n        '}
                  </section>
  )
}
