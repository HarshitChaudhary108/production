"""outputSchema limits (plan §7.1 rule 6): root text|object, ≤10 total
properties, ≤2 levels of nested objects (array ``items`` is not a level),
every array defines items.

Nesting semantics verified against Exa's documented example
``companies -> items -> name`` (exa.ai/docs/search/deep-search).
"""

import pytest

from app.modules.providers.exa.schema_limits import (
    SchemaLimitError,
    validate_output_schema,
)


def _schema_with_props(n: int) -> dict:
    return {
        "type": "object",
        "properties": {f"p{i}": {"type": "string"} for i in range(n)},
    }


def test_ten_properties_passes() -> None:
    validate_output_schema(_schema_with_props(10))


def test_eleven_properties_fails() -> None:
    with pytest.raises(SchemaLimitError):
        validate_output_schema(_schema_with_props(11))


def test_properties_count_at_every_depth() -> None:
    schema = {
        "type": "object",
        "properties": {
            "a": {
                "type": "object",
                "properties": {f"p{i}": {"type": "string"} for i in range(9)},
            },
            "b": {"type": "string"},
            "c": {"type": "string"},
        },
    }  # 2 + 9 = 11 total -> fail even though nesting depth is 2
    with pytest.raises(SchemaLimitError):
        validate_output_schema(schema)


def test_depth_two_passes() -> None:
    schema = {
        "type": "object",
        "properties": {
            "round": {
                "type": "object",
                "properties": {"name": {"type": "string"}},
            }
        },
    }  # properties -> properties = 2 hops
    validate_output_schema(schema)


def test_array_items_then_properties_passes() -> None:
    # properties(1) -> items -> properties(2): array `items` is not a
    # nesting level (Exa counts nested OBJECTS only) — this is Exa's own
    # documented `companies -> items -> name` example shape.
    schema = {
        "type": "object",
        "properties": {
            "changes": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {"person": {"type": "string"}},
                },
            }
        },
    }
    validate_output_schema(schema)


def test_object_inside_array_item_fails() -> None:
    # properties(1) -> items -> properties(2) -> properties(3): "an object
    # inside that item object is not" allowed per Exa docs.
    schema = {
        "type": "object",
        "properties": {
            "changes": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "person": {
                            "type": "object",
                            "properties": {"name": {"type": "string"}},
                        }
                    },
                },
            }
        },
    }
    with pytest.raises(SchemaLimitError):
        validate_output_schema(schema)


def test_depth_three_fails() -> None:
    schema = {
        "type": "object",
        "properties": {
            "a": {
                "type": "object",
                "properties": {
                    "b": {
                        "type": "object",
                        "properties": {"c": {"type": "string"}},
                    }
                },
            }
        },
    }
    with pytest.raises(SchemaLimitError):
        validate_output_schema(schema)


def test_array_without_items_fails() -> None:
    schema = {
        "type": "object",
        "properties": {"tags": {"type": "array"}},
    }
    with pytest.raises(SchemaLimitError):
        validate_output_schema(schema)


def test_array_of_scalars_passes() -> None:
    schema = {
        "type": "object",
        "properties": {"tags": {"type": "array", "items": {"type": "string"}}},
    }
    validate_output_schema(schema)


def test_root_type_must_be_text_or_object() -> None:
    with pytest.raises(SchemaLimitError):
        validate_output_schema({"type": "string", "description": "x"})
    with pytest.raises(SchemaLimitError):
        validate_output_schema({"properties": {"a": {"type": "string"}}})
    validate_output_schema({"type": "text"})
    validate_output_schema(
        {"type": "object", "properties": {"a": {"type": "string"}}}
    )
