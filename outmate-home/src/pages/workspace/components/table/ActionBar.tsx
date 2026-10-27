import { cssToObj } from '../../../../lib/css'
import type { WorkspaceValues } from '../../types'

export function ActionBar({ m }: { m: WorkspaceValues }) {
  const { barCost, barCostLabel, barDone, barIdle, barInsufficient, barRows, barRunning, cancelJob, clearSelection, creditsNum, deleteSelected, dismissJob, exportSelected, jobFailedLabel, jobHasFailed, jobPct, jobProgress, jobRemaining, jobSpent, jobSummary, openCredits, retryFailed, runRowsStyle, runSelected } = m
  return (
    <>
                          {'\n            '}
                          <div className="absolute left-[50%] bottom-[20px] [transform:translateX(-50%)] z-[58] [min-width:520px] bg-[#FFFFFF] [border:1px_solid_#E1E1E6] rounded-[10px] shadow-[0_18px_44px_rgba(24,24,27,.20)] overflow-hidden">
                            {'\n\n              '}
                            {barIdle ? (
                              <>
                                {'\n                '}
                                <div className="flex items-center gap-[11px] py-[9px] px-[11px]">
                                  {'\n                  '}
                                  <span className="text-[12px] text-[#71717A]">
                                    <strong className="font-[650] text-[#18181B] tabular-nums">
                                      <span>{barRows}</span>
                                    </strong>
                                    {' rows'}
                                  </span>
                                  {'\n                  '}
                                  <span className="w-[1px] h-[18px] bg-[#EDEDF0]"></span>
                                  {'\n                  '}
                                  <span className="text-[11px] text-[#8E8E96] tabular-nums whitespace-nowrap">
                                    <span>{barCostLabel}</span>
                                  </span>
                                  {'\n                  '}
                                  <span className="w-[1px] h-[18px] bg-[#EDEDF0] ml-[auto]"></span>
                                  {'\n                  '}
                                  <button
                                    onClick={exportSelected}
                                    className="h-[27px] py-[0] px-[9px] [border:1px_solid_transparent] bg-transparent text-[#71717A] rounded-[6px] text-[11.5px] font-[550] cursor-pointer hv-1jlrkq0"
                                  >
                                    {'Export'}
                                  </button>
                                  {'\n                  '}
                                  <button
                                    onClick={clearSelection}
                                    className="flex items-center gap-[6px] h-[27px] py-[0] px-[10px] [border:1px_solid_#E4E4E8] bg-[#FFFFFF] text-[#3F3F46] rounded-[6px] text-[11.5px] font-[600] cursor-pointer hv-u4v0t1"
                                  >
                                    {'\n                    '}
                                    <svg
                                      width="11"
                                      height="11"
                                      viewBox="0 0 20 20"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.8"
                                    >
                                      <rect x="3.5" y="3.5" width="13" height="13" rx="2.5"></rect>
                                    </svg>
                                    {'\n                    Cancel\n                  '}
                                  </button>
                                  {'\n                  '}
                                  <button
                                    onClick={deleteSelected}
                                    className="flex items-center gap-[6px] h-[27px] py-[0] px-[10px] [border:1px_solid_#FADCDC] bg-[#FFFFFF] text-[#DC2626] rounded-[6px] text-[11.5px] font-[600] cursor-pointer hv-ug5na5"
                                  >
                                    {'\n                    '}
                                    <svg
                                      width="11"
                                      height="11"
                                      viewBox="0 0 20 20"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.7"
                                    >
                                      <path d="M4.5 6h11M8 6V4.5h4V6M6 6l.7 9.5h6.6L14 6"></path>
                                    </svg>
                                    {'\n                    Delete\n                  '}
                                  </button>
                                  {'\n                  '}
                                  <button onClick={runSelected} style={cssToObj(runRowsStyle)}>
                                    {'\n                    '}
                                    <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M6 4l9 6-9 6z"></path>
                                    </svg>
                                    {'\n                    Run rows\n                  '}
                                  </button>
                                  {'\n                '}
                                </div>
                                {'\n                '}
                                {barInsufficient ? (
                                  <>
                                    {'\n                  '}
                                    <div className="flex items-center gap-[9px] py-[7px] px-[11px] bg-[#FFF8F1] [border-top:1px_solid_#FDE4CB]">
                                      {'\n                    '}
                                      <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        stroke="#EA580C"
                                        strokeWidth="1.9"
                                        className="flex-none"
                                      >
                                        <path d="M11 2.5L4.5 11.5H9l-.6 6 6.6-9H10.4z"></path>
                                      </svg>
                                      {'\n                    '}
                                      <span className="text-[11px] text-[#C2410C]">
                                        {'Not enough credits — '}
                                        <span>{barCost}</span>
                                        {' needed, '}
                                        <span>{creditsNum}</span>
                                        {' available. Nothing will run.'}
                                      </span>
                                      {'\n                    '}
                                      <button
                                        onClick={openCredits}
                                        className="ml-[auto] h-[24px] py-[0] px-[9px] [border:1px_solid_#F3C99B] bg-[#FFFFFF] text-[#C2410C] rounded-[5px] text-[11px] font-[600] cursor-pointer hv-ugv35u"
                                      >
                                        {'Top up credits'}
                                      </button>
                                      {'\n                  '}
                                    </div>
                                    {'\n                '}
                                  </>
                                ) : null}
                                {'\n              '}
                              </>
                            ) : null}
                            {'\n\n              '}
                            {barRunning ? (
                              <>
                                {'\n                '}
                                <div>
                                  {'\n                  '}
                                  <div className="flex items-center gap-[11px] py-[9px] px-[11px]">
                                    {'\n                    '}
                                    <span className="w-[7px] h-[7px] rounded-full bg-[#2563EB] [animation:pulse_1.1s_ease-in-out_infinite] flex-none"></span>
                                    {'\n                    '}
                                    <span className="text-[12px] font-[650] text-[#18181B] tabular-nums whitespace-nowrap">
                                      <span>{jobProgress}</span>
                                    </span>
                                    {'\n                    '}
                                    <span className="text-[11px] text-[#8E8E96] tabular-nums whitespace-nowrap">
                                      <span>{jobRemaining}</span>
                                    </span>
                                    {'\n                    '}
                                    <span className="w-[1px] h-[18px] bg-[#EDEDF0] ml-[auto]"></span>
                                    {'\n                    '}
                                    <span className="text-[11px] text-[#8E8E96] whitespace-nowrap">
                                      <span>{jobSpent}</span>
                                    </span>
                                    {'\n                    '}
                                    <button
                                      onClick={cancelJob}
                                      className="h-[27px] py-[0] px-[10px] [border:1px_solid_#E4E4E8] bg-[#FFFFFF] text-[#3F3F46] rounded-[6px] text-[11.5px] font-[600] cursor-pointer hv-u4v0t1"
                                    >
                                      {'Cancel run'}
                                    </button>
                                    {'\n                  '}
                                  </div>
                                  {'\n                  '}
                                  <div className="h-[2px] bg-[#F1F1F3]">
                                    {'\n                    '}
                                    <div
                                      style={cssToObj(
                                        `height:100%; background:#2563EB; width:${jobPct}; transition:width .25s ease-out`,
                                      )}
                                    ></div>
                                    {'\n                  '}
                                  </div>
                                  {'\n                '}
                                </div>
                                {'\n              '}
                              </>
                            ) : null}
                            {'\n\n              '}
                            {barDone ? (
                              <>
                                {'\n                '}
                                <div className="flex items-center gap-[11px] py-[9px] px-[11px]">
                                  {'\n                  '}
                                  <span className="text-[12px] font-[650] text-[#18181B] tabular-nums whitespace-nowrap">
                                    <span>{jobSummary}</span>
                                  </span>
                                  {'\n                  '}
                                  <span className="text-[11px] text-[#8E8E96] whitespace-nowrap">
                                    <span>{jobSpent}</span>
                                  </span>
                                  {'\n                  '}
                                  <span className="w-[1px] h-[18px] bg-[#EDEDF0] ml-[auto]"></span>
                                  {'\n                  '}
                                  {jobHasFailed ? (
                                    <>
                                      {'\n                    '}
                                      <button
                                        onClick={retryFailed}
                                        className="h-[27px] py-[0] px-[10px] [border:1px_solid_#FADCDC] bg-[#FFFFFF] text-[#B91C1C] rounded-[6px] text-[11.5px] font-[600] cursor-pointer hv-ug5na5"
                                      >
                                        <span>{jobFailedLabel}</span>
                                      </button>
                                      {'\n                  '}
                                    </>
                                  ) : null}
                                  {'\n                  '}
                                  <button
                                    onClick={dismissJob}
                                    className="h-[27px] py-[0] px-[12px] [border:1px_solid_#18181B] bg-[#18181B] text-[#FFFFFF] rounded-[6px] text-[11.5px] font-[600] cursor-pointer hv-fs93b6"
                                  >
                                    {'Done'}
                                  </button>
                                  {'\n                '}
                                </div>
                                {'\n              '}
                              </>
                            ) : null}
                            {'\n            '}
                          </div>
                          {'\n          '}
                        </>
  )
}
