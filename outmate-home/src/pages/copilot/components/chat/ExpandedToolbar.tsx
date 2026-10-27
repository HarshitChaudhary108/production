import type { CopilotValues } from '../../types'

export function ExpandedToolbar({ m }: { m: CopilotValues }) {
  const { collapseTable } = m
  return (
    <>
                          {'\n            '}
                          <div className="flex-none h-[44px] flex items-center justify-between py-[0] px-[18px] [border-bottom:1px_solid_#EFEFF2] bg-[#FBFBFC]">
                            {'\n              '}
                            <div className="flex items-center gap-[10px]">
                              {'\n                '}
                              <button
                                onClick={collapseTable}
                                className="h-[27px] flex items-center gap-[6px] py-[0] px-[9px] [border:1px_solid_#E4E4E8] bg-[#FFFFFF] rounded-[7px] text-[12px] text-[#3F3F46] font-[550] cursor-pointer hv-u4v0t1"
                              >
                                {'\n                  '}
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M16 10H5M9 6l-4 4 4 4"></path>
                                </svg>
                                {'\n                  Back to Copilot\n                '}
                              </button>
                              {'\n                '}
                              <span className="text-[12.5px] font-[650]">{'Full database view'}</span>
                              {'\n                '}
                              <span className="text-[11px] text-[#8E8E96]">
                                {'B2B SaaS · HubSpot & Salesforce gap'}
                              </span>
                              {'\n              '}
                            </div>
                            {'\n              '}
                            <span className="text-[11px] text-[#8E8E96]">
                              {'Same account context as the conversation'}
                            </span>
                            {'\n            '}
                          </div>
                          {'\n          '}
                        </>
  )
}
