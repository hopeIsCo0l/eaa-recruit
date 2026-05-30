import logging
from dataclasses import dataclass
from typing import Optional

from src.services.semantic_explanation import SemanticExplanation

logger = logging.getLogger(__name__)


@dataclass
class JustificationInput:
    candidate_name:     str
    job_title:          str
    cv_score:           float           # 0-100
    exam_score:         float           # 0-100
    hard_filter_passed: bool
    final_score:        float           # 0-100
    explanation:        SemanticExplanation
    decision:           str             # SELECTED | REJECTED | WAITLISTED
    qwen_reason:        str = ""        # Qwen-generated paragraph (empty = use template fallback)
    recruiter_notes:    Optional[str] = None


@dataclass
class Justification:
    summary:                str     # Qwen paragraph or template fallback
    cv_commentary:          str
    exam_commentary:        str
    eligibility_commentary: str
    full_text:              str     # concatenated, ready for PDF


def _score_label(score: float) -> str:
    if score >= 75:
        return "strong"
    if score >= 50:
        return "moderate"
    return "limited"


def _cv_commentary(data: JustificationInput) -> str:
    name  = data.candidate_name
    job   = data.job_title
    cv    = data.cv_score
    label = _score_label(cv)
    exp   = data.explanation

    if not exp.available:
        return (
            f"{name}'s CV showed a {label} alignment with the {job} requirements, "
            f"achieving a CV relevance score of {cv:.1f}/100."
        )

    strong_reqs = [p.jd_chunk for p in exp.strong_matches[:3]]
    weak_reqs   = [p.jd_chunk for p in exp.weak_matches[:2]]
    gaps        = exp.gaps[:3]

    parts = [
        f"{name}'s CV demonstrated a {label} match for the {job} role, "
        f"scoring {cv:.1f}/100."
    ]

    if strong_reqs:
        req_list = "; ".join(f'"{r}"' for r in strong_reqs)
        parts.append(f"Strong alignment was found with: {req_list}.")

    if weak_reqs:
        req_list = "; ".join(f'"{r}"' for r in weak_reqs)
        parts.append(f"Partial coverage was found for: {req_list}.")

    if gaps:
        gap_list = "; ".join(f'"{g}"' for g in gaps)
        parts.append(f"The following requirements were not addressed in the CV: {gap_list}.")

    return " ".join(parts)


def _exam_commentary(data: JustificationInput) -> str:
    name = data.candidate_name
    exam = data.exam_score

    if exam >= 75:
        return (
            f"{name} performed well on the technical assessment, "
            f"scoring {exam:.1f}/100, reflecting solid domain knowledge."
        )
    if exam >= 50:
        return (
            f"{name} achieved a passing exam score of {exam:.1f}/100, "
            f"demonstrating adequate technical proficiency."
        )
    return (
        f"{name} scored {exam:.1f}/100 on the technical assessment, "
        f"indicating areas for further development."
    )


def _eligibility_commentary(data: JustificationInput) -> str:
    name = data.candidate_name
    job  = data.job_title

    if data.hard_filter_passed:
        return f"{name} met all mandatory eligibility criteria for the {job} position."
    return (
        f"{name} did not meet one or more mandatory eligibility criteria for the {job} position, "
        f"resulting in disqualification at the screening stage regardless of scores."
    )


def generate(data: JustificationInput) -> Justification:
    cv_commentary          = _cv_commentary(data)
    exam_commentary        = _exam_commentary(data)
    eligibility_commentary = _eligibility_commentary(data)

    # Summary: prefer Qwen-generated reason; fall back to template
    if data.qwen_reason:
        summary = data.qwen_reason
    else:
        eligibility_str = (
            "All eligibility requirements were satisfied."
            if data.hard_filter_passed
            else "Mandatory eligibility requirements were not met."
        )
        summary = (
            f"{data.candidate_name} received a final weighted score of {data.final_score:.1f}/100 "
            f"for the {data.job_title} role. "
            f"The CV relevance score was {data.cv_score:.1f}/100 ({_score_label(data.cv_score)} match), "
            f"and the exam score was {data.exam_score:.1f}/100. "
            f"{eligibility_str}"
        )
        if data.recruiter_notes:
            summary += f" Recruiter notes: {data.recruiter_notes.strip()}"

    full_text = "\n\n".join([summary, cv_commentary, exam_commentary, eligibility_commentary])

    logger.info(
        "Justification generated candidate=%s final=%.2f qwen=%s",
        data.candidate_name, data.final_score, bool(data.qwen_reason),
    )

    return Justification(
        summary=summary,
        cv_commentary=cv_commentary,
        exam_commentary=exam_commentary,
        eligibility_commentary=eligibility_commentary,
        full_text=full_text,
    )
