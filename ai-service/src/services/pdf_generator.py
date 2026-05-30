import logging
from pathlib import Path
from typing import Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)

from src.config import settings
from src.services.semantic_explanation import SemanticExplanation
from src.services.justification_engine import Justification

logger = logging.getLogger(__name__)

STORAGE_DIR = Path(settings.pdf_storage_dir)
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

# Colours
PRIMARY  = colors.HexColor("#1a3c5e")
ACCENT   = colors.HexColor("#2e86c1")
SUCCESS  = colors.HexColor("#1a7a4a")
WARNING  = colors.HexColor("#b7791f")
DANGER   = colors.HexColor("#c0392b")
LIGHT_BG = colors.HexColor("#eaf4fb")
GAP_BG   = colors.HexColor("#fdf0f0")
WEAK_BG  = colors.HexColor("#fef9ec")


def _score_row(label: str, value: float, max_val: float = 100) -> list:
    return [label, f"{value:.1f} / {max_val:.0f}"]


def _pct(sim: float) -> str:
    return f"{sim * 100:.0f}%"


def _build_alignment_table(explanation: SemanticExplanation, styles) -> list:
    """Build ReportLab story blocks for the semantic alignment section."""
    story = []
    h2    = ParagraphStyle("h2", parent=styles["Heading2"], textColor=ACCENT, fontSize=12)
    small = ParagraphStyle("small", parent=styles["BodyText"], fontSize=8, leading=11)

    story.append(Paragraph("Semantic Alignment Analysis", h2))
    story.append(Spacer(1, 0.2 * cm))

    if not explanation.available:
        story.append(Paragraph(
            "Semantic alignment data is not available for this application "
            "(chunk embeddings were not stored at submission time).",
            small,
        ))
        return story

    # ── Strong matches ──
    if explanation.strong_matches:
        story.append(Paragraph("Strong Matches", ParagraphStyle(
            "sh", parent=styles["Normal"], textColor=SUCCESS, fontSize=10, fontName="Helvetica-Bold",
        )))
        story.append(Spacer(1, 0.15 * cm))
        header = [
            Paragraph("<b>CV Phrase</b>", small),
            Paragraph("<b>Job Requirement</b>", small),
            Paragraph("<b>Match</b>", small),
        ]
        rows = [header] + [
            [
                Paragraph(p.cv_chunk[:120], small),
                Paragraph(p.jd_chunk[:120], small),
                Paragraph(f"<b>{_pct(p.similarity)}</b>", ParagraphStyle(
                    "spct", parent=small, textColor=SUCCESS,
                )),
            ]
            for p in explanation.strong_matches
        ]
        tbl = Table(rows, colWidths=[7 * cm, 7 * cm, 2 * cm])
        tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
            ("TEXTCOLOR",  (0, 0), (-1, 0), colors.white),
            ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#f0faf4")),
            ("GRID",       (0, 0), (-1, -1), 0.4, colors.grey),
            ("PADDING",    (0, 0), (-1, -1), 5),
            ("VALIGN",     (0, 0), (-1, -1), "TOP"),
        ]))
        story.append(tbl)
        story.append(Spacer(1, 0.3 * cm))

    # ── Weak / partial matches ──
    if explanation.weak_matches:
        story.append(Paragraph("Partial Matches", ParagraphStyle(
            "wh", parent=styles["Normal"], textColor=WARNING, fontSize=10, fontName="Helvetica-Bold",
        )))
        story.append(Spacer(1, 0.15 * cm))
        header = [
            Paragraph("<b>CV Phrase</b>", small),
            Paragraph("<b>Job Requirement</b>", small),
            Paragraph("<b>Match</b>", small),
        ]
        rows = [header] + [
            [
                Paragraph(p.cv_chunk[:120], small),
                Paragraph(p.jd_chunk[:120], small),
                Paragraph(f"<b>{_pct(p.similarity)}</b>", ParagraphStyle(
                    "wpct", parent=small, textColor=WARNING,
                )),
            ]
            for p in explanation.weak_matches
        ]
        tbl = Table(rows, colWidths=[7 * cm, 7 * cm, 2 * cm])
        tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
            ("TEXTCOLOR",  (0, 0), (-1, 0), colors.white),
            ("BACKGROUND", (0, 1), (-1, -1), WEAK_BG),
            ("GRID",       (0, 0), (-1, -1), 0.4, colors.grey),
            ("PADDING",    (0, 0), (-1, -1), 5),
            ("VALIGN",     (0, 0), (-1, -1), "TOP"),
        ]))
        story.append(tbl)
        story.append(Spacer(1, 0.3 * cm))

    # ── Gaps ──
    if explanation.gaps:
        story.append(Paragraph("Unaddressed Requirements (Gaps)", ParagraphStyle(
            "gh", parent=styles["Normal"], textColor=DANGER, fontSize=10, fontName="Helvetica-Bold",
        )))
        story.append(Spacer(1, 0.15 * cm))
        gap_rows = [[Paragraph("<b>Job Requirement Not Found in CV</b>", small)]] + [
            [Paragraph(g[:200], small)] for g in explanation.gaps
        ]
        tbl = Table(gap_rows, colWidths=[16 * cm])
        tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), DANGER),
            ("TEXTCOLOR",  (0, 0), (-1, 0), colors.white),
            ("BACKGROUND", (0, 1), (-1, -1), GAP_BG),
            ("GRID",       (0, 0), (-1, -1), 0.4, colors.grey),
            ("PADDING",    (0, 0), (-1, -1), 5),
            ("VALIGN",     (0, 0), (-1, -1), "TOP"),
        ]))
        story.append(tbl)
        story.append(Spacer(1, 0.3 * cm))

    return story


def generate_pdf(
    application_id: str,
    candidate_name: str,
    job_title: str,
    cv_score: float,
    exam_score: float,
    final_score: float,
    hard_filter_passed: bool,
    explanation: SemanticExplanation,
    justification: Justification,
    recruiter_notes: Optional[str] = None,
) -> Path:
    out_path = STORAGE_DIR / f"{application_id}_feedback.pdf"

    doc = SimpleDocTemplate(
        str(out_path),
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )
    styles = getSampleStyleSheet()
    h1   = ParagraphStyle("h1",   parent=styles["Heading1"], textColor=PRIMARY, fontSize=16)
    h2   = ParagraphStyle("h2",   parent=styles["Heading2"], textColor=ACCENT,  fontSize=12)
    body = styles["BodyText"]
    body.leading = 16

    story = []

    # ── Header ──
    story.append(Paragraph("Recruitment Feedback Report", h1))
    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph(f"<b>Candidate:</b> {candidate_name}", body))
    story.append(Paragraph(f"<b>Position:</b> {job_title}", body))
    story.append(Spacer(1, 0.5 * cm))

    # ── Score Summary ──
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
        ("TEXTCOLOR",  (0, 0), (-1, 0), colors.white),
        ("FONTNAME",   (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
        ("GRID",       (0, 0), (-1, -1), 0.5, colors.grey),
        ("FONTSIZE",   (0, 0), (-1, -1), 10),
        ("PADDING",    (0, 0), (-1, -1), 6),
    ]))
    story.append(tbl)
    story.append(Spacer(1, 0.6 * cm))

    # ── Semantic Alignment Table ──
    story.extend(_build_alignment_table(explanation, styles))

    # ── AI Assessment Justification ──
    story.append(Paragraph("AI Assessment Justification", h2))
    for para_text in justification.full_text.split("\n\n"):
        story.append(Paragraph(para_text.strip(), body))
        story.append(Spacer(1, 0.2 * cm))

    # ── Recruiter Notes ──
    if recruiter_notes and recruiter_notes.strip():
        story.append(Spacer(1, 0.3 * cm))
        story.append(Paragraph("Recruiter Notes", h2))
        story.append(Paragraph(recruiter_notes.strip(), body))

    doc.build(story)
    logger.info("PDF generated: %s", out_path)
    return out_path
