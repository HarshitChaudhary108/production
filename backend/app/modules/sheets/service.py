"""The ONLY writer of sheets, columns, rows, cells, cell_sources (plan §8.4).

Every function takes a Session owned by the caller; this module never commits.
Rules below mirror the §8.4 table and `gridUtils.ts` (sanitizeEdit, canEditColumn,
EDITABLE_SOURCE_COLUMNS). N3 (answered): a sanitized-null edit clears the field.
"""

import re
from collections.abc import Iterable
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import delete, func, or_, select
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
) -> SheetColumn:
    """Unique key per sheet: slug of label, suffixed _2, _3… on collision."""
    get_sheet(s, sheet_id)
    existing = {
        c.key
        for c in s.execute(
            select(SheetColumn).where(SheetColumn.sheet_id == sheet_id)
        ).scalars()
    }
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
    run_id: str | None = None,
) -> Cell | None:
    """Write a provider result to a cell. Skips the write if the cell became
    user_edited while running (result stays in job_items.result, uncharged).
    Clears stale. Returns None when skipped."""
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
