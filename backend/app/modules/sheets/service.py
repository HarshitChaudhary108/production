"""The ONLY writer of sheets, columns, rows, cells, cell_sources (plan §8.4).

Every function takes a Session owned by the caller; this module never commits.
Rules below mirror the §8.4 table and `gridUtils.ts` (sanitizeEdit, canEditColumn,
EDITABLE_SOURCE_COLUMNS). N3 (answered): a sanitized-null edit clears the field.
"""

import re
from collections.abc import Iterable
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import ColumnElement, String, and_, delete, func, literal, or_, select, values
from sqlalchemy import column as sa_column
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from app.errors import ApiError
from app.ids import new_id
from app.modules.jobs.models import Job, JobItem
from app.modules.sheets.models import Cell, CellSource, Row, Sheet, SheetColumn
from app.modules.sheets.normalize import normalized_domain, normalized_name

EDITABLE_BASE_FIELDS = ["domain", "emp", "loc", "gap", "last"]
EDITABLE_CELL_TYPES = ("plain_value", "custom")
EMP_MAX = 10_000_000
STR_MAX = 500
_NON_DIGIT_RE = re.compile(r"[^0-9]")
_NON_ALNUM_RE = re.compile(r"[^a-z0-9]+")
_RUNNING_JOB_STATUSES = ("queued", "running", "paused")


def _utcnow() -> datetime:
    return datetime.now(UTC)


# ------------------------------------------------------------------ reads


def get_sheet(s: Session, sheet_id: str) -> Sheet:
    sheet = s.get(Sheet, sheet_id)
    if sheet is None:
        raise ApiError(404, "not_found", "sheet not found", {"sheetId": sheet_id})
    return sheet


def get_column_by_id(s: Session, column_id: str) -> SheetColumn | None:
    """Look a column up by primary key (deleted columns included — enrichment
    writes must still resolve the column while a job runs)."""
    return s.get(SheetColumn, column_id)


def get_column(s: Session, sheet_id: str, column_id_or_key: str) -> SheetColumn:
    col = s.execute(
        select(SheetColumn).where(
            SheetColumn.sheet_id == sheet_id,
            SheetColumn.deleted_at.is_(None),
            or_(
                SheetColumn.id == column_id_or_key, SheetColumn.key == column_id_or_key
            ),
        )
    ).scalar_one_or_none()
    if col is None:
        raise ApiError(404, "not_found", "column not found", {"column": column_id_or_key})
    return col


def list_columns(s: Session, sheet_id: str) -> list[SheetColumn]:
    return list(
        s.execute(
            select(SheetColumn)
            .where(SheetColumn.sheet_id == sheet_id, SheetColumn.deleted_at.is_(None))
            .order_by(SheetColumn.position, SheetColumn.id)
        ).scalars()
    )


def get_row(s: Session, row_id: str) -> Row:
    row = s.get(Row, row_id)
    if row is None:
        raise ApiError(404, "not_found", "row not found", {"rowId": row_id})
    return row


def list_rows(s: Session, sheet_id: str) -> list[Row]:
    stmt = (
        select(Row)
        .where(Row.sheet_id == sheet_id)
        .order_by(Row.created_at, Row.id)
    )
    return list(s.execute(stmt).scalars())


def get_cell(s: Session, row_id: str, column_id: str) -> Cell | None:
    return s.get(Cell, (row_id, column_id))


def list_cells(
    s: Session, *, row_ids: Iterable[str], column_ids: Iterable[str]
) -> list[Cell]:
    """All cells in the row x column cross product (pre-queue snapshot)."""
    rid, cid = list(row_ids), list(column_ids)
    if not rid or not cid:
        return []
    return list(
        s.execute(
            select(Cell).where(Cell.row_id.in_(rid), Cell.column_id.in_(cid))
        ).scalars()
    )


def list_cell_sources(s: Session, row_id: str, column_id: str) -> list[CellSource]:
    return list(
        s.execute(
            select(CellSource).where(
                CellSource.row_id == row_id, CellSource.column_id == column_id
            )
        ).scalars()
    )


# ------------------------------------------------------------------ sanitize


def sanitize_edit(key: str, raw: str) -> str | int | None:
    """Mirror of gridUtils.sanitizeEdit. None means 'empty' — the caller clears
    the field (N3: empty clears the field)."""
    value = re.sub(r"\r\n?", "\n", raw).strip()
    if not value:
        return None
    if key == "emp":
        digits = _NON_DIGIT_RE.sub("", value)
        if not digits:
            return None
        return min(EMP_MAX, int(digits))
    return value[:STR_MAX]


# ------------------------------------------------------------------ writes


def create_sheet(
    s: Session,
    *,
    key: str,
    name: str,
    kind: str,
    project_id: str | None = None,
) -> Sheet:
    sheet = Sheet(id=new_id("sh"), project_id=project_id, key=key, name=name, kind=kind)
    s.add(sheet)
    s.flush()
    return sheet


def _row_key(row_data: dict[str, Any]) -> str | None:
    domain = normalized_domain(row_data.get("domain"))
    if domain:
        return "d:" + domain
    name = normalized_name(row_data.get("name"))
    if name:
        return "n:" + name
    return None


def add_base_rows(
    s: Session, sheet_id: str, rows: Iterable[dict[str, Any]]
) -> dict[str, int]:
    """Dedupe by normalized_domain; rows without a domain dedupe by normalized name."""
    get_sheet(s, sheet_id)
    existing_keys = {
        _row_key(dict(r.data)) for r in s.execute(
            select(Row).where(Row.sheet_id == sheet_id)
        ).scalars()
    }
    existing_keys.discard(None)
    inserted = 0
    duplicates = 0
    for data in rows:
        key = _row_key(data)
        if key is not None and key in existing_keys:
            duplicates += 1
            continue
        if key is not None:
            existing_keys.add(key)
        s.add(
            Row(
                id=new_id("row"),
                sheet_id=sheet_id,
                data=dict(data),
                normalized_domain=normalized_domain(data.get("domain")),
            )
        )
        inserted += 1
    s.flush()
    return {"inserted": inserted, "duplicates": duplicates}


def _slugify(label: str) -> str:
    slug = _NON_ALNUM_RE.sub("_", label.lower()).strip("_")
    return slug or "col"


def add_column(
    s: Session,
    sheet_id: str,
    *,
    label: str,
    type: str,
    enrichment_id: str | None = None,
    prompt: str | None = None,
    params: dict[str, Any] | None = None,
    hidden: bool = False,
    is_base: bool = False,
    position: int | None = None,
    key: str | None = None,
) -> SheetColumn:
    """Unique key per sheet: slug of label, suffixed _2, _3… on collision.
    An explicit ``key`` is used verbatim; a collision then raises
    422 duplicate_column_key (run requests choose their own keys)."""
    get_sheet(s, sheet_id)
    existing = {
        c.key
        for c in s.execute(
            select(SheetColumn).where(SheetColumn.sheet_id == sheet_id)
        ).scalars()
    }
    if key is not None:
        if key in existing:
            raise ApiError(
                422,
                "duplicate_column_key",
                f'Duplicate column key "{key}".',
                {"key": key},
            )
    else:
        base = _slugify(label)
        key = base
        n = 2
        while key in existing:
            key = f"{base}_{n}"
            n += 1
    if position is None:
        position = (
            s.execute(
                select(func.max(SheetColumn.position)).where(
                    SheetColumn.sheet_id == sheet_id
                )
            ).scalar_one()
            or 0
        ) + 1
    col = SheetColumn(
        id=new_id("col"),
        sheet_id=sheet_id,
        key=key,
        label=label,
        type=type,
        enrichment_id=enrichment_id,
        prompt=prompt,
        params=params,
        position=position,
        hidden=hidden,
        is_base=is_base,
    )
    s.add(col)
    s.flush()
    return col


def edit_base_field(
    s: Session,
    row_id: str,
    *,
    key: str,
    value: str,
    expected_revision: int | None = None,
) -> Row:
    """Only domain/emp/loc/gap/last are editable (same list as gridUtils).
    expectedRevision mismatch → 409 revision_conflict. Editing `domain` marks
    the row's enrichment cells stale=true (values kept). N3: a sanitized-null
    value clears the field."""
    row = get_row(s, row_id)
    if key not in EDITABLE_BASE_FIELDS:
        raise ApiError(422, "not_editable", f"field {key!r} is not editable", {"key": key})
    if expected_revision is not None and row.revision != expected_revision:
        raise ApiError(
            409,
            "revision_conflict",
            "row was edited since you read it",
            {"expectedRevision": expected_revision, "revision": row.revision},
        )
    sanitized = sanitize_edit(key, value)
    data = dict(row.data or {})
    data[key] = sanitized  # None → cleared (N3)
    if key == "domain":
        row.normalized_domain = normalized_domain(sanitized if isinstance(sanitized, str) else None)
        enrichment_cells = s.execute(
            select(Cell)
            .join(SheetColumn, Cell.column_id == SheetColumn.id)
            .where(
                Cell.row_id == row.id,
                or_(SheetColumn.enrichment_id.isnot(None), SheetColumn.type == "custom_prompt"),
            )
        ).scalars()
        for cell in enrichment_cells:
            cell.stale = True
    row.data = data
    row.revision = (row.revision or 0) + 1
    s.flush()
    return row


def edit_cell(s: Session, row_id: str, column_id: str, value: Any) -> Cell:
    """Allowed on plain_value and custom columns only. Sets user_edited=true,
    source='user', provenance=null. A running cell → 409 cell_running."""
    get_row(s, row_id)
    col = s.get(SheetColumn, column_id)
    if col is None or col.deleted_at is not None:
        raise ApiError(404, "not_found", "column not found", {"columnId": column_id})
    if col.type not in EDITABLE_CELL_TYPES:
        raise ApiError(
            422,
            "not_editable",
            f"column type {col.type!r} is not editable",
            {"columnId": column_id, "type": col.type},
        )
    cell = s.get(Cell, (row_id, column_id))
    if cell is not None and cell.status == "running":
        raise ApiError(409, "cell_running", "cell is running", {"columnId": column_id})
    if cell is None:
        cell = Cell(row_id=row_id, column_id=column_id, status="succeeded")
        s.add(cell)
    cell.value = value
    cell.status = "succeeded"
    cell.user_edited = True
    cell.source = "user"
    cell.provenance = None
    cell.revision = (cell.revision or 0) + 1
    s.flush()
    return cell


def write_enrichment_result(
    s: Session,
    row_id: str,
    column_id: str,
    *,
    status: str,
    value: Any = None,
    provenance: str | None = None,
    source: str | None = None,
    sources: Iterable[dict[str, Any]] = (),
    confidence: float | None = None,
    confidence_label: str | None = None,
    cost: int = 0,
    error: dict[str, Any] | None = None,
    fetched_at: datetime | None = None,
    set_fetched_at: bool = True,
    run_id: str | None = None,
) -> Cell | None:
    """Write a provider result to a cell. Skips the write if the cell became
    user_edited while running (result stays in job_items.result, uncharged).
    Clears stale. Returns None when skipped.

    ``set_fetched_at=False`` keeps ``fetched_at`` null for non-result writes
    (e.g. marking a cell ``running`` at claim time)."""
    cell = s.get(Cell, (row_id, column_id))
    if cell is not None and cell.user_edited:
        return None
    if cell is None:
        cell = Cell(row_id=row_id, column_id=column_id)
        s.add(cell)
    cell.status = status
    cell.value = value
    cell.provenance = provenance
    cell.source = source
    cell.confidence = confidence
    cell.confidence_label = confidence_label
    cell.cost = cost
    cell.error = error
    if set_fetched_at:
        cell.fetched_at = fetched_at or _utcnow()
    cell.last_run_id = run_id
    cell.stale = False
    cell.revision = (cell.revision or 0) + 1
    s.execute(
        delete(CellSource).where(
            CellSource.row_id == row_id, CellSource.column_id == column_id
        )
    )
    for src in sources:
        s.add(
            CellSource(
                id=new_id("enr"),
                row_id=row_id,
                column_id=column_id,
                url=src.get("url"),
                title=src.get("title"),
                provider=source,
                captured_at=_utcnow(),
            )
        )
    s.flush()
    return cell


def _job_running_on_column(s: Session, column_id: str) -> bool:
    return (
        s.execute(
            select(JobItem.id)
            .join(Job, JobItem.job_id == Job.id)
            .where(
                JobItem.column_id == column_id,
                Job.status.in_(_RUNNING_JOB_STATUSES),
            )
            .limit(1)
        ).scalar_one_or_none()
        is not None
    )


def clear_column_results(s: Session, sheet_id: str, column_id: str) -> int:
    """Removes values/status of non-user-edited cells of one column.
    409 invalid_state if a job is running on that column."""
    col = get_column(s, sheet_id, column_id)
    if _job_running_on_column(s, col.id):
        raise ApiError(
            409, "invalid_state", "a job is running on this column", {"columnId": col.id}
        )
    doomed = s.execute(
        select(Cell.row_id).where(
            Cell.column_id == col.id, Cell.user_edited.is_(False)
        )
    ).scalars()
    row_ids = list(doomed)
    if row_ids:
        s.execute(
            delete(CellSource).where(
                CellSource.column_id == col.id, CellSource.row_id.in_(row_ids)
            )
        )
        s.execute(
            delete(Cell).where(
                Cell.column_id == col.id,
                Cell.row_id.in_(row_ids),
                Cell.user_edited.is_(False),
            )
        )
    s.flush()
    return len(row_ids)


def remove_column(s: Session, sheet_id: str, column_id: str) -> SheetColumn:
    """Soft delete: deleted_at set; reads filter it out. 409 if a job is running."""
    col = get_column(s, sheet_id, column_id)
    if _job_running_on_column(s, col.id):
        raise ApiError(
            409, "invalid_state", "a job is running on this column", {"columnId": col.id}
        )
    col.deleted_at = _utcnow()
    s.flush()
    return col


# ------------------------------------------------------------------ run queueing (P5)


def queue_cells_for_run(
    s: Session,
    *,
    row_ids: list[str],
    column_ids: list[str],
    run_id: str,
    overwrite_edited: bool,
) -> list[tuple[str, str]]:
    """Atomically claim cells for a run: INSERT missing cells as ``pending``,
    flip eligible existing cells back to ``pending``. Skips (does not touch)
    cells that are pending/running, or user_edited unless ``overwrite_edited``
    (prompt1.md D1). Overwritten user_edited cells have the flag cleared so the
    run takes ownership (§8.4: the cell is only protected while user-owned).

    One INSERT … ON CONFLICT DO UPDATE — a racing run cannot double-queue a
    cell (P5 prompt: atomic cell update). Returns the queued (row_id,
    column_id) pairs."""
    if not row_ids or not column_ids:
        return []
    pair_values = values(
        sa_column("row_id", String), sa_column("column_id", String), name="p"
    ).data([(r, c) for r in row_ids for c in column_ids])
    update_where: ColumnElement[bool] = Cell.status.notin_(("pending", "running"))
    if not overwrite_edited:
        update_where = and_(update_where, Cell.user_edited.is_(False))
    stmt = (
        pg_insert(Cell)
        .from_select(
            ["row_id", "column_id", "status", "last_run_id"],
            select(
                pair_values.c.row_id,
                pair_values.c.column_id,
                literal("pending"),
                literal(run_id),
            ),
        )
        .on_conflict_do_update(
            index_elements=["row_id", "column_id"],
            set_={
                "status": "pending",
                "last_run_id": run_id,
                "user_edited": False,
                "error": None,
            },
            where=update_where,
        )
        .returning(Cell.row_id, Cell.column_id)
    )
    return [(str(r), str(c)) for r, c in s.execute(stmt).all()]


# ------------------------------------------------------------------ signals sheet (P5, plan §8.7)

# N4 answered (human): Signals sheet base columns are the contract Signal
# fields. Labels match outmate-home SignalsSheet.tsx. freshness/relevance
# exist as columns but stay null until a scorer exists (contract A5).
SIGNALS_BASE_COLUMNS: tuple[tuple[str, str], ...] = (
    ("companyName", "Company"),
    ("type", "Signal Type"),
    ("detail", "Signal"),
    ("source", "Source"),
    ("detectedAt", "Detected"),
    ("confidence", "Strength"),
    ("freshness", "Freshness"),
    ("relevance", "Buying Relevance"),
)

_SIGNALS_SHEET_KEY = "signals"


def get_or_create_signals_sheet(s: Session, *, project_id: str | None) -> Sheet:
    """Lazy Signals sheet per project (or global when project_id is null).
    An advisory lock keyed on the project serializes first creation."""
    s.execute(
        select(func.pg_advisory_xact_lock(func.hashtext(f"signals:{project_id or ''}")))
    )
    sheet = s.execute(
        select(Sheet).where(
            Sheet.kind == "signals",
            Sheet.project_id.is_(None)
            if project_id is None
            else Sheet.project_id == project_id,
        )
    ).scalar_one_or_none()
    if sheet is None:
        sheet = create_sheet(
            s, key=_SIGNALS_SHEET_KEY, name="Signals", kind="signals",
            project_id=project_id,
        )
        for key, label in SIGNALS_BASE_COLUMNS:
            add_column(
                s, sheet.id, label=label, type="text", is_base=True, key=key
            )
    return sheet


def upsert_signal_rows(
    s: Session, *, company_row_id: str, signals: Iterable[dict[str, Any]]
) -> int:
    """Insert signal rows linked to a company row (D4 dedupe: same company +
    type + source + detail is inserted once). ``signals`` dicts carry the
    contract Signal fields; row.company_row_id is the link (companyId)."""
    drafts = list(signals)
    if not drafts:
        return 0
    company_row = get_row(s, company_row_id)
    parent_sheet = get_sheet(s, company_row.sheet_id)
    sheet = get_or_create_signals_sheet(s, project_id=parent_sheet.project_id)
    existing = {
        (r.data.get("type"), r.data.get("source"), r.data.get("detail"))
        for r in s.execute(
            select(Row).where(
                Row.sheet_id == sheet.id, Row.company_row_id == company_row_id
            )
        ).scalars()
    }
    inserted = 0
    for d in drafts:
        key = (d.get("type"), d.get("source"), d.get("detail"))
        if key in existing:
            continue
        s.add(
            Row(
                id=new_id("row"),
                sheet_id=sheet.id,
                company_row_id=company_row_id,
                data={
                    "companyName": d.get("companyName"),
                    "type": d.get("type"),
                    "detail": d.get("detail"),
                    "source": d.get("source"),
                    "detectedAt": d.get("detectedAt"),
                    "confidence": d.get("confidence"),
                    "freshness": d.get("freshness"),
                    "relevance": d.get("relevance"),
                },
            )
        )
        existing.add(key)
        inserted += 1
    s.flush()
    return inserted


# ------------------------------------------------- leaders sheet (P4b, plan §7.2/PG-4)

# N4 answered (human): Leaders sheet base columns are the contract Leader
# fields + linkedinUrl — needed for dedupe and for find_work_email's
# LinkedIn-URL capability. ``initials`` is derived by the UI; ``companyId``
# is the row.company_row_id link, not a data column.
LEADERS_BASE_COLUMNS: tuple[tuple[str, str], ...] = (
    ("name", "Person"),
    ("title", "Job Title"),
    ("companyName", "Company"),
    ("linkedinUrl", "LinkedIn"),
    ("email", "Work Email"),
    ("status", "Email Status"),
    ("persona", "Buying Relevance"),
    ("seniority", "Seniority"),
    ("lastActiveAt", "Last Active"),
)

_LEADERS_SHEET_KEY = "leaders"


def get_or_create_leaders_sheet(s: Session, *, project_id: str | None) -> Sheet:
    """Lazy Leaders sheet per project (or global when project_id is null).
    An advisory lock keyed on the project serializes first creation —
    same pattern as the Signals sheet."""
    s.execute(
        select(func.pg_advisory_xact_lock(func.hashtext(f"leaders:{project_id or ''}")))
    )
    sheet = s.execute(
        select(Sheet).where(
            Sheet.kind == "leaders",
            Sheet.project_id.is_(None)
            if project_id is None
            else Sheet.project_id == project_id,
        )
    ).scalar_one_or_none()
    if sheet is None:
        sheet = create_sheet(
            s, key=_LEADERS_SHEET_KEY, name="Leaders", kind="leaders",
            project_id=project_id,
        )
        for key, label in LEADERS_BASE_COLUMNS:
            add_column(
                s, sheet.id, label=label, type="text", is_base=True, key=key
            )
    return sheet


def upsert_leader_rows(
    s: Session, *, company_row_id: str, leaders: Iterable[dict[str, Any]]
) -> int:
    """Upsert leader rows linked to a company row (§7.2). D4 dedupe:
    LinkedIn URL wins; else normalized name + company row. On a match the
    row's data is REFRESHED in place (idempotent re-runs); on no match a
    new row is inserted. Returns the number of rows inserted."""
    drafts = [d for d in leaders if d.get("name") or d.get("linkedinUrl")]
    if not drafts:
        return 0
    company_row = get_row(s, company_row_id)
    parent_sheet = get_sheet(s, company_row.sheet_id)
    sheet = get_or_create_leaders_sheet(s, project_id=parent_sheet.project_id)
    existing = list(
        s.execute(
            select(Row).where(
                Row.sheet_id == sheet.id, Row.company_row_id == company_row_id
            )
        ).scalars()
    )
    by_linkedin = {
        (r.data or {}).get("linkedinUrl"): r
        for r in existing
        if (r.data or {}).get("linkedinUrl")
    }
    by_name = {
        key: r
        for r in existing
        if (key := _leader_name_key((r.data or {}).get("name"))) is not None
    }
    inserted = 0
    for d in drafts:
        data = {
            "name": d.get("name"),
            "title": d.get("title"),
            "companyName": d.get("companyName"),
            "linkedinUrl": d.get("linkedinUrl"),
            "email": d.get("email"),
            "status": d.get("status"),
            "persona": d.get("persona"),
            "seniority": d.get("seniority"),
            "lastActiveAt": d.get("lastActiveAt"),
            "companyDomain": d.get("companyDomain"),
        }
        match = by_linkedin.get(d.get("linkedinUrl"))
        if match is None and (
            nk := _leader_name_key(d.get("name"))
        ) is not None:
            match = by_name.get(nk)
        if match is not None:
            match.data = {
                **(match.data or {}),
                **{k: v for k, v in data.items() if v is not None},
            }
            if d.get("linkedinUrl"):
                by_linkedin[d["linkedinUrl"]] = match
            if (nk := _leader_name_key(d.get("name"))) is not None:
                by_name[nk] = match
            continue
        row = Row(
            id=new_id("row"),
            sheet_id=sheet.id,
            company_row_id=company_row_id,
            data=data,
        )
        s.add(row)
        if d.get("linkedinUrl"):
            by_linkedin[d["linkedinUrl"]] = row
        if (nk := _leader_name_key(d.get("name"))) is not None:
            by_name[nk] = row
        inserted += 1
    s.flush()
    return inserted


def _leader_name_key(name: Any) -> str | None:
    """Dedupe name key: normalized (lowercase, alnum-only) so casing and
    punctuation differences do not produce duplicate leader rows (D4)."""
    if not isinstance(name, str) or not name:
        return None
    return re.sub(r"[^a-z0-9]+", "", name.lower()) or None
