import type { RadarValues } from '../types'

export function StatsRow({ m }: { m: RadarValues }) {
  return (
    <div className="grid [grid-template-columns:repeat(5,_1fr)] gap-[10px] pt-[16px] px-[28px] pb-[0]">
                {'\n      '}
                <div className="[border:1px_solid_#E5E7EB] rounded-[10px] py-[11px] px-[13px] bg-[#FFFFFF]">
                  {'\n        '}
                  <div className="text-[10.5px] tracking-[0.06em] uppercase text-[#A1A1AA] font-[600]">
                    {'Tracked accounts'}
                  </div>
                  {'\n        '}
                  <div className="mt-[6px] [font-family:'IBM_Plex_Mono',monospace] text-[20px] font-[600] tracking-[-0.02em]">
                    {'1,284'}
                  </div>
                  {'\n      '}
                </div>
                {'\n      '}
                <div className="[border:1px_solid_#DDD6FE] rounded-[10px] py-[11px] px-[13px] bg-[#FBFAFF]">
                  {'\n        '}
                  <div className="text-[10.5px] tracking-[0.06em] uppercase text-[#7C3AED] font-[600]">
                    {'High intent'}
                  </div>
                  {'\n        '}
                  <div className="mt-[6px] flex items-baseline gap-[7px]">
                    {'\n          '}
                    <span className="[font-family:'IBM_Plex_Mono',monospace] text-[20px] font-[600] text-[#5B21B6] tracking-[-0.02em]">
                      {'42'}
                    </span>
                    {'\n          '}
                    <span className="text-[11.5px] font-[600] text-[#15803D]">{'↑ 18%'}</span>
                    {'\n        '}
                  </div>
                  {'\n      '}
                </div>
                {'\n      '}
                <div className="[border:1px_solid_#E5E7EB] rounded-[10px] py-[11px] px-[13px] bg-[#FFFFFF]">
                  {'\n        '}
                  <div className="text-[10.5px] tracking-[0.06em] uppercase text-[#A1A1AA] font-[600]">
                    {'New signals'}
                  </div>
                  {'\n        '}
                  <div className="mt-[6px] flex items-baseline gap-[6px]">
                    {'\n          '}
                    <span className="[font-family:'IBM_Plex_Mono',monospace] text-[20px] font-[600] tracking-[-0.02em]">
                      {'186'}
                    </span>
                    {'\n          '}
                    <span className="text-[11.5px] text-[#A1A1AA]">{'today'}</span>
                    {'\n        '}
                  </div>
                  {'\n      '}
                </div>
                {'\n      '}
                <div className="[border:1px_solid_#E5E7EB] rounded-[10px] py-[11px] px-[13px] bg-[#FFFFFF]">
                  {'\n        '}
                  <div className="text-[10.5px] tracking-[0.06em] uppercase text-[#A1A1AA] font-[600]">
                    {'Requires action'}
                  </div>
                  {'\n        '}
                  <div className="mt-[6px] flex items-baseline gap-[7px]">
                    {'\n          '}
                    <span className="[font-family:'IBM_Plex_Mono',monospace] text-[20px] font-[600] tracking-[-0.02em]">
                      {'17'}
                    </span>
                    {'\n          '}
                    <span className="text-[11px] text-[#B45309] bg-[#FEF3C7] rounded-[5px] py-[1px] px-[6px] font-[600]">
                      {'review'}
                    </span>
                    {'\n        '}
                  </div>
                  {'\n      '}
                </div>
                {'\n      '}
                <div className="[border:1px_solid_#E5E7EB] rounded-[10px] py-[11px] px-[13px] bg-[#FFFFFF]">
                  {'\n        '}
                  <div className="text-[10.5px] tracking-[0.06em] uppercase text-[#A1A1AA] font-[600]">
                    {'Signals this week'}
                  </div>
                  {'\n        '}
                  <div className="mt-[6px] [font-family:'IBM_Plex_Mono',monospace] text-[20px] font-[600] tracking-[-0.02em]">
                    {'642'}
                  </div>
                  {'\n      '}
                </div>
                {'\n    '}
              </div>
  )
}
