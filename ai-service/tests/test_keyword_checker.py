"""Keyword presence + penalty logic."""
import os

# Ensure deterministic penalty regardless of env
os.environ.setdefault("KEYWORD_PENALTY_PERCENT", "5.0")

from src.services.keyword_checker import (  # noqa: E402
    apply_keyword_penalty,
    check_keywords,
)


class TestKeywordChecker:
    def test_all_present(self):
        r = check_keywords("Spring boot uses JPA", ["spring", "jpa"])
        assert r.present == ["spring", "jpa"]
        assert r.missing == []

    def test_case_insensitive(self):
        r = check_keywords("SPRING BOOT", ["spring"])
        assert r.present == ["spring"]

    def test_missing_keywords_tracked(self):
        r = check_keywords("only spring here", ["spring", "kafka"])
        assert r.missing == ["kafka"]

    def test_no_penalty_when_all_present(self):
        r = check_keywords("a b c", ["a"])
        assert apply_keyword_penalty(80.0, r, 100.0) == 80.0

    def test_penalty_subtracted(self):
        r = check_keywords("only a", ["a", "b", "c"])  # 2 missing -> 10%
        out = apply_keyword_penalty(80.0, r, 100.0)
        # 80 - 100*0.10 = 70
        assert out == 70.0

    def test_penalty_floors_at_zero(self):
        r = check_keywords("none", ["a", "b", "c", "d", "e"])  # huge penalty
        out = apply_keyword_penalty(10.0, r, 100.0)
        assert out == 0.0
