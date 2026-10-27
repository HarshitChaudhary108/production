import { Fragment } from 'react'
import { cssToObj } from '../../../../lib/css'
import type { CopilotValues } from '../../types'

export function CompaniesSheet({ m }: { m: CopilotValues }) {
  const { gridCols, headCells, rows, tableMinWidth } = m
  return (
    <>
                                {'\n                  '}
                                <div className="overflow-x-auto">
                                  {'\n                    '}
                                  <div style={cssToObj(`min-width:${tableMinWidth}`)}>
                                    {'\n                      '}
                                    <div
                                      style={cssToObj(
                                        `display:grid; grid-template-columns:${gridCols}; background:#F7F7F9; border-bottom:1px solid #EFEFF2; position:sticky; top:0`,
                                      )}
                                    >
                                      {'\n                        '}
                                      {(headCells ?? []).map((c: any, __i: number) => (
                                        <Fragment key={__i}>
                                          {'\n                          '}
                                          <div className="py-[7px] px-[10px] text-[10px] font-[650] text-[#71717A] tracking-[.04em] uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                                            <span>{c.label}</span>
                                          </div>
                                          {'\n                        '}
                                        </Fragment>
                                      ))}
                                      {'\n                      '}
                                    </div>
                                    {'\n                      '}
                                    {(rows ?? []).map((r: any, __i: number) => (
                                      <Fragment key={__i}>
                                        {'\n                        '}
                                        <div
                                          onClick={r.open}
                                          className="hv-udcbnc"
                                          style={cssToObj(
                                            `display:grid; grid-template-columns:${gridCols}; border-bottom:1px solid #F4F4F6; cursor:pointer; background:${r.rowBg}`,
                                          )}
                                        >
                                          {'\n                          '}
                                          {(r.cells ?? []).map((c: any, __i: number) => (
                                            <Fragment key={__i}>
                                              {'\n                            '}
                                              <div className="py-[8px] px-[10px] flex items-center [min-width:0] gap-[7px]">
                                                {'\n\n                              '}
                                                {c.isCheck ? (
                                                  <>
                                                    {'\n                                '}
                                                    <span
                                                      onClick={c.toggle}
                                                      style={cssToObj(
                                                        `width:14px; height:14px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:9px; color:#FFFFFF; border:1px solid ${c.boxBorder}; background:${c.boxBg}`,
                                                      )}
                                                    >
                                                      <span>{c.check}</span>
                                                    </span>
                                                    {'\n                              '}
                                                  </>
                                                ) : null}
                                                {'\n\n                              '}
                                                {c.isCompany ? (
                                                  <>
                                                    {'\n                                '}
                                                    <span className="flex items-center gap-[8px] [min-width:0]">
                                                      {'\n                                  '}
                                                      <span
                                                        style={cssToObj(
                                                          `width:22px; height:22px; border-radius:6px; flex:none; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:#FFFFFF; background:${c.logoBg}`,
                                                        )}
                                                      >
                                                        <span>{c.logo}</span>
                                                      </span>
                                                      {'\n                                  '}
                                                      <span className="[min-width:0] flex flex-col">
                                                        {'\n                                    '}
                                                        <span className="text-[12.5px] font-[600] text-[#18181B] overflow-hidden text-ellipsis whitespace-nowrap">
                                                          <span>{c.name}</span>
                                                        </span>
                                                        {'\n                                    '}
                                                        <span className="text-[10.5px] text-[#A1A1AA] overflow-hidden text-ellipsis whitespace-nowrap">
                                                          <span>{c.domain}</span>
                                                          {' · '}
                                                          <span>{c.size}</span>
                                                        </span>
                                                        {'\n                                  '}
                                                      </span>
                                                      {'\n                                '}
                                                    </span>
                                                    {'\n                              '}
                                                  </>
                                                ) : null}
                                                {'\n\n                              '}
                                                {c.isPerson ? (
                                                  <>
                                                    {'\n                                '}
                                                    <span className="flex items-center gap-[7px] [min-width:0]">
                                                      {'\n                                  '}
                                                      <span
                                                        style={cssToObj(
                                                          `width:20px; height:20px; border-radius:50%; flex:none; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:650; color:#3F3F46; background:${c.avBg}`,
                                                        )}
                                                      >
                                                        <span>{c.initials}</span>
                                                      </span>
                                                      {'\n                                  '}
                                                      <span className="[min-width:0] flex flex-col">
                                                        {'\n                                    '}
                                                        <span className="text-[12px] font-[550] text-[#27272A] overflow-hidden text-ellipsis whitespace-nowrap">
                                                          <span>{c.name}</span>
                                                        </span>
                                                        {'\n                                    '}
                                                        <span className="text-[10.5px] text-[#A1A1AA] overflow-hidden text-ellipsis whitespace-nowrap">
                                                          <span>{c.role}</span>
                                                        </span>
                                                        {'\n                                  '}
                                                      </span>
                                                      {'\n                                '}
                                                    </span>
                                                    {'\n                              '}
                                                  </>
                                                ) : null}
                                                {'\n\n                              '}
                                                {c.isEmail ? (
                                                  <>
                                                    {'\n                                '}
                                                    <span className="flex items-center gap-[6px] [min-width:0]">
                                                      {'\n                                  '}
                                                      <span className="text-[11px] text-[#52525B] [font-family:'JetBrains_Mono',_monospace] overflow-hidden text-ellipsis whitespace-nowrap">
                                                        <span>{c.value}</span>
                                                      </span>
                                                      {'\n                                  '}
                                                      <span style={cssToObj(c.statusStyle)}>
                                                        <span>{c.status}</span>
                                                      </span>
                                                      {'\n                                '}
                                                    </span>
                                                    {'\n                              '}
                                                  </>
                                                ) : null}
                                                {'\n\n                              '}
                                                {c.isSignals ? (
                                                  <>
                                                    {'\n                                '}
                                                    <span className="flex items-center gap-[4px] flex-wrap">
                                                      {'\n                                  '}
                                                      {(c.list ?? []).map((s: any, __i: number) => (
                                                        <Fragment key={__i}>
                                                          {'\n                                    '}
                                                          <span style={cssToObj(s.style)}>
                                                            <span>{s.label}</span>
                                                          </span>
                                                          {'\n                                  '}
                                                        </Fragment>
                                                      ))}
                                                      {'\n                                '}
                                                    </span>
                                                    {'\n                              '}
                                                  </>
                                                ) : null}
                                                {'\n\n                              '}
                                                {c.isScore ? (
                                                  <>
                                                    {'\n                                '}
                                                    <span className="flex flex-col gap-[3px] w-full">
                                                      {'\n                                  '}
                                                      <span
                                                        style={cssToObj(
                                                          `font-size:11.5px; font-weight:600; color:${c.color}; font-variant-numeric:tabular-nums`,
                                                        )}
                                                      >
                                                        <span>{c.value}</span>
                                                      </span>
                                                      {'\n                                  '}
                                                      <span className="h-[3px] rounded-[2px] bg-[#F1F1F3] overflow-hidden w-full">
                                                        {'\n                                    '}
                                                        <span
                                                          style={cssToObj(
                                                            `display:block; height:100%; border-radius:2px; background:${c.color}; width:${c.pct}`,
                                                          )}
                                                        ></span>
                                                        {'\n                                  '}
                                                      </span>
                                                      {'\n                                '}
                                                    </span>
                                                    {'\n                              '}
                                                  </>
                                                ) : null}
                                                {'\n\n                              '}
                                                {c.isText ? (
                                                  <>
                                                    {'\n                                '}
                                                    <span
                                                      style={cssToObj(
                                                        `font-size:11.5px; color:${c.color}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap`,
                                                      )}
                                                    >
                                                      <span>{c.value}</span>
                                                    </span>
                                                    {'\n                              '}
                                                  </>
                                                ) : null}
                                                {'\n\n                              '}
                                                {c.isBadge ? (
                                                  <>
                                                    {'\n                                '}
                                                    <span style={cssToObj(c.badgeStyle)}>
                                                      <span>{c.value}</span>
                                                    </span>
                                                    {'\n                              '}
                                                  </>
                                                ) : null}
                                                {'\n\n                              '}
                                                {c.isActions ? (
                                                  <>
                                                    {'\n                                '}
                                                    <span className="flex items-center gap-[4px]">
                                                      {'\n                                  '}
                                                      <span
                                                        onClick={c.preview}
                                                        title="Preview"
                                                        className="w-[22px] h-[22px] rounded-[5px] [border:1px_solid_#E8E8EC] flex items-center justify-center cursor-pointer bg-[#FFFFFF] hv-16bx3qz"
                                                      >
                                                        {'\n                                    '}
                                                        <svg
                                                          width="11"
                                                          height="11"
                                                          viewBox="0 0 20 20"
                                                          fill="none"
                                                          stroke="#6D28D9"
                                                          strokeWidth="1.6"
                                                        >
                                                          <path d="M2.5 10S5.4 5 10 5s7.5 5 7.5 5-2.9 5-7.5 5-7.5-5-7.5-5z"></path>
                                                          <circle cx="10" cy="10" r="2"></circle>
                                                        </svg>
                                                        {'\n                                  '}
                                                      </span>
                                                      {'\n                                  '}
                                                      <span
                                                        onClick={c.enrich}
                                                        title="Enrich"
                                                        className="w-[22px] h-[22px] rounded-[5px] [border:1px_solid_#E8E8EC] flex items-center justify-center cursor-pointer bg-[#FFFFFF] hv-16bx3qz"
                                                      >
                                                        {'\n                                    '}
                                                        <svg
                                                          width="11"
                                                          height="11"
                                                          viewBox="0 0 20 20"
                                                          fill="none"
                                                          stroke="#52525B"
                                                          strokeWidth="1.7"
                                                        >
                                                          <path d="M10 3.4l1.6 3.8 3.8 1.6-3.8 1.6L10 14.2l-1.6-3.8L4.6 8.8l3.8-1.6z"></path>
                                                        </svg>
                                                        {'\n                                  '}
                                                      </span>
                                                      {'\n                                  '}
                                                      <span
                                                        onClick={c.add}
                                                        title="Add to list"
                                                        className="w-[22px] h-[22px] rounded-[5px] [border:1px_solid_#E8E8EC] flex items-center justify-center cursor-pointer bg-[#FFFFFF] hv-16bx3qz"
                                                      >
                                                        {'\n                                    '}
                                                        <svg
                                                          width="11"
                                                          height="11"
                                                          viewBox="0 0 20 20"
                                                          fill="none"
                                                          stroke="#52525B"
                                                          strokeWidth="1.9"
                                                        >
                                                          <path d="M10 4.5v11M4.5 10h11"></path>
                                                        </svg>
                                                        {'\n                                  '}
                                                      </span>
                                                      {'\n                                '}
                                                    </span>
                                                    {'\n                              '}
                                                  </>
                                                ) : null}
                                                {'\n                            '}
                                              </div>
                                              {'\n                          '}
                                            </Fragment>
                                          ))}
                                          {'\n                        '}
                                        </div>
                                        {'\n                      '}
                                      </Fragment>
                                    ))}
                                    {'\n                    '}
                                  </div>
                                  {'\n                  '}
                                </div>
                                {'\n                '}
                              </>
  )
}
