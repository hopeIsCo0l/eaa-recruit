"""
LLM-powered scoring via Ollama.

Replaces pure cosine-similarity with real language understanding for:
  - CV relevance scoring (how well a CV matches a job description)
  - Short-answer grading (how well a candidate answer matches the ideal)

Uses Ollama's REST API (httpx). Auto-pulls the model on first request.
Falls back gracefully if Ollama is unreachable.
"""
from __future__ import annotations

import json
import logging
import re
from typing import Optional, Tuple

import httpx

from src.config import settings

logger = logging.getLogger(__name__)

_model_ready = False


def _base_url() -> str:
    return settings.ollama_url.rstrip("/")


def _ensure_model() -> bool:
    """Pull the model if not already available. Returns True if model is ready."""
    global _model_ready
    if _model_ready:
        return True

    model = settings.ollama_model
    base = _base_url()

    try:
        # Check if model exists
        with httpx.Client(timeout=10.0) as c:
            res = c.get(f"{base}/api/tags")
            if res.is_success:
                tags = res.json()
                names = [m.get("name", "") for m in tags.get("models", [])]
                # Match model name (with or without :latest tag)
                if any(model in n or n.startswith(model) for n in names):
                    _model_ready = True
                    logger.info("Ollama model '%s' already available", model)
                    return True

        # Pull model
        logger.info("Pulling Ollama model '%s' — this may take a few minutes...", model)
        with httpx.Client(timeout=600.0) as c:
            res = c.post(f"{base}/api/pull", json={"name": model, "stream": False})
            if res.is_success:
                _model_ready = True
                logger.info("Ollama model '%s' pulled successfully", model)
                return True
            logger.error("Failed to pull model '%s': %s", model, res.text[:200])
            return False
    except httpx.HTTPError as ex:
        logger.error("Ollama connection failed: %s", ex)
        return False


def _generate(prompt: str, system: str = "", temperature: float = 0.1) -> Optional[str]:
    """Send a generation request to Ollama. Returns response text or None on failure."""
    if not _ensure_model():
        return None

    base = _base_url()
    payload = {
        "model": settings.ollama_model,
        "prompt": prompt,
        "system": system,
        "stream": False,
        "options": {
            "temperature": temperature,
            "num_predict": 512,
        },
    }

    try:
        with httpx.Client(timeout=120.0) as c:
            res = c.post(f"{base}/api/generate", json=payload)
            if res.is_success:
                return res.json().get("response", "")
            logger.error("Ollama generate failed: status=%s body=%s",
                         res.status_code, res.text[:200])
            return None
    except httpx.HTTPError as ex:
        logger.error("Ollama generate request error: %s", ex)
        return None


def _extract_json(text: str) -> Optional[dict]:
    """Extract JSON object from LLM response (handles markdown fences, extra text)."""
    # Try direct parse first
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass

    # Try extracting from markdown code fence
    m = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(1))
        except json.JSONDecodeError:
            pass

    # Try finding first { ... } block
    m = re.search(r"\{[^{}]*\}", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(0))
        except json.JSONDecodeError:
            pass

    return None


# ─── CV RELEVANCE SCORING ─────────────────────────────────────────────

CV_SYSTEM = """You are an expert technical recruiter for an aviation company.
You evaluate CVs against job descriptions and provide a relevance score.
You MUST respond with ONLY a valid JSON object — no extra text."""

CV_PROMPT_TEMPLATE = """Score how well this CV matches the job description.

Consider:
- Required skills/qualifications match
- Required degree match
- Years and type of experience relevance
- Domain knowledge alignment
- Overall fit for the role

JOB DESCRIPTION:
{job_description}

CANDIDATE CV:
{cv_text}

Respond with ONLY this JSON format:
{{"score": <integer 0-100>, "reasoning": "<2-3 sentence explanation>"}}"""


def score_cv(cv_text: str, job_description: str) -> Optional[Tuple[float, str]]:
    """
    Score a CV against a job description using Ollama LLM.

    Returns (score_0_to_1, reasoning) or None if Ollama unavailable.
    score is normalized to [0.0, 1.0] for the backend callback.
    """
    # Truncate inputs to avoid overwhelming small models
    cv_trimmed = cv_text[:3000]
    jd_trimmed = job_description[:2000]

    prompt = CV_PROMPT_TEMPLATE.format(
        cv_text=cv_trimmed,
        job_description=jd_trimmed,
    )

    response = _generate(prompt, system=CV_SYSTEM)
    if response is None:
        return None

    parsed = _extract_json(response)
    if parsed is None:
        logger.warning("Could not parse CV score JSON from Ollama response: %s", response[:200])
        return None

    try:
        score = int(parsed["score"])
        score = max(0, min(100, score))
        reasoning = str(parsed.get("reasoning", ""))
        logger.info("Ollama CV score: %d/100 — %s", score, reasoning[:100])
        return (round(score / 100.0, 4), reasoning)
    except (KeyError, ValueError, TypeError) as ex:
        logger.warning("Invalid CV score structure: %s — error: %s", parsed, ex)
        return None


# ─── SHORT-ANSWER GRADING ─────────────────────────────────────────────

GRADE_SYSTEM = """You are an expert exam grader for aviation recruitment.
You evaluate candidate answers against ideal answers.
You MUST respond with ONLY a valid JSON object — no extra text."""

GRADE_PROMPT_TEMPLATE = """Grade this candidate's answer against the ideal answer.

IDEAL ANSWER:
{ideal_answer}

CANDIDATE'S ANSWER:
{candidate_answer}

MAXIMUM MARKS: {max_marks}

STRICT GRADING RULES:
1. Does the candidate's answer discuss the SAME TOPIC as the ideal answer? If NO → similarity=0.0, awarded_marks=0
2. Does the answer contain the KEY CONCEPTS from the ideal? If NO → similarity below 0.3, awarded_marks below 2
3. Full marks ONLY if ALL key points are covered correctly
4. similarity and awarded_marks MUST be proportional: similarity 0.5 = half marks, similarity 0.0 = 0 marks

EXAMPLE: If ideal is about "aerodynamic lift via pressure difference" and candidate talks about "engine thrust" → DIFFERENT TOPIC → similarity=0.0, awarded_marks=0

Respond with ONLY this JSON:
{{"similarity": <float 0.0-1.0>, "awarded_marks": <float 0 to {max_marks}>, "feedback": "<one sentence>"}}"""


def grade_answer(
    ideal_answer: str,
    candidate_answer: str,
    max_marks: float,
) -> Optional[Tuple[float, float, str]]:
    """
    Grade a candidate answer against the ideal using Ollama LLM.

    Returns (similarity_0_to_1, awarded_marks, feedback) or None if unavailable.
    """
    prompt = GRADE_PROMPT_TEMPLATE.format(
        ideal_answer=ideal_answer[:2000],
        candidate_answer=candidate_answer[:2000],
        max_marks=max_marks,
    )

    response = _generate(prompt, system=GRADE_SYSTEM)
    if response is None:
        return None

    parsed = _extract_json(response)
    if parsed is None:
        logger.warning("Could not parse grade JSON from Ollama response: %s", response[:200])
        return None

    try:
        similarity = float(parsed["similarity"])
        similarity = max(0.0, min(1.0, similarity))
        awarded = float(parsed["awarded_marks"])
        awarded = max(0.0, min(float(max_marks), awarded))

        # Post-processing: enforce strict proportionality for small models
        # Cap awarded marks at similarity * max_marks (model can't award more than similarity implies)
        cap = similarity * float(max_marks)
        if awarded > cap + 0.5:
            logger.info("Capping awarded %.1f → %.1f (similarity %.2f cap)", awarded, cap, similarity)
            awarded = cap
        # Low similarity = low marks (at or below 0.3 similarity → zero marks)
        if similarity <= 0.3:
            awarded = 0.0

        feedback = str(parsed.get("feedback", ""))
        logger.info("Ollama grading: similarity=%.2f awarded=%.1f/%s — %s",
                     similarity, awarded, max_marks, feedback[:80])
        return (round(similarity, 4), round(awarded, 2), feedback)
    except (KeyError, ValueError, TypeError) as ex:
        logger.warning("Invalid grade structure: %s — error: %s", parsed, ex)
        return None


def is_available() -> bool:
    """Quick check if Ollama is reachable."""
    try:
        with httpx.Client(timeout=3.0) as c:
            res = c.get(f"{_base_url()}/api/tags")
            return res.is_success
    except httpx.HTTPError:
        return False
