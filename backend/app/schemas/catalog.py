"""Catalog DTOs — contract shape + A12. Only these fields leave the API;
registry internals (gate_flag, executor_id) never serialize."""

from typing import Literal

from app.schemas.base import CamelModel


class CatalogItem(CamelModel):
    id: str
    name: str
    description: str
    cost: int
    output_type: Literal["text", "badge", "chips", "link", "email", "people"]
    applies_to: Literal["companies", "leaders", "any"]
    source: Literal["exa", "moltsets", "user"]
    status: Literal["live", "gated"]
    requires_inputs: list[str]
