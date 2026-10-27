"""Boundary rule (plan §8.4 / task): only app/modules/sheets/ and alembic/ may
import app.modules.sheets.models. Scans all .py under app/ and alembic/ with ast."""

import ast
from collections.abc import Iterator
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[2]
SCAN_ROOTS = (BACKEND / "app", BACKEND / "alembic")
ALLOWED_DIRS = (BACKEND / "app" / "modules" / "sheets", BACKEND / "alembic")
TARGET_MODULE = "app.modules.sheets.models"
TARGET_PACKAGE = "app.modules.sheets"


def _imports(path: Path) -> Iterator[str]:
    tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
    pkg = list(path.parent.relative_to(BACKEND).parts)
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                yield alias.name
        elif isinstance(node, ast.ImportFrom):
            module = node.module or ""
            if node.level:
                base = pkg[: len(pkg) - node.level + 1]
                module = ".".join([*base, module]) if module else ".".join(base)
            yield module
            if module == TARGET_PACKAGE:
                for alias in node.names:
                    yield f"{module}.{alias.name}"


def _in_allowed(path: Path) -> bool:
    return any(path.is_relative_to(d) for d in ALLOWED_DIRS)


def test_sheets_models_import_boundary() -> None:
    violations = []
    for root in SCAN_ROOTS:
        for f in root.rglob("*.py"):
            if _in_allowed(f):
                continue
            for mod in _imports(f):
                if mod == TARGET_MODULE or mod == f"{TARGET_PACKAGE}.models":
                    violations.append(f"{f.relative_to(BACKEND)} imports {mod}")
    assert not violations, "sheets models imported outside the sheets module:\n" + "\n".join(
        violations
    )
