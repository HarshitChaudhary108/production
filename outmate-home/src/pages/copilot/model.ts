// @ts-nocheck — logic preserved verbatim from the design export.
import { ModelBase } from '../../lib/model'
const COMPANIES = [
  {
    name: 'Acme',
    domain: 'acme.io',
    size: '240 emp',
    logo: 'A',
    logoBg: '#1E293B',
    city: 'Austin, TX',
    industry: 'B2B SaaS',
    person: 'Sarah Chen',
    initials: 'SC',
    avBg: '#E4E7F5',
    role: 'VP Sales',
    email: 'sarah@acme.io',
    status: 'Verified',
    signals: [
      ['Hiring', 'hot'],
      ['Website', 'web'],
      ['Competitor', 'soc'],
    ],
    icp: 92,
    intent: 87,
    fresh: '2h ago',
    crm: 'HubSpot',
    gap: 'No unified GTM layer',
    qual: 'Qualified',
    tags: ['high', 'hiring', 'competitor', 'qualified'],
    insight:
      'Acme is showing 4 independent buying signals in the last 7 days, including a VP Sales hire and repeat pricing-page visits after researching Salesforce alternatives.',
    rec: 'Research Sarah Chen and map her previous GTM stack before outreach.',
  },
  {
    name: 'RevenueFlow',
    domain: 'revenueflow.com',
    size: '410 emp',
    logo: 'R',
    logoBg: '#6D28D9',
    city: 'Denver, CO',
    industry: 'B2B SaaS',
    person: 'David Kim',
    initials: 'DK',
    avBg: '#F0E6DC',
    role: 'CRO',
    email: 'david@revenueflow.com',
    status: 'Verified',
    signals: [
      ['Funding', 'money'],
      ['Social', 'soc'],
    ],
    icp: 89,
    intent: 84,
    fresh: '5h ago',
    crm: 'Salesforce',
    gap: 'Fragmented data',
    qual: 'Qualified',
    tags: ['high', 'funded', 'social', 'qualified'],
    insight:
      'RevenueFlow closed a $28M Series B three days ago and its CRO is publicly discussing revenue-stack consolidation.',
    rec: 'Lead with post-funding GTM scale-up; reference the Series B in the first touch.',
  },
  {
    name: 'Northwind Labs',
    domain: 'northwind.dev',
    size: '120 emp',
    logo: 'N',
    logoBg: '#0F766E',
    city: 'Toronto, ON',
    industry: 'DevTools',
    person: 'Priya Raman',
    initials: 'PR',
    avBg: '#E7F0EA',
    role: 'RevOps Lead',
    email: 'priya@northwind.dev',
    status: 'Verified',
    signals: [
      ['Competitor', 'soc'],
      ['Website', 'web'],
    ],
    icp: 86,
    intent: 79,
    fresh: '1d ago',
    crm: 'HubSpot',
    gap: 'Missing conversation intelligence',
    qual: 'Qualified',
    tags: ['high', 'competitor', 'qualified'],
    insight:
      'Northwind visited the pricing page four times this week while its RevOps lead compared alternatives in a public forum.',
    rec: 'Send the RevOps migration teardown; the evaluation window is open now.',
  },
  {
    name: 'Loop Systems',
    domain: 'loopsys.io',
    size: '85 emp',
    logo: 'L',
    logoBg: '#B45309',
    city: 'Manchester, UK',
    industry: 'B2B SaaS',
    person: 'Marcus Webb',
    initials: 'MW',
    avBg: '#F3E8E4',
    role: 'Head of Sales',
    email: 'marcus@loopsys.io',
    status: 'Guessed',
    signals: [['Hiring', 'hot']],
    icp: 71,
    intent: 58,
    fresh: '3h ago',
    crm: 'None',
    gap: 'Missing sales engagement',
    qual: 'Review',
    tags: ['hiring'],
    insight:
      'Loop Systems opened two sales roles but has no CRM fingerprint detected — likely early in building its GTM motion.',
    rec: 'Nurture; revisit once a CRM is detected in the stack.',
  },
  {
    name: 'Cadence HQ',
    domain: 'cadence.so',
    size: '320 emp',
    logo: 'C',
    logoBg: '#1D4ED8',
    city: 'Berlin, DE',
    industry: 'FinOps',
    person: 'Ana Torres',
    initials: 'AT',
    avBg: '#E8E4F3',
    role: 'VP RevOps',
    email: 'ana@cadence.so',
    status: 'Verified',
    signals: [
      ['Tech stack', 'soc'],
      ['Funding', 'money'],
      ['Website', 'web'],
    ],
    icp: 90,
    intent: 82,
    fresh: '6h ago',
    crm: 'Salesforce',
    gap: 'Fragmented data',
    qual: 'Qualified',
    tags: ['high', 'funded', 'qualified'],
    insight:
      'Cadence added three point tools in the last quarter and is showing repeat intent on integration documentation.',
    rec: 'Position consolidation ROI against their three new point tools.',
  },
  {
    name: 'Brightpath',
    domain: 'brightpath.ai',
    size: '150 emp',
    logo: 'B',
    logoBg: '#BE185D',
    city: 'Boston, MA',
    industry: 'AI / SaaS',
    person: 'Tom Iyer',
    initials: 'TI',
    avBg: '#EDE7DE',
    role: 'CEO',
    email: 'tom@brightpath.ai',
    status: 'Catch-all',
    signals: [
      ['Social', 'soc'],
      ['Website', 'web'],
    ],
    icp: 77,
    intent: 64,
    fresh: '9h ago',
    crm: 'HubSpot',
    gap: 'Missing conversation intelligence',
    qual: 'Review',
    tags: ['social'],
    insight:
      'Brightpath’s CEO is active in GTM tooling threads, but firmographic fit is moderate for the current ICP.',
    rec: 'Warm the CEO through social engagement before a direct ask.',
  },
]
const ALL_COLUMNS = [
  ['check', '', '34px'],
  ['company', 'Company', '206px'],
  ['person', 'Primary contact', '168px'],
  ['email', 'Work email', '212px'],
  ['signals', 'Signals', '212px'],
  ['icp', 'ICP fit', '86px'],
  ['intent', 'Intent', '86px'],
  ['fresh', 'Freshness', '92px'],
  ['crm', 'CRM', '90px'],
  ['gap', 'GTM gap', '196px'],
  ['qual', 'Qualification', '108px'],
  ['actions', 'Actions', '96px'],
]
export /** Generated from the Claude Design export; logic preserved verbatim.*/
class CopilotModel extends ModelBase {
  state = {
    view: 'copilot',
    expanded: false,
    sheet: 'Target Companies',
    filter: 'All companies',
    sort: 'Intent score',
    hiddenCols: [],
    selectedRows: ['Acme'],
    selectedCompany: 'Acme',
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
    topUp: true,
    credits: 120,
    draft: '',
    convSearch: '',
    rowSearch: '',
    convTitle: 'B2B SaaS · HubSpot & Salesforce gap',
    toast: '',
    settingsVals: {},
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
      1600,
    )
  }
  pill(bg, fg) {
    return (
      'display:inline-flex; align-items:center; gap:4px; padding:2px 7px; border-radius:5px; font-size:10.5px; font-weight:600; white-space:nowrap; background:' +
      bg +
      '; color:' +
      fg
    )
  }
  chip(on) {
    return (
      'padding:3px 9px; border-radius:6px; font-size:11px; cursor:pointer; white-space:nowrap; user-select:none; ' +
      (on
        ? 'background:#F1EDFC; border:1px solid #C9B6F5; color:#5B21B6; font-weight:600'
        : 'background:#FFFFFF; border:1px solid #E8E8EC; color:#71717A; font-weight:500')
    )
  }
  closeAll(extra) {
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
      },
      extra || {},
    )
  }
  renderVals() {
    const s = this.state,
      credits = s.credits
    const sel = COMPANIES.find((c) => c.name === s.selectedCompany)
    const visible = ALL_COLUMNS.filter((c) => s.hiddenCols.indexOf(c[0]) === -1)
    const filterMap = {
      'All companies': () => true,
      'High intent': (c) => c.intent >= 80,
      'Recently funded': (c) => c.tags.includes('funded'),
      Hiring: (c) => c.tags.includes('hiring'),
      Social: (c) => c.tags.includes('social'),
      Competitor: (c) => c.tags.includes('competitor'),
      Qualified: (c) => c.qual === 'Qualified',
    }
    const sorters = {
      'Intent score': (a, b) => b.intent - a.intent,
      'ICP fit': (a, b) => b.icp - a.icp,
      'Company name': (a, b) => a.name.localeCompare(b.name),
      Freshness: (a, b) => a.fresh.localeCompare(b.fresh),
    }
    const q = s.rowSearch.trim().toLowerCase()
    const filtered = COMPANIES.filter(filterMap[s.filter])
      .filter((c) => !q || (c.name + c.domain + c.person + c.role).toLowerCase().includes(q))
      .slice()
      .sort(sorters[s.sort])
    const sigStyle = (kind) =>
      this.pill(
        kind === 'hot'
          ? '#FEF2F2'
          : kind === 'web'
            ? '#EFF6FF'
            : kind === 'money'
              ? '#ECFDF3'
              : '#F5F3FF',
        kind === 'hot'
          ? '#B91C1C'
          : kind === 'web'
            ? '#1D4ED8'
            : kind === 'money'
              ? '#15803D'
              : '#6D28D9',
      )
    const statusStyle = (st) =>
      this.pill(
        st === 'Verified' ? '#ECFDF3' : st === 'Guessed' ? '#FFF8F1' : '#F4F4F6',
        st === 'Verified' ? '#15803D' : st === 'Guessed' ? '#C2410C' : '#71717A',
      )
    const qualStyle = (v) =>
      this.pill(
        v === 'Qualified' ? '#ECFDF3' : v === 'Review' ? '#FFF8F1' : '#F4F4F6',
        v === 'Qualified' ? '#15803D' : v === 'Review' ? '#C2410C' : '#71717A',
      )
    const selectCompany = (name) =>
      this.setState(
        this.closeAll({
          selectedCompany: name,
          contextOpen: true,
        }),
      )
    const cellFor = (kind, c) => {
      const base = {
        isCheck: false,
        isCompany: false,
        isPerson: false,
        isEmail: false,
        isSignals: false,
        isScore: false,
        isText: false,
        isBadge: false,
        isActions: false,
      }
      if (kind === 'check') {
        const on = s.selectedRows.indexOf(c.name) > -1
        return Object.assign(base, {
          isCheck: true,
          check: on ? '✓' : '',
          boxBg: on ? '#6D28D9' : '#FFFFFF',
          boxBorder: on ? '#6D28D9' : '#D4D4D8',
          toggle: (e) => {
            if (e && e.stopPropagation) e.stopPropagation()
            this.setState((st) => ({
              selectedRows: on
                ? st.selectedRows.filter((x) => x !== c.name)
                : st.selectedRows.concat(c.name),
            }))
          },
        })
      }
      if (kind === 'company')
        return Object.assign(base, {
          isCompany: true,
          logo: c.logo,
          logoBg: c.logoBg,
          name: c.name,
          domain: c.domain,
          size: c.size,
        })
      if (kind === 'person')
        return Object.assign(base, {
          isPerson: true,
          initials: c.initials,
          avBg: c.avBg,
          name: c.person,
          role: c.role,
        })
      if (kind === 'email')
        return Object.assign(base, {
          isEmail: true,
          value: c.email,
          status: c.status,
          statusStyle: statusStyle(c.status),
        })
      if (kind === 'signals')
        return Object.assign(base, {
          isSignals: true,
          list: c.signals.map((x) => ({
            label: x[0],
            style: sigStyle(x[1]),
          })),
        })
      if (kind === 'icp')
        return Object.assign(base, {
          isScore: true,
          value: c.icp + '%',
          pct: c.icp + '%',
          color: c.icp >= 85 ? '#15803D' : c.icp >= 75 ? '#C2410C' : '#71717A',
        })
      if (kind === 'intent')
        return Object.assign(base, {
          isScore: true,
          value: String(c.intent),
          pct: c.intent + '%',
          color: c.intent >= 80 ? '#15803D' : c.intent >= 65 ? '#C2410C' : '#71717A',
        })
      if (kind === 'fresh')
        return Object.assign(base, {
          isText: true,
          value: c.fresh,
          color: '#A1A1AA',
        })
      if (kind === 'crm')
        return Object.assign(base, {
          isText: true,
          value: c.crm,
          color: c.crm === 'None' ? '#A1A1AA' : '#52525B',
        })
      if (kind === 'gap')
        return Object.assign(base, {
          isText: true,
          value: c.gap,
          color: '#52525B',
        })
      if (kind === 'qual')
        return Object.assign(base, {
          isBadge: true,
          value: c.qual,
          badgeStyle: qualStyle(c.qual),
        })
      return Object.assign(base, {
        isActions: true,
        preview: (e) => {
          if (e && e.stopPropagation) e.stopPropagation()
          selectCompany(c.name)
        },
        enrich: (e) => {
          if (e && e.stopPropagation) e.stopPropagation()
          this.setState({
            creditsOpen: true,
          })
        },
        add: (e) => {
          if (e && e.stopPropagation) e.stopPropagation()
          this.flash(c.name + ' added to target list')
        },
      })
    }
    const tabNames = ['Overview', 'Signals', 'People', 'Social', 'Tech Stack']
    const tabStyle = (n) =>
      'padding:8px 9px; font-size:11.5px; cursor:pointer; white-space:nowrap; ' +
      (s.tab === n
        ? 'font-weight:650; color:#18181B; border-bottom:2px solid #6D28D9'
        : 'font-weight:500; color:#8E8E96; border-bottom:2px solid transparent')
    const sheetStyle = (n) =>
      'display:flex; align-items:center; gap:6px; padding:8px 10px; font-size:11.5px; cursor:pointer; ' +
      (s.sheet === n
        ? 'font-weight:650; color:#18181B; border-bottom:2px solid #6D28D9'
        : 'font-weight:500; color:#8E8E96; border-bottom:2px solid transparent')
    const modeTab = (on) =>
      'display:flex; align-items:center; gap:6px; padding:5px 10px; border-radius:6px; font-size:12.5px; cursor:pointer; ' +
      (on
        ? 'background:#FFFFFF; box-shadow:0 1px 2px rgba(24,24,27,.07); font-weight:600; color:#18181B'
        : 'font-weight:500; color:#71717A')
    return {
      isCopilot: s.view === 'copilot',
      isRadar: s.view === 'radar',
      goCopilot: () =>
        this.setState(
          this.closeAll({
            view: 'copilot',
          }),
        ),
      goRadar: () =>
        this.setState(
          this.closeAll({
            view: 'radar',
            expanded: false,
          }),
        ),
      copilotTabStyle: modeTab(s.view === 'copilot'),
      radarTabStyle: modeTab(s.view === 'radar'),
      convTitle: s.convTitle,
      showSidebar: !s.expanded,
      showChat: !s.expanded,
      expanded: s.expanded,
      scrollPad: s.expanded ? '14px 18px 14px' : '20px 22px 8px',
      colWidth: s.expanded ? '100%' : '800px',
      toggleExpand: () =>
        this.setState(
          this.closeAll({
            expanded: !s.expanded,
            contextOpen: s.expanded ? true : false,
          }),
        ),
      collapseTable: () =>
        this.setState({
          expanded: false,
          contextOpen: true,
        }),
      expandLabel: s.expanded ? 'Collapse table' : 'View full table →',
      creditsNum: credits.toLocaleString(),
      creditsLabel: credits.toLocaleString() + ' credits',
      creditsWarn: credits <= 500,
      creditsColor: credits <= 500 ? '#C2410C' : '#18181B',
      creditBg: credits <= 500 ? '#FFF8F1' : '#FFFFFF',
      creditBorder: credits <= 500 ? '#FED7AA' : '#E8E8EC',
      creditFg: credits <= 500 ? '#C2410C' : '#3F3F46',
      afterRun: credits >= 420 ? (credits - 420).toLocaleString() : '—',
      afterColor: credits >= 420 ? '#18181B' : '#C2410C',
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
          credits: 5120,
          creditsOpen: false,
          topUp: false,
        })
        this.flash('5,000 credits added')
      },
      usage: [
        {
          label: 'Company enrichment — 5 / company',
          cost: '120',
        },
        {
          label: 'People enrichment — 4 / contact',
          cost: '180',
        },
        {
          label: 'Email verification — 3 / contact',
          cost: '80',
        },
        {
          label: 'Signal research — 4 / company',
          cost: '40',
        },
      ],
      showTopUpCard: s.topUp && credits < 420,
      dismissTopUp: () =>
        this.setState({
          topUp: false,
        }),
      agent: s.agent,
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
        ['Outmate Agent', 'OA', 'General GTM copilot across Radar', '#EDE9FE', '#5B21B6'],
        ['Research Agent', 'RA', 'Deep company and market research', '#E0F2FE', '#0369A1'],
        ['Enrichment Agent', 'EA', 'Emails, firmographics, tech stack', '#DCFCE7', '#15803D'],
        ['GTM Analyst', 'GA', 'Pipeline, ICP fit and scoring', '#FEF3C7', '#B45309'],
        ['Prospecting Agent', 'PA', 'People discovery and outreach lists', '#FCE7F3', '#BE185D'],
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
        ['Find work emails', '3/contact'],
        ['Analyze GTM signals', '4/company'],
        ['Research social', '4/company'],
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
        ['Company enrichment', '5 / company'],
        ['Find work emails', '3 / contact'],
        ['Social signals', '4 / company'],
        ['Decision-maker mapping', '24 / account'],
      ].map((e) => ({
        label: e[0],
        cost: e[1],
        pick: () =>
          this.setState(
            this.closeAll({
              creditsOpen: true,
            }),
          ),
      })),
      settingsOpen: s.settingsOpen,
      toggleSettings: () =>
        this.setState(
          this.closeAll({
            settingsOpen: !s.settingsOpen,
          }),
        ),
      settings: [
        ['AI model', ['Outmate GTM v3', 'Outmate GTM v2', 'Fast']],
        ['Search depth', ['Deep', 'Standard', 'Shallow']],
        ['Signal freshness', ['7 days', '24 hours', '30 days', '90 days']],
        ['Default geography', ['North America', 'Europe', 'Global']],
        ['Default employee range', ['100–500', '50–100', '500+']],
        ['Credit confirmation', ['On', 'Off']],
        ['Automatic enrichment', ['Off', 'On']],
        ['Show suggested questions', ['On', 'Off']],
      ].map((x) => {
        const cur = s.settingsVals[x[0]] || x[1][0]
        return {
          label: x[0],
          value: cur,
          valStyle:
            'font-size:11.5px; font-weight:600; color:' +
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
      notifsOpen: s.notifsOpen,
      toggleNotifs: () =>
        this.setState(
          this.closeAll({
            notifsOpen: !s.notifsOpen,
          }),
        ),
      notifications: [
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
        {
          text: 'Enrichment run paused — credits exhausted',
          time: '12m ago',
          dot: '#DC2626',
        },
      ],
      contextOpen: s.contextOpen && !s.expanded,
      toggleContext: () =>
        this.setState({
          contextOpen: !s.contextOpen,
        }),
      noSelection: !sel,
      hasSelectedCompany: !!sel,
      recentAccounts: COMPANIES.slice(0, 4).map((c) => ({
        name: c.name,
        logo: c.logo,
        logoBg: c.logoBg,
        meta: c.domain + ' · ' + c.fresh,
        intent: String(c.intent),
        open: () => selectCompany(c.name),
      })),
      tabs: tabNames.map((n) => ({
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
            meta: sel.domain + ' · ' + sel.industry + ' · ' + sel.size + ' · ' + sel.city,
            intentLabel: sel.intent >= 80 ? 'HIGH INTENT' : 'MEDIUM INTENT',
            intentBadge: this.pill(
              sel.intent >= 80 ? '#ECFDF3' : '#FFF8F1',
              sel.intent >= 80 ? '#15803D' : '#C2410C',
            ),
            icpPct: sel.icp + '%',
            insight: sel.insight,
            recommendation: sel.rec,
            gap: sel.gap,
          }
        : {},
      gtmRows: sel
        ? [
            {
              label: 'ICP fit',
              value: sel.icp + '% — ' + (sel.icp >= 85 ? 'Strong' : 'Moderate'),
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
              value: sel.fresh,
              color: '#18181B',
            },
            {
              label: 'Buying stage',
              value: sel.intent >= 80 ? 'Evaluating' : 'Awareness',
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
          cost: '—',
          pick: () => this.flash('Outreach sequence drafted'),
        },
        {
          label: 'Add to target list',
          cost: 'Free',
          pick: () => this.flash(sel ? sel.name + ' added to target list' : ''),
        },
      ],
      stack: [
        {
          name: 'HubSpot',
          dot: '#EA580C',
        },
        {
          name: 'Snowflake',
          dot: '#0EA5E9',
        },
        {
          name: 'Segment',
          dot: '#22A15D',
        },
        {
          name: 'Outreach',
          dot: '#6D28D9',
        },
        {
          name: 'Metabase',
          dot: '#1D4ED8',
        },
        {
          name: 'Zendesk',
          dot: '#15803D',
        },
      ],
      missing: [
        'No unified GTM data layer',
        'No conversation intelligence',
        'Sales engagement fragmented across two tools',
      ],
      signalCards: [
        [
          '🔥',
          'Hiring',
          'Strong',
          'VP Sales joined Acme — Austin, TX',
          'LinkedIn',
          '2h ago',
          'High confidence',
          'GTM leadership expansion usually precedes a stack review.',
        ],
        [
          '🌐',
          'Website intent',
          'Strong',
          'Four pricing-page visits in 24 hours',
          'Website',
          '6h ago',
          'High confidence',
          'Repeat pricing visits indicate active evaluation.',
        ],
        [
          '🏆',
          'Competitor',
          'Medium',
          'Comparing Salesforce alternatives in a public thread',
          'Reddit',
          '1d ago',
          'Medium confidence',
          'Named competitor research means a live shortlist.',
        ],
        [
          '💰',
          'Funding',
          'Strong',
          'Series B — $28M led by Redpoint',
          'Crunchbase',
          '3d ago',
          'High confidence',
          'New capital typically unlocks GTM tooling budget.',
        ],
        [
          '💬',
          'Social',
          'Medium',
          'CEO posting about RevOps tooling consolidation',
          'LinkedIn',
          '5h ago',
          'Medium confidence',
          'Public intent from an economic buyer.',
        ],
        [
          '⚙',
          'Tech stack',
          'Weak',
          'Added Segment; no unified GTM data layer detected',
          'BuiltWith',
          '2w ago',
          'Low confidence',
          'Stack gap matches our core wedge.',
        ],
      ].map((x) => ({
        icon: x[0],
        type: x[1],
        strength: x[2],
        detail: x[3],
        source: x[4],
        time: x[5],
        confidence: x[6],
        why: x[7],
        strengthStyle: this.pill(
          x[2] === 'Strong' ? '#ECFDF3' : x[2] === 'Medium' ? '#FFF8F1' : '#F4F4F6',
          x[2] === 'Strong' ? '#15803D' : x[2] === 'Medium' ? '#C2410C' : '#71717A',
        ),
        confColor: x[6][0] === 'H' ? '#15803D' : x[6][0] === 'M' ? '#C2410C' : '#A1A1AA',
      })),
      people: [
        [
          'Sarah Chen',
          'SC',
          '#E4E7F5',
          'VP Sales',
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
        email: p[4],
        badge: p[5],
        badgeStyle: this.pill(p[6], p[7]),
      })),
      social: [
        {
          platform: 'LinkedIn',
          time: '5h ago',
          text: '“We are consolidating six GTM tools into one data layer this quarter. Recommendations welcome.”',
          author: 'Daniel Ortiz · CRO at Acme',
        },
        {
          platform: 'Reddit · r/RevOps',
          time: '1d ago',
          text: 'Thread comparing Salesforce and lighter-weight alternatives for a 240-person SaaS team.',
          author: 'Account domain matched',
        },
        {
          platform: 'LinkedIn',
          time: '2d ago',
          text: 'Acme announced a VP Sales search covering North America expansion.',
          author: 'Company page',
        },
        {
          platform: 'Community',
          time: '4d ago',
          text: 'Two engineers active in the Segment community asking about warehouse-native enrichment.',
          author: 'Matched by work email domain',
        },
      ],
      historyToday: [
        ['B2B SaaS · HubSpot & Salesforce gap', '42 accounts · running', true, true],
        ['Find high-intent SaaS accounts', '18 accounts', false, false],
        ['Companies hiring VP Sales', '27 accounts', false, false],
        ['Salesforce replacement signals', '9 accounts', false, false],
      ]
        .filter((h) => !s.convSearch || h[0].toLowerCase().includes(s.convSearch.toLowerCase()))
        .map((h) => ({
          title: h[0],
          meta: h[1],
          running: h[2],
          bar: s.convTitle === h[0] ? '#6D28D9' : 'transparent',
          bg: s.convTitle === h[0] ? '#F3F0FB' : 'transparent',
          weight: s.convTitle === h[0] ? '650' : '500',
          color: s.convTitle === h[0] ? '#18181B' : '#52525B',
          menuOpen: s.menuFor === h[0],
          open: () =>
            this.setState(
              this.closeAll({
                convTitle: h[0],
                view: 'copilot',
              }),
            ),
          menu: (e) => {
            if (e && e.stopPropagation) e.stopPropagation()
            this.setState({
              menuFor: s.menuFor === h[0] ? null : h[0],
            })
          },
          closeMenu: (e) => {
            if (e && e.stopPropagation) e.stopPropagation()
            this.setState({
              menuFor: null,
            })
          },
        })),
      historyYesterday: [
        ['Q3 target account research', '64 accounts'],
        ['RevOps leadership search', '112 people'],
      ].map((h) => ({
        title: h[0],
        meta: h[1],
        bar: s.convTitle === h[0] ? '#6D28D9' : 'transparent',
        bg: s.convTitle === h[0] ? '#F3F0FB' : 'transparent',
        weight: s.convTitle === h[0] ? '650' : '500',
        color: s.convTitle === h[0] ? '#18181B' : '#52525B',
        open: () =>
          this.setState(
            this.closeAll({
              convTitle: h[0],
              view: 'copilot',
            }),
          ),
      })),
      todayCount: '4',
      convSearch: s.convSearch,
      onSearchConv: (e) =>
        this.setState({
          convSearch: e.target.value,
        }),
      newChat: () =>
        this.setState(
          this.closeAll({
            convTitle: 'New conversation',
            draft: '',
          }),
        ),
      reasons: [
        'Two or more independent intent signals within the last 7 days',
        'Recent GTM hiring — VP Sales, RevOps or Sales Ops roles opened',
        'CRM present (HubSpot or Salesforce) with no unified GTM data layer',
        'Firmographic ICP fit above 85% on size, region and category',
      ],
      overview: [
        {
          value: '42',
          label: 'qualifying accounts',
        },
        {
          value: '18',
          label: 'website intent',
        },
        {
          value: '11',
          label: 'hiring sales leadership',
        },
        {
          value: '$2.4M',
          label: 'estimated pipeline',
        },
      ],
      tableTitle: s.sheet,
      tableCount:
        s.sheet === 'Target Companies'
          ? '42 rows · ' + filtered.length + ' shown'
          : s.sheet === 'Leaders'
            ? '112 people · 6 shown'
            : '642 signals · 8 shown',
      sheetTabs: [
        ['Target Companies', '42'],
        ['Leaders', '112'],
        ['Signals', '642'],
      ].map((t) => ({
        name: t[0],
        count: t[1],
        style: sheetStyle(t[0]),
        pick: () =>
          this.setState(
            this.closeAll({
              sheet: t[0],
            }),
          ),
      })),
      sheetCompanies: s.sheet === 'Target Companies',
      sheetLeaders: s.sheet === 'Leaders',
      sheetSignals: s.sheet === 'Signals',
      gridCols: visible.map((c) => c[2]).join(' '),
      tableMinWidth: visible.reduce((a, c) => a + parseInt(c[2], 10), 0) + 'px',
      headCells: visible.map((c) => ({
        label: c[1],
      })),
      rows: filtered.map((c) => ({
        cells: visible.map((v) => cellFor(v[0], c)),
        rowBg: s.selectedCompany === c.name ? '#FBFAFF' : '#FFFFFF',
        open: () => selectCompany(c.name),
      })),
      columnToggles: ALL_COLUMNS.filter((c) => c[0] !== 'check' && c[0] !== 'company').map((c) => {
        const on = s.hiddenCols.indexOf(c[0]) === -1
        return {
          label: c[1],
          check: on ? '✓' : '',
          boxBg: on ? '#6D28D9' : '#FFFFFF',
          boxBorder: on ? '#6D28D9' : '#D4D4D8',
          pick: () =>
            this.setState((st) => ({
              hiddenCols: on ? st.hiddenCols.concat(c[0]) : st.hiddenCols.filter((x) => x !== c[0]),
            })),
        }
      }),
      hasSelection: s.selectedRows.length > 0,
      selectionLabel: s.selectedRows.length + ' selected',
      clearSelection: (e) => {
        if (e && e.stopPropagation) e.stopPropagation()
        this.setState({
          selectedRows: [],
        })
      },
      rowSearch: s.rowSearch,
      onRowSearch: (e) =>
        this.setState({
          rowSearch: e.target.value,
        }),
      filterOpen: s.filterOpen,
      sortOpen: s.sortOpen,
      columnsOpen: s.columnsOpen,
      toggleFilter: () =>
        this.setState(
          this.closeAll({
            filterOpen: !s.filterOpen,
          }),
        ),
      toggleSort: () =>
        this.setState(
          this.closeAll({
            sortOpen: !s.sortOpen,
          }),
        ),
      toggleColumns: () =>
        this.setState(
          this.closeAll({
            columnsOpen: !s.columnsOpen,
          }),
        ),
      filterBadge: s.filter === 'All companies' ? '' : '· 1',
      filterBtnStyle:
        'height:26px; padding:0 9px; border-radius:6px; font-size:11.5px; cursor:pointer; display:flex; align-items:center; gap:5px; ' +
        (s.filter === 'All companies'
          ? 'border:1px solid #E4E4E8; background:#FFFFFF; color:#3F3F46'
          : 'border:1px solid #C9B6F5; background:#F5F1FD; color:#5B21B6; font-weight:600'),
      sortLabel: 'Sort · ' + s.sort,
      filters: Object.keys(filterMap).map((k) => ({
        label: k,
        count: String(COMPANIES.filter(filterMap[k]).length),
        color: s.filter === k ? '#5B21B6' : '#3F3F46',
        weight: s.filter === k ? '650' : '500',
        pick: () =>
          this.setState({
            filter: k,
            filterOpen: false,
          }),
      })),
      sorts: Object.keys(sorters).map((k) => ({
        label: k,
        check: s.sort === k ? '✓' : '',
        color: s.sort === k ? '#5B21B6' : '#3F3F46',
        weight: s.sort === k ? '650' : '500',
        pick: () =>
          this.setState({
            sort: k,
            sortOpen: false,
          }),
      })),
      quickChips: Object.keys(filterMap).map((k) => ({
        label: k,
        style: this.chip(s.filter === k),
        pick: () =>
          this.setState({
            filter: k,
          }),
      })),
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
      enrich: () =>
        this.setState(
          this.closeAll({
            creditsOpen: true,
          }),
        ),
      runPanelOpen: s.runPanelOpen,
      toggleRunPanel: () =>
        this.setState(
          this.closeAll({
            runPanelOpen: !s.runPanelOpen,
          }),
        ),
      runSteps: [
        ['Website enrichment', '✓', '118 completed'],
        ['LinkedIn signals', '✓', '96 completed'],
        ['Decision-makers', '⟳', '74 running'],
        ['Social signals', '○', '76 queued'],
      ].map((x, i) => ({
        label: x[0],
        icon: x[1],
        meta: x[2],
        iconColor: i < 2 ? '#22A15D' : i === 2 ? '#6D28D9' : '#C4C4CB',
        color: i < 3 ? '#3F3F46' : '#A1A1AA',
        weight: i === 2 ? '600' : '500',
      })),
      leaderCols: ['Person', 'Title', 'Company', 'Work email', 'Persona', 'Last active'],
      leaders: COMPANIES.map((c) => ({
        name: c.person,
        initials: c.initials,
        bg: c.avBg,
        title: c.role,
        company: c.name,
        logo: c.logo,
        logoBg: c.logoBg,
        email: c.email,
        status: c.status,
        statusStyle: statusStyle(c.status),
        active: c.fresh,
        seniority: c.role === 'CEO' || c.role === 'CRO' ? 'C-level' : 'VP / Director',
        persona: c.role.includes('RevOps')
          ? 'Technical'
          : c.role === 'CEO' || c.role === 'CRO'
            ? 'Economic'
            : 'Champion',
        roleStyle: this.pill(
          c.role.includes('RevOps')
            ? '#EFF6FF'
            : c.role === 'CEO' || c.role === 'CRO'
              ? '#F5F3FF'
              : '#ECFDF3',
          c.role.includes('RevOps')
            ? '#1D4ED8'
            : c.role === 'CEO' || c.role === 'CRO'
              ? '#6D28D9'
              : '#15803D',
        ),
        open: () => selectCompany(c.name),
      })),
      signalCols: ['Company', 'Signal', 'Detail', 'Source', 'Detected', 'Confidence'],
      signalRows: [
        ['Acme', '🔥', 'Hiring', 'VP Sales joined — Austin, TX', 'LinkedIn', '2h ago', 'High'],
        [
          'Acme',
          '🌐',
          'Website intent',
          'Four pricing-page visits in 24h',
          'Website',
          '6h ago',
          'High',
        ],
        [
          'RevenueFlow',
          '💰',
          'Funding',
          'Series B — $28M led by Redpoint',
          'Crunchbase',
          '3d ago',
          'High',
        ],
        [
          'RevenueFlow',
          '💬',
          'Social',
          'CRO posting on stack consolidation',
          'LinkedIn',
          '5h ago',
          'Medium',
        ],
        [
          'Northwind Labs',
          '🏆',
          'Competitor',
          'Comparing Salesforce alternatives',
          'Reddit',
          '1d ago',
          'Medium',
        ],
        [
          'Cadence HQ',
          '⚙',
          'Tech stack',
          'Added three point tools this quarter',
          'BuiltWith',
          '2d ago',
          'Medium',
        ],
        [
          'Loop Systems',
          '🔥',
          'Hiring',
          'Two AE roles opened in EMEA',
          'Greenhouse',
          '3h ago',
          'High',
        ],
        [
          'Brightpath',
          '👥',
          'Community',
          'Engineers asking about enrichment APIs',
          'Segment forum',
          '4d ago',
          'Low',
        ],
      ].map((x) => {
        const c = COMPANIES.find((k) => k.name === x[0])
        return {
          company: x[0],
          logo: c.logo,
          logoBg: c.logoBg,
          icon: x[1],
          type: x[2],
          detail: x[3],
          source: x[4],
          time: x[5],
          conf: x[6],
          confStyle: this.pill(
            x[6] === 'High' ? '#ECFDF3' : x[6] === 'Medium' ? '#FFF8F1' : '#F4F4F6',
            x[6] === 'High' ? '#15803D' : x[6] === 'Medium' ? '#C2410C' : '#71717A',
          ),
          open: () => selectCompany(x[0]),
        }
      }),
      radarFilters: [
        'All Signals',
        'High Intent',
        'Website',
        'Funding',
        'Hiring',
        'Tech Stack',
        'Competitor',
        'Social',
        'Community',
        'Product Usage',
        'Intent',
      ].map((k) => ({
        label: k,
        style: this.chip(s.filter === k || (k === 'All Signals' && s.filter === 'All companies')),
        pick: () =>
          this.setState({
            filter: k === 'All Signals' ? 'All companies' : filterMap[k] ? k : s.filter,
          }),
      })),
      gridCells: Array.from(
        {
          length: 16,
        },
        (_, i) => i,
      ),
      bubbles: COMPANIES.map((c) => {
        const size = 26 + c.signals.length * 9
        return {
          logo: c.logo,
          x: 6 + (c.intent - 50) * 1.7 + '%',
          y: 6 + (c.icp - 60) * 2.1 + '%',
          size: size + 'px',
          off: -size / 2 + 'px',
          bg: c.logoBg,
          border: '#FFFFFF',
          fg: '#FFFFFF',
          opacity: c.fresh.indexOf('h') > -1 ? '0.95' : '0.6',
          title: c.name + ' · intent ' + c.intent + ' · ICP ' + c.icp + '%',
          open: () => selectCompany(c.name),
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
      followUps: [
        'Show me the highest-intent 10 accounts',
        'Find decision-makers at these companies',
        'Show me their social buying signals',
        'Which accounts are researching competitors?',
        'Create an outreach list from these accounts',
      ].map((text) => ({
        text,
        pick: () => {
          this.setState({
            draft: text,
          })
          this.flash('Sent to Copilot')
        },
      })),
      draft: s.draft,
      onInput: (e) =>
        this.setState({
          draft: e.target.value,
        }),
      send: () => {
        if (s.draft.trim()) {
          this.setState({
            draft: '',
          })
          this.flash('Request sent to ' + s.agent)
        }
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
      useVoice: () => {
        this.setState({
          voice: false,
          draft: 'Which accounts should I contact today?',
        })
      },
      micColor: s.voice ? '#DC2626' : '#71717A',
      waveBars: Array.from(
        {
          length: 44,
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
      composerRadius: credits <= 500 ? '0 0 10px 10px' : '10px',
      composerMargin: credits <= 500 ? '0' : '12px',
      toast: !!s.toast,
      toastText: s.toast,
    }
  }
}
