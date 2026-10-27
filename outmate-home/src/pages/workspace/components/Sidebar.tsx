import { ChatPane } from './sidebar/ChatPane'
import { HistoryPane } from './sidebar/HistoryPane'
import { cssToObj } from '../../../lib/css'
import type { WorkspaceValues } from '../types'

export function Sidebar({ m }: { m: WorkspaceValues }) {
  const { chatPaneStyle, historyPaneStyle, newChat, showChatPane, showHistoryPane } = m
  return (
    <aside className="w-[306px] flex-none bg-[#FFFFFF] [border-right:1px_solid_#E5E5EA] flex flex-col [min-height:0]">
                {'\n      '}
                <div className="flex-none h-[38px] flex items-center gap-[2px] py-[0] px-[8px] [border-bottom:1px_solid_#EFEFF2]">
                  {'\n        '}
                  <span onClick={showChatPane} style={cssToObj(chatPaneStyle)}>
                    {'Copilot'}
                  </span>
                  {'\n        '}
                  <span onClick={showHistoryPane} style={cssToObj(historyPaneStyle)}>
                    {'History'}
                  </span>
                  {'\n        '}
                  <button
                    onClick={newChat}
                    className="ml-[auto] h-[24px] flex items-center gap-[5px] py-[0] px-[8px] [border:1px_solid_#DDD6F3] bg-[#F5F1FD] text-[#5B21B6] rounded-[6px] text-[11.5px] font-[600] cursor-pointer hv-ttjng3"
                  >
                    {'\n          '}
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M10 4.5v11M4.5 10h11"></path>
                    </svg>
                    {'\n          New\n        '}
                  </button>
                  {'\n      '}
                </div>
                {'\n\n      '}
                {m.paneHistory ? <HistoryPane m={m} /> : null}
                {'\n\n      '}
                {m.paneChat ? <ChatPane m={m} /> : null}
                {'\n    '}
              </aside>
  )
}
