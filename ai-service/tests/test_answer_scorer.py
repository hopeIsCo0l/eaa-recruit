"""Answer scoring thresholds + keyword penalty wiring."""
from unittest.mock import patch

import pytest


def _patched_embed(text: str):
    # Map specific texts to vectors so cosine is predictable.
    if text == "IDEAL":
        return [1.0, 0.0]
    if text == "PERFECT":     # cosine 1.0 -> full marks
        return [1.0, 0.0]
    if text == "PARTIAL":     # cosine 0.75 -> interpolated
        return [0.75, 0.6614378278]
    if text == "WAY_OFF":     # cosine 0.1 -> zero (below partial)
        return [0.1, 0.99498744]
    return [0.0, 0.0]


@pytest.fixture(autouse=True)
def _stub_embed(monkeypatch):
    from src.services import answer_scorer, answer_key_service
    monkeypatch.setattr(answer_scorer, "embed", _patched_embed)
    monkeypatch.setattr(answer_key_service, "embed", _patched_embed)
    # Bypass cache layer
    from src.services import vector_cache
    monkeypatch.setattr(vector_cache, "get", lambda _k: None)
    monkeypatch.setattr(vector_cache, "put", lambda *_args, **_kw: None)
    yield


class TestAnswerScorer:
    def test_full_marks_above_full_threshold(self):
        from src.services.answer_scorer import score_answer
        r = score_answer("q1", "IDEAL", "PERFECT", max_marks=10.0)
        assert r.awarded_marks == 10.0

    def test_zero_below_partial_threshold(self):
        from src.services.answer_scorer import score_answer
        r = score_answer("q2", "IDEAL", "WAY_OFF", max_marks=10.0)
        assert r.awarded_marks == 0.0

    def test_partial_marks_in_band(self):
        from src.services.answer_scorer import score_answer
        r = score_answer("q3", "IDEAL", "PARTIAL", max_marks=10.0)
        assert 5.0 <= r.awarded_marks < 10.0

    def test_keyword_penalty_applied(self):
        from src.services.answer_scorer import score_answer
        # PERFECT scores full, then missing keyword takes 5% off (0.5 for max=10)
        r = score_answer("q4", "IDEAL", "PERFECT", max_marks=10.0,
                         required_keywords=["nonexistent"])
        assert r.awarded_marks == pytest.approx(9.5)
        assert r.keyword_result is not None
        assert r.keyword_result.missing == ["nonexistent"]
