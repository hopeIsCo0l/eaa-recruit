"""Tests for the cosine-similarity helper in similarity_service (FR-32)."""
import math
from unittest.mock import patch

import pytest

import src.services.similarity_service as sim_svc
from src.services.similarity_service import _cosine


class TestCosine:
    def test_identical_vectors_return_one(self):
        v = [1.0, 0.0, 0.0]
        assert abs(_cosine(v, v) - 1.0) < 1e-6

    def test_orthogonal_vectors_return_zero(self):
        assert abs(_cosine([1.0, 0.0], [0.0, 1.0])) < 1e-6

    def test_opposite_vectors_return_minus_one(self):
        assert abs(_cosine([1.0, 0.0], [-1.0, 0.0]) - (-1.0)) < 1e-6

    def test_zero_vector_a_returns_zero(self):
        assert _cosine([0.0, 0.0], [1.0, 1.0]) == 0.0

    def test_zero_vector_b_returns_zero(self):
        assert _cosine([1.0, 1.0], [0.0, 0.0]) == 0.0

    def test_result_in_valid_range(self):
        v1 = [3.0, 1.0, -2.0]
        v2 = [-1.0, 4.0, 0.5]
        result = _cosine(v1, v2)
        assert -1.0 <= result <= 1.0


class TestScoreCvAgainstJob:
    def test_output_in_zero_to_100_range(self):
        fake_embed = [1.0, 0.0, 0.0]
        with patch.object(sim_svc, "embed", return_value=fake_embed):
            score = sim_svc.score_cv_against_job("cv text", "job desc")
        assert 0.0 <= score <= 100.0

    def test_identical_texts_return_100(self):
        # identical embed vectors → cosine=1 → (1+1)/2*100 = 100
        fake_embed = [1.0, 0.0]
        with patch.object(sim_svc, "embed", return_value=fake_embed):
            score = sim_svc.score_cv_against_job("text", "text")
        assert score == 100.0

    def test_result_rounded_to_two_dp(self):
        with patch.object(sim_svc, "embed", side_effect=[[0.6, 0.8], [0.8, 0.6]]):
            score = sim_svc.score_cv_against_job("cv", "jd")
        assert score == round(score, 2)
