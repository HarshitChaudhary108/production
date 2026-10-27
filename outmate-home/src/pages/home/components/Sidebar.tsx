import { Fragment } from 'react'
import { cssToObj } from '../../../lib/css'
import type { HomeValues } from '../types'

export function Sidebar({ m }: { m: HomeValues }) {
  const { creditsLeft, creditsUsed, goSettings, navGroups, newResearch, openCredits, plan, recents, remainPct, resources, settingsNavStyle, toggleWorkspace, upgrade, workspaceOpen, workspaces } = m
  return (
    <aside className="flex-none w-[248px] [border-right:1px_solid_#E5E5EA] bg-[#FCFCFD] flex flex-col">
              {'\n    '}
              <div className="flex-none py-[11px] px-[12px] [border-bottom:1px_solid_#EFEFF2]">
                {'\n      '}
                <div
                  onClick={toggleWorkspace}
                  className="flex items-center gap-[9px] py-[6px] px-[8px] rounded-[7px] cursor-pointer relative hv-u2qp3h"
                >
                  {'\n        '}
                  <span className="flex-none w-[26px] h-[26px] rounded-[6px] bg-[#18181B] text-[#FFFFFF] flex items-center justify-center text-[13px] font-[700]">
                    {'O'}
                  </span>
                  {'\n        '}
                  <span className="flex-1 [min-width:0]">
                    {'\n          '}
                    <span className="block text-[12.5px] font-[650] text-[#18181B]">{'Outmate'}</span>
                    {'\n          '}
                    <span className="block text-[10.5px] text-[#8E8E96] mt-[1px]">
                      <span>{plan}</span>
                    </span>
                    {'\n        '}
                  </span>
                  {'\n        '}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="#A1A1AA"
                    strokeWidth="2"
                  >
                    <path d="M5 8l5 5 5-5"></path>
                  </svg>
                  {'\n        '}
                  {workspaceOpen ? (
                    <>
                      {'\n          '}
                      <span className="absolute top-[38px] left-[6px] w-[212px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[8px] shadow-[0_14px_34px_rgba(24,24,27,.16)] p-[4px] z-[60] flex flex-col [animation:pop_.12s_ease-out]">
                        {'\n            '}
                        {(workspaces ?? []).map((w: any, __i: number) => (
                          <Fragment key={__i}>
                            {'\n              '}
                            <span
                              onClick={w.pick}
                              className="flex items-center justify-between py-[7px] px-[8px] rounded-[6px] text-[11.5px] text-[#3F3F46] cursor-pointer hv-u4v0t1"
                            >
                              {'\n                '}
                              <span>{w.name}</span>
                              {'\n                '}
                              <span className="text-[10.5px] text-[#6D28D9] font-[650]">
                                <span>{w.mark}</span>
                              </span>
                              {'\n              '}
                            </span>
                            {'\n            '}
                          </Fragment>
                        ))}
                        {'\n          '}
                      </span>
                      {'\n        '}
                    </>
                  ) : null}
                  {'\n      '}
                </div>
                {'\n      '}
                <button
                  onClick={newResearch}
                  className="w-full mt-[8px] h-[32px] flex items-center justify-center gap-[6px] [border:1px_dashed_#D4C7F5] bg-[#FFFFFF] text-[#5B21B6] rounded-[7px] text-[12px] font-[650] cursor-pointer [font-family:inherit] hv-5zz9n7"
                >
                  {'\n        '}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <path d="M10 4.5v11M4.5 10h11"></path>
                  </svg>
                  {'\n        New research\n      '}
                </button>
                {'\n    '}
              </div>
              {'\n\n    '}
              <div className="flex-1 [min-height:0] overflow-y-auto pt-[8px] px-[8px] pb-[4px]">
                {'\n      '}
                {(navGroups ?? []).map((g: any, __i: number) => (
                  <Fragment key={__i}>
                    {'\n        '}
                    <div className="mb-[9px]">
                      {'\n          '}
                      {g.hasLabel ? (
                        <>
                          {'\n            '}
                          <div className="pt-[5px] px-[9px] pb-[4px] text-[9.5px] font-[700] text-[#A1A1AA] tracking-[.07em] uppercase">
                            <span>{g.label}</span>
                          </div>
                          {'\n          '}
                        </>
                      ) : null}
                      {'\n          '}
                      {(g.items ?? []).map((i: any, __i: number) => (
                        <Fragment key={__i}>
                          {'\n            '}
                          <div onClick={i.go} style={cssToObj(i.style)}>
                            {'\n              '}
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 20 20"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="flex-none opacity-[.85]"
                            >
                              <path d={i.path}></path>
                            </svg>
                            {'\n              '}
                            <span className="flex-1 [min-width:0] overflow-hidden text-ellipsis whitespace-nowrap">
                              <span>{i.label}</span>
                            </span>
                            {'\n              '}
                            {i.hasTag ? (
                              <>
                                {'\n                '}
                                <span className="flex-none text-[9px] font-[650] text-[#A1A1AA] tracking-[.03em]">
                                  <span>{i.tag}</span>
                                </span>
                                {'\n              '}
                              </>
                            ) : null}
                            {'\n            '}
                          </div>
                          {'\n          '}
                        </Fragment>
                      ))}
                      {'\n        '}
                    </div>
                    {'\n      '}
                  </Fragment>
                ))}
                {'\n\n      '}
                <div className="[border-top:1px_solid_#EFEFF2] pt-[8px] mt-[2px]">
                  {'\n        '}
                  <div className="pt-[5px] px-[9px] pb-[4px] text-[9.5px] font-[700] text-[#A1A1AA] tracking-[.07em] uppercase">
                    {'Recents'}
                  </div>
                  {'\n        '}
                  {(recents ?? []).map((r: any, __i: number) => (
                    <Fragment key={__i}>
                      {'\n          '}
                      <div
                        onClick={r.open}
                        className="flex items-center gap-[8px] py-[6px] px-[9px] rounded-[6px] cursor-pointer text-[#52525B] text-[12px] hv-yaoyuh"
                      >
                        {'\n            '}
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          className="flex-none opacity-[.7]"
                        >
                          <path d="M4.5 4.5h11v11h-11zM4.5 8h11M8 8v7.5"></path>
                        </svg>
                        {'\n            '}
                        <span className="flex-1 [min-width:0] overflow-hidden text-ellipsis whitespace-nowrap">
                          <span>{r.name}</span>
                        </span>
                        {'\n          '}
                      </div>
                      {'\n        '}
                    </Fragment>
                  ))}
                  {'\n      '}
                </div>
                {'\n    '}
              </div>
              {'\n\n    '}
              <div className="flex-none [border-top:1px_solid_#EFEFF2] p-[8px]">
                {'\n      '}
                {(resources ?? []).map((r: any, __i: number) => (
                  <Fragment key={__i}>
                    {'\n        '}
                    <div
                      onClick={r.act}
                      className="flex items-center gap-[8px] py-[6px] px-[9px] rounded-[6px] cursor-pointer text-[#52525B] text-[12px] hv-yaoyuh"
                    >
                      {'\n          '}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        className="flex-none opacity-[.75]"
                      >
                        <path d={r.path}></path>
                      </svg>
                      {'\n          '}
                      <span>{r.label}</span>
                      {'\n        '}
                    </div>
                    {'\n      '}
                  </Fragment>
                ))}
                {'\n      '}
                <button
                  onClick={upgrade}
                  className="w-full mt-[6px] h-[30px] [border:1px_solid_#6D28D9] bg-[#6D28D9] text-[#FFFFFF] rounded-[7px] text-[12px] font-[650] cursor-pointer [font-family:inherit] flex items-center justify-center gap-[6px] hv-jdi8ic"
                >
                  {'\n        Upgrade plan\n      '}
                </button>
                {'\n      '}
                <div
                  onClick={openCredits}
                  className="mt-[7px] py-[9px] px-[10px] [border:1px_solid_#E5E5EA] rounded-[7px] cursor-pointer bg-[#FFFFFF] hv-x0ddlt"
                >
                  {'\n        '}
                  <div className="flex items-center gap-[8px]">
                    {'\n          '}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="#6D28D9"
                      strokeWidth="1.6"
                      className="flex-none"
                    >
                      <circle cx="8" cy="10" r="4.2"></circle>
                      <path d="M12 6.2a4.2 4.2 0 010 7.6"></path>
                    </svg>
                    {'\n          '}
                    <span className="flex-1 text-[12.5px] font-[700] text-[#18181B] tabular-nums">
                      <span>{creditsLeft}</span>
                    </span>
                    {'\n          '}
                    <span className="text-[10.5px] text-[#8E8E96]">{'available'}</span>
                    {'\n        '}
                  </div>
                  {'\n        '}
                  <div className="h-[4px] rounded-[2px] bg-[#F1F1F3] overflow-hidden mt-[8px]">
                    {'\n          '}
                    <div
                      style={cssToObj(
                        `height:100%; border-radius:2px; background:#6D28D9; width:${remainPct}`,
                      )}
                    ></div>
                    {'\n        '}
                  </div>
                  {'\n        '}
                  <div className="text-[10px] text-[#8E8E96] mt-[6px] tabular-nums">
                    <span>{creditsUsed}</span>
                    {' used this cycle'}
                  </div>
                  {'\n      '}
                </div>
                {'\n      '}
                <div onClick={goSettings} style={cssToObj(settingsNavStyle)}>
                  {'\n        '}
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    className="flex-none opacity-[.85]"
                  >
                    <path d="M10 7.6a2.4 2.4 0 100 4.8 2.4 2.4 0 000-4.8zM10 3.5v2M10 14.5v2M3.5 10h2M14.5 10h2M5.4 5.4l1.4 1.4M13.2 13.2l1.4 1.4M14.6 5.4l-1.4 1.4M6.8 13.2l-1.4 1.4"></path>
                  </svg>
                  {'\n        '}
                  <span className="flex-1">{'Settings'}</span>
                  {'\n        '}
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="#A1A1AA"
                    strokeWidth="1.7"
                    className="flex-none"
                  >
                    <path d="M7.5 9.5a2.2 2.2 0 100-4.4 2.2 2.2 0 000 4.4zM3.8 15.5c0-2 1.7-3.3 3.7-3.3s3.7 1.3 3.7 3.3M14 6.5v3.5M12.4 8.2h3.2"></path>
                  </svg>
                  {'\n      '}
                </div>
                {'\n    '}
              </div>
              {'\n  '}
            </aside>
  )
}
