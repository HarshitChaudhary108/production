import { ChatHeader } from './chat/ChatHeader'
import { ChatThread } from './chat/ChatThread'
import { Composer } from './chat/Composer'
import { ExpandedToolbar } from './chat/ExpandedToolbar'
import { FollowUp } from './chat/FollowUp'
import { ResultsTable } from './table/ResultsTable'
import { cssToObj } from '../../../lib/css'
import type { CopilotValues } from '../types'

export function ChatView({ m }: { m: CopilotValues }) {
  const { colWidth, scrollPad } = m
  return (
    <>
                    {'\n        '}
                    <div className="flex-1 [min-height:0] flex flex-col">
                      {'\n\n          '}
                      {m.showChat ? <ChatHeader m={m} /> : null}
                      {'\n\n          '}
                      {m.expanded ? <ExpandedToolbar m={m} /> : null}
                      {'\n\n          '}
                      <div
                        style={cssToObj(`flex:1; min-height:0; overflow-y:auto; padding:${scrollPad}`)}
                      >
                        {'\n            '}
                        <div
                          style={cssToObj(
                            `max-width:${colWidth}; margin:0 auto; display:flex; flex-direction:column; gap:18px`,
                          )}
                        >
                          {'\n\n              '}
                          {m.showChat ? <ChatThread m={m} /> : null}
                          {'\n\n              '}
                          <ResultsTable m={m} />
                          {'\n\n              '}
                          {m.showChat ? <FollowUp m={m} /> : null}
                          {'\n\n              '}
                          <div className="h-[2px]"></div>
                          {'\n            '}
                        </div>
                        {'\n          '}
                      </div>
                      {'\n\n          '}
                      {m.showChat ? <Composer m={m} /> : null}
                      {'\n        '}
                    </div>
                    {'\n      '}
                  </>
  )
}
