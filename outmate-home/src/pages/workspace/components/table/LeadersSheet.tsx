import { cssToObj } from '../../../../lib/css'
import type { WorkspaceValues } from '../../types'
import { SheetGrid, type SheetCell, type SheetColumn, type SheetRow } from './SheetGrid'

const COLUMNS: SheetColumn[] = [
  { key: 'num', label: '#', width: 44, rowHeader: true },
  { key: 'person', label: 'Person', width: 186, gap: 7 },
  { key: 'title', label: 'Job Title', width: 168 },
  { key: 'company', label: 'Company', width: 160 },
  { key: 'linkedin', label: 'LinkedIn', width: 122, gap: 5 },
  { key: 'email', label: 'Work Email', width: 206 },
  { key: 'status', label: 'Email Status', width: 104 },
  { key: 'dept', label: 'Department', width: 138 },
  { key: 'seniority', label: 'Seniority', width: 104 },
  { key: 'loc', label: 'Location', width: 138 },
  { key: 'persona', label: 'Buying Relevance', width: 118 },
  { key: 'actions', label: 'Actions', width: 104, gap: 4, borderRight: false },
]

const muted = 'text-[11.5px] text-[#52525B] overflow-hidden text-ellipsis whitespace-nowrap'

function cells(p: any): SheetCell[] {
  return [
    {
      text: p.n,
      node: (
        <span className="text-[10.5px] text-[#B4B4BB] tabular-nums">
          <span>{p.n}</span>
        </span>
      ),
    },
    {
      text: p.name,
      node: (
        <>
          <span
            style={cssToObj(
              `width:20px; height:20px; border-radius:50%; flex:none; display:flex; align-items:center; justify-content:center; font-size:8.5px; font-weight:650; color:#3F3F46; background:${p.bg}`,
            )}
          >
            <span>{p.initials}</span>
          </span>
          <span
            onClick={(e) => {
              e.stopPropagation()
              p.open()
            }}
            title="Open record"
            className="text-[11.5px] font-[600] overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer"
          >
            <span>{p.name}</span>
          </span>
        </>
      ),
    },
    {
      text: p.title,
      node: <span className={muted}><span>{p.title}</span></span>,
    },
    {
      text: p.company,
      node: (
        <>
          <span
            style={cssToObj(
              `width:17px; height:17px; border-radius:4px; flex:none; display:flex; align-items:center; justify-content:center; font-size:8px; font-weight:700; color:#FFFFFF; background:${p.logoBg}`,
            )}
          >
            <span>{p.logo}</span>
          </span>
          <span className={muted}>
            <span>{p.company}</span>
          </span>
        </>
      ),
    },
    {
      text: p.hasLi ? p.li : 'Not available',
      node: p.hasLi ? (
        <span onClick={p.openLi} className="flex items-center gap-[5px] [min-width:0] cursor-pointer">
          <svg width="13" height="13" viewBox="0 0 20 20" fill="#0A66C2" className="flex-none">
            <rect width="20" height="20" rx="3"></rect>
            <path
              d="M5 8h2v7H5zM6 4.6a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4zM9 8h2v1a2.6 2.6 0 014 2.3V15h-2v-3.3c0-.9-.5-1.4-1.2-1.4S10 10.9 10 11.8V15H9z"
              fill="#FFFFFF"
            ></path>
          </svg>
          <span
            style={cssToObj(
              'font-size:11.5px; color:#3F3F46; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-decoration:underline; text-decoration-color:#D9D9DF',
            )}
          >
            <span>{p.li}</span>
          </span>
        </span>
      ) : (
        <span className="text-[11.5px] text-[#B4B4BB]">{'Not available'}</span>
      ),
    },
    {
      text: p.email,
      node: (
        <span
          onClick={p.copyEmail}
          style={cssToObj(
            `font-size:11px; font-family:'JetBrains Mono', monospace; color:${p.emailColor}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; cursor:pointer`,
          )}
        >
          <span>{p.email}</span>
        </span>
      ),
    },
    {
      text: p.status,
      node: (
        <span style={cssToObj(p.statusStyle)}>
          <span>{p.status}</span>
        </span>
      ),
    },
    {
      text: p.dept,
      node: <span className={muted}><span>{p.dept}</span></span>,
    },
    {
      text: p.seniority,
      node: <span className={muted}><span>{p.seniority}</span></span>,
    },
    {
      text: p.loc,
      node: <span className={muted}><span>{p.loc}</span></span>,
    },
    {
      text: p.persona,
      node: (
        <span style={cssToObj(p.roleStyle)}>
          <span>{p.persona}</span>
        </span>
      ),
    },
    {
      text: 'LinkedIn · Copy email · Add to outreach',
      node: (
        <>
          <span
            onClick={p.openLi}
            title="Open LinkedIn"
            className="w-[20px] h-[20px] rounded-[5px] [border:1px_solid_#E8E8EC] flex items-center justify-center cursor-pointer bg-[#FFFFFF] hv-8suzj2"
          >
            <svg width="10" height="10" viewBox="0 0 20 20" fill="#0A66C2">
              <rect width="20" height="20" rx="3"></rect>
              <path
                d="M5 8h2v7H5zM6 4.6a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4zM9 8h2v1a2.6 2.6 0 014 2.3V15h-2v-3.3c0-.9-.5-1.4-1.2-1.4S10 10.9 10 11.8V15H9z"
                fill="#FFFFFF"
              ></path>
            </svg>
          </span>
          <span
            onClick={p.copyEmail}
            title="Copy email"
            className="w-[20px] h-[20px] rounded-[5px] [border:1px_solid_#E8E8EC] flex items-center justify-center cursor-pointer bg-[#FFFFFF] hv-16bx3qz"
          >
            <svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="#52525B" strokeWidth="1.6">
              <rect x="7" y="7" width="9.5" height="9.5" rx="2"></rect>
              <path d="M13 4.5H5.5a2 2 0 00-2 2V14"></path>
            </svg>
          </span>
          <span
            onClick={p.addOutreach}
            title="Add to outreach"
            className="w-[20px] h-[20px] rounded-[5px] [border:1px_solid_#E8E8EC] flex items-center justify-center cursor-pointer bg-[#FFFFFF] hv-16bx3qz"
          >
            <svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="#52525B" strokeWidth="1.9">
              <path d="M10 4.5v11M4.5 10h11"></path>
            </svg>
          </span>
        </>
      ),
    },
  ]
}

export function LeadersSheet({ m }: { m: WorkspaceValues }) {
  const { leaders, noteCopied, noteSkipped, rowHeight } = m
  const rows: SheetRow[] = (leaders ?? []).map((p: any) => ({
    id: `${p.company} · ${p.name}`,
    cells: cells(p),
  }))
  return (
    <SheetGrid
      name="leaders"
      columns={COLUMNS}
      rows={rows}
      rowHeight={rowHeight}
      onCopy={noteCopied}
      onPasteSkipped={noteSkipped}
    />
  )
}
