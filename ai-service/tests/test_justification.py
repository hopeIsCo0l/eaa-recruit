"""Template-based justification engine — score-band branching + eligibility."""
from src.services.attribution_service import AttributionResult
from src.services.justification_engine import JustificationInput, generate


def _input(cv: float, exam: float, hard_pass: bool = True, notes: str | None = None):
    attribution = AttributionResult(
        top_positive=[("python", 0.5), ("kubernetes", 0.3)],
        top_negative=[("intern", -0.2)],
        raw_weights=[("python", 0.5), ("kubernetes", 0.3), ("intern", -0.2)],
    )
    return JustificationInput(
        candidate_name="Alice",
        job_title="SRE",
        cv_score=cv,
        exam_score=exam,
        hard_filter_passed=hard_pass,
        final_score=(cv + exam) / 2,
        attribution=attribution,
        recruiter_notes=notes,
    )


class TestJustification:
    def test_strong_cv_branch(self):
        j = generate(_input(cv=85, exam=80))
        assert "strong match" in j.cv_commentary

    def test_moderate_cv_branch(self):
        j = generate(_input(cv=60, exam=70))
        assert "moderate" in j.cv_commentary

    def test_limited_cv_branch(self):
        j = generate(_input(cv=30, exam=40))
        assert "limited" in j.cv_commentary

    def test_eligibility_fail_message(self):
        j = generate(_input(cv=90, exam=90, hard_pass=False))
        assert "did not meet" in j.eligibility_commentary
        assert "not met" in j.summary or "not met" in j.summary.lower()

    def test_recruiter_notes_appended(self):
        j = generate(_input(cv=70, exam=70, notes="Strong leadership"))
        assert "Strong leadership" in j.summary

    def test_top_contributors_quoted(self):
        j = generate(_input(cv=80, exam=80))
        assert '"python"' in j.cv_commentary
