"""outputSchema limits (plan §5.1 / §7.1 rule 6), enforced LOCALLY before any
request leaves the process:

- root ``type`` must be ``text`` or ``object``;
- at most 10 properties in total, counting every ``properties`` map at every
  depth (including inside array ``items`` and combinator members);
- at most 2 hops of nesting, where each entered ``properties`` map counts
  as one hop. Entering an array ``items`` schema is NOT a hop — Exa counts
  "levels of nested objects" only, so ``properties -> items -> properties``
  is exactly 2 hops and is ACCEPTED (verified against Exa's documented
  example ``companies -> items -> name``, exa.ai/docs/search/deep-search);
  an object inside that item object (3 hops) is rejected;
- every array must define ``items``.

Conservative by design: if a live smoke test later shows Exa REJECTING a
schema this validator ACCEPTED, stop and report — do not loosen this file.
"""


class SchemaLimitError(ValueError):
    """outputSchema violates the Exa limits."""


MAX_PROPERTIES = 10
MAX_HOPS = 2
_COMBINATOR_KEYS = ("anyOf", "oneOf", "allOf")


def _walk(node: object, hops: int, counter: list[int]) -> None:
    if not isinstance(node, dict):
        return
    if node.get("type") == "array":
        if "items" not in node or node["items"] is None:
            raise SchemaLimitError("every array schema must define `items`")
        _walk(node["items"], hops, counter)
    props = node.get("properties")
    if isinstance(props, dict):
        counter[0] += len(props)
        if counter[0] > MAX_PROPERTIES:
            raise SchemaLimitError(
                f"outputSchema has more than {MAX_PROPERTIES} properties"
            )
        hops += 1
        if hops > MAX_HOPS:
            raise SchemaLimitError(
                f"outputSchema nesting exceeds {MAX_HOPS} hops"
            )
        for sub in props.values():
            _walk(sub, hops, counter)
    for key in _COMBINATOR_KEYS:
        members = node.get(key)
        if isinstance(members, list):
            for member in members:
                _walk(member, hops, counter)


def validate_output_schema(schema: object) -> None:
    """Raise SchemaLimitError on any violation; returns None when valid."""
    if not isinstance(schema, dict):
        raise SchemaLimitError("outputSchema must be an object")
    root_type = schema.get("type")
    if root_type not in ("text", "object"):
        raise SchemaLimitError(
            "outputSchema root type must be 'text' or 'object'"
        )
    counter = [0]
    _walk(schema, 0, counter)
