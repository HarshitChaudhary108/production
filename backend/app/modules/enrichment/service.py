"""Enrichment runs (plan §9.2 + SA adaptations, prompt pack P5).

``create_run`` mirrors ``mock-api.mjs`` ``validateRun``/``createRun`` in error
codes and message strings, extended with the pack's P5 checks in pack order:

1.  non-empty ``target.rowIds``            -> 422 validation_error
2.  non-empty ``columns``                  -> 422 validation_error
3.  ``target.sheetId`` required            -> 422 validation_error
4.  row count <= ``run_max_rows``          -> 422 validation_error
5.  unique column keys                     -> 422 duplicate_column_key
6.  known + enabled enrichment             -> 422 unknown_enrichment
7.  executor resolves (plain_value, P4b)   -> 422 not_runnable
8.  catalog appliesTo matches sheet kind   -> 422 validation_error
9.  every rowId exists in that sheet       -> 422 unknown_row_ids
10. an existing column key keeps its
    enrichmentId                           -> 422 validation_error

Eligibility (§8.3 + prompt1.md D1/D2): cells that are ``pending``/``running``
or ``user_edited`` (without ``overwriteEdited``) are skipped — atomically, via
``sheets.queue_cells_for_run``. Zero eligible cells -> 422 validation_error
with ``details.reason == "no_eligible_cells"``.

No credit check exists (SA-1); ``estimated_credits`` is the derived display
sum over eligible cells only (SA-2).
"""

from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import Settings
from app.errors import ApiError
from app.ids import new_id
from app.modules.catalog import registry
from app.modules.enrichment.models import EnrichmentRun
from app.modules.jobs import service as jobs_service
from app.modules.jobs.models import Job, JobItem
from app.modules.providers.moltsets import rate_limit as moltsets_gate
from app.modules.sheets import service as sheets


def _validation_error(message: str, details: dict[str, Any] | None = None) -> ApiError:
    return ApiError(422, "validation_error", message, details)


def create_run(
    s: Session,
    *,
    workspace_id: str,
    body: dict[str, Any],
    settings: Settings,
) -> tuple[EnrichmentRun, Job]:
    target = body.get("target")
    if not isinstance(target, dict):
        target = {}
    row_ids = target.get("rowIds")
    if not isinstance(row_ids, list) or not row_ids:
        raise _validation_error("target.rowIds must be a non-empty array.")
    row_ids = list(dict.fromkeys(row_ids))  # dedupe, keep request order
    columns_body = body.get("columns")
    if not isinstance(columns_body, list) or not columns_body:
        raise _validation_error("columns must be a non-empty array.")
    sheet_id = target.get("sheetId")
    if not isinstance(sheet_id, str) or not sheet_id:
        raise _validation_error("target.sheetId is required.")
    if len(row_ids) > settings.run_max_rows:
        raise _validation_error(
            f"rowIds exceeds the per-run limit of {settings.run_max_rows}.",
            {"limit": settings.run_max_rows},
        )
    sheet = sheets.get_sheet(s, sheet_id)

    visible_ids = {e.id for e in registry.visible_catalog(settings)}
    specs: list[tuple[str, dict[str, Any], registry.CatalogEntry]] = []
    seen: set[str] = set()
    for column in columns_body:
        key = column.get("key") if isinstance(column, dict) else None
        if not isinstance(key, str) or not key:
            raise _validation_error("Each column needs a key.")
        if key in seen:
            raise ApiError(
                422, "duplicate_column_key", f'Duplicate column key "{key}".'
            )
        seen.add(key)
        enrichment_id = column.get("enrichmentId")
        entry = (
            registry.CATALOG_BY_ID.get(enrichment_id)
            if isinstance(enrichment_id, str)
            else None
        )
        if entry is None or entry.id not in visible_ids:
            raise ApiError(
                422, "unknown_enrichment",
                f'Unknown enrichment "{enrichment_id}".',
            )
        try:
            registry.resolve_executor(entry)
        except LookupError:
            raise ApiError(
                422, "not_runnable",
                f'Enrichment "{enrichment_id}" cannot run.',
            ) from None
        if entry.applies_to != "any" and entry.applies_to != sheet.kind:
            raise _validation_error(
                f'Enrichment "{enrichment_id}" does not apply to {sheet.kind} sheets.',
                {"enrichmentId": enrichment_id, "appliesTo": entry.applies_to},
            )
        specs.append((key, column, entry))

    # rows must exist in the target sheet (pack order: after column checks)
    found_rows = _rows_in_sheet(s, sheet.id, row_ids)
    unknown = [rid for rid in row_ids if rid not in found_rows]
    if unknown:
        raise ApiError(
            422, "unknown_row_ids", "Some rowIds do not exist.",
            {"unknown": unknown},
        )
    rows = [found_rows[rid] for rid in row_ids]

    # an existing (live) column key must keep its enrichmentId
    existing_by_key = {c.key: c for c in sheets.list_columns(s, sheet.id)}
    for key, _spec, entry in specs:
        existing = existing_by_key.get(key)
        if existing is not None and existing.enrichment_id != entry.id:
            raise _validation_error(
                f'Column "{key}" is already bound to enrichment '
                f'"{existing.enrichment_id}".',
                {"key": key, "enrichmentId": existing.enrichment_id},
            )

    # resolve or create the sheet columns (sheets service owns the write)
    columns = []
    costs: dict[str, int] = {}
    column_specs: list[dict[str, Any]] = []
    for key, spec, entry in specs:
        col = existing_by_key.get(key)
        if col is None:
            col = sheets.add_column(
                s,
                sheet.id,
                key=key,
                label=spec.get("label") or entry.name,
                type=spec.get("type") or entry.output_type,
                enrichment_id=entry.id,
                prompt=spec.get("prompt") or entry.description,
                params=spec.get("params"),
            )
        columns.append(col)
        costs[col.id] = int(entry.cost)
        column_specs.append(
            {
                "key": col.key,
                "label": col.label,
                "type": col.type,
                "enrichmentId": col.enrichment_id,
                "prompt": col.prompt,
            }
        )

    run = EnrichmentRun(
        id=new_id("enr"),
        sheet_id=sheet.id,
        columns=column_specs,
        estimated_credits=0,
        charged_credits=0,
        status="queued",
    )
    s.add(run)
    s.flush()

    # atomic eligibility claim (prompt: "the same transaction that creates the
    # run must atomically queue eligible cells")
    column_ids = [c.id for c in columns]
    pre_cells = sheets.list_cells(s, row_ids=row_ids, column_ids=column_ids)
    queued = sheets.queue_cells_for_run(
        s,
        row_ids=row_ids,
        column_ids=column_ids,
        run_id=run.id,
        overwrite_edited=bool(body.get("overwriteEdited")),
    )
    if not queued:
        skipped = {"userEdited": 0, "inProgress": 0}
        for cell in pre_cells:
            if cell.status in ("pending", "running"):
                skipped["inProgress"] += 1
            elif cell.user_edited:
                skipped["userEdited"] += 1
        raise _validation_error(
            "No eligible cells to run.",
            {"reason": "no_eligible_cells", "skipped": skipped},
        )

    job = jobs_service.create_cell_job(
        s,
        workspace_id=workspace_id,
        job_type="enrichment",
        run_id=run.id,
        sheet_id=sheet.id,
        columns=columns,
        rows=rows,
        column_costs=costs,
        pairs=queued,
        refresh=bool(body.get("refresh")),
        reserved_records={
            c.id: n
            for c in columns
            if (
                n := moltsets_gate.reserved_records_for(
                    c.enrichment_id, c.params
                )
            )
            > 0
        },
    )
    run.job_id = job.id
    run.estimated_credits = job.estimated_credits
    s.flush()
    return run, job


def _rows_in_sheet(
    s: Session, sheet_id: str, row_ids: list[Any]
) -> dict[str, Any]:
    """{row_id: row} for ids that exist in the sheet (order kept by caller)."""
    rows = sheets.list_rows(s, sheet_id)
    wanted = set(row_ids)
    return {r.id: r for r in rows if r.id in wanted}


# ------------------------------------------------------------------ run view


def run_view(s: Session, run: EnrichmentRun, job: Job) -> dict[str, Any]:
    """Mirror of mock runView: one cell entry per queued (row x column),
    sorted column-major (column order first, then requested row order)."""
    row_ids: list[str] = (job.parent_ref or {}).get("rowIds") or []
    col_keys: list[str] = [c["key"] for c in (run.columns or [])]
    row_order = {rid: i for i, rid in enumerate(row_ids)}
    col_order = {key: i for i, key in enumerate(col_keys)}
    items = list(
        s.execute(
            select(JobItem).where(JobItem.job_id == job.id)
        ).scalars()
    )
    cells: list[dict[str, Any]] = []
    for item in items:
        if item.row_id is None or item.column_id is None:
            continue
        column = sheets.get_column_by_id(s, item.column_id)
        if column is None:
            continue
        cell = sheets.get_cell(s, item.row_id, item.column_id)
        if cell is None:
            cells.append(jobs_service.pending_cell_view(item.row_id, column))
        else:
            cells.append(jobs_service.cell_view(cell, column, s))
    cells.sort(
        key=lambda c: (
            col_order.get(c["columnKey"], 0),
            row_order.get(c["rowId"], 0),
        )
    )
    return {
        "id": run.id,
        "jobId": run.job_id,
        "sheetId": run.sheet_id,
        "status": run.status,
        "columns": run.columns,
        "estimatedCredits": run.estimated_credits,
        "chargedCredits": run.charged_credits,
        "cells": cells,
    }


def get_run_view(
    s: Session, *, workspace_id: str, run_id: str
) -> dict[str, Any]:
    run = s.get(EnrichmentRun, run_id)
    if run is None:
        raise ApiError(404, "not_found", "Run not found.", {"runId": run_id})
    job = s.get(Job, run.job_id) if run.job_id else None
    if job is None or job.workspace_id != workspace_id:
        raise ApiError(404, "not_found", "Run not found.", {"runId": run_id})
    return run_view(s, run, job)
