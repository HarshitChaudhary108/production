import { Fragment } from 'react'
import { cssToObj } from '../../../../lib/css'
import type { WorkspaceValues } from '../../types'
import { cellText } from './gridUtils'
import { useCellGrid } from './useCellGrid'
import { useColumnResize } from './useColumnResize'

export function CompaniesSheet({ m }: { m: WorkspaceValues }) {
  const { gridCols, headCells, openAddCol, rowHeight, rows, rowsFooter, selectAllBg, selectAllBorder, selectAllMark, tableMinWidth, toggleSelectAll } = m
  const rowNames = (rows ?? []).map((r: any) => r.name as string)
  const columnKeys = (headCells ?? []).map((c: any) => c.key as string)
  const editableCols = new Set<string>(
    (headCells ?? []).filter((c: any) => c.editable).map((c: any) => c.key as string),
  )
  const grid = useCellGrid({
    rows: rowNames,
    cols: columnKeys,
    editableCol: (col) => editableCols.has(col),
    onEdit: m.setCellEdits,
    onCopy: m.noteCopied,
    onPasteSkipped: m.noteSkipped,
  })
  const startResize = useColumnResize(m.setColWidth)
  return (
    <>
                            {'\n              '}
                            <div
                              {...grid.gridProps}
                              style={cssToObj(`min-width:${tableMinWidth}; outline:none`)}
                            >
                              {'\n                '}
                              <div
                                role="row"
                                style={cssToObj(
                                  `display:grid; grid-template-columns:${gridCols}; background:#F7F7F9; border-bottom:1px solid #E5E5EA; position:sticky; top:0; z-index:5`,
                                )}
                              >
                                {'\n                  '}
                                {(headCells ?? []).map((c: any, colIndex: number) => (
                                  <Fragment key={colIndex}>
                                    {'\n                    '}
                                    <div
                                      role="columnheader"
                                      className="relative py-[7px] px-[9px] flex items-center gap-[5px] text-[10.5px] font-[650] text-[#71717A] whitespace-nowrap overflow-visible [border-right:1px_solid_#EDEDF0]"
                                    >
                                      {'\n                      '}
                                      {c.isCheck ? (
                                        <>
                                          {'\n                        '}
                                          <span
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              toggleSelectAll()
                                            }}
                                            title="Select all rows"
                                            style={cssToObj(
                                              `width:14px; height:14px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:9px; color:#FFFFFF; cursor:pointer; border:1px solid ${selectAllBorder}; background:${selectAllBg}`,
                                            )}
                                          >
                                            <span>{selectAllMark}</span>
                                          </span>
                                          {'\n                      '}
                                        </>
                                      ) : null}
                                      {'\n                      '}
                                      <span
                                        className="overflow-hidden text-ellipsis"
                                        onClick={
                                          c.key !== 'check' && c.key !== 'actions' && c.key !== 'num'
                                            ? () => grid.selectColumn(c.key)
                                            : undefined
                                        }
                                      >
                                        <span>{c.label}</span>
                                      </span>
                                      {'\n                      '}
                                      {c.isCustomHead ? (
                                        <>
                                          {'\n                        '}
                                          <span className="ml-[auto] relative flex items-center gap-[4px]">
                                            {'\n                          '}
                                            <span
                                              onClick={c.toggleMenu}
                                              title="Run this column"
                                              className="hv-ttjng3"
                                              style={cssToObj(
                                                `width:18px; height:18px; display:flex; align-items:center; justify-content:center; border-radius:4px; color:#6D28D9; cursor:pointer; background:${c.menuBg}`,
                                              )}
                                            >
                                              {'\n                            '}
                                              <svg
                                                width="9"
                                                height="9"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                              >
                                                <path d="M6 4l9 6-9 6z"></path>
                                              </svg>
                                              {'\n                          '}
                                            </span>
                                            {'\n                          '}
                                            <span
                                              onClick={c.remove}
                                              title="Delete column"
                                              className="text-[11px] text-[#B4B4BB] cursor-pointer leading-[1]"
                                            >
                                              {'×'}
                                            </span>
                                            {'\n                          '}
                                            {c.menuOpen ? (
                                              <>
                                                {'\n                            '}
                                                <span className="absolute top-[23px] right-[0] w-[226px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[9px] shadow-[0_16px_38px_rgba(24,24,27,.17)] p-[4px] z-[60] flex flex-col [animation:pop_.12s_ease-out]">
                                                  {'\n                              '}
                                                  <span className="pt-[5px] px-[8px] pb-[4px] text-[9.5px] font-[650] text-[#A1A1AA] tracking-[.05em] uppercase">
                                                    <span>{c.cost}</span>
                                                  </span>
                                                  {'\n                              '}
                                                  {(c.menuItems ?? []).map((it: any, __i: number) => (
                                                    <Fragment key={__i}>
                                                      {'\n                                '}
                                                      <span
                                                        onClick={it.pick}
                                                        className="hv-u4v0t1"
                                                        style={cssToObj(
                                                          `display:flex; align-items:center; justify-content:space-between; gap:10px; padding:6px 8px; border-radius:5px; font-size:11.5px; font-weight:500; cursor:pointer; color:${it.color}`,
                                                        )}
                                                      >
                                                        {'\n                                  '}
                                                        <span>
                                                          <span>{it.label}</span>
                                                        </span>
                                                        {'\n                                  '}
                                                        <span className="text-[10px] font-[550] text-[#A1A1AA] tabular-nums">
                                                          <span>{it.hint}</span>
                                                        </span>
                                                        {'\n                                '}
                                                      </span>
                                                      {'\n                              '}
                                                    </Fragment>
                                                  ))}
                                                  {'\n                            '}
                                                </span>
                                                {'\n                          '}
                                              </>
                                            ) : null}
                                            {'\n                        '}
                                          </span>
                                          {'\n                      '}
                                        </>
                                      ) : null}
                                      {'\n                      '}
                                      {c.isAdd ? (
                                        <>
                                          {'\n                        '}
                                          <span
                                            onClick={openAddCol}
                                            title="Add column"
                                            className="w-[18px] h-[18px] flex items-center justify-center rounded-[5px] [border:1px_dashed_#C9B6F5] text-[#6D28D9] text-[12px] cursor-pointer hv-u4uxge"
                                          >
                                            {'+'}
                                          </span>
                                          {'\n                      '}
                                        </>
                                      ) : null}
                                      {'\n                      '}
                                      {c.key !== 'check' && c.key !== 'actions' && c.key !== 'num' ? (
                                        <span
                                          onMouseDown={(e) => startResize(c.key, e)}
                                          aria-hidden="true"
                                          className="group absolute top-[0] right-[-3px] w-[7px] h-full flex justify-center cursor-col-resize z-[6]"
                                        >
                                          <span className="w-[1px] h-full bg-transparent group-hover:bg-[#C9B6F5]"></span>
                                        </span>
                                      ) : null}
                                      {'\n                    '}
                                    </div>
                                    {'\n                  '}
                                  </Fragment>
                                ))}
                                {'\n                '}
                              </div>
                              {'\n                '}
                              {(rows ?? []).map((r: any, rowIndex: number) => (
                                <Fragment key={r.name ?? rowIndex}>
                                  {'\n                  '}
                                  <div
                                    role="row"
                                    className="hv-udcbnc"
                                    style={cssToObj(
                                      `display:grid; grid-template-columns:${gridCols}; border-bottom:1px solid #F1F1F3; cursor:default; background:${r.rowBg}`,
                                    )}
                                  >
                                    {'\n                    '}
                                    {(r.cells ?? []).map((c: any, cellIndex: number) => {
                                      const head = (headCells ?? [])[cellIndex] ?? {}
                                      const cellKey = (head.key as string) ?? String(cellIndex)
                                      const activeCell = grid.isActive(r.name, cellKey)
                                      const selectedCell = grid.isSelected(r.name, cellKey)
                                      const editingCell = grid.isEditing(r.name, cellKey)
                                      const editedCell = m.isEdited(r.name, cellKey)
                                      return (
                                      <Fragment key={cellIndex}>
                                        {'\n                      '}
                                        <div
                                          id={grid.cellId(r.name, cellKey)}
                                          role="gridcell"
                                          aria-selected={selectedCell}
                                          data-cell={`${r.name}|${cellKey}`}
                                          data-text={cellText(c)}
                                          onMouseDown={
                                            cellKey === 'num'
                                              ? (e) => grid.rowMouseDown(e, r.name)
                                              : (e) => grid.cellMouseDown(e, r.name, cellKey)
                                          }
                                          onMouseEnter={() => grid.cellMouseEnter(r.name, cellKey)}
                                          style={cssToObj(
                                            `padding:7px 9px; display:flex; align-items:center; min-width:0; gap:6px; border-right:1px solid #F4F4F6; height:${rowHeight}; position:relative; background:${activeCell ? '#FBFAFF' : selectedCell ? '#F7F4FE' : 'transparent'}; box-shadow:${activeCell ? 'inset 0 0 0 2px #6D28D9' : editedCell ? 'inset 2px 0 0 #C9B6F5' : 'none'}`,
                                          )}
                                        >
                                          {editingCell ? (
                                            <input
                                              {...grid.inputProps}
                                              spellCheck={false}
                                              aria-label={`Edit ${head.label ?? 'cell'}`}
                                              style={cssToObj(
                                                'position:absolute; inset:0; width:100%; height:100%; padding:0 8px; border:2px solid #6D28D9; outline:none; background:#FFFFFF; font-size:11.5px; color:#18181B; z-index:3',
                                              )}
                                            />
                                          ) : null}
                                          {'\n\n                        '}
                                          {c.isNum ? (
                                            <>
                                              {'\n                          '}
                                              <span className="text-[10.5px] text-[#B4B4BB] tabular-nums">
                                                <span>{c.value}</span>
                                              </span>
                                              {'\n                        '}
                                            </>
                                          ) : null}
                                          {'\n\n                        '}
                                          {c.isCustom ? (
                                            <>
                                              {'\n                          '}
                                              <span className="flex items-center gap-[6px] [min-width:0] w-full">
                                                {'\n                            '}
                                                {c.needsRun ? (
                                                  <>
                                                    {'\n                              '}
                                                    <span
                                                      onClick={c.run}
                                                      className="flex items-center gap-[4px] h-[20px] py-[0] px-[7px] [border:1px_solid_#E4E4E8] rounded-[5px] bg-[#FFFFFF] text-[10.5px] text-[#52525B] font-[600] cursor-pointer whitespace-nowrap hv-iubl1z"
                                                    >
                                                      {'\n                                '}
                                                      <svg
                                                        width="9"
                                                        height="9"
                                                        viewBox="0 0 20 20"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                      >
                                                        <path d="M6 4l9 6-9 6z"></path>
                                                      </svg>
                                                      {'\n                                Run · '}
                                                      <span>{c.cost}</span>
                                                      {'\n                              '}
                                                    </span>
                                                    {'\n                            '}
                                                  </>
                                                ) : null}
                                                {'\n                            '}
                                                {c.pending ? (
                                                  <>
                                                    {'\n                              '}
                                                    <span className="flex items-center gap-[6px]">
                                                      {'\n                                '}
                                                      <span className="w-[6px] h-[6px] rounded-full bg-[#D4D4D8]"></span>
                                                      {'\n                                '}
                                                      <span className="text-[11.5px] text-[#B4B4BB]">
                                                        {'Queued'}
                                                      </span>
                                                      {'\n                              '}
                                                    </span>
                                                    {'\n                            '}
                                                  </>
                                                ) : null}
                                                {'\n                            '}
                                                {c.running ? (
                                                  <>
                                                    {'\n                              '}
                                                    <span className="flex items-center gap-[7px]">
                                                      {'\n                                '}
                                                      <span className="w-[7px] h-[7px] rounded-full bg-[#2563EB] [animation:pulse_1.1s_ease-in-out_infinite]"></span>
                                                      {'\n                                '}
                                                      <span className="text-[11.5px] text-[#8E8E96]">
                                                        {'Generating…'}
                                                      </span>
                                                      {'\n                              '}
                                                    </span>
                                                    {'\n                            '}
                                                  </>
                                                ) : null}
                                                {'\n                            '}
                                                {c.failed ? (
                                                  <>
                                                    {'\n                              '}
                                                    <span className="flex items-center gap-[6px]">
                                                      {'\n                                '}
                                                      <span className="w-[7px] h-[7px] rounded-full bg-[#DC2626]"></span>
                                                      {'\n                                '}
                                                      <span className="text-[11.5px] text-[#B91C1C]">
                                                        {'Failed'}
                                                      </span>
                                                      {'\n                                '}
                                                      <span className="text-[10px] text-[#E4E4E8]">
                                                        {'·'}
                                                      </span>
                                                      {'\n                                '}
                                                      <span
                                                        onClick={c.retry}
                                                        className="hv-vdm6bt"
                                                        style={cssToObj(
                                                          'font-size:11px; font-weight:600; color:#5B21B6; cursor:pointer; text-decoration:underline; text-decoration-color:#DDD6F3',
                                                        )}
                                                      >
                                                        {'Retry'}
                                                      </span>
                                                      {'\n                              '}
                                                    </span>
                                                    {'\n                            '}
                                                  </>
                                                ) : null}
                                                {'\n                            '}
                                                {c.cancelled ? (
                                                  <>
                                                    {'\n                              '}
                                                    <span className="flex items-center gap-[6px]">
                                                      {'\n                                '}
                                                      <span className="w-[7px] h-[7px] rounded-full [border:1.4px_solid_#D4D4D8]"></span>
                                                      {'\n                                '}
                                                      <span className="text-[11.5px] text-[#A1A1AA]">
                                                        {'Cancelled'}
                                                      </span>
                                                      {'\n                                '}
                                                      <span className="text-[10px] text-[#E4E4E8]">
                                                        {'·'}
                                                      </span>
                                                      {'\n                                '}
                                                      <span
                                                        onClick={c.retry}
                                                        className="hv-vdm6bt"
                                                        style={cssToObj(
                                                          'font-size:11px; font-weight:600; color:#5B21B6; cursor:pointer; text-decoration:underline; text-decoration-color:#DDD6F3',
                                                        )}
                                                      >
                                                        {'Run'}
                                                      </span>
                                                      {'\n                              '}
                                                    </span>
                                                    {'\n                            '}
                                                  </>
                                                ) : null}
                                                {'\n                            '}
                                                {c.skipped ? (
                                                  <>
                                                    {'\n                              '}
                                                    <span className="text-[11.5px] text-[#B4B4BB]">
                                                      {'Skipped'}
                                                    </span>
                                                    {'\n                            '}
                                                  </>
                                                ) : null}
                                                {'\n                            '}
                                                {c.hasVal ? (
                                                  <>
                                                    {'\n                              '}
                                                    <span
                                                      style={cssToObj(
                                                        `font-size:11.5px; color:${c.color}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap`,
                                                      )}
                                                    >
                                                      <span>{c.value}</span>
                                                    </span>
                                                    {'\n                            '}
                                                  </>
                                                ) : null}
                                                {'\n                            '}
                                                {c.isPlain && !c.hasVal ? (
                                                  <>
                                                    {'\n                              '}
                                                    <span className="text-[11.5px] text-[#B4B4BB]">
                                                      {'Add value'}
                                                    </span>
                                                    {'\n                            '}
                                                  </>
                                                ) : null}
                                                {'\n                          '}
                                              </span>
                                              {'\n                        '}
                                            </>
                                          ) : null}
                                          {'\n\n                        '}
                                          {c.isActions ? (
                                            <>
                                              {'\n                          '}
                                              <span className="relative flex">
                                                {'\n                            '}
                                                <span
                                                  onClick={c.toggleMenu}
                                                  title="Row actions"
                                                  className="w-[20px] h-[20px] flex items-center justify-center rounded-[5px] text-[#B4B4BB] text-[12px] cursor-pointer hv-q1v9ly"
                                                >
                                                  {'•••'}
                                                </span>
                                                {'\n                            '}
                                                {c.menuOpen ? (
                                                  <>
                                                    {'\n                              '}
                                                    <span className="absolute top-[22px] right-[0] w-[184px] bg-[#FFFFFF] [border:1px_solid_#E4E4E8] rounded-[8px] shadow-[0_14px_34px_rgba(24,24,27,.16)] p-[4px] z-[45] flex flex-col [animation:pop_.12s_ease-out]">
                                                      {'\n                                '}
                                                      {(c.items ?? []).map((it: any, __i: number) => (
                                                        <Fragment key={__i}>
                                                          {'\n                                  '}
                                                          <span
                                                            onClick={it.pick}
                                                            className="py-[6px] px-[8px] rounded-[5px] text-[11.5px] text-[#3F3F46] cursor-pointer whitespace-nowrap hv-u4v0t1"
                                                          >
                                                            <span>{it.label}</span>
                                                          </span>
                                                          {'\n                                '}
                                                        </Fragment>
                                                      ))}
                                                      {'\n                              '}
                                                    </span>
                                                    {'\n                            '}
                                                  </>
                                                ) : null}
                                                {'\n                          '}
                                              </span>
                                              {'\n                        '}
                                            </>
                                          ) : null}
                                          {'\n\n                        '}
                                          {c.isCheck ? (
                                            <>
                                              {'\n                          '}
                                              <span
                                                onClick={c.toggle}
                                                style={cssToObj(
                                                  `width:14px; height:14px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:9px; color:#FFFFFF; border:1px solid ${c.boxBorder}; background:${c.boxBg}`,
                                                )}
                                              >
                                                <span>{c.check}</span>
                                              </span>
                                              {'\n                        '}
                                            </>
                                          ) : null}
                                          {'\n\n                        '}
                                          {c.isCompany ? (
                                            <>
                                              {'\n                          '}
                                              <span className="flex items-center gap-[7px] [min-width:0]">
                                                {'\n                            '}
                                                <span
                                                  style={cssToObj(
                                                    `width:20px; height:20px; border-radius:5px; flex:none; display:flex; align-items:center; justify-content:center; font-size:9.5px; font-weight:700; color:#FFFFFF; background:${c.logoBg}`,
                                                  )}
                                                >
                                                  <span>{c.logo}</span>
                                                </span>
                                                {'\n                            '}
                                                <span
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    r.open()
                                                  }}
                                                  title="Open record"
                                                  className="text-[12px] font-[600] text-[#18181B] overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer"
                                                >
                                                  <span>{c.value}</span>
                                                </span>
                                                {'\n                          '}
                                              </span>
                                              {'\n                        '}
                                            </>
                                          ) : null}
                                          {'\n\n                        '}
                                          {c.isLink ? (
                                            <>
                                              {'\n                          '}
                                              <span className="flex items-center gap-[6px] [min-width:0]">
                                                {'\n                            '}
                                                <span
                                                  style={cssToObj(
                                                    `width:15px; height:15px; border-radius:4px; flex:none; display:flex; align-items:center; justify-content:center; font-size:8px; font-weight:700; color:#FFFFFF; background:${c.logoBg}`,
                                                  )}
                                                >
                                                  <span>{c.logo}</span>
                                                </span>
                                                {'\n                            '}
                                                <span
                                                  onClick={c.act}
                                                  className="hv-18t8341"
                                                  style={cssToObj(
                                                    'font-size:11.5px; color:#3F3F46; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-decoration:underline; text-decoration-color:#D9D9DF; cursor:pointer',
                                                  )}
                                                >
                                                  <span>{c.value}</span>
                                                </span>
                                                {'\n                          '}
                                              </span>
                                              {'\n                        '}
                                            </>
                                          ) : null}
                                          {'\n\n                        '}
                                          {c.isLinkedIn ? (
                                            <>
                                              {'\n                          '}
                                              <span
                                                onClick={c.act}
                                                className="flex items-center gap-[6px] [min-width:0] cursor-pointer"
                                              >
                                                {'\n                            '}
                                                <svg
                                                  width="14"
                                                  height="14"
                                                  viewBox="0 0 20 20"
                                                  fill="#0A66C2"
                                                  className="flex-none"
                                                >
                                                  <rect width="20" height="20" rx="3"></rect>
                                                  <path
                                                    d="M5 8h2v7H5zM6 4.6a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4zM9 8h2v1a2.6 2.6 0 014 2.3V15h-2v-3.3c0-.9-.5-1.4-1.2-1.4S10 10.9 10 11.8V15H9z"
                                                    fill="#FFFFFF"
                                                  ></path>
                                                </svg>
                                                {'\n                            '}
                                                <span
                                                  className="hv-1kffbb6"
                                                  style={cssToObj(
                                                    'font-size:11.5px; color:#3F3F46; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-decoration:underline; text-decoration-color:#D9D9DF',
                                                  )}
                                                >
                                                  <span>{c.value}</span>
                                                </span>
                                                {'\n                          '}
                                              </span>
                                              {'\n                        '}
                                            </>
                                          ) : null}
                                          {'\n\n                        '}
                                          {c.isContact ? (
                                            <>
                                              {'\n                          '}
                                              <span
                                                onClick={c.act}
                                                className="flex items-center gap-[7px] [min-width:0] cursor-pointer"
                                              >
                                                {'\n                            '}
                                                <span
                                                  style={cssToObj(
                                                    `width:20px; height:20px; border-radius:50%; flex:none; display:flex; align-items:center; justify-content:center; font-size:8.5px; font-weight:650; color:#3F3F46; background:${c.avBg}`,
                                                  )}
                                                >
                                                  <span>{c.initials}</span>
                                                </span>
                                                {'\n                            '}
                                                <span className="[min-width:0] flex flex-col">
                                                  {'\n                              '}
                                                  <span className="text-[11.5px] font-[550] text-[#27272A] overflow-hidden text-ellipsis whitespace-nowrap">
                                                    <span>{c.value}</span>
                                                  </span>
                                                  {'\n                              '}
                                                  <span className="text-[10px] text-[#A1A1AA] overflow-hidden text-ellipsis whitespace-nowrap">
                                                    <span>{c.role}</span>
                                                  </span>
                                                  {'\n                            '}
                                                </span>
                                                {'\n                          '}
                                              </span>
                                              {'\n                        '}
                                            </>
                                          ) : null}
                                          {'\n\n                        '}
                                          {c.isEmail ? (
                                            <>
                                              {'\n                          '}
                                              <span
                                                onClick={c.act}
                                                title="Copy email"
                                                className="flex items-center gap-[5px] [min-width:0] cursor-pointer"
                                              >
                                                {'\n                            '}
                                                <span className="text-[11px] text-[#52525B] [font-family:'JetBrains_Mono',_monospace] overflow-hidden text-ellipsis whitespace-nowrap">
                                                  <span>{c.value}</span>
                                                </span>
                                                {'\n                            '}
                                                <span style={cssToObj(c.statusStyle)}>
                                                  <span>{c.status}</span>
                                                </span>
                                                {'\n                          '}
                                              </span>
                                              {'\n                        '}
                                            </>
                                          ) : null}
                                          {'\n\n                        '}
                                          {c.isChips ? (
                                            <>
                                              {'\n                          '}
                                              <span className="flex items-center gap-[4px] overflow-hidden">
                                                {'\n                            '}
                                                {(c.list ?? []).map((x: any, __i: number) => (
                                                  <Fragment key={__i}>
                                                    {'\n                              '}
                                                    <span onClick={x.act} style={cssToObj(x.style)}>
                                                      <span>{x.label}</span>
                                                    </span>
                                                    {'\n                            '}
                                                  </Fragment>
                                                ))}
                                                {'\n                          '}
                                              </span>
                                              {'\n                        '}
                                            </>
                                          ) : null}
                                          {'\n\n                        '}
                                          {c.isScore ? (
                                            <>
                                              {'\n                          '}
                                              <span className="flex flex-col gap-[3px] w-full">
                                                {'\n                            '}
                                                <span
                                                  style={cssToObj(
                                                    `font-size:11.5px; font-weight:600; color:${c.color}; font-variant-numeric:tabular-nums`,
                                                  )}
                                                >
                                                  <span>{c.value}</span>
                                                </span>
                                                {'\n                            '}
                                                <span className="h-[3px] rounded-[2px] bg-[#F1F1F3] overflow-hidden w-full">
                                                  {'\n                              '}
                                                  <span
                                                    style={cssToObj(
                                                      `display:block; height:100%; border-radius:2px; background:${c.color}; width:${c.pct}`,
                                                    )}
                                                  ></span>
                                                  {'\n                            '}
                                                </span>
                                                {'\n                          '}
                                              </span>
                                              {'\n                        '}
                                            </>
                                          ) : null}
                                          {'\n\n                        '}
                                          {c.isBadge ? (
                                            <>
                                              {'\n                          '}
                                              <span style={cssToObj(c.badgeStyle)}>
                                                <span>{c.value}</span>
                                              </span>
                                              {'\n                        '}
                                            </>
                                          ) : null}
                                          {'\n\n                        '}
                                          {c.isText ? (
                                            <>
                                              {'\n                          '}
                                              <span
                                                onClick={c.act}
                                                style={cssToObj(
                                                  `font-size:11.5px; color:${c.color}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap`,
                                                )}
                                              >
                                                <span>{c.value}</span>
                                              </span>
                                              {'\n                        '}
                                            </>
                                          ) : null}
                                          {'\n                      '}
                                        </div>
                                        {'\n                    '}
                                      </Fragment>
                                      )
                                    })}
                                    {'\n                  '}
                                  </div>
                                  {'\n                '}
                                </Fragment>
                              ))}
                              {'\n                '}
                              <div className="py-[8px] px-[12px] text-[11px] text-[#A1A1AA] bg-[#FAFAFB] [border-bottom:1px_solid_#F1F1F3]">
                                <span>{rowsFooter}</span>
                              </div>
                              {'\n              '}
                            </div>
                            {'\n            '}
                          </>
  )
}
