import pytest

from app.ids import ALLOWED_PREFIXES, new_id


def test_new_id_has_prefix() -> None:
    assert new_id("job").startswith("job_")


def test_all_allowed_prefixes() -> None:
    for prefix in ALLOWED_PREFIXES:
        assert new_id(prefix).startswith(prefix + "_")


def test_new_ids_are_unique() -> None:
    ids = {new_id("job") for _ in range(1000)}
    assert len(ids) == 1000


def test_token_is_not_purely_digits() -> None:
    token = new_id("job").split("_", 1)[1]
    assert not token.isdigit()


def test_unknown_prefix_raises() -> None:
    with pytest.raises(ValueError, match="unknown id prefix"):
        new_id("nope")
