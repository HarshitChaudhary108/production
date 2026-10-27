import { cssToObj } from '../../../lib/css'
import type { WorkspaceValues } from '../types'

export function TopBar({ m }: { m: WorkspaceValues }) {
  const { copilotTabStyle, creditBg, creditBorder, creditFg, creditsLabel, goCopilot, goRadar, openCredits, projectName, radarTabStyle, sheet, toggleNotifs, toggleSettings } = m
  return (
    <header className="h-[46px] flex-none flex items-center justify-between pt-[0] pr-[12px] pb-[0] pl-[14px] bg-[#FFFFFF] [border-bottom:1px_solid_#E5E5EA] z-[30]">
              {'\n    '}
              <div className="flex items-center gap-[12px] [min-width:0]">
                {'\n      '}
                <a
                  href="/"
                  title="Back to home"
                  className="flex items-center gap-[7px] no-underline py-[4px] px-[6px] ml-[-6px] rounded-[6px] hv-u45kwi"
                >
                  {'\n        '}
                  <svg width="19" height="19" viewBox="0 0 20 20">
                    <rect width="20" height="20" rx="5.5" fill="#6D28D9"></rect>
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
                  <span className="text-[13.5px] font-[650] tracking-[-0.015em] text-[#18181B]">
                    {'Outmate'}
                  </span>
                  {'\n      '}
                </a>
                {'\n      '}
                <div className="flex items-center gap-[1px] bg-[#F1F1F4] rounded-[7px] p-[2px]">
                  {'\n        '}
                  <span onClick={goCopilot} style={cssToObj(copilotTabStyle)}>
                    {'Copilot'}
                  </span>
                  {'\n        '}
                  <span onClick={goRadar} style={cssToObj(radarTabStyle)}>
                    {'Radar'}
                  </span>
                  {'\n      '}
                </div>
                {'\n      '}
                <div className="w-[1px] h-[18px] bg-[#E5E5EA]"></div>
                {'\n      '}
                <div className="flex items-center gap-[7px] text-[12.5px] [min-width:0]">
                  {'\n        '}
                  <span className="text-[#3F3F46] font-[600] whitespace-nowrap overflow-hidden text-ellipsis [max-width:250px]">
                    <span>{projectName}</span>
                  </span>
                  {'\n        '}
                  <span className="text-[#C4C4CB]">{'/'}</span>
                  {'\n        '}
                  <span className="text-[#71717A] whitespace-nowrap">
                    <span>{sheet}</span>
                  </span>
                  {'\n      '}
                </div>
                {'\n    '}
              </div>
              {'\n\n    '}
              <div className="flex items-center gap-[7px]">
                {'\n      '}
                <div className="flex items-center gap-[6px] h-[28px] py-[0] px-[9px] [border:1px_solid_#E5E5EA] rounded-[6px] bg-[#FAFAFB] w-[180px] cursor-pointer hv-u2196y">
                  {'\n        '}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="#A1A1AA"
                    strokeWidth="1.8"
                  >
                    <circle cx="9" cy="9" r="5.6"></circle>
                    <path d="M13.2 13.2L17 17"></path>
                  </svg>
                  {'\n        '}
                  <span className="text-[11.5px] text-[#A1A1AA]">{'Search'}</span>
                  {'\n        '}
                  <span className="ml-[auto] text-[9.5px] text-[#B4B4BB] [border:1px_solid_#E5E5EA] rounded-[3px] py-[1px] px-[4px] bg-[#FFFFFF]">
                    {'⌘K'}
                  </span>
                  {'\n      '}
                </div>
                {'\n      '}
                <div
                  onClick={openCredits}
                  className="hv-1a8qwwd"
                  style={cssToObj(
                    `display:flex; align-items:center; gap:6px; height:28px; padding:0 9px; border-radius:6px; cursor:pointer; font-size:11.5px; font-weight:600; border:1px solid ${creditBorder}; background:${creditBg}; color:${creditFg}`,
                  )}
                >
                  {'\n        '}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
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
                  className="h-[28px] w-[28px] flex items-center justify-center [border:1px_solid_#E5E5EA] bg-[#FFFFFF] rounded-[6px] cursor-pointer relative hv-u69wm2"
                >
                  {'\n        '}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="#52525B"
                    strokeWidth="1.5"
                  >
                    <path d="M10 3a4.6 4.6 0 00-4.6 4.6c0 3.6-1.4 4.7-1.4 4.7h12s-1.4-1.1-1.4-4.7A4.6 4.6 0 0010 3z"></path>
                    <path d="M8.6 15.2a1.6 1.6 0 002.8 0"></path>
                  </svg>
                  {'\n        '}
                  <span className="absolute top-[4px] right-[4px] w-[6px] h-[6px] rounded-full bg-[#EA580C] [border:1.5px_solid_#FFFFFF]"></span>
                  {'\n      '}
                </button>
                {'\n      '}
                <button
                  onClick={toggleSettings}
                  className="h-[28px] w-[28px] flex items-center justify-center [border:1px_solid_#E5E5EA] bg-[#FFFFFF] rounded-[6px] cursor-pointer hv-u69wm2"
                >
                  {'\n        '}
                  <svg
                    width="14"
                    height="14"
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
                <div className="w-[26px] h-[26px] rounded-full bg-[#EDE4FD] text-[#5B21B6] text-[10px] font-[650] flex items-center justify-center cursor-pointer">
                  {'GA'}
                </div>
                {'\n    '}
              </div>
              {'\n  '}
            </header>
  )
}
