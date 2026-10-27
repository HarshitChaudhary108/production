from app.modules.sheets.normalize import normalized_domain, normalized_name

SUFFIXES = frozenset(
    {"inc", "incorporated", "ltd", "limited", "llc", "corp", "corporation", "co", "company", "gmbh"}
)


def test_domain_strips_scheme_www_path_query() -> None:
    assert normalized_domain("https://www.Acme.io/path/?x=1") == "acme.io"


def test_domain_trailing_dot() -> None:
    assert normalized_domain("ACME.IO.") == "acme.io"


def test_domain_strips_port() -> None:
    assert normalized_domain("acme.io:8080") == "acme.io"


def test_domain_empty_and_none() -> None:
    assert normalized_domain("") is None
    assert normalized_domain(None) is None


def test_name_suffix_removed_same_key() -> None:
    assert normalized_name("Acme, Inc.", SUFFIXES) == normalized_name("ACME INC", SUFFIXES)
    assert normalized_name("Acme, Inc.", SUFFIXES) == "acme"


def test_name_empty_and_none() -> None:
    assert normalized_name("", SUFFIXES) is None
    assert normalized_name(None, SUFFIXES) is None


def test_name_only_suffix_words_is_none() -> None:
    assert normalized_name("Inc Ltd", SUFFIXES) is None
