import re
from pathlib import Path

CONTRACT_PATH = (
    Path(__file__).resolve().parents[3] / "outmate-home" / "docs" / "api-contract.md"
)


def test_amendments_section_present() -> None:
    text = CONTRACT_PATH.read_text(encoding="utf-8")
    assert text.count("## Amendments for backend v1") == 1


def test_amendments_a1_to_a12_exactly_once() -> None:
    text = CONTRACT_PATH.read_text(encoding="utf-8")
    section = text.split("## Amendments for backend v1", 1)[1]
    for n in range(1, 13):
        headings = re.findall(rf"^### A{n}\b", section, flags=re.MULTILINE)
        assert len(headings) == 1, f"A{n}: found {len(headings)} headings"
