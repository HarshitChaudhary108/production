"""Run a provider gate sample (plan §5.3) against live Exa.

Usage (from backend/)::

    python -m scripts.run_provider_gate g1|g2|g4

- Reads the sample CSV from ``tests/fixtures/gates/`` and REFUSES to run
  when it holds fewer data rows than §5.3 requires (G1 30 domains,
  G2 20 name+domain pairs, G4 20 domains) — a gate result is only
  meaningful against the full real-list sample.
- Per row, sends the exact request the gated executor makes (same
  shapes as ``record_provider_fixture --gate``) and writes one
  ``<slug>.recorded.json`` per row under
  ``tests/fixtures/exa/<enrichment_id>/``.
- Prints a per-row hit line plus a summary (calls, hits, hit-rate, csv
  sha256) for the human to paste into ``docs/provider-gates.md``.
- Requires ``EXA_API_KEY`` in the environment or ``backend/.env``.
  This script makes LIVE provider calls — it is not part of pytest.
"""

import asyncio
import csv
import hashlib
import json
import os
import sys
from datetime import UTC, datetime
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.modules.providers.exa.client import ExaClient
from app.modules.providers.exa.models import ExaResponse
from scripts.record_provider_fixture import _gate_request, _slug

load_dotenv()  # EXA_API_KEY may live in backend/.env rather than the env

GATES_DIR = Path(__file__).resolve().parents[1] / "tests" / "fixtures" / "gates"
FIXTURES = Path(__file__).resolve().parents[1] / "tests" / "fixtures" / "exa"

# gate -> (csv filename, min data rows, enrichment_id for fixture dir,
#          required csv columns)
GATES: dict[str, tuple[str, int, str, tuple[str, ...]]] = {
    "g1": ("g1_domains.csv", 30, "find_snapshot", ("domain",)),
    "g2": ("g2_companies.csv", 20, "find_linkedin_highlights",
           ("name", "domain")),
    "g4": ("g4_domains.csv", 20, "find_job_openings", ("domain",)),
}


def _load_rows(gate: str) -> tuple[Path, list[dict[str, str]]]:
    csv_name, min_rows, _, columns = GATES[gate]
    path = GATES_DIR / csv_name
    if not path.exists():
        raise SystemExit(f"missing sample file: {path}")
    with path.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(
            line for line in fh if not line.lstrip().startswith("#")
        )
        rows = [
            {k: (v or "").strip() for k, v in row.items()}
            for row in reader
            if any((v or "").strip() for v in row.values())
        ]
    bad = [r for r in rows if any(not r.get(c) for c in columns)]
    if bad:
        raise SystemExit(
            f"{csv_name}: {len(bad)} row(s) missing {columns}: {bad[:3]}"
        )
    if len(rows) < min_rows:
        raise SystemExit(
            f"refusing to run: {csv_name} has {len(rows)} data rows, "
            f"gate {gate.upper()} requires >= {min_rows} "
            f"(fill it from the team's real lists, plan §5.3)"
        )
    return path, rows


def _csv_sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()[:16]


def _is_hit(gate: str, resp: ExaResponse, domain: str) -> bool:
    if gate == "g1":
        return any(
            _host(r.url) == domain or (_host(r.url) or "").endswith(f".{domain}")
            for r in resp.results
        )
    if gate == "g2":
        return any(
            (_host(r.url) or "") in ("linkedin.com", "www.linkedin.com")
            and (urlparse(r.url or "").path or "").startswith("/company/")
            for r in resp.results
        )
    # g4: content present + at least one citation on the company domain;
    # correctness itself is the human's review.
    content = resp.output.content if resp.output else None
    if not isinstance(content, dict) or content.get("openRoleCount") is None:
        return False
    grounding = resp.output.grounding if resp.output else []
    return any(
        (c.url or "") and (
            _host(c.url) == domain
            or (_host(c.url) or "").endswith(f".{domain}")
        )
        for g in grounding
        for c in g.citations
    )


def _host(url: str | None) -> str | None:
    if not url:
        return None
    return urlparse(url if "://" in url else f"https://{url}").hostname


def _brief(gate: str, resp: ExaResponse) -> str:
    if gate == "g2":
        for r in resp.results:
            if "/company/" in (r.url or ""):
                return f"company page: {r.url}"
        return f"top: {resp.results[0].url if resp.results else 'none'}"
    if gate == "g4" and resp.output:
        return f"content={json.dumps(resp.output.content)[:120]}"
    first = resp.results[0].url if resp.results else "none"
    return f"top: {first}"


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1] not in GATES:
        print("usage: python -m scripts.run_provider_gate g1|g2|g4", file=sys.stderr)
        return 2
    gate = sys.argv[1]
    if not os.environ.get("EXA_API_KEY"):
        print("refusing to run: EXA_API_KEY is not set", file=sys.stderr)
        return 2

    csv_path, rows = _load_rows(gate)
    _, _, enrichment_id, _ = GATES[gate]
    out_dir = FIXTURES / enrichment_id
    out_dir.mkdir(parents=True, exist_ok=True)
    sha = _csv_sha256(csv_path)
    print(
        f"gate {gate.upper()}: {len(rows)} rows from {csv_path.name} "
        f"(sha256:{sha}) — making {len(rows)} live Exa calls"
    )

    async def run() -> tuple[int, int]:
        client = ExaClient(os.environ["EXA_API_KEY"])
        hits = calls = 0
        try:
            for row in rows:
                request = _gate_request(gate, row["domain"], row.get("name"))
                resp = await client.search(request)
                calls += 1
                hit = _is_hit(gate, resp, row["domain"])
                hits += hit
                case = _slug(row["domain"])
                (out_dir / f"{case}.recorded.json").write_text(
                    json.dumps(
                        {
                            "gate": gate,
                            "enrichmentId": enrichment_id,
                            "row": row,
                            "endpoint": "search",
                            "recordedAt": datetime.now(UTC).isoformat(),
                            "request": request,
                            "response": resp.model_dump(
                                mode="json", by_alias=True
                            ),
                        },
                        indent=2,
                        ensure_ascii=False,
                    )
                    + "\n",
                    encoding="utf-8",
                )
                print(
                    f"  [{'HIT' if hit else 'miss'}] {row['domain']:<32} "
                    f"{_brief(gate, resp)}"
                )
        finally:
            await client.aclose()
        return calls, hits

    calls, hits = asyncio.run(run())
    rate = hits / calls if calls else 0.0
    print(
        f"gate {gate.upper()}: {calls} calls, {hits} hits "
        f"({rate:.0%}); csv={csv_path.name} rows={len(rows)} sha256:{sha}\n"
        f"-> paste this row into docs/provider-gates.md; "
        f"PASS/FAIL stays blank until the reviewer signs (threshold Q5)."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
