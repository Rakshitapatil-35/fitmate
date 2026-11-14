"""Unit and API tests for body measurement validation, unit normalization, and multi-profile CRUD."""

import pytest
from fastapi.testclient import TestClient

from app.core.exceptions import AppException
from app.services.unit_conversion import normalize_and_validate_measurements


def test_realistic_range_validation_rejects_outliers() -> None:
    """Measurements outside human anatomical bounds must raise AppException(422)."""
    with pytest.raises(AppException) as exc_info:
        normalize_and_validate_measurements(
            raw_measurements={"chest_bust": 250.0, "waist": 30.0},
            unit="cm",
        )
    assert exc_info.value.status_code == 422
    assert "chest_bust" in exc_info.value.message
    assert "waist" in exc_info.value.message


def test_underbust_must_be_smaller_than_bust() -> None:
    """Cross-field validation must reject underbust >= chest_bust."""
    with pytest.raises(AppException) as exc_info:
        normalize_and_validate_measurements(
            raw_measurements={"chest_bust": 88.0, "underbust": 92.0},
            unit="cm",
            gender="female",
        )
    assert "underbust" in exc_info.value.message


def test_category_required_fields_validation() -> None:
    """Requesting validation for mens_bottoms without waist/hips/inseam must fail clearly."""
    with pytest.raises(AppException) as exc_info:
        normalize_and_validate_measurements(
            raw_measurements={"chest_bust": 100.0},
            unit="cm",
            target_category="mens_bottoms",
        )
    assert "Missing required measurements for 'mens_bottoms'" in exc_info.value.message


def test_inches_input_stored_as_cm_via_api(client: TestClient) -> None:
    """Creating a measurement profile in inches ('in') must convert and persist values in cm."""
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "alex@sizerec.example.com", "password": "UserPass123"},
    )
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    create_resp = client.post(
        "/api/v1/measurements",
        headers=headers,
        json={
            "profile_name": "Inches Test Profile",
            "gender": "male",
            "fit_preference": "slim",
            "unit": "in",
            "weight_unit": "lbs",
            "chest_bust": 40.0,
            "shoulder": 18.0,
            "waist": 32.0,
            "hips": 39.0,
            "inseam": 31.0,
            "weight": 165.0,
        },
    )
    assert create_resp.status_code == 201
    profile = create_resp.json()
    assert profile["original_unit"] == "in"
    assert profile["chest_bust_cm"] == 101.6
    assert profile["waist_cm"] == 81.28
    assert profile["fit_preference"] == "slim"

    # Update profile and then delete it
    pid = profile["id"]
    upd_resp = client.put(
        f"/api/v1/measurements/{pid}",
        headers=headers,
        json={"fit_preference": "relaxed", "unit": "cm", "waist": 83.0},
    )
    assert upd_resp.status_code == 200
    assert upd_resp.json()["fit_preference"] == "relaxed"
    assert upd_resp.json()["waist_cm"] == 83.0

    del_resp = client.delete(f"/api/v1/measurements/{pid}", headers=headers)
    assert del_resp.status_code == 200
