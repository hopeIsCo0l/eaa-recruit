"""Tests for bias detection service and /bias/* endpoints (FR-76)."""
import json
import math
from unittest.mock import MagicMock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

import src.services.bias_service as bias_service
from src.services.bias_service import _mean, _stddev, analyse


@pytest.fixture(scope="module")
def bias_client():
    from src.routers import bias
    app = FastAPI()
    app.include_router(bias.router)
    return TestClient(app)


class TestMean:
    def test_single_value(self):
        assert _mean([5.0]) == 5.0

    def test_equal_values(self):
        assert _mean([3.0, 3.0, 3.0]) == 3.0

    def test_mixed_values(self):
        assert _mean([0.0, 100.0]) == 50.0


class TestStddev:
    def test_single_value_is_zero(self):
        assert _stddev([42.0], mean=42.0) == 0.0

    def test_identical_values_is_zero(self):
        assert _stddev([5.0, 5.0, 5.0], mean=5.0) == 0.0

    def test_known_stddev(self):
        # values=[0, 100], mean=50 → variance=2500, stddev=50
        result = _stddev([0.0, 100.0], mean=50.0)
        assert abs(result - 50.0) < 0.001


class TestAnalyse:
    def _mocked_analyse(self, *args, **kwargs):
        """Call analyse() with Redis _persist mocked out."""
        with patch.object(bias_service, "_persist"):
            return analyse(*args, **kwargs)

    def test_empty_candidates_raises(self):
        with pytest.raises(ValueError, match="must not be empty"):
            with patch.object(bias_service, "_persist"):
                analyse("job-1", [])

    def test_single_cohort_no_flagging(self):
        candidates = [
            {"candidateId": "a", "cohort": "UniA", "cvScore": 80},
            {"candidateId": "b", "cohort": "UniA", "cvScore": 90},
        ]
        report = self._mocked_analyse("job-1", candidates)
        assert report["jobId"] == "job-1"
        assert report["totalCandidates"] == 2
        assert report["flaggedCohorts"] == []
        assert len(report["cohortStats"]) == 1

    def test_outlier_cohort_flagged(self):
        # 5 candidates in Normal cohort (score≈50) + 1 outlier (score=100).
        # outlier deviation ≈ 2.24σ > 1.5σ threshold → flagged.
        candidates = [
            {"candidateId": "n1", "cohort": "Normal", "cvScore": 50},
            {"candidateId": "n2", "cohort": "Normal", "cvScore": 50},
            {"candidateId": "n3", "cohort": "Normal", "cvScore": 50},
            {"candidateId": "n4", "cohort": "Normal", "cvScore": 50},
            {"candidateId": "n5", "cohort": "Normal", "cvScore": 50},
            {"candidateId": "o1", "cohort": "Outlier", "cvScore": 100},
        ]
        report = self._mocked_analyse("job-flag", candidates)
        assert "Outlier" in report["flaggedCohorts"]

    def test_report_structure(self):
        candidates = [{"candidateId": "a", "cohort": "X", "cvScore": 50}]
        report = self._mocked_analyse("job-struct", candidates)
        required_keys = {
            "jobId", "totalCandidates", "overallMeanScore", "overallStdDev",
            "biasThresholdStdDev", "flaggedCohorts", "cohortStats",
        }
        assert required_keys.issubset(report.keys())

    def test_cohort_stats_sorted_alphabetically(self):
        candidates = [
            {"candidateId": "a", "cohort": "Zebra", "cvScore": 70},
            {"candidateId": "b", "cohort": "Alpha", "cvScore": 80},
        ]
        report = self._mocked_analyse("job-sort", candidates)
        cohort_names = [s["cohort"] for s in report["cohortStats"]]
        assert cohort_names == sorted(cohort_names)


class TestBiasEndpoints:
    def test_analyse_returns_ok(self, bias_client):
        with patch.object(bias_service, "_persist"):
            resp = bias_client.post("/bias/analyse", json={
                "jobId": "j1",
                "candidates": [
                    {"candidateId": "a", "cohort": "UniA", "cvScore": 80},
                    {"candidateId": "b", "cohort": "UniB", "cvScore": 60},
                ],
            })
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "ok"
        assert "data" in body

    def test_analyse_empty_candidates_422(self, bias_client):
        resp = bias_client.post("/bias/analyse", json={"jobId": "j1", "candidates": []})
        assert resp.status_code == 422

    def test_get_report_not_found_404(self, bias_client):
        with patch.object(bias_service, "get_report", return_value=None):
            resp = bias_client.get("/bias/report/nonexistent-job")
        assert resp.status_code == 404

    def test_get_report_returns_stored(self, bias_client):
        fake_report = {"jobId": "j99", "totalCandidates": 1}
        with patch.object(bias_service, "get_report", return_value=fake_report):
            resp = bias_client.get("/bias/report/j99")
        assert resp.status_code == 200
        assert resp.json()["data"]["jobId"] == "j99"
