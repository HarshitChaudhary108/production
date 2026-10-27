import type { CopilotValues } from '../../types'

export function TableFooter({ m }: { m: CopilotValues }) {
  const { expandLabel, toggleExpand } = m
  return (
    <div className="py-[8px] px-[12px] flex items-center justify-between bg-[#FBFBFC] [border-top:1px_solid_#EFEFF2]">
                              {'\n                  '}
                              <span className="text-[11px] text-[#8E8E96]">
                                {
                                  'Sources: LinkedIn, Crunchbase, website intent, BuiltWith · confidence '
                                }
                                <span className="text-[#15803D] font-[600]">{'high'}</span>
                              </span>
                              {'\n                  '}
                              <span
                                onClick={toggleExpand}
                                className="text-[11.5px] text-[#6D28D9] font-[600] cursor-pointer"
                              >
                                <span>{expandLabel}</span>
                              </span>
                              {'\n                '}
                            </div>
  )
}
