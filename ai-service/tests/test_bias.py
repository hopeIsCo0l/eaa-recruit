"""Bias service: cohort grouping, outlier flagging, persistence stub."""
from unittest.mock import MagicMock

import pytest


@pytest.fixture
def bias(monkeypatch):
    from src.services import bias_service

    fake_store: dict[str, str] = {}
    fake_redis = MagicMock()
    fake_redis.setex.side_effect = lambda k, _ttl, v: fake_store.__setitem__(k, v)
    fake_redis.get.side_effect = lambda k: fake_store.get(k)
    monkeypatch.setattr(bias_service, "_get_client", lambda: fake_redis)
    return bias_service


class TestBias:
    def test_empty_candidates_raises(self, bias):
        with pytest.raises(ValueError):
            bias.analyse("job1", [])

    def test_single_cohort_no_flag(self, bias):
        report = bias.analyse("job1", [
            {"candidateId": "c1", "cohort": "X", "cvScore": 70},
            {"candidateId": "c2", "cohort": "X", "cvScore": 75},
            {"candidateId": "c3", "cohort": "X", "cvScore": 72},
        ])
        assert report["flaggedCohorts"] == []
        assert report["cohortStats"][0]["candidateCount"] == 3

    def test_outlier_cohort_flagged(self, bias):
        # Cohort B sits far above the mean
        report = bias.analyse("job2", [
            {"candidateId": "a1", "cohort": "A", "cvScore": 30},
            {"candidateId": "a2", "cohort": "A", "cvScore": 35},
            {"candidateId": "a3", "cohort": "A", "cvScore": 32},
            {"candidateId": "b1", "cohort": "B", "cvScore": 95},
        ])
        flagged = report["flaggedCohorts"]
        assert "B" in flagged

    def test_round_trip_via_get_report(self, bias):
        bias.analyse("job3", [
            {"candidateId": "x", "cohort": "X", "cvScore": 50},
        ])
        again = bias.get_report("job3")
        assert again is not None
        assert again["jobId"] == "job3"

    def test_unknown_job_returns_none(self, bias):
        assert bias.get_report("ghost") is None
