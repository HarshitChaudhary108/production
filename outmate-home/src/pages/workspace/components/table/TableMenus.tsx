import { Fragment } from 'react'
import { cssToObj } from '../../../../lib/css'
import type { WorkspaceValues } from '../../types'

export function ImportMenu({ m }: { m: WorkspaceValues }) {
  const { importItems } = m
  return (
    <>
                            {'\n              '}
                            <div className="absolute top-[calc(100%_+_2px)] left-[216px] w-[176px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[9px] shadow-[0_14px_34px_rgba(24,24,27,.14)] p-[4px] z-[45] [animation:pop_.13s_ease-out]">
                              {'\n                '}
                              {(importItems ?? []).map((e: any, __i: number) => (
                                <Fragment key={__i}>
                                  {'\n                  '}
                                  <div
                                    onClick={e.pick}
                                    className="py-[6px] px-[8px] rounded-[6px] text-[11.5px] text-[#3F3F46] cursor-pointer hv-u4v0t1"
                                  >
                                    <span>{e.label}</span>
                                  </div>
                                  {'\n                '}
                                </Fragment>
                              ))}
                              {'\n              '}
                            </div>
                            {'\n            '}
                          </>
  )
}

export function ExportMenu({ m }: { m: WorkspaceValues }) {
  const { exportItems } = m
  return (
    <>
                            {'\n              '}
                            <div className="absolute top-[calc(100%_+_2px)] left-[300px] w-[180px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[9px] shadow-[0_14px_34px_rgba(24,24,27,.14)] p-[4px] z-[45] [animation:pop_.13s_ease-out]">
                              {'\n                '}
                              {(exportItems ?? []).map((e: any, __i: number) => (
                                <Fragment key={__i}>
                                  {'\n                  '}
                                  <div
                                    onClick={e.pick}
                                    className="py-[6px] px-[8px] rounded-[6px] text-[11.5px] text-[#3F3F46] cursor-pointer hv-u4v0t1"
                                  >
                                    <span>{e.label}</span>
                                  </div>
                                  {'\n                '}
                                </Fragment>
                              ))}
                              {'\n              '}
                            </div>
                            {'\n            '}
                          </>
  )
}

export function SortMenu({ m }: { m: WorkspaceValues }) {
  const { sortDirLabel, sorts, toggleSortDir } = m
  return (
    <>
                            {'\n              '}
                            <div className="absolute top-[calc(100%_+_2px)] right-[90px] w-[220px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[10px] shadow-[0_16px_40px_rgba(24,24,27,.15)] z-[45] [animation:pop_.13s_ease-out] overflow-hidden">
                              {'\n                '}
                              <div className="p-[5px]">
                                {'\n                  '}
                                {(sorts ?? []).map((f: any, __i: number) => (
                                  <Fragment key={__i}>
                                    {'\n                    '}
                                    <div
                                      onClick={f.pick}
                                      className="hv-u69wm2"
                                      style={cssToObj(
                                        `display:flex; align-items:center; justify-content:space-between; padding:6px 8px; border-radius:6px; cursor:pointer; font-size:11.5px; color:${f.color}; font-weight:${f.weight}`,
                                      )}
                                    >
                                      {'\n                      '}
                                      <span>
                                        <span>{f.label}</span>
                                      </span>
                                      <span className="text-[#6D28D9]">
                                        <span>{f.check}</span>
                                      </span>
                                      {'\n                    '}
                                    </div>
                                    {'\n                  '}
                                  </Fragment>
                                ))}
                                {'\n                '}
                              </div>
                              {'\n                '}
                              <div
                                onClick={toggleSortDir}
                                className="py-[8px] px-[11px] [border-top:1px_solid_#F1F1F3] bg-[#FAFAFB] flex justify-between cursor-pointer text-[11px] text-[#3F3F46] hv-u45kwi"
                              >
                                {'\n                  '}
                                <span>{'Direction'}</span>
                                <span className="font-[650] text-[#5B21B6]">
                                  <span>{sortDirLabel}</span>
                                </span>
                                {'\n                '}
                              </div>
                              {'\n              '}
                            </div>
                            {'\n            '}
                          </>
  )
}

export function FilterMenu({ m }: { m: WorkspaceValues }) {
  const { clearFilters, filterRules, filterSummary } = m
  return (
    <>
                            {'\n              '}
                            <div className="absolute top-[calc(100%_+_2px)] right-[150px] w-[264px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[10px] shadow-[0_16px_40px_rgba(24,24,27,.15)] z-[45] [animation:pop_.13s_ease-out] overflow-hidden">
                              {'\n                '}
                              <div className="py-[9px] px-[11px] [border-bottom:1px_solid_#F1F1F3] text-[11.5px] font-[650]">
                                {'Filters'}
                              </div>
                              {'\n                '}
                              <div className="p-[5px]">
                                {'\n                  '}
                                {(filterRules ?? []).map((f: any, __i: number) => (
                                  <Fragment key={__i}>
                                    {'\n                    '}
                                    <div
                                      onClick={f.pick}
                                      className="flex items-center gap-[8px] py-[6px] px-[7px] rounded-[6px] cursor-pointer hv-u69wm2"
                                    >
                                      {'\n                      '}
                                      <span
                                        style={cssToObj(
                                          `width:14px; height:14px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:9px; color:#FFFFFF; border:1px solid ${f.boxBorder}; background:${f.boxBg}`,
                                        )}
                                      >
                                        <span>{f.check}</span>
                                      </span>
                                      {'\n                      '}
                                      <span className="flex-1 text-[11.5px] text-[#3F3F46]">
                                        <span>{f.label}</span>
                                      </span>
                                      {'\n                      '}
                                      <span className="text-[10.5px] text-[#A1A1AA] tabular-nums">
                                        <span>{f.count}</span>
                                      </span>
                                      {'\n                    '}
                                    </div>
                                    {'\n                  '}
                                  </Fragment>
                                ))}
                                {'\n                '}
                              </div>
                              {'\n                '}
                              <div className="py-[8px] px-[11px] [border-top:1px_solid_#F1F1F3] bg-[#FAFAFB] flex justify-between items-center">
                                {'\n                  '}
                                <span className="text-[10.5px] text-[#8E8E96]">
                                  <span>{filterSummary}</span>
                                </span>
                                {'\n                  '}
                                <span
                                  onClick={clearFilters}
                                  className="text-[11px] text-[#6D28D9] font-[600] cursor-pointer"
                                >
                                  {'Clear'}
                                </span>
                                {'\n                '}
                              </div>
                              {'\n              '}
                            </div>
                            {'\n            '}
                          </>
  )
}

export function ColumnsMenu({ m }: { m: WorkspaceValues }) {
  const { columnToggles, hideAllCols, showAllCols } = m
  return (
    <>
                            {'\n              '}
                            <div className="absolute top-[calc(100%_+_2px)] right-[16px] w-[264px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[10px] shadow-[0_16px_40px_rgba(24,24,27,.15)] z-[45] [animation:pop_.13s_ease-out] overflow-hidden">
                              {'\n                '}
                              <div className="flex items-center justify-between py-[9px] px-[11px] [border-bottom:1px_solid_#F1F1F3]">
                                {'\n                  '}
                                <span className="text-[11.5px] font-[650]">{'Column visibility'}</span>
                                {'\n                  '}
                                <span className="flex gap-[8px]">
                                  {'\n                    '}
                                  <span
                                    onClick={showAllCols}
                                    className="text-[11px] text-[#6D28D9] font-[600] cursor-pointer"
                                  >
                                    {'Show all'}
                                  </span>
                                  {'\n                    '}
                                  <span
                                    onClick={hideAllCols}
                                    className="text-[11px] text-[#8E8E96] font-[600] cursor-pointer"
                                  >
                                    {'Hide all'}
                                  </span>
                                  {'\n                  '}
                                </span>
                                {'\n                '}
                              </div>
                              {'\n                '}
                              <div className="[max-height:300px] overflow-y-auto p-[4px]">
                                {'\n                  '}
                                {(columnToggles ?? []).map((c: any, __i: number) => (
                                  <Fragment key={__i}>
                                    {'\n                    '}
                                    <div className="flex items-center gap-[7px] py-[5px] px-[7px] rounded-[6px] hv-u69wm2">
                                      {'\n                      '}
                                      <span className="text-[#C4C4CB] text-[11px] cursor-grab">
                                        {'⠿'}
                                      </span>
                                      {'\n                      '}
                                      <span
                                        onClick={c.pick}
                                        style={cssToObj(
                                          `flex:1; font-size:11.5px; color:${c.color}; cursor:pointer`,
                                        )}
                                      >
                                        <span>{c.label}</span>
                                      </span>
                                      {'\n                      '}
                                      <span
                                        onClick={c.up}
                                        className="w-[16px] h-[16px] flex items-center justify-center rounded-[4px] text-[#A1A1AA] text-[9px] cursor-pointer hv-p5cy1p"
                                      >
                                        {'▲'}
                                      </span>
                                      {'\n                      '}
                                      <span
                                        onClick={c.down}
                                        className="w-[16px] h-[16px] flex items-center justify-center rounded-[4px] text-[#A1A1AA] text-[9px] cursor-pointer hv-p5cy1p"
                                      >
                                        {'▼'}
                                      </span>
                                      {'\n                      '}
                                      <span
                                        onClick={c.pick}
                                        className="w-[18px] h-[18px] flex items-center justify-center cursor-pointer"
                                      >
                                        {'\n                        '}
                                        <svg
                                          width="13"
                                          height="13"
                                          viewBox="0 0 20 20"
                                          fill="none"
                                          stroke={c.eyeColor}
                                          strokeWidth="1.6"
                                        >
                                          <path d="M2.5 10S5.4 5 10 5s7.5 5 7.5 5-2.9 5-7.5 5-7.5-5-7.5-5z"></path>
                                          <circle cx="10" cy="10" r="2"></circle>
                                        </svg>
                                        {'\n                      '}
                                      </span>
                                      {'\n                    '}
                                    </div>
                                    {'\n                  '}
                                  </Fragment>
                                ))}
                                {'\n                '}
                              </div>
                              {'\n              '}
                            </div>
                            {'\n            '}
                          </>
  )
}

export function RunPanel({ m }: { m: WorkspaceValues }) {
  const { cancelRun, pauseLabel, pauseRun, runPct, runState, runStateColor, runStats, runSteps } = m
  return (
    <>
                            {'\n              '}
                            <div className="absolute top-[calc(100%_+_2px)] right-[16px] w-[284px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[11px] shadow-[0_16px_40px_rgba(24,24,27,.15)] z-[46] [animation:pop_.13s_ease-out] overflow-hidden">
                              {'\n                '}
                              <div className="py-[10px] px-[12px] [border-bottom:1px_solid_#F1F1F3] flex items-center justify-between">
                                {'\n                  '}
                                <span className="text-[11.5px] font-[650]">{'Pipeline status'}</span>
                                {'\n                  '}
                                <span
                                  style={cssToObj(
                                    `font-size:10.5px; color:${runStateColor}; font-weight:650`,
                                  )}
                                >
                                  <span>{runState}</span>
                                </span>
                                {'\n                '}
                              </div>
                              {'\n                '}
                              <div className="py-[10px] px-[12px] flex flex-col gap-[9px]">
                                {'\n                  '}
                                <div className="grid [grid-template-columns:1fr_1fr] gap-[7px]">
                                  {'\n                    '}
                                  {(runStats ?? []).map((r: any, __i: number) => (
                                    <Fragment key={__i}>
                                      {'\n                      '}
                                      <div className="[border:1px_solid_#EDEDF0] rounded-[7px] py-[7px] px-[9px]">
                                        {'\n                        '}
                                        <div className="text-[9.5px] text-[#A1A1AA] uppercase tracking-[.05em] font-[650]">
                                          <span>{r.label}</span>
                                        </div>
                                        {'\n                        '}
                                        <div
                                          style={cssToObj(
                                            `font-size:13px; font-weight:650; font-variant-numeric:tabular-nums; color:${r.color}`,
                                          )}
                                        >
                                          <span>{r.value}</span>
                                        </div>
                                        {'\n                      '}
                                      </div>
                                      {'\n                    '}
                                    </Fragment>
                                  ))}
                                  {'\n                  '}
                                </div>
                                {'\n                  '}
                                <div className="h-[4px] rounded-[3px] bg-[#F1F1F3] overflow-hidden">
                                  {'\n                    '}
                                  <div
                                    style={cssToObj(
                                      `height:100%; border-radius:3px; background:#6D28D9; width:${runPct}`,
                                    )}
                                  ></div>
                                  {'\n                  '}
                                </div>
                                {'\n                  '}
                                {(runSteps ?? []).map((s: any, __i: number) => (
                                  <Fragment key={__i}>
                                    {'\n                    '}
                                    <div className="flex items-center gap-[8px]">
                                      {'\n                      '}
                                      <span
                                        style={cssToObj(
                                          `font-size:11px; color:${s.iconColor}; width:12px; text-align:center`,
                                        )}
                                      >
                                        <span>{s.icon}</span>
                                      </span>
                                      {'\n                      '}
                                      <span
                                        style={cssToObj(
                                          `font-size:11.5px; color:${s.color}; font-weight:${s.weight}`,
                                        )}
                                      >
                                        <span>{s.label}</span>
                                      </span>
                                      {'\n                      '}
                                      <span className="ml-[auto] text-[10.5px] text-[#A1A1AA] tabular-nums">
                                        <span>{s.meta}</span>
                                      </span>
                                      {'\n                    '}
                                    </div>
                                    {'\n                  '}
                                  </Fragment>
                                ))}
                                {'\n                  '}
                                <div className="flex gap-[6px] pt-[3px]">
                                  {'\n                    '}
                                  <button
                                    onClick={pauseRun}
                                    className="flex-1 h-[26px] [border:1px_solid_#E4E4E8] bg-[#FFFFFF] rounded-[6px] text-[11px] text-[#3F3F46] cursor-pointer font-[550] hv-u4v0t1"
                                  >
                                    <span>{pauseLabel}</span>
                                  </button>
                                  {'\n                    '}
                                  <button
                                    onClick={cancelRun}
                                    className="flex-1 h-[26px] [border:1px_solid_#E4E4E8] bg-[#FFFFFF] rounded-[6px] text-[11px] text-[#B91C1C] cursor-pointer font-[550] hv-ug5na5"
                                  >
                                    {'Cancel'}
                                  </button>
                                  {'\n                  '}
                                </div>
                                {'\n                '}
                              </div>
                              {'\n              '}
                            </div>
                            {'\n            '}
                          </>
  )
}
