import { Fragment } from 'react'
import type { CopilotValues } from '../../types'

export function FollowUp({ m }: { m: CopilotValues }) {
  const { copy, copyLabel, creditsNum, dislike, dislikeColor, dismissTopUp, followUps, like, likeColor, openCredits, regenLabel, regenerate, showTopUpCard } = m
  return (
    <>
                              {'\n                '}
                              <div className="flex flex-col gap-[13px] pl-[35px]">
                                {'\n                  '}
                                <div className="flex items-center gap-[2px]">
                                  {'\n                    '}
                                  <button
                                    onClick={like}
                                    className="w-[26px] h-[26px] flex items-center justify-center [border:none] bg-transparent rounded-[6px] cursor-pointer hv-u45kwi"
                                  >
                                    {'\n                      '}
                                    <svg
                                      width="14"
                                      height="14"
                                      viewBox="0 0 20 20"
                                      fill="none"
                                      stroke={likeColor}
                                      strokeWidth="1.5"
                                    >
                                      <path d="M6.5 17V8.4l3.4-5a1.4 1.4 0 012.5.8v3.4h3.2a1.5 1.5 0 011.5 1.8l-1.1 5.4A1.9 1.9 0 0114.1 17z"></path>
                                      <path d="M6.5 8.6H3.8V17h2.7"></path>
                                    </svg>
                                    {'\n                    '}
                                  </button>
                                  {'\n                    '}
                                  <button
                                    onClick={dislike}
                                    className="w-[26px] h-[26px] flex items-center justify-center [border:none] bg-transparent rounded-[6px] cursor-pointer hv-u45kwi"
                                  >
                                    {'\n                      '}
                                    <svg
                                      width="14"
                                      height="14"
                                      viewBox="0 0 20 20"
                                      fill="none"
                                      stroke={dislikeColor}
                                      strokeWidth="1.5"
                                    >
                                      <path d="M13.5 3v8.6l-3.4 5a1.4 1.4 0 01-2.5-.8v-3.4H4.4a1.5 1.5 0 01-1.5-1.8l1.1-5.4A1.9 1.9 0 015.9 3z"></path>
                                      <path d="M13.5 11.4h2.7V3h-2.7"></path>
                                    </svg>
                                    {'\n                    '}
                                  </button>
                                  {'\n                    '}
                                  <div className="w-[1px] h-[15px] bg-[#EAEAEE] my-[0] mx-[5px]"></div>
                                  {'\n                    '}
                                  <button
                                    onClick={copy}
                                    className="h-[26px] py-[0] px-[8px] flex items-center gap-[5px] [border:none] bg-transparent rounded-[6px] cursor-pointer text-[11.5px] text-[#8E8E96] hv-jj6th"
                                  >
                                    {'\n                      '}
                                    <svg
                                      width="13"
                                      height="13"
                                      viewBox="0 0 20 20"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                    >
                                      <rect x="7" y="7" width="9.5" height="9.5" rx="2"></rect>
                                      <path d="M13 4.5H5.5a2 2 0 00-2 2V14"></path>
                                    </svg>
                                    {'\n                      '}
                                    <span>{copyLabel}</span>
                                    {'\n                    '}
                                  </button>
                                  {'\n                    '}
                                  <button
                                    onClick={regenerate}
                                    className="h-[26px] py-[0] px-[8px] flex items-center gap-[5px] [border:none] bg-transparent rounded-[6px] cursor-pointer text-[11.5px] text-[#8E8E96] hv-jj6th"
                                  >
                                    {'\n                      '}
                                    <svg
                                      width="13"
                                      height="13"
                                      viewBox="0 0 20 20"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                    >
                                      <path d="M16 10a6 6 0 11-1.9-4.4M16 3.4V7h-3.6"></path>
                                    </svg>
                                    {'\n                      '}
                                    <span>{regenLabel}</span>
                                    {'\n                    '}
                                  </button>
                                  {'\n                    '}
                                  <button className="h-[26px] py-[0] px-[8px] flex items-center gap-[5px] [border:none] bg-transparent rounded-[6px] cursor-pointer text-[11.5px] text-[#8E8E96] hv-jj6th">
                                    {'\n                      '}
                                    <svg
                                      width="13"
                                      height="13"
                                      viewBox="0 0 20 20"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                    >
                                      <circle cx="15" cy="5" r="2.2"></circle>
                                      <circle cx="5" cy="10" r="2.2"></circle>
                                      <circle cx="15" cy="15" r="2.2"></circle>
                                      <path d="M7 8.9l6-2.8M7 11.1l6 2.8"></path>
                                    </svg>
                                    {'\n                      Share\n                    '}
                                  </button>
                                  {'\n                  '}
                                </div>
                                {'\n\n                  '}
                                <div className="[border-top:1px_solid_#F1F1F3] pt-[11px]">
                                  {'\n                    '}
                                  <div className="text-[11px] font-[650] text-[#A1A1AA] tracking-[.04em] uppercase mb-[5px]">
                                    {'Suggested follow-ups'}
                                  </div>
                                  {'\n                    '}
                                  {(followUps ?? []).map((f: any, __i: number) => (
                                    <Fragment key={__i}>
                                      {'\n                      '}
                                      <div
                                        onClick={f.pick}
                                        className="flex items-center gap-[10px] py-[9px] px-[8px] [border-bottom:1px_solid_#F4F4F6] cursor-pointer rounded-[6px] hv-udcbnc"
                                      >
                                        {'\n                        '}
                                        <span className="w-[16px] flex-none flex items-center justify-center">
                                          {'\n                          '}
                                          <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 20 20"
                                            fill="none"
                                            stroke="#A78BFA"
                                            strokeWidth="1.6"
                                          >
                                            <path d="M10 3l1.7 4 4 1.7-4 1.7L10 14.4l-1.7-4-4-1.7 4-1.7z"></path>
                                          </svg>
                                          {'\n                        '}
                                        </span>
                                        {'\n                        '}
                                        <span className="flex-1 text-[12.5px] text-[#3F3F46] leading-[1.45]">
                                          <span>{f.text}</span>
                                        </span>
                                        {'\n                        '}
                                        <svg
                                          width="13"
                                          height="13"
                                          viewBox="0 0 20 20"
                                          fill="none"
                                          stroke="#C4C4CB"
                                          strokeWidth="1.8"
                                        >
                                          <path d="M4 10h11M11 6l4 4-4 4"></path>
                                        </svg>
                                        {'\n                      '}
                                      </div>
                                      {'\n                    '}
                                    </Fragment>
                                  ))}
                                  {'\n                  '}
                                </div>
                                {'\n\n                  '}
                                {showTopUpCard ? (
                                  <>
                                    {'\n                    '}
                                    <div className="[border:1px_solid_#FED7AA] bg-[#FFF8F1] rounded-[10px] py-[12px] px-[13px] flex items-start gap-[10px]">
                                      {'\n                      '}
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        stroke="#EA580C"
                                        strokeWidth="1.7"
                                        className="mt-[1px] flex-none"
                                      >
                                        <path d="M10 3.2l7 12.4H3z"></path>
                                        <path d="M10 8v3.4"></path>
                                        <circle
                                          cx="10"
                                          cy="13.6"
                                          r=".7"
                                          fill="#EA580C"
                                          stroke="none"
                                        ></circle>
                                      </svg>
                                      {'\n                      '}
                                      <div className="flex-1 [min-width:0]">
                                        {'\n                        '}
                                        <div className="text-[12.5px] font-[650] text-[#9A3412]">
                                          {'Not enough credits to complete this enrichment'}
                                        </div>
                                        {'\n                        '}
                                        <div className="text-[12px] text-[#B45309] leading-[1.5] mt-[2px]">
                                          {'Enriching all 42 accounts requires '}
                                          <strong className="font-[650]">{'420 credits'}</strong>
                                          {'. You currently have '}
                                          <span>{creditsNum}</span>
                                          {'. The run resumes automatically once you top up.'}
                                        </div>
                                        {'\n                        '}
                                        <div className="flex gap-[7px] mt-[9px]">
                                          {'\n                          '}
                                          <button
                                            onClick={openCredits}
                                            className="h-[27px] py-[0] px-[11px] [border:1px_solid_#EA580C] bg-[#EA580C] text-[#FFFFFF] rounded-[7px] text-[11.5px] font-[600] cursor-pointer hv-s4gde7"
                                          >
                                            {'Top up credits'}
                                          </button>
                                          {'\n                          '}
                                          <button
                                            onClick={dismissTopUp}
                                            className="h-[27px] py-[0] px-[11px] [border:1px_solid_#F3D3B3] bg-[#FFFFFF] text-[#9A3412] rounded-[7px] text-[11.5px] font-[550] cursor-pointer hv-ugv405"
                                          >
                                            {'Cancel'}
                                          </button>
                                          {'\n                        '}
                                        </div>
                                        {'\n                      '}
                                      </div>
                                      {'\n                    '}
                                    </div>
                                    {'\n                  '}
                                  </>
                                ) : null}
                                {'\n                '}
                              </div>
                              {'\n              '}
                            </>
  )
}
