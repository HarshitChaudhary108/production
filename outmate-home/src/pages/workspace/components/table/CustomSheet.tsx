import type { WorkspaceValues } from '../../types'

export function CustomSheet({ m }: { m: WorkspaceValues }) {
  const { customSheetName, seedFromResearch, toggleImport } = m
  return (
    <>
                            {'\n              '}
                            <div className="py-[56px] px-[24px] flex flex-col items-center gap-[10px]">
                              {'\n                '}
                              <div className="text-[13px] font-[650] text-[#3F3F46]">
                                <span>{customSheetName}</span>
                                {' is empty'}
                              </div>
                              {'\n                '}
                              <div className="text-[11.5px] text-[#8E8E96] text-center [max-width:330px] leading-[1.55]">
                                {
                                  'Nothing has been imported or generated into this table yet. Import a file, or ask Copilot to build a list into it.'
                                }
                              </div>
                              {'\n                '}
                              <div className="flex gap-[7px] mt-[4px]">
                                {'\n                  '}
                                <button
                                  onClick={toggleImport}
                                  className="h-[28px] py-[0] px-[11px] [border:1px_solid_#E4E4E8] bg-[#FFFFFF] rounded-[6px] text-[11.5px] text-[#3F3F46] font-[550] cursor-pointer hv-u4v0t1"
                                >
                                  {'Import data'}
                                </button>
                                {'\n                  '}
                                <button
                                  onClick={seedFromResearch}
                                  className="h-[28px] py-[0] px-[11px] [border:1px_solid_#6D28D9] bg-[#6D28D9] text-[#FFFFFF] rounded-[6px] text-[11.5px] font-[600] cursor-pointer hv-jdi8ic"
                                >
                                  {'Copy from research'}
                                </button>
                                {'\n                '}
                              </div>
                              {'\n              '}
                            </div>
                            {'\n            '}
                          </>
  )
}
