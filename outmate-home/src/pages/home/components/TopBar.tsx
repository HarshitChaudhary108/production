import { Fragment } from 'react'
import { cssToObj } from '../../../lib/css'
import type { HomeValues } from '../types'

export function TopBar({ m }: { m: HomeValues }) {
  const { creditColor, creditsLeft, creditsUsed, goSettings, notifications, notifsOpen, openCredits, openSearch, pageTitle, toggleNotifs, toggleUser, userMenu, userOpen } = m
  return (
    <header className="flex-none h-[48px] [border-bottom:1px_solid_#E5E5EA] flex items-center gap-[10px] py-[0] px-[16px] bg-[#FFFFFF]">
                {'\n      '}
                <span className="text-[12.5px] text-[#A1A1AA]">{'Outmate'}</span>
                {'\n      '}
                <span className="text-[12.5px] text-[#D4D4D8]">{'/'}</span>
                {'\n      '}
                <span className="text-[12.5px] font-[650] text-[#18181B]">
                  <span>{pageTitle}</span>
                </span>
                {'\n\n      '}
                <div
                  onClick={openSearch}
                  className="ml-[auto] flex items-center gap-[7px] w-[264px] h-[30px] py-[0] px-[9px] [border:1px_solid_#E4E4E8] rounded-[7px] cursor-text bg-[#FCFCFD] hv-lhzfiw"
                >
                  {'\n        '}
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="#A1A1AA"
                    strokeWidth="1.8"
                    className="flex-none"
                  >
                    <circle cx="9" cy="9" r="5.6"></circle>
                    <path d="M13.2 13.2L17 17"></path>
                  </svg>
                  {'\n        '}
                  <span className="flex-1 text-[12px] text-[#A1A1AA]">
                    {'Search companies, people, sheets'}
                  </span>
                  {'\n        '}
                  <span className="flex-none text-[10px] text-[#A1A1AA] [border:1px_solid_#E4E4E8] rounded-[4px] py-[1px] px-[4px] [font-family:'JetBrains_Mono',_monospace]">
                    {'⌘K'}
                  </span>
                  {'\n      '}
                </div>
                {'\n\n      '}
                <div
                  onClick={openCredits}
                  className="flex items-center gap-[7px] h-[30px] py-[0] px-[10px] [border:1px_solid_#E4E4E8] rounded-[7px] cursor-pointer bg-[#FFFFFF] hv-u69wm3"
                >
                  {'\n        '}
                  <span className="text-[11.5px] text-[#71717A] tabular-nums">
                    <span>{creditsUsed}</span>
                    {' used'}
                  </span>
                  {'\n        '}
                  <span className="w-[1px] h-[13px] bg-[#EAEAEE]"></span>
                  {'\n        '}
                  <span
                    style={cssToObj(
                      `font-size:11.5px; font-weight:650; color:${creditColor}; font-variant-numeric:tabular-nums`,
                    )}
                  >
                    <span>{creditsLeft}</span>
                    {' left'}
                  </span>
                  {'\n      '}
                </div>
                {'\n\n      '}
                <button
                  onClick={toggleNotifs}
                  title="Notifications"
                  className="relative w-[30px] h-[30px] flex items-center justify-center [border:1px_solid_#E4E4E8] bg-[#FFFFFF] rounded-[7px] cursor-pointer hv-u69wm3"
                >
                  {'\n        '}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="#52525B"
                    strokeWidth="1.7"
                  >
                    <path d="M6 8.5a4 4 0 018 0c0 3 1 4 1.5 4.5h-11C5 12.5 6 11.5 6 8.5zM8.5 15.5a1.7 1.7 0 003 0"></path>
                  </svg>
                  {'\n        '}
                  <span className="absolute top-[5px] right-[5px] w-[6px] h-[6px] rounded-full bg-[#DC2626] [border:1.5px_solid_#FFFFFF]"></span>
                  {'\n      '}
                </button>
                {'\n      '}
                {notifsOpen ? (
                  <>
                    {'\n        '}
                    <div className="absolute top-[44px] right-[58px] w-[288px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[9px] shadow-[0_16px_40px_rgba(24,24,27,.16)] z-[60] overflow-hidden [animation:pop_.12s_ease-out]">
                      {'\n          '}
                      <div className="py-[9px] px-[12px] [border-bottom:1px_solid_#F1F1F3] text-[11.5px] font-[650]">
                        {'Notifications'}
                      </div>
                      {'\n          '}
                      {(notifications ?? []).map((n: any, __i: number) => (
                        <Fragment key={__i}>
                          {'\n            '}
                          <div
                            onClick={n.act}
                            className="flex gap-[8px] py-[9px] px-[12px] [border-bottom:1px_solid_#F4F4F6] cursor-pointer hv-udcbnc"
                          >
                            {'\n              '}
                            <span
                              style={cssToObj(
                                `flex:none; width:6px; height:6px; border-radius:50%; margin-top:5px; background:${n.dot}`,
                              )}
                            ></span>
                            {'\n              '}
                            <span className="flex-1 [min-width:0]">
                              {'\n                '}
                              <span className="block text-[11.5px] text-[#3F3F46] leading-[1.45]">
                                <span>{n.text}</span>
                              </span>
                              {'\n                '}
                              <span className="block text-[10px] text-[#A1A1AA] mt-[2px]">
                                <span>{n.time}</span>
                              </span>
                              {'\n              '}
                            </span>
                            {'\n            '}
                          </div>
                          {'\n          '}
                        </Fragment>
                      ))}
                      {'\n        '}
                    </div>
                    {'\n      '}
                  </>
                ) : null}
                {'\n\n      '}
                <button
                  onClick={goSettings}
                  title="Settings"
                  className="w-[30px] h-[30px] flex items-center justify-center [border:1px_solid_#E4E4E8] bg-[#FFFFFF] rounded-[7px] cursor-pointer hv-u69wm3"
                >
                  {'\n        '}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="#52525B"
                    strokeWidth="1.7"
                  >
                    <circle cx="10" cy="10" r="2.4"></circle>
                    <path d="M10 3.5v2M10 14.5v2M3.5 10h2M14.5 10h2M5.4 5.4l1.4 1.4M13.2 13.2l1.4 1.4M14.6 5.4l-1.4 1.4M6.8 13.2l-1.4 1.4"></path>
                  </svg>
                  {'\n      '}
                </button>
                {'\n      '}
                <div
                  onClick={toggleUser}
                  title="Account"
                  className="w-[30px] h-[30px] rounded-[7px] bg-[#EDE9FE] text-[#5B21B6] flex items-center justify-center text-[11.5px] font-[700] cursor-pointer"
                >
                  {'AK'}
                </div>
                {'\n      '}
                {userOpen ? (
                  <>
                    {'\n        '}
                    <div className="absolute top-[44px] right-[16px] w-[196px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[9px] shadow-[0_16px_40px_rgba(24,24,27,.16)] p-[4px] z-[60] [animation:pop_.12s_ease-out]">
                      {'\n          '}
                      <div className="py-[7px] px-[9px] [border-bottom:1px_solid_#F1F1F3] mb-[3px]">
                        {'\n            '}
                        <div className="text-[11.5px] font-[650]">{'Aarav Kapoor'}</div>
                        {'\n            '}
                        <div className="text-[10.5px] text-[#8E8E96] mt-[1px]">
                          {'aarav@outmate.ai'}
                        </div>
                        {'\n          '}
                      </div>
                      {'\n          '}
                      {(userMenu ?? []).map((u: any, __i: number) => (
                        <Fragment key={__i}>
                          {'\n            '}
                          <div
                            onClick={u.act}
                            className="py-[7px] px-[9px] rounded-[6px] text-[11.5px] text-[#3F3F46] cursor-pointer hv-u4v0t1"
                          >
                            <span>{u.label}</span>
                          </div>
                          {'\n          '}
                        </Fragment>
                      ))}
                      {'\n        '}
                    </div>
                    {'\n      '}
                  </>
                ) : null}
                {'\n    '}
              </header>
  )
}
