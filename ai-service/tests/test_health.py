"""Tests for FR-77 — AI Service Health Endpoint."""
from unittest.mock import MagicMock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient


def _client_with_model(model_loaded: bool) -> TestClient:
    """Build a minimal test app that mounts only the health router."""
    from src.routers import health
    import src.services.embedding_service as emb

    emb._model = MagicMock() if model_loaded else None

    app = FastAPI()
    app.include_router(health.router)
    return TestClient(app)


class TestHealthEndpoint:
    def test_status_up_when_model_loaded(self):
        client = _client_with_model(model_loaded=True)
        resp = client.get("/health")
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "UP"
        assert body["modelLoaded"] is True

    def test_status_degraded_when_model_not_loaded(self):
        client = _client_with_model(model_loaded=False)
        resp = client.get("/health")
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "DEGRADED"
        assert body["modelLoaded"] is False

    def test_response_contains_resource_metrics(self):
        client = _client_with_model(model_loaded=True)
        body = client.get("/health").json()
        assert "cpuUsagePercent" in body
        assert "ramUsageMb" in body
        assert isinstance(body["ramUsageMb"], float)
        assert body["ramUsageMb"] > 0

    def test_no_gpu_field_when_cuda_unavailable(self):
        with patch("src.routers.health._gpu_memory_mb", return_value=None):
            client = _client_with_model(model_loaded=True)
            body = client.get("/health").json()
        assert "gpuMemoryMb" not in body

    def test_gpu_field_present_when_cuda_available(self):
        with patch("src.routers.health._gpu_memory_mb", return_value=2048.0):
            client = _client_with_model(model_loaded=True)
            body = client.get("/health").json()
        assert body["gpuMemoryMb"] == 2048.0

    def test_no_auth_required(self):
        """Health endpoint reachable without any Authorization header."""
        client = _client_with_model(model_loaded=True)
        resp = client.get("/health")  # no headers
        assert resp.status_code == 200
