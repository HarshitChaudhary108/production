// @ts-nocheck — logic preserved verbatim from the design export.
import { ModelBase } from '../../lib/model'

const NAV = [
  ['', [['Home', 'M3.8 9L10 4l6.2 5v6.5h-4.4v-4h-3.6v4H3.8z']]],
  [
    'Workspace',
    [
      ['Projects', 'M3.5 6.5h5l1.5 2h6.5v7h-13z'],
      ['Templates', 'M3.5 4.5h13v4h-13zM3.5 11h6v4.5h-6zM11 11h5.5v4.5H11z'],
      ['Recent research', 'M10 5v5l3.5 2M10 3.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13z'],
      ['Saved lists', 'M6 3.5h8v13l-4-3-4 3z'],
      ['Revenue Radar', 'M3.5 12.5l3-5 3 3 3-6 4 8'],
      ['Copilot', 'M4.5 4.5h11v8.5h-6.5l-4.5 3.5z'],
    ],
  ],
  [
    'Configure',
    [
      ['Integrations', 'M7 3.5v3M13 3.5v3M5 6.5h10v4a5 5 0 01-10 0zM10 15.5v1'],
      ['Skills', 'M10 3.5l6 3v7l-6 3-6-3v-7zM10 9.5V16M4 6.5l6 3 6-3'],
      ['API keys', 'M12.5 4.5a3.5 3.5 0 11-3.3 4.6L4 14.3V16h1.7l.9-.9M13 7h.01'],
      ['Usage', 'M4 16V9M8 16V5M12 16v-5M16 16V7'],
    ],
  ],
]
const SRC = { cb: ['cb', '#0B66C3'], bw: ['bw', '#166534'], zi: ['zi', '#DC2626'], gh: ['gh', '#7C2D5A'], hs: ['hs', '#EA580C'], li: ['in', '#0A66C2'] }
const IC = {
  news: 'M6 3.5h5l3 3v10H6zM11 3.5v3h3M8 10h4M8 12.5h4',
  rocket: 'M11.6 4.4c2.4-1 4 .6 3 3-.7 1.8-2.6 3.8-5 5.2l-2.6-2.6C8.2 7.4 10 5.3 11.6 4.4zM7 12.9L5.6 15.4 4.5 14.3 7 12.9z',
  monitor: 'M3.5 4.5h13v8.5h-13zM8 15.5h4M10 13v2.5',
  building: 'M5 16.5V4.5h6v12M11 8.5h4v8M7 7h2M7 10h2M7 13h2',
  brief: 'M3.5 7.5h13v8h-13zM7.5 7.5V5.5h5v2M3.5 11h13',
  people: 'M7.5 9.5a2.2 2.2 0 100-4.4 2.2 2.2 0 000 4.4zM3.5 16c0-2.2 1.8-3.6 4-3.6s4 1.4 4 3.6M13.2 6.2a2 2 0 010 4M14 12.6c1.6.3 2.6 1.5 2.6 3.4',
  globe: 'M10 3.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM3.5 10h13M10 3.5c2 2 2 11 0 13M10 3.5c-2 2-2 11 0 13',
  chart: 'M4 16V9M8 16V5M12 16v-5M16 16V7',
  tag: 'M4.5 9.5l5-5h6v6l-5 5zM12.5 7.5h.01',
  doc: 'M5 3.5h10v13H5zM7.5 7h5M7.5 10h5M7.5 13h3',
  spark: 'M3.5 12.5l3-5 3 3 3-6 4 8',
  box: 'M10 3.5l6 3v7l-6 3-6-3v-7zM10 9.5V16M4 6.5l6 3 6-3',
}
const ENRICH = [
  ['Company latest funding', "Find the company's latest funding round.", 3, IC.rocket, 'cb', 91],
  ['Website tech stack', 'Identify technologies the company runs on.', 6, IC.monitor, 'bw', 84],
  ['Company revenue', "Find the company's estimated revenue.", 2, IC.building, 'zi', 78],
  ['Company job openings', 'Find current GTM job openings.', 3, IC.brief, 'gh', 74],
  ['Company news', 'Find the latest relevant company news.', 3, IC.news, '', 96],
  ['LinkedIn profile highlights', 'Extract noteworthy details from the company profile.', 4, IC.people, 'li', 66],
  ['Find company social profiles', "Find the company's social accounts.", 2, IC.globe, '', 52],
  ['Company GTM strategy analysis', "Analyze the company's go-to-market motion.", 5, IC.chart, '', 61],
  ['Company core values', "Find the company's stated core values.", 3, IC.doc, '', 34],
  ['Check free trial', 'Check whether a free trial or freemium tier exists.', 2, IC.tag, '', 40],
  ['Company snapshot', 'Return a one-line company snapshot.', 5, IC.doc, '', 58],
  ['Find decision makers', 'Find the buying committee at each company.', 20, IC.people, '', 99],
]
const WORKFLOWS = [
  ['Find ICP accounts', 'Find companies matching your ideal customer profile.', 'Accounts', 2, IC.building, '1h ago'],
  ['Find decision makers', 'Find VP Sales, RevOps and other buying stakeholders.', 'People', 20, IC.people, '20h ago'],
  ['Find high-intent accounts', 'Find companies showing recent buying signals.', 'Signals', 4, IC.spark, '2h ago'],
  ['Find recently funded companies', 'Find companies that raised in the last 90 days.', 'Signals', 3, IC.rocket, '1d ago'],
  ['Find companies hiring', 'Find companies hiring roles that signal intent.', 'Signals', 3, IC.brief, '3d ago'],
  ['Competitor research', 'Analyze competitors, customers and positioning.', 'Research', 5, IC.chart, '4d ago'],
  ['GTM gap analysis', 'Find companies with missing GTM capabilities.', 'GTM', 5, IC.box, '1h ago'],
  ['Account intelligence', 'Build a complete account snapshot.', 'Accounts', 8, IC.doc, '2d ago'],
  ['Build lead list', 'Build a qualified list with contacts and enrichment.', 'Lists', 25, 'M6 3.5h8v13l-4-3-4 3z', '6d ago'],
  ['Technology intelligence', 'Find companies using specific technologies.', 'Technology', 6, IC.monitor, '5d ago'],
  ['Company news monitoring', 'Track news mentions across your accounts.', 'Research', 3, IC.news, '12h ago'],
  ['Website technology analysis', 'Detect the stack behind each website.', 'Technology', 6, IC.monitor, '8d ago'],
  ['Company revenue intelligence', 'Estimate revenue and growth per account.', 'Research', 2, IC.building, '9d ago'],
  ['Social intelligence', 'Track posting and engagement signals.', 'Signals', 4, IC.globe, 'Never'],
  ['GTM strategy analysis', 'Analyze motion, gaps and recommended plays.', 'GTM', 5, IC.chart, '3d ago'],
]
const PROJECTS = [
  ['B2B SaaS GTM Platform Gap Analysis', 'Live', '400', '112', '642', '2,370', '2.4K', '1h ago', 'GTM Research', 'AK', '#EDE9FE', '#5B21B6'],
  ['RevOps leadership search', 'Complete', '24', '86', '41', '688', '0.7K', '20h ago', 'People Research', 'MS', '#DBEAFE', '#1D4ED8'],
  ['Series B MarTech accounts', 'Complete', '128', 'No leaders found', '302', '1,024', '1.1K', '1d ago', 'Funding Research', 'AK', '#EDE9FE', '#5B21B6'],
  ['Salesforce replacement signals', 'Paused', '64', '18', '190', '384', '0.4K', '3d ago', 'Signal Research', 'RT', '#DCFCE7', '#15803D'],
  ['Hiring-signal watchlist', 'Live', '212', '46', '498', '1,696', '1.8K', '4h ago', 'Signal Research', 'MS', '#DBEAFE', '#1D4ED8'],
  ['EMEA expansion shortlist', 'Draft', 'Not started', '—', '—', 'Skipped', '0', 'Never', 'Account Research', 'AK', '#EDE9FE', '#5B21B6'],
]
const LISTS = [
  ['High intent accounts', '42', '38', '186', '12 Aug', '1h ago', 'B2B SaaS GTM Platform Gap Analysis'],
  ['VP Sales prospects', 'Not applicable', '86', '41', '10 Aug', '20h ago', 'RevOps leadership search'],
  ['Recently funded SaaS', '128', '12', '302', '8 Aug', '1d ago', 'Series B MarTech accounts'],
  ['Salesforce replacement accounts', '64', '18', '190', '2 Aug', '3d ago', 'Salesforce replacement signals'],
  ['Companies hiring RevOps', '96', '24', '212', '28 Jul', '4h ago', 'Hiring-signal watchlist'],
  ['Priority outreach accounts', '18', '54', '92', '26 Jul', '2d ago', 'B2B SaaS GTM Platform Gap Analysis'],
]
const PAGES = {
  Integrations: {
    blurb: 'Connect your CRM and communication tools to improve research quality.',
    action: 'Request an integration',
    cards: [
      ['HubSpot', 'CRM — sync companies and contacts', 'hs', '#EA580C', 'Connected'],
      ['Salesforce', 'CRM — push qualified accounts', 'sf', '#0B66C3', 'Not connected'],
      ['Gmail', 'Send and track outreach', 'gm', '#DC2626', 'Not connected'],
      ['Slack', 'Signal alerts in your channels', 'sl', '#4A154B', 'Connected'],
      ['Google Sheets', 'Two-way sheet sync', 'gs', '#15803D', 'Not connected'],
      ['CSV', 'Import and export flat files', 'csv', '#52525B', 'Enabled'],
      ['API', 'Programmatic access to research', 'api', '#18181B', 'Enabled'],
      ['MCP', 'Model context protocol server', 'mcp', '#18181B', 'Not connected'],
      ['LinkedIn', 'Profile and activity research', 'in', '#0A66C2', 'Not connected'],
      ['Crunchbase', 'Funding and firmographics', 'cb', '#0B66C3', 'Connected'],
    ],
  },
  Skills: {
    blurb: 'Reusable research capabilities the copilot can call.',
    action: 'Create custom skill',
    cards: [
      ['Company research', 'Firmographics, description, category', 'CR', '#6D28D9', 'Enabled'],
      ['Lead research', 'Buying committee and contact discovery', 'LR', '#6D28D9', 'Enabled'],
      ['Funding research', 'Rounds, investors, amounts', 'FR', '#0B66C3', 'Enabled'],
      ['Hiring intelligence', 'Open roles and hiring velocity', 'HI', '#7C2D5A', 'Enabled'],
      ['Technology detection', 'Stack and vendor detection', 'TD', '#166534', 'Enabled'],
      ['Social intelligence', 'Posting and engagement signals', 'SI', '#0A66C2', 'Not enabled'],
      ['Competitive intelligence', 'Competitors and positioning', 'CI', '#C2410C', 'Not enabled'],
      ['GTM analysis', 'Motion, gaps and recommendations', 'GA', '#6D28D9', 'Enabled'],
      ['ICP classification', 'Fit scoring against your ICP', 'IC', '#15803D', 'Enabled'],
    ],
  },
  'API keys': {
    blurb: 'Programmatic access to research, sheets and enrichments.',
    action: 'Create key',
    grid: '1.2fr 1.4fr .8fr .9fr',
    cols: ['Name', 'Key', 'Scope', 'Last used'],
    rows: [
      ['Production', 'om_live_••••4c9f', 'Read / write', '12m ago'],
      ['Analytics read-only', 'om_live_••••81ad', 'Read', '2d ago'],
      ['Sandbox', 'om_test_••••55e2', 'Read / write', 'Never'],
    ],
  },
  Usage: {
    blurb: 'Credit consumption by enrichment over the current cycle.',
    action: 'Export usage',
    grid: '1.4fr .9fr .9fr .9fr',
    cols: ['Enrichment', 'Cells run', 'Credits', 'Share'],
    rows: [
      ['Find decision makers', '112', '2,240', '38%'],
      ['Website tech stack', '400', '2,400', '31%'],
      ['Company funding', '400', '1,200', '18%'],
      ['Work email finder', '186', '558', '9%'],
      ['Company revenue', '188', '376', '4%'],
    ],
  },
  Settings: {
    blurb: 'Workspace defaults for research, enrichment and billing.',
    action: 'Save changes',
    grid: '1.2fr 1.6fr .9fr',
    cols: ['Setting', 'Value', 'Scope'],
    rows: [
      ['Default agent', 'Outmate Agent', 'Workspace'],
      ['Search depth', 'Deep', 'Workspace'],
      ['Signal window', '7 days', 'Workspace'],
      ['Auto-enrich new rows', 'Off', 'Workspace'],
      ['Credit alert threshold', '1,000 credits', 'Billing'],
      ['Data residency', 'US', 'Organization'],
    ],
  },
}
const GTM: any[] = [
  ['Find lookalikes', 'Prospecting', 'Given a company domain, find similar companies by industry, company size, business model and ICP similarity.', 8, IC.building,
    ['Company', 'Domain', 'Industry', 'Similarity'],
    [['Coda', 'coda.io', 'Productivity', '95%'], ['Slite', 'slite.com', 'Knowledge', '89%'], ['Almanac', 'almanac.io', 'Docs & wiki', '84%'], ['Tettra', 'tettra.com', 'Knowledge', '72%']],
    ['Company domain', 'e.g. notion.so'],
    ['Identify company', 'Analyze industry', 'Analyze business model', 'Find similar companies', 'Calculate similarity', 'Enrich company details'],
    [['Company', 'Text', 'Outmate research', 'Included'], ['Domain', 'URL', 'Outmate research', 'Included'], ['Industry', 'Category', 'Outmate research', '~1 / row'], ['Similarity', 'Percent', 'Outmate model', '~2 / row'], ['Employees', 'Number', 'Crunchbase', '~2 / row'], ['ICP fit', 'Score', 'Your ICP', '~3 / row']],
    ['Company', 'Domain', 'Industry', 'Similarity', 'Employees', 'ICP fit'],
    [['Coda', 'coda.io', 'Productivity', '95%', '480', 'Strong'], ['Slite', 'slite.com', 'Knowledge', '89%', '92', 'Strong'], ['Almanac', 'almanac.io', 'Docs & wiki', '84%', '64', 'Medium'], ['Tettra', 'tettra.com', 'Knowledge', '72%', '38', 'Medium'], ['Guru', 'getguru.com', 'Knowledge', '68%', '310', 'Strong']],
    'Up to 50 companies'],
  ['Recently funded companies', 'Prospecting', 'Find companies that raised in the last 90 days and enrich them with round, investors and headcount.', 6, IC.rocket,
    ['Company', 'Raised', 'Industry', 'Employees'],
    [['RevenueFlow', '$34M B', 'GTM SaaS', '210'], ['Cadence HQ', '$46M C', 'RevOps', '340'], ['Osano', '$21M B', 'Privacy', '150'], ['HeadLight', '$11M A', 'MarTech', '72']],
    ['Funding window', 'Last 90 days'],
    ['Scan funding sources', 'Filter by round and geography', 'Match against ICP', 'Enrich firmographics', 'Attach investor list', 'Score priority'],
    [['Company', 'Text', 'Crunchbase', 'Included'], ['Raised', 'Currency', 'Crunchbase', '~2 / row'], ['Round', 'Category', 'Crunchbase', '~1 / row'], ['Investors', 'List', 'Crunchbase', '~2 / row'], ['Employees', 'Number', 'LinkedIn', '~1 / row'], ['ICP fit', 'Score', 'Your ICP', '~3 / row']],
    ['Company', 'Raised', 'Round', 'Investors', 'Employees', 'ICP fit'],
    [['RevenueFlow', '$34M', 'Series B', 'Accel, Emergence', '210', 'Strong'], ['Cadence HQ', '$46M', 'Series C', 'ICONIQ', '340', 'Strong'], ['Osano', '$21M', 'Series B', 'Jump Capital', '150', 'Medium'], ['HeadLight', '$11M', 'Series A', 'Bessemer', '72', 'Medium'], ['Brightpath', '$4M', 'Seed', 'Not detected', '24', 'Weak']],
    'Up to 200 companies'],
  ['LinkedIn post engagers', 'Prospecting', 'Find and enrich the people reacting to and commenting on a LinkedIn post.', 9, IC.people,
    ['Name', 'Company', 'Title', 'Email'],
    [['Sarah Chen', 'Acme', 'VP Sales', 'Verified'], ['David Kim', 'RevenueFlow', 'CRO', 'Verified'], ['Ana Torres', 'Cadence HQ', 'VP RevOps', 'Guessed'], ['Priya Raman', 'Northwind', 'RevOps lead', 'Not found']],
    ['LinkedIn post URL', 'Reactions and comments'],
    ['Collect engagers', 'Resolve person to company', 'Extract title and seniority', 'Match against ICP', 'Find work email', 'Verify deliverability'],
    [['Name', 'Text', 'LinkedIn', 'Included'], ['Company', 'Text', 'LinkedIn', 'Included'], ['Title', 'Text', 'LinkedIn', '~1 / row'], ['Seniority', 'Category', 'Outmate model', '~1 / row'], ['Email', 'Email', 'Waterfall', '~3 / row'], ['Verification', 'Status', 'Waterfall', '~1 / row']],
    ['Name', 'Company', 'Title', 'Seniority', 'Email', 'Verification'],
    [['Sarah Chen', 'Acme', 'VP Sales', 'VP', 'sarah@acme.io', 'Verified'], ['David Kim', 'RevenueFlow', 'CRO', 'C-level', 'dkim@revflow.com', 'Verified'], ['Ana Torres', 'Cadence HQ', 'VP RevOps', 'VP', 'ana@cadencehq.com', 'Risky'], ['Priya Raman', 'Northwind', 'RevOps lead', 'Manager', 'No data found', 'Not available'], ['Marcus Webb', 'Loop Systems', 'VP Sales', 'VP', 'mwebb@loop.io', 'Verified']],
    'Up to 300 people'],
  ['ICP account discovery', 'Prospecting', 'Find accounts matching your ideal customer profile across industry, size, region and stack.', 4, IC.box,
    ['Company', 'Employees', 'Industry', 'ICP fit'],
    [['Jonas Fitness', '320', 'B2B SaaS', '92'], ['Canidium', '180', 'Consulting', '81'], ['SP6', '95', 'B2B SaaS', '77'], ['SwiftSoft', '410', 'B2B SaaS', '69']],
    ['ICP definition', 'From workspace settings'],
    ['Read ICP definition', 'Search company universe', 'Filter by firmographics', 'Detect stack fit', 'Score ICP fit', 'Rank accounts'],
    [['Company', 'Text', 'Outmate research', 'Included'], ['Employees', 'Number', 'LinkedIn', '~1 / row'], ['Industry', 'Category', 'Outmate research', '~1 / row'], ['Region', 'Text', 'Outmate research', 'Included'], ['ICP fit', 'Score', 'Your ICP', '~2 / row'], ['Rationale', 'Text', 'Outmate model', '~2 / row']],
    ['Company', 'Employees', 'Industry', 'Region', 'ICP fit', 'Rationale'],
    [['Jonas Fitness', '320', 'B2B SaaS', 'US', '92', 'Stack and size match'], ['Canidium', '180', 'Consulting', 'US', '81', 'Adjacent segment'], ['SP6', '95', 'B2B SaaS', 'US', '77', 'Below size band'], ['SwiftSoft', '410', 'B2B SaaS', 'EU', '69', 'Region mismatch'], ['MEDIATRENZ', '60', 'Agency', 'US', '41', 'Weak fit']],
    'Up to 400 companies'],
  ['GTM gap analysis', 'Intelligence', 'Identify companies whose GTM stack is missing key capabilities, and the opportunity that creates.', 5, IC.chart,
    ['Company', 'GTM stack', 'Gap', 'Opportunity'],
    [['Acme', 'HubSpot', 'No RevOps', 'High'], ['SwiftSoft', 'Salesforce', 'No enrichment', 'High'], ['SP6', 'HubSpot', 'No signals', 'Medium'], ['Canidium', 'Not detected', 'No CRM', 'High']],
    ['Company list or domain', 'Accepts a saved list'],
    ['Detect GTM stack', 'Map capabilities', 'Compare against benchmark', 'Identify gaps', 'Estimate opportunity', 'Recommend plays'],
    [['Company', 'Text', 'Outmate research', 'Included'], ['GTM stack', 'List', 'BuiltWith', '~3 / row'], ['Gap', 'Text', 'Outmate model', '~2 / row'], ['Opportunity', 'Category', 'Outmate model', '~1 / row'], ['Recommended play', 'Text', 'Outmate model', '~2 / row'], ['Confidence', 'Percent', 'Outmate model', 'Included']],
    ['Company', 'GTM stack', 'Gap', 'Opportunity', 'Recommended play', 'Confidence'],
    [['Acme', 'HubSpot, Segment', 'No RevOps tooling', 'High', 'Lead with RevOps ROI', '88%'], ['SwiftSoft', 'Salesforce', 'No enrichment layer', 'High', 'Data quality angle', '84%'], ['SP6', 'HubSpot', 'No signal monitoring', 'Medium', 'Intent pilot', '71%'], ['Canidium', 'Not detected', 'No CRM detected', 'High', 'Foundational pitch', '62%'], ['MEDIATRENZ', 'Pipedrive', 'Skipped', 'Not applicable', 'Skipped', '—']],
    'Up to 400 companies'],
  ['Find decision makers', 'People', 'Find VP Sales, RevOps, Marketing and other decision makers at each account.', 20, IC.people,
    ['Name', 'Company', 'Title', 'Seniority'],
    [['Sarah Chen', 'Acme', 'VP Sales', 'VP'], ['David Kim', 'RevenueFlow', 'CRO', 'C-level'], ['Ana Torres', 'Cadence HQ', 'VP RevOps', 'VP'], ['Ruth Alvarez', 'Sequent', 'Dir. RevOps', 'Director']],
    ['Company list', 'Accepts a saved list or sheet'],
    ['Resolve company', 'Map org structure', 'Identify buying committee', 'Rank by influence', 'Enrich titles', 'Find contact details'],
    [['Name', 'Text', 'LinkedIn', 'Included'], ['Title', 'Text', 'LinkedIn', '~2 / row'], ['Seniority', 'Category', 'Outmate model', '~1 / row'], ['Function', 'Category', 'Outmate model', '~1 / row'], ['Email', 'Email', 'Waterfall', '~3 / row'], ['Influence', 'Score', 'Outmate model', '~2 / row']],
    ['Name', 'Company', 'Title', 'Seniority', 'Email', 'Influence'],
    [['Sarah Chen', 'Acme', 'VP Sales', 'VP', 'sarah@acme.io', '92'], ['David Kim', 'RevenueFlow', 'CRO', 'C-level', 'dkim@revflow.com', '96'], ['Ana Torres', 'Cadence HQ', 'VP RevOps', 'VP', 'ana@cadencehq.com', '88'], ['Ruth Alvarez', 'Sequent', 'Dir. RevOps', 'Director', 'No data found', '74'], ['Marcus Webb', 'Loop Systems', 'VP Sales', 'VP', 'mwebb@loop.io', '81']],
    'Up to 3 contacts per account'],
  ['Technology intelligence', 'Intelligence', 'Find companies running specific technologies and how strongly they match your target stack.', 6, IC.monitor,
    ['Company', 'Technology', 'Category', 'Match'],
    [['Acme', 'HubSpot', 'CRM', 'Exact'], ['SwiftSoft', 'Salesforce', 'CRM', 'Competitor'], ['SP6', 'Segment', 'CDP', 'Adjacent'], ['Canidium', 'Not detected', '—', 'No data found']],
    ['Technology or vendor', 'e.g. Salesforce'],
    ['Crawl website', 'Detect scripts and vendors', 'Classify technologies', 'Match target stack', 'Detect competitors', 'Score match'],
    [['Company', 'Text', 'Outmate research', 'Included'], ['Technology', 'Text', 'BuiltWith', '~3 / row'], ['Category', 'Category', 'BuiltWith', '~1 / row'], ['Match', 'Category', 'Outmate model', '~1 / row'], ['First seen', 'Date', 'BuiltWith', '~1 / row'], ['Confidence', 'Percent', 'Outmate model', 'Included']],
    ['Company', 'Technology', 'Category', 'Match', 'First seen', 'Confidence'],
    [['Acme', 'HubSpot', 'CRM', 'Exact', 'Mar 2023', '96%'], ['SwiftSoft', 'Salesforce', 'CRM', 'Competitor', 'Jan 2021', '93%'], ['SP6', 'Segment', 'CDP', 'Adjacent', 'Sep 2022', '88%'], ['Canidium', 'Not detected', 'Not available', 'No data found', '—', '—'], ['Athena EdTech', 'Marketo', 'MAP', 'Competitor', 'Jun 2020', '79%']],
    'Up to 400 companies'],
  ['Competitor research', 'Intelligence', 'Analyze competitors, their positioning and where the opportunity sits against each account.', 5, IC.spark,
    ['Company', 'Competitor', 'Positioning', 'Opportunity'],
    [['Acme', 'Clari', 'Forecasting', 'High'], ['RevenueFlow', 'Gong', 'Conversation', 'Medium'], ['Cadence HQ', 'Outreach', 'Sequencing', 'High'], ['Osano', 'OneTrust', 'Compliance', 'Low']],
    ['Company domain', 'e.g. acme.io'],
    ['Identify company category', 'Find named competitors', 'Extract positioning', 'Compare feature claims', 'Identify differentiators', 'Estimate opportunity'],
    [['Company', 'Text', 'Outmate research', 'Included'], ['Competitor', 'Text', 'Outmate research', '~2 / row'], ['Positioning', 'Text', 'Outmate model', '~2 / row'], ['Differentiator', 'Text', 'Outmate model', '~1 / row'], ['Opportunity', 'Category', 'Outmate model', '~1 / row'], ['Source', 'URL', 'Web', 'Included']],
    ['Company', 'Competitor', 'Positioning', 'Differentiator', 'Opportunity', 'Source'],
    [['Acme', 'Clari', 'Revenue forecasting', 'Pipeline hygiene', 'High', 'clari.com'], ['RevenueFlow', 'Gong', 'Conversation data', 'Coaching depth', 'Medium', 'gong.io'], ['Cadence HQ', 'Outreach', 'Sequencing', 'Deliverability', 'High', 'outreach.io'], ['Osano', 'OneTrust', 'Compliance suite', 'Enterprise breadth', 'Low', 'onetrust.com'], ['HeadLight', 'Not detected', 'No data found', 'Skipped', 'Not applicable', '—']],
    'Up to 400 companies'],
  ['Enrich signups', 'Ops', 'Enrich inbound signups with company, title and ICP match as they arrive.', 4, IC.brief,
    ['Name', 'Company', 'Title', 'ICP match'],
    [['Jonah Reed', 'Northwind', 'Head of Sales', 'Strong'], ['Lea Ortiz', 'Strata', 'Founder', 'Medium'], ['Tom Alder', 'Loop Systems', 'RevOps', 'Strong'], ['Nia Fox', 'Free email', 'Not detected', 'Weak']],
    ['Signup email', 'From your product or CRM'],
    ['Parse email domain', 'Resolve company', 'Enrich firmographics', 'Find person title', 'Score ICP match', 'Route to owner'],
    [['Name', 'Text', 'Signup form', 'Included'], ['Company', 'Text', 'Outmate research', '~1 / row'], ['Title', 'Text', 'LinkedIn', '~1 / row'], ['Employees', 'Number', 'LinkedIn', '~1 / row'], ['ICP match', 'Category', 'Your ICP', '~1 / row'], ['Owner', 'Text', 'Routing rules', 'Included']],
    ['Name', 'Company', 'Title', 'Employees', 'ICP match', 'Owner'],
    [['Jonah Reed', 'Northwind', 'Head of Sales', '140', 'Strong', 'A. Kapoor'], ['Lea Ortiz', 'Strata', 'Founder', '18', 'Medium', 'M. Shah'], ['Tom Alder', 'Loop Systems', 'RevOps', '260', 'Strong', 'A. Kapoor'], ['Nia Fox', 'Not detected', 'No data found', '—', 'Weak', 'Unassigned'], ['Ivan Petrov', 'Sequent', 'CMO', '95', 'Medium', 'R. Tan']],
    'Every new signup'],
  ['Deduplicate CRM accounts', 'Ops', 'Identify and merge duplicate CRM records by domain, name and hierarchy.', 3, IC.doc,
    ['Account', 'Domain', 'Duplicates', 'Action'],
    [['Acme Inc', 'acme.io', '3', 'Merge'], ['Acme', 'acme.io', '—', 'Merge into'], ['SwiftSoft US', 'swiftsoft.us', '2', 'Review'], ['SP6', 'sp6.io', 'None found', 'Keep']],
    ['CRM account export', 'HubSpot or Salesforce'],
    ['Normalize account names', 'Resolve domains', 'Cluster likely duplicates', 'Detect parent and child records', 'Pick surviving record', 'Propose merge action'],
    [['Account', 'Text', 'CRM', 'Included'], ['Domain', 'URL', 'CRM', 'Included'], ['Duplicates', 'Number', 'Outmate model', '~1 / row'], ['Cluster', 'Text', 'Outmate model', '~1 / row'], ['Action', 'Category', 'Outmate model', '~1 / row'], ['Confidence', 'Percent', 'Outmate model', 'Included']],
    ['Account', 'Domain', 'Duplicates', 'Cluster', 'Action', 'Confidence'],
    [['Acme Inc', 'acme.io', '3', 'acme.io', 'Merge', '97%'], ['Acme', 'acme.io', '—', 'acme.io', 'Merge into', '97%'], ['SwiftSoft US', 'swiftsoft.us', '2', 'swiftsoft', 'Review', '74%'], ['SP6', 'sp6.io', 'None found', '—', 'Keep', '—'], ['Canidium LLC', 'canidium.com', '1', 'canidium', 'Review', '68%']],
    'Every CRM account'],
]
const NUM = (n) => n.toLocaleString()
const CHIPS = [
  ['Give me ideas', 'M10 3a4.5 4.5 0 00-2.5 8.2V14h5v-2.8A4.5 4.5 0 0010 3zM8 16.5h4', '#6D28D9', 'Find high-intent accounts showing buying signals'],
  ['New campaign', 'M10 4v12M4 10h12', '#52525B', 'Build a targeted account list of B2B SaaS companies in North America'],
  ['Website visitors', 'M4 16V9M8.7 16V5M13.3 16v-6M17 16v-9', '#0B66C3', 'Find companies visiting our website in the last 30 days', 1],
  ['Social signals', 'M10 13.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM4.5 15.5a7.8 7.8 0 010-11M15.5 4.5a7.8 7.8 0 010 11', '#0A66C2', 'Find people engaging with our competitors on LinkedIn'],
  ['High-intent accounts', 'M11 2.5L4.5 11.5H9l-.6 6 6.6-9H10.4z', '#EA580C', 'Find high-intent accounts showing buying signals'],
  ['Find companies', 'M4 16V6.5L10 4l6 2.5V16M8 16v-4h4v4', '#52525B', 'Find CMOs at e-commerce brands in India with 100–1000 employees'],
  ['Find decision makers', 'M13 16v-1.5A3.5 3.5 0 009.5 11h-3A3.5 3.5 0 003 14.5V16M8 8.5a2.75 2.75 0 100-5.5 2.75 2.75 0 000 5.5M17 16v-1.5a3.5 3.5 0 00-2.6-3.4', '#6D28D9', 'Find VP Sales at SaaS companies with 100–500 employees'],
  ['Enrich leads', 'M10 3l1.6 4.4L16 9l-4.4 1.6L10 15l-1.6-4.4L4 9l4.4-1.6z', '#6D28D9', 'Enrich missing emails, titles and LinkedIn profiles for my existing leads'],
  ['Research competitors', 'M9 14.5a5 5 0 100-10 5 5 0 000 10zM13 13l4 4', '#52525B', 'Find companies using HubSpot and Salesforce but no unified GTM platform'],
]
const VISITORS = [
  ['Acme Corp', 'acme.io', 'Pricing → Demo → Features', 7, '2h ago', 'High', 'Yes', 0],
  ['RevenueFlow', 'revenueflow.com', 'Integrations → Pricing', 4, '5h ago', 'High', 'Yes', 0],
  ['Cadence HQ', 'cadence.so', 'Blog → Docs → Pricing', 3, 'Yesterday', 'Medium', 'Yes', 1],
  ['Sequent Inc', 'sequent-tech.com', 'Pricing → Security → Demo', 6, '4d ago', 'High', 'Yes', 1],
  ['Northwind Labs', 'northwind.dev', 'Careers → About', 2, '6d ago', 'Low', 'No', 1],
  ['Canidium', 'canidium.co', 'Docs → Changelog', 2, '12d ago', 'Low', 'Yes', 2],
  ['HeadLight', 'headlight.com', 'Pricing → Demo', 5, '19d ago', 'Medium', 'Yes', 2],
]
const SOCIAL = [
  ['Priya Menon', 'Zeta Commerce', 'VP Marketing', 'Engaged with a competitor post on LinkedIn', '2h ago', 'High'],
  ['Rohit Shah', 'Larkspur', 'Head of RevOps', 'Company announced a Series B raise', '5h ago', 'High'],
  ['Ananya Rao', 'Northwind Labs', 'CMO', 'Posted about replacing their GTM stack', 'Yesterday', 'High'],
  ['Karan Gupta', 'Sequent Inc', 'VP Sales', 'Hiring 3 RevOps roles in Gurugram', '2d ago', 'Medium'],
  ['Meera Iyer', 'Canidium', 'Director of Growth', 'Commented on a pricing-strategy thread', '4d ago', 'Medium'],
  ['Devansh Jain', 'HeadLight', 'Chief Revenue Officer', 'Executive job change — joined 3 weeks ago', '6d ago', 'Medium'],
]

const LINKS = {
  'Revenue Radar': 'Outmate Radar.dc.html',
  Copilot: 'Outmate Copilot v2.dc.html',
}
const WORKSPACE_FILE = 'Outmate Workspace v3.dc.html'

export class HomeModel extends ModelBase {
  state = {
    page: 'Home', draft: '', agent: 'Outmate Agent', agentOpen: false, toolsOpen: false,
    workspaceOpen: false, notifsOpen: false, userOpen: false, creditsOpen: false,
    columnPanelOpen: false, enrichQ: '', enrichSort: 'Popular', enrichPrompt: '',
    runOpen: false, runFor: null, runCost: 0,
    gtmCat: 'All', previewFor: null,
    credits: 5000, used: 2370, toast: '', menuFor: null,
    q: '', statusFilter: 'All', sort: 'Last run', cat: 'All', researchFilter: 'All',
    connected: { HubSpot: true, Gmail: false, Slack: true, LinkedIn: false, MCP: false, 'Google Sheets': false },
    thread: [], thinking: false, ctx: {}, visWin: 1,
  }

  stop = (e) => { if (e && e.stopPropagation) e.stopPropagation() }
  flash = (t) => {
    this.clearTimeout(this._t)
    this.setState({ toast: t })
    this._t = this.setTimeout(() => this.setState({ toast: '' }), 2200)
  }
  closeAll(x) {
    return Object.assign({ agentOpen: false, toolsOpen: false, workspaceOpen: false, notifsOpen: false, userOpen: false, menuFor: null }, x || {})
  }

  ask = (q) => {
    const text = (q || '').trim()
    if (!text) { this.flash('Describe what you need first'); return }
    this.clearTimeout(this._think)
    this.setState((st) => ({ draft: '', thinking: true, thread: (st.thread || []).concat({ role: 'user', text }) }))
    this._think = this.setTimeout(() => this.setState((st) => {
      const plan = this.askPlan(text, st.ctx || {})
      return { thinking: false, ctx: plan.ctx, thread: st.thread.concat(Object.assign({ role: 'ai' }, plan)) }
    }), 720)
  }

  askPlan(q, ctx) {
    const low = q.toLowerCase()
    const filters = []
    if (/india|gurugram|bengaluru|bangalore|delhi|mumbai/.test(low)) filters.push('Geography: India')
    if (/north america|united states|\bus\b|usa|europe/.test(low)) filters.push('Geography: North America')
    if (/e-?commerce/.test(low)) filters.push('Industry: E-commerce')
    if (/saas|b2b/.test(low)) filters.push('Industry: B2B SaaS')
    if (/\bai\b/.test(low)) filters.push('Industry: AI')
    const emp = low.match(/(\d[\d,]*)\s*(?:-|–|to)\s*(\d[\d,]*)/)
    if (emp) filters.push('Employees: ' + emp[1] + '–' + emp[2])
    if (/hubspot/.test(low)) filters.push('Tech: HubSpot')
    if (/salesforce/.test(low)) filters.push('Tech: Salesforce')
    if (/hiring|hire/.test(low)) filters.push('Signal: Active hiring')
    if (/funded|funding|series/.test(low)) filters.push('Signal: Recent funding')
    if (/visit/.test(low)) filters.push('Signal: Website intent')
    if (/competitor|linkedin|engag|social/.test(low)) filters.push('Signal: Social engagement')

    const companies = ctx.companies || 1284
    const COLS = ['Company', 'Domain', 'Industry', 'Employees', 'ICP Fit', 'Decision Maker', 'Title', 'Email', 'LinkedIn', 'Hiring Signal', 'Website Intent', 'Social Signal', 'Last Signal']
    const stat = (label, value, color) => ({ label, value, color: color || '#18181B' })
    const cost = (n) => Math.round(n / 100) * 100
    let out

    const personAsk = /cmo|cto|cro|cfo|decision maker|leader|head of|founder|director|\bvp\b|people|contact/.test(low)
    const followUp = !!ctx.companies && (/\btheir\b|^(now|then|also|next)\b/.test(low) || !/compan|brand|account|startup/.test(low))

    if (personAsk && (followUp || !/compan|brand|account|startup/.test(low))) {
      const people = Math.round(companies * 0.803), verified = Math.round(people * 0.86), c = cost(people * 7)
      out = { text: 'I found ' + NUM(people) + ' matching decision makers across ' + NUM(companies) + ' companies. ' + NUM(verified) + ' have verified work emails I can pull.',
        stats: [stat('Decision makers', NUM(people)), stat('Verified emails', NUM(verified), '#15803D'), stat('Estimated credits', NUM(c), '#5B21B6')],
        actions: ['Enrich emails', 'Score ICP', 'Only show companies hiring', 'Find buying signals'], credits: c,
        ctx: { companies, people, label: 'companies · ' + NUM(people) + ' decision makers' } }
    } else if (/only show|filter|narrow/.test(low) && /hiring|hire/.test(low)) {
      const n = Math.max(24, Math.round(companies * 0.143)), people = Math.round(n * 0.8), c = cost(n * 3 + people * 7)
      out = { text: 'I filtered the list to ' + NUM(n) + ' companies with active hiring signals in the last 30 days. Everything else stays in the session if you want it back.',
        stats: [stat('Companies', NUM(n)), stat('Decision makers', NUM(people)), stat('Estimated credits', NUM(c), '#5B21B6')],
        actions: ['Find decision makers', 'Enrich emails', 'Score ICP'], credits: c, ctx: { companies: n, people, label: 'hiring companies' } }
    } else if (/enrich|email|phone/.test(low)) {
      const n = ctx.people || companies, c = cost(n * 7)
      out = { text: 'I can enrich ' + NUM(n) + ' records — work email, direct phone, title, LinkedIn profile and company firmographics. Verification runs before anything is charged.',
        stats: [stat('Records', NUM(n)), stat('Expected match rate', '86%', '#15803D'), stat('Estimated credits', NUM(c), '#5B21B6')],
        actions: ['Score ICP', 'Find buying signals', 'Push to HubSpot'], credits: c, ctx: ctx.companies ? ctx : { companies, people: n } }
    } else if (/visit/.test(low)) {
      const c = cost(96 * 10)
      out = { text: '342 companies visited your site in the last 30 days. 96 match your ICP and 24 are showing high intent across pricing and demo pages.',
        stats: [stat('Companies', '342'), stat('ICP matches', '96', '#15803D'), stat('High intent', '24', '#EA580C')],
        actions: ['Find decision makers', 'Enrich emails', 'Create a warm list'], credits: c, ctx: { companies: 342, people: 0, label: 'website visitors' } }
    } else if (/competitor|engag|linkedin|social/.test(low)) {
      const c = cost(412 * 7)
      out = { text: '1,860 social signals landed in the last 30 days. 412 came from people at accounts inside your ICP, including 68 who engaged with competitor content.',
        stats: [stat('Signals', '1,860'), stat('In-ICP people', '412', '#15803D'), stat('Competitor-engaged', '68', '#EA580C')],
        actions: ['Find decision makers', 'Enrich emails', 'Create a warm list'], credits: c, ctx: { companies: 412, people: 412, label: 'social signals' } }
    } else if (/intent|buying signal|signal/.test(low)) {
      const c = cost(184 * 10)
      out = { text: '184 accounts are showing buying signals right now — website intent, active hiring, recent funding and competitor engagement, ranked by ICP fit.',
        stats: [stat('High-intent accounts', '184'), stat('Signals in last 7 days', '642'), stat('Estimated credits', NUM(c), '#5B21B6')],
        actions: ['Find decision makers', 'Enrich emails', 'Create a warm list'], credits: c, ctx: { companies: 184, people: 0, label: 'high-intent accounts' } }
    } else if (/similar|lookalike|best customer/.test(low)) {
      const c = cost(964 * 3)
      out = { text: 'I built a lookalike model from your 38 best customers and found 964 close matches, scored on firmographics, tech stack and buying signals.',
        stats: [stat('Lookalikes', '964'), stat('Close matches', '212', '#15803D'), stat('Estimated credits', NUM(c), '#5B21B6')],
        actions: ['Find decision makers', 'Score ICP', 'Only show companies hiring'], credits: c, ctx: { companies: 964, people: 0, label: 'lookalikes' } }
    } else {
      const dm = Math.round(companies * 1.64), c = cost(companies * 3 + dm * 7)
      out = { text: 'I found ' + NUM(companies) + ' potential companies. I can identify decision makers, enrich their contact details, and score them against your ICP.',
        stats: [stat('Companies', NUM(companies)), stat('Decision makers', '~' + NUM(dm)), stat('Estimated credits', NUM(c), '#5B21B6')],
        actions: ['Find CMOs', 'Enrich emails', 'Score ICP', 'Find buying signals'], credits: c, ctx: { companies, people: 0, label: 'companies' } }
    }
    return Object.assign({ filters, cols: COLS }, out)
  }

  askRun = (name, cost) => this.setState(this.closeAll({ runOpen: true, runFor: name, runCost: cost }))

  nav = (p) => {
    this.setState(this.closeAll({ page: p }))
    const el = document.getElementById('scroller')
    if (el) el.scrollTop = 0
  }

  renderVals() {
    const s = this.state
    const th = (align) => 'padding:10px 13px; font-size:12.5px; font-weight:600; color:#52525B; letter-spacing:.01em; white-space:nowrap; display:flex; align-items:center; ' + (align === 'r' ? 'justify-content:flex-end' : '')
    const cols = (list) => list.map((c) => ({ label: c, style: th() }))
    const statusPill = (v) => 'flex:none; padding:3px 8px; border-radius:2px; font-size:11.5px; font-weight:600; letter-spacing:.01em; ' +
      (v === 'Live' ? 'background:#ECFDF3; color:#15803D; border:1px solid #C7EBD5'
        : v === 'Paused' ? 'background:#FFF8F1; color:#C2410C; border:1px solid #F3D6BB'
          : v === 'Draft' ? 'background:#F6F3FE; color:#6D28D9; border:1px solid #DED2F7'
            : 'background:#F6F6F7; color:#52525B; border:1px solid #E4E4E7')
    const chip = (on) => 'height:34px; display:flex; align-items:center; padding:0 12px; border-radius:3px; font-size:13px; font-weight:600; cursor:pointer; white-space:nowrap; ' +
      (on ? 'border:1px solid #6D28D9; background:#F6F3FE; color:#5B21B6' : 'border:1px solid #E4E4E7; background:#FFFFFF; color:#52525B')
    const navStyle = (on) => 'display:flex; align-items:center; gap:10px; height:34px; padding:0 9px; border-radius:3px; cursor:pointer; font-size:13.5px; ' +
      (on ? 'background:#F1EBFC; color:#4C1D95; font-weight:600; box-shadow:inset 2px 0 0 #6D28D9' : 'background:transparent; color:#52525B; font-weight:500')
    const gridRow = (i, n) => 'display:flex; align-items:center; gap:12px; padding:13px 14px; background:#FFFFFF; cursor:pointer; min-width:0; ' +
      (i % 2 === 0 ? 'border-right:1px solid #EFEFF0; ' : '') + (i < n - 2 ? 'border-bottom:1px solid #EFEFF0' : '')

    const cost = s.runCost
    const short = cost > s.credits

    return {
      plan: 'Growth workspace',
      pageTitle: s.page,
      isHome: s.page === 'Home',
      creditsLeft: s.credits.toLocaleString(),
      creditsUsed: s.used.toLocaleString(),
      creditColor: s.credits < 1000 ? '#C2410C' : '#18181B',
      meterColor: s.credits < 1000 ? '#C2410C' : '#6D28D9',
      remainPct: Math.max(3, Math.min(100, (s.credits / (s.credits + s.used)) * 100)).toFixed(1) + '%',
      usedPct: Math.min(100, (s.used / (s.used + s.credits)) * 100).toFixed(1) + '%',
      settingsNavStyle: 'flex:1; ' + navStyle(s.page === 'Settings') + '; border:1px solid ' + (s.page === 'Settings' ? '#DED2F7' : '#E4E4E7') + '; background:' + (s.page === 'Settings' ? '#F6F3FE' : '#FFFFFF'),
      numCell: 'padding:11px 13px; display:flex; align-items:center; font-size:13px; color:#3F3F46; font-variant-numeric:tabular-nums; overflow:hidden; text-overflow:ellipsis; white-space:nowrap',
      textCell: 'padding:11px 13px; display:flex; align-items:center; font-size:13px; color:#71717A; overflow:hidden; text-overflow:ellipsis; white-space:nowrap',

      workspaceOpen: s.workspaceOpen,
      toggleWorkspace: () => this.setState(this.closeAll({ workspaceOpen: !s.workspaceOpen })),
      workspaces: [['Growth workspace', '✓'], ['Outmate — Sandbox', ''], ['Create workspace', '+']].map((w) => ({
        name: w[0], mark: w[1], pick: () => { this.setState({ workspaceOpen: false }); this.flash(w[0] === 'Create workspace' ? 'New workspace' : 'Switched to ' + w[0]) },
      })),

      navGroups: NAV.map((g) => ({
        label: g[0], hasLabel: !!g[0],
        items: g[1].map((i) => ({
          label: i[0], path: i[1], style: navStyle(s.page === i[0]),
          hasTag: i[0] === 'API keys', tag: 'Beta',
          go: () => {
            if (LINKS[i[0]]) { this.goFile(LINKS[i[0]]); return }
            this.setState(this.closeAll({ page: i[0] }))
            const el = document.getElementById('scroller')
            if (el) el.scrollTop = 0
          },
        })),
      })),

      recents: [
        'B2B SaaS GTM Platform Gap Analysis',
        'RevOps leadership search',
        'Series B MarTech accounts',
        'Salesforce replacement signals',
      ].map((name) => ({ name, open: () => this.goFile(WORKSPACE_FILE) })),

      resources: [
        ['Refer a friend', 'M10 4.5v11M4.5 10h11'],
        ['Join our Slack', 'M4.5 10h11M10 4.5v11M7 7l6 6M13 7l-6 6'],
      ].map((r) => ({ label: r[0], path: r[1], act: () => this.flash(r[0]) })),
      upgrade: () => this.setState(this.closeAll({ creditsOpen: true })),
      openCredits: () => this.setState(this.closeAll({ creditsOpen: true })),
      goSettings: () => this.setState(this.closeAll({ page: 'Settings' })),
      newResearch: () => { this.nav('Home'); this.setState({ draft: '' }); this.flash('New research started') },
      openSearch: () => this.flash('Search companies, people, research, projects, lists and templates'),

      notifsOpen: s.notifsOpen,
      toggleNotifs: () => this.setState(this.closeAll({ notifsOpen: !s.notifsOpen })),
      notifications: [
        ['Gap Analysis run finished — 2,370 of 2,370 cells', '18m ago', '#15803D'],
        ['4 new buying signals on Acme', '1h ago', '#6D28D9'],
        ['Gmail connector needs re-authentication', '3h ago', '#EA580C'],
      ].map((n) => ({ text: n[0], time: n[1], dot: n[2], act: () => { this.setState({ notifsOpen: false }); this.flash(n[0]) } })),

      userOpen: s.userOpen,
      toggleUser: () => this.setState(this.closeAll({ userOpen: !s.userOpen })),
      userMenu: ['Account settings', 'Billing and credits', 'Keyboard shortcuts', 'Sign out']
        .map((label) => ({ label, act: () => { this.setState({ userOpen: false }); label === 'Billing and credits' ? this.setState({ creditsOpen: true }) : this.flash(label) } })),

      draft: s.draft, onDraft: (e) => this.setState({ draft: e.target.value }),
      estimateLabel: s.draft.trim() ? 'Estimated ' + (24 + Math.min(120, s.draft.trim().length)) + ' credits' : 'Credits estimated before each run',
      agent: s.agent.replace(' Agent', ''), agentOpen: s.agentOpen,
      toggleAgent: (e) => { this.stop(e); this.setState(this.closeAll({ agentOpen: !s.agentOpen })) },
      agents: [['Outmate Agent', 'General GTM research'], ['Prospector', 'People and contact discovery'], ['Signal Analyst', 'Intent and buying signals']]
        .map((a) => ({ name: a[0], desc: a[1], pick: (e) => { this.stop(e); this.setState({ agent: a[0], agentOpen: false }); this.flash(a[0] + ' selected') } })),
      toolsOpen: s.toolsOpen,
      toggleTools: (e) => { this.stop(e); this.setState(this.closeAll({ toolsOpen: !s.toolsOpen })) },
      tools: [['Company search', '2 / row'], ['Find decision makers', '20 / row'], ['Work email finder', '3 / row'], ['Tech stack detection', '6 / row'], ['Signal monitoring', '4 / company']]
        .map((t) => ({ label: t[0], cost: t[1], pick: (e) => { this.stop(e); this.setState({ toolsOpen: false }); this.flash(t[0] + ' added to this research') } })),
      attach: () => this.flash('Attach a CSV, list or brief'),
      send: () => this.ask(s.draft),

      columnPanelOpen: s.columnPanelOpen,
      openColumnPanel: () => this.setState(this.closeAll({ columnPanelOpen: true })),
      closeColumnPanel: () => this.setState({ columnPanelOpen: false }),
      enrichPrompt: s.enrichPrompt,
      onEnrichPrompt: (e) => this.setState({ enrichPrompt: e.target.value }),
      createEnrich: () => {
        if (!s.enrichPrompt.trim()) { this.flash('Describe the column first'); return }
        this.setState({ columnPanelOpen: false, enrichPrompt: '' }); this.askRun('this AI column across 400 rows', 1200)
      },
      enrichQ: s.enrichQ, onEnrichQ: (e) => this.setState({ enrichQ: e.target.value }),
      enrichSortLabel: 'Sort: ' + s.enrichSort,
      cycleEnrichSort: () => this.setState((st) => ({ enrichSort: st.enrichSort === 'Popular' ? 'Lowest cost' : st.enrichSort === 'Lowest cost' ? 'Recently used' : 'Popular' })),
      enrichments: ENRICH
        .filter((e) => !s.enrichQ.trim() || (e[0] + ' ' + e[1]).toLowerCase().indexOf(s.enrichQ.trim().toLowerCase()) > -1)
        .slice()
        .sort((a, b) => s.enrichSort === 'Lowest cost' ? a[2] - b[2] : s.enrichSort === 'Popular' ? b[5] - a[5] : 0)
        .map((e) => ({ name: e[0], desc: e[1], cost: '~' + e[2] + ' credits / cell', path: e[3],
          hasSrc: !!e[4], src: e[4] ? SRC[e[4]][0] : '',
          srcStyle: e[4] ? ('flex:none; width:19px; height:19px; border-radius:2px; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:700; color:#FFFFFF; background:' + SRC[e[4]][1]) : '',
          add: () => { this.setState({ columnPanelOpen: false }); this.askRun('“' + e[0] + '” across 400 rows', e[2] * 400) } })),

      runOpen: s.runOpen,
      closeRun: () => this.setState({ runOpen: false }),
      runTitle: short ? 'Cannot run — insufficient credits' : 'Run ' + (s.runFor || 'selected cells') + '?',
      runBody: short
        ? 'This run needs more credits than the workspace currently has available.'
        : 'This will execute ' + (s.runFor || 'the selected cells') + '. Credits are deducted as cells complete.',
      runFacts: [
        { label: 'Estimated cost', value: cost.toLocaleString() + ' credits', color: short ? '#C2410C' : '#18181B' },
        { label: 'Current balance', value: s.credits.toLocaleString() + ' credits', color: '#18181B' },
        { label: 'Balance after run', value: short ? '—' : (s.credits - cost).toLocaleString() + ' credits', color: '#18181B' },
      ],
      runShort: short,
      runShortBody: 'Estimated cost: ' + cost.toLocaleString() + ' · Available: ' + s.credits.toLocaleString(),
      runBtnLabel: short ? 'Top up credits' : 'Run',
      runBtnStyle: 'height:34px; padding:0 16px; border:1px solid ' + (short ? '#C2410C' : '#6D28D9') + '; background:' + (short ? '#C2410C' : '#6D28D9') + '; color:#FFFFFF; border-radius:3px; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit',
      confirmRun: () => {
        if (short) { this.setState({ runOpen: false, creditsOpen: true }); return }
        this.setState((st) => ({ runOpen: false, credits: st.credits - cost, used: st.used + cost })); this.flash('Run started — ' + cost.toLocaleString() + ' credits reserved')
      },

      creditsOpen: s.creditsOpen,
      closeCredits: () => this.setState({ creditsOpen: false }),
      rates: [['Find decision makers', '20 / company'], ['Website tech stack', '6 / company'], ['Company funding', '3 / company'], ['Company revenue', '2 / company']]
        .map((r) => ({ label: r[0], cost: r[1] })),
      packs: [['5,000', '$49 / mo'], ['25,000', '$199 / mo'], ['100,000', 'Contact sales']].map((p) => ({
        amount: p[0], price: p[1],
        buy: () => {
          if (p[1] === 'Contact sales') { this.setState({ creditsOpen: false }); this.flash('Sales will reach out'); return }
          const n = parseInt(p[0].replace(/,/g, ''), 10)
          this.setState((st) => ({ credits: st.credits + n, creditsOpen: false })); this.flash(p[0] + ' credits added')
        },
      })),

      toast: s.toast,
      q: s.q, onQ: (e) => this.setState({ q: e.target.value }),
      newTemplate: () => this.flash('New template'),
      newList: () => this.flash('New list'),
      allTemplates: () => this.nav('Templates'),
      goProjects: () => this.nav('Projects'),
      isProjects: s.page === 'Projects',
      isTemplates: s.page === 'Templates',
      isResearchPage: s.page === 'Recent research',
      isLists: s.page === 'Saved lists',

      projectSummary: [['Active projects', '2'], ['Completed', '2'], ['Paused', '1'], ['Companies researched', '828'], ['Credits used', '6.4K']]
        .map((x, i) => ({ label: x[0], value: x[1], style: 'flex:1; padding:13px 15px; ' + (i < 4 ? 'border-right:1px solid #EFEFF0' : '') })),
      projectCols: cols(['Project', 'Status', 'Companies', 'Leaders', 'Signals', 'Enriched cells', 'Last run', 'Credits used', 'Updated', '']),
      projectGrid: '1.6fr .8fr .8fr .8fr .8fr .9fr .8fr .9fr .8fr 44px',
      projectRows: PROJECTS.filter((p) => !s.q.trim() || (p[0] + ' ' + p[8]).toLowerCase().indexOf(s.q.trim().toLowerCase()) > -1)
        .filter((p) => s.statusFilter === 'All' || p[1] === s.statusFilter)
        .map((p) => ({
          name: p[0], status: p[1], statusStyle: statusPill(p[1]), type: p[8],
          companies: p[2], leaders: p[3], signals: p[4], enriched: p[5], lastRun: p[7], creditsUsed: p[6], updated: p[7],
          menuOpen: s.menuFor === p[0],
          act: () => this.goFile(WORKSPACE_FILE),
          menu: (e) => { this.stop(e); this.setState({ menuFor: s.menuFor === p[0] ? null : p[0] }) },
          items: ['Open', 'Duplicate', 'Rename', 'Pause', 'Delete'].map((label) => ({
            label, color: label === 'Delete' ? '#B91C1C' : '#3F3F46',
            act: (e) => { this.stop(e); this.setState({ menuFor: null }); if (label === 'Open') { this.goFile(WORKSPACE_FILE); return } this.flash(label + ' — “' + p[0] + '”') } })),
        })),
      projectsEmpty: PROJECTS.filter((p) => (!s.q.trim() || (p[0] + ' ' + p[8]).toLowerCase().indexOf(s.q.trim().toLowerCase()) > -1) && (s.statusFilter === 'All' || p[1] === s.statusFilter)).length === 0,
      statusChips: ['All', 'Live', 'Complete', 'Paused', 'Draft'].map((k) => ({ label: k, style: chip(s.statusFilter === k), pick: () => this.setState({ statusFilter: k }) })),
      filterSelects: [['Date'], ['Credits used'], ['Project type'], ['Last run']].map((f) => ({ label: f[0], act: () => this.flash('Filter by ' + f[0].toLowerCase()) })),
      sortLabel: 'Sort: ' + s.sort,
      toggleSort: () => this.setState((st) => ({ sort: st.sort === 'Last run' ? 'Credits used' : st.sort === 'Credits used' ? 'Companies' : 'Last run' })),

      catChips: ['All', 'Accounts', 'People', 'Signals', 'Research', 'Technology', 'GTM', 'Lists']
        .map((k) => ({ label: k, style: chip(s.cat === k), pick: () => this.setState({ cat: k }) })),
      templateGrid: '1.5fr 1.9fr .9fr 1.1fr .8fr 268px',
      templateCols: cols(['Template', 'What it does', 'Category', 'Est. credits', 'Last used', 'Actions']),
      workflowRows: WORKFLOWS.filter((w) => s.cat === 'All' || w[2] === s.cat)
        .filter((w) => !s.q.trim() || (w[0] + ' ' + w[1]).toLowerCase().indexOf(s.q.trim().toLowerCase()) > -1)
        .map((w) => ({ name: w[0], desc: w[1], cat: w[2], cost: w[3] + ' / row', path: w[4], used: w[5],
          run: (e) => { this.stop(e); this.askRun('“' + w[0] + '” on 400 rows', w[3] * 400) },
          preview: (e) => { this.stop(e); this.flash('Preview — ' + w[0]) },
          duplicate: (e) => { this.stop(e); this.flash('“' + w[0] + '” duplicated') } })),

      researchChips: ['All', 'Active', 'Completed', 'Paused', 'Recently updated']
        .map((k) => ({ label: k, style: chip(s.researchFilter === k), pick: () => this.setState({ researchFilter: k }) })),
      researchCols: cols(['Research', 'Type', 'Companies', 'Leaders', 'Signals', 'Enriched cells', 'Credits used', 'Last updated', 'Status', 'Action']),
      researchGrid: '1.6fr 1fr .8fr .9fr .8fr .9fr .9fr .9fr .9fr 82px',
      researchRows: PROJECTS
        .filter((p) => s.researchFilter === 'All' || (s.researchFilter === 'Active' && p[1] === 'Live') || (s.researchFilter === 'Completed' && p[1] === 'Complete') || (s.researchFilter === 'Paused' && p[1] === 'Paused') || s.researchFilter === 'Recently updated')
        .filter((p) => !s.q.trim() || p[0].toLowerCase().indexOf(s.q.trim().toLowerCase()) > -1)
        .map((p) => ({ name: p[0], type: p[8], companies: p[2], leaders: p[3], signals: p[4], enriched: p[5], creditsUsed: p[6], updated: p[7],
          status: p[1], statusStyle: statusPill(p[1]), act: () => this.goFile(WORKSPACE_FILE) })),

      listCols: cols(['List', 'Companies', 'Leaders', 'Signals', 'Created', 'Last updated', 'Source research', '']),
      listGrid: '1.5fr 1fr .8fr .8fr .9fr .9fr 1.5fr 44px',
      listRows: LISTS.filter((l) => !s.q.trim() || l[0].toLowerCase().indexOf(s.q.trim().toLowerCase()) > -1)
        .map((l) => ({ name: l[0], companies: l[1], leaders: l[2], signals: l[3], created: l[4], updated: l[5], source: l[6],
          menuOpen: s.menuFor === l[0],
          act: () => this.goFile(WORKSPACE_FILE),
          menu: (e) => { this.stop(e); this.setState({ menuFor: s.menuFor === l[0] ? null : l[0] }) },
          items: ['Open', 'Rename', 'Duplicate', 'Export', 'Delete'].map((label) => ({
            label, color: label === 'Delete' ? '#B91C1C' : '#3F3F46',
            act: (e) => { this.stop(e); this.setState({ menuFor: null }); if (label === 'Open') { this.goFile(WORKSPACE_FILE); return } this.flash(label + ' — “' + l[0] + '”') } })) })),

      workflows: WORKFLOWS.slice(0, 10).map((t, i, arr) => ({ name: t[0], desc: t[1], cost: t[3] + ' credits / row', path: t[4],
        rowStyle: gridRow(i, arr.length),
        run: (e) => { this.stop(e); this.askRun('“' + t[0] + '” on 400 rows', t[3] * 400) } })),

      research: PROJECTS.slice(0, 4).map((p, i, arr) => ({
        name: p[0], status: p[1], type: p[8],
        stats: p[2] + ' companies · ' + p[3] + ' leaders · ' + p[4] + ' signals',
        spend: p[5] + ' cells enriched · ' + p[6] + ' credits · last run ' + p[7],
        updated: p[7], owner: p[9], ownerBg: p[10], ownerFg: p[11],
        statusStyle: statusPill(p[1]),
        rowStyle: 'display:flex; align-items:center; gap:14px; padding:14px 15px; background:#FFFFFF; cursor:pointer; position:relative; ' + (i < arr.length - 1 ? 'border-bottom:1px solid #EFEFF0' : ''),
        menuOpen: s.menuFor === p[0],
        open: () => this.goFile(WORKSPACE_FILE),
        menu: (e) => { this.stop(e); this.setState({ menuFor: s.menuFor === p[0] ? null : p[0] }) },
        items: ['Open research', 'Find company news', 'Find decision makers', 'Add to saved list', 'Export', 'Delete'].map((label) => ({
          label, color: label === 'Delete' ? '#B91C1C' : '#3F3F46',
          act: (e) => { this.stop(e); this.setState({ menuFor: null }); if (label === 'Open research') { this.goFile(WORKSPACE_FILE); return } this.flash(label + ' — “' + p[0] + '”') } })),
      })),

      gtmCats: ['All', 'Prospecting', 'People', 'Intelligence', 'Enrichment', 'Signals', 'Ops'].map((k) => ({
        label: k,
        style: 'padding:8px 12px 9px; font-size:13px; cursor:pointer; white-space:nowrap; ' +
          (s.gtmCat === k ? 'color:#5B21B6; font-weight:650; box-shadow:inset 0 -2px 0 #6D28D9' : 'color:#71717A; font-weight:500'),
        pick: () => this.setState({ gtmCat: k }),
      })),
      railPrev: () => { const el = document.getElementById('gtmRail'); if (el) el.scrollLeft -= 680 },
      railNext: () => { const el = document.getElementById('gtmRail'); if (el) el.scrollLeft += 680 },
      gtmTemplates: GTM.filter((t) => s.gtmCat === 'All' || t[1] === s.gtmCat).map((t) => ({
        name: t[0], cat: t[1], desc: t[2], cost: '~' + t[3] + ' credits / row', path: t[4],
        cols: t[5], rows: t[6].map((cells) => ({ cells })),
        previewGrid: '1.1fr 1.1fr 1.1fr .8fr',
        preview: (e) => { this.stop(e); this.setState(this.closeAll({ previewFor: t[0] })) },
        use: (e) => { this.stop(e); this.askRun('“' + t[0] + '” on 50 rows', t[3] * 50) },
      })),
      previewOpen: !!s.previewFor,
      closePreview: () => this.setState({ previewFor: null }),
      pv: (() => {
        const t = GTM.filter((x) => x[0] === s.previewFor)[0] || GTM[0]
        return {
          name: t[0], cat: t[1], desc: t[2], path: t[4],
          cost: '~' + t[3] + ' credits / row',
          input: t[7][0], inputHint: t[7][1],
          steps: t[8].map((label, i, arr) => ({ n: i + 1, label,
            style: 'display:flex; align-items:center; gap:10px; padding:10px 12px; ' + (i < arr.length - 1 ? 'border-bottom:1px solid #F1F1F2' : '') })),
          columns: t[9].map((c) => ({ name: c[0], type: c[1], src: c[2], cost: c[3] })),
          outCols: t[10],
          outGrid: '1.2fr 1.1fr 1fr .9fr 1.1fr .9fr',
          outRows: t[11].map((cells) => ({ cells })),
          output: t[12],
          use: () => { this.setState({ previewFor: null }); this.askRun('“' + t[0] + '” on 50 rows', t[3] * 50) },
        }
      })(),

      chips: CHIPS.map((c) => ({ label: c[0], path: c[1], color: c[2], isNew: !!c[4],
        pick: () => { this.setState({ draft: c[3] }); this.flash('Prompt ready — edit it or start research') } })),

      hasThread: (s.thread || []).length > 0,
      thinking: s.thinking,
      threadMeta: (() => {
        const turns = (s.thread || []).filter((m) => m.role === 'user').length
        return turns + (turns === 1 ? ' request' : ' requests') + (s.ctx && s.ctx.companies ? ' · context: ' + NUM(s.ctx.companies) + ' ' + (s.ctx.label || 'companies') : '')
      })(),
      clearThread: () => { this.clearTimeout(this._think); this.setState({ thread: [], ctx: {}, thinking: false }) },
      thread: (s.thread || []).map((m, i, arr) => {
        const ai = m.role === 'ai', last = ai && i === arr.length - 1
        return {
          who: ai ? 'Outmate' : 'You', text: m.text,
          avatar: ai ? 'OA' : 'AK',
          avatarStyle: 'flex:none; width:26px; height:26px; border-radius:2px; display:flex; align-items:center; justify-content:center; font-size:9.5px; font-weight:700; ' +
            (ai ? 'background:#EDE9FE; color:#5B21B6' : 'background:#F4F4F5; color:#52525B'),
          rowStyle: 'display:flex; gap:12px; padding:15px' + (i ? '; border-top:1px solid #EFEFF0' : '') + (ai ? '' : '; background:#FCFCFD'),
          hasFilters: ai && m.filters && m.filters.length > 0, filters: m.filters || [],
          hasStats: ai && !!m.stats, stats: m.stats || [],
          hasCols: last, cols: m.cols || [],
          hasPlan: last,
          actions: (m.actions || []).map((a) => ({ label: a, pick: () => this.ask(a) })),
          costNote: ai ? 'Estimated cost ' + NUM(m.credits || 0) + ' credits · ' + NUM(s.credits) + ' available · nothing runs until you confirm' : '',
          start: () => this.askRun('this research run', m.credits || 0),
        }
      }),

      past7: [['56', 'new leads'], ['24', 'enriched'], ['18', 'high-intent accounts'], ['12', 'decision makers found'], ['8', 'signals detected'], ['3', 'workflows completed']]
        .map((x) => ({ value: x[0], label: x[1] })),
      past7Credits: '2.4K',
      past7Runs: '18',

      visitorCols: ['Company', 'Pages viewed', 'Visits', 'Last visit', 'Intent', 'ICP fit', ''],
      visitorWindows: ['Last 24 hours', 'Last 7 days', 'Last 30 days'].map((label, i) => ({ label,
        style: 'padding:5px 10px; border-radius:2px; font-size:12px; cursor:pointer; white-space:nowrap; ' +
          (s.visWin === i ? 'background:#FFFFFF; border:1px solid #E4E4E7; color:#18181B; font-weight:600' : 'border:1px solid transparent; color:#71717A; font-weight:500'),
        pick: () => this.setState({ visWin: i }) })),
      visitors: (() => {
        const rows = VISITORS.filter((v) => v[7] <= s.visWin)
        return rows.map((v, i) => ({
          name: v[0], domain: v[1], pages: v[2], visits: v[3], last: v[4], intent: v[5] + ' intent',
          icp: v[6], icpColor: v[6] === 'Yes' ? '#15803D' : '#A1A1AA',
          rowStyle: 'display:grid; grid-template-columns:1.3fr 2fr .6fr .8fr .8fr .6fr 1.5fr' + (i < rows.length - 1 ? '; border-bottom:1px solid #F1F1F2' : '; border-bottom:1px solid #E4E4E7'),
          intentStyle: 'display:inline-flex; padding:2px 7px; border-radius:2px; font-size:11.5px; font-weight:600; white-space:nowrap; ' +
            (v[5] === 'High' ? 'background:#FFF7ED; color:#C2410C; border:1px solid #FED7AA'
              : v[5] === 'Medium' ? 'background:#F5F1FD; color:#5B21B6; border:1px solid #E4DAFA'
                : 'background:#F6F6F7; color:#71717A; border:1px solid #E4E4E7'),
          enrich: () => this.askRun(v[0] + ' — visitor enrichment', 10),
          findDM: () => this.ask('Find decision makers at ' + v[0]),
        }))
      })(),
      visitorSummary: (() => {
        const rows = VISITORS.filter((v) => v[7] <= s.visWin)
        return rows.length + ' companies · ' + rows.filter((v) => v[6] === 'Yes').length + ' match your ICP · ' + rows.filter((v) => v[5] === 'High').length + ' high intent'
      })(),
      viewVisitors: () => this.ask('Find companies visiting our website in the last 30 days'),

      signalCols: ['Person', 'Company', 'Title', 'Signal', 'Date', 'Intent', ''],
      socialSignals: SOCIAL.map((g, i) => ({
        person: g[0], company: g[1], title: g[2], signal: g[3], date: g[4], intent: g[5],
        initials: g[0].split(' ').map((x) => x[0]).join(''),
        avBg: i % 3 === 0 ? '#EDE9FE' : i % 3 === 1 ? '#E0F2FE' : '#FEF3C7',
        avFg: i % 3 === 0 ? '#5B21B6' : i % 3 === 1 ? '#0B66C3' : '#92400E',
        rowStyle: 'display:grid; grid-template-columns:1.2fr 1fr 1.1fr 2.2fr .7fr .7fr 1.1fr' + (i < SOCIAL.length - 1 ? '; border-bottom:1px solid #F1F1F2' : ''),
        intentStyle: 'display:inline-flex; padding:2px 7px; border-radius:2px; font-size:11.5px; font-weight:600; white-space:nowrap; ' +
          (g[5] === 'High' ? 'background:#FFF7ED; color:#C2410C; border:1px solid #FED7AA' : 'background:#F5F1FD; color:#5B21B6; border:1px solid #E4DAFA'),
        research: () => this.ask('Research ' + g[0] + ' at ' + g[1] + ' — ' + g[3].toLowerCase()),
      })),

      nextActions: [
        [true, 'New leads', 'Find decision makers for your new leads', '56 new leads were added in the last 7 days. Identify the right decision makers and enrich their contact details.', '56 leads · ~7 credits per contact', 'View details →',
          'M13 16v-1.5A3.5 3.5 0 009.5 11h-3A3.5 3.5 0 003 14.5V16M8 8.5a2.75 2.75 0 100-5.5 2.75 2.75 0 000 5.5M17 16v-1.5a3.5 3.5 0 00-2.6-3.4', () => this.ask('Find decision makers for the 56 leads added in the last 7 days')],
        [true, 'Prospecting', 'Build a targeted account list', 'Create a qualified list of companies matching your ICP, scored on firmographics, tech stack and signals.', '~3 credits per company', 'Build list →',
          'M4 16V6.5L10 4l6 2.5V16M8 16v-4h4v4', () => this.ask('Build a targeted account list of companies matching our ICP')],
        [true, 'Website intent', 'Track website visitors', 'Turn anonymous website activity into qualified accounts. 342 companies visited in the last 30 days.', '96 match your ICP', 'Set up →',
          'M4 16V9M8.7 16V5M13.3 16v-6M17 16v-9', () => this.ask('Find companies visiting our website in the last 30 days')],
        [true, 'Signals', 'Create a recurring warm list', 'Automatically track accounts showing new buying signals and refresh the list every morning.', '8 signals detected this week', 'Create list →',
          'M10 13.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM4.5 15.5a7.8 7.8 0 010-11M15.5 4.5a7.8 7.8 0 010 11', () => this.ask('Create a recurring warm list of accounts showing new buying signals')],
        [true, 'Enrichment', 'Enrich your existing leads', 'Enrich missing emails, titles, LinkedIn profiles and company data across your workspace.', '412 records missing fields', 'Enrich leads →',
          'M10 3l1.6 4.4L16 9l-4.4 1.6L10 15l-1.6-4.4L4 9l4.4-1.6z', () => this.ask('Enrich missing emails, titles and LinkedIn profiles for my existing leads')],
        [!!s.connected.LinkedIn, 'Competitors', 'Find competitor-engaged prospects', 'Identify prospects interacting with competitor content on LinkedIn over the last 30 days.', '68 people engaged this month', 'Find prospects →',
          'M9 14.5a5 5 0 100-10 5 5 0 000 10zM13 13l4 4', () => this.ask('Find people engaging with our competitors on LinkedIn')],
      ].filter((n) => n[0]).map((n) => ({ tag: n[1], title: n[2], body: n[3], meta: n[4], cta: n[5], path: n[6], act: n[7] })),

      connectors: [['HubSpot', 'hs', '#EA580C'], ['Gmail', 'gm', '#DC2626'], ['Slack', 'sl', '#4A154B'], ['LinkedIn', 'in', '#0A66C2'], ['MCP', 'mcp', '#18181B'], ['Google Sheets', 'gs', '#15803D']]
        .map((c) => {
          const on = s.connected[c[0]]
          return { label: on ? c[0] : 'Connect ' + c[0], mark: c[1], bg: c[2],
            state: on ? 'Connected' : 'Not connected',
            stateColor: on ? '#15803D' : '#A1A1AA',
            border: on ? '#C7EBD5' : '#E4E4E7',
            act: () => { this.setState((st) => ({ connected: Object.assign({}, st.connected, { [c[0]]: !on }) })); this.flash(on ? c[0] + ' disconnected' : c[0] + ' connected') } }
        }),

      isPage: !!PAGES[s.page],
      pageBlurb: (PAGES[s.page] || {}).blurb || '',
      pageActionLabel: (PAGES[s.page] || {}).action || 'New research',
      pageAction: () => this.flash(((PAGES[s.page] || {}).action) || 'New research'),
      pageHasTable: !!(PAGES[s.page] || {}).cols,
      pageHasCards: !!(PAGES[s.page] || {}).cards,
      pageEmpty: !!(PAGES[s.page] || {}).empty,
      emptyTitle: ((PAGES[s.page] || {}).empty || ['', ''])[0],
      emptyBody: ((PAGES[s.page] || {}).empty || ['', ''])[1],
      pageCols: cols((PAGES[s.page] || {}).cols || []),
      pageGrid: (PAGES[s.page] || {}).grid || '1fr',
      pageRows: ((PAGES[s.page] || {}).rows || []).map((cells) => ({ cells, act: () => this.flash(cells[0] + ' opened') })),
      pageCards: ((PAGES[s.page] || {}).cards || []).map((c, i, arr) => ({
        name: c[0], desc: c[1], mark: c[2], bg: c[3], state: c[4],
        rowStyle: 'display:flex; align-items:center; gap:12px; padding:13px 14px; background:#FFFFFF; cursor:pointer; min-width:0; ' +
          (i % 2 === 0 ? 'border-right:1px solid #EFEFF0; ' : '') + (i < arr.length - 2 ? 'border-bottom:1px solid #EFEFF0' : ''),
        stateStyle: 'flex:none; padding:3px 8px; border-radius:2px; font-size:11.5px; font-weight:600; ' +
          (c[4] === 'Connected' || c[4] === 'Enabled' ? 'background:#ECFDF3; color:#15803D; border:1px solid #C7EBD5' : 'background:#F6F6F7; color:#71717A; border:1px solid #E4E4E7'),
        act: () => this.flash(c[0] + ' — ' + (c[4] === 'Connected' || c[4] === 'Enabled' ? 'configure' : 'connect')),
      })),
    }
  }
}
