from fastapi.testclient import TestClient


def test_unknown_route_returns_not_found_envelope(client_with_test_routes: TestClient) -> None:
    r = client_with_test_routes.get("/api/v1/does-not-exist")
    assert r.status_code == 404
    body = r.json()
    assert body["error"]["code"] == "not_found"
    assert set(body["error"]) == {"code", "message", "details"}


def test_api_error_returns_envelope(client_with_test_routes: TestClient) -> None:
    r = client_with_test_routes.get("/api/v1/__test/api-error")
    assert r.status_code == 422
    assert r.json() == {
        "error": {"code": "validation_error", "message": "x", "details": {"a": 1}}
    }


def test_invalid_body_returns_validation_error(client_with_test_routes: TestClient) -> None:
    r = client_with_test_routes.post("/api/v1/__test/validated", json={"name": 123})
    assert r.status_code == 422
    body = r.json()
    assert body["error"]["code"] == "validation_error"
    assert body["error"]["details"]["errors"]


def test_unknown_root_path_also_enveloped(client_with_test_routes: TestClient) -> None:
    r = client_with_test_routes.get("/no-such-path")
    assert r.status_code == 404
    assert r.json()["error"]["code"] == "not_found"
