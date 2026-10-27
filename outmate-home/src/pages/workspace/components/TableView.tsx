import { ActionBar } from './table/ActionBar'
import { CompaniesSheet } from './table/CompaniesSheet'
import { CustomSheet } from './table/CustomSheet'
import { LeadersSheet } from './table/LeadersSheet'
import { SheetTabs } from './table/SheetTabs'
import { SignalsSheet } from './table/SignalsSheet'
import { TableFooter } from './table/TableFooter'
import { TableHeaderBar } from './table/TableHeaderBar'
import { TableToolbar } from './table/TableToolbar'
import type { WorkspaceValues } from '../types'

export function TableView({ m }: { m: WorkspaceValues }) {
  return (
    <>
                    {'\n        '}
                    <div className="flex-1 [min-height:0] flex flex-col relative">
                      {'\n\n          '}
                      <TableHeaderBar m={m} />
                      {'\n\n          '}
                      <TableToolbar m={m} />
                      {'\n\n          '}
                      <SheetTabs m={m} />
                      {'\n\n          '}
                      {m.showActionBar ? <ActionBar m={m} /> : null}
                      {'\n\n          '}
                      <div className="flex-1 [min-height:0] overflow-auto">
                        {'\n            '}
                        {m.sheetCompanies ? <CompaniesSheet m={m} /> : null}
                        {'\n\n            '}
                        {m.sheetLeaders ? <LeadersSheet m={m} /> : null}
                        {'\n\n            '}
                        {m.sheetSignals ? <SignalsSheet m={m} /> : null}
                        {'\n            '}
                        {m.sheetCustom ? <CustomSheet m={m} /> : null}
                        {'\n          '}
                      </div>
                      {'\n\n          '}
                      <TableFooter m={m} />
                      {'\n        '}
                    </div>
                    {'\n      '}
                  </>
  )
}
