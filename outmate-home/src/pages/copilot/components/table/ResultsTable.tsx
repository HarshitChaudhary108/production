import { CompaniesSheet } from './CompaniesSheet'
import { LeadersSheet } from './LeadersSheet'
import { SignalsSheet } from './SignalsSheet'
import { TableFilterBar } from './TableFilterBar'
import { TableFooter } from './TableFooter'
import { TableHeader } from './TableHeader'
import { TableTabs } from './TableTabs'
import type { CopilotValues } from '../../types'

export function ResultsTable({ m }: { m: CopilotValues }) {
  return (
    <div className="[border:1px_solid_#E8E8EC] rounded-[12px] bg-[#FFFFFF] overflow-hidden shadow-[0_1px_2px_rgba(24,24,27,.04)]">
                            {'\n\n                '}
                            <TableHeader m={m} />
                            {'\n\n                '}
                            <TableTabs m={m} />
                            {'\n\n                '}
                            <TableFilterBar m={m} />
                            {'\n\n                '}
                            {m.sheetCompanies ? <CompaniesSheet m={m} /> : null}
                            {'\n\n                '}
                            {m.sheetLeaders ? <LeadersSheet m={m} /> : null}
                            {'\n\n                '}
                            {m.sheetSignals ? <SignalsSheet m={m} /> : null}
                            {'\n\n                '}
                            <TableFooter m={m} />
                            {'\n              '}
                          </div>
  )
}
