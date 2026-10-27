// @ts-nocheck — logic preserved verbatim from the design export.
import { ModelBase } from '../../lib/model'
const ACCOUNTS = [
  {
    name: 'Acme',
    initials: 'AC',
    fit: 92,
    intent: 94,
    fresh: 98,
    signals: 7,
    score: 96,
    latest: 'VP Sales hired 2h ago',
    types: ['Hiring', 'Website', 'Funding', 'Social', 'Intent', 'High Intent'],
  },
  {
    name: 'Loop',
    initials: 'LP',
    fit: 94,
    intent: 70,
    fresh: 88,
    signals: 6,
    score: 92,
    latest: 'Pricing page visited 6 times',
    types: ['Website', 'Intent', 'High Intent'],
  },
  {
    name: 'SaaSly',
    initials: 'SA',
    fit: 84,
    intent: 88,
    fresh: 90,
    signals: 5,
    score: 91,
    latest: '$15M Series A announced',
    types: ['Funding', 'Hiring', 'High Intent'],
  },
  {
    name: 'RevenueFlow',
    initials: 'RF',
    fit: 88,
    intent: 76,
    fresh: 70,
    signals: 4,
    score: 86,
    latest: 'Salesforce removed from stack',
    types: ['Tech Stack', 'Competitor'],
  },
  {
    name: 'ScaleOps',
    initials: 'SO',
    fit: 58,
    intent: 82,
    fresh: 80,
    signals: 4,
    score: 81,
    latest: 'RevOps hiring surge',
    types: ['Hiring', 'Product Usage'],
  },
  {
    name: 'CloudBase',
    initials: 'CB',
    fit: 72,
    intent: 64,
    fresh: 55,
    signals: 3,
    score: 74,
    latest: 'Docs visited 3 sessions',
    types: ['Website', 'Product Usage'],
  },
  {
    name: 'DataPilot',
    initials: 'DP',
    fit: 80,
    intent: 48,
    fresh: 40,
    signals: 3,
    score: 68,
    latest: 'Founder posted on GTM scaling',
    types: ['Social', 'Community'],
  },
  {
    name: 'GrowthStack',
    initials: 'GS',
    fit: 46,
    intent: 38,
    fresh: 35,
    signals: 2,
    score: 52,
    latest: 'Comparison page visit',
    types: ['Website'],
  },
  {
    name: 'Vertex',
    initials: 'VX',
    fit: 36,
    intent: 58,
    fresh: 30,
    signals: 2,
    score: 48,
    latest: 'Mentioned in RevOps community',
    types: ['Community'],
  },
  {
    name: 'Northwind',
    initials: 'NW',
    fit: 30,
    intent: 26,
    fresh: 25,
    signals: 1,
    score: 34,
    latest: 'Blog subscription',
    types: ['Website'],
  },
]
const FEED = [
  {
    id: 1,
    company: 'Acme',
    initials: 'AC',
    type: 'Hiring',
    tag: '🔥 High intent',
    hot: true,
    meta: 'Hiring signal · LinkedIn',
    time: '2h ago',
    headline: 'VP Sales joined Acme',
    insight:
      'Acme is expanding its GTM leadership. Combined with four pricing-page visits in 24h, this suggests an active evaluation of its revenue stack.',
    recommend: 'Research Sarah Chen and map her previous GTM stack before outreach.',
    impact: 'High',
  },
  {
    id: 2,
    company: 'Acme',
    initials: 'AC',
    type: 'Website',
    tag: 'Website',
    meta: 'Website visitors · Outmate pixel',
    time: '5h ago',
    headline: 'Acme visited your pricing page 4 times in 24h',
    badges: [
      {
        label: 'Pricing ×4',
      },
      {
        label: 'Comparison ×1',
      },
      {
        label: '3 unique visitors',
      },
    ],
    insight:
      'Repeat pricing sessions from three distinct visitors indicate a buying committee forming rather than casual research.',
    recommend: 'Trigger a pricing-context sequence to the RevOps and Sales personas.',
    impact: 'High',
  },
  {
    id: 3,
    company: 'SaaSly',
    initials: 'SA',
    type: 'Funding',
    tag: 'Funding',
    meta: 'Funding signal · Crunchbase',
    time: '3 days ago',
    headline: 'SaaSly raised $18M Series B',
    insight:
      'Likely increasing GTM investment. Series B rounds typically precede a 2–3× expansion of sales headcount within two quarters.',
    recommend: 'Reach the CRO with a capacity-planning angle while budget is being allocated.',
    impact: 'High',
  },
  {
    id: 4,
    company: 'RevenueFlow',
    initials: 'RF',
    type: 'Tech Stack',
    tag: 'Tech stack',
    meta: 'Technology change · BuiltWith',
    time: '8 days ago',
    headline: 'RevenueFlow removed Salesforce',
    badges: [
      {
        label: '− Salesforce',
        neg: true,
      },
      {
        label: '+ HubSpot',
        pos: true,
      },
      {
        label: '+ Outreach',
        pos: true,
      },
    ],
    insight:
      'Potential CRM replacement window. Teams migrating CRM re-evaluate adjacent GTM tooling within the same cycle.',
    recommend: 'Send the migration playbook and offer a stack audit.',
    impact: 'High',
  },
  {
    id: 5,
    company: 'Acme',
    initials: 'SC',
    type: 'Social',
    tag: 'Social',
    meta: 'Sarah Chen · VP Sales · LinkedIn',
    time: '3h ago',
    headline: 'Post about GTM operating model',
    quote: '"We need to rethink how our GTM team operates as we scale."',
    badges: [
      {
        label: '42 reactions',
      },
      {
        label: '8 comments',
      },
    ],
    insight:
      'Strong pain / change signal from the economic buyer, published within days of joining.',
    recommend: 'Comment with a relevant benchmark, then follow with a short note.',
    impact: 'High',
  },
  {
    id: 6,
    company: 'Vertex',
    initials: 'VX',
    type: 'Community',
    tag: 'Community',
    meta: 'Revenue Operations Community · Slack',
    time: 'Yesterday',
    headline: 'Vertex employee asked for stack alternatives',
    quote: '"Looking for alternatives to our current sales stack."',
    insight:
      'Potential active evaluation. Community requests usually surface 2–4 weeks before a formal vendor shortlist.',
    recommend: 'Warm-intro via the community rather than cold outbound.',
    impact: 'Medium',
  },
  {
    id: 7,
    company: 'Beta',
    initials: 'BE',
    type: 'Competitor',
    tag: 'Competitor',
    meta: 'Competitor activity · Public pricing',
    time: '2 days ago',
    headline: 'Competitor increased pricing by 18%',
    insight:
      'Existing customers may be evaluating alternatives. 6 tracked accounts run this vendor on annual renewals in Q4.',
    recommend: 'Launch a switch campaign to the 6 affected accounts.',
    impact: 'Medium',
  },
  {
    id: 8,
    company: 'ScaleOps',
    initials: 'SO',
    type: 'Intent',
    tag: 'Intent',
    meta: 'Research intent · Multiple web sources',
    time: 'Today',
    headline: 'Researching "sales automation", "CRM consolidation", "AI SDR"',
    badges: [
      {
        label: 'Intent strength 91/100',
      },
      {
        label: '4 sources',
      },
    ],
    insight:
      'Topic cluster matches the consolidation narrative; usage on their trial workspace grew 3× week over week.',
    recommend: 'Prioritise for today\u2019s outbound with an AI SDR comparison.',
    impact: 'High',
  },
]
const CHIPS = [
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
]
const DRAWER = {
  whyNow:
    'Acme recently hired a VP Sales, raised $18M and has returned to your pricing page multiple times. These signals indicate a potentially active GTM evaluation.',
  timeline: [
    {
      when: '2h ago',
      title: 'VP Sales hired',
      source: 'LinkedIn · Hiring',
      hot: true,
    },
    {
      when: '5h ago',
      title: 'Pricing page visited 4 times',
      source: 'Website · Outmate pixel',
      hot: true,
    },
    {
      when: 'Yesterday',
      title: 'Founder posted about GTM scaling',
      source: 'LinkedIn · Social',
    },
    {
      when: '3 days ago',
      title: '$18M Series B',
      source: 'Crunchbase · Funding',
    },
    {
      when: '8 days ago',
      title: 'Added new sales technology',
      source: 'BuiltWith · Tech stack',
    },
  ],
  people: [
    {
      initials: 'SC',
      name: 'Sarah Chen',
      role: 'VP Sales',
      seniority: 'Executive',
      intent: 89,
      activity: 'Posted about GTM operating model 3h ago · viewed pricing twice',
    },
    {
      initials: 'JM',
      name: 'John Miller',
      role: 'RevOps Director',
      seniority: 'Director',
      intent: 81,
      activity: 'Visited docs and integrations pages this week',
    },
    {
      initials: 'MR',
      name: 'Michael Ross',
      role: 'Founder',
      seniority: 'Founder',
      intent: 74,
      activity: 'Engaged with two competitor comparison posts',
    },
  ],
  stack: [
    {
      category: 'CRM',
      tool: 'HubSpot',
    },
    {
      category: 'Sales engagement',
      tool: 'Outreach',
    },
    {
      category: 'Data',
      tool: 'Clay',
    },
    {
      category: 'Analytics',
      tool: 'Segment',
    },
  ],
  recs: [
    {
      rank: '01',
      title: 'Contact Sarah Chen',
      reason: 'New VP Sales + 94 intent score',
    },
    {
      rank: '02',
      title: 'Research Acme\u2019s CRM migration',
      reason: 'Salesforce recently removed',
    },
    {
      rank: '03',
      title: 'Send personalized outreach',
      reason: '5 high-intent signals detected in 7 days',
    },
  ],
}
const ANSWERS = {
  'Which accounts should I contact today?': {
    summary: '17 accounts require attention. Top 5:',
    rows: [
      {
        rank: '01',
        name: 'Acme',
        score: 96,
        why: 'VP Sales hired + pricing visits',
      },
      {
        rank: '02',
        name: 'Beta',
        score: 94,
        why: '$15M funding + hiring',
      },
      {
        rank: '03',
        name: 'Gamma',
        score: 91,
        why: 'Salesforce removed + competitor research',
      },
      {
        rank: '04',
        name: 'Delta',
        score: 89,
        why: 'Founder social signal + website intent',
      },
      {
        rank: '05',
        name: 'ScaleOps',
        score: 87,
        why: 'RevOps hiring + product research',
      },
    ],
  },
}
const MIX = [
  {
    label: 'Website',
    value: 184,
    pct: 100,
  },
  {
    label: 'Social',
    value: 142,
    pct: 78,
  },
  {
    label: 'Hiring',
    value: 96,
    pct: 53,
  },
  {
    label: 'Tech stack',
    value: 71,
    pct: 39,
  },
  {
    label: 'Funding',
    value: 58,
    pct: 32,
  },
  {
    label: 'Community',
    value: 44,
    pct: 24,
  },
  {
    label: 'Competitor',
    value: 31,
    pct: 17,
  },
  {
    label: 'Product usage',
    value: 16,
    pct: 9,
  },
]
export /** Generated from the Claude Design export; logic preserved verbatim.*/
class RadarModel extends ModelBase {
  state = {
    filters: ['All Signals'],
    weight: 'Intent',
    range: '7 days',
    hoverName: null,
    selectedName: null,
    query: '',
    answerKey: null,
  }
  chipStyle(active) {
    return (
      'height:27px; padding:0 11px; border-radius:8px; font-family:inherit; font-size:12px; font-weight:500; cursor:pointer; border:1px solid ' +
      (active
        ? '#C4B5FD; background:#F5F3FF; color:#5B21B6'
        : '#E5E7EB; background:#FFFFFF; color:#52525B')
    )
  }
  smallStyle(active) {
    return (
      'height:25px; padding:0 10px; border-radius:7px; font-family:inherit; font-size:11.5px; font-weight:500; cursor:pointer; border:1px solid ' +
      (active
        ? '#C4B5FD; background:#F5F3FF; color:#5B21B6'
        : '#E5E7EB; background:#FFFFFF; color:#71717A')
    )
  }
  zoneOf(a) {
    if (a.intent >= 60 && a.fit >= 60) return 'Act now'
    if (a.intent >= 60) return 'High intent'
    if (a.fit >= 60) return 'Watch'
    return 'Low priority'
  }
  activeFilters() {
    const f = this.state.filters
    return f.length === 0 || f.indexOf('All Signals') > -1 ? null : f
  }
  toggleFilter(label) {
    this.setState((s) => {
      if (label === 'All Signals')
        return {
          filters: ['All Signals'],
        }
      let f = s.filters.filter((x) => x !== 'All Signals')
      f = f.indexOf(label) > -1 ? f.filter((x) => x !== label) : f.concat([label])
      return {
        filters: f.length ? f : ['All Signals'],
      }
    })
  }
  renderVals() {
    const st = this.state
    const act = this.activeFilters()
    const weight = st.weight
    const chips = CHIPS.map((label) => ({
      label,
      style: this.chipStyle(st.filters.indexOf(label) > -1),
      onClick: () => this.toggleFilter(label),
    }))
    const weights = ['ICP Fit', 'Intent', 'Freshness'].map((label) => ({
      label,
      style: this.smallStyle(weight === label),
      onClick: () =>
        this.setState({
          weight: label,
        }),
    }))
    const ranges = ['Today', '7 days', '30 days'].map((label) => ({
      label,
      style: this.smallStyle(st.range === label),
      onClick: () =>
        this.setState({
          range: label,
        }),
    }))
    const bubbles = ACCOUNTS.map((a) => {
      const zone = this.zoneOf(a)
      const match = !act || a.types.some((t) => act.indexOf(t) > -1)
      const size =
        12 +
        a.signals * 3.6 +
        (weight === 'ICP Fit' ? a.fit / 22 : weight === 'Freshness' ? a.fresh / 22 : a.intent / 22)
      const hot = zone === 'Act now'
      const alpha = (0.28 + (a.fresh / 100) * 0.62) * (match ? 1 : 0.18)
      const bg = hot
        ? 'rgba(109,40,217,' + alpha + ')'
        : zone === 'Low priority'
          ? 'rgba(161,161,170,' + alpha * 0.7 + ')'
          : 'rgba(139,92,246,' + alpha * 0.75 + ')'
      const hovered = st.hoverName === a.name
      return {
        name: a.name,
        wrapStyle:
          'position:absolute; left:' +
          (3 + a.intent * 0.9) +
          '%; bottom:' +
          (5 + a.fit * 0.84) +
          '%; transform:translate(-50%,50%); display:flex; flex-direction:column; align-items:center; gap:4px; cursor:pointer; z-index:' +
          (hovered ? 6 : 2),
        dotStyle:
          'width:' +
          size +
          'px; height:' +
          size +
          'px; border-radius:50%; background:' +
          bg +
          '; border:1.5px solid ' +
          (hot ? '#6D28D9' : zone === 'Low priority' ? '#D4D4D8' : '#C4B5FD') +
          '; box-shadow:' +
          (hovered ? '0 0 0 6px rgba(124,58,237,0.12)' : 'none') +
          '; transition:box-shadow .15s ease',
        labelStyle:
          'font-size:10.5px; font-weight:' +
          (hot ? '600' : '500') +
          '; color:' +
          (match ? (hot ? '#5B21B6' : '#52525B') : '#D4D4D8') +
          '; white-space:nowrap',
        onEnter: () =>
          this.setState({
            hoverName: a.name,
          }),
        onLeave: () =>
          this.setState({
            hoverName: null,
          }),
        onClick: () =>
          this.setState({
            selectedName: a.name,
            hoverName: null,
          }),
      }
    })
    let hover = null
    const ha = ACCOUNTS.find((a) => a.name === st.hoverName)
    if (ha) {
      const right = ha.intent > 55
      const top = ha.fit > 55
      hover = {
        name: ha.name.toUpperCase(),
        zone: this.zoneOf(ha),
        fit: ha.fit,
        intent: ha.intent,
        fresh: ha.fresh,
        signals: ha.signals,
        latest: ha.latest,
        tipStyle:
          'position:absolute; width:262px; padding:11px 12px; background:#FFFFFF; border:1px solid #E5E7EB; border-radius:11px; box-shadow:0 12px 32px rgba(24,24,27,0.12); z-index:9; pointer-events:none; ' +
          (right
            ? 'right:' + (100 - (3 + ha.intent * 0.9)) + '%; margin-right:18px;'
            : 'left:' + (3 + ha.intent * 0.9) + '%; margin-left:18px;') +
          (top
            ? 'top:' + (100 - (5 + ha.fit * 0.84)) + '%;'
            : 'bottom:' + (5 + ha.fit * 0.84) + '%;'),
      }
    }
    const feed = FEED.filter(
      (s) => !act || act.indexOf(s.type) > -1 || (act.indexOf('High Intent') > -1 && s.hot),
    ).map((s) => ({
      company: s.company,
      initials: s.initials,
      meta: s.meta,
      time: s.time,
      headline: s.headline,
      quote: s.quote,
      insight: s.insight,
      recommend: s.recommend,
      impact: s.impact.toUpperCase(),
      tag: s.tag,
      cardStyle:
        'padding:15px 16px; border-bottom:1px solid #F1F1F3; background:' +
        (s.hot ? '#FDFCFF' : '#FFFFFF'),
      avatarStyle:
        'width:34px; height:34px; border-radius:9px; flex:none; display:flex; align-items:center; justify-content:center; font-size:11.5px; font-weight:700; background:' +
        (s.hot ? '#F5F3FF' : '#F4F4F5') +
        '; color:' +
        (s.hot ? '#6D28D9' : '#52525B'),
      tagStyle:
        'font-size:10px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; border-radius:5px; padding:2px 7px; ' +
        (s.hot ? 'background:#F5F3FF; color:#6D28D9' : 'background:#F4F4F5; color:#71717A'),
      impactStyle:
        "font-family:'IBM Plex Mono',monospace; font-size:10.5px; font-weight:600; letter-spacing:0.05em; border-radius:5px; padding:2px 6px; " +
        (s.impact === 'High'
          ? 'background:#F5F3FF; color:#6D28D9'
          : 'background:#F4F4F5; color:#71717A'),
      badges: s.badges
        ? s.badges.map((b) => ({
            label: b.label,
            style:
              'font-size:11px; font-weight:500; border-radius:6px; padding:3px 8px; border:1px solid ' +
              (b.pos
                ? '#BBF7D0; background:#F0FDF4; color:#15803D'
                : b.neg
                  ? '#FECACA; background:#FEF2F2; color:#B91C1C'
                  : '#E5E7EB; background:#FAFAFA; color:#52525B'),
          }))
        : null,
      onOpen: () =>
        this.setState({
          selectedName: ACCOUNTS.some((a) => a.name === s.company) ? s.company : 'Acme',
        }),
    }))
    const prompts = [
      'Which accounts should I contact today?',
      'Show companies hiring VP Sales.',
      'Find accounts replacing Salesforce.',
      'Who showed buying intent this week?',
      'Why is Acme high intent?',
      'Find accounts with 3+ signals.',
      'Show me social buying signals.',
      'Find companies researching AI SDRs.',
    ].map((label) => ({
      label,
      onClick: () =>
        this.setState({
          query: label,
          answerKey: 'Which accounts should I contact today?',
        }),
    }))
    const ak = st.answerKey
    const answer = ak
      ? {
          question: st.query || ak,
          summary: ANSWERS[ak].summary,
          rows: ANSWERS[ak].rows.map((r) => ({
            rank: r.rank,
            name: r.name,
            score: r.score,
            why: r.why,
            onClick: () =>
              this.setState({
                selectedName: ACCOUNTS.some((a) => a.name === r.name) ? r.name : 'Acme',
              }),
          })),
        }
      : null
    const sa = ACCOUNTS.find((a) => a.name === st.selectedName)
    const selected = sa
      ? {
          name: sa.name,
          initials: sa.initials,
          zone: this.zoneOf(sa),
          fit: sa.fit,
          intent: sa.intent,
          fresh: sa.fresh,
          score: sa.score,
          whyNow:
            sa.name === 'Acme'
              ? DRAWER.whyNow
              : sa.name +
                ' shows ' +
                sa.signals +
                ' signals in the last 7 days, led by: ' +
                sa.latest +
                '. Fit and intent both sit in the ' +
                this.zoneOf(sa).toLowerCase() +
                ' band.',
          timeline: DRAWER.timeline.map((t) => ({
            when: t.when,
            title: t.title,
            source: t.source,
            dotStyle:
              'position:absolute; left:-4.5px; top:5px; width:8px; height:8px; border-radius:50%; background:' +
              (t.hot ? '#7C3AED' : '#D4D4D8') +
              '; border:2px solid #FFFFFF',
          })),
          people: DRAWER.people,
          stack: DRAWER.stack,
          recs: DRAWER.recs,
        }
      : null
    return {
      chips,
      weights,
      ranges,
      bubbles,
      hover,
      feed,
      prompts,
      answer,
      selected,
      feedCount: feed.length,
      query: st.query,
      showZoneLabels: this.props.showZoneLabels !== false,
      showAiInsight: this.props.showAiInsights !== false,
      mix: MIX.map((m) => ({
        label: m.label,
        value: m.value,
        barStyle:
          'width:' +
          m.pct +
          '%; height:100%; border-radius:4px; background:' +
          (m.pct > 50 ? '#8B5CF6' : '#C4B5FD'),
      })),
      onQueryChange: (e) =>
        this.setState({
          query: e.target.value,
        }),
      onQueryKey: (e) => {
        if (e.key === 'Enter')
          this.setState({
            answerKey: 'Which accounts should I contact today?',
          })
      },
      closeDrawer: () =>
        this.setState({
          selectedName: null,
        }),
    }
  }
}
