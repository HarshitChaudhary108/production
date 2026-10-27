import { Fragment } from 'react'
import { cssToObj } from '../../../lib/css'
import type { WorkspaceValues } from '../types'

export function Toast({ m }: { m: WorkspaceValues }) {
  const { toastText } = m
  return (
    <>
                {'\n    '}
                <div
                  role="status"
                  aria-live="polite"
                  className="absolute bottom-[20px] left-[50%] ml-[-140px] w-[280px] bg-[#18181B] text-[#FFFFFF] rounded-[8px] py-[9px] px-[13px] text-[11.5px] text-center z-[80] [animation:pop_.14s_ease-out]"
                >
                  <span>{toastText}</span>
                </div>
                {'\n  '}
              </>
  )
}

export function SettingsPopover({ m }: { m: WorkspaceValues }) {
  const { settings } = m
  return (
    <>
                {'\n    '}
                <div className="absolute top-[44px] right-[44px] w-[282px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[10px] shadow-[0_18px_44px_rgba(24,24,27,.16)] z-[60] [animation:pop_.14s_ease-out] overflow-hidden">
                  {'\n      '}
                  <div className="py-[10px] px-[12px] [border-bottom:1px_solid_#F1F1F3] text-[11.5px] font-[650]">
                    {'Workspace settings'}
                  </div>
                  {'\n      '}
                  <div className="pt-[5px] px-[12px] pb-[10px]">
                    {'\n        '}
                    {(settings ?? []).map((s: any, __i: number) => (
                      <Fragment key={__i}>
                        {'\n          '}
                        <div
                          onClick={s.cycle}
                          className="flex items-center justify-between gap-[10px] py-[6px] px-[0] [border-bottom:1px_solid_#F7F7F9] cursor-pointer"
                        >
                          {'\n            '}
                          <span className="text-[11.5px] text-[#52525B]">
                            <span>{s.label}</span>
                          </span>
                          {'\n            '}
                          <span style={cssToObj(s.valStyle)}>
                            <span>{s.value}</span>
                          </span>
                          {'\n          '}
                        </div>
                        {'\n        '}
                      </Fragment>
                    ))}
                    {'\n      '}
                  </div>
                  {'\n    '}
                </div>
                {'\n  '}
              </>
  )
}

export function NotificationsPopover({ m }: { m: WorkspaceValues }) {
  const { notifications } = m
  return (
    <>
                {'\n    '}
                <div className="absolute top-[44px] right-[76px] w-[286px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[10px] shadow-[0_18px_44px_rgba(24,24,27,.16)] z-[60] [animation:pop_.14s_ease-out] overflow-hidden">
                  {'\n      '}
                  <div className="py-[10px] px-[12px] [border-bottom:1px_solid_#F1F1F3] text-[11.5px] font-[650]">
                    {'Notifications'}
                  </div>
                  {'\n      '}
                  {(notifications ?? []).map((n: any, __i: number) => (
                    <Fragment key={__i}>
                      {'\n        '}
                      <div className="py-[9px] px-[12px] [border-bottom:1px_solid_#F7F7F9] flex gap-[8px]">
                        {'\n          '}
                        <span
                          style={cssToObj(
                            `width:6px; height:6px; border-radius:50%; margin-top:5px; flex:none; background:${n.dot}`,
                          )}
                        ></span>
                        {'\n          '}
                        <div className="[min-width:0]">
                          {'\n            '}
                          <div className="text-[11.5px] text-[#27272A] leading-[1.45]">
                            <span>{n.text}</span>
                          </div>
                          {'\n            '}
                          <div className="text-[10px] text-[#A1A1AA] mt-[2px]">
                            <span>{n.time}</span>
                          </div>
                          {'\n          '}
                        </div>
                        {'\n        '}
                      </div>
                      {'\n      '}
                    </Fragment>
                  ))}
                  {'\n    '}
                </div>
                {'\n  '}
              </>
  )
}

export function ShareModal({ m }: { m: WorkspaceValues }) {
  const { closeShare, copyShareLink, shareLink, shareTargets } = m
  return (
    <>
                {'\n    '}
                <div
                  onClick={closeShare}
                  className="absolute [inset:0] bg-[rgba(24,24,27,.3)] z-[72] flex items-center justify-center"
                >
                  {'\n      '}
                  <div className="w-[396px] bg-[#FFFFFF] rounded-[12px] shadow-[0_24px_60px_rgba(24,24,27,.24)] overflow-hidden [animation:pop_.16s_ease-out]">
                    {'\n        '}
                    <div className="pt-[15px] px-[17px] pb-[12px] [border-bottom:1px_solid_#F1F1F3] flex items-center justify-between">
                      {'\n          '}
                      <span className="text-[13.5px] font-[650]">{'Share research'}</span>
                      {'\n          '}
                      <button
                        onClick={closeShare}
                        className="w-[25px] h-[25px] [border:none] bg-transparent rounded-[6px] cursor-pointer text-[#A1A1AA] text-[15px] leading-[1] hv-u45kwi"
                      >
                        {'×'}
                      </button>
                      {'\n        '}
                    </div>
                    {'\n        '}
                    <div className="py-[14px] px-[17px]">
                      {'\n          '}
                      <div className="flex items-center gap-[7px] [border:1px_solid_#E4E4E8] rounded-[8px] py-[8px] px-[10px] bg-[#FAFAFB]">
                        {'\n            '}
                        <span className="flex-1 [min-width:0] text-[11.5px] [font-family:'JetBrains_Mono',_monospace] text-[#52525B] overflow-hidden text-ellipsis whitespace-nowrap">
                          <span>{shareLink}</span>
                        </span>
                        {'\n            '}
                        <button
                          onClick={copyShareLink}
                          className="h-[25px] py-[0] px-[10px] [border:1px_solid_#6D28D9] bg-[#6D28D9] text-[#FFFFFF] rounded-[6px] text-[11px] font-[600] cursor-pointer hv-jdi8ic"
                        >
                          {'Copy'}
                        </button>
                        {'\n          '}
                      </div>
                      {'\n          '}
                      <div className="mt-[12px] text-[10px] font-[650] text-[#A1A1AA] tracking-[.06em] uppercase">
                        {'Share with'}
                      </div>
                      {'\n          '}
                      {(shareTargets ?? []).map((t: any, __i: number) => (
                        <Fragment key={__i}>
                          {'\n            '}
                          <div
                            onClick={t.pick}
                            className="flex items-center justify-between py-[9px] px-[2px] [border-bottom:1px_solid_#F4F4F6] cursor-pointer text-[11.5px] text-[#3F3F46] hv-1jqpi6r"
                          >
                            {'\n              '}
                            <span>
                              <span>{t.label}</span>
                            </span>
                            {'\n              '}
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 20 20"
                              fill="none"
                              stroke="#C4C4CB"
                              strokeWidth="1.8"
                            >
                              <path d="M4 10h11M11 6l4 4-4 4"></path>
                            </svg>
                            {'\n            '}
                          </div>
                          {'\n          '}
                        </Fragment>
                      ))}
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

export function CreditsModal({ m }: { m: WorkspaceValues }) {
  const { closeCredits, creditsColor, creditsNum, creditsWarn, topUp, usage } = m
  return (
    <>
                {'\n    '}
                <div
                  onClick={closeCredits}
                  className="absolute [inset:0] bg-[rgba(24,24,27,.3)] z-[70] flex items-center justify-center"
                >
                  {'\n      '}
                  <div className="w-[432px] bg-[#FFFFFF] rounded-[13px] shadow-[0_24px_60px_rgba(24,24,27,.24)] overflow-hidden [animation:pop_.16s_ease-out]">
                    {'\n        '}
                    <div className="pt-[15px] px-[17px] pb-[13px] [border-bottom:1px_solid_#F1F1F3] flex items-center justify-between">
                      {'\n          '}
                      <span className="text-[13.5px] font-[650]">{'Credits'}</span>
                      {'\n          '}
                      <button
                        onClick={closeCredits}
                        className="w-[25px] h-[25px] [border:none] bg-transparent rounded-[6px] cursor-pointer text-[#A1A1AA] text-[15px] leading-[1] hv-u45kwi"
                      >
                        {'×'}
                      </button>
                      {'\n        '}
                    </div>
                    {'\n        '}
                    <div className="py-[15px] px-[17px]">
                      {'\n          '}
                      {creditsWarn ? (
                        <>
                          {'\n            '}
                          <div className="[border:1px_solid_#FED7AA] bg-[#FFF8F1] rounded-[9px] py-[10px] px-[11px] mb-[13px]">
                            {'\n              '}
                            <div className="text-[12px] font-[650] text-[#9A3412]">
                              {'This run is paused'}
                            </div>
                            {'\n              '}
                            <div className="text-[11.5px] text-[#B45309] leading-[1.5] mt-[2px]">
                              {
                                'Enriching the remaining 395 companies needs 7,900 credits. Top up and the run resumes automatically.'
                              }
                            </div>
                            {'\n            '}
                          </div>
                          {'\n          '}
                        </>
                      ) : null}
                      {'\n          '}
                      <div className="grid [grid-template-columns:1fr_1fr_1fr] gap-[9px]">
                        {'\n            '}
                        <div className="[border:1px_solid_#EDEDF0] rounded-[8px] py-[9px] px-[10px]">
                          {'\n              '}
                          <div className="text-[9.5px] text-[#A1A1AA] uppercase tracking-[.05em] font-[650]">
                            {'Remaining'}
                          </div>
                          {'\n              '}
                          <div
                            style={cssToObj(
                              `font-size:17px; font-weight:650; margin-top:3px; color:${creditsColor}; font-variant-numeric:tabular-nums`,
                            )}
                          >
                            <span>{creditsNum}</span>
                          </div>
                          {'\n            '}
                        </div>
                        {'\n            '}
                        <div className="[border:1px_solid_#EDEDF0] rounded-[8px] py-[9px] px-[10px]">
                          {'\n              '}
                          <div className="text-[9.5px] text-[#A1A1AA] uppercase tracking-[.05em] font-[650]">
                            {'Used this month'}
                          </div>
                          {'\n              '}
                          <div className="text-[17px] font-[650] mt-[3px] tabular-nums">{'18,240'}</div>
                          {'\n            '}
                        </div>
                        {'\n            '}
                        <div className="[border:1px_solid_#EDEDF0] rounded-[8px] py-[9px] px-[10px]">
                          {'\n              '}
                          <div className="text-[9.5px] text-[#A1A1AA] uppercase tracking-[.05em] font-[650]">
                            {'Next run cost'}
                          </div>
                          {'\n              '}
                          <div className="text-[17px] font-[650] mt-[3px] text-[#C2410C] tabular-nums">
                            {'7,900'}
                          </div>
                          {'\n            '}
                        </div>
                        {'\n          '}
                      </div>
                      {'\n          '}
                      <div className="mt-[14px] text-[10px] font-[650] text-[#A1A1AA] tracking-[.06em] uppercase">
                        {'Recent usage'}
                      </div>
                      {'\n          '}
                      {(usage ?? []).map((u: any, __i: number) => (
                        <Fragment key={__i}>
                          {'\n            '}
                          <div className="flex items-center justify-between py-[7px] px-[0] [border-bottom:1px_solid_#F4F4F6]">
                            {'\n              '}
                            <span className="text-[11.5px] text-[#52525B]">
                              <span>{u.label}</span>
                            </span>
                            {'\n              '}
                            <span className="text-[11.5px] font-[600] tabular-nums">
                              <span>{u.cost}</span>
                            </span>
                            {'\n            '}
                          </div>
                          {'\n          '}
                        </Fragment>
                      ))}
                      {'\n        '}
                    </div>
                    {'\n        '}
                    <div className="pt-[12px] px-[17px] pb-[15px] bg-[#FAFAFB] [border-top:1px_solid_#F1F1F3] flex gap-[8px] justify-end">
                      {'\n          '}
                      <button
                        onClick={closeCredits}
                        className="h-[31px] py-[0] px-[12px] [border:1px_solid_#E4E4E8] bg-[#FFFFFF] rounded-[7px] text-[12px] text-[#52525B] font-[550] cursor-pointer hv-u4v0t1"
                      >
                        {'Close'}
                      </button>
                      {'\n          '}
                      <button
                        onClick={topUp}
                        className="h-[31px] py-[0] px-[14px] [border:1px_solid_#6D28D9] bg-[#6D28D9] text-[#FFFFFF] rounded-[7px] text-[12px] font-[600] cursor-pointer hv-jdi8ic"
                      >
                        {'Top up 10,000 credits'}
                      </button>
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

export function AddColumnDrawer({ m }: { m: WorkspaceValues }) {
  const { addPromptCol, closeAddCol, colPrompt, colSearch, colTools, colToolsOpen, colTypes, creditsLabel, onColPrompt, onColSearch, toggleColTools } = m
  return (
    <>
                {'\n    '}
                <div
                  onClick={closeAddCol}
                  className="absolute [inset:0] bg-[rgba(24,24,27,.24)] z-[74] flex justify-end"
                >
                  {'\n      '}
                  <div className="w-[396px] h-full bg-[#FFFFFF] [border-left:1px_solid_#E5E5EA] flex flex-col shadow-[-16px_0_40px_rgba(24,24,27,.12)]">
                    {'\n        '}
                    <div className="flex-none flex items-center justify-between py-[12px] px-[16px] [border-bottom:1px_solid_#EFEFF2]">
                      {'\n          '}
                      <div className="text-[13.5px] font-[650]">{'Create Column'}</div>
                      {'\n          '}
                      <button
                        onClick={closeAddCol}
                        title="Collapse panel"
                        className="w-[26px] h-[26px] flex items-center justify-center [border:1px_solid_#E4E4E8] bg-[#FFFFFF] rounded-[6px] cursor-pointer text-[#52525B] hv-u4v0t1"
                      >
                        {'\n            '}
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                        >
                          <rect x="3.5" y="4" width="13" height="12" rx="2"></rect>
                          <path d="M13 4v12M6 10h4.5M9 8l2 2-2 2"></path>
                        </svg>
                        {'\n          '}
                      </button>
                      {'\n        '}
                    </div>
                    {'\n\n        '}
                    <div className="flex-none pt-[13px] px-[16px] pb-[14px] [border-bottom:1px_solid_#EFEFF2]">
                      {'\n          '}
                      <textarea
                        onChange={onColPrompt}
                        value={colPrompt}
                        placeholder="What should this column do? e.g., Find whether the company is B2B or B2C"
                        className="w-full box-border h-[66px] resize-none [border:1px_solid_#D9D9DF] rounded-[7px] py-[9px] px-[10px] text-[12px] [font-family:inherit] text-[#3F3F46] outline-none leading-[1.5]"
                      ></textarea>
                      {'\n          '}
                      <div className="flex items-center gap-[8px] mt-[9px] relative">
                        {'\n            '}
                        <button
                          onClick={addPromptCol}
                          className="flex-1 h-[33px] [border:1px_solid_#6D28D9] bg-[#6D28D9] text-[#FFFFFF] rounded-[7px] text-[12.5px] font-[650] cursor-pointer hv-jdi8ic"
                        >
                          {'Create Column'}
                        </button>
                        {'\n            '}
                        <button
                          onClick={toggleColTools}
                          className="flex-none h-[33px] py-[0] px-[13px] [border:1px_solid_#E4E4E8] bg-[#FFFFFF] text-[#3F3F46] rounded-[7px] text-[12.5px] font-[600] cursor-pointer flex items-center gap-[6px] hv-u4v0t1"
                        >
                          {'\n              '}
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="#52525B"
                            strokeWidth="1.7"
                          >
                            <path d="M12.4 3.6a3.4 3.4 0 00-4 4.4L4 12.4V16h3.6l4.4-4.4a3.4 3.4 0 004.4-4l-2.2 2.2-2.2-.6-.6-2.2z"></path>
                          </svg>
                          {'\n              Tools\n            '}
                        </button>
                        {'\n            '}
                        {colToolsOpen ? (
                          <>
                            {'\n              '}
                            <div className="absolute top-[38px] right-[0] w-[216px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[8px] shadow-[0_14px_34px_rgba(24,24,27,.16)] p-[4px] z-[10] [animation:pop_.12s_ease-out]">
                              {'\n                '}
                              {(colTools ?? []).map((t: any, __i: number) => (
                                <Fragment key={__i}>
                                  {'\n                  '}
                                  <div
                                    onClick={t.pick}
                                    className="py-[7px] px-[8px] rounded-[6px] cursor-pointer hv-u4v0t1"
                                  >
                                    {'\n                    '}
                                    <div className="text-[11.5px] font-[600] text-[#18181B]">
                                      <span>{t.label}</span>
                                    </div>
                                    {'\n                    '}
                                    <div className="text-[10.5px] text-[#8E8E96] mt-[1px]">
                                      <span>{t.desc}</span>
                                    </div>
                                    {'\n                  '}
                                  </div>
                                  {'\n                '}
                                </Fragment>
                              ))}
                              {'\n              '}
                            </div>
                            {'\n            '}
                          </>
                        ) : null}
                        {'\n          '}
                      </div>
                      {'\n          '}
                      <div className="text-[10.5px] text-[#8E8E96] mt-[8px]">
                        {'AI column · ~3 credits / cell · '}
                        <span>{creditsLabel}</span>
                        {' available'}
                      </div>
                      {'\n        '}
                    </div>
                    {'\n\n        '}
                    <div className="flex-none pt-[10px] px-[16px] pb-[8px]">
                      {'\n          '}
                      <div className="flex items-center gap-[6px] h-[29px] py-[0] px-[9px] [border:1px_solid_#E4E4E8] rounded-[6px]">
                        {'\n            '}
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="#A1A1AA"
                          strokeWidth="1.8"
                          className="flex-none"
                        >
                          <circle cx="9" cy="9" r="5.6"></circle>
                          <path d="M13.2 13.2L17 17"></path>
                        </svg>
                        {'\n            '}
                        <input
                          onChange={onColSearch}
                          value={colSearch}
                          placeholder="Search enrichments"
                          className="[border:none] outline-none bg-transparent text-[12px] w-full [min-width:0] text-[#3F3F46]"
                        />
                        {'\n          '}
                      </div>
                      {'\n        '}
                    </div>
                    {'\n\n        '}
                    <div className="flex-1 [min-height:0] overflow-auto pt-[0] px-[16px] pb-[16px]">
                      {'\n          '}
                      {(colTypes ?? []).map((t: any, __i: number) => (
                        <Fragment key={__i}>
                          {'\n            '}
                          <div
                            onClick={t.add}
                            className="flex items-center gap-[11px] py-[10px] px-[2px] [border-bottom:1px_solid_#F4F4F6] cursor-pointer hv-udcbnc"
                          >
                            {'\n              '}
                            <svg
                              width="19"
                              height="19"
                              viewBox="0 0 20 20"
                              fill="none"
                              stroke="#71717A"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="flex-none"
                            >
                              <path d={t.path}></path>
                            </svg>
                            {'\n              '}
                            <span className="flex-1 [min-width:0]">
                              {'\n                '}
                              <span className="block text-[12.5px] font-[600] text-[#18181B] overflow-hidden text-ellipsis whitespace-nowrap">
                                <span>{t.name}</span>
                              </span>
                              {'\n                '}
                              <span className="block text-[11px] text-[#8E8E96] mt-[2px] overflow-hidden text-ellipsis whitespace-nowrap">
                                <span>{t.desc}</span>
                              </span>
                              {'\n              '}
                            </span>
                            {'\n              '}
                            {t.hasSrc ? (
                              <>
                                {'\n                '}
                                <span style={cssToObj(t.srcStyle)}>
                                  <span>{t.src}</span>
                                </span>
                                {'\n              '}
                              </>
                            ) : null}
                            {'\n              '}
                            <span className="flex-none flex items-center gap-[4px] whitespace-nowrap">
                              {'\n                '}
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 20 20"
                                fill="none"
                                stroke="#A1A1AA"
                                strokeWidth="1.6"
                              >
                                <circle cx="7.5" cy="10" r="4"></circle>
                                <path d="M11.5 6.4a4 4 0 010 7.2"></path>
                              </svg>
                              {'\n                '}
                              <span className="text-[11px] text-[#71717A] font-[550]">
                                <span>{t.cost}</span>
                              </span>
                              {'\n              '}
                            </span>
                            {'\n            '}
                          </div>
                          {'\n          '}
                        </Fragment>
                      ))}
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

export function RunCellsDialog({ m }: { m: WorkspaceValues }) {
  const { closeRunCells, confirmRunCells, creditsColor, creditsLabel, creditsWarn, finishRunCells, runCellsActive, runCellsComplete, runCellsConfirm, runCellsCost, runCellsPct, runCellsProgress, runCellsRows, runCellsTotalLabel } = m
  return (
    <>
                {'\n    '}
                <div className="absolute [inset:0] bg-[rgba(24,24,27,.3)] z-[72] flex items-center justify-center">
                  {'\n      '}
                  <div className="w-[400px] bg-[#FFFFFF] rounded-[12px] shadow-[0_24px_60px_rgba(24,24,27,.24)] overflow-hidden [animation:pop_.16s_ease-out]">
                    {'\n\n        '}
                    {runCellsConfirm ? (
                      <>
                        {'\n          '}
                        <div>
                          {'\n            '}
                          <div className="pt-[15px] px-[17px] pb-[12px] [border-bottom:1px_solid_#F1F1F3] text-[13.5px] font-[650]">
                            {'Run selected cells?'}
                          </div>
                          {'\n            '}
                          <div className="py-[14px] px-[17px]">
                            {'\n              '}
                            <div className="text-[12px] text-[#52525B] leading-[1.6]">
                              {'This will execute '}
                              <strong className="text-[#18181B] font-[650]">{'1 enrichment'}</strong>
                              {' across '}
                              <strong className="text-[#18181B] font-[650]">
                                <span>{runCellsRows}</span>
                                {' rows × 2 columns'}
                              </strong>
                              {'.'}
                            </div>
                            {'\n              '}
                            <div className="mt-[12px] [border:1px_solid_#EDEDF0] rounded-[8px] overflow-hidden">
                              {'\n                '}
                              <div className="flex items-center justify-between py-[8px] px-[11px] [border-bottom:1px_solid_#F4F4F6]">
                                {'\n                  '}
                                <span className="text-[11.5px] text-[#71717A]">{'Cells to run'}</span>
                                {'\n                  '}
                                <span className="text-[11.5px] font-[650] tabular-nums">
                                  <span>{runCellsTotalLabel}</span>
                                </span>
                                {'\n                '}
                              </div>
                              {'\n                '}
                              <div className="flex items-center justify-between py-[8px] px-[11px] [border-bottom:1px_solid_#F4F4F6]">
                                {'\n                  '}
                                <span className="text-[11.5px] text-[#71717A]">{'Rate'}</span>
                                {'\n                  '}
                                <span className="text-[11.5px] font-[600] text-[#52525B]">
                                  {'10 credits / cell'}
                                </span>
                                {'\n                '}
                              </div>
                              {'\n                '}
                              <div className="flex items-center justify-between py-[8px] px-[11px] [border-bottom:1px_solid_#F4F4F6]">
                                {'\n                  '}
                                <span className="text-[11.5px] text-[#71717A]">{'Estimated cost'}</span>
                                {'\n                  '}
                                <span className="text-[12.5px] font-[650] text-[#C2410C] tabular-nums">
                                  <span>{runCellsCost}</span>
                                  {' credits'}
                                </span>
                                {'\n                '}
                              </div>
                              {'\n                '}
                              <div className="flex items-center justify-between py-[8px] px-[11px] bg-[#FAFAFB]">
                                {'\n                  '}
                                <span className="text-[11.5px] text-[#71717A]">
                                  {'Current balance'}
                                </span>
                                {'\n                  '}
                                <span
                                  style={cssToObj(
                                    `font-size:11.5px; font-weight:600; color:${creditsColor}; font-variant-numeric:tabular-nums`,
                                  )}
                                >
                                  <span>{creditsLabel}</span>
                                </span>
                                {'\n                '}
                              </div>
                              {'\n              '}
                            </div>
                            {'\n              '}
                            {creditsWarn ? (
                              <>
                                {'\n                '}
                                <div className="mt-[10px] text-[11.5px] text-[#C2410C] leading-[1.5]">
                                  {'You have '}
                                  <span>{creditsLabel}</span>
                                  {'. Running this will open the top-up dialog first.'}
                                </div>
                                {'\n              '}
                              </>
                            ) : null}
                            {'\n            '}
                          </div>
                          {'\n            '}
                          <div className="pt-[12px] px-[17px] pb-[15px] bg-[#FAFAFB] [border-top:1px_solid_#F1F1F3] flex gap-[8px] justify-end">
                            {'\n              '}
                            <button
                              onClick={closeRunCells}
                              className="h-[31px] py-[0] px-[12px] [border:1px_solid_#E4E4E8] bg-[#FFFFFF] rounded-[7px] text-[12px] text-[#52525B] font-[550] cursor-pointer hv-u4v0t1"
                            >
                              {'Cancel'}
                            </button>
                            {'\n              '}
                            <button
                              onClick={confirmRunCells}
                              className="h-[31px] py-[0] px-[16px] [border:1px_solid_#6D28D9] bg-[#6D28D9] text-[#FFFFFF] rounded-[7px] text-[12px] font-[600] cursor-pointer hv-jdi8ic"
                            >
                              {'Run'}
                            </button>
                            {'\n            '}
                          </div>
                          {'\n          '}
                        </div>
                        {'\n        '}
                      </>
                    ) : null}
                    {'\n\n        '}
                    {runCellsActive ? (
                      <>
                        {'\n          '}
                        <div className="py-[20px] px-[17px]">
                          {'\n            '}
                          <div className="flex items-center gap-[8px]">
                            {'\n              '}
                            <span
                              style={cssToObj(
                                'width:13px; height:13px; border-radius:50%; border:2px solid #E6DDFB; border-top-color:#6D28D9; animation:spin .7s linear infinite',
                              )}
                            ></span>
                            {'\n              '}
                            <span className="text-[12.5px] font-[650]">
                              {'Running '}
                              <span>{runCellsProgress}</span>
                              {' cells'}
                            </span>
                            {'\n            '}
                          </div>
                          {'\n            '}
                          <div className="h-[5px] rounded-[3px] bg-[#F1F1F3] overflow-hidden mt-[12px]">
                            {'\n              '}
                            <div
                              style={cssToObj(
                                `height:100%; border-radius:3px; background:#6D28D9; width:${runCellsPct}`,
                              )}
                            ></div>
                            {'\n            '}
                          </div>
                          {'\n            '}
                          <div className="text-[11.5px] text-[#8E8E96] mt-[9px] leading-[1.5]">
                            {
                              'Writing results back to the table as each cell resolves. You can keep working — this runs in the background.'
                            }
                          </div>
                          {'\n            '}
                          <div className="flex justify-end mt-[14px]">
                            {'\n              '}
                            <button
                              onClick={closeRunCells}
                              className="h-[29px] py-[0] px-[12px] [border:1px_solid_#E4E4E8] bg-[#FFFFFF] rounded-[7px] text-[12px] text-[#B91C1C] font-[550] cursor-pointer hv-ug5na5"
                            >
                              {'Stop run'}
                            </button>
                            {'\n            '}
                          </div>
                          {'\n          '}
                        </div>
                        {'\n        '}
                      </>
                    ) : null}
                    {'\n\n        '}
                    {runCellsComplete ? (
                      <>
                        {'\n          '}
                        <div className="py-[20px] px-[17px]">
                          {'\n            '}
                          <div className="flex items-center gap-[8px]">
                            {'\n              '}
                            <span className="w-[15px] h-[15px] rounded-full bg-[#ECFDF3] text-[#15803D] flex items-center justify-center text-[9px] font-[700]">
                              {'✓'}
                            </span>
                            {'\n              '}
                            <span className="text-[12.5px] font-[650]">
                              {'Completed '}
                              <span>{runCellsProgress}</span>
                              {' cells'}
                            </span>
                            {'\n            '}
                          </div>
                          {'\n            '}
                          <div className="h-[5px] rounded-[3px] bg-[#F1F1F3] overflow-hidden mt-[12px]">
                            {'\n              '}
                            <div className="h-full rounded-[3px] bg-[#22A15D] w-full"></div>
                            {'\n            '}
                          </div>
                          {'\n            '}
                          <div className="flex gap-[14px] mt-[10px]">
                            {'\n              '}
                            <span className="text-[11px] text-[#8E8E96]">
                              <strong className="font-[650] text-[#15803D] tabular-nums">
                                <span>{runCellsTotalLabel}</span>
                              </strong>
                              {' completed'}
                            </span>
                            {'\n              '}
                            <span className="text-[11px] text-[#8E8E96]">
                              <strong className="font-[650] text-[#3F3F46]">{'0'}</strong>
                              {' failed'}
                            </span>
                            {'\n              '}
                            <span className="text-[11px] text-[#8E8E96]">
                              <strong className="font-[650] text-[#3F3F46]">{'0'}</strong>
                              {' skipped'}
                            </span>
                            {'\n            '}
                          </div>
                          {'\n            '}
                          <div className="text-[11.5px] text-[#8E8E96] mt-[8px] leading-[1.5]">
                            <span>{runCellsCost}</span>
                            {' credits deducted. '}
                            <span>{creditsLabel}</span>
                            {' remaining.'}
                          </div>
                          {'\n            '}
                          <div className="flex justify-end mt-[14px]">
                            {'\n              '}
                            <button
                              onClick={finishRunCells}
                              className="h-[29px] py-[0] px-[14px] [border:1px_solid_#6D28D9] bg-[#6D28D9] text-[#FFFFFF] rounded-[7px] text-[12px] font-[600] cursor-pointer hv-jdi8ic"
                            >
                              {'Done'}
                            </button>
                            {'\n            '}
                          </div>
                          {'\n          '}
                        </div>
                        {'\n        '}
                      </>
                    ) : null}
                    {'\n      '}
                  </div>
                  {'\n    '}
                </div>
                {'\n  '}
              </>
  )
}
