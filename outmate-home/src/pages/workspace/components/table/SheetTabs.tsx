import { Fragment } from 'react'
import { cssToObj } from '../../../../lib/css'
import type { WorkspaceValues } from '../../types'

export function SheetTabs({ m }: { m: WorkspaceValues }) {
  const { addSheet, canSaveView, commitRename, onRenameDraft, renameDraft, saveView, sheetTabs, viewChips } = m
  return (
    <div className="flex-none flex items-center gap-[2px] py-[0] px-[16px] [border-bottom:1px_solid_#E5E5EA] bg-[#FAFAFB]">
                        {'\n            '}
                        {(sheetTabs ?? []).map((t: any, __i: number) => (
                          <Fragment key={__i}>
                            {'\n              '}
                            <div
                              data-sheet-tab={t.name}
                              onClick={t.pick}
                              style={cssToObj(`${t.style}; position:relative`)}
                            >
                              {'\n                '}
                              {t.renaming ? (
                                <>
                                  {'\n                  '}
                                  <input
                                    onChange={onRenameDraft}
                                    onBlur={commitRename}
                                    value={renameDraft}
                                    className="w-[88px] [border:1px_solid_#C9B6F5] rounded-[4px] outline-none text-[11.5px] py-[1px] px-[4px] text-[#18181B]"
                                  />
                                  {'\n                '}
                                </>
                              ) : null}
                              {'\n                '}
                              {t.renaming ? (
                                <>
                                  {'\n                  '}
                                  <span
                                    onClick={commitRename}
                                    className="text-[11px] text-[#6D28D9] font-[600] cursor-pointer"
                                  >
                                    {'Save'}
                                  </span>
                                  {'\n                '}
                                </>
                              ) : null}
                              {'\n                '}
                              {t.menuOpen ? (
                                <>
                                  {'\n                  '}
                                  <div className="absolute top-[32px] left-[0] w-[128px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[8px] shadow-[0_12px_30px_rgba(24,24,27,.15)] p-[4px] z-[40] [animation:pop_.12s_ease-out]">
                                    {'\n                    '}
                                    <div
                                      onClick={t.startRename}
                                      className="py-[6px] px-[8px] rounded-[5px] text-[11.5px] text-[#3F3F46] cursor-pointer hv-u4v0t1"
                                    >
                                      {'Rename'}
                                    </div>
                                    {'\n                    '}
                                    <div
                                      onClick={t.del}
                                      className="py-[6px] px-[8px] rounded-[5px] text-[11.5px] text-[#B91C1C] cursor-pointer hv-ug5na5"
                                    >
                                      {'Delete'}
                                    </div>
                                    {'\n                  '}
                                  </div>
                                  {'\n                '}
                                </>
                              ) : null}
                              {'\n                '}
                              <span>{t.name}</span>
                              {'\n                '}
                              <span className="text-[9.5px] text-[#A1A1AA] tabular-nums">
                                <span>{t.count}</span>
                              </span>
                              {'\n                '}
                              {t.custom ? (
                                <>
                                  {'\n                  '}
                                  <span
                                    onClick={t.menu}
                                    className="w-[16px] h-[16px] flex items-center justify-center rounded-[4px] text-[#B4B4BB] text-[12px] leading-[1] hv-q1v9ly"
                                  >
                                    {'⋯'}
                                  </span>
                                  {'\n                '}
                                </>
                              ) : null}
                              {'\n              '}
                            </div>
                            {'\n            '}
                          </Fragment>
                        ))}
                        {'\n            '}
                        <span
                          onClick={addSheet}
                          title="New table"
                          className="ml-[6px] w-[20px] h-[20px] flex items-center justify-center rounded-[5px] text-[#A1A1AA] text-[14px] cursor-pointer hv-q1v9ly"
                        >
                          {'+'}
                        </span>
                        {'\n            '}
                        <div className="ml-[auto] flex items-center gap-[5px] py-[5px] px-[0] overflow-x-auto">
                          {'\n              '}
                          {(viewChips ?? []).map((f: any, __i: number) => (
                            <Fragment key={__i}>
                              {'\n                '}
                              <span
                                onClick={f.pick}
                                style={cssToObj(
                                  `${f.style}; display:inline-flex; align-items:center; gap:4px`,
                                )}
                              >
                                {'\n                  '}
                                <span>{f.label}</span>
                                {'\n                  '}
                                {f.custom ? (
                                  <>
                                    {'\n                    '}
                                    <span
                                      onClick={f.remove}
                                      className="text-[#A1A1AA] text-[11px] leading-[1]"
                                    >
                                      {'×'}
                                    </span>
                                    {'\n                  '}
                                  </>
                                ) : null}
                                {'\n                '}
                              </span>
                              {'\n              '}
                            </Fragment>
                          ))}
                          {'\n              '}
                          {canSaveView ? (
                            <>
                              {'\n                '}
                              <span
                                onClick={saveView}
                                className="py-[3px] px-[8px] rounded-[5px] text-[10.5px] font-[600] cursor-pointer whitespace-nowrap [border:1px_dashed_#C9B6F5] text-[#5B21B6] bg-[#FFFFFF]"
                              >
                                {'+ Save view'}
                              </span>
                              {'\n              '}
                            </>
                          ) : null}
                          {'\n            '}
                        </div>
                        {'\n          '}
                      </div>
  )
}
