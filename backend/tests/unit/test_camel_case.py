from app.schemas.base import CamelModel


class Sample(CamelModel):
    credits_remaining: int


def test_serializes_camel_case() -> None:
    assert Sample(credits_remaining=5).model_dump(by_alias=True) == {"creditsRemaining": 5}


def test_parses_camel_case() -> None:
    parsed = Sample.model_validate({"creditsRemaining": 7})
    assert parsed.credits_remaining == 7
