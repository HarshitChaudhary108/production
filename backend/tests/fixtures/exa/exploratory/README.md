# Exploratory fixtures — NOT gate evidence

Real Exa responses recorded while verifying plumbing after the
`EXA_API_KEY` was provisioned in `backend/.env`.

Sample source: **agent-picked demo companies** (well-known SaaS
domains), NOT the team's real lists — these files must not be used as
evidence for any provider gate (see `docs/provider-gates.md`).

| fixture | gate-shape | call | date |
|---|---|---|---|
| `g1-notion-so.recorded.json` | G1 (`category: company`, `includeDomains:[domain]`) | 1× `/search` on `notion.so` | 2026-10-27 |
