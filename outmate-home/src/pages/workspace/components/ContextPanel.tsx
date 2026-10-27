import { Fragment } from 'react'
import { cssToObj } from '../../../lib/css'
import type { WorkspaceValues } from '../types'

export function ContextPanel({ m }: { m: WorkspaceValues }) {
  const { actions, closePanel, emptyBullets, explainGap, gtmRows, hasSelectedCompany, missing, noSelection, openDomain, openLinkedIn, people, recentAccounts, sel, signalCards, social, stackRows, tabOverview, tabPeople, tabSignals, tabSocial, tabStack, tabs, toggleContext } = m
  return (
    <>
                  {'\n      '}
                  <aside className="w-[348px] flex-none bg-[#FAFAFB] [border-left:1px_solid_#E5E5EA] flex flex-col [min-height:0] [animation:slidein_.16s_ease-out]">
                    {'\n\n        '}
                    {noSelection ? (
                      <>
                        {'\n          '}
                        <div className="flex-1 flex flex-col [min-height:0]">
                          {'\n            '}
                          <div className="py-[12px] px-[14px] bg-[#FFFFFF] [border-bottom:1px_solid_#EFEFF2] flex items-center justify-between">
                            {'\n              '}
                            <span className="text-[10.5px] font-[650] text-[#A1A1AA] tracking-[.05em] uppercase">
                              {'Account overview'}
                            </span>
                            {'\n              '}
                            <button
                              onClick={toggleContext}
                              className="w-[22px] h-[22px] [border:none] bg-transparent rounded-[5px] cursor-pointer text-[#A1A1AA] text-[14px] leading-[1] hv-u2196x"
                            >
                              {'×'}
                            </button>
                            {'\n            '}
                          </div>
                          {'\n            '}
                          <div className="py-[22px] px-[16px] [border-bottom:1px_solid_#EFEFF2]">
                            {'\n              '}
                            <div className="text-[12.5px] font-[600] text-[#3F3F46] mb-[8px]">
                              {'Select a company to see'}
                            </div>
                            {'\n              '}
                            {(emptyBullets ?? []).map((b: any, __i: number) => (
                              <Fragment key={__i}>
                                {'\n                '}
                                <div className="flex items-center gap-[8px] text-[11.5px] text-[#8E8E96] py-[3px] px-[0]">
                                  {'\n                  '}
                                  <span className="w-[4px] h-[4px] rounded-full bg-[#D4D4D8]"></span>
                                  <span>{b}</span>
                                  {'\n                '}
                                </div>
                                {'\n              '}
                              </Fragment>
                            ))}
                            {'\n            '}
                          </div>
                          {'\n            '}
                          <div className="py-[12px] px-[14px] overflow-y-auto [min-height:0]">
                            {'\n              '}
                            <div className="text-[10px] font-[650] text-[#A1A1AA] tracking-[.06em] uppercase mb-[8px]">
                              {'Recent high-intent accounts'}
                            </div>
                            {'\n              '}
                            {(recentAccounts ?? []).map((a: any, __i: number) => (
                              <Fragment key={__i}>
                                {'\n                '}
                                <div
                                  onClick={a.open}
                                  className="flex items-center gap-[9px] py-[8px] px-[9px] [border:1px_solid_#E8E8EC] bg-[#FFFFFF] rounded-[8px] mb-[6px] cursor-pointer hv-17mkows"
                                >
                                  {'\n                  '}
                                  <span
                                    style={cssToObj(
                                      `width:22px; height:22px; border-radius:6px; flex:none; display:flex; align-items:center; justify-content:center; font-size:9.5px; font-weight:700; color:#FFFFFF; background:${a.logoBg}`,
                                    )}
                                  >
                                    <span>{a.logo}</span>
                                  </span>
                                  {'\n                  '}
                                  <span className="[min-width:0] flex-1 flex flex-col">
                                    {'\n                    '}
                                    <span className="text-[11.5px] font-[600] overflow-hidden text-ellipsis whitespace-nowrap">
                                      <span>{a.name}</span>
                                    </span>
                                    {'\n                    '}
                                    <span className="text-[10px] text-[#A1A1AA]">
                                      <span>{a.meta}</span>
                                    </span>
                                    {'\n                  '}
                                  </span>
                                  {'\n                  '}
                                  <span className="text-[11px] font-[650] text-[#15803D] tabular-nums">
                                    <span>{a.intent}</span>
                                  </span>
                                  {'\n                '}
                                </div>
                                {'\n              '}
                              </Fragment>
                            ))}
                            {'\n            '}
                          </div>
                          {'\n          '}
                        </div>
                        {'\n        '}
                      </>
                    ) : null}
                    {'\n\n        '}
                    {hasSelectedCompany ? (
                      <>
                        {'\n          '}
                        <div className="flex-1 flex flex-col [min-height:0]">
                          {'\n            '}
                          <div className="flex-none pt-[12px] px-[14px] pb-[0] bg-[#FFFFFF] [border-bottom:1px_solid_#EFEFF2]">
                            {'\n              '}
                            <div className="flex items-start gap-[10px]">
                              {'\n                '}
                              <div
                                style={cssToObj(
                                  `width:34px; height:34px; border-radius:8px; color:#FFFFFF; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; flex:none; background:${sel.logoBg}`,
                                )}
                              >
                                <span>{sel.logo}</span>
                              </div>
                              {'\n                '}
                              <div className="flex-1 [min-width:0]">
                                {'\n                  '}
                                <div className="flex items-center gap-[6px]">
                                  {'\n                    '}
                                  <span className="text-[13.5px] font-[650] tracking-[-0.01em]">
                                    <span>{sel.name}</span>
                                  </span>
                                  {'\n                    '}
                                  <span style={cssToObj(sel.intentBadge)}>
                                    <span>{sel.intentLabel}</span>
                                  </span>
                                  {'\n                  '}
                                </div>
                                {'\n                  '}
                                <div className="text-[11px] text-[#8E8E96] mt-[2px]">
                                  <span>{sel.meta}</span>
                                </div>
                                {'\n                  '}
                                <div className="flex items-center gap-[8px] mt-[5px]">
                                  {'\n                    '}
                                  <span
                                    onClick={openDomain}
                                    style={cssToObj(
                                      'font-size:11px; color:#6D28D9; cursor:pointer; text-decoration:underline; text-decoration-color:#DDD6F3',
                                    )}
                                  >
                                    <span>{sel.domain}</span>
                                  </span>
                                  {'\n                    '}
                                  <span
                                    onClick={openLinkedIn}
                                    className="flex items-center gap-[4px] text-[11px] text-[#3F3F46] cursor-pointer"
                                  >
                                    {'\n                      '}
                                    <svg width="12" height="12" viewBox="0 0 20 20" fill="#0A66C2">
                                      <rect width="20" height="20" rx="3"></rect>
                                      <path
                                        d="M5 8h2v7H5zM6 4.6a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4zM9 8h2v1a2.6 2.6 0 014 2.3V15h-2v-3.3c0-.9-.5-1.4-1.2-1.4S10 10.9 10 11.8V15H9z"
                                        fill="#FFFFFF"
                                      ></path>
                                    </svg>
                                    {'\n                      LinkedIn\n                    '}
                                  </span>
                                  {'\n                  '}
                                </div>
                                {'\n                '}
                              </div>
                              {'\n                '}
                              <button
                                onClick={closePanel}
                                className="w-[22px] h-[22px] [border:none] bg-transparent rounded-[5px] cursor-pointer text-[#A1A1AA] text-[14px] leading-[1] flex-none hv-u2196x"
                              >
                                {'×'}
                              </button>
                              {'\n              '}
                            </div>
                            {'\n              '}
                            <div className="flex gap-[1px] mt-[10px] overflow-x-auto">
                              {'\n                '}
                              {(tabs ?? []).map((t: any, __i: number) => (
                                <Fragment key={__i}>
                                  {'\n                  '}
                                  <div onClick={t.pick} style={cssToObj(t.style)}>
                                    <span>{t.name}</span>
                                  </div>
                                  {'\n                '}
                                </Fragment>
                              ))}
                              {'\n              '}
                            </div>
                            {'\n            '}
                          </div>
                          {'\n\n            '}
                          <div className="flex-1 [min-height:0] overflow-y-auto pt-[13px] px-[14px] pb-[18px]">
                            {'\n\n              '}
                            {tabOverview ? (
                              <>
                                {'\n                '}
                                <div className="flex flex-col gap-[13px]">
                                  {'\n                  '}
                                  <div className="bg-[#FFFFFF] [border:1px_solid_#E8E8EC] rounded-[9px] py-[11px] px-[12px]">
                                    {'\n                    '}
                                    <div className="text-[10px] font-[650] text-[#A1A1AA] tracking-[.06em] uppercase mb-[9px]">
                                      {'GTM overview'}
                                    </div>
                                    {'\n                    '}
                                    {(gtmRows ?? []).map((g: any, __i: number) => (
                                      <Fragment key={__i}>
                                        {'\n                      '}
                                        <div className="flex items-center justify-between gap-[10px] py-[3px] px-[0]">
                                          {'\n                        '}
                                          <span className="text-[11.5px] text-[#71717A]">
                                            <span>{g.label}</span>
                                          </span>
                                          {'\n                        '}
                                          <span
                                            style={cssToObj(
                                              `font-size:11.5px; font-weight:600; color:${g.color}`,
                                            )}
                                          >
                                            <span>{g.value}</span>
                                          </span>
                                          {'\n                      '}
                                        </div>
                                        {'\n                    '}
                                      </Fragment>
                                    ))}
                                    {'\n                    '}
                                    <div className="h-[5px] rounded-[3px] bg-[#F1F1F3] overflow-hidden mt-[9px]">
                                      {'\n                      '}
                                      <div
                                        style={cssToObj(
                                          `height:100%; border-radius:3px; background:#22A15D; width:${sel.icpPct}`,
                                        )}
                                      ></div>
                                      {'\n                    '}
                                    </div>
                                    {'\n                  '}
                                  </div>
                                  {'\n\n                  '}
                                  <div className="bg-[#F8F5FF] [border:1px_solid_#E6DDFB] rounded-[9px] py-[11px] px-[12px]">
                                    {'\n                    '}
                                    <div className="text-[10px] font-[650] text-[#5B21B6] tracking-[.05em] uppercase mb-[6px]">
                                      {'Why this account matters'}
                                    </div>
                                    {'\n                    '}
                                    <p className="m-[0] text-[11.5px] leading-[1.55] text-[#4C3A7A]">
                                      <span>{sel.insight}</span>
                                    </p>
                                    {'\n                    '}
                                    <div className="mt-[8px] pt-[8px] [border-top:1px_solid_#E6DDFB] text-[11.5px] text-[#5B21B6] leading-[1.5]">
                                      <strong className="font-[650]">{'Recommendation:'}</strong>{' '}
                                      <span>{sel.rec}</span>
                                    </div>
                                    {'\n                  '}
                                  </div>
                                  {'\n\n                  '}
                                  <div>
                                    {'\n                    '}
                                    <div className="text-[10px] font-[650] text-[#A1A1AA] tracking-[.06em] uppercase mb-[7px]">
                                      {'GTM gap'}
                                    </div>
                                    {'\n                    '}
                                    <div
                                      onClick={explainGap}
                                      className="bg-[#FFFFFF] [border:1px_solid_#E8E8EC] rounded-[9px] py-[10px] px-[11px] text-[11.5px] text-[#52525B] leading-[1.5] cursor-pointer hv-lta693"
                                    >
                                      <span>{sel.gap}</span>
                                      {' — '}
                                      <span className="text-[#6D28D9]">{'why?'}</span>
                                    </div>
                                    {'\n                  '}
                                  </div>
                                  {'\n\n                  '}
                                  <div>
                                    {'\n                    '}
                                    <div className="text-[10px] font-[650] text-[#A1A1AA] tracking-[.06em] uppercase mb-[7px]">
                                      {'Recommended actions'}
                                    </div>
                                    {'\n                    '}
                                    {(actions ?? []).map((a: any, __i: number) => (
                                      <Fragment key={__i}>
                                        {'\n                      '}
                                        <div
                                          onClick={a.pick}
                                          className="flex items-center justify-between gap-[8px] py-[9px] px-[11px] bg-[#FFFFFF] [border:1px_solid_#E8E8EC] rounded-[8px] cursor-pointer mb-[6px] hv-17mkows"
                                        >
                                          {'\n                        '}
                                          <span className="text-[11.5px] font-[550] text-[#27272A]">
                                            <span>{a.label}</span>
                                          </span>
                                          {'\n                        '}
                                          <span className="text-[10.5px] text-[#A1A1AA]">
                                            <span>{a.cost}</span>
                                          </span>
                                          {'\n                      '}
                                        </div>
                                        {'\n                    '}
                                      </Fragment>
                                    ))}
                                    {'\n                  '}
                                  </div>
                                  {'\n                '}
                                </div>
                                {'\n              '}
                              </>
                            ) : null}
                            {'\n\n              '}
                            {tabSignals ? (
                              <>
                                {'\n                '}
                                <div className="flex flex-col">
                                  {'\n                  '}
                                  {(signalCards ?? []).map((s: any, __i: number) => (
                                    <Fragment key={__i}>
                                      {'\n                    '}
                                      <div onClick={s.open} className="flex gap-[10px] cursor-pointer">
                                        {'\n                      '}
                                        <div className="flex flex-col items-center flex-none w-[20px]">
                                          {'\n                        '}
                                          <span
                                            style={cssToObj(
                                              `width:9px; height:9px; border-radius:50%; margin-top:4px; background:${s.dot}`,
                                            )}
                                          ></span>
                                          {'\n                        '}
                                          <span className="flex-1 w-[1px] bg-[#EAEAEE]"></span>
                                          {'\n                      '}
                                        </div>
                                        {'\n                      '}
                                        <div className="flex-1 [min-width:0] pb-[12px]">
                                          {'\n                        '}
                                          <div className="flex items-center justify-between gap-[8px]">
                                            {'\n                          '}
                                            <span className="flex items-center gap-[6px] text-[11.5px] font-[650]">
                                              <span>{s.icon}</span> <span>{s.type}</span>
                                            </span>
                                            {'\n                          '}
                                            <span className="text-[10.5px] text-[#A1A1AA]">
                                              <span>{s.time}</span>
                                            </span>
                                            {'\n                        '}
                                          </div>
                                          {'\n                        '}
                                          <div className="text-[11.5px] text-[#52525B] mt-[3px] leading-[1.45]">
                                            <span>{s.detail}</span>
                                          </div>
                                          {'\n                        '}
                                          <div className="text-[11px] text-[#8E8E96] mt-[4px] leading-[1.45] italic">
                                            <span>{s.why}</span>
                                          </div>
                                          {'\n                        '}
                                          <div className="flex items-center gap-[7px] mt-[6px]">
                                            {'\n                          '}
                                            <span className="text-[10.5px] text-[#71717A]">
                                              <span>{s.source}</span>
                                            </span>
                                            {'\n                          '}
                                            <span className="w-[3px] h-[3px] rounded-full bg-[#D4D4D8]"></span>
                                            {'\n                          '}
                                            <span
                                              style={cssToObj(
                                                `font-size:10.5px; font-weight:600; color:${s.confColor}`,
                                              )}
                                            >
                                              <span>{s.confidence}</span>
                                            </span>
                                            {'\n                          '}
                                            <span style={cssToObj(s.strengthStyle)}>
                                              <span>{s.strength}</span>
                                            </span>
                                            {'\n                        '}
                                          </div>
                                          {'\n                      '}
                                        </div>
                                        {'\n                    '}
                                      </div>
                                      {'\n                  '}
                                    </Fragment>
                                  ))}
                                  {'\n                '}
                                </div>
                                {'\n              '}
                              </>
                            ) : null}
                            {'\n\n              '}
                            {tabPeople ? (
                              <>
                                {'\n                '}
                                <div className="flex flex-col gap-[6px]">
                                  {'\n                  '}
                                  {(people ?? []).map((p: any, __i: number) => (
                                    <Fragment key={__i}>
                                      {'\n                    '}
                                      <div className="bg-[#FFFFFF] [border:1px_solid_#E8E8EC] rounded-[9px] py-[10px] px-[11px]">
                                        {'\n                      '}
                                        <div className="flex items-center gap-[9px]">
                                          {'\n                        '}
                                          <div
                                            style={cssToObj(
                                              `width:28px; height:28px; border-radius:50%; flex:none; display:flex; align-items:center; justify-content:center; font-size:10.5px; font-weight:650; color:#3F3F46; background:${p.bg}`,
                                            )}
                                          >
                                            <span>{p.initials}</span>
                                          </div>
                                          {'\n                        '}
                                          <div className="flex-1 [min-width:0]">
                                            {'\n                          '}
                                            <div className="text-[12px] font-[600]">
                                              <span>{p.name}</span>
                                            </div>
                                            {'\n                          '}
                                            <div className="text-[10.5px] text-[#8E8E96]">
                                              <span>{p.title}</span>
                                              {' · '}
                                              <span>{p.dept}</span>
                                            </div>
                                            {'\n                        '}
                                          </div>
                                          {'\n                        '}
                                          <span style={cssToObj(p.badgeStyle)}>
                                            <span>{p.badge}</span>
                                          </span>
                                          {'\n                      '}
                                        </div>
                                        {'\n                      '}
                                        <div className="flex items-center gap-[6px] mt-[8px] pt-[8px] [border-top:1px_solid_#F4F4F6]">
                                          {'\n                        '}
                                          <span className="text-[10.5px] [font-family:'JetBrains_Mono',_monospace] text-[#52525B] overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                                            <span>{p.email}</span>
                                          </span>
                                          {'\n                        '}
                                          <span
                                            onClick={p.research}
                                            title="Research person"
                                            className="w-[22px] h-[22px] rounded-[5px] [border:1px_solid_#E8E8EC] flex items-center justify-center cursor-pointer hv-16bx3qz"
                                          >
                                            {'\n                          '}
                                            <svg
                                              width="11"
                                              height="11"
                                              viewBox="0 0 20 20"
                                              fill="none"
                                              stroke="#6D28D9"
                                              strokeWidth="1.7"
                                            >
                                              <circle cx="9" cy="9" r="5.6"></circle>
                                              <path d="M13.2 13.2L17 17"></path>
                                            </svg>
                                            {'\n                        '}
                                          </span>
                                          {'\n                        '}
                                          <span
                                            onClick={p.openLi}
                                            title="Open LinkedIn"
                                            className="w-[22px] h-[22px] rounded-[5px] [border:1px_solid_#E8E8EC] flex items-center justify-center cursor-pointer hv-8suzj2"
                                          >
                                            {'\n                          '}
                                            <svg
                                              width="11"
                                              height="11"
                                              viewBox="0 0 20 20"
                                              fill="#0A66C2"
                                            >
                                              <rect width="20" height="20" rx="3"></rect>
                                              <path
                                                d="M5 8h2v7H5zM6 4.6a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4zM9 8h2v1a2.6 2.6 0 014 2.3V15h-2v-3.3c0-.9-.5-1.4-1.2-1.4S10 10.9 10 11.8V15H9z"
                                                fill="#FFFFFF"
                                              ></path>
                                            </svg>
                                            {'\n                        '}
                                          </span>
                                          {'\n                        '}
                                          <span
                                            onClick={p.copyEmail}
                                            title="Copy email"
                                            className="w-[22px] h-[22px] rounded-[5px] [border:1px_solid_#E8E8EC] flex items-center justify-center cursor-pointer hv-16bx3qz"
                                          >
                                            {'\n                          '}
                                            <svg
                                              width="11"
                                              height="11"
                                              viewBox="0 0 20 20"
                                              fill="none"
                                              stroke="#52525B"
                                              strokeWidth="1.6"
                                            >
                                              <rect x="7" y="7" width="9.5" height="9.5" rx="2"></rect>
                                              <path d="M13 4.5H5.5a2 2 0 00-2 2V14"></path>
                                            </svg>
                                            {'\n                        '}
                                          </span>
                                          {'\n                        '}
                                          <span
                                            onClick={p.addOutreach}
                                            title="Add to outreach"
                                            className="w-[22px] h-[22px] rounded-[5px] [border:1px_solid_#E8E8EC] flex items-center justify-center cursor-pointer hv-16bx3qz"
                                          >
                                            {'\n                          '}
                                            <svg
                                              width="11"
                                              height="11"
                                              viewBox="0 0 20 20"
                                              fill="none"
                                              stroke="#52525B"
                                              strokeWidth="1.9"
                                            >
                                              <path d="M10 4.5v11M4.5 10h11"></path>
                                            </svg>
                                            {'\n                        '}
                                          </span>
                                          {'\n                      '}
                                        </div>
                                        {'\n                    '}
                                      </div>
                                      {'\n                  '}
                                    </Fragment>
                                  ))}
                                  {'\n                '}
                                </div>
                                {'\n              '}
                              </>
                            ) : null}
                            {'\n\n              '}
                            {tabSocial ? (
                              <>
                                {'\n                '}
                                <div className="flex flex-col gap-[7px]">
                                  {'\n                  '}
                                  {(social ?? []).map((s: any, __i: number) => (
                                    <Fragment key={__i}>
                                      {'\n                    '}
                                      <div className="bg-[#FFFFFF] [border:1px_solid_#E8E8EC] rounded-[9px] py-[10px] px-[11px]">
                                        {'\n                      '}
                                        <div className="flex items-center justify-between">
                                          {'\n                        '}
                                          <span className="flex items-center gap-[6px] text-[11px] font-[650] text-[#3F3F46]">
                                            {'\n                          '}
                                            <span
                                              style={cssToObj(
                                                `width:6px; height:6px; border-radius:2px; background:${s.dot}`,
                                              )}
                                            ></span>
                                            <span>{s.platform}</span>
                                            {'\n                        '}
                                          </span>
                                          {'\n                        '}
                                          <span className="text-[10.5px] text-[#A1A1AA]">
                                            <span>{s.time}</span>
                                          </span>
                                          {'\n                      '}
                                        </div>
                                        {'\n                      '}
                                        <p className="mt-[6px] mx-[0] mb-[0] text-[11.5px] leading-[1.5] text-[#52525B]">
                                          <span>{s.text}</span>
                                        </p>
                                        {'\n                      '}
                                        <div className="flex items-center justify-between mt-[7px]">
                                          {'\n                        '}
                                          <span className="text-[10.5px] text-[#A1A1AA]">
                                            <span>{s.author}</span>
                                          </span>
                                          {'\n                        '}
                                          <span className="text-[10.5px] text-[#8E8E96]">
                                            <span>{s.engagement}</span>
                                          </span>
                                          {'\n                      '}
                                        </div>
                                        {'\n                    '}
                                      </div>
                                      {'\n                  '}
                                    </Fragment>
                                  ))}
                                  {'\n                '}
                                </div>
                                {'\n              '}
                              </>
                            ) : null}
                            {'\n\n              '}
                            {tabStack ? (
                              <>
                                {'\n                '}
                                <div className="flex flex-col gap-[6px]">
                                  {'\n                  '}
                                  {(stackRows ?? []).map((t: any, __i: number) => (
                                    <Fragment key={__i}>
                                      {'\n                    '}
                                      <div className="bg-[#FFFFFF] [border:1px_solid_#E8E8EC] rounded-[9px] py-[10px] px-[11px]">
                                        {'\n                      '}
                                        <div className="flex items-center justify-between">
                                          {'\n                        '}
                                          <span className="text-[10px] font-[650] text-[#A1A1AA] tracking-[.05em] uppercase">
                                            <span>{t.category}</span>
                                          </span>
                                          {'\n                        '}
                                          <span style={cssToObj(t.confStyle)}>
                                            <span>{t.confidence}</span>
                                          </span>
                                          {'\n                      '}
                                        </div>
                                        {'\n                      '}
                                        <div className="flex items-center gap-[7px] mt-[6px]">
                                          {'\n                        '}
                                          <span
                                            style={cssToObj(
                                              `width:6px; height:6px; border-radius:50%; background:${t.dot}`,
                                            )}
                                          ></span>
                                          {'\n                        '}
                                          <span className="text-[12px] font-[600]">
                                            <span>{t.name}</span>
                                          </span>
                                          {'\n                      '}
                                        </div>
                                        {'\n                      '}
                                        <div className="flex items-center gap-[7px] mt-[6px] text-[10.5px] text-[#A1A1AA]">
                                          {'\n                        '}
                                          <span>
                                            <span>{t.source}</span>
                                          </span>
                                          {'\n                        '}
                                          <span className="w-[3px] h-[3px] rounded-full bg-[#D4D4D8]"></span>
                                          {'\n                        '}
                                          <span>
                                            {'last seen '}
                                            <span>{t.last}</span>
                                          </span>
                                          {'\n                      '}
                                        </div>
                                        {'\n                    '}
                                      </div>
                                      {'\n                  '}
                                    </Fragment>
                                  ))}
                                  {'\n                  '}
                                  <div className="bg-[#FFF8F1] [border:1px_solid_#FED7AA] rounded-[9px] py-[10px] px-[11px]">
                                    {'\n                    '}
                                    <div className="text-[10px] font-[650] text-[#C2410C] tracking-[.05em] uppercase mb-[6px]">
                                      {'Missing layers'}
                                    </div>
                                    {'\n                    '}
                                    {(missing ?? []).map((m: any, __i: number) => (
                                      <Fragment key={__i}>
                                        {'\n                      '}
                                        <div className="flex items-center gap-[7px] text-[11.5px] text-[#9A3412] py-[2px] px-[0]">
                                          {'\n                        '}
                                          <span className="w-[4px] h-[4px] rounded-full bg-[#EA580C]"></span>
                                          <span>{m}</span>
                                          {'\n                      '}
                                        </div>
                                        {'\n                    '}
                                      </Fragment>
                                    ))}
                                    {'\n                  '}
                                  </div>
                                  {'\n                '}
                                </div>
                                {'\n              '}
                              </>
                            ) : null}
                            {'\n            '}
                          </div>
                          {'\n          '}
                        </div>
                        {'\n        '}
                      </>
                    ) : null}
                    {'\n      '}
                  </aside>
                  {'\n    '}
                </>
  )
}
