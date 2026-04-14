"""
PII masking utility (FR-75).

Detects and replaces PII in CV text before it reaches the embedding pipeline
or vector cache.  The original unmasked text is preserved by callers for
display-only purposes (e.g. feedback PDF).

Detected PII types
------------------
- PHONE    : international / local phone numbers
- EMAIL    : email addresses
- ADDRESS  : street-level physical address fragments
- NATIONAL_ID : identity / passport / IC numbers (Malaysian IC, generic patterns)
"""

import logging
import re
from dataclasses import dataclass
from typing import NamedTuple

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Pattern definitions
# ---------------------------------------------------------------------------

class _Pattern(NamedTuple):
    label: str
    placeholder: str
    regex: re.Pattern


# Order matters — more specific patterns first.
_PATTERNS: list[_Pattern] = [
    # Email (before phone so "user@123.com" doesn't partially match phone)
    _Pattern(
        label="EMAIL",
        placeholder="[EMAIL_REDACTED]",
        regex=re.compile(
            r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b",
            re.IGNORECASE,
        ),
    ),
    # Malaysian IC: YYMMDD-SS-NNNN (with or without dashes)
    _Pattern(
        label="NATIONAL_ID",
        placeholder="[NATIONAL_ID_REDACTED]",
        regex=re.compile(
            r"\b\d{6}[-\s]?\d{2}[-\s]?\d{4}\b",
        ),
    ),
    # Passport: letter(s) + 6-9 digits
    _Pattern(
        label="NATIONAL_ID",
        placeholder="[NATIONAL_ID_REDACTED]",
        regex=re.compile(
            r"\b[A-Z]{1,2}\d{6,9}\b",
        ),
    ),
    # Phone: covers +60-12-345 6789, (03) 1234 5678, 012-3456789, etc.
    _Pattern(
        label="PHONE",
        placeholder="[PHONE_REDACTED]",
        regex=re.compile(
            r"(?<!\d)"                          # not preceded by digit
            r"(\+?\d{1,3}[\s\-.]?)?"           # optional country code
            r"(\(0?\d{1,4}\)[\s\-.]?)?"        # optional area code in parens
            r"\d{2,5}"                          # first digit group
            r"[\s\-.]\d{3,5}"                   # middle group
            r"([\s\-.]\d{3,5})?"               # optional trailing group
            r"(?!\d)",                          # not followed by digit
        ),
    ),
    # Street address: "No. 12", "Jalan ...", "Jln ...", "Lot ...", postcode patterns
    _Pattern(
        label="ADDRESS",
        placeholder="[ADDRESS_REDACTED]",
        regex=re.compile(
            r"\b(no\.?\s*\d+[,\s]|lot\s+\d+[,\s]|jalan\s+\S+|jln\s+\S+|"
            r"\d{5}\s+[A-Za-z]+)",             # Malaysian postcode + city
            re.IGNORECASE,
        ),
    ),
]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class MaskResult:
    masked_text: str
    detections: list[tuple[str, int]]   # [(label, count), ...]


def mask(text: str) -> MaskResult:
    """
    Replace PII in *text* with type-specific placeholders.

    Returns a :class:`MaskResult` containing the masked text and a summary
    of what was detected (label + count).  The actual PII values are never
    logged or stored.
    """
    counts: dict[str, int] = {}
    result = text

    for pat in _PATTERNS:
        matches = pat.regex.findall(result)
        if matches:
            n = len(pat.regex.findall(result))
            result = pat.regex.sub(pat.placeholder, result)
            counts[pat.label] = counts.get(pat.label, 0) + n

    detections = sorted(counts.items())
    if detections:
        summary = ", ".join(f"{label}×{count}" for label, count in detections)
        logger.info("PII masked: %s", summary)

    return MaskResult(masked_text=result, detections=detections)
