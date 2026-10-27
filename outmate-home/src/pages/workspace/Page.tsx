import { useModel } from '../../lib/model'
import styles from '../../styles/pages/workspace.css?raw'
import { WorkspaceModel } from './model'
import { ContextPanel } from './components/ContextPanel'
import { AddColumnDrawer, CreditsModal, NotificationsPopover, RunCellsDialog, SettingsPopover, ShareModal, Toast } from './components/overlays'
import { RadarView } from './components/RadarView'
import { Sidebar } from './components/Sidebar'
import { TableView } from './components/TableView'
import { TopBar } from './components/TopBar'

export function WorkspacePage() {
  const m = useModel(() => new WorkspaceModel(), (model) => model.renderVals())

  return (
    <>
      <style>{styles}</style>
      <div
        data-page="workspace"
        className="relative w-full h-[1024px] overflow-hidden flex flex-col bg-[#F5F5F7]"
      >
        {'\n\n  '}
        <TopBar m={m} />
        {'\n\n  '}
        <div className="flex-1 flex [min-height:0]">
          {'\n\n    '}
          <Sidebar m={m} />
          {'\n\n    '}
          <main className="flex-1 [min-width:0] flex flex-col bg-[#FFFFFF] relative">
            {'\n\n      '}
            {m.isRadar ? <RadarView m={m} /> : null}
            {'\n\n      '}
            {m.isTable ? <TableView m={m} /> : null}
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
        {m.runCellsOpen ? <RunCellsDialog m={m} /> : null}
        {'\n\n  '}
        {m.addColOpen ? <AddColumnDrawer m={m} /> : null}
        {'\n\n  '}
        {m.shareOpen ? <ShareModal m={m} /> : null}
        {'\n\n  '}
        {m.toast ? <Toast m={m} /> : null}
      </div>
    </>
  )
}
