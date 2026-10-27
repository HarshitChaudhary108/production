import { Fragment } from 'react'
import type { CopilotValues } from '../../types'

export function TableHeader({ m }: { m: CopilotValues }) {
  const { clearSelection, enrich, exportItems, exportOpen, goRadar, hasSelection, importItems, importOpen, selectionLabel, tableCount, tableTitle, toggleExport, toggleImport } = m
  return (
    <div className="flex items-center justify-between py-[10px] px-[12px] [border-bottom:1px_solid_#EFEFF2]">
                              {'\n                  '}
                              <div className="flex items-center gap-[9px] [min-width:0]">
                                {'\n                    '}
                                <span className="text-[12.5px] font-[650]">
                                  <span>{tableTitle}</span>
                                </span>
                                {'\n                    '}
                                <span className="text-[10.5px] text-[#8E8E96] bg-[#F4F4F6] rounded-[5px] py-[2px] px-[6px] tabular-nums whitespace-nowrap">
                                  <span>{tableCount}</span>
                                </span>
                                {'\n                    '}
                                {hasSelection ? (
                                  <>
                                    {'\n                      '}
                                    <span className="flex items-center gap-[7px] text-[11px] text-[#5B21B6] bg-[#F5F1FD] [border:1px_solid_#E6DDFB] rounded-[6px] py-[2px] px-[8px] whitespace-nowrap">
                                      {'\n                        '}
                                      <span>{selectionLabel}</span>
                                      {'\n                        '}
                                      <span
                                        onClick={clearSelection}
                                        className="cursor-pointer text-[#8B72C7]"
                                      >
                                        {'clear'}
                                      </span>
                                      {'\n                      '}
                                    </span>
                                    {'\n                    '}
                                  </>
                                ) : null}
                                {'\n                  '}
                              </div>
                              {'\n                  '}
                              <div className="flex items-center gap-[6px] relative">
                                {'\n                    '}
                                <button
                                  onClick={enrich}
                                  className="h-[27px] py-[0] px-[9px] [border:1px_solid_#E4E4E8] bg-[#FFFFFF] rounded-[6px] text-[11.5px] text-[#3F3F46] font-[550] cursor-pointer flex items-center gap-[5px] hv-u4v0t1"
                                >
                                  {'\n                      '}
                                  <svg
                                    width="11"
                                    height="11"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    stroke="#6D28D9"
                                    strokeWidth="1.8"
                                  >
                                    <path d="M10 3.4l1.6 3.8 3.8 1.6-3.8 1.6L10 14.2l-1.6-3.8L4.6 8.8l3.8-1.6z"></path>
                                  </svg>
                                  {'\n                      Enrich\n                    '}
                                </button>
                                {'\n                    '}
                                <button
                                  onClick={toggleImport}
                                  className="h-[27px] py-[0] px-[9px] [border:1px_solid_#E4E4E8] bg-[#FFFFFF] rounded-[6px] text-[11.5px] text-[#3F3F46] font-[550] cursor-pointer flex items-center gap-[5px] hv-u4v0t1"
                                >
                                  {'\n                      Import\n                      '}
                                  <svg
                                    width="9"
                                    height="9"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    stroke="#A1A1AA"
                                    strokeWidth="2.4"
                                  >
                                    <path d="M5 8l5 5 5-5"></path>
                                  </svg>
                                  {'\n                    '}
                                </button>
                                {'\n                    '}
                                <button
                                  onClick={toggleExport}
                                  className="h-[27px] py-[0] px-[9px] [border:1px_solid_#E4E4E8] bg-[#FFFFFF] rounded-[6px] text-[11.5px] text-[#3F3F46] font-[550] cursor-pointer flex items-center gap-[5px] hv-u4v0t1"
                                >
                                  {'\n                      Export\n                      '}
                                  <svg
                                    width="9"
                                    height="9"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    stroke="#A1A1AA"
                                    strokeWidth="2.4"
                                  >
                                    <path d="M5 8l5 5 5-5"></path>
                                  </svg>
                                  {'\n                    '}
                                </button>
                                {'\n                    '}
                                <button
                                  onClick={goRadar}
                                  className="h-[27px] py-[0] px-[10px] [border:1px_solid_#DDD6F3] bg-[#F5F1FD] rounded-[6px] text-[11.5px] text-[#5B21B6] font-[600] cursor-pointer flex items-center gap-[5px] hv-ttjng3"
                                >
                                  {'\n                      Open in Radar\n                      '}
                                  <svg
                                    width="10"
                                    height="10"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M7 13l6-6M8 7h5v5"></path>
                                  </svg>
                                  {'\n                    '}
                                </button>
                                {'\n                    '}
                                {importOpen ? (
                                  <>
                                    {'\n                      '}
                                    <div className="absolute top-[32px] right-[206px] w-[170px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[9px] shadow-[0_12px_30px_rgba(24,24,27,.13)] p-[4px] z-[30] [animation:pop_.13s_ease-out]">
                                      {'\n                        '}
                                      {(importItems ?? []).map((e: any, __i: number) => (
                                        <Fragment key={__i}>
                                          {'\n                          '}
                                          <div
                                            onClick={e.pick}
                                            className="py-[6px] px-[8px] rounded-[6px] text-[12px] text-[#3F3F46] cursor-pointer hv-u4v0t1"
                                          >
                                            <span>{e.label}</span>
                                          </div>
                                          {'\n                        '}
                                        </Fragment>
                                      ))}
                                      {'\n                      '}
                                    </div>
                                    {'\n                    '}
                                  </>
                                ) : null}
                                {'\n                    '}
                                {exportOpen ? (
                                  <>
                                    {'\n                      '}
                                    <div className="absolute top-[32px] right-[132px] w-[174px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[9px] shadow-[0_12px_30px_rgba(24,24,27,.13)] p-[4px] z-[30] [animation:pop_.13s_ease-out]">
                                      {'\n                        '}
                                      {(exportItems ?? []).map((e: any, __i: number) => (
                                        <Fragment key={__i}>
                                          {'\n                          '}
                                          <div
                                            onClick={e.pick}
                                            className="py-[6px] px-[8px] rounded-[6px] text-[12px] text-[#3F3F46] cursor-pointer hv-u4v0t1"
                                          >
                                            <span>{e.label}</span>
                                          </div>
                                          {'\n                        '}
                                        </Fragment>
                                      ))}
                                      {'\n                      '}
                                    </div>
                                    {'\n                    '}
                                  </>
                                ) : null}
                                {'\n                  '}
                              </div>
                              {'\n                '}
                            </div>
  )
}
