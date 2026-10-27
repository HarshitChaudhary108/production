import type { RadarValues } from '../types'

export function Sidebar({ m }: { m: RadarValues }) {
  return (
    <aside className="[border-right:1px_solid_#E5E7EB] bg-[#FCFCFD] flex flex-col justify-between pt-[22px] px-[14px] pb-[18px]">
              {'\n    '}
              <div className="flex flex-col gap-[26px]">
                {'\n      '}
                <div className="flex items-center gap-[9px] py-[0] px-[8px]">
                  {'\n        '}
                  <div className="w-[22px] h-[22px] rounded-[7px] bg-[#6D28D9] flex items-center justify-center">
                    {'\n          '}
                    <div className="w-[7px] h-[7px] rounded-full bg-[#FFFFFF]"></div>
                    {'\n        '}
                  </div>
                  {'\n        '}
                  <span className="text-[14px] font-[600] tracking-[-0.01em]">{'Outmate'}</span>
                  {'\n      '}
                </div>
                {'\n      '}
                <nav className="flex flex-col gap-[2px]">
                  {'\n        '}
                  <div className="flex items-center gap-[10px] py-[8px] px-[10px] rounded-[8px] bg-[#F5F3FF] text-[#5B21B6] text-[13.5px] font-[600]">
                    {'\n          '}
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    >
                      <circle cx="8" cy="8" r="6.4"></circle>
                      <circle cx="8" cy="8" r="3.1"></circle>
                      <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none"></circle>
                    </svg>
                    {'\n          Radar\n        '}
                  </div>
                  {'\n        '}
                  <div className="flex items-center gap-[10px] py-[8px] px-[10px] rounded-[8px] text-[#52525B] text-[13.5px] font-[500] hv-u45kwh">
                    {'\n          '}
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    >
                      <path d="M8 1.8l1.6 3.9 3.9 1.6-3.9 1.6L8 12.8 6.4 8.9 2.5 7.3l3.9-1.6z"></path>
                    </svg>
                    {'\n          Copilot\n        '}
                  </div>
                  {'\n      '}
                </nav>
                {'\n    '}
              </div>
              {'\n    '}
              <div className="flex flex-col gap-[2px]">
                {'\n      '}
                <div className="py-[7px] px-[10px] rounded-[8px] text-[#71717A] text-[13px]">
                  {'Help'}
                </div>
                {'\n      '}
                <div className="py-[7px] px-[10px] rounded-[8px] text-[#71717A] text-[13px]">
                  {'Settings'}
                </div>
                {'\n      '}
                <div className="flex items-center gap-[9px] py-[9px] px-[10px] mt-[6px] [border-top:1px_solid_#EFEFF1]">
                  {'\n        '}
                  <div className="w-[26px] h-[26px] rounded-full bg-[#E9D5FF] text-[#5B21B6] text-[11px] font-[600] flex items-center justify-center">
                    {'GA'}
                  </div>
                  {'\n        '}
                  <div className="flex flex-col">
                    {'\n          '}
                    <span className="text-[12.5px] font-[500]">{'Gaurav A.'}</span>
                    {'\n          '}
                    <span className="text-[11px] text-[#A1A1AA]">{'Head of GTM'}</span>
                    {'\n        '}
                  </div>
                  {'\n      '}
                </div>
                {'\n    '}
              </div>
              {'\n  '}
            </aside>
  )
}
