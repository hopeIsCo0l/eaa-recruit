import logging
from dataclasses import dataclass
from typing import List, Optional

from src.services.attribution_service import AttributionResult

logger = logging.getLogger(__name__)


@dataclass
class JustificationInput:
    candidate_name: str
    job_title: str
    cv_score: float          # 0–100
    exam_score: float        # 0–100
    hard_filter_passed: bool
    final_score: float       # 0–100
    attribution: AttributionResult
    recruiter_notes: Optional[str] = None


@dataclass
class Justification:
    summary: str             # 3–5 sentences
    cv_commentary: str
    exam_commentary: str
    eligibility_commentary: str
    full_text: str           # concatenated, ready for PDF


def _fmt_contributors(items: List[tuple[str, float]], n: int = 3) -> str:
    top = [word for word, _ in items[:n]]
    if not top:
        return "no standout terms"
    if len(top) == 1:
        return f'"{top[0]}"'
    return ", ".join(f'"{w}"' for w in top[:-1]) + f' and "{top[-1]}"'


def generate(data: JustificationInput) -> Justification:
    name = data.candidate_name
    job = data.job_title
    cv = data.cv_score
    exam = data.exam_score
    final = data.final_score
    pos = data.attribution.top_positive
    neg = data.attribution.top_negative

    # — CV commentary —
    if cv >= 75:
        cv_strength = "strong"
        cv_opening = f"{name}'s CV demonstrated a strong match for the {job} role"
    elif cv >= 50:
        cv_strength = "moderate"
        cv_opening = f"{name}'s CV showed a moderate alignment with the {job} requirements"
    else:
        cv_strength = "limited"
        cv_opening = f"{name}'s CV indicated limited alignment with the {job} requirements"

    pos_str = _fmt_contributors(pos)
    cv_commentary = (
        f"{cv_opening}, achieving a CV relevance score of {cv:.1f}/100. "
        f"Key positive contributors included {pos_str}."
    )
    if neg:
        neg_str = _fmt_contributors(neg)
        cv_commentary += f" Areas with lower relevance included {neg_str}."

    # — Exam commentary —
    if exam >= 75:
        exam_commentary = (
            f"{name} performed well on the technical assessment, "
            f"scoring {exam:.1f}/100, reflecting solid domain knowledge."
        )
    elif exam >= 50:
        exam_commentary = (
            f"{name} achieved a passing exam score of {exam:.1f}/100, "
            f"demonstrating adequate technical proficiency."
        )
    else:
        exam_commentary = (
            f"{name} scored {exam:.1f}/100 on the technical assessment, "
            f"indicating areas for further development."
        )

    # — Eligibility commentary —
    if data.hard_filter_passed:
        eligibility_commentary = (
            f"{name} met all mandatory eligibility criteria for the {job} position."
        )
    else:
        eligibility_commentary = (
            f"{name} did not meet one or more mandatory eligibility criteria for the {job} position, "
            f"resulting in disqualification at the screening stage."
        )

    # — Summary —
    summary = (
        f"{name} received a final weighted score of {final:.1f}/100 for the {job} role. "
        f"The CV relevance score was {cv:.1f}/100 ({cv_strength} match), "
        f"and the exam score was {exam:.1f}/100. "
        f"{'All eligibility requirements were satisfied.' if data.hard_filter_passed else 'Mandatory eligibility requirements were not met.'}"
    )
    if data.recruiter_notes:
        summary += f" Recruiter notes: {data.recruiter_notes.strip()}"

    full_text = "\n\n".join([summary, cv_commentary, exam_commentary, eligibility_commentary])

    logger.info("Justification generated for candidate=%s final_score=%.2f", name, final)

    return Justification(
        summary=summary,
        cv_commentary=cv_commentary,
        exam_commentary=exam_commentary,
        eligibility_commentary=eligibility_commentary,
        full_text=full_text,
    )
