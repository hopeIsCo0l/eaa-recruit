"""Tests for /rank/batch endpoint and ranking formula (FR-36)."""
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from src.routers.ranking import _compute_final, CandidateInput


@pytest.fixture(scope="module")
def client():
    from src.routers import ranking
    app = FastAPI()
    app.include_router(ranking.router)
    return TestClient(app)


class TestComputeFinal:
    def test_hard_filter_failed_returns_zero(self):
        c = CandidateInput(candidateId="x", cvScore=90, examScore=90, hardFilterPassed=False)
        assert _compute_final(c) == 0.0

    def test_formula_weights(self):
        # cvScore=100, examScore=100, hardFilterPassed=True
        # finalScore = 100*0.4 + 100*0.4 + 100*0.2 = 100
        c = CandidateInput(candidateId="x", cvScore=100, examScore=100, hardFilterPassed=True)
        assert _compute_final(c) == 100.0

    def test_cv_exam_weights_equal(self):
        # cvScore=50, examScore=50 → 50*0.4 + 50*0.4 + 100*0.2 = 20+20+20 = 60
        c = CandidateInput(candidateId="x", cvScore=50, examScore=50, hardFilterPassed=True)
        assert _compute_final(c) == 60.0

    def test_cv_dominates_over_exam(self):
        hi_cv = CandidateInput(candidateId="a", cvScore=100, examScore=0, hardFilterPassed=True)
        hi_exam = CandidateInput(candidateId="b", cvScore=0, examScore=100, hardFilterPassed=True)
        # Both cv and exam have weight 0.4 → symmetric
        assert _compute_final(hi_cv) == _compute_final(hi_exam)

    def test_result_rounded_to_two_dp(self):
        c = CandidateInput(candidateId="x", cvScore=33.333, examScore=66.666, hardFilterPassed=True)
        result = _compute_final(c)
        assert result == round(result, 2)

    def test_zero_scores_with_filter_passed(self):
        c = CandidateInput(candidateId="x", cvScore=0, examScore=0, hardFilterPassed=True)
        # 0*0.4 + 0*0.4 + 100*0.2 = 20
        assert _compute_final(c) == 20.0


class TestRankBatchEndpoint:
    def test_empty_candidates_returns_empty_ranked(self, client):
        resp = client.post("/rank/batch", json={"candidates": []})
        assert resp.status_code == 200
        assert resp.json()["ranked"] == []

    def test_single_candidate_returned(self, client):
        payload = {
            "candidates": [
                {"candidateId": "c1", "cvScore": 80, "examScore": 70, "hardFilterPassed": True}
            ]
        }
        resp = client.post("/rank/batch", json=payload)
        assert resp.status_code == 200
        ranked = resp.json()["ranked"]
        assert len(ranked) == 1
        assert ranked[0]["candidateId"] == "c1"
        assert "finalScore" in ranked[0]

    def test_ranked_descending_by_final_score(self, client):
        payload = {
            "candidates": [
                {"candidateId": "low", "cvScore": 10, "examScore": 10, "hardFilterPassed": True},
                {"candidateId": "high", "cvScore": 90, "examScore": 90, "hardFilterPassed": True},
                {"candidateId": "mid", "cvScore": 50, "examScore": 50, "hardFilterPassed": True},
            ]
        }
        resp = client.post("/rank/batch", json=payload)
        ranked = resp.json()["ranked"]
        scores = [r["finalScore"] for r in ranked]
        assert scores == sorted(scores, reverse=True)
        assert ranked[0]["candidateId"] == "high"

    def test_failed_filter_ranked_last(self, client):
        payload = {
            "candidates": [
                {"candidateId": "fail", "cvScore": 99, "examScore": 99, "hardFilterPassed": False},
                {"candidateId": "pass", "cvScore": 1, "examScore": 1, "hardFilterPassed": True},
            ]
        }
        resp = client.post("/rank/batch", json=payload)
        ranked = resp.json()["ranked"]
        assert ranked[-1]["candidateId"] == "fail"
        assert ranked[-1]["finalScore"] == 0.0

    def test_invalid_cv_score_rejected(self, client):
        payload = {
            "candidates": [
                {"candidateId": "c1", "cvScore": 150, "examScore": 50, "hardFilterPassed": True}
            ]
        }
        resp = client.post("/rank/batch", json=payload)
        assert resp.status_code == 422
