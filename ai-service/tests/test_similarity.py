"""Cosine similarity scoring — score range + zero-vector handling."""
import pytest


@pytest.fixture(autouse=True)
def _stub_embed(monkeypatch):
    from src.services import similarity_service, vector_cache
    monkeypatch.setattr(vector_cache, "get", lambda _t: None)
    monkeypatch.setattr(vector_cache, "put", lambda *_a, **_k: None)

    table = {
        "JD": [1.0, 0.0],
        "CV_MATCH":    [1.0, 0.0],   # cosine 1.0 -> 100
        "CV_OPPOSITE": [-1.0, 0.0],  # cosine -1 -> 0
        "CV_ORTHOG":   [0.0, 1.0],   # cosine 0 -> 50
        "EMPTY":       [0.0, 0.0],
    }
    monkeypatch.setattr(similarity_service, "embed", lambda t: table.get(t, [0.0, 0.0]))
    yield


class TestSimilarity:
    def test_perfect_match_max_score(self):
        from src.services.similarity_service import score_cv_against_job
        assert score_cv_against_job("CV_MATCH", "JD") == 100.0

    def test_opposite_min_score(self):
        from src.services.similarity_service import score_cv_against_job
        assert score_cv_against_job("CV_OPPOSITE", "JD") == 0.0

    def test_orthogonal_midpoint(self):
        from src.services.similarity_service import score_cv_against_job
        assert score_cv_against_job("CV_ORTHOG", "JD") == 50.0

    def test_zero_vector_safe(self):
        from src.services.similarity_service import score_cv_against_job
        # Empty vector cosine treated as 0, scaled to 50
        assert score_cv_against_job("EMPTY", "JD") == 50.0

    def test_score_range_bounded(self):
        from src.services.similarity_service import score_cv_against_job
        for cv in ("CV_MATCH", "CV_OPPOSITE", "CV_ORTHOG", "EMPTY"):
            s = score_cv_against_job(cv, "JD")
            assert 0.0 <= s <= 100.0
