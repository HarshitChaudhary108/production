"""Record a real Exa/MoltSets response into tests/fixtures/.

Usage (from backend/):

    python -m scripts.record_provider_fixture <enrichment_id> <domain> \
        [--case NAME] [--contents] [--gate g1|g2|g4] [--name "Acme, Inc."]
    python -m scripts.record_provider_fixture <tool> <domain> \
        --provider moltsets [--linkedin-url URL] [--name "Jane Doe"] \
        [--case NAME]

- Requires EXA_API_KEY (exa) or MOLTSETS_API_KEY (moltsets) in the
  environment; refuses to run without it.
- Writes ``tests/fixtures/<provider>/<enrichment_id>/<case>.recorded.json``
  containing the request body and the full response payload (extra keys
  preserved). The API key is NEVER written to the fixture file.
- Default case name is the slugified domain.
- ``--contents`` records a /contents call for https://<domain> instead of
  the default company-category /search on the domain.
- ``--gate`` records the exact request a provider gate (plan §5.3) sends:
  ``g1`` = entity resolution (category:company on the domain);
  ``g2`` = linkedin.com company-page lookup (needs --name);
  ``g4`` = find_job_openings careers query + its outputSchema.
- ``--provider moltsets`` (gate G3): <tool> is one of ``search_people``
  (filters: the domain), ``linkedin_to_business_email`` (needs
  --linkedin-url), or ``search_business_email_by_name`` (needs --name).
"""

import argparse
import asyncio
import json
import os
import re
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

# backend/ on sys.path when run as a module from backend/
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.config import Settings
from app.modules.enrichment.executors.find_job_openings import JOB_OPENINGS_SCHEMA
from app.modules.providers.exa.client import ExaClient
from app.modules.providers.exa.models import (
    build_contents_request,
    build_search_request,
)
from app.modules.providers.moltsets.client import MoltSetsClient

load_dotenv()  # API keys may live in backend/.env rather than the env

FIXTURES = Path(__file__).resolve().parents[1] / "tests" / "fixtures"
SYSTEM_PROMPT = Settings.model_fields["exa_system_prompt"].default
_MOLTSETS_TOOLS = (
    "search_people",
    "linkedin_to_business_email",
    "search_business_email_by_name",
)


def _gate_request(gate: str, domain: str, name: str | None) -> dict[str, Any]:
    """The exact /search body the gated executor (plan §5.3) sends."""
    if gate == "g1":
        return build_search_request(
            domain,
            type="auto",
            category="company",
            include_domains=[domain],
            num_results=3,
        )
    if gate == "g2":
        if not name:
            raise SystemExit("--gate g2 requires --name (company name)")
        return build_search_request(
            f"{name} company page",
            type="auto",
            include_domains=["linkedin.com"],
            num_results=3,
            contents={"highlights": True},
        )
    if gate == "g4":
        return build_search_request(
            "careers open positions",
            type="auto",
            include_domains=[domain],
            num_results=5,
            output_schema=JOB_OPENINGS_SCHEMA,
            system_prompt=SYSTEM_PROMPT,
        )
    raise SystemExit(f"unknown gate {gate!r}")


def _slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def _moltsets_request(
    tool: str, domain: str, linkedin_url: str | None, name: str | None
) -> dict[str, Any]:
    """The exact body the P4b executor sends (only documented fields)."""
    if tool == "search_people":
        return {
            "company_domain": [domain],
            "seniority": ["C Suite", "VP", "Head", "Director", "Owner"],
            "limit": 10,
            "offset": 0,
        }
    if tool == "linkedin_to_business_email":
        if not linkedin_url:
            raise SystemExit(
                "linkedin_to_business_email requires --linkedin-url"
            )
        return {"linkedin_url": linkedin_url}
    if tool == "search_business_email_by_name":
        if not name:
            raise SystemExit(
                "search_business_email_by_name requires --name"
            )
        return {"name": name, "company_domain": domain}
    raise SystemExit(f"unknown moltsets tool {tool!r}")


def _record_moltsets(args: argparse.Namespace) -> int:
    api_key = os.environ.get("MOLTSETS_API_KEY")
    if not api_key:
        print("refusing to run: MOLTSETS_API_KEY is not set", file=sys.stderr)
        return 2
    request = _moltsets_request(
        args.enrichment_id, args.domain, args.linkedin_url, args.name
    )

    async def call() -> dict[str, Any]:
        client = MoltSetsClient(api_key)
        try:
            if args.enrichment_id == "search_people":
                resp = await client.search_people(
                    company_domain=request["company_domain"],
                    seniority=request["seniority"],
                    limit=request["limit"],
                    offset=request["offset"],
                )
                return {
                    "status": resp.status,
                    "total": resp.total,
                    "people": [
                        {
                            "full_name": p.full_name,
                            "title": p.title,
                            "seniority": p.seniority,
                            "linkedin_url": p.linkedin_url,
                            "business_email": p.business_email,
                            "business_email_risk_score": (
                                p.business_email_risk_score
                            ),
                            "last_updated_at": p.last_updated_at,
                            "company": (
                                {
                                    "name": p.company.name,
                                    "domain": p.company.domain,
                                }
                                if p.company
                                else None
                            ),
                        }
                        for p in resp.people
                    ],
                }
            if args.enrichment_id == "linkedin_to_business_email":
                resp = await client.linkedin_to_business_email(
                    request["linkedin_url"]
                )
            else:
                resp = await client.search_business_email_by_name(
                    name=request["name"],
                    company_domain=request["company_domain"],
                )
            return {
                "status": resp.status,
                "email": resp.email,
                "risk_score": resp.risk_score,
                "linkedin_url": resp.linkedin_url,
            }
        finally:
            await client.aclose()

    response = asyncio.run(call())
    out_dir = FIXTURES / "moltsets" / args.enrichment_id
    out_dir.mkdir(parents=True, exist_ok=True)
    case = args.case or _slug(args.domain)
    path = out_dir / f"{case}.recorded.json"
    path.write_text(
        json.dumps(
            {
                "provider": "moltsets",
                "tool": args.enrichment_id,
                "domain": args.domain,
                "recordedAt": datetime.now(UTC).isoformat(),
                "request": request,
                "response": response,
            },
            indent=2,
            ensure_ascii=False,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"wrote {path} (status={response.get('status')})")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "--provider", choices=["exa", "moltsets"], default="exa"
    )
    parser.add_argument(
        "enrichment_id",
        help="catalog id, e.g. find_snapshot (or the moltsets tool name)",
    )
    parser.add_argument("domain", help="company domain, e.g. acme.com")
    parser.add_argument("--case", help="fixture case name (default: slug of domain)")
    parser.add_argument(
        "--contents", action="store_true",
        help="record POST /contents for https://<domain> instead of /search",
    )
    parser.add_argument(
        "--gate", choices=["g1", "g2", "g4"],
        help="record the exact provider-gate request (plan §5.3)",
    )
    parser.add_argument(
        "--name",
        help="company/person name (required by --gate g2 and "
        "search_business_email_by_name)",
    )
    parser.add_argument(
        "--linkedin-url",
        help="person LinkedIn profile URL (linkedin_to_business_email)",
    )
    args = parser.parse_args()

    if args.provider == "moltsets":
        if args.enrichment_id not in _MOLTSETS_TOOLS:
            print(
                f"unknown moltsets tool {args.enrichment_id!r} "
                f"(one of {', '.join(_MOLTSETS_TOOLS)})",
                file=sys.stderr,
            )
            return 2
        return _record_moltsets(args)

    api_key = os.environ.get("EXA_API_KEY")
    if not api_key:
        print("refusing to run: EXA_API_KEY is not set", file=sys.stderr)
        return 2

    if args.contents and args.gate:
        print("refusing to run: --contents and --gate are exclusive", file=sys.stderr)
        return 2

    if args.gate:
        request = _gate_request(args.gate, args.domain, args.name)
        endpoint = "search"
    elif args.contents:
        request = build_contents_request(
            [f"https://{args.domain}"], text={"maxCharacters": 2000},
            highlights=True, extras={"links": 50},
        )
        endpoint = "contents"
    else:
        request = build_search_request(
            f"{args.enrichment_id} {args.domain}",
            type="auto",
            category="company",
            include_domains=[args.domain],
            num_results=5,
        )
        endpoint = "search"

    async def call() -> dict[str, Any]:
        client = ExaClient(api_key)
        try:
            resp = (
                await client.contents(request)
                if endpoint == "contents"
                else await client.search(request)
            )
            return resp.model_dump(mode="json", by_alias=True)
        finally:
            await client.aclose()

    response = asyncio.run(call())
    out_dir = FIXTURES / "exa" / args.enrichment_id
    out_dir.mkdir(parents=True, exist_ok=True)
    case = args.case or _slug(args.domain)
    path = out_dir / f"{case}.recorded.json"
    path.write_text(
        json.dumps(
            {
                "enrichmentId": args.enrichment_id,
                "domain": args.domain,
                "endpoint": endpoint,
                "recordedAt": datetime.now(UTC).isoformat(),
                "request": request,
                "response": response,
            },
            indent=2,
            ensure_ascii=False,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"wrote {path} (requestId={response.get('requestId')})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
