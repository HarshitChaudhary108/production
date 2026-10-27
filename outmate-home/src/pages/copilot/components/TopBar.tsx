import { cssToObj } from '../../../lib/css'
import type { CopilotValues } from '../types'

export function TopBar({ m }: { m: CopilotValues }) {
  const { convTitle, copilotTabStyle, creditBg, creditBorder, creditFg, creditsLabel, goCopilot, goRadar, openCredits, radarTabStyle, toggleNotifs, toggleSettings } = m
  return (
    <header className="h-[52px] flex-none flex items-center justify-between pt-[0] pr-[14px] pb-[0] pl-[16px] bg-[#FFFFFF] [border-bottom:1px_solid_#E8E8EC] z-[20]">
              {'\n    '}
              <div className="flex items-center gap-[14px] [min-width:0]">
                {'\n      '}
                <div className="flex items-center gap-[8px]">
                  {'\n        '}
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    <rect width="20" height="20" rx="6" fill="#6D28D9"></rect>
                    <circle
                      cx="10"
                      cy="10"
                      r="5.2"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1.4"
                    ></circle>
                    <circle cx="10" cy="10" r="1.6" fill="#FFFFFF"></circle>
                  </svg>
                  {'\n        '}
                  <span className="text-[14px] font-[650] tracking-[-0.015em]">{'Outmate'}</span>
                  {'\n      '}
                </div>
                {'\n      '}
                <div className="w-[1px] h-[20px] bg-[#E8E8EC]"></div>
                {'\n      '}
                <div className="flex items-center gap-[2px] bg-[#F4F4F6] rounded-[8px] p-[2px]">
                  {'\n        '}
                  <span onClick={goCopilot} style={cssToObj(copilotTabStyle)}>
                    {'\n          '}
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path d="M10 2.6l1.9 4.5 4.5 1.9-4.5 1.9L10 15.4l-1.9-4.5L3.6 9l4.5-1.9z"></path>
                    </svg>
                    {'\n          Copilot\n        '}
                  </span>
                  {'\n        '}
                  <span onClick={goRadar} style={cssToObj(radarTabStyle)}>
                    {'\n          '}
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <circle cx="10" cy="10" r="7.4"></circle>
                      <circle cx="10" cy="10" r="3.2"></circle>
                    </svg>
                    {'\n          Radar\n        '}
                  </span>
                  {'\n      '}
                </div>
                {'\n      '}
                <div className="w-[1px] h-[20px] bg-[#E8E8EC]"></div>
                {'\n      '}
                <span className="text-[12.5px] text-[#3F3F46] font-[550] whitespace-nowrap overflow-hidden text-ellipsis [max-width:300px]">
                  <span>{convTitle}</span>
                </span>
                {'\n      '}
                <span className="flex items-center gap-[5px] py-[3px] px-[7px] rounded-[5px] bg-[#ECFDF3] text-[#15803D] text-[11px] font-[600]">
                  {'\n        '}
                  <span className="w-[5px] h-[5px] rounded-full bg-[#22A15D] [animation:pulse_1.8s_ease-in-out_infinite]"></span>
                  {'Live\n      '}
                </span>
                {'\n    '}
              </div>
              {'\n\n    '}
              <div className="flex items-center gap-[8px]">
                {'\n      '}
                <div className="flex items-center gap-[7px] h-[30px] py-[0] px-[10px] [border:1px_solid_#E8E8EC] rounded-[7px] bg-[#FBFBFC] w-[196px] cursor-pointer hv-u45kwi">
                  {'\n        '}
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="#A1A1AA"
                    strokeWidth="1.7"
                  >
                    <circle cx="9" cy="9" r="5.6"></circle>
                    <path d="M13.2 13.2L17 17"></path>
                  </svg>
                  {'\n        '}
                  <span className="text-[12px] text-[#A1A1AA]">{'Search conversations'}</span>
                  {'\n        '}
                  <span className="ml-[auto] text-[10px] text-[#B4B4BB] [border:1px_solid_#E8E8EC] rounded-[4px] py-[1px] px-[4px] bg-[#FFFFFF]">
                    {'⌘K'}
                  </span>
                  {'\n      '}
                </div>
                {'\n      '}
                <div
                  onClick={openCredits}
                  className="hv-1a8qwwd"
                  style={cssToObj(
                    `display:flex; align-items:center; gap:6px; height:30px; padding:0 10px; border-radius:7px; cursor:pointer; font-size:12px; font-weight:600; border:1px solid ${creditBorder}; background:${creditBg}; color:${creditFg}`,
                  )}
                >
                  {'\n        '}
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <path d="M11 2.5L4.5 11.5H9l-.6 6 6.6-9H10.4z"></path>
                  </svg>
                  {'\n        '}
                  <span>{creditsLabel}</span>
                  {'\n      '}
                </div>
                {'\n      '}
                <button
                  onClick={toggleNotifs}
                  className="h-[30px] w-[30px] flex items-center justify-center [border:1px_solid_#E8E8EC] bg-[#FFFFFF] rounded-[7px] cursor-pointer relative hv-u69wm2"
                >
                  {'\n        '}
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="#52525B"
                    strokeWidth="1.5"
                  >
                    <path d="M10 3a4.6 4.6 0 00-4.6 4.6c0 3.6-1.4 4.7-1.4 4.7h12s-1.4-1.1-1.4-4.7A4.6 4.6 0 0010 3z"></path>
                    <path d="M8.6 15.2a1.6 1.6 0 002.8 0"></path>
                  </svg>
                  {'\n        '}
                  <span className="absolute top-[5px] right-[5px] w-[6px] h-[6px] rounded-full bg-[#EA580C] [border:1.5px_solid_#FFFFFF]"></span>
                  {'\n      '}
                </button>
                {'\n      '}
                <button
                  onClick={toggleSettings}
                  className="h-[30px] w-[30px] flex items-center justify-center [border:1px_solid_#E8E8EC] bg-[#FFFFFF] rounded-[7px] cursor-pointer hv-u69wm2"
                >
                  {'\n        '}
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="#52525B"
                    strokeWidth="1.5"
                  >
                    <circle cx="10" cy="10" r="2.6"></circle>
                    <path d="M16.2 12.1a1.4 1.4 0 00.3 1.5l.1.1a1.7 1.7 0 11-2.4 2.4l-.1-.1a1.4 1.4 0 00-2.3 1v.2a1.7 1.7 0 11-3.4 0v-.1a1.4 1.4 0 00-2.4-.9l-.1.1A1.7 1.7 0 113.4 14l.1-.1a1.4 1.4 0 00-1-2.3H2.3a1.7 1.7 0 110-3.4h.1a1.4 1.4 0 001-2.4l-.1-.1A1.7 1.7 0 015.7 3.3l.1.1a1.4 1.4 0 002.3-1V2.3a1.7 1.7 0 113.4 0v.1a1.4 1.4 0 002.3 1l.1-.1a1.7 1.7 0 112.4 2.4l-.1.1a1.4 1.4 0 001 2.3h.2a1.7 1.7 0 010 3.4h-.1a1.4 1.4 0 00-1.1.6z"></path>
                  </svg>
                  {'\n      '}
                </button>
                {'\n      '}
                <div className="w-[28px] h-[28px] rounded-full bg-[#EDE4FD] text-[#5B21B6] text-[10.5px] font-[650] flex items-center justify-center cursor-pointer">
                  {'GA'}
                </div>
                {'\n    '}
              </div>
              {'\n  '}
            </header>
  )
}
