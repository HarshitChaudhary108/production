import type { RadarValues } from '../types'

export function RadarHeader({ m }: { m: RadarValues }) {
  return (
    <header className="flex items-start justify-between pt-[24px] px-[28px] pb-[18px] [border-bottom:1px_solid_#E5E7EB]">
                {'\n      '}
                <div>
                  {'\n        '}
                  <h1 className="m-[0] text-[22px] font-[600] tracking-[-0.02em]">{'Revenue Radar'}</h1>
                  {'\n        '}
                  <p className="mt-[5px] mx-[0] mb-[0] text-[13.5px] text-[#71717A]">
                    {'See what changed across your target accounts.'}
                  </p>
                  {'\n      '}
                </div>
                {'\n      '}
                <div className="flex items-center gap-[10px]">
                  {'\n        '}
                  <div className="flex items-center gap-[8px] w-[268px] h-[34px] py-[0] px-[11px] [border:1px_solid_#E5E7EB] rounded-[9px] bg-[#FAFAFA]">
                    {'\n          '}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="1.4"
                    >
                      <path d="M8 2l1.5 3.6L13 7.1 9.5 8.6 8 12.2 6.5 8.6 3 7.1l3.5-1.5z"></path>
                    </svg>
                    {'\n          '}
                    <span className="text-[12.5px] text-[#A1A1AA]">{'Ask Outmate…'}</span>
                    {'\n          '}
                    <span className="ml-[auto] [font-family:'IBM_Plex_Mono',monospace] text-[10.5px] text-[#A1A1AA] [border:1px_solid_#E5E7EB] rounded-[5px] py-[1px] px-[5px] bg-[#FFFFFF]">
                      {'⌘K'}
                    </span>
                    {'\n        '}
                  </div>
                  {'\n        '}
                  <div className="relative w-[34px] h-[34px] [border:1px_solid_#E5E7EB] rounded-[9px] flex items-center justify-center">
                    {'\n          '}
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="#52525B"
                      strokeWidth="1.4"
                    >
                      <path d="M4 6.5a4 4 0 018 0c0 3 1 4 1 4H3s1-1 1-4z"></path>
                      <path d="M6.6 13a1.6 1.6 0 002.8 0"></path>
                    </svg>
                    {'\n          '}
                    <span className="absolute top-[6px] right-[7px] w-[6px] h-[6px] rounded-full bg-[#7C3AED] [border:1.5px_solid_#FFFFFF]"></span>
                    {'\n        '}
                  </div>
                  {'\n        '}
                  <div className="w-[34px] h-[34px] rounded-full bg-[#E9D5FF] text-[#5B21B6] text-[12px] font-[600] flex items-center justify-center">
                    {'GA'}
                  </div>
                  {'\n      '}
                </div>
                {'\n    '}
              </header>
  )
}
