const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "EAA-Recruit Team";
pres.title = "EAA-Recruit: AI-Powered Recruitment Platform";

// ─── Color Palette ───
const C = {
  primary:    "1A237E",
  secondary:  "1565C0",
  accent:     "0D47A1",
  dark:       "1A1A2E",
  white:      "FFFFFF",
  lightBg:    "F5F7FA",
  lightBlue:  "E3F2FD",
  tableHead:  "1565C0",
  tableAlt:   "EBF5FB",
  grey:       "64748B",
  green:      "2E7D32",
  red:        "C62828",
  orange:     "E65100",
  codeBg:     "1E293B",
  codeText:   "E8EAF6",
};

// ─── Helper: factory functions (never reuse objects) ───
const makeShadow = () => ({ type: "outer", color: "000000", blur: 4, offset: 2, angle: 135, opacity: 0.12 });
const makeCardShadow = () => ({ type: "outer", color: "000000", blur: 6, offset: 3, angle: 135, opacity: 0.15 });

// ─── Slide Master: background bar + page number ───
function addSlideBase(slide, title, opts = {}) {
  // Top accent bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.06,
    fill: { color: C.secondary }
  });
  // Bottom bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 5.35, w: 10, h: 0.275,
    fill: { color: C.primary }
  });
  // Page number (bottom right)
  if (opts.pageNum) {
    slide.addText(String(opts.pageNum), {
      x: 9.2, y: 5.35, w: 0.6, h: 0.275,
      fontSize: 10, color: C.white, align: "center", valign: "middle",
      fontFace: "Segoe UI"
    });
  }
  // Bottom left text
  slide.addText("EAA-Recruit", {
    x: 0.3, y: 5.35, w: 2, h: 0.275,
    fontSize: 9, color: C.white, align: "left", valign: "middle",
    fontFace: "Segoe UI", italic: true
  });
  // Title
  if (title && !opts.noTitle) {
    slide.addText(title, {
      x: 0.5, y: 0.2, w: 9, h: 0.6,
      fontSize: 28, color: C.primary, bold: true, fontFace: "Segoe UI",
      margin: 0
    });
    // Title underline
    slide.addShape(pres.shapes.LINE, {
      x: 0.5, y: 0.85, w: 3, h: 0,
      line: { color: C.secondary, width: 2.5 }
    });
  }
  return slide;
}

// ─── Helper: bullet list ───
function bulletItems(items, opts = {}) {
  return items.map((item, i) => ({
    text: item,
    options: {
      bullet: true,
      breakLine: i < items.length - 1,
      fontSize: opts.fontSize || 16,
      color: opts.color || C.dark,
      fontFace: "Segoe UI",
      ...(opts.indentLevel !== undefined ? { indentLevel: opts.indentLevel } : {})
    }
  }));
}

// ═════════════════════════════════════════════════════════
// SLIDE 1: Title
// ═════════════════════════════════════════════════════════
let s1 = pres.addSlide();
s1.background = { color: C.primary };
// Decorative accent
s1.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 0.12,
  fill: { color: C.secondary }
});
s1.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 5.45, w: 10, h: 0.175,
  fill: { color: C.secondary }
});
// Title
s1.addText("EAA-Recruit", {
  x: 0.5, y: 1.2, w: 9, h: 1.0,
  fontSize: 48, color: C.white, bold: true, fontFace: "Segoe UI",
  align: "center"
});
s1.addText("AI-Powered Recruitment Platform", {
  x: 0.5, y: 2.1, w: 9, h: 0.6,
  fontSize: 24, color: "90CAF9", fontFace: "Segoe UI",
  align: "center"
});
// Separator line
s1.addShape(pres.shapes.LINE, {
  x: 3.5, y: 2.9, w: 3, h: 0,
  line: { color: C.secondary, width: 2 }
});
s1.addText("Final Year Project Defense", {
  x: 0.5, y: 3.1, w: 9, h: 0.5,
  fontSize: 18, color: C.white, bold: true, fontFace: "Segoe UI",
  align: "center"
});
s1.addText([
  { text: "Intelligent CV Screening", options: { color: "90CAF9", fontSize: 14, fontFace: "Segoe UI" } },
  { text: "  ·  ", options: { color: C.secondary, fontSize: 14 } },
  { text: "Adaptive Exam Engine", options: { color: "90CAF9", fontSize: 14, fontFace: "Segoe UI" } },
  { text: "  ·  ", options: { color: C.secondary, fontSize: 14 } },
  { text: "Explainable AI Reports", options: { color: "90CAF9", fontSize: 14, fontFace: "Segoe UI" } },
], {
  x: 0.5, y: 3.7, w: 9, h: 0.5, align: "center"
});

// ═════════════════════════════════════════════════════════
// SLIDE 2: Problem Statement
// ═════════════════════════════════════════════════════════
let s2 = pres.addSlide();
addSlideBase(s2, "Problem Statement", { pageNum: 2 });

// Quote box
s2.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 1.0, w: 9, h: 0.7,
  fill: { color: C.lightBlue }
});
s2.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 1.0, w: 0.06, h: 0.7,
  fill: { color: C.secondary }
});
s2.addText("Traditional recruitment is slow, biased, and opaque — recruiters spend 80% of their time on manual CV screening with no accountability trail.", {
  x: 0.7, y: 1.0, w: 8.6, h: 0.7,
  fontSize: 13, color: C.accent, italic: true, fontFace: "Segoe UI",
  valign: "middle"
});

// What's broken
s2.addText("What's Broken Today", {
  x: 0.5, y: 1.85, w: 4, h: 0.4,
  fontSize: 18, color: C.primary, bold: true, fontFace: "Segoe UI", margin: 0
});
s2.addText(bulletItems([
  "Manual CV review: ~6 min/resume, 250+ applicants/role",
  "No standardized skill assessment tied to role",
  "AI tools are black boxes — no rejection explanations",
  "Interview scheduling chaos via email threads"
], { fontSize: 14 }), {
  x: 0.5, y: 2.25, w: 9, h: 1.4
});

// What we built
s2.addText("What We Built", {
  x: 0.5, y: 3.65, w: 4, h: 0.4,
  fontSize: 18, color: C.green, bold: true, fontFace: "Segoe UI", margin: 0
});
s2.addText("An end-to-end platform that automates screening, examines candidates fairly, and explains every decision with LIME-backed evidence.", {
  x: 0.5, y: 4.05, w: 9, h: 0.6,
  fontSize: 14, color: C.dark, fontFace: "Segoe UI"
});

// ═════════════════════════════════════════════════════════
// SLIDE 3: System Architecture
// ═════════════════════════════════════════════════════════
let s3 = pres.addSlide();
addSlideBase(s3, "System Architecture", { pageNum: 3 });

// Frontend box
s3.addShape(pres.shapes.RECTANGLE, {
  x: 1.5, y: 1.1, w: 7, h: 0.7,
  fill: { color: "E8EAF6" }, shadow: makeShadow()
});
s3.addText("Next.js 14 — Recruiter Dashboard · Candidate Portal", {
  x: 1.5, y: 1.1, w: 7, h: 0.7,
  fontSize: 14, color: C.primary, bold: true, fontFace: "Segoe UI",
  align: "center", valign: "middle"
});

// Arrow label
s3.addText("▼  HTTPS + JWT (HS512)", {
  x: 3, y: 1.8, w: 4, h: 0.3,
  fontSize: 11, color: C.grey, fontFace: "Segoe UI", align: "center"
});

// Spring Boot box
s3.addShape(pres.shapes.RECTANGLE, {
  x: 1.5, y: 2.15, w: 7, h: 0.8,
  fill: { color: C.secondary }, shadow: makeShadow()
});
s3.addText([
  { text: "Spring Boot 3.x (Core API)\n", options: { bold: true, fontSize: 15, color: C.white, fontFace: "Segoe UI", breakLine: true } },
  { text: "Auth · Jobs · Applications · Interviews · Decisions", options: { fontSize: 12, color: "BBDEFB", fontFace: "Segoe UI" } }
], {
  x: 1.5, y: 2.15, w: 7, h: 0.8, align: "center", valign: "middle"
});

// Arrow labels
s3.addText("▼ REST + API Key", {
  x: 0.5, y: 3.0, w: 3, h: 0.25,
  fontSize: 10, color: C.grey, fontFace: "Segoe UI", align: "center"
});
s3.addText("▼ REST + API Key", {
  x: 3.5, y: 3.0, w: 3, h: 0.25,
  fontSize: 10, color: C.grey, fontFace: "Segoe UI", align: "center"
});
s3.addText("▼ JDBC", {
  x: 6.5, y: 3.0, w: 3, h: 0.25,
  fontSize: 10, color: C.grey, fontFace: "Segoe UI", align: "center"
});

// Three service boxes
// AI Service
s3.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 3.35, w: 2.8, h: 1.0,
  fill: { color: "FFF3E0" }, shadow: makeShadow()
});
s3.addText([
  { text: "AI Service\n", options: { bold: true, fontSize: 13, color: C.orange, fontFace: "Segoe UI", breakLine: true } },
  { text: "FastAPI / Python\nSBERT + Ollama", options: { fontSize: 11, color: C.dark, fontFace: "Segoe UI" } }
], {
  x: 0.5, y: 3.35, w: 2.8, h: 1.0, align: "center", valign: "middle"
});

// Exam Engine
s3.addShape(pres.shapes.RECTANGLE, {
  x: 3.6, y: 3.35, w: 2.8, h: 1.0,
  fill: { color: "E8F5E9" }, shadow: makeShadow()
});
s3.addText([
  { text: "Exam Engine\n", options: { bold: true, fontSize: 13, color: C.green, fontFace: "Segoe UI", breakLine: true } },
  { text: "Go + Gin\nRedis Sessions", options: { fontSize: 11, color: C.dark, fontFace: "Segoe UI" } }
], {
  x: 3.6, y: 3.35, w: 2.8, h: 1.0, align: "center", valign: "middle"
});

// PostgreSQL
s3.addShape(pres.shapes.RECTANGLE, {
  x: 6.7, y: 3.35, w: 2.8, h: 1.0,
  fill: { color: "E3F2FD" }, shadow: makeShadow()
});
s3.addText([
  { text: "PostgreSQL 16\n", options: { bold: true, fontSize: 13, color: C.secondary, fontFace: "Segoe UI", breakLine: true } },
  { text: "Flyway Migrations\nACID Transactions", options: { fontSize: 11, color: C.dark, fontFace: "Segoe UI" } }
], {
  x: 6.7, y: 3.35, w: 2.8, h: 1.0, align: "center", valign: "middle"
});

// Footer note
s3.addText("5 services  ·  Docker Compose  ·  HTTP/1.1 enforced inter-service", {
  x: 0.5, y: 4.7, w: 9, h: 0.3,
  fontSize: 13, color: C.grey, fontFace: "Segoe UI", align: "center", bold: true
});

// ═════════════════════════════════════════════════════════
// SLIDE 4: Technology Stack
// ═════════════════════════════════════════════════════════
let s4 = pres.addSlide();
addSlideBase(s4, "Technology Stack", { pageNum: 4 });

const techRows = [
  [
    { text: "Layer", options: { bold: true, color: C.white, fill: { color: C.tableHead }, fontSize: 13, fontFace: "Segoe UI" } },
    { text: "Technology", options: { bold: true, color: C.white, fill: { color: C.tableHead }, fontSize: 13, fontFace: "Segoe UI" } },
    { text: "Reason", options: { bold: true, color: C.white, fill: { color: C.tableHead }, fontSize: 13, fontFace: "Segoe UI" } }
  ],
  [
    { text: "Frontend", options: { fontSize: 12, fontFace: "Segoe UI", bold: true } },
    { text: "Next.js 14, TypeScript, Tailwind", options: { fontSize: 12, fontFace: "Segoe UI" } },
    { text: "SSR, type safety", options: { fontSize: 12, fontFace: "Segoe UI" } }
  ],
  [
    { text: "Backend", options: { fontSize: 12, fontFace: "Segoe UI", bold: true, fill: { color: C.tableAlt } } },
    { text: "Spring Boot 3, Java 21", options: { fontSize: 12, fontFace: "Segoe UI", fill: { color: C.tableAlt } } },
    { text: "Mature ecosystem, transactions", options: { fontSize: 12, fontFace: "Segoe UI", fill: { color: C.tableAlt } } }
  ],
  [
    { text: "AI Service", options: { fontSize: 12, fontFace: "Segoe UI", bold: true } },
    { text: "FastAPI, Python 3.11", options: { fontSize: 12, fontFace: "Segoe UI" } },
    { text: "ML library ecosystem", options: { fontSize: 12, fontFace: "Segoe UI" } }
  ],
  [
    { text: "Exam Engine", options: { fontSize: 12, fontFace: "Segoe UI", bold: true, fill: { color: C.tableAlt } } },
    { text: "Go 1.22, Gin", options: { fontSize: 12, fontFace: "Segoe UI", fill: { color: C.tableAlt } } },
    { text: "Goroutine concurrency", options: { fontSize: 12, fontFace: "Segoe UI", fill: { color: C.tableAlt } } }
  ],
  [
    { text: "Embeddings", options: { fontSize: 12, fontFace: "Segoe UI", bold: true } },
    { text: "SBERT all-MiniLM-L6-v2", options: { fontSize: 12, fontFace: "Segoe UI" } },
    { text: "Fast, lightweight semantic model", options: { fontSize: 12, fontFace: "Segoe UI" } }
  ],
  [
    { text: "LLM Grading", options: { fontSize: 12, fontFace: "Segoe UI", bold: true, fill: { color: C.tableAlt } } },
    { text: "Ollama llama3.2", options: { fontSize: 12, fontFace: "Segoe UI", fill: { color: C.tableAlt } } },
    { text: "Local, no API cost", options: { fontSize: 12, fontFace: "Segoe UI", fill: { color: C.tableAlt } } }
  ],
  [
    { text: "XAI", options: { fontSize: 12, fontFace: "Segoe UI", bold: true } },
    { text: "LIME library", options: { fontSize: 12, fontFace: "Segoe UI" } },
    { text: "Model-agnostic attribution", options: { fontSize: 12, fontFace: "Segoe UI" } }
  ],
  [
    { text: "Database", options: { fontSize: 12, fontFace: "Segoe UI", bold: true, fill: { color: C.tableAlt } } },
    { text: "PostgreSQL 16, Flyway", options: { fontSize: 12, fontFace: "Segoe UI", fill: { color: C.tableAlt } } },
    { text: "ACID, versioned migrations", options: { fontSize: 12, fontFace: "Segoe UI", fill: { color: C.tableAlt } } }
  ],
  [
    { text: "Auth", options: { fontSize: 12, fontFace: "Segoe UI", bold: true } },
    { text: "JWT HS512, RBAC", options: { fontSize: 12, fontFace: "Segoe UI" } },
    { text: "4 roles: ADMIN/RECRUITER/CANDIDATE/INTERVIEWER", options: { fontSize: 11, fontFace: "Segoe UI" } }
  ],
];

s4.addTable(techRows, {
  x: 0.4, y: 1.05, w: 9.2,
  colW: [1.6, 3.2, 4.4],
  border: { pt: 0.5, color: "CBD5E1" },
  rowH: [0.38, 0.38, 0.38, 0.38, 0.38, 0.38, 0.38, 0.38, 0.38, 0.38],
});

// ═════════════════════════════════════════════════════════
// SLIDE 5: CV Scoring
// ═════════════════════════════════════════════════════════
let s5 = pres.addSlide();
addSlideBase(s5, "Module 1 — CV Scoring (AI Service)", { pageNum: 5 });

// Pipeline flow boxes
const pipeSteps = [
  { label: "CV Text\n(PDF extracted)", color: "E8EAF6", textColor: C.primary },
  { label: "SBERT Encoder\n384-dim vector", color: "E3F2FD", textColor: C.secondary },
  { label: "Cosine\nSimilarity", color: "E8F5E9", textColor: C.green },
  { label: "Hard Filter\n(threshold)", color: "FFF3E0", textColor: C.orange },
  { label: "PASS / FAIL\nstored", color: "FFEBEE", textColor: C.red },
];

const stepW = 1.6;
const stepGap = 0.25;
const startX = 0.5;

pipeSteps.forEach((step, i) => {
  const x = startX + i * (stepW + stepGap);
  s5.addShape(pres.shapes.RECTANGLE, {
    x, y: 1.2, w: stepW, h: 0.9,
    fill: { color: step.color }, shadow: makeShadow()
  });
  s5.addText(step.label, {
    x, y: 1.2, w: stepW, h: 0.9,
    fontSize: 11, color: step.textColor, bold: true, fontFace: "Segoe UI",
    align: "center", valign: "middle"
  });
  // Arrow between boxes
  if (i < pipeSteps.length - 1) {
    s5.addText("→", {
      x: x + stepW, y: 1.2, w: stepGap, h: 0.9,
      fontSize: 18, color: C.grey, align: "center", valign: "middle"
    });
  }
});

// Job Description parallel input
s5.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 2.35, w: 1.6, h: 0.5,
  fill: { color: "F3E5F5" }, shadow: makeShadow()
});
s5.addText("Job Description", {
  x: 0.5, y: 2.35, w: 1.6, h: 0.5,
  fontSize: 11, color: "7B1FA2", bold: true, fontFace: "Segoe UI",
  align: "center", valign: "middle"
});
s5.addText("↗ also encoded via SBERT → compared", {
  x: 2.2, y: 2.35, w: 4, h: 0.5,
  fontSize: 11, color: C.grey, fontFace: "Segoe UI", italic: true, valign: "middle"
});

// Key details
s5.addText("Key Details", {
  x: 0.5, y: 3.1, w: 4, h: 0.35,
  fontSize: 16, color: C.primary, bold: true, fontFace: "Segoe UI", margin: 0
});
s5.addText(bulletItems([
  "Model: sentence-transformers/all-MiniLM-L6-v2 (22M params, ~80ms/call)",
  "Hard filter: configurable per-job threshold; fail = no exam invitation",
  "Score stored: cv_relevance_score on applications table (0–1)",
  "Semantic similarity, not keyword matching"
], { fontSize: 13 }), {
  x: 0.5, y: 3.45, w: 9, h: 1.5
});

// ═════════════════════════════════════════════════════════
// SLIDE 6: Exam Engine
// ═════════════════════════════════════════════════════════
let s6 = pres.addSlide();
addSlideBase(s6, "Module 2 — Exam Engine (Go)", { pageNum: 6 });

// State machine flow - vertical
const states = [
  { label: "BATCH_READY", desc: "Spring calls /internal/exams/batch-ready", bg: "E8EAF6" },
  { label: "PENDING", desc: "Candidate hits 'Start Exam'", bg: "FFF3E0" },
  { label: "IN_PROGRESS", desc: "Timed questions from Redis", bg: "E3F2FD" },
  { label: "SUBMITTED", desc: "Grading begins", bg: "E8F5E9" },
  { label: "COMPLETED", desc: "Spring callback → DB updated", bg: "F3E5F5" },
];

states.forEach((state, i) => {
  const y = 1.15 + i * 0.72;
  // State box
  s6.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y, w: 1.8, h: 0.5,
    fill: { color: state.bg }, shadow: makeShadow()
  });
  s6.addText(state.label, {
    x: 0.6, y, w: 1.8, h: 0.5,
    fontSize: 12, color: C.primary, bold: true, fontFace: "Consolas",
    align: "center", valign: "middle"
  });
  // Description
  s6.addText(state.desc, {
    x: 2.5, y, w: 3.5, h: 0.5,
    fontSize: 11, color: C.grey, fontFace: "Segoe UI", valign: "middle"
  });
  // Arrow
  if (i < states.length - 1) {
    s6.addText("▼", {
      x: 0.6, y: y + 0.48, w: 1.8, h: 0.25,
      fontSize: 12, color: C.secondary, align: "center"
    });
  }
});

// Right side: grading split
s6.addShape(pres.shapes.RECTANGLE, {
  x: 6.2, y: 1.15, w: 3.4, h: 2.2,
  fill: { color: C.lightBg }, shadow: makeCardShadow()
});
s6.addText("Grading", {
  x: 6.2, y: 1.15, w: 3.4, h: 0.4,
  fontSize: 15, color: C.primary, bold: true, fontFace: "Segoe UI",
  align: "center"
});
s6.addText(bulletItems([
  "MCQ: instant scoring (no AI call)",
  "SHORT_ANSWER: async goroutine pool → ai-service /grade-answer",
  "WaitGroup synchronizes all results"
], { fontSize: 12 }), {
  x: 6.4, y: 1.6, w: 3.0, h: 1.6
});

// Redis note
s6.addShape(pres.shapes.RECTANGLE, {
  x: 6.2, y: 3.55, w: 3.4, h: 0.9,
  fill: { color: "FFEBEE" }, shadow: makeShadow()
});
s6.addText([
  { text: "Redis stores:\n", options: { bold: true, fontSize: 12, color: C.red, fontFace: "Segoe UI", breakLine: true } },
  { text: "Session state, question schedule,\nauthorized candidates", options: { fontSize: 11, color: C.dark, fontFace: "Segoe UI" } }
], {
  x: 6.2, y: 3.55, w: 3.4, h: 0.9, align: "center", valign: "middle"
});

// ═════════════════════════════════════════════════════════
// SLIDE 7: Race Condition Fix
// ═════════════════════════════════════════════════════════
let s7 = pres.addSlide();
addSlideBase(s7, "Short-Answer Grading — Race Condition Fix", { pageNum: 7 });

// BEFORE box
s7.addShape(pres.shapes.RECTANGLE, {
  x: 0.4, y: 1.1, w: 4.4, h: 2.2,
  fill: { color: "FFEBEE" }, shadow: makeCardShadow()
});
s7.addShape(pres.shapes.RECTANGLE, {
  x: 0.4, y: 1.1, w: 4.4, h: 0.4,
  fill: { color: C.red }
});
s7.addText("BEFORE (Broken)", {
  x: 0.4, y: 1.1, w: 4.4, h: 0.4,
  fontSize: 14, color: C.white, bold: true, fontFace: "Segoe UI",
  align: "center", valign: "middle"
});
s7.addText([
  { text: "goroutine 1:", options: { bold: true, fontSize: 11, color: C.dark, fontFace: "Consolas", breakLine: true } },
  { text: "  read → add 17.5 → publish ✓", options: { fontSize: 11, color: C.dark, fontFace: "Consolas", breakLine: true } },
  { text: "", options: { fontSize: 6, breakLine: true } },
  { text: "goroutine 2:", options: { bold: true, fontSize: 11, color: C.dark, fontFace: "Consolas", breakLine: true } },
  { text: "  read → add 7.6 → publish ✗", options: { fontSize: 11, color: C.dark, fontFace: "Consolas", breakLine: true } },
  { text: "", options: { fontSize: 6, breakLine: true } },
  { text: "Final score: 17.5 ← WRONG", options: { fontSize: 12, color: C.red, bold: true, fontFace: "Consolas" } },
], {
  x: 0.6, y: 1.6, w: 4.0, h: 1.6
});

// AFTER box
s7.addShape(pres.shapes.RECTANGLE, {
  x: 5.2, y: 1.1, w: 4.4, h: 2.2,
  fill: { color: "E8F5E9" }, shadow: makeCardShadow()
});
s7.addShape(pres.shapes.RECTANGLE, {
  x: 5.2, y: 1.1, w: 4.4, h: 0.4,
  fill: { color: C.green }
});
s7.addText("AFTER (Fixed)", {
  x: 5.2, y: 1.1, w: 4.4, h: 0.4,
  fontSize: 14, color: C.white, bold: true, fontFace: "Segoe UI",
  align: "center", valign: "middle"
});
s7.addText([
  { text: "WaitGroup collects ALL results", options: { bold: true, fontSize: 11, color: C.dark, fontFace: "Consolas", breakLine: true } },
  { text: "  ↳ Mutex-protected map", options: { fontSize: 11, color: C.dark, fontFace: "Consolas", breakLine: true } },
  { text: "", options: { fontSize: 6, breakLine: true } },
  { text: "Single atomic update", options: { bold: true, fontSize: 11, color: C.dark, fontFace: "Consolas", breakLine: true } },
  { text: "Single callback to Spring", options: { bold: true, fontSize: 11, color: C.dark, fontFace: "Consolas", breakLine: true } },
  { text: "", options: { fontSize: 6, breakLine: true } },
  { text: "Final score: 25.1 ← CORRECT", options: { fontSize: 12, color: C.green, bold: true, fontFace: "Consolas" } },
], {
  x: 5.4, y: 1.6, w: 4.0, h: 1.6
});

// Key insight
s7.addShape(pres.shapes.RECTANGLE, {
  x: 0.4, y: 3.6, w: 9.2, h: 0.7,
  fill: { color: C.lightBlue }
});
s7.addShape(pres.shapes.RECTANGLE, {
  x: 0.4, y: 3.6, w: 0.06, h: 0.7,
  fill: { color: C.secondary }
});
s7.addText("Key: Collect-then-publish pattern — all goroutines finish before any side-effect fires. sync.WaitGroup + sync.Mutex = deterministic result.", {
  x: 0.6, y: 3.6, w: 8.8, h: 0.7,
  fontSize: 13, color: C.accent, fontFace: "Segoe UI", valign: "middle", italic: true
});

// Code snippet
s7.addShape(pres.shapes.RECTANGLE, {
  x: 0.4, y: 4.45, w: 9.2, h: 0.7,
  fill: { color: C.codeBg }
});
s7.addText("g.finalizeSession(session, results)  // single atomic update\ng.springClient.PublishExamCompleted(session)  // called exactly once", {
  x: 0.6, y: 4.45, w: 8.8, h: 0.7,
  fontSize: 11, color: C.codeText, fontFace: "Consolas", valign: "middle"
});

// ═════════════════════════════════════════════════════════
// SLIDE 8: XAI Report
// ═════════════════════════════════════════════════════════
let s8 = pres.addSlide();
addSlideBase(s8, "Module 4 — XAI Report (Explainable AI)", { pageNum: 8 });

// EU AI Act callout
s8.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 1.05, w: 9, h: 0.5,
  fill: { color: "FFF3E0" }
});
s8.addText("EU AI Act (2024) mandates automated hiring decisions be explainable to candidates.", {
  x: 0.7, y: 1.05, w: 8.6, h: 0.5,
  fontSize: 13, color: C.orange, bold: true, fontFace: "Segoe UI", valign: "middle"
});

// LIME process
s8.addText("How LIME Works Here", {
  x: 0.5, y: 1.7, w: 4, h: 0.35,
  fontSize: 16, color: C.primary, bold: true, fontFace: "Segoe UI", margin: 0
});

const limeSteps = [
  "Mask random words in CV (300 samples)",
  "Score each variant with SBERT",
  "Fit linear model on perturbations",
  "Extract top feature weights"
];
s8.addText(bulletItems(limeSteps, { fontSize: 13 }), {
  x: 0.5, y: 2.05, w: 4.5, h: 1.3
});

// Example output
s8.addShape(pres.shapes.RECTANGLE, {
  x: 5.3, y: 1.7, w: 4.2, h: 1.65,
  fill: { color: C.codeBg }
});
s8.addText('{ "python": +0.42,\n  "leadership": +0.31,\n  "java": +0.18,\n  "teamwork": +0.12 }', {
  x: 5.5, y: 1.75, w: 3.8, h: 1.5,
  fontSize: 13, color: C.codeText, fontFace: "Consolas", valign: "middle"
});

// Report output sections
s8.addText("Report Output (PDF)", {
  x: 0.5, y: 3.55, w: 4, h: 0.35,
  fontSize: 16, color: C.primary, bold: true, fontFace: "Segoe UI", margin: 0
});

const reportParts = [
  ["Score Breakdown", "CV score, exam score, final score"],
  ["Attribution Chart", "Top 10 CV keywords by LIME impact"],
  ["LLM Justification", "Ollama generates 3-paragraph explanation"],
  ["Hard Filter Status", "Pass/fail with threshold context"],
];

reportParts.forEach((part, i) => {
  const y = 4.0 + i * 0.33;
  s8.addText(`${i + 1}. `, {
    x: 0.5, y, w: 0.35, h: 0.3,
    fontSize: 13, color: C.secondary, bold: true, fontFace: "Segoe UI"
  });
  s8.addText(part[0], {
    x: 0.85, y, w: 2.2, h: 0.3,
    fontSize: 13, color: C.primary, bold: true, fontFace: "Segoe UI"
  });
  s8.addText("— " + part[1], {
    x: 3.0, y, w: 6.5, h: 0.3,
    fontSize: 12, color: C.grey, fontFace: "Segoe UI"
  });
});

// ═════════════════════════════════════════════════════════
// SLIDE 9: XAI Delivery Pipeline
// ═════════════════════════════════════════════════════════
let s9 = pres.addSlide();
addSlideBase(s9, "XAI Delivery Pipeline", { pageNum: 9 });

const pipelineSteps = [
  { label: "Recruiter records\ndecision", color: "E8EAF6", tc: C.primary },
  { label: "@Async\nnon-blocking", color: "FFF3E0", tc: C.orange },
  { label: "AI Service\nLIME → PDF", color: "E8F5E9", tc: C.green },
  { label: "Native SQL\nUPDATE", color: "E3F2FD", tc: C.secondary },
  { label: "PDF streamed\nto browser", color: "F3E5F5", tc: "7B1FA2" },
];

pipelineSteps.forEach((step, i) => {
  const x = 0.3 + i * 1.95;
  s9.addShape(pres.shapes.RECTANGLE, {
    x, y: 1.2, w: 1.7, h: 0.9,
    fill: { color: step.color }, shadow: makeShadow()
  });
  s9.addText(step.label, {
    x, y: 1.2, w: 1.7, h: 0.9,
    fontSize: 11, color: step.tc, bold: true, fontFace: "Segoe UI",
    align: "center", valign: "middle"
  });
  if (i < pipelineSteps.length - 1) {
    s9.addText("→", {
      x: x + 1.7, y: 1.2, w: 0.25, h: 0.9,
      fontSize: 16, color: C.grey, align: "center", valign: "middle"
    });
  }
});

// Key points
s9.addText("Key Design Decisions", {
  x: 0.5, y: 2.4, w: 4, h: 0.35,
  fontSize: 16, color: C.primary, bold: true, fontFace: "Segoe UI", margin: 0
});
s9.addText(bulletItems([
  "Recruiter's decision response is instant — XAI takes 5–15s in background",
  "Native @Modifying @Query bypasses JPA optimistic lock (stale entity version)",
  "ByteArrayResource proxy — Spring proxies PDF bytes (not redirect)",
  "RestClient download replaces UrlResource (which returned 57 bytes)",
], { fontSize: 13 }), {
  x: 0.5, y: 2.8, w: 9, h: 2.0
});

// ═════════════════════════════════════════════════════════
// SLIDE 10: Security
// ═════════════════════════════════════════════════════════
let s10 = pres.addSlide();
addSlideBase(s10, "Security Architecture", { pageNum: 10 });

// Left column: User-facing auth
s10.addShape(pres.shapes.RECTANGLE, {
  x: 0.4, y: 1.1, w: 4.3, h: 2.5,
  fill: { color: C.lightBg }, shadow: makeCardShadow()
});
s10.addText("User-Facing Auth", {
  x: 0.4, y: 1.1, w: 4.3, h: 0.4,
  fontSize: 15, color: C.primary, bold: true, fontFace: "Segoe UI",
  align: "center", valign: "middle"
});
s10.addText(bulletItems([
  "JWT HS512 signed by Spring",
  "Verified by exam-engine (dual HS256/HS512)",
  "4 roles: SUPER_ADMIN, RECRUITER, CANDIDATE, INTERVIEWER",
  "Role-scoped annotations: @IsRecruiter, @IsCandidate"
], { fontSize: 12 }), {
  x: 0.6, y: 1.55, w: 3.9, h: 1.8
});

// Right column: Service-to-service
s10.addShape(pres.shapes.RECTANGLE, {
  x: 5.3, y: 1.1, w: 4.3, h: 2.5,
  fill: { color: C.lightBg }, shadow: makeCardShadow()
});
s10.addText("Service-to-Service Auth", {
  x: 5.3, y: 1.1, w: 4.3, h: 0.4,
  fontSize: 15, color: C.primary, bold: true, fontFace: "Segoe UI",
  align: "center", valign: "middle"
});
s10.addText([
  { text: "Spring → ai-service:\n", options: { fontSize: 12, color: C.dark, fontFace: "Consolas", breakLine: true } },
  { text: "  X-Internal-Api-Key header\n", options: { fontSize: 11, color: C.grey, fontFace: "Consolas", breakLine: true } },
  { text: "Spring → exam-engine:\n", options: { fontSize: 12, color: C.dark, fontFace: "Consolas", breakLine: true } },
  { text: "  X-Internal-Api-Key header\n", options: { fontSize: 11, color: C.grey, fontFace: "Consolas", breakLine: true } },
  { text: "exam-engine → ai-service:\n", options: { fontSize: 12, color: C.dark, fontFace: "Consolas", breakLine: true } },
  { text: "  X-Internal-Api-Key header", options: { fontSize: 11, color: C.grey, fontFace: "Consolas" } },
], {
  x: 5.5, y: 1.55, w: 3.9, h: 1.8
});

// Data isolation
s10.addShape(pres.shapes.RECTANGLE, {
  x: 0.4, y: 3.85, w: 9.2, h: 1.2,
  fill: { color: C.lightBlue }, shadow: makeShadow()
});
s10.addText("Data Isolation", {
  x: 0.4, y: 3.85, w: 9.2, h: 0.35,
  fontSize: 15, color: C.primary, bold: true, fontFace: "Segoe UI",
  align: "center"
});
s10.addText(bulletItems([
  "Recruiter sees only their own jobs' applications",
  "Candidate accesses only their own applications/exams",
  "XAI report: both recruiter (owns job) and candidate (owns application) can access"
], { fontSize: 12 }), {
  x: 0.6, y: 4.2, w: 8.8, h: 0.8
});

// ═════════════════════════════════════════════════════════
// SLIDE 11: Database Design
// ═════════════════════════════════════════════════════════
let s11 = pres.addSlide();
addSlideBase(s11, "Database Design Highlights", { pageNum: 11 });

// Schema diagram (text-based)
s11.addShape(pres.shapes.RECTANGLE, {
  x: 0.4, y: 1.1, w: 5.5, h: 2.5,
  fill: { color: C.codeBg }
});
s11.addText(
`users ──< jobs ──< applications ──< exam_sessions
                      │
                      ├── cv_relevance_score  (FLOAT)
                      ├── exam_score          (FLOAT, 0-100)
                      ├── final_score         (FLOAT, 0-100)
                      ├── hard_filter_passed  (BOOLEAN)
                      ├── xai_report_url      (TEXT)
                      └── decision_notes      (TEXT)

questions (per job)
  ├── type: MCQ | SHORT_ANSWER
  ├── correct_answer
  └── ideal_answer (added V12)`, {
  x: 0.6, y: 1.2, w: 5.1, h: 2.3,
  fontSize: 10.5, color: C.codeText, fontFace: "Consolas", valign: "top"
});

// Right side notes
s11.addShape(pres.shapes.RECTANGLE, {
  x: 6.2, y: 1.1, w: 3.4, h: 1.1,
  fill: { color: C.lightBg }, shadow: makeShadow()
});
s11.addText([
  { text: "12 Flyway Migrations\n", options: { bold: true, fontSize: 13, color: C.primary, fontFace: "Segoe UI", breakLine: true } },
  { text: "Run at startup, tracked in\nflyway_schema_history", options: { fontSize: 11, color: C.grey, fontFace: "Segoe UI" } }
], {
  x: 6.2, y: 1.1, w: 3.4, h: 1.1, align: "center", valign: "middle"
});

s11.addShape(pres.shapes.RECTANGLE, {
  x: 6.2, y: 2.4, w: 3.4, h: 1.2,
  fill: { color: "FFF3E0" }, shadow: makeShadow()
});
s11.addText([
  { text: "Optimistic Locking\n", options: { bold: true, fontSize: 13, color: C.orange, fontFace: "Segoe UI", breakLine: true } },
  { text: "@Version on applications\nBypassed for async XAI update\nvia native UPDATE query", options: { fontSize: 11, color: C.dark, fontFace: "Segoe UI" } }
], {
  x: 6.2, y: 2.4, w: 3.4, h: 1.2, align: "center", valign: "middle"
});

// ═════════════════════════════════════════════════════════
// SLIDE 12: Technical Challenges
// ═════════════════════════════════════════════════════════
let s12 = pres.addSlide();
addSlideBase(s12, "Key Technical Challenges", { pageNum: 12 });

const challengeRows = [
  [
    { text: "#", options: { bold: true, color: C.white, fill: { color: C.tableHead }, fontSize: 11, fontFace: "Segoe UI", align: "center" } },
    { text: "Challenge", options: { bold: true, color: C.white, fill: { color: C.tableHead }, fontSize: 11, fontFace: "Segoe UI" } },
    { text: "Root Cause", options: { bold: true, color: C.white, fill: { color: C.tableHead }, fontSize: 11, fontFace: "Segoe UI" } },
    { text: "Solution", options: { bold: true, color: C.white, fill: { color: C.tableHead }, fontSize: 11, fontFace: "Segoe UI" } }
  ],
  [
    { text: "1", options: { fontSize: 11, align: "center", fontFace: "Segoe UI" } },
    { text: "JWT rejected by exam-engine", options: { fontSize: 11, fontFace: "Segoe UI" } },
    { text: "Go auth only handled HS256", options: { fontSize: 11, fontFace: "Segoe UI" } },
    { text: "Added HS512 case with sha512.New", options: { fontSize: 11, fontFace: "Segoe UI" } }
  ],
  [
    { text: "2", options: { fontSize: 11, align: "center", fill: { color: C.tableAlt }, fontFace: "Segoe UI" } },
    { text: "HTTP/2 upgrade rejected", options: { fontSize: 11, fill: { color: C.tableAlt }, fontFace: "Segoe UI" } },
    { text: "Spring default client tried h2", options: { fontSize: 11, fill: { color: C.tableAlt }, fontFace: "Segoe UI" } },
    { text: "JdkClientHttpRequestFactory + HTTP_1_1", options: { fontSize: 11, fill: { color: C.tableAlt }, fontFace: "Segoe UI" } }
  ],
  [
    { text: "3", options: { fontSize: 11, align: "center", fontFace: "Segoe UI" } },
    { text: "Grading race condition", options: { fontSize: 11, fontFace: "Segoe UI" } },
    { text: "Two goroutines independently published callback", options: { fontSize: 11, fontFace: "Segoe UI" } },
    { text: "WaitGroup → single atomic update + publish", options: { fontSize: 11, fontFace: "Segoe UI" } }
  ],
  [
    { text: "4", options: { fontSize: 11, align: "center", fill: { color: C.tableAlt }, fontFace: "Segoe UI" } },
    { text: "Optimistic lock on XAI save", options: { fontSize: 11, fill: { color: C.tableAlt }, fontFace: "Segoe UI" } },
    { text: "Async thread had stale entity version", options: { fontSize: 11, fill: { color: C.tableAlt }, fontFace: "Segoe UI" } },
    { text: "Native @Modifying @Query bypasses JPA", options: { fontSize: 11, fill: { color: C.tableAlt }, fontFace: "Segoe UI" } }
  ],
  [
    { text: "5", options: { fontSize: 11, align: "center", fontFace: "Segoe UI" } },
    { text: "PDF returned 57 bytes", options: { fontSize: 11, fontFace: "Segoe UI" } },
    { text: "UrlResource didn't proxy stream", options: { fontSize: 11, fontFace: "Segoe UI" } },
    { text: "RestClient download → ByteArrayResource", options: { fontSize: 11, fontFace: "Segoe UI" } }
  ],
  [
    { text: "6", options: { fontSize: 11, align: "center", fill: { color: C.tableAlt }, fontFace: "Segoe UI" } },
    { text: "LazyInitializationException", options: { fontSize: 11, fill: { color: C.tableAlt }, fontFace: "Segoe UI" } },
    { text: "@Async ran outside Hibernate session", options: { fontSize: 11, fill: { color: C.tableAlt }, fontFace: "Segoe UI" } },
    { text: "Added @Transactional to buildAndStore()", options: { fontSize: 11, fill: { color: C.tableAlt }, fontFace: "Segoe UI" } }
  ],
];

s12.addTable(challengeRows, {
  x: 0.3, y: 1.05, w: 9.4,
  colW: [0.4, 2.0, 3.0, 4.0],
  border: { pt: 0.5, color: "CBD5E1" },
  rowH: [0.38, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
});

// ═════════════════════════════════════════════════════════
// SLIDE 13: Bias Detection
// ═════════════════════════════════════════════════════════
let s13 = pres.addSlide();
addSlideBase(s13, "Bias Detection Module", { pageNum: 13 });

// Problem
s13.addText("Problem", {
  x: 0.5, y: 1.05, w: 4, h: 0.35,
  fontSize: 16, color: C.primary, bold: true, fontFace: "Segoe UI", margin: 0
});
s13.addText("Job descriptions often contain gendered or exclusionary language that discourages diverse applicants before they even apply.", {
  x: 0.5, y: 1.4, w: 9, h: 0.5,
  fontSize: 13, color: C.dark, fontFace: "Segoe UI"
});

// API example
s13.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 2.0, w: 4.2, h: 2.2,
  fill: { color: C.codeBg }
});
s13.addText(
`POST /api/v1/bias/analyze
{ "jobDescription": "..." }

Response:
{
  "biasScore": 0.72,
  "flaggedTerms": ["rockstar",
    "ninja", "aggressive"],
  "suggestions": ["high performer",
    "expert", "results-driven"]
}`, {
  x: 0.7, y: 2.1, w: 3.8, h: 2.0,
  fontSize: 11, color: C.codeText, fontFace: "Consolas", valign: "top"
});

// Key features on right
s13.addText("Key Features", {
  x: 5.0, y: 2.0, w: 4, h: 0.35,
  fontSize: 16, color: C.primary, bold: true, fontFace: "Segoe UI", margin: 0
});
s13.addText(bulletItems([
  "Runs at job creation time — recruiter sees warning before posting",
  "Flagged terms highlighted in UI with suggested alternatives",
  "Score threshold configurable by admin",
  "Categories: gendered_language, culture_fit_bias"
], { fontSize: 13 }), {
  x: 5.0, y: 2.4, w: 4.5, h: 1.8
});

// ═════════════════════════════════════════════════════════
// SLIDE 14: Demo Flow
// ═════════════════════════════════════════════════════════
let s14 = pres.addSlide();
addSlideBase(s14, "End-to-End Demo Flow", { pageNum: 14 });

const demoSteps = [
  { num: "1", label: "ADMIN creates\nrecruiter account", color: "E8EAF6" },
  { num: "2", label: "RECRUITER creates\njob posting", color: "E3F2FD", sub: "Bias analysis runs" },
  { num: "3", label: "CANDIDATE registers\n+ uploads CV", color: "E8F5E9", sub: "SBERT scoring → filter" },
  { num: "4", label: "If PASSED →\nexam invitation", color: "FFF3E0", sub: "BATCH_READY" },
  { num: "5", label: "CANDIDATE takes\ntimed exam", color: "F3E5F5", sub: "MCQ + Short Answer" },
  { num: "6", label: "RECRUITER sees\nranked dashboard", color: "E3F2FD", sub: "Records decision" },
  { num: "7", label: "XAI PDF generated\n(async, LIME)", color: "FFEBEE", sub: "Both parties download" },
];

demoSteps.forEach((step, i) => {
  const col = i % 4;
  const row = Math.floor(i / 4);
  const x = 0.3 + col * 2.4;
  const y = 1.1 + row * 2.0;

  // Number circle
  s14.addShape(pres.shapes.OVAL, {
    x: x + 0.7, y: y - 0.15, w: 0.4, h: 0.4,
    fill: { color: C.secondary }
  });
  s14.addText(step.num, {
    x: x + 0.7, y: y - 0.15, w: 0.4, h: 0.4,
    fontSize: 14, color: C.white, bold: true, fontFace: "Segoe UI",
    align: "center", valign: "middle"
  });

  // Card
  s14.addShape(pres.shapes.RECTANGLE, {
    x, y: y + 0.3, w: 2.1, h: 1.2,
    fill: { color: step.color }, shadow: makeShadow()
  });
  s14.addText(step.label, {
    x, y: y + 0.3, w: 2.1, h: 0.7,
    fontSize: 12, color: C.dark, bold: true, fontFace: "Segoe UI",
    align: "center", valign: "middle"
  });
  if (step.sub) {
    s14.addText(step.sub, {
      x, y: y + 0.95, w: 2.1, h: 0.45,
      fontSize: 10, color: C.grey, fontFace: "Segoe UI", italic: true,
      align: "center", valign: "top"
    });
  }
});

// ═════════════════════════════════════════════════════════
// SLIDE 15: Results & Validation
// ═════════════════════════════════════════════════════════
let s15 = pres.addSlide();
addSlideBase(s15, "Results & Validation", { pageNum: 15 });

const resultRows = [
  [
    { text: "Scenario", options: { bold: true, color: C.white, fill: { color: C.tableHead }, fontSize: 12, fontFace: "Segoe UI" } },
    { text: "Result", options: { bold: true, color: C.white, fill: { color: C.tableHead }, fontSize: 12, fontFace: "Segoe UI" } }
  ],
  [
    { text: "CV scoring: relevant vs off-topic", options: { fontSize: 11, fontFace: "Segoe UI" } },
    { text: "Cosine sim correctly ranked (0.72 vs 0.21)", options: { fontSize: 11, fontFace: "Segoe UI" } }
  ],
  [
    { text: "Hard filter: below threshold", options: { fontSize: 11, fill: { color: C.tableAlt }, fontFace: "Segoe UI" } },
    { text: "Rejected before exam — correct", options: { fontSize: 11, fill: { color: C.tableAlt }, fontFace: "Segoe UI" } }
  ],
  [
    { text: "MCQ exam: 3/5 correct", options: { fontSize: 11, fontFace: "Segoe UI" } },
    { text: "Score 60% — correct", options: { fontSize: 11, fontFace: "Segoe UI" } }
  ],
  [
    { text: "SA grading: both answers graded", options: { fontSize: 11, fill: { color: C.tableAlt }, fontFace: "Segoe UI" } },
    { text: "WaitGroup fix: single callback, correct sum", options: { fontSize: 11, fill: { color: C.tableAlt }, fontFace: "Segoe UI" } }
  ],
  [
    { text: "XAI report: PDF generated", options: { fontSize: 11, fontFace: "Segoe UI" } },
    { text: "38KB PDF, LIME attribution chart rendered", options: { fontSize: 11, fontFace: "Segoe UI" } }
  ],
  [
    { text: "Auth: HS512 JWT in exam-engine", options: { fontSize: 11, fill: { color: C.tableAlt }, fontFace: "Segoe UI" } },
    { text: "HS512 case added — verified working", options: { fontSize: 11, fill: { color: C.tableAlt }, fontFace: "Segoe UI" } }
  ],
];

s15.addTable(resultRows, {
  x: 0.3, y: 1.0, w: 9.4,
  colW: [4.5, 4.9],
  border: { pt: 0.5, color: "CBD5E1" },
  rowH: [0.38, 0.42, 0.42, 0.42, 0.42, 0.42, 0.42],
});

// Performance section
s15.addText("Performance (local dev)", {
  x: 0.5, y: 4.05, w: 4, h: 0.35,
  fontSize: 15, color: C.primary, bold: true, fontFace: "Segoe UI", margin: 0
});

const perfData = [
  ["CV scoring", "~80ms / application"],
  ["LIME attribution", "~4–8s (300 samples)"],
  ["SA grading", "~2–5s / question (Ollama)"],
  ["PDF generation", "~1s"],
];

perfData.forEach((row, i) => {
  s15.addText(row[0], {
    x: 0.5, y: 4.45 + i * 0.22, w: 2.0, h: 0.22,
    fontSize: 12, color: C.dark, bold: true, fontFace: "Segoe UI"
  });
  s15.addText(row[1], {
    x: 2.5, y: 4.45 + i * 0.22, w: 3.0, h: 0.22,
    fontSize: 12, color: C.grey, fontFace: "Segoe UI"
  });
});

// ═════════════════════════════════════════════════════════
// SLIDE 16: Limitations & Future Work
// ═════════════════════════════════════════════════════════
let s16 = pres.addSlide();
addSlideBase(s16, "Limitations & Future Work", { pageNum: 16 });

// Limitations
s16.addShape(pres.shapes.RECTANGLE, {
  x: 0.4, y: 1.05, w: 4.3, h: 2.5,
  fill: { color: "FFEBEE" }, shadow: makeCardShadow()
});
s16.addText("Current Limitations", {
  x: 0.4, y: 1.05, w: 4.3, h: 0.4,
  fontSize: 15, color: C.red, bold: true, fontFace: "Segoe UI",
  align: "center"
});
s16.addText(bulletItems([
  "Ollama grading quality — llama3.2 local model; accuracy not benchmarked",
  "No load testing — concurrent sessions not stress-tested",
  "CV parsing — scanned CVs unsupported",
  "LIME samples — 300 is fast but less stable than 2000+"
], { fontSize: 12 }), {
  x: 0.6, y: 1.5, w: 3.9, h: 1.8
});

// Future work
s16.addShape(pres.shapes.RECTANGLE, {
  x: 5.3, y: 1.05, w: 4.3, h: 2.5,
  fill: { color: "E8F5E9" }, shadow: makeCardShadow()
});
s16.addText("Future Work", {
  x: 5.3, y: 1.05, w: 4.3, h: 0.4,
  fontSize: 15, color: C.green, bold: true, fontFace: "Segoe UI",
  align: "center"
});
s16.addText(bulletItems([
  "Fine-tuned grading model",
  "Video interview integration",
  "A/B bias threshold testing",
  "Kubernetes deployment",
  "Candidate mobile app",
  "Audit log & GDPR export"
], { fontSize: 12 }), {
  x: 5.5, y: 1.5, w: 3.9, h: 1.8
});

// ═════════════════════════════════════════════════════════
// SLIDE 17: Conclusion
// ═════════════════════════════════════════════════════════
let s17 = pres.addSlide();
addSlideBase(s17, "Conclusion", { pageNum: 17 });

const deliverables = [
  "Full recruitment pipeline — from job posting to hired/rejected decision",
  "AI-powered CV screening — semantic similarity, not keyword matching",
  "Fair standardized assessment — exam engine with anti-cheat (timed, randomized)",
  "Explainable decisions — LIME attribution PDF, EU AI Act aligned",
  "Bias prevention — proactive analysis at job creation",
  "Microservice architecture — each service scaled independently",
  "Security — JWT HS512, role-based, internal API key isolation"
];

s17.addText("What We Delivered", {
  x: 0.5, y: 1.05, w: 4, h: 0.35,
  fontSize: 18, color: C.primary, bold: true, fontFace: "Segoe UI", margin: 0
});

deliverables.forEach((item, i) => {
  s17.addText("✓", {
    x: 0.5, y: 1.5 + i * 0.38, w: 0.35, h: 0.35,
    fontSize: 14, color: C.green, bold: true, fontFace: "Segoe UI"
  });
  s17.addText(item, {
    x: 0.9, y: 1.5 + i * 0.38, w: 8.5, h: 0.35,
    fontSize: 13, color: C.dark, fontFace: "Segoe UI", valign: "middle"
  });
});

// Key insight
s17.addShape(pres.shapes.RECTANGLE, {
  x: 0.4, y: 4.3, w: 9.2, h: 0.75,
  fill: { color: C.lightBlue }
});
s17.addShape(pres.shapes.RECTANGLE, {
  x: 0.4, y: 4.3, w: 0.06, h: 0.75,
  fill: { color: C.secondary }
});
s17.addText("The hardest part wasn't the AI — it was making 5 distributed services behave reliably under async, concurrent, and failure conditions. Every bug we fixed was a distributed systems problem in disguise.", {
  x: 0.6, y: 4.3, w: 8.8, h: 0.75,
  fontSize: 12, color: C.accent, fontFace: "Segoe UI", italic: true, valign: "middle"
});

// ═════════════════════════════════════════════════════════
// SLIDE 18: Thank You / Q&A
// ═════════════════════════════════════════════════════════
let s18 = pres.addSlide();
s18.background = { color: C.primary };
s18.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 0.12,
  fill: { color: C.secondary }
});
s18.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 5.45, w: 10, h: 0.175,
  fill: { color: C.secondary }
});

s18.addText("Thank You", {
  x: 0.5, y: 1.5, w: 9, h: 0.8,
  fontSize: 48, color: C.white, bold: true, fontFace: "Segoe UI",
  align: "center"
});
s18.addShape(pres.shapes.LINE, {
  x: 3.5, y: 2.5, w: 3, h: 0,
  line: { color: C.secondary, width: 2 }
});
s18.addText("Questions?", {
  x: 0.5, y: 2.7, w: 9, h: 0.6,
  fontSize: 32, color: "90CAF9", fontFace: "Segoe UI",
  align: "center"
});
s18.addText("EAA-Recruit — AI-Powered Recruitment Platform", {
  x: 0.5, y: 4.0, w: 9, h: 0.5,
  fontSize: 16, color: "90CAF9", fontFace: "Segoe UI", italic: true,
  align: "center"
});

// ─── Generate ───
pres.writeFile({ fileName: "D:\\EAA-recruit\\EAA-Recruit-Defense.pptx" })
  .then(() => console.log("✅ PPTX generated: D:\\EAA-recruit\\EAA-Recruit-Defense.pptx"))
  .catch(err => console.error("❌ Error:", err));
