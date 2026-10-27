import { useModel } from '../../lib/model'
import styles from '../../styles/pages/home.css?raw'
import { HomeModel } from './model'
import { ColumnPanel, CreditsModal, PreviewDrawer, RunDialog, Toast } from './components/overlays'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { GenericPageView } from './components/views/GenericPageView'
import { HomeView } from './components/views/HomeView'
import { ListsView } from './components/views/ListsView'
import { ProjectsView } from './components/views/ProjectsView'
import { ResearchView } from './components/views/ResearchView'
import { TemplatesView } from './components/views/TemplatesView'

export function HomePage() {
  const m = useModel(() => new HomeModel(), (model) => model.renderVals())

  return (
    <>
      <style>{styles}</style>
      <div
        data-page="home"
        className="relative flex h-screen w-full bg-[#FFFFFF] overflow-hidden text-[13.5px]"
      >
        {'\n\n  '}
        <Sidebar m={m} />
        {'\n\n  '}
        <div className="flex-1 [min-width:0] flex flex-col">
          {'\n    '}
          <TopBar m={m} />
          {'\n\n    '}
          <main id="scroller" className="flex-1 [min-height:0] overflow-y-auto bg-[#FFFFFF]">
            {'\n      '}
            {m.isHome ? <HomeView m={m} /> : null}
            {'\n\n      '}
            {m.isProjects ? <ProjectsView m={m} /> : null}
            {'\n\n      '}
            {m.isTemplates ? <TemplatesView m={m} /> : null}
            {'\n\n      '}
            {m.isResearchPage ? <ResearchView m={m} /> : null}
            {'\n\n      '}
            {m.isLists ? <ListsView m={m} /> : null}
            {'\n\n      '}
            {m.isPage ? <GenericPageView m={m} /> : null}
            {'\n    '}
          </main>
          {'\n  '}
        </div>
        {'\n\n  '}
        {m.columnPanelOpen ? <ColumnPanel m={m} /> : null}
        {'\n\n  '}
        {m.previewOpen ? <PreviewDrawer m={m} /> : null}
        {'\n\n  '}
        {m.runOpen ? <RunDialog m={m} /> : null}
        {'\n\n  '}
        {m.creditsOpen ? <CreditsModal m={m} /> : null}
        {'\n\n  '}
        {m.toast ? <Toast m={m} /> : null}
      </div>
    </>
  )
}
