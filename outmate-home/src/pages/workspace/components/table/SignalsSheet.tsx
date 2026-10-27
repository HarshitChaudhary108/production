import { cssToObj } from '../../../../lib/css'
import type { WorkspaceValues } from '../../types'
import { SheetGrid, type SheetCell, type SheetColumn, type SheetRow } from './SheetGrid'

const COLUMNS: SheetColumn[] = [
  { key: 'num', label: '#', width: 44, rowHeader: true },
  { key: 'company', label: 'Company', width: 166, gap: 7 },
  { key: 'type', label: 'Signal Type', width: 148 },
  { key: 'detail', label: 'Signal', width: 260 },
  { key: 'evidence', label: 'Evidence', width: 262 },
  { key: 'source', label: 'Source', width: 126 },
  { key: 'time', label: 'Detected', width: 100 },
  { key: 'fresh', label: 'Freshness', width: 104 },
  { key: 'conf', label: 'Strength', width: 106 },
  { key: 'relevance', label: 'Buying Relevance', width: 158, borderRight: false },
]

const muted = 'text-[11.5px] text-[#52525B] overflow-hidden text-ellipsis whitespace-nowrap'

function cells(s: any): SheetCell[] {
  return [
    {
      text: s.n,
      node: (
        <span className="text-[10.5px] text-[#B4B4BB] tabular-nums">
          <span>{s.n}</span>
        </span>
      ),
    },
    {
      text: s.company,
      node: (
        <>
          <span
            style={cssToObj(
              `width:19px; height:19px; border-radius:5px; flex:none; display:flex; align-items:center; justify-content:center; font-size:8.5px; font-weight:700; color:#FFFFFF; background:${s.logoBg}`,
            )}
          >
            <span>{s.logo}</span>
          </span>
          <span
            onClick={(e) => {
              e.stopPropagation()
              s.open()
            }}
            title="Open record"
            className="text-[11.5px] font-[600] overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer"
          >
            <span>{s.company}</span>
          </span>
        </>
      ),
    },
    {
      text: s.type,
      node: (
        <>
          <span className="text-[11px]">
            <span>{s.icon}</span>
          </span>
          <span className="text-[11.5px] text-[#3F3F46] font-[550]">
            <span>{s.type}</span>
          </span>
        </>
      ),
    },
    {
      text: s.detail,
      node: (
        <span
          style={cssToObj(
            `font-size:11.5px; color:${s.detailColor}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap`,
          )}
        >
          <span>{s.detail}</span>
        </span>
      ),
    },
    {
      text: s.evidence,
      node: <span className={muted}><span>{s.evidence}</span></span>,
    },
    {
      text: s.source,
      node: <span className="text-[11.5px] text-[#71717A] whitespace-nowrap"><span>{s.source}</span></span>,
    },
    {
      text: s.time,
      node: <span className="text-[11.5px] text-[#A1A1AA]"><span>{s.time}</span></span>,
    },
    {
      text: s.fresh,
      node: (
        <span style={cssToObj(s.freshStyle)}>
          <span>{s.fresh}</span>
        </span>
      ),
    },
    {
      text: s.conf,
      node: (
        <span style={cssToObj(s.confStyle)}>
          <span>{s.conf}</span>
        </span>
      ),
    },
    {
      text: s.relevance,
      node: <span className={muted}><span>{s.relevance}</span></span>,
    },
  ]
}

export function SignalsSheet({ m }: { m: WorkspaceValues }) {
  const { noteCopied, noteSkipped, rowHeight, signalRows } = m
  const rows: SheetRow[] = (signalRows ?? []).map((s: any, i: number) => ({
    id: `${s.company}-${i}`,
    cells: cells(s),
  }))
  return (
    <SheetGrid
      name="signals"
      columns={COLUMNS}
      rows={rows}
      rowHeight={rowHeight}
      onCopy={noteCopied}
      onPasteSkipped={noteSkipped}
    />
  )
}
