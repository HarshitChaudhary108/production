import { useModel } from '../../lib/model'
import styles from '../../styles/pages/radar.css?raw'
import { RadarModel } from './model'
import { AccountDrawer } from './components/AccountDrawer'
import { AskOutmate } from './components/AskOutmate'
import { RadarHeader } from './components/RadarHeader'
import { RadarPanel } from './components/RadarPanel'
import { Sidebar } from './components/Sidebar'
import { SignalFeed } from './components/SignalFeed'
import { SignalMix } from './components/SignalMix'
import { StatsRow } from './components/StatsRow'

export function RadarPage() {
  const m = useModel(() => new RadarModel(), (model) => model.renderVals())

  return (
    <>
      <style>{styles}</style>
      <div
        data-page="radar"
        className="grid [grid-template-columns:216px_1fr] w-full [min-height:1024px] bg-[#FFFFFF] relative overflow-hidden"
      >
        {'\n\n  '}
        <Sidebar m={m} />
        {'\n\n  '}
        <main className="[min-width:0] flex flex-col">
          {'\n\n    '}
          <RadarHeader m={m} />
          {'\n\n    '}
          <StatsRow m={m} />
          {'\n\n    '}
          <div className="grid [grid-template-columns:1fr_360px] gap-[16px] pt-[16px] px-[28px] pb-[28px] [align-items:start]">
            {'\n\n      '}
            <div className="flex flex-col gap-[16px] [min-width:0]">
              {'\n\n        '}
              <RadarPanel m={m} />
              {'\n\n        '}
              <SignalFeed m={m} />
              {'\n      '}
            </div>
            {'\n\n      '}
            <aside className="sticky top-[16px] flex flex-col gap-[12px]">
              {'\n        '}
              <AskOutmate m={m} />
              {'\n\n        '}
              <SignalMix m={m} />
              {'\n      '}
            </aside>
            {'\n    '}
          </div>
          {'\n  '}
        </main>
        {'\n\n  '}
        {m.selected ? (
          <>
            {'\n    '}
            <div
              onClick={m.closeDrawer}
              className="absolute [inset:0] bg-[rgba(24,24,27,0.18)]"
            ></div>
            {'\n  '}
          </>
        ) : null}
        {'\n  '}
        {m.selected ? <AccountDrawer m={m} selected={m.selected} /> : null}
      </div>
    </>
  )
}
