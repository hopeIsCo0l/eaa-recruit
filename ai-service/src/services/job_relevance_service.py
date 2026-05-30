"""
Job description relevance check (aviation domain gate).

Used by Spring at job creation time to reject job postings that are not
aviation-related (Ethiopian Airlines / Ethiopian Aviation Academy domain).
Backed by the local Ollama LLM so no candidate data leaves the cluster.

Falls open (returns relevant=True) if Ollama is disabled or unreachable so
the platform is never blocked by an AI outage — admins can re-run later.
"""

from __future__ import annotations

import logging
from typing import Dict, Optional

from src.config import settings
from src.services.ollama_scoring import _extract_json, _generate, is_available

logger = logging.getLogger(__name__)

# System prompt — strict aviation-domain classifier + anti-discrimination filter.
SYSTEM_PROMPT = (
    "You are an aviation-industry HR domain classifier for Ethiopian Airlines "
    "and the Ethiopian Aviation Academy. "
    "Mark a job as relevant=true ONLY when it clearly belongs to the civil-aviation "
    "domain: airlines, airports, aviation academies, aircraft maintenance (MRO), "
    "flight operations, cabin crew, air traffic control, ground handling, aviation "
    "engineering, aviation IT, aviation safety, aviation training. "
    "Mark relevant=false when: "
    "(1) the role is clearly outside aviation (e.g. plumber, fintech developer, "
    "telecom sales, retail clerk, generic construction); OR "
    "(2) the description discriminates by gender, age, marital status, race, "
    "appearance, or contains exclusionary phrases like 'female only', "
    "'attractive young', 'unmarried women', 'males only', 'under 30'. "
    "When non-aviation, set category='non_aviation'. "
    "When discriminatory, set category='discriminatory'. "
    "Reply ONLY with a strict JSON object — no prose, no markdown, no code fence."
)

USER_PROMPT_TEMPLATE = """\
Classify whether the following job description is aviation-related AND free of
discriminatory language (gender, age, race, marital status, appearance).

Job title: {title}
Job description:
\"\"\"
{description}
\"\"\"

Required degree: {required_degree}

Confidence calibration — be decisive, do not hedge:
  0.90-1.00 : obvious case (e.g. "Plumber install pipes" → non_aviation 0.95;
                              "Boeing 737 First Officer" → flight_ops 0.95)
  0.70-0.89 : strong signal but some adjacent terms (corporate IT for airline)
  0.50-0.69 : mixed signal, lean one way
  below 0.50: only when genuinely 50/50 — rarely use

Reply ONLY with this JSON, no markdown, no prose:
{{
  "relevant": <true|false>,
  "confidence": <number 0.0 to 1.0>,
  "reason": "<one short sentence>",
  "category": "<flight_ops|cabin_crew|maintenance|ground|atc|aviation_it|corporate|non_aviation|discriminatory>"
}}
"""


def check_job_relevance(
    title: str,
    description: str,
    required_degree: str = "",
) -> Dict[str, object]:
    """
    Return classification dict with keys: relevant, confidence, reason, category, source.

    `source` is "ollama" when the LLM produced a parseable response,
    "fallback" when Ollama is unavailable / errored (caller may choose to
    permit creation under the assumption of human review).
    """
    if not settings.ollama_enabled or not is_available():
        logger.warning("Ollama unavailable — job-relevance check falling open")
        return {
            "relevant": True,
            "confidence": 0.0,
            "reason": "AI relevance check unavailable; manual review recommended.",
            "category": "unknown",
            "source": "fallback",
        }

    prompt = USER_PROMPT_TEMPLATE.format(
        title=title.strip() or "(none)",
        description=description.strip()[:4000],  # cap to keep token budget tight
        required_degree=required_degree.strip() or "(none)",
    )

    raw = _generate(prompt=prompt, system=SYSTEM_PROMPT, temperature=0.0)
    if not raw:
        logger.warning("Ollama generate returned None — falling open")
        return {
            "relevant": True,
            "confidence": 0.0,
            "reason": "AI relevance check returned no response.",
            "category": "unknown",
            "source": "fallback",
        }

    parsed: Optional[dict] = _extract_json(raw)
    if not parsed:
        logger.warning("Could not parse JSON from Ollama relevance response: %r", raw[:200])
        return {
            "relevant": True,
            "confidence": 0.0,
            "reason": "AI relevance check produced an unparseable response.",
            "category": "unknown",
            "source": "fallback",
        }

    # Normalise fields, defensive defaults.
    relevant = bool(parsed.get("relevant", True))
    try:
        confidence = float(parsed.get("confidence", 0.0))
    except (TypeError, ValueError):
        confidence = 0.0
    confidence = max(0.0, min(1.0, confidence))
    reason = str(parsed.get("reason", ""))[:300]
    category = str(parsed.get("category", "unknown"))[:50]

    return {
        "relevant": relevant,
        "confidence": confidence,
        "reason": reason,
        "category": category,
        "source": "ollama",
    }
