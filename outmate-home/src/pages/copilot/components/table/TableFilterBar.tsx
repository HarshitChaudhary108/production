import { Fragment } from 'react'
import { cssToObj } from '../../../../lib/css'
import type { CopilotValues } from '../../types'

export function TableFilterBar({ m }: { m: CopilotValues }) {
  const { columnToggles, columnsOpen, filterBadge, filterBtnStyle, filterOpen, filters, onRowSearch, quickChips, rowSearch, sortLabel, sortOpen, sorts, toggleColumns, toggleFilter, toggleSort } = m
  return (
    <div className="flex items-center gap-[7px] py-[8px] px-[12px] [border-bottom:1px_solid_#EFEFF2]">
                              {'\n                  '}
                              <div className="flex items-center gap-[6px] h-[26px] py-[0] px-[8px] [border:1px_solid_#E8E8EC] rounded-[6px] bg-[#FBFBFC] w-[168px]">
                                {'\n                    '}
                                <svg
                                  width="11"
                                  height="11"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  stroke="#A1A1AA"
                                  strokeWidth="1.8"
                                >
                                  <circle cx="9" cy="9" r="5.6"></circle>
                                  <path d="M13.2 13.2L17 17"></path>
                                </svg>
                                {'\n                    '}
                                <input
                                  onChange={onRowSearch}
                                  value={rowSearch}
                                  placeholder="Search rows"
                                  className="[border:none] outline-none bg-transparent text-[11.5px] w-full text-[#3F3F46]"
                                />
                                {'\n                  '}
                              </div>
                              {'\n                  '}
                              <div className="relative flex gap-[6px]">
                                {'\n                    '}
                                <button onClick={toggleFilter} style={cssToObj(filterBtnStyle)}>
                                  {'\n                      '}
                                  <svg
                                    width="11"
                                    height="11"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                  >
                                    <path d="M3 5h14l-5.4 6v5l-3.2 1.6V11z"></path>
                                  </svg>
                                  {'\n                      Filter '}
                                  <span>{filterBadge}</span>
                                  {'\n                    '}
                                </button>
                                {'\n                    '}
                                <button
                                  onClick={toggleSort}
                                  className="h-[26px] py-[0] px-[9px] [border:1px_solid_#E4E4E8] bg-[#FFFFFF] rounded-[6px] text-[11.5px] text-[#3F3F46] cursor-pointer flex items-center gap-[5px] hv-u4v0t1"
                                >
                                  {'\n                      '}
                                  <svg
                                    width="11"
                                    height="11"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                  >
                                    <path d="M6 4v12M3 13l3 3 3-3M14 16V4M11 7l3-3 3 3"></path>
                                  </svg>
                                  {'\n                      '}
                                  <span>{sortLabel}</span>
                                  {'\n                    '}
                                </button>
                                {'\n                    '}
                                <button
                                  onClick={toggleColumns}
                                  className="h-[26px] py-[0] px-[9px] [border:1px_solid_#E4E4E8] bg-[#FFFFFF] rounded-[6px] text-[11.5px] text-[#3F3F46] cursor-pointer flex items-center gap-[5px] hv-u4v0t1"
                                >
                                  {'\n                      '}
                                  <svg
                                    width="11"
                                    height="11"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                  >
                                    <rect x="3" y="4" width="14" height="12" rx="2"></rect>
                                    <path d="M8 4v12M13 4v12"></path>
                                  </svg>
                                  {'\n                      Columns\n                    '}
                                </button>
                                {'\n                    '}
                                {filterOpen ? (
                                  <>
                                    {'\n                      '}
                                    <div className="absolute top-[31px] left-[0] w-[204px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[9px] shadow-[0_12px_30px_rgba(24,24,27,.13)] p-[5px] z-[35] [animation:pop_.13s_ease-out]">
                                      {'\n                        '}
                                      <div className="pt-[6px] px-[8px] pb-[4px] text-[10px] font-[650] text-[#A1A1AA] tracking-[.05em] uppercase">
                                        {'Quick filters'}
                                      </div>
                                      {'\n                        '}
                                      {(filters ?? []).map((f: any, __i: number) => (
                                        <Fragment key={__i}>
                                          {'\n                          '}
                                          <div
                                            onClick={f.pick}
                                            className="hv-u4v0t1"
                                            style={cssToObj(
                                              `display:flex; align-items:center; justify-content:space-between; padding:6px 8px; border-radius:6px; cursor:pointer; font-size:12px; color:${f.color}; font-weight:${f.weight}`,
                                            )}
                                          >
                                            {'\n                            '}
                                            <span>
                                              <span>{f.label}</span>
                                            </span>
                                            {'\n                            '}
                                            <span className="text-[10.5px] text-[#A1A1AA] tabular-nums">
                                              <span>{f.count}</span>
                                            </span>
                                            {'\n                          '}
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
                                {sortOpen ? (
                                  <>
                                    {'\n                      '}
                                    <div className="absolute top-[31px] left-[78px] w-[180px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[9px] shadow-[0_12px_30px_rgba(24,24,27,.13)] p-[5px] z-[35] [animation:pop_.13s_ease-out]">
                                      {'\n                        '}
                                      {(sorts ?? []).map((f: any, __i: number) => (
                                        <Fragment key={__i}>
                                          {'\n                          '}
                                          <div
                                            onClick={f.pick}
                                            className="hv-u4v0t1"
                                            style={cssToObj(
                                              `display:flex; align-items:center; justify-content:space-between; padding:6px 8px; border-radius:6px; cursor:pointer; font-size:12px; color:${f.color}; font-weight:${f.weight}`,
                                            )}
                                          >
                                            {'\n                            '}
                                            <span>
                                              <span>{f.label}</span>
                                            </span>
                                            {'\n                            '}
                                            <span className="text-[#6D28D9] text-[11px]">
                                              <span>{f.check}</span>
                                            </span>
                                            {'\n                          '}
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
                                {columnsOpen ? (
                                  <>
                                    {'\n                      '}
                                    <div className="absolute top-[31px] left-[160px] w-[196px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[9px] shadow-[0_12px_30px_rgba(24,24,27,.13)] p-[5px] z-[35] [animation:pop_.13s_ease-out] [max-height:280px] overflow-y-auto">
                                      {'\n                        '}
                                      <div className="pt-[6px] px-[8px] pb-[4px] text-[10px] font-[650] text-[#A1A1AA] tracking-[.05em] uppercase">
                                        {'Visible columns'}
                                      </div>
                                      {'\n                        '}
                                      {(columnToggles ?? []).map((c: any, __i: number) => (
                                        <Fragment key={__i}>
                                          {'\n                          '}
                                          <div
                                            onClick={c.pick}
                                            className="flex items-center gap-[8px] py-[6px] px-[8px] rounded-[6px] cursor-pointer text-[12px] text-[#3F3F46] hv-u4v0t1"
                                          >
                                            {'\n                            '}
                                            <span
                                              style={cssToObj(
                                                `width:14px; height:14px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:9px; color:#FFFFFF; border:1px solid ${c.boxBorder}; background:${c.boxBg}`,
                                              )}
                                            >
                                              <span>{c.check}</span>
                                            </span>
                                            {'\n                            '}
                                            <span>{c.label}</span>
                                            {'\n                          '}
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
                              {'\n                  '}
                              <div className="ml-[auto] flex items-center gap-[5px] overflow-x-auto">
                                {'\n                    '}
                                {(quickChips ?? []).map((f: any, __i: number) => (
                                  <Fragment key={__i}>
                                    {'\n                      '}
                                    <span onClick={f.pick} style={cssToObj(f.style)}>
                                      <span>{f.label}</span>
                                    </span>
                                    {'\n                    '}
                                  </Fragment>
                                ))}
                                {'\n                  '}
                              </div>
                              {'\n                '}
                            </div>
  )
}
