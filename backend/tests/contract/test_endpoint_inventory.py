"""V1: the public API surface is exactly the nine data-enrichment/job
endpoints plus ``/health`` — anything missing or extra fails.

Path parameters are normalised to ``{}`` before comparison: the contract
writes ``{jobId}``/``{runId}`` while FastAPI publishes the declared Python
parameter names (``{job_id}``/``{run_id}``); only the route shape matters.
"""

import re

from app.config import Settings
from app.main import create_app

EXPECTED = {
    ("GET", "/api/v1/me"),
    ("GET", "/api/v1/jobs/{}"),
    ("GET", "/api/v1/jobs/{}/events"),
    ("POST", "/api/v1/jobs/{}/pause"),
    ("POST", "/api/v1/jobs/{}/resume"),
    ("POST", "/api/v1/jobs/{}/cancel"),
    ("GET", "/api/v1/enrichments/catalog"),
    ("POST", "/api/v1/enrichments/runs"),
    ("GET", "/api/v1/enrichments/runs/{}"),
    ("GET", "/health"),
}


def _shape(path: str) -> str:
    return re.sub(r"\{[^}]*\}", "{}", path)


def test_endpoint_inventory_is_exactly_the_nine_plus_health(
    settings: Settings,
) -> None:
    actual = {
        (method.upper(), _shape(path))
        for path, ops in create_app(settings).openapi()["paths"].items()
        for method in ops
    }
    missing = EXPECTED - actual
    extra = actual - EXPECTED
    assert not missing, f"missing endpoints: {sorted(missing)}"
    assert not extra, f"unexpected endpoints: {sorted(extra)}"
