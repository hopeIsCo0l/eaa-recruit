import logging
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    Image, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)

from src.services.attribution_service import AttributionResult
from src.services.justification_engine import Justification

logger = logging.getLogger(__name__)

STORAGE_DIR = Path(os.getenv("PDF_STORAGE_DIR", "./reports"))
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

# Colours
PRIMARY = colors.HexColor("#1a3c5e")
ACCENT = colors.HexColor("#2e86c1")
LIGHT_BG = colors.HexColor("#eaf4fb")


def _build_attribution_chart(attribution: AttributionResult, tmp_path: Path) -> Path:
    items = sorted(attribution.raw_weights[:10], key=lambda x: x[1])
    words = [w for w, _ in items]
    weights = [s for _, s in items]
    bar_colors = [ACCENT.hexval() if s > 0 else "#e74c3c" for s in weights]

    fig, ax = plt.subplots(figsize=(7, max(3, len(words) * 0.4)))
    ax.barh(words, weights, color=bar_colors)
    ax.axvline(0, color="black", linewidth=0.8)
    ax.set_xlabel("Contribution to CV Score")
    ax.set_title("CV Feature Attribution (LIME)")
    ax.tick_params(axis="y", labelsize=8)
    plt.tight_layout()
    chart_path = tmp_path / "attribution_chart.png"
    fig.savefig(chart_path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    return chart_path


def _score_row(label: str, value: float, max_val: float = 100) -> list:
    return [label, f"{value:.1f} / {max_val:.0f}"]


def generate_pdf(
    application_id: str,
    candidate_name: str,
    job_title: str,
    cv_score: float,
    exam_score: float,
    final_score: float,
    hard_filter_passed: bool,
    attribution: AttributionResult,
    justification: Justification,
    recruiter_notes: Optional[str] = None,
) -> Path:
    out_path = STORAGE_DIR / f"{application_id}_feedback.pdf"
    tmp_dir = STORAGE_DIR / "tmp"
    tmp_dir.mkdir(exist_ok=True)

    doc = SimpleDocTemplate(
        str(out_path),
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )
    styles = getSampleStyleSheet()
    h1 = ParagraphStyle("h1", parent=styles["Heading1"], textColor=PRIMARY, fontSize=16)
    h2 = ParagraphStyle("h2", parent=styles["Heading2"], textColor=ACCENT, fontSize=12)
    body = styles["BodyText"]
    body.leading = 16

    story = []

    # — Header —
    story.append(Paragraph("Recruitment Feedback Report", h1))
    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph(f"<b>Candidate:</b> {candidate_name}", body))
    story.append(Paragraph(f"<b>Position:</b> {job_title}", body))
    story.append(Spacer(1, 0.5 * cm))

    # — Score Summary Table —
    story.append(Paragraph("Score Summary", h2))
    score_data = [
        ["Component", "Score"],
        _score_row("CV Relevance", cv_score),
        _score_row("Technical Exam", exam_score),
        ["Eligibility Check", "PASS" if hard_filter_passed else "FAIL"],
        _score_row("Final Weighted Score", final_score),
    ]
    tbl = Table(score_data, colWidths=[9 * cm, 6 * cm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("BACKGROUND", (0, 1), (-1, -1), LIGHT_BG),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(tbl)
    story.append(Spacer(1, 0.6 * cm))

    # — Attribution Chart —
    story.append(Paragraph("CV Feature Attribution", h2))
    chart_path = _build_attribution_chart(attribution, tmp_dir)
    story.append(Image(str(chart_path), width=14 * cm, height=7 * cm))
    story.append(Spacer(1, 0.6 * cm))

    # — Justification —
    story.append(Paragraph("AI Assessment Justification", h2))
    for para_text in justification.full_text.split("\n\n"):
        story.append(Paragraph(para_text.strip(), body))
        story.append(Spacer(1, 0.2 * cm))

    # — Recruiter Notes —
    if recruiter_notes and recruiter_notes.strip():
        story.append(Spacer(1, 0.3 * cm))
        story.append(Paragraph("Recruiter Notes", h2))
        story.append(Paragraph(recruiter_notes.strip(), body))

    doc.build(story)
    logger.info("PDF generated: %s", out_path)
    return out_path
