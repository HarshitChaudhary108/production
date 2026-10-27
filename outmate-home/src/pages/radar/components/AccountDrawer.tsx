import { Fragment } from 'react'
import { cssToObj } from '../../../lib/css'
import type { RadarValues } from '../types'

export function AccountDrawer({
  m,
  selected,
}: {
  m: RadarValues
  selected: NonNullable<RadarValues['selected']>
}) {
  const { closeDrawer } = m
  return (
    <>
                {'\n    '}
                <div className="absolute top-[0] right-[0] bottom-[0] w-[468px] bg-[#FFFFFF] [border-left:1px_solid_#E5E7EB] shadow-[-14px_0_40px_rgba(24,24,27,0.10)] flex flex-col">
                  {'\n\n      '}
                  <div className="pt-[18px] px-[20px] pb-[14px] [border-bottom:1px_solid_#F1F1F3]">
                    {'\n        '}
                    <div className="flex items-start gap-[12px]">
                      {'\n          '}
                      <div className="w-[38px] h-[38px] rounded-[10px] bg-[#F5F3FF] text-[#6D28D9] text-[14px] font-[700] flex items-center justify-center">
                        <span>{selected.initials}</span>
                      </div>
                      {'\n          '}
                      <div className="flex-1">
                        {'\n            '}
                        <div className="flex items-center gap-[8px]">
                          {'\n              '}
                          <span className="text-[17px] font-[600] tracking-[-0.01em]">
                            <span>{selected.name}</span>
                          </span>
                          {'\n              '}
                          <span className="text-[10px] font-[700] tracking-[0.06em] uppercase text-[#6D28D9] bg-[#F5F3FF] rounded-[5px] py-[2px] px-[7px]">
                            <span>{selected.zone}</span>
                          </span>
                          {'\n            '}
                        </div>
                        {'\n            '}
                        <div className="mt-[3px] text-[12.5px] text-[#71717A]">
                          {'B2B SaaS · 201–500 employees · San Francisco'}
                        </div>
                        {'\n          '}
                      </div>
                      {'\n          '}
                      <button
                        onClick={closeDrawer}
                        className="w-[28px] h-[28px] [border:1px_solid_#E5E7EB] rounded-[8px] bg-[#FFFFFF] text-[#71717A] [font-family:inherit] text-[14px] leading-[1] cursor-pointer hv-udcbnb"
                      >
                        {'×'}
                      </button>
                      {'\n        '}
                    </div>
                    {'\n        '}
                    <div className="grid [grid-template-columns:repeat(4,1fr)] gap-[8px] mt-[14px]">
                      {'\n          '}
                      <div className="[border:1px_solid_#E5E7EB] rounded-[9px] py-[8px] px-[10px]">
                        {'\n            '}
                        <div className="text-[9.5px] tracking-[0.06em] uppercase text-[#A1A1AA] font-[600]">
                          {'ICP fit'}
                        </div>
                        {'\n            '}
                        <div className="[font-family:'IBM_Plex_Mono',monospace] text-[17px] font-[600]">
                          <span>{selected.fit}</span>
                        </div>
                        {'\n          '}
                      </div>
                      {'\n          '}
                      <div className="[border:1px_solid_#E5E7EB] rounded-[9px] py-[8px] px-[10px]">
                        {'\n            '}
                        <div className="text-[9.5px] tracking-[0.06em] uppercase text-[#A1A1AA] font-[600]">
                          {'Intent'}
                        </div>
                        {'\n            '}
                        <div className="[font-family:'IBM_Plex_Mono',monospace] text-[17px] font-[600]">
                          <span>{selected.intent}</span>
                        </div>
                        {'\n          '}
                      </div>
                      {'\n          '}
                      <div className="[border:1px_solid_#E5E7EB] rounded-[9px] py-[8px] px-[10px]">
                        {'\n            '}
                        <div className="text-[9.5px] tracking-[0.06em] uppercase text-[#A1A1AA] font-[600]">
                          {'Freshness'}
                        </div>
                        {'\n            '}
                        <div className="[font-family:'IBM_Plex_Mono',monospace] text-[17px] font-[600]">
                          <span>{selected.fresh}</span>
                        </div>
                        {'\n          '}
                      </div>
                      {'\n          '}
                      <div className="[border:1px_solid_#DDD6FE] bg-[#FBFAFF] rounded-[9px] py-[8px] px-[10px]">
                        {'\n            '}
                        <div className="text-[9.5px] tracking-[0.06em] uppercase text-[#7C3AED] font-[600]">
                          {'Signal'}
                        </div>
                        {'\n            '}
                        <div className="[font-family:'IBM_Plex_Mono',monospace] text-[17px] font-[600] text-[#5B21B6]">
                          <span>{selected.score}</span>
                        </div>
                        {'\n          '}
                      </div>
                      {'\n        '}
                    </div>
                    {'\n      '}
                  </div>
                  {'\n\n      '}
                  <div className="flex-1 overflow-y-auto pt-[16px] px-[20px] pb-[20px] flex flex-col gap-[18px]">
                    {'\n\n        '}
                    <div className="[border:1px_solid_#DDD6FE] bg-[#FBFAFF] rounded-[11px] py-[13px] px-[14px]">
                      {'\n          '}
                      <div className="flex items-center gap-[7px]">
                        {'\n            '}
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="#7C3AED"
                          strokeWidth="1.5"
                        >
                          <path d="M8 2l1.5 3.6L13 7.1 9.5 8.6 8 12.2 6.5 8.6 3 7.1l3.5-1.5z"></path>
                        </svg>
                        {'\n            '}
                        <span className="text-[10.5px] tracking-[0.08em] uppercase text-[#6D28D9] font-[700]">
                          {'Why now?'}
                        </span>
                        {'\n          '}
                      </div>
                      {'\n          '}
                      <p className="mt-[8px] mx-[0] mb-[0] text-[13px] leading-[1.6] text-[#3F3F46]">
                        <span>{selected.whyNow}</span>
                      </p>
                      {'\n        '}
                    </div>
                    {'\n\n        '}
                    <div>
                      {'\n          '}
                      <div className="text-[10.5px] tracking-[0.06em] uppercase text-[#A1A1AA] font-[600]">
                        {'Recent signals'}
                      </div>
                      {'\n          '}
                      <div className="mt-[11px] flex flex-col">
                        {'\n            '}
                        {(selected.timeline ?? []).map((t: any, __i: number) => (
                          <Fragment key={__i}>
                            {'\n              '}
                            <div className="grid [grid-template-columns:74px_1fr] gap-[12px] pb-[12px]">
                              {'\n                '}
                              <span className="[font-family:'IBM_Plex_Mono',monospace] text-[11px] text-[#A1A1AA] pt-[1px]">
                                <span>{t.when}</span>
                              </span>
                              {'\n                '}
                              <div className="[border-left:1px_solid_#E5E7EB] pt-[0] pr-[0] pb-[0] pl-[13px] relative">
                                {'\n                  '}
                                <span style={cssToObj(t.dotStyle)}></span>
                                {'\n                  '}
                                <div className="text-[13px] font-[500]">
                                  <span>{t.title}</span>
                                </div>
                                {'\n                  '}
                                <div className="mt-[2px] text-[11.5px] text-[#A1A1AA]">
                                  <span>{t.source}</span>
                                </div>
                                {'\n                '}
                              </div>
                              {'\n              '}
                            </div>
                            {'\n            '}
                          </Fragment>
                        ))}
                        {'\n          '}
                      </div>
                      {'\n        '}
                    </div>
                    {'\n\n        '}
                    <div>
                      {'\n          '}
                      <div className="flex items-center justify-between">
                        {'\n            '}
                        <span className="text-[10.5px] tracking-[0.06em] uppercase text-[#A1A1AA] font-[600]">
                          {'People'}
                        </span>
                        {'\n            '}
                        <span className="text-[11.5px] text-[#A1A1AA]">{'3 of 14 relevant'}</span>
                        {'\n          '}
                      </div>
                      {'\n          '}
                      <div className="mt-[10px] flex flex-col gap-[8px]">
                        {'\n            '}
                        {(selected.people ?? []).map((p: any, __i: number) => (
                          <Fragment key={__i}>
                            {'\n              '}
                            <div className="[border:1px_solid_#E5E7EB] rounded-[10px] py-[10px] px-[11px]">
                              {'\n                '}
                              <div className="flex items-center gap-[10px]">
                                {'\n                  '}
                                <div className="w-[30px] h-[30px] rounded-full bg-[#F4F4F5] text-[#52525B] text-[11px] font-[600] flex items-center justify-center">
                                  <span>{p.initials}</span>
                                </div>
                                {'\n                  '}
                                <div className="flex-1 [min-width:0]">
                                  {'\n                    '}
                                  <div className="text-[13px] font-[600]">
                                    <span>{p.name}</span>
                                  </div>
                                  {'\n                    '}
                                  <div className="text-[11.5px] text-[#71717A]">
                                    <span>{p.role}</span>
                                    {' · '}
                                    <span>{p.seniority}</span>
                                  </div>
                                  {'\n                  '}
                                </div>
                                {'\n                  '}
                                <div className="text-right">
                                  {'\n                    '}
                                  <div className="text-[9.5px] tracking-[0.06em] uppercase text-[#A1A1AA] font-[600]">
                                    {'Intent'}
                                  </div>
                                  {'\n                    '}
                                  <div className="[font-family:'IBM_Plex_Mono',monospace] text-[13px] font-[600] text-[#6D28D9]">
                                    <span>{p.intent}</span>
                                  </div>
                                  {'\n                  '}
                                </div>
                                {'\n                '}
                              </div>
                              {'\n                '}
                              <div className="mt-[8px] text-[11.5px] text-[#52525B]">
                                <span>{p.activity}</span>
                              </div>
                              {'\n                '}
                              <div className="flex gap-[6px] mt-[9px]">
                                {'\n                  '}
                                <button className="h-[26px] py-[0] px-[10px] [border:1px_solid_#E5E7EB] rounded-[7px] bg-[#FFFFFF] [font-family:inherit] text-[11.5px] text-[#3F3F46] cursor-pointer hv-udcbnb">
                                  {'Research'}
                                </button>
                                {'\n                  '}
                                <button className="h-[26px] py-[0] px-[10px] [border:1px_solid_#E5E7EB] rounded-[7px] bg-[#FFFFFF] [font-family:inherit] text-[11.5px] text-[#3F3F46] cursor-pointer hv-udcbnb">
                                  {'Find email'}
                                </button>
                                {'\n                  '}
                                <button className="h-[26px] py-[0] px-[10px] [border:1px_solid_#E5E7EB] rounded-[7px] bg-[#FFFFFF] [font-family:inherit] text-[11.5px] text-[#3F3F46] cursor-pointer hv-udcbnb">
                                  {'Add note'}
                                </button>
                                {'\n                  '}
                                <span className="ml-[auto] text-[11.5px] text-[#A1A1AA]">
                                  {'LinkedIn · Email ✓'}
                                </span>
                                {'\n                '}
                              </div>
                              {'\n              '}
                            </div>
                            {'\n            '}
                          </Fragment>
                        ))}
                        {'\n          '}
                      </div>
                      {'\n        '}
                    </div>
                    {'\n\n        '}
                    <div>
                      {'\n          '}
                      <div className="text-[10.5px] tracking-[0.06em] uppercase text-[#A1A1AA] font-[600]">
                        {'Tech stack'}
                      </div>
                      {'\n          '}
                      <div className="mt-[10px] grid [grid-template-columns:1fr_1fr] gap-[8px]">
                        {'\n            '}
                        {(selected.stack ?? []).map((t: any, __i: number) => (
                          <Fragment key={__i}>
                            {'\n              '}
                            <div className="[border:1px_solid_#E5E7EB] rounded-[9px] py-[9px] px-[11px]">
                              {'\n                '}
                              <div className="text-[10px] tracking-[0.06em] uppercase text-[#A1A1AA] font-[600]">
                                <span>{t.category}</span>
                              </div>
                              {'\n                '}
                              <div className="mt-[3px] text-[13px] font-[500]">
                                <span>{t.tool}</span>
                              </div>
                              {'\n              '}
                            </div>
                            {'\n            '}
                          </Fragment>
                        ))}
                        {'\n          '}
                      </div>
                      {'\n          '}
                      <div className="flex gap-[7px] mt-[9px]">
                        {'\n            '}
                        <span className="text-[11.5px] font-[600] text-[#15803D] bg-[#F0FDF4] [border:1px_solid_#BBF7D0] rounded-[6px] py-[3px] px-[8px]">
                          {'+ Outreach'}
                        </span>
                        {'\n            '}
                        <span className="text-[11.5px] font-[600] text-[#B91C1C] bg-[#FEF2F2] [border:1px_solid_#FECACA] rounded-[6px] py-[3px] px-[8px]">
                          {'− Salesforce'}
                        </span>
                        {'\n            '}
                        <span className="text-[11.5px] text-[#A1A1AA] py-[3px] px-[0]">
                          {'detected 8 days ago'}
                        </span>
                        {'\n          '}
                      </div>
                      {'\n        '}
                    </div>
                    {'\n\n        '}
                    <div>
                      {'\n          '}
                      <div className="text-[10.5px] tracking-[0.06em] uppercase text-[#A1A1AA] font-[600]">
                        {'Social'}
                      </div>
                      {'\n          '}
                      <div className="mt-[10px] [border:1px_solid_#E5E7EB] rounded-[10px] py-[11px] px-[12px]">
                        {'\n            '}
                        <div className="flex items-center gap-[9px]">
                          {'\n              '}
                          <div className="w-[28px] h-[28px] rounded-full bg-[#F4F4F5] text-[#52525B] text-[11px] font-[600] flex items-center justify-center">
                            {'SC'}
                          </div>
                          {'\n              '}
                          <div className="flex-1">
                            {'\n                '}
                            <div className="text-[12.5px] font-[600]">{'Sarah Chen'}</div>
                            {'\n                '}
                            <div className="text-[11.5px] text-[#71717A]">
                              {'VP Sales · LinkedIn · 3h ago'}
                            </div>
                            {'\n              '}
                          </div>
                          {'\n              '}
                          <span className="text-[11px] text-[#A1A1AA]">
                            {'42 reactions · 8 comments'}
                          </span>
                          {'\n            '}
                        </div>
                        {'\n            '}
                        <div className="mt-[9px] py-[9px] px-[11px] [border-left:2px_solid_#E4E4E7] bg-[#FAFAFA] rounded-[0_8px_8px_0] text-[12.5px] text-[#3F3F46] leading-[1.5]">
                          {'"We need to rethink how our GTM team operates as we scale."'}
                        </div>
                        {'\n            '}
                        <div className="mt-[9px] text-[12px] text-[#52525B]">
                          <span className="text-[#6D28D9] font-[600]">{'AI signal:'}</span>
                          {' Strong pain / change signal from the economic buyer.'}
                        </div>
                        {'\n          '}
                      </div>
                      {'\n        '}
                    </div>
                    {'\n\n        '}
                    <div>
                      {'\n          '}
                      <div className="text-[10.5px] tracking-[0.06em] uppercase text-[#A1A1AA] font-[600]">
                        {'Notes'}
                      </div>
                      {'\n          '}
                      <div className="mt-[10px] [border:1px_solid_#E5E7EB] rounded-[10px] py-[10px] px-[11px]">
                        {'\n            '}
                        <input
                          placeholder="Add note…"
                          className="w-full [border:none] outline-none [font-family:inherit] text-[12.5px] text-[#18181B] bg-transparent"
                        />
                        {'\n            '}
                        <div className="flex items-center gap-[7px] mt-[9px] pt-[9px] [border-top:1px_solid_#F4F4F5]">
                          {'\n              '}
                          <span className="text-[11.5px] text-[#71717A]">{'Pin'}</span>
                          {'\n              '}
                          <span className="text-[11.5px] text-[#71717A]">{'Tag'}</span>
                          {'\n              '}
                          <span className="text-[11.5px] text-[#71717A]">{'Convert to task'}</span>
                          {'\n              '}
                          <span className="ml-[auto] text-[11px] text-[#A1A1AA]">{'GA · today'}</span>
                          {'\n            '}
                        </div>
                        {'\n          '}
                      </div>
                      {'\n        '}
                    </div>
                    {'\n\n        '}
                    <div className="[border:1px_solid_#DDD6FE] rounded-[11px] overflow-hidden">
                      {'\n          '}
                      <div className="flex items-center gap-[7px] py-[11px] px-[13px] bg-[#F5F3FF] [border-bottom:1px_solid_#EDE9FE]">
                        {'\n            '}
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="#6D28D9"
                          strokeWidth="1.5"
                        >
                          <path d="M8 2l1.5 3.6L13 7.1 9.5 8.6 8 12.2 6.5 8.6 3 7.1l3.5-1.5z"></path>
                        </svg>
                        {'\n            '}
                        <span className="text-[10.5px] tracking-[0.08em] uppercase text-[#5B21B6] font-[700]">
                          {'Outmate recommends'}
                        </span>
                        {'\n          '}
                      </div>
                      {'\n          '}
                      <div className="flex flex-col">
                        {'\n            '}
                        {(selected.recs ?? []).map((r: any, __i: number) => (
                          <Fragment key={__i}>
                            {'\n              '}
                            <div className="py-[12px] px-[13px] [border-bottom:1px_solid_#F4F4F5] flex gap-[11px]">
                              {'\n                '}
                              <span className="[font-family:'IBM_Plex_Mono',monospace] text-[11px] text-[#C4B5FD] font-[600] pt-[2px]">
                                <span>{r.rank}</span>
                              </span>
                              {'\n                '}
                              <div className="flex-1">
                                {'\n                  '}
                                <div className="text-[13px] font-[600]">
                                  <span>{r.title}</span>
                                </div>
                                {'\n                  '}
                                <div className="mt-[3px] text-[11.5px] text-[#71717A] leading-[1.45]">
                                  <span>{r.reason}</span>
                                </div>
                                {'\n                  '}
                                <div className="flex gap-[6px] mt-[9px]">
                                  {'\n                    '}
                                  <button className="h-[27px] py-[0] px-[12px] [border:1px_solid_#6D28D9] rounded-[7px] bg-[#6D28D9] text-[#FFFFFF] [font-family:inherit] text-[11.5px] font-[600] cursor-pointer hv-jdi8ic">
                                    {'Do it'}
                                  </button>
                                  {'\n                    '}
                                  <button className="h-[27px] py-[0] px-[11px] [border:1px_solid_#E5E7EB] rounded-[7px] bg-[#FFFFFF] text-[#3F3F46] [font-family:inherit] text-[11.5px] cursor-pointer hv-udcbnb">
                                    {'Review'}
                                  </button>
                                  {'\n                    '}
                                  <button className="h-[27px] py-[0] px-[11px] [border:none] bg-transparent text-[#A1A1AA] [font-family:inherit] text-[11.5px] cursor-pointer hv-1kpeumh">
                                    {'Dismiss'}
                                  </button>
                                  {'\n                  '}
                                </div>
                                {'\n                '}
                              </div>
                              {'\n              '}
                            </div>
                            {'\n            '}
                          </Fragment>
                        ))}
                        {'\n          '}
                      </div>
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
