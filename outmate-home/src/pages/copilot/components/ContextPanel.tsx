import { Fragment } from 'react'
import { cssToObj } from '../../../lib/css'
import type { CopilotValues } from '../types'

export function ContextPanel({ m }: { m: CopilotValues }) {
  const { actions, gtmRows, hasSelectedCompany, missing, noSelection, people, recentAccounts, sel, signalCards, social, stack, tabOverview, tabPeople, tabSignals, tabSocial, tabStack, tabs, toggleContext } = m
  return (
    <>
                  {'\n      '}
                  <aside className="w-[352px] flex-none bg-[#FBFBFC] [border-left:1px_solid_#E8E8EC] flex flex-col [min-height:0] [animation:slidein_.16s_ease-out]">
                    {'\n\n        '}
                    {noSelection ? (
                      <>
                        {'\n          '}
                        <div className="flex-1 flex flex-col [min-height:0]">
                          {'\n            '}
                          <div className="pt-[14px] px-[16px] pb-[12px] bg-[#FFFFFF] [border-bottom:1px_solid_#EFEFF2] flex items-center justify-between">
                            {'\n              '}
                            <span className="text-[10.5px] font-[650] text-[#A1A1AA] tracking-[.05em] uppercase">
                              {'Target account context'}
                            </span>
                            {'\n              '}
                            <button
                              onClick={toggleContext}
                              className="w-[22px] h-[22px] [border:none] bg-transparent rounded-[6px] cursor-pointer text-[#A1A1AA] text-[14px] leading-[1] hv-u2196x"
                            >
                              {'×'}
                            </button>
                            {'\n            '}
                          </div>
                          {'\n            '}
                          <div className="py-[26px] px-[18px] text-center [border-bottom:1px_solid_#EFEFF2]">
                            {'\n              '}
                            <div className="w-[34px] h-[34px] rounded-[9px] bg-[#F1EDFC] flex items-center justify-center mt-[0] mx-[auto] mb-[9px]">
                              {'\n                '}
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 20 20"
                                fill="none"
                                stroke="#8B72C7"
                                strokeWidth="1.6"
                              >
                                <circle cx="10" cy="10" r="7"></circle>
                                <circle cx="10" cy="10" r="2.6"></circle>
                              </svg>
                              {'\n              '}
                            </div>
                            {'\n              '}
                            <div className="text-[12.5px] font-[600] text-[#3F3F46]">
                              {'Select an account to inspect'}
                            </div>
                            {'\n              '}
                            <div className="text-[11.5px] text-[#A1A1AA] leading-[1.5] mt-[3px]">
                              {'Click any row, preview icon or Radar bubble.'}
                            </div>
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
                                  className="flex items-center gap-[9px] py-[8px] px-[9px] [border:1px_solid_#E8E8EC] bg-[#FFFFFF] rounded-[9px] mb-[6px] cursor-pointer hv-17mkows"
                                >
                                  {'\n                  '}
                                  <span
                                    style={cssToObj(
                                      `width:24px; height:24px; border-radius:7px; flex:none; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:#FFFFFF; background:${a.logoBg}`,
                                    )}
                                  >
                                    <span>{a.logo}</span>
                                  </span>
                                  {'\n                  '}
                                  <span className="[min-width:0] flex-1 flex flex-col">
                                    {'\n                    '}
                                    <span className="text-[12px] font-[600] overflow-hidden text-ellipsis whitespace-nowrap">
                                      <span>{a.name}</span>
                                    </span>
                                    {'\n                    '}
                                    <span className="text-[10.5px] text-[#A1A1AA]">
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
                          <div className="flex-none pt-[14px] px-[16px] pb-[12px] bg-[#FFFFFF] [border-bottom:1px_solid_#EFEFF2]">
                            {'\n              '}
                            <div className="flex items-start gap-[11px]">
                              {'\n                '}
                              <div
                                style={cssToObj(
                                  `width:36px; height:36px; border-radius:9px; color:#FFFFFF; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; flex:none; background:${sel.logoBg}`,
                                )}
                              >
                                <span>{sel.logo}</span>
                              </div>
                              {'\n                '}
                              <div className="flex-1 [min-width:0]">
                                {'\n                  '}
                                <div className="flex items-center gap-[6px]">
                                  {'\n                    '}
                                  <span className="text-[14px] font-[650] tracking-[-0.01em]">
                                    <span>{sel.name}</span>
                                  </span>
                                  {'\n                    '}
                                  <span style={cssToObj(sel.intentBadge)}>
                                    <span>{sel.intentLabel}</span>
                                  </span>
                                  {'\n                  '}
                                </div>
                                {'\n                  '}
                                <div className="text-[11.5px] text-[#8E8E96] mt-[2px]">
                                  <span>{sel.meta}</span>
                                </div>
                                {'\n                '}
                              </div>
                              {'\n                '}
                              <button
                                onClick={toggleContext}
                                className="w-[24px] h-[24px] [border:none] bg-transparent rounded-[6px] cursor-pointer text-[#A1A1AA] text-[15px] leading-[1] flex-none hv-u2196x"
                              >
                                {'×'}
                              </button>
                              {'\n              '}
                            </div>
                            {'\n              '}
                            <div className="flex gap-[1px] mt-[12px] [border-bottom:1px_solid_#EFEFF2] mb-[-12px] overflow-x-auto">
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
                          <div className="flex-1 [min-height:0] overflow-y-auto pt-[14px] px-[16px] pb-[18px]">
                            {'\n\n              '}
                            {tabOverview ? (
                              <>
                                {'\n                '}
                                <div className="flex flex-col gap-[14px]">
                                  {'\n                  '}
                                  <div className="bg-[#FFFFFF] [border:1px_solid_#E8E8EC] rounded-[10px] py-[12px] px-[13px]">
                                    {'\n                    '}
                                    <div className="text-[10px] font-[650] text-[#A1A1AA] tracking-[.06em] uppercase mb-[10px]">
                                      {'GTM overview'}
                                    </div>
                                    {'\n                    '}
                                    <div className="flex flex-col gap-[9px]">
                                      {'\n                      '}
                                      {(gtmRows ?? []).map((g: any, __i: number) => (
                                        <Fragment key={__i}>
                                          {'\n                        '}
                                          <div className="flex items-center justify-between gap-[10px]">
                                            {'\n                          '}
                                            <span className="text-[12px] text-[#71717A]">
                                              <span>{g.label}</span>
                                            </span>
                                            {'\n                          '}
                                            <span
                                              style={cssToObj(
                                                `font-size:12px; font-weight:600; color:${g.color}`,
                                              )}
                                            >
                                              <span>{g.value}</span>
                                            </span>
                                            {'\n                        '}
                                          </div>
                                          {'\n                      '}
                                        </Fragment>
                                      ))}
                                      {'\n                    '}
                                    </div>
                                    {'\n                    '}
                                    <div className="h-[5px] rounded-[3px] bg-[#F1F1F3] overflow-hidden mt-[11px]">
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
                                  <div className="bg-[#F8F5FF] [border:1px_solid_#E6DDFB] rounded-[10px] py-[12px] px-[13px]">
                                    {'\n                    '}
                                    <div className="flex items-center gap-[6px] mb-[6px]">
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
                                      {'\n                      '}
                                      <span className="text-[11.5px] font-[650] text-[#5B21B6]">
                                        {'Why this account matters'}
                                      </span>
                                      {'\n                    '}
                                    </div>
                                    {'\n                    '}
                                    <p className="m-[0] text-[12px] leading-[1.55] text-[#4C3A7A]">
                                      <span>{sel.insight}</span>
                                    </p>
                                    {'\n                    '}
                                    <div className="mt-[9px] pt-[9px] [border-top:1px_solid_#E6DDFB] text-[11.5px] text-[#5B21B6]">
                                      <strong className="font-[650]">{'Recommendation:'}</strong>{' '}
                                      <span>{sel.recommendation}</span>
                                    </div>
                                    {'\n                  '}
                                  </div>
                                  {'\n\n                  '}
                                  <div>
                                    {'\n                    '}
                                    <div className="text-[10px] font-[650] text-[#A1A1AA] tracking-[.06em] uppercase mb-[8px]">
                                      {'GTM gap'}
                                    </div>
                                    {'\n                    '}
                                    <div className="bg-[#FFFFFF] [border:1px_solid_#E8E8EC] rounded-[10px] py-[11px] px-[12px] text-[12px] text-[#52525B] leading-[1.5]">
                                      <span>{sel.gap}</span>
                                    </div>
                                    {'\n                  '}
                                  </div>
                                  {'\n\n                  '}
                                  <div>
                                    {'\n                    '}
                                    <div className="text-[10px] font-[650] text-[#A1A1AA] tracking-[.06em] uppercase mb-[8px]">
                                      {'Recommended actions'}
                                    </div>
                                    {'\n                    '}
                                    <div className="flex flex-col gap-[6px]">
                                      {'\n                      '}
                                      {(actions ?? []).map((a: any, __i: number) => (
                                        <Fragment key={__i}>
                                          {'\n                        '}
                                          <div
                                            onClick={a.pick}
                                            className="flex items-center justify-between gap-[8px] py-[9px] px-[11px] bg-[#FFFFFF] [border:1px_solid_#E8E8EC] rounded-[8px] cursor-pointer hv-17mkows"
                                          >
                                            {'\n                          '}
                                            <span className="text-[12px] font-[550] text-[#27272A]">
                                              <span>{a.label}</span>
                                            </span>
                                            {'\n                          '}
                                            <span className="text-[10.5px] text-[#A1A1AA]">
                                              <span>{a.cost}</span>
                                            </span>
                                            {'\n                        '}
                                          </div>
                                          {'\n                      '}
                                        </Fragment>
                                      ))}
                                      {'\n                    '}
                                    </div>
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
                                <div className="flex flex-col gap-[8px]">
                                  {'\n                  '}
                                  {(signalCards ?? []).map((s: any, __i: number) => (
                                    <Fragment key={__i}>
                                      {'\n                    '}
                                      <div className="bg-[#FFFFFF] [border:1px_solid_#E8E8EC] rounded-[10px] py-[11px] px-[12px]">
                                        {'\n                      '}
                                        <div className="flex items-center justify-between gap-[8px]">
                                          {'\n                        '}
                                          <span className="flex items-center gap-[7px] text-[12px] font-[650] text-[#18181B]">
                                            {'\n                          '}
                                            <span className="text-[12px]">
                                              <span>{s.icon}</span>
                                            </span>
                                            <span>{s.type}</span>
                                            {'\n                        '}
                                          </span>
                                          {'\n                        '}
                                          <span style={cssToObj(s.strengthStyle)}>
                                            <span>{s.strength}</span>
                                          </span>
                                          {'\n                      '}
                                        </div>
                                        {'\n                      '}
                                        <div className="text-[12px] text-[#52525B] mt-[5px] leading-[1.45]">
                                          <span>{s.detail}</span>
                                        </div>
                                        {'\n                      '}
                                        <div className="text-[11.5px] text-[#8E8E96] mt-[6px] leading-[1.45] italic">
                                          <span>{s.why}</span>
                                        </div>
                                        {'\n                      '}
                                        <div className="flex items-center gap-[8px] mt-[8px] pt-[8px] [border-top:1px_solid_#F4F4F6]">
                                          {'\n                        '}
                                          <span className="text-[10.5px] text-[#71717A]">
                                            <span>{s.source}</span>
                                          </span>
                                          {'\n                        '}
                                          <span className="w-[3px] h-[3px] rounded-full bg-[#D4D4D8]"></span>
                                          {'\n                        '}
                                          <span className="text-[10.5px] text-[#A1A1AA]">
                                            <span>{s.time}</span>
                                          </span>
                                          {'\n                        '}
                                          <span
                                            style={cssToObj(
                                              `margin-left:auto; font-size:10.5px; font-weight:600; color:${s.confColor}`,
                                            )}
                                          >
                                            <span>{s.confidence}</span>
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
                            {tabPeople ? (
                              <>
                                {'\n                '}
                                <div className="flex flex-col gap-[6px]">
                                  {'\n                  '}
                                  {(people ?? []).map((p: any, __i: number) => (
                                    <Fragment key={__i}>
                                      {'\n                    '}
                                      <div className="flex items-center gap-[10px] bg-[#FFFFFF] [border:1px_solid_#E8E8EC] rounded-[10px] py-[10px] px-[11px]">
                                        {'\n                      '}
                                        <div
                                          style={cssToObj(
                                            `width:30px; height:30px; border-radius:50%; flex:none; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:650; color:#3F3F46; background:${p.bg}`,
                                          )}
                                        >
                                          <span>{p.initials}</span>
                                        </div>
                                        {'\n                      '}
                                        <div className="flex-1 [min-width:0]">
                                          {'\n                        '}
                                          <div className="flex items-center gap-[6px]">
                                            {'\n                          '}
                                            <span className="text-[12.5px] font-[600]">
                                              <span>{p.name}</span>
                                            </span>
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
                                          </div>
                                          {'\n                        '}
                                          <div className="text-[11px] text-[#8E8E96]">
                                            <span>{p.title}</span>
                                          </div>
                                          {'\n                        '}
                                          <div className="text-[10.5px] text-[#A1A1AA] [font-family:'JetBrains_Mono',_monospace] mt-[2px]">
                                            <span>{p.email}</span>
                                          </div>
                                          {'\n                      '}
                                        </div>
                                        {'\n                      '}
                                        <span style={cssToObj(p.badgeStyle)}>
                                          <span>{p.badge}</span>
                                        </span>
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
                                <div className="flex flex-col gap-[8px]">
                                  {'\n                  '}
                                  {(social ?? []).map((s: any, __i: number) => (
                                    <Fragment key={__i}>
                                      {'\n                    '}
                                      <div className="bg-[#FFFFFF] [border:1px_solid_#E8E8EC] rounded-[10px] py-[11px] px-[12px]">
                                        {'\n                      '}
                                        <div className="flex items-center justify-between">
                                          {'\n                        '}
                                          <span className="text-[11.5px] font-[650] text-[#3F3F46]">
                                            <span>{s.platform}</span>
                                          </span>
                                          {'\n                        '}
                                          <span className="text-[10.5px] text-[#A1A1AA]">
                                            <span>{s.time}</span>
                                          </span>
                                          {'\n                      '}
                                        </div>
                                        {'\n                      '}
                                        <p className="mt-[6px] mx-[0] mb-[0] text-[12px] leading-[1.5] text-[#52525B]">
                                          <span>{s.text}</span>
                                        </p>
                                        {'\n                      '}
                                        <div className="text-[10.5px] text-[#A1A1AA] mt-[7px]">
                                          <span>{s.author}</span>
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
                                <div className="flex flex-col gap-[12px]">
                                  {'\n                  '}
                                  <div className="flex flex-wrap gap-[6px]">
                                    {'\n                    '}
                                    {(stack ?? []).map((s: any, __i: number) => (
                                      <Fragment key={__i}>
                                        {'\n                      '}
                                        <span className="inline-flex items-center gap-[6px] py-[5px] px-[9px] [border:1px_solid_#E8E8EC] bg-[#FFFFFF] rounded-[7px] text-[11.5px] text-[#3F3F46]">
                                          {'\n                        '}
                                          <span
                                            style={cssToObj(
                                              `width:5px; height:5px; border-radius:50%; background:${s.dot}`,
                                            )}
                                          ></span>
                                          <span>{s.name}</span>
                                          {'\n                      '}
                                        </span>
                                        {'\n                    '}
                                      </Fragment>
                                    ))}
                                    {'\n                  '}
                                  </div>
                                  {'\n                  '}
                                  <div className="bg-[#FFFFFF] [border:1px_solid_#E8E8EC] rounded-[10px] py-[11px] px-[12px]">
                                    {'\n                    '}
                                    <div className="text-[10px] font-[650] text-[#A1A1AA] tracking-[.06em] uppercase mb-[8px]">
                                      {'Missing layers'}
                                    </div>
                                    {'\n                    '}
                                    <div className="flex flex-col gap-[7px]">
                                      {'\n                      '}
                                      {(missing ?? []).map((m: any, __i: number) => (
                                        <Fragment key={__i}>
                                          {'\n                        '}
                                          <div className="flex items-center gap-[8px] text-[12px] text-[#52525B]">
                                            {'\n                          '}
                                            <span className="w-[5px] h-[5px] rounded-full bg-[#EA580C]"></span>
                                            <span>{m}</span>
                                            {'\n                        '}
                                          </div>
                                          {'\n                      '}
                                        </Fragment>
                                      ))}
                                      {'\n                    '}
                                    </div>
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
