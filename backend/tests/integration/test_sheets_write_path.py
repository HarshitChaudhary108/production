"""One test per §8.4 write-path rule, positive and negative."""

import pytest
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.errors import ApiError
from app.ids import new_id
from app.modules.jobs.models import Job, JobItem
from app.modules.sheets import service
from app.modules.sheets.models import Cell, Sheet, SheetColumn


def _sheet(db: Session) -> Sheet:
    return service.create_sheet(
        db, key="companies", name="Target Companies", kind="companies"
    )


def _row(db: Session, sheet: Sheet, **data):
    if not data:
        data = {"name": "Acme", "domain": "acme.io"}
    before = {r.id for r in service.list_rows(db, sheet.id)}
    service.add_base_rows(db, sheet.id, [data])
    # rows share created_at (func.now() = tx timestamp); id order is random, so
    # diffing id sets is the only deterministic way to get the inserted row
    new = [r for r in service.list_rows(db, sheet.id) if r.id not in before]
    assert len(new) == 1
    return new[0]


def _running_job(db: Session, column_id: str) -> Job:
    job = Job(
        id=new_id("job"), workspace_id="ws_demo", type="enrichment", status="running"
    )
    db.add(job)
    db.flush()
    db.add(
        JobItem(
            id=new_id("job"),
            job_id=job.id,
            kind="cell",
            column_id=column_id,
            status="running",
        )
    )
    db.flush()
    return job


# ------------------------------------------------------------ add_base_rows


def test_add_base_rows_dedupes_same_domain(db: Session) -> None:
    sheet = _sheet(db)
    res = service.add_base_rows(
        db,
        sheet.id,
        [
            {"name": "Acme", "domain": "https://www.Acme.io/x"},
            {"name": "Acme Two", "domain": "acme.io"},
        ],
    )
    assert res["inserted"] == 1 and res["duplicates"] == 1
    assert len(res["rows"]) == 1
    rows = service.list_rows(db, sheet.id)
    assert len(rows) == 1
    assert rows[0].normalized_domain == "acme.io"


def test_add_base_rows_dedupes_same_name_no_domain(db: Session) -> None:
    sheet = _sheet(db)
    res = service.add_base_rows(
        db, sheet.id, [{"name": "Acme, Inc."}, {"name": "ACME INC"}]
    )
    assert res["inserted"] == 1 and res["duplicates"] == 1
    assert len(res["rows"]) == 1


def test_add_base_rows_dedupes_against_existing(db: Session) -> None:
    sheet = _sheet(db)
    service.add_base_rows(db, sheet.id, [{"name": "Acme", "domain": "acme.io"}])
    res = service.add_base_rows(db, sheet.id, [{"name": "Acme2", "domain": "ACME.io"}])
    assert res["inserted"] == 0 and res["duplicates"] == 1


def test_add_base_rows_distinct_inserted(db: Session) -> None:
    sheet = _sheet(db)
    res = service.add_base_rows(
        db,
        sheet.id,
        [
            {"name": "Acme", "domain": "acme.io"},
            {"name": "Beta", "domain": "beta.io"},
        ],
    )
    assert res["inserted"] == 2 and res["duplicates"] == 0


# ------------------------------------------------------------- add_column


def test_add_column_slug_suffixes(db: Session) -> None:
    sheet = _sheet(db)
    c1 = service.add_column(db, sheet.id, label="Funding Stage", type="text")
    c2 = service.add_column(db, sheet.id, label="Funding Stage", type="text")
    c3 = service.add_column(db, sheet.id, label="Funding Stage", type="text")
    assert (c1.key, c2.key, c3.key) == (
        "funding_stage",
        "funding_stage_2",
        "funding_stage_3",
    )


# ---------------------------------------------------------- edit_base_field


def test_edit_base_field_allowed_key(db: Session) -> None:
    row = _row(db, _sheet(db))
    service.edit_base_field(db, row.id, key="loc", value="  NYC  ")
    assert service.get_row(db, row.id).data["loc"] == "NYC"


def test_edit_base_field_rejects_non_editable_key(db: Session) -> None:
    row = _row(db, _sheet(db))
    with pytest.raises(ApiError) as ei:
        service.edit_base_field(db, row.id, key="company", value="x")
    assert ei.value.status == 422
    assert ei.value.code == "not_editable"


def test_edit_base_field_emp_capped(db: Session) -> None:
    row = _row(db, _sheet(db))
    service.edit_base_field(db, row.id, key="emp", value="99999999999")
    assert service.get_row(db, row.id).data["emp"] == 10_000_000


def test_edit_base_field_emp_nonnumeric_clears(db: Session) -> None:
    """N3 (answered): empty/non-numeric edit clears the field."""
    row = _row(db, _sheet(db))
    service.edit_base_field(db, row.id, key="emp", value="120")
    service.edit_base_field(db, row.id, key="emp", value="abc")
    assert service.get_row(db, row.id).data["emp"] is None


def test_edit_base_field_empty_clears(db: Session) -> None:
    row = _row(db, _sheet(db))
    service.edit_base_field(db, row.id, key="loc", value="NYC")
    service.edit_base_field(db, row.id, key="loc", value="   ")
    assert service.get_row(db, row.id).data["loc"] is None


def test_edit_base_field_truncates_to_500(db: Session) -> None:
    row = _row(db, _sheet(db))
    service.edit_base_field(db, row.id, key="loc", value="x" * 600)
    assert len(service.get_row(db, row.id).data["loc"]) == 500


def test_edit_base_field_stale_revision_conflict(db: Session) -> None:
    row = _row(db, _sheet(db))
    with pytest.raises(ApiError) as ei:
        service.edit_base_field(db, row.id, key="loc", value="B", expected_revision=99)
    assert ei.value.status == 409
    assert ei.value.code == "revision_conflict"
    assert "loc" not in service.get_row(db, row.id).data


def test_edit_base_field_domain_marks_enrichment_cells_stale(db: Session) -> None:
    sheet = _sheet(db)
    row = _row(db, sheet)
    enr = service.add_column(
        db, sheet.id, label="Funding", type="badge", enrichment_id="find_funding"
    )
    base = service.add_column(db, sheet.id, label="Emp", type="text", is_base=True)
    service.write_enrichment_result(
        db,
        row.id,
        enr.id,
        status="succeeded",
        value="Series B",
        provenance="provider_reported",
        source="exa",
    )
    service.write_enrichment_result(
        db, row.id, base.id, status="succeeded", value="100", source="exa"
    )
    service.edit_base_field(db, row.id, key="domain", value="acme-new.io")
    enr_cell = service.get_cell(db, row.id, enr.id)
    base_cell = service.get_cell(db, row.id, base.id)
    assert enr_cell is not None and enr_cell.stale is True
    assert enr_cell.value == "Series B"  # values kept
    assert base_cell is not None and base_cell.stale is False
    assert service.get_row(db, row.id).normalized_domain == "acme-new.io"


# ---------------------------------------------------------------- edit_cell


def test_edit_cell_plain_value_allowed(db: Session) -> None:
    sheet = _sheet(db)
    row = _row(db, sheet)
    col = service.add_column(db, sheet.id, label="Notes", type="plain_value")
    cell = service.edit_cell(db, row.id, col.id, "hello")
    assert cell.user_edited is True
    assert cell.source == "user"
    assert cell.provenance is None
    assert cell.value == "hello"
    assert cell.status == "succeeded"


def test_edit_cell_enrichment_column_rejected(db: Session) -> None:
    sheet = _sheet(db)
    row = _row(db, sheet)
    col = service.add_column(
        db, sheet.id, label="Funding", type="badge", enrichment_id="find_funding"
    )
    with pytest.raises(ApiError) as ei:
        service.edit_cell(db, row.id, col.id, "x")
    assert ei.value.status == 422
    assert ei.value.code == "not_editable"


def test_edit_cell_running_cell_conflict(db: Session) -> None:
    sheet = _sheet(db)
    row = _row(db, sheet)
    col = service.add_column(db, sheet.id, label="Notes", type="plain_value")
    service.write_enrichment_result(db, row.id, col.id, status="running")
    with pytest.raises(ApiError) as ei:
        service.edit_cell(db, row.id, col.id, "x")
    assert ei.value.status == 409
    assert ei.value.code == "cell_running"


# -------------------------------------------------- write_enrichment_result


def test_write_enrichment_result_writes_and_clears_stale(db: Session) -> None:
    sheet = _sheet(db)
    row = _row(db, sheet)
    col = service.add_column(
        db, sheet.id, label="Funding", type="badge", enrichment_id="find_funding"
    )
    service.edit_base_field(db, row.id, key="domain", value="acme2.io")
    cell = service.write_enrichment_result(
        db,
        row.id,
        col.id,
        status="succeeded",
        value="Series B — $18M",
        provenance="verified",
        source="exa",
        sources=[{"url": "https://example.com/a", "title": "News"}],
        confidence_label="high",
        cost=3,
        run_id="run_1",
    )
    assert cell is not None
    assert cell.stale is False
    assert cell.value == "Series B — $18M"
    sources = service.list_cell_sources(db, row.id, col.id)
    assert len(sources) == 1 and sources[0].url == "https://example.com/a"


def test_write_enrichment_result_skips_user_edited_cell(db: Session) -> None:
    sheet = _sheet(db)
    row = _row(db, sheet)
    col = service.add_column(db, sheet.id, label="Notes", type="plain_value")
    service.edit_cell(db, row.id, col.id, "mine")
    skipped = service.write_enrichment_result(
        db, row.id, col.id, status="succeeded", value="provider value", source="exa"
    )
    assert skipped is None
    cell = service.get_cell(db, row.id, col.id)
    assert cell is not None and cell.value == "mine" and cell.user_edited is True


# --------------------------------------------------- clear_column_results


def test_clear_column_results_empties_non_edited(db: Session) -> None:
    sheet = _sheet(db)
    row1 = _row(db, sheet, name="Acme", domain="acme.io")
    row2 = _row(db, sheet, name="Beta", domain="beta.io")
    col = service.add_column(
        db, sheet.id, label="Funding", type="badge", enrichment_id="find_funding"
    )
    # user-edited cell on row1 must survive; plain result cell on row2 is cleared
    db.add(
        Cell(
            row_id=row1.id,
            column_id=col.id,
            value="mine",
            status="succeeded",
            user_edited=True,
            source="user",
        )
    )
    service.write_enrichment_result(
        db, row2.id, col.id, status="succeeded", value="v2", source="exa"
    )
    cleared = service.clear_column_results(db, sheet.id, col.id)
    kept = service.get_cell(db, row1.id, col.id)
    gone = service.get_cell(db, row2.id, col.id)
    assert cleared == 1
    assert kept is not None and kept.value == "mine"
    assert gone is None


def test_clear_column_results_running_job_409(db: Session) -> None:
    sheet = _sheet(db)
    col = service.add_column(
        db, sheet.id, label="Funding", type="badge", enrichment_id="find_funding"
    )
    _running_job(db, col.id)
    with pytest.raises(ApiError) as ei:
        service.clear_column_results(db, sheet.id, col.id)
    assert ei.value.status == 409
    assert ei.value.code == "invalid_state"


# ----------------------------------------------------------- remove_column


def test_remove_column_soft_delete(db: Session) -> None:
    sheet = _sheet(db)
    col = service.add_column(db, sheet.id, label="Funding", type="badge")
    service.remove_column(db, sheet.id, col.id)
    assert col.deleted_at is not None
    with pytest.raises(ApiError) as ei:
        service.get_column(db, sheet.id, col.id)
    assert ei.value.code == "not_found"
    assert col not in service.list_columns(db, sheet.id)
    still_there = db.execute(
        select(SheetColumn).where(SheetColumn.id == col.id)
    ).scalar_one()
    assert still_there.deleted_at is not None


def test_remove_column_running_job_409(db: Session) -> None:
    sheet = _sheet(db)
    col = service.add_column(db, sheet.id, label="Funding", type="badge")
    _running_job(db, col.id)
    with pytest.raises(ApiError) as ei:
        service.remove_column(db, sheet.id, col.id)
    assert ei.value.status == 409
    assert ei.value.code == "invalid_state"
    assert col.deleted_at is None
