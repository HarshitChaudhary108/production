import { Fragment } from 'react'
import { cssToObj } from '../../../lib/css'
import type { CopilotValues } from '../types'

export function Sidebar({ m }: { m: CopilotValues }) {
  const { convSearch, goRadar, historyToday, historyYesterday, newChat, onSearchConv, todayCount } = m
  return (
    <>
                  {'\n      '}
                  <aside className="w-[230px] flex-none bg-[#FBFBFC] [border-right:1px_solid_#E8E8EC] flex flex-col [min-height:0]">
                    {'\n        '}
                    <div className="pt-[12px] px-[12px] pb-[10px] flex flex-col gap-[9px]">
                      {'\n          '}
                      <button
                        onClick={newChat}
                        className="flex items-center justify-center gap-[7px] h-[32px] [border:1px_solid_#DDD6F3] bg-[#F5F1FD] text-[#5B21B6] rounded-[8px] text-[12.5px] font-[600] cursor-pointer hv-ttjng3"
                      >
                        {'\n            '}
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M10 4.5v11M4.5 10h11"></path>
                        </svg>
                        {'\n            New chat\n          '}
                      </button>
                      {'\n          '}
                      <div className="flex items-center gap-[6px] h-[29px] py-[0] px-[9px] [border:1px_solid_#E8E8EC] rounded-[7px] bg-[#FFFFFF]">
                        {'\n            '}
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="#A1A1AA"
                          strokeWidth="1.7"
                        >
                          <circle cx="9" cy="9" r="5.6"></circle>
                          <path d="M13.2 13.2L17 17"></path>
                        </svg>
                        {'\n            '}
                        <input
                          onChange={onSearchConv}
                          value={convSearch}
                          placeholder="Search conversations"
                          className="[border:none] outline-none bg-transparent text-[11.5px] w-full text-[#3F3F46]"
                        />
                        {'\n          '}
                      </div>
                      {'\n        '}
                    </div>
                    {'\n\n        '}
                    <div className="pt-[0] px-[8px] pb-[12px] overflow-y-auto [min-height:0] flex-1">
                      {'\n          '}
                      <div className="flex items-center justify-between pt-[8px] px-[8px] pb-[5px]">
                        {'\n            '}
                        <span className="text-[10.5px] font-[650] text-[#A1A1AA] tracking-[.05em] uppercase">
                          {'Today'}
                        </span>
                        {'\n            '}
                        <span className="text-[10px] text-[#B4B4BB] tabular-nums">
                          <span>{todayCount}</span>
                        </span>
                        {'\n          '}
                      </div>
                      {'\n          '}
                      {(historyToday ?? []).map((h: any, __i: number) => (
                        <Fragment key={__i}>
                          {'\n            '}
                          <div
                            onClick={h.open}
                            className="hv-u2196x"
                            style={cssToObj(
                              `position:relative; display:flex; align-items:flex-start; gap:8px; padding:7px 8px; border-radius:7px; cursor:pointer; margin-bottom:1px; background:${h.bg}`,
                            )}
                          >
                            {'\n              '}
                            <div
                              style={cssToObj(
                                `width:3px; align-self:stretch; border-radius:2px; margin-top:1px; background:${h.bar}`,
                              )}
                            ></div>
                            {'\n              '}
                            <div className="[min-width:0] flex-1">
                              {'\n                '}
                              <div
                                style={cssToObj(
                                  `font-size:12px; font-weight:${h.weight}; color:${h.color}; line-height:1.35; overflow:hidden; text-overflow:ellipsis; white-space:nowrap`,
                                )}
                              >
                                <span>{h.title}</span>
                              </div>
                              {'\n                '}
                              <div className="flex items-center gap-[5px] mt-[2px]">
                                {'\n                  '}
                                {h.running ? (
                                  <>
                                    {'\n                    '}
                                    <span className="w-[5px] h-[5px] rounded-full bg-[#22A15D] [animation:pulse_1.6s_ease-in-out_infinite]"></span>
                                    {'\n                  '}
                                  </>
                                ) : null}
                                {'\n                  '}
                                <span className="text-[10.5px] text-[#A1A1AA]">
                                  <span>{h.meta}</span>
                                </span>
                                {'\n                '}
                              </div>
                              {'\n              '}
                            </div>
                            {'\n              '}
                            <span
                              onClick={h.menu}
                              className="w-[18px] h-[18px] flex items-center justify-center rounded-[4px] text-[#B4B4BB] text-[13px] leading-[1] flex-none hv-1wubm68"
                            >
                              {'⋯'}
                            </span>
                            {'\n              '}
                            {h.menuOpen ? (
                              <>
                                {'\n                '}
                                <div className="absolute top-[30px] right-[6px] w-[136px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[8px] shadow-[0_10px_26px_rgba(24,24,27,.14)] p-[4px] z-[30] [animation:pop_.12s_ease-out]">
                                  {'\n                  '}
                                  <div
                                    onClick={h.closeMenu}
                                    className="py-[6px] px-[8px] rounded-[5px] text-[11.5px] text-[#3F3F46] cursor-pointer hv-u4v0t1"
                                  >
                                    {'Rename'}
                                  </div>
                                  {'\n                  '}
                                  <div
                                    onClick={h.closeMenu}
                                    className="py-[6px] px-[8px] rounded-[5px] text-[11.5px] text-[#3F3F46] cursor-pointer hv-u4v0t1"
                                  >
                                    {'Duplicate'}
                                  </div>
                                  {'\n                  '}
                                  <div
                                    onClick={h.closeMenu}
                                    className="py-[6px] px-[8px] rounded-[5px] text-[11.5px] text-[#B91C1C] cursor-pointer hv-ug5na5"
                                  >
                                    {'Delete'}
                                  </div>
                                  {'\n                '}
                                </div>
                                {'\n              '}
                              </>
                            ) : null}
                            {'\n            '}
                          </div>
                          {'\n          '}
                        </Fragment>
                      ))}
                      {'\n          '}
                      <div className="pt-[12px] px-[8px] pb-[5px] text-[10.5px] font-[650] text-[#A1A1AA] tracking-[.05em] uppercase">
                        {'Yesterday'}
                      </div>
                      {'\n          '}
                      {(historyYesterday ?? []).map((h: any, __i: number) => (
                        <Fragment key={__i}>
                          {'\n            '}
                          <div
                            onClick={h.open}
                            className="hv-u2196x"
                            style={cssToObj(
                              `display:flex; align-items:flex-start; gap:8px; padding:7px 8px; border-radius:7px; cursor:pointer; margin-bottom:1px; background:${h.bg}`,
                            )}
                          >
                            {'\n              '}
                            <div
                              style={cssToObj(
                                `width:3px; align-self:stretch; border-radius:2px; margin-top:1px; background:${h.bar}`,
                              )}
                            ></div>
                            {'\n              '}
                            <div className="[min-width:0] flex-1">
                              {'\n                '}
                              <div
                                style={cssToObj(
                                  `font-size:12px; font-weight:${h.weight}; color:${h.color}; line-height:1.35; overflow:hidden; text-overflow:ellipsis; white-space:nowrap`,
                                )}
                              >
                                <span>{h.title}</span>
                              </div>
                              {'\n                '}
                              <div className="text-[10.5px] text-[#A1A1AA] mt-[2px]">
                                <span>{h.meta}</span>
                              </div>
                              {'\n              '}
                            </div>
                            {'\n            '}
                          </div>
                          {'\n          '}
                        </Fragment>
                      ))}
                      {'\n        '}
                    </div>
                    {'\n\n        '}
                    <div className="[border-top:1px_solid_#EDEDF0] py-[10px] px-[12px] flex flex-col gap-[7px]">
                      {'\n          '}
                      <div className="flex items-center justify-between">
                        {'\n            '}
                        <span className="text-[10.5px] font-[650] text-[#A1A1AA] tracking-[.05em] uppercase">
                          {'Radar'}
                        </span>
                        {'\n            '}
                        <span
                          onClick={goRadar}
                          className="text-[10.5px] text-[#6D28D9] font-[600] cursor-pointer"
                        >
                          {'Open'}
                        </span>
                        {'\n          '}
                      </div>
                      {'\n          '}
                      <div className="flex justify-between text-[11.5px] text-[#52525B]">
                        <span>{'Accounts tracked'}</span>
                        <span className="font-[600] text-[#18181B] tabular-nums">{'1,284'}</span>
                      </div>
                      {'\n          '}
                      <div className="flex justify-between text-[11.5px] text-[#52525B]">
                        <span>{'Signals · 7d'}</span>
                        <span className="font-[600] text-[#18181B] tabular-nums">{'642'}</span>
                      </div>
                      {'\n          '}
                      <div className="flex justify-between text-[11.5px] text-[#52525B]">
                        <span>{'High intent'}</span>
                        <span className="font-[600] text-[#15803D] tabular-nums">{'42'}</span>
                      </div>
                      {'\n        '}
                    </div>
                    {'\n      '}
                  </aside>
                  {'\n    '}
                </>
  )
}
