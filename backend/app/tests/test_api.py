from fastapi.testclient import TestClient

from app.main import app


def login(email: str, password: str = "Password123!") -> dict:
    with TestClient(app) as client:
        response = client.post(
            "/api/auth/login",
            json={"email": email, "password": password},
        )
        assert response.status_code == 200, response.text
        return response.json()


def token_for(email: str, password: str = "Password123!") -> str:
    return login(email, password)["access_token"]


def auth_headers(email: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token_for(email)}"}


def test_login_returns_token_metadata_and_user() -> None:
    payload = login("admin@finsightcrm.com")
    assert payload["token_type"] == "bearer"
    assert payload["expires_in"] > 0
    assert payload["user"]["email"] == "admin@finsightcrm.com"
    assert payload["user"]["role"] == "admin"


def test_current_user_endpoint_returns_seeded_user() -> None:
    with TestClient(app) as client:
        response = client.get("/api/auth/me", headers=auth_headers("analyst@finsightcrm.com"))
    assert response.status_code == 200
    assert response.json()["email"] == "analyst@finsightcrm.com"


def test_invalid_login_is_rejected() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/api/auth/login",
            json={"email": "admin@finsightcrm.com", "password": "wrong-password"},
        )
    assert response.status_code == 401


def test_cors_preflight_allows_frontend_origin() -> None:
    with TestClient(app) as client:
        response = client.options(
            "/api/auth/login",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
            },
        )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"


def test_record_detail_includes_nested_category() -> None:
    with TestClient(app) as client:
        records_response = client.get(
            "/api/records",
            headers=auth_headers("analyst@finsightcrm.com"),
        )
        record_id = records_response.json()[0]["id"]
        detail_response = client.get(
            f"/api/records/{record_id}",
            headers=auth_headers("analyst@finsightcrm.com"),
        )
    assert detail_response.status_code == 200
    assert detail_response.json()["category"]["name"]


def test_healthcheck() -> None:
    with TestClient(app) as client:
        response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_viewer_cannot_create_record() -> None:
    with TestClient(app) as client:
        sales_category = client.get("/api/categories", headers=auth_headers("viewer@finsightcrm.com")).json()[0]
        response = client.post(
            "/api/records",
            headers=auth_headers("viewer@finsightcrm.com"),
            json={
                "title": "Blocked Attempt",
                "amount": "150.00",
                "currency": "USD",
                "entry_type": "expense",
                "category_id": sales_category["id"],
                "occurred_on": "2026-04-03",
                "status": "draft",
            },
        )
    assert response.status_code == 403


def test_operator_can_create_record() -> None:
    with TestClient(app) as client:
        categories = client.get("/api/categories", headers=auth_headers("operator@finsightcrm.com")).json()
        expense_category = next(item for item in categories if item["kind"] == "expense")
        response = client.post(
            "/api/records",
            headers=auth_headers("operator@finsightcrm.com"),
            json={
                "title": "Vendor Payment",
                "amount": "150.00",
                "currency": "USD",
                "entry_type": "expense",
                "category_id": expense_category["id"],
                "occurred_on": "2026-04-03",
                "status": "draft",
            },
        )
    assert response.status_code == 201, response.text
    assert response.json()["title"] == "Vendor Payment"


def test_admin_only_insights() -> None:
    with TestClient(app) as client:
        analyst_response = client.get(
            "/api/admin/insights",
            headers=auth_headers("analyst@finsightcrm.com"),
        )
        admin_response = client.get(
            "/api/admin/insights",
            headers=auth_headers("admin@finsightcrm.com"),
        )
    assert analyst_response.status_code == 403
    assert admin_response.status_code == 200
    assert len(admin_response.json()) >= 1


def test_dashboard_summary_returns_totals() -> None:
    with TestClient(app) as client:
        response = client.get(
            "/api/dashboard/summary",
            headers=auth_headers("analyst@finsightcrm.com"),
        )
    assert response.status_code == 200
    payload = response.json()
    assert "totals" in payload
    assert "category_breakdown" in payload
    assert "monthly_trends" in payload
