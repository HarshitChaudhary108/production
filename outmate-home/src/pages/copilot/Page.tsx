import { useModel } from '../../lib/model'
import styles from '../../styles/pages/copilot.css?raw'
import { CopilotModel } from './model'
import { ChatView } from './components/ChatView'
import { ContextPanel } from './components/ContextPanel'
import { CreditsModal, NotificationsPopover, SettingsPopover, Toast } from './components/overlays'
import { RadarView } from './components/RadarView'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'

export function CopilotPage() {
  const m = useModel(() => new CopilotModel(), (model) => model.renderVals())

  return (
    <>
      <style>{styles}</style>
      <div
        data-page="copilot"
        className="relative w-full h-[1024px] overflow-hidden flex flex-col bg-[#F7F7F8]"
      >
        {'\n\n  '}
        <TopBar m={m} />
        {'\n\n  '}
        <div className="flex-1 flex [min-height:0]">
          {'\n\n    '}
          {m.showSidebar ? <Sidebar m={m} /> : null}
          {'\n\n    '}
          <main className="flex-1 [min-width:0] flex flex-col bg-[#FFFFFF] relative">
            {'\n\n      '}
            {m.isCopilot ? <ChatView m={m} /> : null}
            {'\n\n      '}
            {m.isRadar ? <RadarView m={m} /> : null}
            {'\n    '}
          </main>
          {'\n\n    '}
          {m.contextOpen ? <ContextPanel m={m} /> : null}
          {'\n  '}
        </div>
        {'\n\n  '}
        {m.notifsOpen ? <NotificationsPopover m={m} /> : null}
        {'\n\n  '}
        {m.settingsOpen ? <SettingsPopover m={m} /> : null}
        {'\n\n  '}
        {m.creditsOpen ? <CreditsModal m={m} /> : null}
        {'\n\n  '}
        {m.toast ? <Toast m={m} /> : null}
      </div>
    </>
  )
}
