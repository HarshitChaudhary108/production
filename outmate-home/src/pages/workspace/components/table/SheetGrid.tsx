import { Fragment, useState } from 'react'
import type { ReactNode } from 'react'
import { cssToObj } from '../../../../lib/css'
import { useCellGrid } from './useCellGrid'
import { useColumnResize } from './useColumnResize'

export type SheetColumn = {
  key: string
  label: string
  width: number
  rowHeader?: boolean
  gap?: number
  borderRight?: boolean
}

export type SheetCell = { node: ReactNode; text?: string }
export type SheetRow = { id: string; cells: SheetCell[] }

type SheetGridProps = {
  name: string
  columns: SheetColumn[]
  rows: SheetRow[]
  rowHeight?: string
  onCopy?: (count: number) => void
  onPasteSkipped?: (count: number) => void
}

export function SheetGrid({ name, columns, rows, rowHeight = '34px', onCopy, onPasteSkipped }: SheetGridProps) {
  const [widths, setWidths] = useState<Record<string, number>>({})
  const startResize = useColumnResize((key, width) =>
    setWidths((prev) => ({
      ...prev,
      [key]: width,
    })),
  )
  const grid = useCellGrid({
    rows: rows.map((r) => r.id),
    cols: columns.map((c) => c.key),
    editableCol: () => false,
    onEdit: () => {},
    onCopy,
    onPasteSkipped,
  })
  const template = columns.map((c) => `${widths[c.key] ?? c.width}px`).join(' ')
  const minWidth = columns.reduce((sum, c) => sum + (widths[c.key] ?? c.width), 0)

  return (
    <div
      {...grid.gridProps}
      data-sheet={name}
      style={cssToObj(`min-width:${minWidth}px; outline:none`)}
    >
      <div
        role="row"
        style={cssToObj(
          `display:grid; grid-template-columns:${template}; background:#F7F7F9; border-bottom:1px solid #E5E5EA; position:sticky; top:0; z-index:5`,
        )}
      >
        {columns.map((col) => (
          <div
            key={col.key}
            role="columnheader"
            className="relative py-[7px] px-[9px] flex items-center gap-[5px] text-[10.5px] font-[650] text-[#71717A] whitespace-nowrap overflow-visible [border-right:1px_solid_#EDEDF0]"
          >
            <span
              className="overflow-hidden text-ellipsis"
              onClick={() => grid.selectColumn(col.key)}
            >
              <span>{col.label}</span>
            </span>
            <span
              onMouseDown={(e) => startResize(col.key, e)}
              aria-hidden="true"
              className="group absolute top-[0] right-[-3px] w-[7px] h-full flex justify-center cursor-col-resize z-[6]"
            >
              <span className="w-[1px] h-full bg-transparent group-hover:bg-[#C9B6F5]"></span>
            </span>
          </div>
        ))}
      </div>
      {rows.map((row) => (
        <div
          key={row.id}
          role="row"
          className="hv-udcbnc"
          style={cssToObj(
            `display:grid; grid-template-columns:${template}; border-bottom:1px solid #F1F1F3; cursor:default; background:#FFFFFF`,
          )}
        >
          {columns.map((col, cellIndex) => {
            const cell = row.cells[cellIndex] ?? { node: null }
            const activeCell = grid.isActive(row.id, col.key)
            const selectedCell = grid.isSelected(row.id, col.key)
            const borderRight = col.borderRight === false ? 'none' : '1px solid #F4F4F6'
            return (
              <Fragment key={col.key}>
                <div
                  id={grid.cellId(row.id, col.key)}
                  role="gridcell"
                  aria-selected={selectedCell}
                  data-cell={`${row.id}|${col.key}`}
                  data-text={cell.text ?? ''}
                  onMouseDown={
                    col.rowHeader
                      ? (e) => grid.rowMouseDown(e, row.id)
                      : (e) => grid.cellMouseDown(e, row.id, col.key)
                  }
                  onMouseEnter={() => grid.cellMouseEnter(row.id, col.key)}
                  style={cssToObj(
                    `padding:7px 9px; display:flex; align-items:center; min-width:0; gap:${col.gap ?? 6}px; border-right:${borderRight}; height:${rowHeight}; position:relative; background:${activeCell ? '#FBFAFF' : selectedCell ? '#F7F4FE' : 'transparent'}; box-shadow:${activeCell ? 'inset 0 0 0 2px #6D28D9' : 'none'}`,
                  )}
                >
                  {cell.node}
                </div>
              </Fragment>
            )
          })}
        </div>
      ))}
    </div>
  )
}
