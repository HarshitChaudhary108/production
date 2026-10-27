import { Fragment } from 'react'
import { cssToObj } from '../../../lib/css'
import type { CopilotValues } from '../types'

export function Toast({ m }: { m: CopilotValues }) {
  const { toastText } = m
  return (
    <>
                {'\n    '}
                <div className="absolute bottom-[22px] left-[50%] ml-[-120px] w-[240px] bg-[#18181B] text-[#FFFFFF] rounded-[9px] py-[9px] px-[13px] text-[12px] text-center z-[80] [animation:pop_.14s_ease-out]">
                  <span>{toastText}</span>
                </div>
                {'\n  '}
              </>
  )
}

export function SettingsPopover({ m }: { m: CopilotValues }) {
  const { settings } = m
  return (
    <>
                {'\n    '}
                <div className="absolute top-[48px] right-[52px] w-[288px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[11px] shadow-[0_18px_44px_rgba(24,24,27,.16)] z-[60] [animation:pop_.14s_ease-out] overflow-hidden">
                  {'\n      '}
                  <div className="py-[11px] px-[13px] [border-bottom:1px_solid_#F1F1F3] text-[12px] font-[650]">
                    {'Copilot settings'}
                  </div>
                  {'\n      '}
                  <div className="pt-[6px] px-[13px] pb-[11px]">
                    {'\n        '}
                    {(settings ?? []).map((s: any, __i: number) => (
                      <Fragment key={__i}>
                        {'\n          '}
                        <div
                          onClick={s.cycle}
                          className="flex items-center justify-between gap-[10px] py-[7px] px-[0] [border-bottom:1px_solid_#F7F7F9] cursor-pointer"
                        >
                          {'\n            '}
                          <span className="text-[12px] text-[#52525B]">
                            <span>{s.label}</span>
                          </span>
                          {'\n            '}
                          <span style={cssToObj(s.valStyle)}>
                            <span>{s.value}</span>
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
                {'\n  '}
              </>
  )
}

export function NotificationsPopover({ m }: { m: CopilotValues }) {
  const { notifications } = m
  return (
    <>
                {'\n    '}
                <div className="absolute top-[48px] right-[88px] w-[290px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[11px] shadow-[0_18px_44px_rgba(24,24,27,.16)] z-[60] [animation:pop_.14s_ease-out] overflow-hidden">
                  {'\n      '}
                  <div className="py-[11px] px-[13px] [border-bottom:1px_solid_#F1F1F3] text-[12px] font-[650]">
                    {'Notifications'}
                  </div>
                  {'\n      '}
                  {(notifications ?? []).map((n: any, __i: number) => (
                    <Fragment key={__i}>
                      {'\n        '}
                      <div className="py-[10px] px-[13px] [border-bottom:1px_solid_#F7F7F9] flex gap-[9px]">
                        {'\n          '}
                        <span
                          style={cssToObj(
                            `width:6px; height:6px; border-radius:50%; margin-top:5px; flex:none; background:${n.dot}`,
                          )}
                        ></span>
                        {'\n          '}
                        <div className="[min-width:0]">
                          {'\n            '}
                          <div className="text-[12px] text-[#27272A] leading-[1.45]">
                            <span>{n.text}</span>
                          </div>
                          {'\n            '}
                          <div className="text-[10.5px] text-[#A1A1AA] mt-[2px]">
                            <span>{n.time}</span>
                          </div>
                          {'\n          '}
                        </div>
                        {'\n        '}
                      </div>
                      {'\n      '}
                    </Fragment>
                  ))}
                  {'\n    '}
                </div>
                {'\n  '}
              </>
  )
}

export function CreditsModal({ m }: { m: CopilotValues }) {
  const { afterColor, afterRun, closeCredits, creditsColor, creditsNum, topUp, usage } = m
  return (
    <>
                {'\n    '}
                <div
                  onClick={closeCredits}
                  className="absolute [inset:0] bg-[rgba(24,24,27,.28)] z-[70] flex items-center justify-center"
                >
                  {'\n      '}
                  <div className="w-[428px] bg-[#FFFFFF] rounded-[14px] shadow-[0_24px_60px_rgba(24,24,27,.24)] overflow-hidden [animation:pop_.16s_ease-out]">
                    {'\n        '}
                    <div className="pt-[16px] px-[18px] pb-[14px] [border-bottom:1px_solid_#F1F1F3] flex items-center justify-between">
                      {'\n          '}
                      <span className="text-[14px] font-[650]">{'Credits'}</span>
                      {'\n          '}
                      <button
                        onClick={closeCredits}
                        className="w-[26px] h-[26px] [border:none] bg-transparent rounded-[6px] cursor-pointer text-[#A1A1AA] text-[16px] leading-[1] hv-u45kwi"
                      >
                        {'×'}
                      </button>
                      {'\n        '}
                    </div>
                    {'\n        '}
                    <div className="py-[16px] px-[18px]">
                      {'\n          '}
                      <div className="grid [grid-template-columns:1fr_1fr_1fr] gap-[10px]">
                        {'\n            '}
                        <div className="[border:1px_solid_#EDEDF0] rounded-[9px] py-[10px] px-[11px]">
                          {'\n              '}
                          <div className="text-[10px] text-[#A1A1AA] uppercase tracking-[.05em] font-[650]">
                            {'Remaining'}
                          </div>
                          {'\n              '}
                          <div
                            style={cssToObj(
                              `font-size:18px; font-weight:650; margin-top:3px; color:${creditsColor}; font-variant-numeric:tabular-nums`,
                            )}
                          >
                            <span>{creditsNum}</span>
                          </div>
                          {'\n            '}
                        </div>
                        {'\n            '}
                        <div className="[border:1px_solid_#EDEDF0] rounded-[9px] py-[10px] px-[11px]">
                          {'\n              '}
                          <div className="text-[10px] text-[#A1A1AA] uppercase tracking-[.05em] font-[650]">
                            {'Est. cost'}
                          </div>
                          {'\n              '}
                          <div className="text-[18px] font-[650] mt-[3px] tabular-nums">{'420'}</div>
                          {'\n            '}
                        </div>
                        {'\n            '}
                        <div className="[border:1px_solid_#EDEDF0] rounded-[9px] py-[10px] px-[11px]">
                          {'\n              '}
                          <div className="text-[10px] text-[#A1A1AA] uppercase tracking-[.05em] font-[650]">
                            {'After run'}
                          </div>
                          {'\n              '}
                          <div
                            style={cssToObj(
                              `font-size:18px; font-weight:650; margin-top:3px; color:${afterColor}; font-variant-numeric:tabular-nums`,
                            )}
                          >
                            <span>{afterRun}</span>
                          </div>
                          {'\n            '}
                        </div>
                        {'\n          '}
                      </div>
                      {'\n          '}
                      <div className="mt-[15px] text-[10px] font-[650] text-[#A1A1AA] tracking-[.06em] uppercase">
                        {'Usage breakdown'}
                      </div>
                      {'\n          '}
                      <div className="mt-[8px] flex flex-col">
                        {'\n            '}
                        {(usage ?? []).map((u: any, __i: number) => (
                          <Fragment key={__i}>
                            {'\n              '}
                            <div className="flex items-center justify-between py-[7px] px-[0] [border-bottom:1px_solid_#F4F4F6]">
                              {'\n                '}
                              <span className="text-[12px] text-[#52525B]">
                                <span>{u.label}</span>
                              </span>
                              {'\n                '}
                              <span className="text-[12px] font-[600] tabular-nums">
                                <span>{u.cost}</span>
                              </span>
                              {'\n              '}
                            </div>
                            {'\n            '}
                          </Fragment>
                        ))}
                        {'\n          '}
                      </div>
                      {'\n        '}
                    </div>
                    {'\n        '}
                    <div className="pt-[13px] px-[18px] pb-[16px] bg-[#FBFBFC] [border-top:1px_solid_#F1F1F3] flex gap-[8px] justify-end">
                      {'\n          '}
                      <button
                        onClick={closeCredits}
                        className="h-[32px] py-[0] px-[13px] [border:1px_solid_#E4E4E8] bg-[#FFFFFF] rounded-[8px] text-[12.5px] text-[#52525B] font-[550] cursor-pointer hv-u4v0t1"
                      >
                        {'Close'}
                      </button>
                      {'\n          '}
                      <button
                        onClick={topUp}
                        className="h-[32px] py-[0] px-[15px] [border:1px_solid_#6D28D9] bg-[#6D28D9] text-[#FFFFFF] rounded-[8px] text-[12.5px] font-[600] cursor-pointer hv-jdi8ic"
                      >
                        {'Top up 5,000 credits'}
                      </button>
                      {'\n        '}
                    </div>
                    {'\n      '}
                  </div>
                  {'\n    '}
                </div>
                {'\n  '}
              </>
  )
}
