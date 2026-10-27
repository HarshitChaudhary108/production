// @ts-nocheck — logic preserved verbatim from the design export.
import { ModelBase } from '../../lib/model'
import { EDITABLE_SOURCE_COLUMNS } from './components/table/gridUtils'
const C = [
  [
    'Acme',
    'acme.io',
    'acme-inc',
    240,
    'Austin, TX',
    'Sarah Chen',
    'SC',
    '#E4E7F5',
    'VP Sales',
    'sarah@acme.io',
    'Verified',
    'HubSpot',
    ['HubSpot', 'Snowflake', 'Segment'],
    87,
    92,
    [
      ['Hiring', 'hot'],
      ['Website', 'web'],
      ['Competitor', 'soc'],
    ],
    'No unified GTM layer',
    1,
    '2h ago',
    'A',
    '#1E293B',
    'B2B SaaS',
  ],
  [
    'RevenueFlow',
    'revenueflow.com',
    'revenueflow',
    410,
    'Denver, CO',
    'David Kim',
    'DK',
    '#F0E6DC',
    'CRO',
    'david@revenueflow.com',
    'Verified',
    'Salesforce',
    ['Salesforce', 'Outreach', 'Looker'],
    84,
    89,
    [
      ['Funding', 'money'],
      ['Social', 'soc'],
    ],
    'Fragmented data',
    1,
    '5h ago',
    'R',
    '#6D28D9',
    'B2B SaaS',
  ],
  [
    'Northwind Labs',
    'northwind.dev',
    'northwind-labs',
    120,
    'Toronto, ON',
    'Priya Raman',
    'PR',
    '#E7F0EA',
    'RevOps Lead',
    'priya@northwind.dev',
    'Verified',
    'HubSpot',
    ['HubSpot', 'Segment', 'Metabase'],
    79,
    86,
    [
      ['Competitor', 'soc'],
      ['Website', 'web'],
    ],
    'Missing conversation intel',
    1,
    '1d ago',
    'N',
    '#0F766E',
    'DevTools',
  ],
  [
    'Cadence HQ',
    'cadence.so',
    'cadence-hq',
    320,
    'Berlin, DE',
    'Ana Torres',
    'AT',
    '#E8E4F3',
    'VP RevOps',
    'ana@cadence.so',
    'Verified',
    'Salesforce',
    ['Salesforce', 'Snowflake', 'Gong'],
    82,
    90,
    [
      ['Tech stack', 'tech'],
      ['Funding', 'money'],
      ['Website', 'web'],
    ],
    'Fragmented data',
    1,
    '6h ago',
    'C',
    '#1D4ED8',
    'FinOps',
  ],
  [
    'Brightpath',
    'brightpath.ai',
    'brightpath-ai',
    150,
    'Boston, MA',
    'Tom Iyer',
    'TI',
    '#EDE7DE',
    'CEO',
    'tom@brightpath.ai',
    'Catch-all',
    'HubSpot',
    ['HubSpot', 'Mixpanel'],
    64,
    77,
    [
      ['Social', 'soc'],
      ['Website', 'web'],
    ],
    'Missing conversation intel',
    0,
    '9h ago',
    'B',
    '#BE185D',
    'AI / SaaS',
  ],
  [
    'Loop Systems',
    'loopsys.io',
    'loop-systems',
    85,
    'Manchester, UK',
    'Marcus Webb',
    'MW',
    '#F3E8E4',
    'Head of Sales',
    'marcus@loopsys.io',
    'Guessed',
    'None',
    ['Pipedrive'],
    58,
    71,
    [['Hiring', 'hot']],
    'Missing sales engagement',
    0,
    '3h ago',
    'L',
    '#B45309',
    'B2B SaaS',
  ],
  [
    'Sequent Inc',
    'sequent-tech.com',
    '',
    190,
    'Somerset, NJ',
    'Ruth Alvarez',
    'RA',
    '#E4EFF5',
    'Director RevOps',
    'ruth@sequent-tech.com',
    'Verified',
    'Salesforce',
    ['Salesforce', 'Snowflake'],
    76,
    84,
    [
      ['Website', 'web'],
      ['Community', 'tech'],
    ],
    'No unified GTM layer',
    1,
    '11h ago',
    'S',
    '#0369A1',
    'B2B SaaS',
  ],
  [
    'Canidium',
    'canidium.com',
    'canidium',
    130,
    'Fort Collins, CO',
    'Owen Blake',
    'OB',
    '#F2E9E0',
    'VP Sales',
    'owen@canidium.com',
    'Verified',
    'HubSpot',
    ['HubSpot', 'Outreach'],
    73,
    81,
    [
      ['Hiring', 'hot'],
      ['Social', 'soc'],
    ],
    'Fragmented data',
    1,
    '1d ago',
    'C',
    '#15803D',
    'Consulting',
  ],
  [
    'Osano',
    'osano.com',
    'osano',
    98,
    'Austin, TX',
    'Lena Fischer',
    'LF',
    '#EDE4F5',
    'RevOps Manager',
    'lena@osano.com',
    'Verified',
    'HubSpot',
    ['HubSpot', 'Amplitude'],
    70,
    83,
    [['Website', 'web']],
    'Missing sales engagement',
    1,
    '2d ago',
    'O',
    '#7C3AED',
    'Privacy',
  ],
  [
    'Strata',
    'strataorg.com',
    'strataorg',
    55,
    'Denver, CO',
    'Nick Alder',
    'NA',
    '#E8EAE4',
    'Founder',
    '',
    '',
    'None',
    ['Airtable'],
    52,
    68,
    [['Community', 'tech']],
    'No CRM detected',
    0,
    '4d ago',
    'S',
    '#0891B2',
    'B2B SaaS',
  ],
  [
    'HeadLight',
    'headlight.com',
    'headlightiq',
    54,
    'Seattle, WA',
    '',
    '',
    '#F5E7E4',
    '',
    '',
    '',
    'Salesforce',
    ['Salesforce', 'Chorus'],
    68,
    79,
    [
      ['Funding', 'money'],
      ['Hiring', 'hot'],
    ],
    'Fragmented data',
    0,
    '18h ago',
    'H',
    '#334155',
    'ConstructionTech',
  ],
  [
    'MediaTrenz',
    'mediatrenz.com',
    'mediatrenz',
    112,
    'Middletown, DE',
    'Ivan Petrov',
    'IP',
    '#E4E8F0',
    'CRO',
    'ivan@mediatrenz.com',
    'Verified',
    'HubSpot',
    [],
    66,
    75,
    [],
    'Missing conversation intel',
    0,
    '2d ago',
    'M',
    '#DB2777',
    'MarTech',
  ],
].map((r) => ({
  name: r[0],
  domain: r[1],
  li: r[2],
  emp: r[3],
  loc: r[4],
  person: r[5],
  initials: r[6],
  avBg: r[7],
  role: r[8],
  email: r[9],
  status: r[10],
  crm: r[11],
  stack: r[12],
  intent: r[13],
  icp: r[14],
  signals: r[15],
  gap: r[16],
  qualified: !!r[17],
  last: r[18],
  logo: r[19],
  logoBg: r[20],
  industry: r[21],
}))
const INSIGHTS = {
  Acme: [
    'Acme is showing 4 independent buying signals in the last 7 days, including a VP Sales hire and repeated pricing-page visits after researching Salesforce alternatives.',
    'Research Sarah Chen and map her previous GTM stack before outreach.',
  ],
  RevenueFlow: [
    'RevenueFlow closed a $28M Series B three days ago and its CRO is publicly discussing revenue-stack consolidation.',
    'Lead with post-funding GTM scale-up and reference the Series B in the first touch.',
  ],
  'Northwind Labs': [
    'Northwind visited pricing four times this week while its RevOps lead compared alternatives in a public thread.',
    'Send the RevOps migration teardown — the evaluation window is open now.',
  ],
  'Cadence HQ': [
    'Cadence added three point tools last quarter and shows repeat intent on integration documentation.',
    'Position consolidation ROI against their three newest point tools.',
  ],
}
const EXTRA = {
  Acme: ['Series B', '$28M ARR', 'Sales +6 open roles', 'Evaluating', 'Consolidating 6 tools'],
  RevenueFlow: [
    'Series B',
    '$34M ARR',
    'Sales +11 open roles',
    'Evaluating',
    'Post-raise GTM scale-up',
  ],
  'Northwind Labs': [
    'Series A',
    '$9M ARR',
    'RevOps +2 open roles',
    'Evaluating',
    'Active migration review',
  ],
  'Cadence HQ': ['Series C', '$46M ARR', 'Sales +4 open roles', 'Evaluating', 'Point-tool sprawl'],
  Brightpath: ['Seed', '$4M ARR', 'Not detected', 'Researching', 'Early GTM build-out'],
  'Loop Systems': [
    'Bootstrapped',
    'Not detected',
    'Sales +2 open roles',
    'Awareness',
    'First sales hires',
  ],
  'Sequent Inc': ['Series A', '$12M ARR', 'Not detected', 'Researching', 'Warehouse-first stack'],
  Canidium: [
    'Bootstrapped',
    '$18M ARR',
    'Sales +3 open roles',
    'Researching',
    'Services-led growth',
  ],
  Osano: ['Series B', '$21M ARR', 'Not detected', 'Researching', 'Compliance-led expansion'],
  Strata: ['Pre-seed', 'Not detected', 'Not detected', 'Awareness', 'No CRM in place'],
  HeadLight: [
    'Series A',
    '$11M ARR',
    'Sales +5 open roles',
    'Researching',
    'Post-extension hiring',
  ],
  MediaTrenz: ['Bootstrapped', '$7M ARR', 'Not detected', 'Awareness', 'Agency-model GTM'],
}
const ALL_COLS = [
  ['num', '#', '46px', 'num'],
  ['check', '', '38px', 'check'],
  ['company', 'Company Name', '186px', 'company'],
  ['domain', 'Domain', '178px', 'link'],
  ['linkedin', 'LinkedIn URL', '166px', 'linkedin'],
  ['emp', 'Employee Count', '124px', 'text'],
  ['loc', 'Location', '146px', 'text'],
  ['contact', 'Primary Contact', '172px', 'contact'],
  ['email', 'Work Email', '208px', 'email'],
  ['crm', 'CRM', '104px', 'badge'],
  ['stack', 'Tech Stack', '196px', 'chips'],
  ['intent', 'Intent Score', '106px', 'score'],
  ['icp', 'ICP Fit', '96px', 'score'],
  ['signals', 'Buying Signals', '204px', 'chips'],
  ['gap', 'GTM Gap', '188px', 'text'],
  ['qualified', 'Qualified', '96px', 'badge'],
  ['last', 'Last Signal', '104px', 'text'],
  ['industry', 'Industry', '132px', 'text'],
  ['funding', 'Funding Stage', '120px', 'badge'],
  ['revenue', 'Est. Revenue', '112px', 'text'],
  ['hiring', 'Hiring Velocity', '160px', 'text'],
  ['stage', 'Buying Stage', '116px', 'badge'],
  ['reason', 'Qualification Reason', '186px', 'text'],
]
const DEFAULT_HIDDEN = ['industry', 'funding', 'revenue', 'hiring', 'stage', 'reason']
const P = {
  ai: 'M10 3l1.3 3.6L15 8l-3.7 1.4L10 13 8.7 9.4 5 8l3.7-1.4zM15.2 12.4l.6 1.6 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6z',
  rocket:
    'M11.6 4.4c2.4-1 4 .6 3 3-.7 1.8-2.6 3.8-5 5.2l-2.6-2.6C8.2 7.4 10 5.3 11.6 4.4zM7 12.9L5.6 15.4 4.5 14.3 7 12.9zM6.3 9.6L4 10.9l1.1 1.1z',
  monitor: 'M3.5 4.5h13v8.5h-13zM8 15.5h4M10 13v2.5',
  building: 'M5 16.5V4.5h6v12M11 8.5h4v8M7 7h2M7 10h2M7 13h2M12.5 11h1M12.5 14h1',
  briefcase: 'M3.5 7.5h13v8h-13zM7.5 7.5V5.5h5v2M3.5 11h13',
  globe:
    'M10 3.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM3.5 10h13M10 3.5c2 2 2 11 0 13M10 3.5c-2 2-2 11 0 13',
  people:
    'M7.5 9.5a2.2 2.2 0 100-4.4 2.2 2.2 0 000 4.4zM3.5 16c0-2.2 1.8-3.6 4-3.6s4 1.4 4 3.6M13.2 6.2a2 2 0 010 4M14 12.6c1.6.3 2.6 1.5 2.6 3.4',
  mail: 'M3.5 5.5h13v9h-13zM3.5 6l6.5 5 6.5-5',
  tag: 'M4.5 9.5l5-5h6v6l-5 5zM12.5 7.5h.01',
  doc: 'M6 3.5h5l3 3v10H6zM11 3.5v3h3M8 10h4M8 12.5h4',
  chart: 'M4 16V9M8 16V5M12 16v-5M16 16V7',
  crm: 'M10 3.5l6 3v7l-6 3-6-3v-7zM4 6.5l6 3 6-3M10 9.5V16',
  text: 'M5 6h10M5 10h10M5 14h6',
}
const SRC = {
  cb: ['cb', '#0B66C3'],
  bw: ['bw', '#166534'],
  zi: ['zi', '#DC2626'],
  gh: ['gh', '#7C2D5A'],
  hs: ['hs', '#EA580C'],
  li: ['in', '#0A66C2'],
}
const COL_TYPES = [
  [
    'Find Company Domain',
    "Find the company's domain from their name.",
    2,
    'ai',
    (c) => c.domain,
    P.globe,
    '',
  ],
  [
    'Company Latest Funding',
    "Find the company's latest funding round and amount.",
    3,
    'cb',
    (c) =>
      EXTRA[c.name][0] +
      ' · ' +
      (EXTRA[c.name][1] === 'Not detected' ? 'undisclosed' : EXTRA[c.name][1]),
    P.rocket,
    'cb',
  ],
  [
    'Website Techstack',
    'Find the tech stack that the company runs on.',
    6,
    'bw',
    (c) => (c.stack.length ? c.stack.join(', ') : 'Not detected'),
    P.monitor,
    'bw',
  ],
  [
    'Company Revenue',
    "Find the company's estimated revenue.",
    2,
    'zi',
    (c) => (EXTRA[c.name][1] === 'Not detected' ? 'No data found' : EXTRA[c.name][1]),
    P.building,
    'zi',
  ],
  [
    'Company Job Openings',
    "Find the company's current job openings.",
    3,
    'gh',
    (c) => (EXTRA[c.name][2] === 'Not detected' ? 'No data found' : EXTRA[c.name][2]),
    P.briefcase,
    'gh',
  ],
  [
    'Determine Company Revenue Model',
    "Identify the company's revenue model — subscription, usage or services.",
    3,
    'ai',
    (c) => (c.industry === 'B2B SaaS' ? 'Subscription — seat-based' : 'Services-led'),
    P.chart,
    '',
  ],
  [
    'LinkedIn Profile Highlights',
    'Extract three noteworthy aspects of the company LinkedIn profile.',
    4,
    'li',
    (c) => (c.li ? 'Active — 3 posts in 14d, GTM hiring, product launch' : 'Not available'),
    P.people,
    'li',
  ],
  [
    'Find Company Social Profiles',
    "Find the company's LinkedIn, X and YouTube profiles.",
    2,
    'ai',
    (c) => (c.li ? 'LinkedIn, X' : 'Not available'),
    P.globe,
    '',
  ],
  [
    'Company GTM Strategy Analysis',
    "Analyze the company's GTM strategy and where it breaks.",
    5,
    'ai',
    (c) => c.gap,
    P.chart,
    '',
  ],
  [
    'Company Core Values',
    "Find the company's core values from their website.",
    3,
    'ai',
    (c) => 'Customer-first, transparency, speed',
    P.doc,
    '',
  ],
  [
    'Check if Company Offers a Free Trial',
    'Check if the company offers a free trial or freemium tier.',
    2,
    'ai',
    (c) => (c.emp > 150 ? 'Free trial — 14 days' : 'No trial found'),
    P.tag,
    '',
  ],
  [
    'Company Snapshot',
    'Analyze the company and return a one-line snapshot.',
    3,
    'ai',
    (c) => c.industry + ' company, ' + c.emp + ' employees, ' + c.loc,
    P.doc,
    '',
  ],
  [
    'Find Company News',
    'Find a recent news article about the company.',
    3,
    'ai',
    (c) => c.name + ' featured in a GTM tooling round-up',
    P.doc,
    '',
  ],
  [
    'Find Recent Leadership Changes',
    'Find leadership hires and departures in the last 90 days.',
    4,
    'ai',
    (c) =>
      c.signals.some((x) => x[0] === 'Hiring')
        ? 'New ' + (c.role || 'VP Sales') + ' — last 30d'
        : 'No changes found',
    P.people,
    '',
  ],
  [
    'Find Competitors',
    'Find three competitors for the company.',
    2,
    'ai',
    (c) => 'Clay, Apollo, ZoomInfo',
    P.building,
    '',
  ],
  [
    'Find Pricing',
    "Find the company's published pricing.",
    3,
    'ai',
    (c) => (c.emp > 100 ? 'Public — from $49/seat' : 'Pricing not published'),
    P.tag,
    '',
  ],
  [
    'Find Product Categories',
    'Classify the product into GTM categories.',
    2,
    'ai',
    (c) => c.industry + ' · ' + (c.crm === 'None' ? 'unclassified' : c.crm + ' ecosystem'),
    P.tag,
    '',
  ],
  [
    'Find Decision Makers',
    'Find the buying committee at each company.',
    20,
    'ai',
    (c) => (c.person ? c.person + ' + 3 more' : 'No leaders found'),
    P.people,
    '',
  ],
  [
    'Work Email',
    "Find the person's work email address.",
    3,
    'ai',
    (c) => c.email || 'Not found',
    P.mail,
    '',
  ],
  [
    'Website Intent',
    'Detect de-anonymised visits to your website.',
    5,
    'ai',
    (c) =>
      c.signals.some((x) => x[0] === 'Website')
        ? 'Pricing page · repeat visits'
        : 'No signal detected',
    P.globe,
    '',
  ],
  [
    'Classify as B2B or B2C',
    'Determine if the company sells B2B, B2C or both.',
    2,
    'ai',
    (c) => 'B2B',
    P.tag,
    '',
  ],
  [
    'Add Lead to HubSpot',
    'Push the company into your CRM as a new record.',
    0,
    'hs',
    (c) => (c.crm === 'HubSpot' ? 'Synced' : 'Skipped — no HubSpot'),
    P.crm,
    'hs',
  ],
  ['Value', 'Plain text column you can fill in yourself.', 0, 'plain', (c) => '', P.text, ''],
]
export /** Generated from the Claude Design export; logic preserved verbatim.*/
class WorkspaceModel extends ModelBase {
  state = {
    view: 'table',
    pane: 'chat',
    sheet: 'Target Companies',
    order: ALL_COLS.map((c) => c[0]),
    hidden: DEFAULT_HIDDEN.slice(),
    customSheets: [],
    sheetMenuFor: null,
    renamingSheet: null,
    renameDraft: '',
    savedViews: [],
    activeView: 'All companies',
    addColOpen: false,
    colPrompt: '',
    colSearch: '',
    colToolsOpen: false,
    customCols: [],
    cellVals: {},
    cellState: {},
    cellEdits: {},
    colWidths: {},
    job: null,
    colMenuFor: null,
    rowMenuFor: null,
    filters: [],
    sort: 'Intent score',
    sortDir: 'desc',
    selectedRows: [],
    selected: 'Acme',
    tab: 'Overview',
    agent: 'Outmate Agent',
    agentOpen: false,
    toolsOpen: false,
    enrichMenuOpen: false,
    importOpen: false,
    exportOpen: false,
    filterOpen: false,
    sortOpen: false,
    columnsOpen: false,
    runPanelOpen: false,
    settingsOpen: false,
    notifsOpen: false,
    creditsOpen: false,
    menuFor: null,
    contextOpen: true,
    like: 0,
    copied: false,
    regen: false,
    voice: false,
    attachment: false,
    credits: 3400,
    draft: '',
    convSearch: '',
    conv: 'B2B SaaS GTM Platform Gap Analysis',
    runState: 'Running',
    toast: '',
    tableSearch: '',
    runCellsOpen: false,
    runCellsDone: 0,
    runCellsRunning: false,
    runCellsTotal: 0,
    shareOpen: false,
    picks: {
      Geography: ['North America'],
      Employees: ['100–250', '250–500'],
      CRM: ['HubSpot', 'Salesforce'],
      Signals: ['Hiring', 'Website intent', 'Funding'],
      Personas: ['VP Sales', 'RevOps'],
      Freshness: ['7 days'],
    },
    settingsVals: {},
  }
  valueFor = (col, c) => {
    const t = COL_TYPES.find((x) => x[0] === col.type)
    if (t) return t[4](c) || 'No data'
    return c.industry
  }
  quickCol = (typeName, c) => {
    const t = COL_TYPES.find((x) => x[0] === typeName)
    this.setState((st) => {
      const found = st.customCols.find((x) => x.type === typeName)
      const col = found || {
        id: 'q' + Date.now().toString(36).slice(-4),
        name: typeName,
        type: typeName,
        cost: t[2],
        badge: 'AI',
      }
      this.setTimeout(() => this.runCell(col, c), 20)
      return {
        rowMenuFor: null,
        customCols: found ? st.customCols : st.customCols.concat(col),
      }
    })
    this.flash(typeName + ' running on ' + c.name)
  }
  runCell = (col, c) => {
    const k = col.id + '|' + c.name
    if (this.state.credits < (col.cost || 0)) {
      this.setState({
        creditsOpen: true,
      })
      return
    }
    this.setState((st) => ({
      cellState: Object.assign({}, st.cellState, {
        [k]: 'running',
      }),
    }))
    this._cts = this._cts || []
    this._cts.push(
      this.setTimeout(
        () =>
          this.setState((st) => {
            const cs = Object.assign({}, st.cellState)
            delete cs[k]
            return {
              cellState: cs,
              cellVals: Object.assign({}, st.cellVals, {
                [k]: this.valueFor(col, c),
              }),
              credits: Math.max(0, st.credits - (col.cost || 0)),
            }
          }),
        720,
      ),
    )
  }
  enrichCols = () => {
    const cc = this.state.customCols
    if (cc.length) return cc
    const t = COL_TYPES.find((x) => /work email/i.test(x[0])) || COL_TYPES[0]
    return [
      {
        id: 'auto_' + Date.now().toString(36).slice(-3),
        name: t[0],
        type: t[0],
        cost: t[2],
        badge: 'AI',
        auto: true,
      },
    ]
  }
  startJob = (rows, cols) => {
    if (!rows.length) {
      this.flash('Select at least one row first')
      return
    }
    const perRow = cols.reduce((a, c) => a + (c.cost || 0), 0)
    const cost = perRow * rows.length
    if (this.state.credits < cost) {
      this.setState(
        this.closeAll({
          creditsOpen: true,
        }),
      )
      return
    }
    const tasks = []
    rows.forEach((r) =>
      cols.forEach((c) =>
        tasks.push({
          k: c.id + '|' + r.name,
          col: c,
          row: r,
        }),
      ),
    )
    this._tasks = this._tasks || {}
    tasks.forEach((t) => {
      this._tasks[t.k] = t
    })
    const token = (this._jt || 0) + 1
    this._jt = token
    ;(this._jts || []).forEach((t) => this.clearTimeout(t))
    this._jts = []
    const queued = {}
    tasks.forEach((t) => {
      queued[t.k] = 'pending'
    })
    const autos = cols.filter((c) => c.auto)
    this.setState((st) => ({
      colMenuFor: null,
      customCols: autos.length ? st.customCols.concat(autos) : st.customCols,
      cellState: Object.assign({}, st.cellState, queued),
      job: {
        total: tasks.length,
        rows: rows.length,
        done: 0,
        failed: [],
        spent: 0,
        running: true,
        perRow,
      },
    }))
    tasks.forEach((t, i) => {
      const start = 140 + i * 150 + Math.random() * 110
      this._jts.push(
        this.setTimeout(() => {
          if (this._jt !== token) return
          this.setState((st) =>
            st.cellState[t.k] === 'pending'
              ? {
                  cellState: Object.assign({}, st.cellState, {
                    [t.k]: 'running',
                  }),
                }
              : null,
          )
        }, start),
      )
      this._jts.push(
        this.setTimeout(
          () => {
            if (this._jt !== token) return
            const fail = i % 9 === 4
            this.setState((st) => {
              if (st.cellState[t.k] !== 'running') return null
              const cs = Object.assign({}, st.cellState),
                cv = Object.assign({}, st.cellVals)
              if (fail) cs[t.k] = 'failed'
              else {
                delete cs[t.k]
                cv[t.k] = this.valueFor(t.col, t.row)
              }
              const j = st.job ? Object.assign({}, st.job) : null
              if (j) {
                j.done += 1
                if (fail) j.failed = j.failed.concat(t.k)
                else j.spent += t.col.cost || 0
                if (j.done >= j.total) j.running = false
              }
              return {
                cellState: cs,
                cellVals: cv,
                job: j,
                credits: fail ? st.credits : Math.max(0, st.credits - (t.col.cost || 0)),
              }
            })
          },
          start + 780 + Math.random() * 620,
        ),
      )
    })
  }
  cancelJob = () => {
    this._jt = (this._jt || 0) + 1
    ;(this._jts || []).forEach((t) => this.clearTimeout(t))
    this._jts = []
    let refunded = 0
    this.setState((st) => {
      const cs = Object.assign({}, st.cellState)
      Object.keys(cs).forEach((k) => {
        if (cs[k] === 'pending') {
          cs[k] = 'cancelled'
          refunded += 1
        } else if (cs[k] === 'running') {
          cs[k] = 'cancelled'
        }
      })
      const j = st.job
        ? Object.assign({}, st.job, {
            running: false,
            cancelled: refunded,
          })
        : null
      return {
        cellState: cs,
        job: j,
      }
    })
    this.flash('Run cancelled — unstarted cells were not charged')
  }
  colCells = (cc, rows, mode) => {
    const s = this.state
    return rows.filter((r) => {
      const k = cc.id + '|' + r.name,
        stt = s.cellState[k]
      if (mode === 'empty') return s.cellVals[k] === undefined && !stt
      if (mode === 'failed') return stt === 'failed'
      return true
    })
  }
  flash = (t) => {
    this.setState({
      toast: t,
    })
    this.clearTimeout(this._t)
    this._t = this.setTimeout(
      () =>
        this.setState({
          toast: '',
        }),
      1700,
    )
  }
  setColWidth = (key, width) => {
    this.setState((st) => ({
      colWidths: Object.assign({}, st.colWidths, {
        [key]: Math.min(600, Math.max(64, Math.round(width))) + 'px',
      }),
    }))
  }
  setCellEdits = (entries) => {
    if (!entries.length) return
    this.setState((st) => {
      const next = Object.assign({}, st.cellEdits)
      entries.forEach(({ row, col, value }) => {
        const k = col + '|' + row
        if (value == null || value === '') delete next[k]
        else next[k] = value
      })
      return {
        cellEdits: next,
      }
    })
    this.flash(entries.length + (entries.length === 1 ? ' cell updated' : ' cells updated'))
  }
  noteCopied = (count) => {
    this.flash('Copied ' + count + (count === 1 ? ' cell' : ' cells'))
  }
  noteSkipped = (count) => {
    this.flash(count + ' read-only cell' + (count === 1 ? '' : 's') + ' skipped')
  }
  stop = (e) => {
    if (e && e.stopPropagation) e.stopPropagation()
  }
  pill(bg, fg) {
    return (
      'display:inline-flex; align-items:center; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:600; white-space:nowrap; background:' +
      bg +
      '; color:' +
      fg
    )
  }
  chipStyle(on) {
    return (
      'padding:3px 8px; border-radius:5px; font-size:10.5px; cursor:pointer; white-space:nowrap; user-select:none; ' +
      (on
        ? 'background:#F1EDFC; border:1px solid #C9B6F5; color:#5B21B6; font-weight:600'
        : 'background:#FFFFFF; border:1px solid #E5E5EA; color:#71717A; font-weight:500')
    )
  }
  closeAll(x) {
    return Object.assign(
      {
        agentOpen: false,
        toolsOpen: false,
        enrichMenuOpen: false,
        importOpen: false,
        exportOpen: false,
        filterOpen: false,
        sortOpen: false,
        columnsOpen: false,
        runPanelOpen: false,
        settingsOpen: false,
        notifsOpen: false,
        menuFor: null,
        sheetMenuFor: null,
        rowMenuFor: null,
        colMenuFor: null,
      },
      x || {},
    )
  }
  renderVals() {
    const s = this.state,
      credits = s.credits
    const sel = C.find((c) => c.name === s.selected)
    const baseCols = s.order
      .map((k) => ALL_COLS.find((c) => c[0] === k))
      .filter((c) => s.hidden.indexOf(c[0]) === -1)
    const cols = baseCols
      .concat(s.customCols.map((cc) => ['cc:' + cc.id, cc.name, '190px', 'custom']))
      .concat([['actions', '', '46px', 'actions']])
    const widthFor = (c) => s.colWidths[c[0]] || c[2]
    const PRED = {
      'High intent': (c) => c.intent >= 80,
      'Recently funded': (c) => c.signals.some((x) => x[0] === 'Funding'),
      Hiring: (c) => c.signals.some((x) => x[0] === 'Hiring'),
      Social: (c) => c.signals.some((x) => x[0] === 'Social'),
      Website: (c) => c.signals.some((x) => x[0] === 'Website'),
      Competitor: (c) => c.signals.some((x) => x[0] === 'Competitor'),
      Qualified: (c) => c.qualified,
    }
    const active = s.filters
    const q = s.tableSearch.trim().toLowerCase()
    const rowsData = C.filter((c) => active.every((f) => PRED[f](c)))
      .filter((c) => (s.removed || []).indexOf(c.name) === -1)
      .filter(
        (c) =>
          !q ||
          (c.name + ' ' + c.domain + ' ' + c.loc + ' ' + c.person + ' ' + c.crm + ' ' + c.gap)
            .toLowerCase()
            .indexOf(q) > -1,
      )
    const SORTS = {
      'Intent score': (a, b) => a.intent - b.intent,
      'ICP fit': (a, b) => a.icp - b.icp,
      'Employee count': (a, b) => a.emp - b.emp,
      'Company name': (a, b) => a.name.localeCompare(b.name),
      'Signal freshness': (a, b) => a.last.localeCompare(b.last),
    }
    rowsData.sort((a, b) => (s.sortDir === 'asc' ? 1 : -1) * SORTS[s.sort](a, b))
    const sigStyle = (k) =>
      this.pill(
        k === 'hot'
          ? '#FEF2F2'
          : k === 'web'
            ? '#EFF6FF'
            : k === 'money'
              ? '#ECFDF3'
              : k === 'tech'
                ? '#F5F3FF'
                : '#F5F3FF',
        k === 'hot' ? '#B91C1C' : k === 'web' ? '#1D4ED8' : k === 'money' ? '#15803D' : '#6D28D9',
      )
    const statusStyle = (st) =>
      this.pill(
        st === 'Verified' ? '#ECFDF3' : st === 'Guessed' ? '#FFF8F1' : '#F4F4F6',
        st === 'Verified' ? '#15803D' : st === 'Guessed' ? '#C2410C' : '#71717A',
      )
    const crmStyle = (v) =>
      this.pill(
        v === 'None' ? '#F4F4F6' : v === 'HubSpot' ? '#FFF4ED' : '#EFF6FF',
        v === 'None' ? '#A1A1AA' : v === 'HubSpot' ? '#C2410C' : '#1D4ED8',
      )
    const pick = (name) =>
      this.setState(
        this.closeAll({
          selected: name,
          contextOpen: true,
        }),
      )
    const cell = (kind, c, i) => {
      const b = {
        isNum: false,
        isCheck: false,
        isCompany: false,
        isLink: false,
        isLinkedIn: false,
        isContact: false,
        isEmail: false,
        isChips: false,
        isScore: false,
        isBadge: false,
        isText: false,
        isCustom: false,
        isActions: false,
      }
      if (kind === 'num')
        return Object.assign(b, {
          isNum: true,
          value: String(i + 1),
        })
      if (kind === 'check') {
        const on = s.selectedRows.indexOf(c.name) > -1
        return Object.assign(b, {
          isCheck: true,
          check: on ? '✓' : '',
          boxBg: on ? '#6D28D9' : '#FFFFFF',
          boxBorder: on ? '#6D28D9' : '#D4D4D8',
          toggle: (e) => {
            this.stop(e)
            this.setState((st) => ({
              selectedRows: on
                ? st.selectedRows.filter((x) => x !== c.name)
                : st.selectedRows.concat(c.name),
            }))
          },
        })
      }
      if (kind === 'empty')
        return Object.assign(b, {
          isText: true,
          value: c,
          color: '#B4B4BB',
          act: () => {},
        })
      if (kind === 'company')
        return Object.assign(b, {
          isCompany: true,
          value: c.name,
          logo: c.logo,
          logoBg: c.logoBg,
        })
      if (kind === 'link') {
        const edit = editOf('domain', c)
        const domain = edit !== undefined ? edit : c.domain
        return Object.assign(b, {
          isLink: true,
          value: domain,
          logo: c.logo,
          logoBg: c.logoBg,
          act: (e) => {
            this.stop(e)
            this.flash('Opening ' + domain)
          },
        })
      }
      if (kind === 'linkedin')
        return Object.assign(b, {
          isLinkedIn: true,
          value: '/' + c.li,
          act: (e) => {
            this.stop(e)
            this.flash('Opening LinkedIn · ' + c.name)
          },
        })
      if (kind === 'contact')
        return Object.assign(b, {
          isContact: true,
          value: c.person,
          role: c.role,
          initials: c.initials,
          avBg: c.avBg,
          act: (e) => {
            this.stop(e)
            this.setState(
              this.closeAll({
                selected: c.name,
                contextOpen: true,
                tab: 'People',
              }),
            )
          },
        })
      if (kind === 'email')
        return Object.assign(b, {
          isEmail: true,
          value: c.email,
          status: c.status,
          statusStyle: statusStyle(c.status),
          act: (e) => {
            this.stop(e)
            this.flash(c.email + ' copied')
          },
        })
      if (kind === 'chips') {
        const isStack = c.stack && arguments.length
        return b
      }
      return b
    }
    const editOf = (key, c) => s.cellEdits[key + '|' + c.name]
    const cellsFor = (c, i) =>
      cols.map((col) => {
        const kind = col[3],
          key = col[0]
        if (kind === 'actions') {
          const open = s.rowMenuFor === c.name
          return Object.assign(cell('x', c, i), {
            isActions: true,
            menuOpen: open,
            toggleMenu: (e) => {
              this.stop(e)
              this.setState({
                rowMenuFor: open ? null : c.name,
              })
            },
            items: [
              [
                'Open company',
                () =>
                  this.setState(
                    this.closeAll({
                      selected: c.name,
                      contextOpen: true,
                      tab: 'Overview',
                    }),
                  ),
              ],
              ['Find company news · ~3', () => this.quickCol('Find Company News', c)],
              ['Find recent funding · ~3', () => this.quickCol('Company Latest Funding', c)],
              ['Find job openings · ~3', () => this.quickCol('Company Job Openings', c)],
              ['Find competitors · ~2', () => this.quickCol('Find Competitors', c)],
              [
                'Analyze GTM strategy · ~5',
                () => this.quickCol('Company GTM Strategy Analysis', c),
              ],
              ['Find social profiles · ~2', () => this.quickCol('Find Company Social Profiles', c)],
              ['Find decision-makers · ~20', () => this.quickCol('Find Decision Makers', c)],
              [
                'Enrich row · ~10',
                () => {
                  this.setState(
                    this.closeAll({
                      selectedRows: [c.name],
                      runCellsOpen: true,
                      runCellsDone: 0,
                      runCellsRunning: false,
                      runCellsTotal: 2,
                    }),
                  )
                },
              ],
              [
                'Add to target list',
                () => {
                  this.setState({
                    rowMenuFor: null,
                  })
                  this.flash(c.name + ' added to target list')
                },
              ],
              [
                'Export row as CSV',
                () => {
                  this.setState({
                    rowMenuFor: null,
                  })
                  this.flash(c.name + ' exported as CSV')
                },
              ],
              [
                'Remove from view',
                () => {
                  this.setState((st) => ({
                    rowMenuFor: null,
                    removed: (st.removed || []).concat(c.name),
                  }))
                  this.flash(c.name + ' removed from view')
                },
              ],
            ].map((x) => ({
              label: x[0],
              danger: x[0] === 'Remove from view',
              pick: (e) => {
                this.stop(e)
                x[1]()
              },
            })),
          })
        }
        if (kind === 'custom') {
          const cc = s.customCols.find((x) => 'cc:' + x.id === key),
            k = cc.id + '|' + c.name
          const plain = !!(cc.cost === 0 && cc.badge === 'TXT')
          const v = plain ? editOf(key, c) : s.cellVals[k],
            stt = plain ? undefined : s.cellState[k]
          const running = stt === 'running',
            pending = stt === 'pending',
            failed = stt === 'failed',
            cancelled = stt === 'cancelled',
            skipped = stt === 'skipped',
            busy = !!stt
          return Object.assign(cell('x', c, i), {
            isCustom: true,
            isPlain: plain,
            running,
            pending,
            failed,
            cancelled,
            skipped,
            retry: (e) => {
              this.stop(e)
              this.runCell(cc, c)
            },
            hasVal: !busy && v !== undefined,
            needsRun: !plain && !busy && v === undefined,
            value: v,
            badge: cc.badge,
            cost: cc.cost ? cc.cost + ' cr' : 'Free',
            color:
              /^(No data|No data found|Not detected|Not found|No leaders found|Not available|No signal detected|No changes found|No trial found|Pricing not published|Skipped)/.test(
                v || 'x',
              )
                ? '#B4B4BB'
                : '#3F3F46',
            run: (e) => {
              this.stop(e)
              this.runCell(cc, c)
            },
          })
        }
        if (key === 'linkedin' && !c.li) return cell('empty', 'Not available', i)
        if (key === 'email' && !c.email) return cell('empty', 'Not found', i)
        if (key === 'contact' && !c.person) return cell('empty', 'Not yet enriched', i)
        if (key === 'stack' && !c.stack.length) return cell('empty', 'Not detected', i)
        if (key === 'signals' && !c.signals.length) return cell('empty', 'No signal detected', i)
        if (kind === 'chips' && key === 'stack')
          return Object.assign(cell('x', c, i), {
            isChips: true,
            list: c.stack.map((t) => ({
              label: t,
              style: this.pill('#F4F4F6', '#52525B'),
              act: (e) => {
                this.stop(e)
                this.flash(t + ' detected via BuiltWith')
              },
            })),
          })
        if (kind === 'chips' && key === 'signals')
          return Object.assign(cell('x', c, i), {
            isChips: true,
            list: c.signals.map((x) => ({
              label: x[0],
              style: sigStyle(x[1]),
              act: (e) => {
                this.stop(e)
                this.setState(
                  this.closeAll({
                    selected: c.name,
                    contextOpen: true,
                    tab: 'Signals',
                  }),
                )
              },
            })),
          })
        if (kind === 'score') {
          const v = key === 'intent' ? c.intent : c.icp
          return Object.assign(cell('x', c, i), {
            isScore: true,
            value: key === 'intent' ? v + ' / 100' : v + '%',
            pct: v + '%',
            color: v >= 80 ? '#15803D' : v >= 70 ? '#C2410C' : '#71717A',
          })
        }
        if (kind === 'badge' && key === 'crm')
          return Object.assign(cell('x', c, i), {
            isBadge: true,
            value: c.crm,
            badgeStyle: crmStyle(c.crm),
          })
        if (kind === 'badge' && key === 'qualified')
          return Object.assign(cell('x', c, i), {
            isBadge: true,
            value: c.qualified ? 'true' : 'false',
            badgeStyle: this.pill(
              c.qualified ? '#ECFDF3' : '#F4F4F6',
              c.qualified ? '#15803D' : '#A1A1AA',
            ),
          })
        if (kind === 'badge' && key === 'funding') {
          const v = EXTRA[c.name][0]
          return Object.assign(cell('x', c, i), {
            isBadge: true,
            value: v,
            badgeStyle: this.pill(
              v === 'Bootstrapped' || v === 'Pre-seed' ? '#F4F4F6' : '#F5F3FF',
              v === 'Bootstrapped' || v === 'Pre-seed' ? '#71717A' : '#6D28D9',
            ),
          })
        }
        if (kind === 'badge' && key === 'stage') {
          const v = EXTRA[c.name][3]
          return Object.assign(cell('x', c, i), {
            isBadge: true,
            value: v,
            badgeStyle: this.pill(
              v === 'Evaluating' ? '#ECFDF3' : v === 'Researching' ? '#FFF8F1' : '#F4F4F6',
              v === 'Evaluating' ? '#15803D' : v === 'Researching' ? '#C2410C' : '#71717A',
            ),
          })
        }
        if (
          kind === 'text' &&
          (key === 'industry' || key === 'revenue' || key === 'hiring' || key === 'reason')
        ) {
          const v =
            key === 'industry'
              ? c.industry
              : key === 'revenue'
                ? EXTRA[c.name][1]
                : key === 'hiring'
                  ? EXTRA[c.name][2]
                  : EXTRA[c.name][4]
          return Object.assign(cell('x', c, i), {
            isText: true,
            value: v,
            color: v === 'Not detected' ? '#B4B4BB' : '#52525B',
            act: () => {},
          })
        }
        if (kind === 'text') {
          const edit = editOf(key, c)
          const base =
            key === 'emp'
              ? String(c.emp)
              : key === 'loc'
                ? c.loc
                : key === 'gap'
                  ? c.gap
                  : c.last
          const raw = edit !== undefined ? edit : base
          const v = key === 'emp' ? raw + ' employees' : raw
          return Object.assign(cell('x', c, i), {
            isText: true,
            value: v,
            color: key === 'last' ? '#A1A1AA' : '#52525B',
            act:
              key === 'gap'
                ? (e) => {
                    this.stop(e)
                    this.flash(
                      c.name + ': ' + raw + ' — no unified layer across CRM, engagement and data',
                    )
                  }
                : () => {},
          })
        }
        return cell(kind, c, i)
      })
    const tabStyle = (n) =>
      'padding:7px 8px; font-size:11px; cursor:pointer; white-space:nowrap; ' +
      (s.tab === n
        ? 'font-weight:650; color:#18181B; border-bottom:2px solid #6D28D9'
        : 'font-weight:500; color:#8E8E96; border-bottom:2px solid transparent')
    const sheetStyle = (n) =>
      'display:flex; align-items:center; gap:6px; padding:8px 11px; font-size:11.5px; cursor:pointer; ' +
      (s.sheet === n
        ? 'font-weight:650; color:#18181B; background:#FFFFFF; border:1px solid #E5E5EA; border-bottom:1px solid #FFFFFF; border-radius:6px 6px 0 0; margin-bottom:-1px'
        : 'font-weight:500; color:#8E8E96; border:1px solid transparent')
    const modeTab = (on) =>
      'padding:4px 10px; border-radius:5px; font-size:12px; cursor:pointer; ' +
      (on
        ? 'background:#FFFFFF; box-shadow:0 1px 2px rgba(24,24,27,.08); font-weight:600; color:#18181B'
        : 'font-weight:500; color:#71717A')
    const running = s.runState === 'Running'
    const done = s.runState === 'Completed'
    const barCols = this.enrichCols()
    const barUnit = barCols.reduce((a, c) => a + (c.cost || 0), 0)
    const barCost = barUnit * s.selectedRows.length
    return {
      projectName: s.conv,
      sheet: s.sheet,
      isTable: s.view === 'table',
      isRadar: s.view === 'radar',
      goCopilot: () =>
        this.setState(
          this.closeAll({
            view: 'table',
          }),
        ),
      goRadar: () =>
        this.setState(
          this.closeAll({
            view: 'radar',
          }),
        ),
      copilotTabStyle: modeTab(s.view === 'table'),
      radarTabStyle: modeTab(s.view === 'radar'),
      headerStats: [
        {
          value: '42',
          label: 'qualifying',
        },
        {
          value: '1,284',
          label: 'tracked',
        },
        {
          value: '642',
          label: 'signals',
        },
        {
          value: '2,370',
          label: 'cells enriched',
        },
        {
          value: '7d',
          label: 'window',
        },
        {
          value: '$2.4M',
          label: 'est. pipeline',
        },
      ],
      paneChat: s.pane === 'chat',
      paneHistory: s.pane === 'history',
      chatPaneStyle:
        'padding:5px 9px; border-radius:6px; font-size:11.5px; cursor:pointer; ' +
        (s.pane === 'chat'
          ? 'background:#F1F1F4; font-weight:650; color:#18181B'
          : 'font-weight:500; color:#8E8E96'),
      historyPaneStyle:
        'padding:5px 9px; border-radius:6px; font-size:11.5px; cursor:pointer; ' +
        (s.pane === 'history'
          ? 'background:#F1F1F4; font-weight:650; color:#18181B'
          : 'font-weight:500; color:#8E8E96'),
      showChatPane: () =>
        this.setState({
          pane: 'chat',
        }),
      showHistoryPane: () =>
        this.setState({
          pane: 'history',
        }),
      newChat: () => {
        this.setState(
          this.closeAll({
            conv: 'New research',
            pane: 'chat',
            draft: '',
          }),
        )
        this.flash('New conversation started')
      },
      convSearch: s.convSearch,
      onSearchConv: (e) =>
        this.setState({
          convSearch: e.target.value,
        }),
      historyGroups: [
        [
          'Today',
          [
            ['B2B SaaS GTM Platform Gap Analysis', '42 accounts · running', true],
            ['Find high-intent SaaS accounts', '18 accounts', false],
            ['Companies hiring VP Sales', '27 accounts', false],
          ],
        ],
        [
          'Yesterday',
          [
            ['Salesforce replacement signals', '9 accounts', false],
            ['Q3 target account research', '64 accounts', false],
          ],
        ],
        [
          'This week',
          [
            ['RevOps leadership search', '112 people', false],
            ['Series B SaaS expansion list', '38 accounts', false],
          ],
        ],
      ].map((g) => ({
        label: g[0],
        items: g[1]
          .filter((h) => !s.convSearch || h[0].toLowerCase().includes(s.convSearch.toLowerCase()))
          .map((h) => ({
            title: h[0],
            meta: h[1],
            running: h[2],
            bar: s.conv === h[0] ? '#6D28D9' : 'transparent',
            bg: s.conv === h[0] ? '#F5F1FD' : 'transparent',
            weight: s.conv === h[0] ? '650' : '500',
            color: s.conv === h[0] ? '#18181B' : '#52525B',
            menuOpen: s.menuFor === h[0],
            open: () => {
              this.setState(
                this.closeAll({
                  conv: h[0],
                  pane: 'chat',
                }),
              )
              this.flash('Loaded “' + h[0] + '”')
            },
            menu: (e) => {
              this.stop(e)
              this.setState({
                menuFor: s.menuFor === h[0] ? null : h[0],
              })
            },
            act: (e) => {
              this.stop(e)
              this.setState({
                menuFor: null,
              })
              this.flash('Updated “' + h[0] + '”')
            },
          })),
      })),
      questions: [
        ['01', 'Which geography?', 'Geography', ['North America', 'Europe', 'India', 'Global']],
        ['02', 'Employee range', 'Employees', ['50–100', '100–250', '250–500']],
        ['03', 'CRM signals', 'CRM', ['HubSpot', 'Salesforce', 'Any CRM']],
        [
          '04',
          'Buying signals',
          'Signals',
          [
            'Hiring',
            'Funding',
            'Website intent',
            'Social',
            'Tech stack',
            'Competitor',
            'Community',
          ],
        ],
        [
          '05',
          'Who to reach',
          'Personas',
          ['Founder', 'CEO', 'CRO', 'VP Sales', 'RevOps', 'Marketing'],
        ],
        ['06', 'Signal freshness', 'Freshness', ['24 hours', '7 days', '30 days', '90 days']],
      ].map((q) => ({
        n: q[0],
        label: q[1],
        chips: q[3].map((v) => {
          const on = (s.picks[q[2]] || []).indexOf(v) > -1
          return {
            v,
            style: this.chipStyle(on),
            toggle: () =>
              this.setState((st) => {
                const cur = st.picks[q[2]] || []
                return {
                  picks: Object.assign({}, st.picks, {
                    [q[2]]: on ? cur.filter((x) => x !== v) : cur.concat(v),
                  }),
                }
              }),
          }
        }),
      })),
      buildList: () => this.flash('Target list rebuilt — 42 accounts'),
      reasons: [
        'Two or more independent intent signals in the last 7 days',
        'Recent GTM hiring — VP Sales, RevOps or Sales Ops',
        'CRM detected with no unified GTM data layer',
        'Firmographic ICP fit above 85%',
      ],
      answerStats: [
        {
          value: '42',
          label: 'qualifying',
        },
        {
          value: '18',
          label: 'website intent',
        },
        {
          value: '$2.4M',
          label: 'pipeline',
        },
      ],
      agent: s.agent,
      agentShort: s.agent.replace(' Agent', ''),
      agentOpen: s.agentOpen,
      toolsOpen: s.toolsOpen,
      enrichMenuOpen: s.enrichMenuOpen,
      toggleAgent: () =>
        this.setState(
          this.closeAll({
            agentOpen: !s.agentOpen,
          }),
        ),
      toggleTools: () =>
        this.setState(
          this.closeAll({
            toolsOpen: !s.toolsOpen,
          }),
        ),
      toggleEnrichMenu: () =>
        this.setState(
          this.closeAll({
            enrichMenuOpen: !s.enrichMenuOpen,
          }),
        ),
      agents: [
        ['Outmate Agent', 'OA', 'General GTM copilot', '#EDE9FE', '#5B21B6'],
        ['Research Agent', 'RA', 'Deep company research', '#E0F2FE', '#0369A1'],
        ['Enrichment Agent', 'EA', 'Emails, firmographics, stack', '#DCFCE7', '#15803D'],
        ['GTM Analyst', 'GA', 'Pipeline and ICP scoring', '#FEF3C7', '#B45309'],
        ['Prospecting Agent', 'PA', 'People and outreach lists', '#FCE7F3', '#BE185D'],
      ].map((a) => ({
        name: a[0],
        abbr: a[1],
        desc: a[2],
        chipBg: a[3],
        chipFg: a[4],
        bg: s.agent === a[0] ? '#FAF9FE' : 'transparent',
        pick: () => {
          this.setState({
            agent: a[0],
            agentOpen: false,
          })
          this.flash(a[0] + ' selected')
        },
      })),
      tools: [
        ['Search companies', '2/row'],
        ['Find people', '4/row'],
        ['Find work emails', '3/cell'],
        ['Analyze GTM signals', '4/co'],
        ['Research social', '4/co'],
        ['Analyze tech stack', '3/row'],
        ['Find funding', '2/row'],
        ['Find hiring signals', '2/row'],
        ['Find competitors', '4/row'],
      ].map((t) => ({
        name: t[0],
        cost: t[1],
        pick: () =>
          this.setState({
            toolsOpen: false,
            draft: t[0] + ' — ',
          }),
      })),
      enrichments: [
        ['Company enrichment', '2 / cell'],
        ['Find work emails', '3 / cell'],
        ['Social signals', '4 / company'],
        ['Decision-maker mapping', '24 / account'],
      ].map((e) => ({
        label: e[0],
        cost: e[1],
        pick: () =>
          this.setState(
            this.closeAll({
              addColOpen: true,
              colSearch: '',
            }),
          ),
      })),
      browseEnrichments: () =>
        this.setState(
          this.closeAll({
            addColOpen: true,
            colSearch: '',
            colPrompt: '',
          }),
        ),
      addAutomation: () => this.flash('Automation builder opened'),
      creditsNum: credits.toLocaleString(),
      creditsLabel: credits.toLocaleString() + ' credits',
      creditsWarn: credits < 1000,
      creditsColor: credits < 1000 ? '#C2410C' : '#18181B',
      creditBg: credits < 1000 ? '#FFF8F1' : '#FFFFFF',
      creditBorder: credits < 1000 ? '#FED7AA' : '#E5E5EA',
      creditFg: credits < 1000 ? '#C2410C' : '#3F3F46',
      creditsOpen: s.creditsOpen,
      openCredits: () =>
        this.setState(
          this.closeAll({
            creditsOpen: true,
          }),
        ),
      closeCredits: () =>
        this.setState({
          creditsOpen: false,
        }),
      topUp: () => {
        this.setState({
          credits: 10000,
          creditsOpen: false,
          runState: 'Running',
        })
        this.flash('10,000 credits added — run resumed')
      },
      usage: [
        {
          label: 'Company enrichment — 2 / cell',
          cost: '4,740',
        },
        {
          label: 'People enrichment — 4 / contact',
          cost: '7,120',
        },
        {
          label: 'Email verification — 3 / contact',
          cost: '3,180',
        },
        {
          label: 'Signal research — 4 / company',
          cost: '3,200',
        },
      ],
      enrich: () =>
        this.setState(
          this.closeAll({
            creditsOpen: true,
          }),
        ),
      importOpen: s.importOpen,
      exportOpen: s.exportOpen,
      toggleImport: () =>
        this.setState(
          this.closeAll({
            importOpen: !s.importOpen,
          }),
        ),
      toggleExport: () =>
        this.setState(
          this.closeAll({
            exportOpen: !s.exportOpen,
          }),
        ),
      importItems: [
        'Import CSV',
        'Import Excel',
        'Import from CRM',
        'Import from URL',
        'Paste data',
      ].map((label) => ({
        label,
        pick: () => {
          this.setState({
            importOpen: false,
          })
          this.flash(label + ' started')
        },
      })),
      exportItems: [
        'Export CSV',
        'Export Excel',
        'Export selected rows',
        'Export current view',
      ].map((label) => ({
        label,
        pick: () => {
          this.setState({
            exportOpen: false,
          })
          this.flash(label + ' — file ready')
        },
      })),
      columnsOpen: s.columnsOpen,
      colsBtnStyle:
        'flex:none; height:27px; width:28px; display:flex; align-items:center; justify-content:center; border-radius:6px; cursor:pointer; ' +
        (s.columnsOpen
          ? 'border:1px solid #C9B6F5; background:#F5F1FD; color:#5B21B6'
          : 'border:1px solid #E4E4E8; background:#FFFFFF; color:#52525B'),
      toggleColumns: () =>
        this.setState(
          this.closeAll({
            columnsOpen: !s.columnsOpen,
          }),
        ),
      showAllCols: () =>
        this.setState({
          hidden: [],
        }),
      hideAllCols: () =>
        this.setState({
          hidden: ALL_COLS.filter(
            (c) => c[0] !== 'num' && c[0] !== 'check' && c[0] !== 'company',
          ).map((c) => c[0]),
        }),
      columnToggles: s.order
        .filter((k) => k !== 'num' && k !== 'check')
        .map((k) => {
          const col = ALL_COLS.find((c) => c[0] === k),
            on = s.hidden.indexOf(k) === -1,
            idx = s.order.indexOf(k)
          const move = (d) => () =>
            this.setState((st) => {
              const o = st.order.slice(),
                j = idx + d
              if (j < 2 || j >= o.length) return {}
              o.splice(idx, 1)
              o.splice(j, 0, k)
              return {
                order: o,
              }
            })
          return {
            label: col[1],
            color: on ? '#3F3F46' : '#B4B4BB',
            eyeColor: on ? '#6D28D9' : '#C4C4CB',
            pick: () =>
              this.setState((st) => ({
                hidden: on ? st.hidden.concat(k) : st.hidden.filter((x) => x !== k),
              })),
            up: move(-1),
            down: move(1),
          }
        }),
      filterOpen: s.filterOpen,
      filterBadge: active.length ? '· ' + active.length : '',
      filterBtnStyle:
        'flex:none; white-space:nowrap; height:27px; padding:0 9px; border-radius:6px; font-size:11.5px; cursor:pointer; display:flex; align-items:center; gap:5px; ' +
        (active.length
          ? 'border:1px solid #C9B6F5; background:#F5F1FD; color:#5B21B6; font-weight:600'
          : 'border:1px solid #E4E4E8; background:#FFFFFF; color:#3F3F46'),
      toggleFilter: () =>
        this.setState(
          this.closeAll({
            filterOpen: !s.filterOpen,
          }),
        ),
      filterRules: Object.keys(PRED).map((k) => {
        const on = active.indexOf(k) > -1
        return {
          label: k,
          count: String(C.filter(PRED[k]).length),
          check: on ? '✓' : '',
          boxBg: on ? '#6D28D9' : '#FFFFFF',
          boxBorder: on ? '#6D28D9' : '#D4D4D8',
          pick: () =>
            this.setState((st) => ({
              filters: on ? st.filters.filter((x) => x !== k) : st.filters.concat(k),
            })),
        }
      }),
      filterSummary: active.length
        ? rowsData.length + ' of ' + C.length + ' rows'
        : 'No filters applied',
      clearFilters: () =>
        this.setState({
          filters: [],
        }),
      sortOpen: s.sortOpen,
      sortBtnStyle:
        'flex:none; white-space:nowrap; height:27px; padding:0 9px; border-radius:6px; font-size:11.5px; cursor:pointer; display:flex; align-items:center; gap:5px; border:1px solid #E4E4E8; background:#FFFFFF; color:#3F3F46',
      toggleSort: () =>
        this.setState(
          this.closeAll({
            sortOpen: !s.sortOpen,
          }),
        ),
      sorts: Object.keys(SORTS).map((k) => ({
        label: 'Sort by ' + k.toLowerCase(),
        check: s.sort === k ? '✓' : '',
        color: s.sort === k ? '#5B21B6' : '#3F3F46',
        weight: s.sort === k ? '650' : '500',
        pick: () =>
          this.setState({
            sort: k,
          }),
      })),
      sortDirLabel: s.sortDir === 'desc' ? 'Descending' : 'Ascending',
      toggleSortDir: () =>
        this.setState({
          sortDir: s.sortDir === 'desc' ? 'asc' : 'desc',
        }),
      runPanelOpen: s.runPanelOpen,
      runState: s.runState,
      runStateColor: running ? '#15803D' : done ? '#15803D' : '#C2410C',
      runLabel: running
        ? 'Running 364 / 2,370 cells'
        : done
          ? 'Last run 2,370 / 2,370 cells'
          : 'Paused 364 / 2,370 cells',
      runPillStyle:
        'flex:none; white-space:nowrap; display:flex; align-items:center; gap:6px; height:27px; padding:0 9px; border-radius:6px; cursor:pointer; font-size:11px; font-weight:600; ' +
        (running
          ? 'background:#ECFDF3; border:1px solid #C6EFD8; color:#15803D'
          : done
            ? 'background:#F4F4F6; border:1px solid #E5E5EA; color:#52525B'
            : 'background:#FFF8F1; border:1px solid #FED7AA; color:#C2410C'),
      runDotStyle:
        'width:6px; height:6px; border-radius:50%; background:' +
        (running ? '#22A15D' : done ? '#A1A1AA' : '#EA580C') +
        (running ? '; animation:pulse 1.4s ease-in-out infinite' : ''),
      toggleRunPanel: () =>
        this.setState(
          this.closeAll({
            runPanelOpen: !s.runPanelOpen,
          }),
        ),
      runPct: done ? '100%' : '15.4%',
      runStats: [
        {
          label: 'Completed',
          value: done ? '2,370' : '364',
          color: '#18181B',
        },
        {
          label: 'Remaining',
          value: done ? '0' : '2,006',
          color: '#18181B',
        },
        {
          label: 'Failed',
          value: '0',
          color: '#18181B',
        },
        {
          label: 'Credits required',
          value: done ? '0' : '7,900',
          color: '#C2410C',
        },
      ],
      runSteps: [
        ['Website enrichment', '✓', '118 completed'],
        ['LinkedIn signals', '✓', '96 completed'],
        ['Decision-makers', running ? '⟳' : '‖', '74 ' + (running ? 'running' : 'paused')],
        ['Social signals', '○', '76 queued'],
      ].map((x, i) => ({
        label: x[0],
        icon: x[1],
        meta: x[2],
        iconColor: i < 2 ? '#22A15D' : i === 2 ? (running ? '#6D28D9' : '#EA580C') : '#C4C4CB',
        color: i < 3 ? '#3F3F46' : '#A1A1AA',
        weight: i === 2 ? '600' : '500',
      })),
      pauseLabel: running ? 'Pause' : 'Resume',
      pauseRun: () => {
        const n = running ? 'Paused' : 'Running'
        this.setState({
          runState: n,
        })
        this.flash('Run ' + n.toLowerCase())
      },
      cancelRun: () => {
        this.setState({
          runState: 'Completed',
          runPanelOpen: false,
        })
        this.flash('Run cancelled — 364 cells kept')
      },
      sheetTabs: [
        ['Target Companies', '42', false],
        ['Leaders', '112', false],
        ['Signals', '642', false],
      ]
        .concat(s.customSheets.map((n) => [n, '0', true]))
        .map((t) => ({
          name: t[0],
          count: t[1],
          style: sheetStyle(t[0]),
          custom: t[2],
          renaming: s.renamingSheet === t[0],
          menuOpen: s.sheetMenuFor === t[0],
          pick: () =>
            this.setState(
              this.closeAll({
                sheet: t[0],
              }),
            ),
          menu: (e) => {
            this.stop(e)
            this.setState({
              sheetMenuFor: s.sheetMenuFor === t[0] ? null : t[0],
            })
          },
          startRename: (e) => {
            this.stop(e)
            this.setState({
              sheetMenuFor: null,
              renamingSheet: t[0],
              renameDraft: t[0],
            })
          },
          del: (e) => {
            this.stop(e)
            this.setState((st) => ({
              sheetMenuFor: null,
              customSheets: st.customSheets.filter((x) => x !== t[0]),
              sheet: st.sheet === t[0] ? 'Target Companies' : st.sheet,
            }))
            this.flash('“' + t[0] + '” deleted')
          },
        })),
      renameDraft: s.renameDraft,
      onRenameDraft: (e) =>
        this.setState({
          renameDraft: e.target.value,
        }),
      commitRename: () =>
        this.setState((st) => {
          const nn = (st.renameDraft || '').trim() || st.renamingSheet
          return {
            customSheets: st.customSheets.map((x) => (x === st.renamingSheet ? nn : x)),
            sheet: st.sheet === st.renamingSheet ? nn : st.sheet,
            renamingSheet: null,
          }
        }),
      addSheet: () =>
        this.setState((st) => {
          const n = 'Sheet ' + (st.customSheets.length + 1)
          return this.closeAll({
            customSheets: st.customSheets.concat(n),
            sheet: n,
          })
        }),
      sheetCompanies: s.sheet === 'Target Companies',
      sheetLeaders: s.sheet === 'Leaders',
      sheetSignals: s.sheet === 'Signals',
      sheetCustom: s.customSheets.indexOf(s.sheet) > -1,
      customSheetName: s.sheet,
      seedFromResearch: () => {
        this.setState(
          this.closeAll({
            sheet: 'Target Companies',
          }),
        )
        this.flash('Copy rows from Target Companies to populate this sheet')
      },
      viewChips: ['All companies']
        .concat(Object.keys(PRED))
        .concat(s.savedViews.map((v) => v.name))
        .map((k) => {
          const saved = s.savedViews.find((v) => v.name === k)
          return {
            label: k,
            custom: !!saved,
            style: this.chipStyle(
              saved
                ? s.activeView === k
                : k === 'All companies'
                  ? active.length === 0 && s.activeView === 'All companies'
                  : active.indexOf(k) > -1,
            ),
            pick: () =>
              this.setState((st) =>
                saved
                  ? {
                      filters: saved.filters.slice(),
                      hidden: saved.hidden.slice(),
                      activeView: k,
                    }
                  : k === 'All companies'
                    ? {
                        filters: [],
                        activeView: 'All companies',
                      }
                    : {
                        activeView: '',
                        filters:
                          st.filters.indexOf(k) > -1
                            ? st.filters.filter((x) => x !== k)
                            : st.filters.concat(k),
                      },
              ),
            remove: (e) => {
              this.stop(e)
              this.setState((st) => ({
                savedViews: st.savedViews.filter((v) => v.name !== k),
                activeView: st.activeView === k ? 'All companies' : st.activeView,
              }))
            },
          }
        }),
      canSaveView: active.length > 0 || s.hidden.join() !== DEFAULT_HIDDEN.join(),
      saveView: () =>
        this.setState((st) => {
          const base = st.filters.length
            ? st.filters.join(' + ') + ' (saved)'
            : 'Custom view ' + (st.savedViews.length + 1)
          let n = base,
            i = 2
          while (st.savedViews.some((v) => v.name === n)) {
            n = base + ' ' + i
            i += 1
          }
          this.flash('View “' + n + '” saved')
          return {
            savedViews: st.savedViews.concat({
              name: n,
              filters: st.filters.slice(),
              hidden: st.hidden.slice(),
            }),
            activeView: n,
          }
        }),
      gridCols: cols.map((c) => widthFor(c)).join(' '),
      tableMinWidth: cols.reduce((a, c) => a + parseInt(widthFor(c), 10), 0) + 'px',
      rowHeight: '34px',
      setColWidth: this.setColWidth,
      isEdited: (row, col) => s.cellEdits[col + '|' + row] !== undefined,
      headCells: cols.map((c) => {
        const cc = c[3] === 'custom' ? s.customCols.find((x) => 'cc:' + x.id === c[0]) : null
        return {
          key: c[0],
          editable:
            c[3] === 'custom'
              ? !!(cc && cc.cost === 0 && cc.badge === 'TXT')
              : EDITABLE_SOURCE_COLUMNS.indexOf(c[0]) > -1,
          label: c[1],
          isCheck: c[0] === 'check',
          isAdd: c[3] === 'actions',
          isCustomHead: !!cc,
          badge: cc ? cc.badge : '',
          cost: cc ? (cc.cost ? cc.cost + ' cr / cell' : 'Free') : '',
          menuOpen: cc ? s.colMenuFor === cc.id : false,
          menuBg: cc && s.colMenuFor === cc.id ? '#EFE9FB' : 'transparent',
          toggleMenu: cc
            ? (e) => {
                this.stop(e)
                this.setState((st) =>
                  this.closeAll({
                    colMenuFor: st.colMenuFor === cc.id ? null : cc.id,
                  }),
                )
              }
            : null,
          menuItems: cc
            ? (function (self, unit) {
                const price = (n) => (n * unit).toLocaleString() + ' cr'
                const selRows = rowsData.filter((r) => s.selectedRows.indexOf(r.name) !== -1)
                const empty = self.colCells(cc, rowsData, 'empty')
                const failed = self.colCells(cc, rowsData, 'failed')
                return [
                  ['Run all rows', rowsData.length, () => self.startJob(rowsData, [cc])],
                  ['Run selected rows', selRows.length, () => self.startJob(selRows, [cc])],
                  ['Run empty cells', empty.length, () => self.startJob(empty, [cc])],
                  ['Retry failed cells', failed.length, () => self.startJob(failed, [cc])],
                  [
                    'Clear results',
                    -1,
                    () =>
                      self.setState((st) => {
                        const cv = Object.assign({}, st.cellVals),
                          cs = Object.assign({}, st.cellState)
                        Object.keys(cv).forEach((k) => {
                          if (k.indexOf(cc.id + '|') === 0) delete cv[k]
                        })
                        Object.keys(cs).forEach((k) => {
                          if (k.indexOf(cc.id + '|') === 0) delete cs[k]
                        })
                        self.flash(cc.name + ' results cleared')
                        return {
                          cellVals: cv,
                          cellState: cs,
                          colMenuFor: null,
                        }
                      }),
                  ],
                ].map((x) => ({
                  label: x[0],
                  hint: x[1] < 0 ? '' : x[1] === 0 ? 'none' : price(x[1]),
                  color: x[1] === 0 ? '#B4B4BB' : x[0] === 'Clear results' ? '#B91C1C' : '#3F3F46',
                  pick: (e) => {
                    self.stop(e)
                    if (x[1] === 0) {
                      self.flash('No cells match')
                      self.setState({
                        colMenuFor: null,
                      })
                      return
                    }
                    x[2]()
                  },
                }))
              })(this, cc.cost || 0)
            : [],
          remove: cc
            ? () =>
                this.setState((st) => ({
                  customCols: st.customCols.filter((x) => x.id !== cc.id),
                }))
            : null,
        }
      }),
      addColOpen: s.addColOpen,
      openAddCol: () =>
        this.setState(
          this.closeAll({
            addColOpen: true,
            colPrompt: '',
            colSearch: '',
          }),
        ),
      closeAddCol: () =>
        this.setState({
          addColOpen: false,
        }),
      colSearch: s.colSearch,
      onColSearch: (e) =>
        this.setState({
          colSearch: e.target.value,
        }),
      colPrompt: s.colPrompt,
      onColPrompt: (e) =>
        this.setState({
          colPrompt: e.target.value,
        }),
      colTypes: COL_TYPES.filter(
        (t) =>
          !s.colSearch.trim() ||
          (t[0] + ' ' + t[1]).toLowerCase().indexOf(s.colSearch.trim().toLowerCase()) > -1,
      ).map((t) => ({
        name: t[0],
        desc: t[1],
        cost: t[2] ? '~' + t[2] + ' / cell' : 'Free',
        path: t[5],
        hasSrc: !!t[6],
        src: t[6] ? SRC[t[6]][0] : '',
        srcStyle: t[6]
          ? 'flex:none; width:17px; height:17px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:8.5px; font-weight:700; color:#FFFFFF; letter-spacing:-.02em; background:' +
            SRC[t[6]][1]
          : '',
        add: () =>
          this.setState((st) => {
            const id = 'c' + (st.customCols.length + 1) + '_' + Date.now().toString(36).slice(-3)
            this.flash('“' + t[0] + '” column added — run cells to populate')
            return {
              addColOpen: false,
              customCols: st.customCols.concat({
                id,
                name: t[0],
                type: t[0],
                cost: t[2],
                badge: t[3] === 'ai' ? 'AI' : t[3] === 'plain' ? 'TXT' : t[3].toUpperCase(),
              }),
            }
          }),
      })),
      colTools: [
        ['Tools', 'Browse every source and integration'],
        ['Prompt library', 'Reuse a saved enrichment prompt'],
        ['Formula column', 'Compute from existing columns'],
        ['Import from CSV', 'Map a column from a file'],
      ].map((x) => ({
        label: x[0],
        desc: x[1],
        pick: () => {
          this.setState({
            addColOpen: false,
            colToolsOpen: false,
          })
          this.flash(x[0] + ' opened')
        },
      })),
      colToolsOpen: s.colToolsOpen,
      toggleColTools: () =>
        this.setState((st) => ({
          colToolsOpen: !st.colToolsOpen,
        })),
      addPromptCol: () => {
        const p = s.colPrompt.trim()
        if (!p) {
          this.flash('Describe the column first')
          return
        }
        this.setState((st) => {
          const id = 'p' + (st.customCols.length + 1) + '_' + Date.now().toString(36).slice(-3)
          this.flash('AI column added — run cells to populate')
          return {
            addColOpen: false,
            colPrompt: '',
            customCols: st.customCols.concat({
              id,
              name: p.slice(0, 26),
              type: 'Company Description',
              cost: 3,
              badge: 'AI',
            }),
          }
        })
      },
      selectAllMark:
        s.selectedRows.length === 0 ? '' : s.selectedRows.length === rowsData.length ? '✓' : '–',
      selectAllBg: s.selectedRows.length ? '#6D28D9' : '#FFFFFF',
      selectAllBorder: s.selectedRows.length ? '#6D28D9' : '#D4D4D8',
      toggleSelectAll: () =>
        this.setState((st) => ({
          selectedRows: st.selectedRows.length ? [] : rowsData.map((c) => c.name),
        })),
      rows: rowsData.map((c, i) => ({
        name: c.name,
        cells: cellsFor(c, i),
        rowBg: s.selected === c.name ? '#FBFAFF' : '#FFFFFF',
        open: () => pick(c.name),
      })),
      setCellEdits: this.setCellEdits,
      noteCopied: this.noteCopied,
      noteSkipped: this.noteSkipped,
      rowsFooter: 'Showing ' + rowsData.length + ' of 42 rows · 400 total in workspace',
      tableSearch: s.tableSearch,
      onTableSearch: (e) =>
        this.setState({
          tableSearch: e.target.value,
        }),
      clearTableSearch: () =>
        this.setState({
          tableSearch: '',
        }),
      hasTableSearch: !!q,
      runCellsBtnStyle:
        'flex:none; white-space:nowrap; height:27px; padding:0 10px; border-radius:6px; font-size:11.5px; font-weight:600; display:flex; align-items:center; gap:5px; ' +
        (s.selectedRows.length
          ? 'border:1px solid #6D28D9; background:#6D28D9; color:#FFFFFF; cursor:pointer'
          : 'border:1px solid #E4E4E8; background:#FFFFFF; color:#B4B4BB; cursor:not-allowed'),
      runCellsCount: s.selectedRows.length ? ' · ' + s.selectedRows.length * 2 : '',
      openRunCells: () => {
        if (!s.selectedRows.length) {
          this.flash('Select at least one row first')
          return
        }
        this.setState(
          this.closeAll({
            runCellsOpen: true,
            runCellsDone: 0,
            runCellsRunning: false,
            runCellsTotal: s.selectedRows.length * 2,
          }),
        )
      },
      closeRunCells: () => {
        this._runToken = (this._runToken || 0) + 1
        ;(this._rts || []).forEach((t) => this.clearTimeout(t))
        this.setState({
          runCellsOpen: false,
          runCellsRunning: false,
          runCellsDone: 0,
        })
      },
      runCellsOpen: s.runCellsOpen,
      runCellsConfirm: !s.runCellsRunning && s.runCellsDone === 0,
      runCellsActive: s.runCellsRunning,
      runCellsComplete: !s.runCellsRunning && s.runCellsDone > 0,
      runCellsRows: String(s.selectedRows.length),
      runCellsTotalLabel: String(s.runCellsTotal || s.selectedRows.length * 2),
      runCellsCost: ((s.runCellsTotal || s.selectedRows.length * 2) * 10).toLocaleString(),
      runCellsProgress: s.runCellsDone + ' / ' + (s.runCellsTotal || s.selectedRows.length * 2),
      runCellsPct:
        (s.runCellsTotal ? (s.runCellsDone / s.runCellsTotal) * 100 : 0).toFixed(1) + '%',
      runCellsAffordable: credits >= (s.runCellsTotal || s.selectedRows.length * 2) * 10,
      confirmRunCells: () => {
        const total = s.runCellsTotal || s.selectedRows.length * 2,
          cost = total * 10
        if (credits < cost) {
          this.setState({
            runCellsOpen: false,
            creditsOpen: true,
          })
          return
        }
        const token = (this._runToken || 0) + 1
        this._runToken = token
        ;(this._rts || []).forEach((t) => this.clearTimeout(t))
        this.setState({
          runCellsRunning: true,
          runCellsDone: 0,
        })
        const steps = 8
        this._rts = []
        for (let i = 1; i <= steps; i += 1) {
          const done = Math.round((total * i) / steps),
            last = i === steps
          this._rts.push(
            this.setTimeout(() => {
              if (this._runToken !== token) return
              if (last)
                this.setState((st) => ({
                  runCellsDone: total,
                  runCellsRunning: false,
                  credits: Math.max(0, st.credits - cost),
                }))
              else
                this.setState({
                  runCellsDone: done,
                })
            }, i * 280),
          )
        }
      },
      finishRunCells: () => {
        this.setState({
          runCellsOpen: false,
          runCellsDone: 0,
          selectedRows: [],
        })
        this.flash('Enrichment written back to ' + s.selectedRows.length + ' rows')
      },
      shareOpen: s.shareOpen,
      openShare: () =>
        this.setState(
          this.closeAll({
            shareOpen: true,
          }),
        ),
      closeShare: () =>
        this.setState({
          shareOpen: false,
        }),
      shareLink:
        'outmate.ai/r/' +
        s.conv
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .slice(0, 28),
      copyShareLink: () => {
        this.setState({
          shareOpen: false,
        })
        this.flash('Share link copied')
      },
      shareTargets: [
        'Anyone with the link — view',
        'Workspace members — edit',
        'Send to Slack #gtm',
        'Email to teammate',
      ].map((label) => ({
        label,
        pick: () => {
          this.setState({
            shareOpen: false,
          })
          this.flash(label.split(' —')[0] + ' — shared')
        },
      })),
      hasSelection: s.selectedRows.length > 0,
      selectionLabel:
        s.selectedRows.length +
        ' row' +
        (s.selectedRows.length === 1 ? '' : 's') +
        ' selected · ' +
        s.selectedRows.length * 2 +
        ' cells · ' +
        (s.selectedRows.length * 20).toLocaleString() +
        ' credits',
      footerStats: [
        ['42', 'companies'],
        ['112', 'leaders'],
        ['642', 'signals'],
        ['2,370', 'cells enriched'],
      ].map((x) => ({
        value: x[0],
        label: x[1],
      })),
      footerRun: done
        ? 'Last run 2,370 / 2,370 cells'
        : running
          ? 'Running 364 / 2,370 cells'
          : 'Paused 364 / 2,370 cells',
      clearSelection: () =>
        this.setState({
          selectedRows: [],
        }),
      exportSelected: () => this.flash('Exported ' + s.selectedRows.length + ' rows'),
      showActionBar: s.selectedRows.length > 0 || !!s.job,
      barIdle: s.selectedRows.length > 0 && !s.job,
      barRunning: !!s.job && s.job.running,
      barDone: !!s.job && !s.job.running,
      barRows: s.selectedRows.length.toLocaleString(),
      barCostLabel:
        s.selectedRows.length +
        ' rows × ' +
        barUnit +
        ' credits = ' +
        barCost.toLocaleString() +
        ' credits',
      barCost: barCost.toLocaleString(),
      barInsufficient: barCost > credits,
      runRowsStyle:
        'display:flex; align-items:center; gap:6px; height:27px; padding:0 12px; border-radius:6px; font-size:11.5px; font-weight:600; ' +
        (barCost > credits
          ? 'border:1px solid #E4E4E8; background:#F4F4F6; color:#B4B4BB; cursor:not-allowed'
          : 'border:1px solid #6D28D9; background:#6D28D9; color:#FFFFFF; cursor:pointer'),
      runSelected: () => {
        const rows = rowsData.filter((r) => s.selectedRows.indexOf(r.name) !== -1)
        if (barCost > credits) {
          this.setState(
            this.closeAll({
              creditsOpen: true,
            }),
          )
          return
        }
        this.startJob(rows, barCols)
      },
      deleteSelected: () => {
        this.setState((st) => ({
          removed: (st.removed || []).concat(st.selectedRows),
          selectedRows: [],
        }))
        this.flash(s.selectedRows.length + ' rows deleted')
      },
      cancelJob: this.cancelJob,
      dismissJob: () =>
        this.setState({
          job: null,
        }),
      jobPct: (s.job ? (s.job.done / s.job.total) * 100 : 0).toFixed(1) + '%',
      jobProgress: s.job ? s.job.done + ' / ' + s.job.total + ' completed' : '',
      jobRemaining: s.job ? Math.max(0, s.job.total - s.job.done) + ' remaining' : '',
      jobSpent: s.job ? s.job.spent.toLocaleString() + ' credits used' : '',
      jobSummary: s.job
        ? s.job.done -
          s.job.failed.length +
          ' of ' +
          s.job.total +
          ' cells enriched' +
          (s.job.failed.length ? ' · ' + s.job.failed.length + ' failed' : '') +
          (s.job.cancelled ? ' · ' + s.job.cancelled + ' cancelled' : '')
        : '',
      jobHasFailed: !!s.job && s.job.failed.length > 0,
      jobFailedLabel: s.job ? 'Retry ' + s.job.failed.length + ' failed' : '',
      retryFailed: () => {
        const keys = (s.job && s.job.failed) || []
        const tasks = keys.map((k) => (this._tasks || {})[k]).filter(Boolean)
        if (!tasks.length) return
        this.setState({
          job: null,
        })
        tasks.forEach((t) => this.runCell(t.col, t.row))
        this.flash('Retrying ' + tasks.length + ' cells')
      },
      addSelectedToList: () => this.flash(s.selectedRows.length + ' accounts added to target list'),
      leaderCols: [
        '#',
        'Person',
        'Job Title',
        'Company',
        'LinkedIn',
        'Work Email',
        'Email Status',
        'Department',
        'Seniority',
        'Location',
        'Buying Relevance',
        'Actions',
      ],
      leaders: C.filter((c) => c.person).map((c, i) => ({
        n: String(i + 1),
        name: c.person,
        initials: c.initials,
        bg: c.avBg,
        title: c.role,
        company: c.name,
        logo: c.logo,
        logoBg: c.logoBg,
        email: c.email || 'Not found',
        status: c.status || 'Not found',
        statusStyle: statusStyle(c.status || 'Not found'),
        loc: c.loc,
        li: c.li ? '/' + c.li : '',
        hasLi: !!c.li,
        noLi: !c.li,
        emailColor: c.email ? '#52525B' : '#B4B4BB',
        dept:
          c.role.indexOf('RevOps') > -1
            ? 'Revenue Operations'
            : c.role.indexOf('Sales') > -1
              ? 'Sales'
              : 'Executive',
        seniority:
          c.role === 'CEO' || c.role === 'CRO' || c.role === 'Founder'
            ? 'C-level'
            : c.role.indexOf('VP') > -1
              ? 'VP'
              : c.role.indexOf('Director') > -1
                ? 'Director'
                : c.role.indexOf('Lead') > -1 || c.role.indexOf('Head') > -1
                  ? 'Lead'
                  : 'Manager',
        persona:
          c.role.indexOf('RevOps') > -1
            ? 'Technical'
            : c.role === 'CEO' || c.role === 'CRO' || c.role === 'Founder'
              ? 'Economic'
              : 'Champion',
        roleStyle: this.pill(
          c.role.indexOf('RevOps') > -1
            ? '#EFF6FF'
            : c.role === 'CEO' || c.role === 'CRO' || c.role === 'Founder'
              ? '#F5F3FF'
              : '#ECFDF3',
          c.role.indexOf('RevOps') > -1
            ? '#1D4ED8'
            : c.role === 'CEO' || c.role === 'CRO' || c.role === 'Founder'
              ? '#6D28D9'
              : '#15803D',
        ),
        open: () => pick(c.name),
        openLi: (e) => {
          this.stop(e)
          this.flash('Opening LinkedIn · ' + c.person)
        },
        copyEmail: (e) => {
          this.stop(e)
          this.flash(c.email + ' copied')
        },
        addOutreach: (e) => {
          this.stop(e)
          this.flash(c.person + ' added to outreach')
        },
      })),
      signalCols: [
        '#',
        'Company',
        'Signal Type',
        'Signal',
        'Evidence',
        'Source',
        'Detected',
        'Freshness',
        'Strength',
        'Buying Relevance',
      ],
      signalRows: [
        [
          'Acme',
          '🔥',
          'Hiring',
          'VP Sales joined — Austin, TX',
          'LinkedIn',
          '2h ago',
          'High',
          'Profile updated, title change verified',
          'Fresh',
          'Triggers stack review',
        ],
        [
          'Acme',
          '🌐',
          'Website intent',
          'Four pricing-page visits in 24h',
          'Website',
          '6h ago',
          'High',
          'De-anonymised by IP + firmographic match',
          'Fresh',
          'Active evaluation',
        ],
        [
          'RevenueFlow',
          '💰',
          'Funding',
          'Series B — $28M led by Redpoint',
          'Crunchbase',
          '3d ago',
          'High',
          'Filing confirmed, press release live',
          'Recent',
          'Budget unlocked',
        ],
        [
          'RevenueFlow',
          '💬',
          'Social',
          'CRO posting on stack consolidation',
          'LinkedIn',
          '5h ago',
          'Medium',
          'Public post, 148 reactions',
          'Fresh',
          'Economic buyer intent',
        ],
        [
          'Northwind Labs',
          '🏆',
          'Competitor',
          'Comparing Salesforce alternatives',
          'Reddit',
          '1d ago',
          'Medium',
          'Domain-matched account in thread',
          'Recent',
          'Live shortlist',
        ],
        [
          'Cadence HQ',
          '⚙',
          'Tech stack',
          'Added three point tools this quarter',
          'BuiltWith',
          '2d ago',
          'Medium',
          'Script tags first seen 62 days ago',
          'Recent',
          'Consolidation case',
        ],
        [
          'Loop Systems',
          '🔥',
          'Hiring',
          'Two AE roles opened in EMEA',
          'Greenhouse',
          '3h ago',
          'High',
          'Job posts live on careers page',
          'Fresh',
          'GTM build-out',
        ],
        [
          'Osano',
          '🌐',
          'Website intent',
          'Integration docs viewed twice',
          'Website',
          '2d ago',
          'Medium',
          'Two sessions, same subnet',
          'Recent',
          'Technical evaluation',
        ],
        [
          'HeadLight',
          '💰',
          'Funding',
          'Series A extension — $9M',
          'Crunchbase',
          '18h ago',
          'High',
          'Filing confirmed',
          'Fresh',
          'Budget unlocked',
        ],
        [
          'Brightpath',
          '👥',
          'Community',
          'Engineers asking about enrichment APIs',
          'Segment forum',
          '4d ago',
          'Low',
          'Two accounts matched by email domain',
          'Ageing',
          'Early research',
        ],
        [
          'MediaTrenz',
          '○',
          'No signal detected',
          'Nothing observed in the 7d window',
          'Not applicable',
          '—',
          'None',
          'No evidence collected',
          'Stale',
          'Monitor only',
        ],
      ].map((x, i) => {
        const c = C.find((k) => k.name === x[0])
        return {
          n: String(i + 1),
          company: x[0],
          logo: c.logo,
          logoBg: c.logoBg,
          icon: x[1],
          type: x[2],
          detail: x[3],
          source: x[4],
          time: x[5],
          conf: x[6],
          evidence: x[7],
          fresh: x[8],
          relevance: x[9],
          detailColor: x[6] === 'None' ? '#B4B4BB' : '#52525B',
          confStyle: this.pill(
            x[6] === 'High'
              ? '#ECFDF3'
              : x[6] === 'Medium'
                ? '#FFF8F1'
                : x[6] === 'Low'
                  ? '#F4F4F6'
                  : '#F4F4F6',
            x[6] === 'High' ? '#15803D' : x[6] === 'Medium' ? '#C2410C' : '#71717A',
          ),
          freshStyle: this.pill(
            x[8] === 'Fresh' ? '#ECFDF3' : x[8] === 'Recent' ? '#EFF6FF' : '#F4F4F6',
            x[8] === 'Fresh' ? '#15803D' : x[8] === 'Recent' ? '#1D4ED8' : '#A1A1AA',
          ),
          open: () => {
            this.setState(
              this.closeAll({
                selected: x[0],
                contextOpen: true,
                tab: 'Signals',
              }),
            )
            this.flash(x[2] + ' · ' + x[7])
          },
        }
      }),
      contextOpen: s.contextOpen,
      toggleContext: () =>
        this.setState({
          contextOpen: !s.contextOpen,
        }),
      closePanel: () =>
        this.setState({
          selected: null,
        }),
      noSelection: !sel,
      hasSelectedCompany: !!sel,
      emptyBullets: [
        'ICP fit',
        'Intent score',
        'Buying signals',
        'People',
        'Social activity',
        'Tech stack',
        'GTM gaps',
      ],
      recentAccounts: C.slice(0, 4).map((c) => ({
        name: c.name,
        logo: c.logo,
        logoBg: c.logoBg,
        meta: c.domain + ' · ' + c.last,
        intent: String(c.intent),
        open: () => pick(c.name),
      })),
      tabs: ['Overview', 'Signals', 'People', 'Social', 'Tech Stack'].map((n) => ({
        name: n,
        style: tabStyle(n),
        pick: () =>
          this.setState({
            tab: n,
          }),
      })),
      tabOverview: s.tab === 'Overview',
      tabSignals: s.tab === 'Signals',
      tabPeople: s.tab === 'People',
      tabSocial: s.tab === 'Social',
      tabStack: s.tab === 'Tech Stack',
      sel: sel
        ? {
            name: sel.name,
            logo: sel.logo,
            logoBg: sel.logoBg,
            domain: sel.domain,
            meta: sel.industry + ' · ' + sel.emp + ' employees · ' + sel.loc,
            intentLabel:
              sel.intent >= 80 ? 'HIGH INTENT' : sel.intent >= 65 ? 'MEDIUM INTENT' : 'LOW INTENT',
            intentBadge: this.pill(
              sel.intent >= 80 ? '#ECFDF3' : sel.intent >= 65 ? '#FFF8F1' : '#F4F4F6',
              sel.intent >= 80 ? '#15803D' : sel.intent >= 65 ? '#C2410C' : '#71717A',
            ),
            icpPct: sel.icp + '%',
            gap: sel.gap,
            insight: (INSIGHTS[sel.name] || [
              sel.signals.length
                ? sel.name +
                  ' shows ' +
                  sel.signals.length +
                  ' independent buying signals in the last 7 days across ' +
                  sel.signals.map((x) => x[0].toLowerCase()).join(', ') +
                  '.'
                : 'No buying signals detected for ' +
                  sel.name +
                  ' in the 7-day window. Firmographics match ICP, so keep it on watch rather than in outreach.',
            ])[0],
            rec: (INSIGHTS[sel.name] || [
              null,
              sel.signals.length
                ? 'Research ' +
                  (sel.person || 'the buying committee') +
                  ' and open with the ' +
                  sel.signals[0][0].toLowerCase() +
                  ' signal.'
                : 'No live signal yet — enrich decision-makers before outreach.',
            ])[1],
          }
        : {},
      openDomain: () => this.flash('Opening ' + (sel ? sel.domain : '')),
      openLinkedIn: () => this.flash('Opening LinkedIn · ' + (sel ? sel.name : '')),
      explainGap: () =>
        this.flash(sel ? sel.gap + ' — detected from CRM fingerprint and stack scan' : ''),
      gtmRows: sel
        ? [
            {
              label: 'ICP fit',
              value:
                sel.icp + '% — ' + (sel.icp >= 85 ? 'Strong' : sel.icp >= 75 ? 'Moderate' : 'Weak'),
              color: sel.icp >= 85 ? '#15803D' : '#C2410C',
            },
            {
              label: 'Intent score',
              value: sel.intent + ' / 100',
              color: sel.intent >= 80 ? '#15803D' : '#C2410C',
            },
            {
              label: 'Signal strength',
              value: sel.signals.length + ' signals · 7d',
              color: '#18181B',
            },
            {
              label: 'Signal freshness',
              value: sel.last,
              color: '#18181B',
            },
            {
              label: 'Buying stage',
              value:
                sel.intent >= 80 ? 'Evaluating' : sel.intent >= 65 ? 'Researching' : 'Awareness',
              color: '#C2410C',
            },
            {
              label: 'CRM',
              value: sel.crm,
              color: '#18181B',
            },
          ]
        : [],
      actions: [
        {
          label: 'Research decision-makers',
          cost: '24 credits',
          pick: () =>
            this.setState({
              tab: 'People',
            }),
        },
        {
          label: 'Create outreach sequence',
          cost: 'available',
          pick: () => this.flash('Outreach sequence drafted'),
        },
        {
          label: 'Add to target list',
          cost: 'Free',
          pick: () => this.flash((sel ? sel.name : '') + ' added to target list'),
        },
      ],
      signalCards: [
        [
          '🔥',
          'Hiring signal',
          'VP Sales joined Acme',
          'LinkedIn',
          '2h ago',
          'High confidence',
          'Strong',
          'GTM leadership hires usually precede a stack review.',
          '#DC2626',
        ],
        [
          '🌐',
          'Website intent',
          'Visited pricing page 4 times',
          'Website',
          '6h ago',
          'High confidence',
          'Strong',
          'Repeat pricing visits indicate active evaluation.',
          '#1D4ED8',
        ],
        [
          '💬',
          'Social signal',
          'Mentioned Salesforce alternative',
          'LinkedIn',
          '1d ago',
          'Medium confidence',
          'Medium',
          'Public intent from an economic buyer.',
          '#6D28D9',
        ],
        [
          '🏆',
          'Competitor signal',
          'Researching GTM platforms',
          'Reddit',
          '3d ago',
          'Medium confidence',
          'Medium',
          'Named competitor research means a live shortlist.',
          '#B45309',
        ],
        [
          '⚙',
          'Tech stack',
          'Segment added, no GTM layer detected',
          'BuiltWith',
          '2w ago',
          'Low confidence',
          'Weak',
          'Stack gap matches our core wedge.',
          '#A1A1AA',
        ],
      ].map((x) => ({
        icon: x[0],
        type: x[1],
        detail: x[2],
        source: x[3],
        time: x[4],
        confidence: x[5],
        strength: x[6],
        why: x[7],
        dot: x[8],
        confColor: x[5][0] === 'H' ? '#15803D' : x[5][0] === 'M' ? '#C2410C' : '#A1A1AA',
        strengthStyle: this.pill(
          x[6] === 'Strong' ? '#ECFDF3' : x[6] === 'Medium' ? '#FFF8F1' : '#F4F4F6',
          x[6] === 'Strong' ? '#15803D' : x[6] === 'Medium' ? '#C2410C' : '#71717A',
        ),
        open: () => this.flash('Source: ' + x[3] + ' · ' + x[4]),
      })),
      people: [
        [
          'Sarah Chen',
          'SC',
          '#E4E7F5',
          'VP Sales',
          'Sales',
          'sarah@acme.io',
          'Champion',
          '#ECFDF3',
          '#15803D',
        ],
        [
          'Daniel Ortiz',
          'DO',
          '#F0E6DC',
          'Chief Revenue Officer',
          'Revenue',
          'daniel@acme.io',
          'Economic',
          '#F5F3FF',
          '#6D28D9',
        ],
        [
          'Mei Tanaka',
          'MT',
          '#E7F0EA',
          'Director, RevOps',
          'RevOps',
          'mei@acme.io',
          'Technical',
          '#EFF6FF',
          '#1D4ED8',
        ],
        [
          'Jonas Weber',
          'JW',
          '#F3E8E4',
          'Sales Ops Manager',
          'Sales Ops',
          'jonas@acme.io',
          'User',
          '#F4F4F6',
          '#71717A',
        ],
        [
          'Ella Novak',
          'EN',
          '#EDE7DE',
          'VP Marketing',
          'Marketing',
          'ella@acme.io',
          'Influencer',
          '#F4F4F6',
          '#71717A',
        ],
      ].map((p) => ({
        name: p[0],
        initials: p[1],
        bg: p[2],
        title: p[3],
        dept: p[4],
        email: p[5],
        badge: p[6],
        badgeStyle: this.pill(p[7], p[8]),
        research: (e) => {
          this.stop(e)
          this.flash('Researching ' + p[0] + ' — 24 credits')
        },
        openLi: (e) => {
          this.stop(e)
          this.flash('Opening LinkedIn · ' + p[0])
        },
        copyEmail: (e) => {
          this.stop(e)
          this.flash(p[5] + ' copied')
        },
        addOutreach: (e) => {
          this.stop(e)
          this.flash(p[0] + ' added to outreach')
        },
      })),
      social: [
        {
          platform: 'LinkedIn',
          dot: '#0A66C2',
          time: '5h ago',
          engagement: '148 reactions · 32 comments',
          text: '“We are consolidating six GTM tools into one data layer this quarter. Recommendations welcome.”',
          author: 'Daniel Ortiz · CRO',
        },
        {
          platform: 'Reddit · r/RevOps',
          dot: '#EA580C',
          time: '1d ago',
          engagement: '64 upvotes',
          text: 'Thread comparing Salesforce and lighter-weight alternatives for a 240-person SaaS team.',
          author: 'Account domain matched',
        },
        {
          platform: 'X',
          dot: '#18181B',
          time: '2d ago',
          engagement: '38 reposts',
          text: 'Announced a VP Sales search covering North America expansion.',
          author: 'Company account',
        },
        {
          platform: 'Community',
          dot: '#15803D',
          time: '4d ago',
          engagement: '12 replies',
          text: 'Two engineers active in the Segment community asking about warehouse-native enrichment.',
          author: 'Matched by email domain',
        },
      ],
      stackRows: [
        {
          category: 'CRM',
          name: 'HubSpot',
          dot: '#EA580C',
          confidence: 'High',
          source: 'DNS + script tag',
          last: '2h ago',
        },
        {
          category: 'Sales engagement',
          name: 'Outreach',
          dot: '#6D28D9',
          confidence: 'Medium',
          source: 'Job posting',
          last: '3d ago',
        },
        {
          category: 'Data warehouse',
          name: 'Snowflake',
          dot: '#0EA5E9',
          confidence: 'High',
          source: 'Job posting',
          last: '1d ago',
        },
        {
          category: 'Analytics / CDP',
          name: 'Segment',
          dot: '#22A15D',
          confidence: 'High',
          source: 'Script tag',
          last: '2h ago',
        },
        {
          category: 'BI',
          name: 'Metabase',
          dot: '#1D4ED8',
          confidence: 'Low',
          source: 'Subdomain',
          last: '2w ago',
        },
        {
          category: 'Support',
          name: 'Zendesk',
          dot: '#15803D',
          confidence: 'High',
          source: 'Script tag',
          last: '5h ago',
        },
      ].map((t) =>
        Object.assign(t, {
          confStyle: this.pill(
            t.confidence === 'High' ? '#ECFDF3' : t.confidence === 'Medium' ? '#FFF8F1' : '#F4F4F6',
            t.confidence === 'High' ? '#15803D' : t.confidence === 'Medium' ? '#C2410C' : '#71717A',
          ),
        }),
      ),
      missing: [
        'No unified GTM data layer',
        'No conversation intelligence',
        'Sales engagement split across two tools',
      ],
      notifsOpen: s.notifsOpen,
      toggleNotifs: () =>
        this.setState(
          this.closeAll({
            notifsOpen: !s.notifsOpen,
          }),
        ),
      notifications: [
        {
          text: 'Enrichment run paused — 0 credits remaining',
          time: '12m ago',
          dot: '#DC2626',
        },
        {
          text: 'Acme opened a VP Sales role — 4th signal in 7 days',
          time: '2h ago',
          dot: '#EA580C',
        },
        {
          text: 'RevenueFlow raised a $28M Series B',
          time: '5h ago',
          dot: '#22A15D',
        },
      ],
      settingsOpen: s.settingsOpen,
      toggleSettings: () =>
        this.setState(
          this.closeAll({
            settingsOpen: !s.settingsOpen,
          }),
        ),
      settings: [
        ['AI model', ['Outmate GTM v3', 'Outmate GTM v2', 'Fast']],
        ['Search depth', ['Deep', 'Standard']],
        ['Signal freshness', ['7 days', '24 hours', '30 days']],
        ['Default geography', ['North America', 'Europe', 'Global']],
        ['Row height', ['Compact', 'Standard']],
        ['Credit confirmation', ['On', 'Off']],
        ['Automatic enrichment', ['Off', 'On']],
        ['Suggested questions', ['On', 'Off']],
      ].map((x) => {
        const cur = s.settingsVals[x[0]] || x[1][0]
        return {
          label: x[0],
          value: cur,
          valStyle:
            'font-size:11px; font-weight:600; color:' +
            (cur === 'Off' ? '#A1A1AA' : '#3F3F46') +
            '; background:#F4F4F6; border-radius:5px; padding:2px 7px',
          cycle: () =>
            this.setState((st) => ({
              settingsVals: Object.assign({}, st.settingsVals, {
                [x[0]]: x[1][(x[1].indexOf(cur) + 1) % x[1].length],
              }),
            })),
        }
      }),
      likeColor: s.like === 1 ? '#6D28D9' : '#A1A1AA',
      dislikeColor: s.like === -1 ? '#B91C1C' : '#A1A1AA',
      like: () =>
        this.setState({
          like: s.like === 1 ? 0 : 1,
        }),
      dislike: () =>
        this.setState({
          like: s.like === -1 ? 0 : -1,
        }),
      copyLabel: s.copied ? 'Copied' : 'Copy',
      copy: () => {
        this.setState({
          copied: true,
        })
        this.setTimeout(
          () =>
            this.setState({
              copied: false,
            }),
          1400,
        )
      },
      regenLabel: s.regen ? 'Regenerating…' : 'Regenerate',
      regenerate: () => {
        this.setState({
          regen: true,
        })
        this.setTimeout(
          () =>
            this.setState({
              regen: false,
            }),
          1600,
        )
      },
      share: () =>
        this.setState(
          this.closeAll({
            shareOpen: true,
          }),
        ),
      followUps: [
        [
          'Show me the highest-intent 10 accounts',
          {
            sheet: 'Target Companies',
            filters: ['High intent'],
            sort: 'Intent score',
            sortDir: 'desc',
          },
          'Table sorted by intent — 5 accounts above 80',
        ],
        [
          'Find decision-makers at these companies',
          {
            sheet: 'Leaders',
          },
          'Leaders sheet populated — 112 people',
        ],
        [
          'Show me their social buying signals',
          {
            sheet: 'Signals',
            filters: [],
          },
          'Signals sheet — 642 records',
        ],
        [
          'Find companies replacing Salesforce',
          {
            sheet: 'Target Companies',
            filters: ['Competitor'],
          },
          'Filtered to competitor-research signals',
        ],
        [
          'Find companies hiring VP Sales',
          {
            sheet: 'Target Companies',
            filters: ['Hiring'],
          },
          'Filtered to hiring signals',
        ],
        [
          'Show recently funded accounts',
          {
            sheet: 'Target Companies',
            filters: ['Recently funded'],
          },
          'Filtered to recently funded accounts',
        ],
      ].map((f) => ({
        text: f[0],
        pick: () => {
          this.setState(
            this.closeAll(
              Object.assign(
                {
                  view: 'table',
                  activeView: '',
                },
                f[1],
              ),
            ),
          )
          this.flash(f[2])
        },
      })),
      draft: s.draft,
      onInput: (e) =>
        this.setState({
          draft: e.target.value,
        }),
      send: () => {
        const t = s.draft.trim()
        if (!t) return
        const l = t.toLowerCase(),
          patch = {
            draft: '',
            view: 'table',
            activeView: '',
          }
        let msg = 'Sent to ' + s.agent
        if (/leader|decision|people|contact/.test(l)) {
          patch.sheet = 'Leaders'
          msg = 'Leaders sheet opened'
        } else if (/signal|intent activity/.test(l)) {
          patch.sheet = 'Signals'
          msg = 'Signals sheet opened'
        } else if (/hiring|vp sales/.test(l)) {
          patch.sheet = 'Target Companies'
          patch.filters = ['Hiring']
          msg = 'Filtered to hiring signals'
        } else if (/fund|series|raise/.test(l)) {
          patch.sheet = 'Target Companies'
          patch.filters = ['Recently funded']
          msg = 'Filtered to recently funded'
        } else if (/highest|high intent|top account/.test(l)) {
          patch.sheet = 'Target Companies'
          patch.filters = ['High intent']
          patch.sort = 'Intent score'
          patch.sortDir = 'desc'
          msg = 'Sorted by intent score'
        } else if (/qualif/.test(l)) {
          patch.sheet = 'Target Companies'
          patch.filters = ['Qualified']
          msg = 'Filtered to qualified accounts'
        }
        this.setState(this.closeAll(patch))
        this.flash(msg)
      },
      voiceMode: s.voice,
      typingMode: !s.voice,
      startVoice: () =>
        this.setState({
          voice: true,
        }),
      cancelVoice: () =>
        this.setState({
          voice: false,
        }),
      useVoice: () =>
        this.setState({
          voice: false,
          draft: 'Which accounts should I contact today?',
        }),
      micColor: s.voice ? '#DC2626' : '#71717A',
      waveBars: Array.from(
        {
          length: 28,
        },
        (_, i) => ({
          dur: (0.6 + ((i * 7) % 9) / 12).toFixed(2) + 's',
          delay: ((i % 11) * 0.07).toFixed(2) + 's',
        }),
      ),
      hasAttachment: s.attachment,
      addAttachment: () =>
        this.setState({
          attachment: true,
        }),
      clearAttachment: () =>
        this.setState({
          attachment: false,
        }),
      sendBg: s.draft.trim() ? '#6D28D9' : '#C4C4CB',
      composerRadius: credits < 1000 ? '0 0 9px 9px' : '9px',
      gridCells: Array.from(
        {
          length: 16,
        },
        (_, i) => i,
      ),
      bubbles: C.map((c) => {
        const size = 24 + c.signals.length * 8
        return {
          logo: c.logo,
          x: 5 + (c.intent - 45) * 1.7 + '%',
          y: 5 + (c.icp - 62) * 2.4 + '%',
          size: size + 'px',
          off: -size / 2 + 'px',
          bg: c.logoBg,
          opacity: c.last.indexOf('h') > -1 ? '0.95' : '0.55',
          title: c.name + ' · intent ' + c.intent + ' · ICP ' + c.icp + '%',
          open: () => pick(c.name),
        }
      }),
      toast: !!s.toast,
      toastText: s.toast,
    }
  }
}
