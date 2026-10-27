import { Fragment } from 'react'
import type { CopilotValues } from '../../types'

export function ChatThread({ m }: { m: CopilotValues }) {
  const { overview, reasons } = m
  return (
    <>
                              {'\n                '}
                              <div className="flex flex-col gap-[18px]">
                                {'\n                  '}
                                <div className="flex justify-end">
                                  {'\n                    '}
                                  <div className="[max-width:80%] bg-[#F4F4F6] [border:1px_solid_#EAEAEE] rounded-[12px_12px_4px_12px] py-[10px] px-[13px] text-[13px] leading-[1.55] text-[#27272A]">
                                    {
                                      "Find B2B SaaS companies with 50–500 employees that currently use HubSpot or Salesforce but don't have a unified GTM platform."
                                    }
                                  </div>
                                  {'\n                  '}
                                </div>
                                {'\n\n                  '}
                                <div className="flex gap-[11px]">
                                  {'\n                    '}
                                  <div className="w-[24px] h-[24px] flex-none rounded-[7px] bg-[#F1EDFC] flex items-center justify-center mt-[2px]">
                                    {'\n                      '}
                                    <svg
                                      width="13"
                                      height="13"
                                      viewBox="0 0 20 20"
                                      fill="none"
                                      stroke="#6D28D9"
                                      strokeWidth="1.7"
                                    >
                                      <path d="M10 2.6l1.9 4.5 4.5 1.9-4.5 1.9L10 15.4l-1.9-4.5L3.6 9l4.5-1.9z"></path>
                                    </svg>
                                    {'\n                    '}
                                  </div>
                                  {'\n                    '}
                                  <div className="flex-1 [min-width:0] flex flex-col gap-[13px]">
                                    {'\n                      '}
                                    <p className="m-[0] text-[13.5px] leading-[1.6] text-[#27272A]">
                                      <strong className="font-[650]">
                                        {'Found 42 qualifying accounts'}
                                      </strong>
                                      {
                                        ' from 1,284 tracked companies. I scanned CRM fingerprints, hiring boards, website intent and social activity from the last 7 days.'
                                      }
                                    </p>
                                    {'\n\n                      '}
                                    <div className="[border:1px_solid_#E8E8EC] rounded-[12px] bg-[#FBFBFC] py-[13px] px-[14px]">
                                      {'\n                        '}
                                      <div className="text-[10px] font-[650] text-[#A1A1AA] tracking-[.06em] uppercase mb-[10px]">
                                        {'Why these accounts?'}
                                      </div>
                                      {'\n                        '}
                                      <div className="flex flex-col gap-[6px]">
                                        {'\n                          '}
                                        {(reasons ?? []).map((r: any, __i: number) => (
                                          <Fragment key={__i}>
                                            {'\n                            '}
                                            <div className="flex items-start gap-[8px] text-[12.5px] text-[#52525B] leading-[1.5]">
                                              {'\n                              '}
                                              <span className="w-[4px] h-[4px] rounded-full bg-[#C4B5FD] mt-[7px] flex-none"></span>
                                              {'\n                              '}
                                              <span>
                                                <span>{r}</span>
                                              </span>
                                              {'\n                            '}
                                            </div>
                                            {'\n                          '}
                                          </Fragment>
                                        ))}
                                        {'\n                        '}
                                      </div>
                                      {'\n                        '}
                                      <div className="grid [grid-template-columns:repeat(4,1fr)] gap-[9px] mt-[12px] pt-[12px] [border-top:1px_solid_#EDEDF0]">
                                        {'\n                          '}
                                        {(overview ?? []).map((o: any, __i: number) => (
                                          <Fragment key={__i}>
                                            {'\n                            '}
                                            <div>
                                              {'\n                              '}
                                              <div className="text-[17px] font-[650] tracking-[-0.02em] tabular-nums">
                                                <span>{o.value}</span>
                                              </div>
                                              {'\n                              '}
                                              <div className="text-[10.5px] text-[#8E8E96] leading-[1.3] mt-[1px]">
                                                <span>{o.label}</span>
                                              </div>
                                              {'\n                            '}
                                            </div>
                                            {'\n                          '}
                                          </Fragment>
                                        ))}
                                        {'\n                        '}
                                      </div>
                                      {'\n                      '}
                                    </div>
                                    {'\n                    '}
                                  </div>
                                  {'\n                  '}
                                </div>
                                {'\n                '}
                              </div>
                              {'\n              '}
                            </>
  )
}
