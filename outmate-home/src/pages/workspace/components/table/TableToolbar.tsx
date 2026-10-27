import { ColumnsMenu, ExportMenu, FilterMenu, ImportMenu, RunPanel, SortMenu } from './TableMenus'
import { cssToObj } from '../../../../lib/css'
import type { WorkspaceValues } from '../../types'

export function TableToolbar({ m }: { m: WorkspaceValues }) {
  const { addAutomation, clearTableSearch, colsBtnStyle, filterBadge, filterBtnStyle, hasTableSearch, onTableSearch, openAddCol, openRunCells, runCellsBtnStyle, runCellsCount, runDotStyle, runLabel, runPillStyle, sortBtnStyle, tableSearch, toggleColumns, toggleExport, toggleFilter, toggleImport, toggleRunPanel, toggleSort } = m
  return (
    <div
                        style={cssToObj(
                          'flex:none; display:flex; flex-wrap:wrap; align-items:center; gap:6px; row-gap:7px; padding:8px 16px; border-bottom:1px solid #EFEFF2; position:relative',
                        )}
                      >
                        {'\n            '}
                        <button
                          onClick={addAutomation}
                          className="flex-none whitespace-nowrap h-[27px] py-[0] px-[10px] [border:1px_solid_#DDD6F3] bg-[#F5F1FD] text-[#5B21B6] rounded-[6px] text-[11.5px] font-[600] cursor-pointer flex items-center gap-[5px] hv-ttjng3"
                        >
                          {'\n              '}
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.9"
                          >
                            <path d="M6 4l9 6-9 6z"></path>
                          </svg>
                          {'\n              Add automation\n            '}
                        </button>
                        {'\n            '}
                        <button
                          onClick={openAddCol}
                          className="flex-none whitespace-nowrap h-[27px] py-[0] px-[10px] [border:1px_solid_#E4E4E8] bg-[#FFFFFF] text-[#3F3F46] rounded-[6px] text-[11.5px] font-[600] cursor-pointer flex items-center gap-[5px] hv-u4v0t1"
                        >
                          {'\n              '}
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="#6D28D9"
                            strokeWidth="1.9"
                          >
                            <path d="M11 2.5L4.5 11.5H9l-.6 6 6.6-9H10.4z"></path>
                          </svg>
                          {'\n              Add enrichment\n            '}
                        </button>
                        {'\n            '}
                        <div className="w-[1px] h-[18px] bg-[#EAEAEE] my-[0] mx-[2px]"></div>
                        {'\n            '}
                        <button
                          onClick={toggleImport}
                          className="flex-none whitespace-nowrap h-[27px] py-[0] px-[9px] [border:1px_solid_#E4E4E8] bg-[#FFFFFF] rounded-[6px] text-[11.5px] text-[#3F3F46] font-[550] cursor-pointer flex items-center gap-[5px] hv-u4v0t1"
                        >
                          {'\n              '}
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="#71717A"
                            strokeWidth="1.8"
                          >
                            <path d="M10 13V4M6 8l4-4 4 4M4 15.5h12"></path>
                          </svg>
                          {'\n              Import\n              '}
                          <svg
                            width="9"
                            height="9"
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="#A1A1AA"
                            strokeWidth="2.4"
                          >
                            <path d="M5 8l5 5 5-5"></path>
                          </svg>
                          {'\n            '}
                        </button>
                        {'\n            '}
                        <button
                          onClick={toggleExport}
                          className="flex-none whitespace-nowrap h-[27px] py-[0] px-[9px] [border:1px_solid_#E4E4E8] bg-[#FFFFFF] rounded-[6px] text-[11.5px] text-[#3F3F46] font-[550] cursor-pointer flex items-center gap-[5px] hv-u4v0t1"
                        >
                          {'\n              '}
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="#71717A"
                            strokeWidth="1.8"
                          >
                            <path d="M10 4v9M6 9l4 4 4-4M4 15.5h12"></path>
                          </svg>
                          {'\n              Export\n              '}
                          <svg
                            width="9"
                            height="9"
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="#A1A1AA"
                            strokeWidth="2.4"
                          >
                            <path d="M5 8l5 5 5-5"></path>
                          </svg>
                          {'\n            '}
                        </button>
                        {'\n            '}
                        <div className="w-[1px] h-[18px] bg-[#EAEAEE] my-[0] mx-[2px]"></div>
                        {'\n            '}
                        <div className="flex flex-none items-center gap-[6px] h-[27px] py-[0] px-[9px] [border:1px_solid_#E4E4E8] rounded-[6px] bg-[#FFFFFF] w-[142px]">
                          {'\n              '}
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
                          {'\n              '}
                          <input
                            onChange={onTableSearch}
                            value={tableSearch}
                            placeholder="Search rows"
                            className="[border:none] outline-none bg-transparent text-[11.5px] w-full [min-width:0] text-[#3F3F46]"
                          />
                          {'\n              '}
                          {hasTableSearch ? (
                            <>
                              {'\n                '}
                              <span
                                onClick={clearTableSearch}
                                className="flex-none text-[#A1A1AA] text-[13px] leading-[1] cursor-pointer"
                              >
                                {'×'}
                              </span>
                              {'\n              '}
                            </>
                          ) : null}
                          {'\n            '}
                        </div>
                        {'\n            '}
                        <div className="ml-[auto] flex items-center gap-[6px]">
                          {'\n              '}
                          <button onClick={openRunCells} style={cssToObj(runCellsBtnStyle)}>
                            {'\n                '}
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 20 20"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.9"
                            >
                              <path d="M6 4l9 6-9 6z"></path>
                            </svg>
                            {'\n                Run cells'}
                            <span>{runCellsCount}</span>
                            {'\n              '}
                          </button>
                          {'\n              '}
                          <button
                            onClick={toggleColumns}
                            title="Column visibility"
                            style={cssToObj(colsBtnStyle)}
                          >
                            {'\n                '}
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 20 20"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.6"
                            >
                              <rect x="3" y="4" width="14" height="12" rx="2"></rect>
                              <path d="M8 4v12M13 4v12"></path>
                            </svg>
                            {'\n              '}
                          </button>
                          {'\n              '}
                          <button onClick={toggleFilter} style={cssToObj(filterBtnStyle)}>
                            {'\n                '}
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 20 20"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <path d="M3 5h14l-5.4 6v5l-3.2 1.6V11z"></path>
                            </svg>
                            {'\n                Filter '}
                            <span>{filterBadge}</span>
                            {'\n              '}
                          </button>
                          {'\n              '}
                          <button onClick={toggleSort} style={cssToObj(sortBtnStyle)}>
                            {'\n                '}
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 20 20"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <path d="M6 4v12M3 13l3 3 3-3M14 16V4M11 7l3-3 3 3"></path>
                            </svg>
                            {'\n                Sort\n              '}
                          </button>
                          {'\n              '}
                          <div onClick={toggleRunPanel} style={cssToObj(runPillStyle)}>
                            {'\n                '}
                            <span style={cssToObj(runDotStyle)}></span>
                            {'\n                '}
                            <span>{runLabel}</span>
                            {'\n              '}
                          </div>
                          {'\n            '}
                        </div>
                        {'\n\n            '}
                        {m.importOpen ? <ImportMenu m={m} /> : null}
                        {'\n            '}
                        {m.exportOpen ? <ExportMenu m={m} /> : null}
                        {'\n\n            '}
                        {m.columnsOpen ? <ColumnsMenu m={m} /> : null}
                        {'\n\n            '}
                        {m.filterOpen ? <FilterMenu m={m} /> : null}
                        {'\n\n            '}
                        {m.sortOpen ? <SortMenu m={m} /> : null}
                        {'\n\n            '}
                        {m.runPanelOpen ? <RunPanel m={m} /> : null}
                        {'\n          '}
                      </div>
  )
}
