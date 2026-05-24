"""Ranking router: final-score formula + sort + hard-filter gating."""
from fastapi import FastAPI
from fastapi.testclient import TestClient


def _client():
    from src.routers import ranking
    from src.utils import auth

    app = FastAPI()
    # Bypass internal API key for tests
    app.dependency_overrides[auth.verify_internal_api_key] = lambda: None
    app.include_router(ranking.router)
    return TestClient(app)


class TestRanking:
    def test_rejects_empty_candidates(self):
        resp = _client().post("/rank/batch", json={"candidates": []})
        assert resp.status_code == 422

    def test_rejects_out_of_range_score(self):
        resp = _client().post("/rank/batch", json={
            "candidates": [{"candidateId": "c1", "cvScore": 150, "examScore": 70,
                            "hardFilterPassed": True}],
        })
        assert resp.status_code == 422

    def test_hard_filter_failed_zeroes_final(self):
        resp = _client().post("/rank/batch", json={
            "candidates": [{"candidateId": "c1", "cvScore": 90, "examScore": 80,
                            "hardFilterPassed": False}],
        })
        assert resp.status_code == 200
        ranked = resp.json()["ranked"]
        assert ranked[0]["finalScore"] == 0.0

    def test_formula_and_sort(self):
        resp = _client().post("/rank/batch", json={
            "candidates": [
                {"candidateId": "low",  "cvScore": 50, "examScore": 50,
                 "hardFilterPassed": True},
                {"candidateId": "high", "cvScore": 90, "examScore": 90,
                 "hardFilterPassed": True},
            ],
        })
        ranked = resp.json()["ranked"]
        # High first
        assert ranked[0]["candidateId"] == "high"
        # 90*0.4 + 90*0.4 + 20 = 92
        assert ranked[0]["finalScore"] == 92.0
        # 50*0.4 + 50*0.4 + 20 = 60
        assert ranked[1]["finalScore"] == 60.0
