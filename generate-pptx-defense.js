// EAA-Recruit Final Defense — 30 min, Light Theme
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "EAA-Recruit Team";
pres.title = "EAA-Recruit Final Defense";

// ─── Light Palette ───
const C = {
  bg:        "FFFFFF",
  text:      "1E293B",     // slate-800
  muted:     "64748B",     // slate-500
  light:     "F8FAFC",     // slate-50
  border:    "E2E8F0",     // slate-200
  accent:    "2563EB",     // blue-600
  accentLt:  "DBEAFE",     // blue-100
  accentMd:  "93C5FD",     // blue-300
  green:     "16A34A",
  greenLt:   "DCFCE7",
  red:       "DC2626",
  redLt:     "FEE2E2",
  amber:     "D97706",
  amberLt:   "FEF3C7",
  codeBg:    "F1F5F9",
};

const FONT = "Calibri";

// ─── Slide base (header bar + footer) ───
function base(slide, title, pageNum) {
  // Thin top accent line
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.05,
    fill: { color: C.accent }, line: { color: C.accent, width: 0 }
  });

  // Title
  if (title) {
    slide.addText(title, {
      x: 0.5, y: 0.25, w: 9, h: 0.55,
      fontSize: 26, color: C.text, bold: true, fontFace: FONT, margin: 0
    });
    // Subtle underline
    slide.addShape(pres.shapes.LINE, {
      x: 0.5, y: 0.85, w: 0.6, h: 0,
      line: { color: C.accent, width: 2.5 }
    });
  }

  // Footer
  slide.addText("EAA-Recruit · Final Defense · 2026", {
    x: 0.5, y: 5.35, w: 6, h: 0.25,
    fontSize: 9, color: C.muted, fontFace: FONT
  });
  if (pageNum) {
    slide.addText(String(pageNum), {
      x: 9.2, y: 5.35, w: 0.6, h: 0.25,
      fontSize: 9, color: C.muted, fontFace: FONT, align: "right"
    });
  }
}

function bullets(items, opts = {}) {
  return items.map((it, i) => ({
    text: typeof it === "string" ? it : it.text,
    options: {
      bullet: { code: "25AA" },  // small black square
      breakLine: i < items.length - 1,
      fontSize: opts.fontSize || 15,
      color: C.text,
      fontFace: FONT,
      paraSpaceAfter: 6,
      indentLevel: (typeof it === "object" && it.indent) ? it.indent : 0,
    }
  }));
}

// ═══════════════════════════════════════════════════════════
// 1 — TITLE
// ═══════════════════════════════════════════════════════════
let s = pres.addSlide();
s.background = { color: C.bg };
// Big accent block on left
s.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 0.3, h: 5.625, fill: { color: C.accent }, line: { color: C.accent, width: 0 }
});

s.addText("EAA-Recruit", {
  x: 0.8, y: 1.5, w: 8.5, h: 1.0,
  fontSize: 54, color: C.text, bold: true, fontFace: FONT
});
s.addText("AI-Powered Recruitment Platform", {
  x: 0.8, y: 2.5, w: 8.5, h: 0.5,
  fontSize: 22, color: C.accent, fontFace: FONT
});
s.addShape(pres.shapes.LINE, {
  x: 0.8, y: 3.15, w: 1.2, h: 0,
  line: { color: C.text, width: 1.5 }
});
s.addText("Final Year Project Defense", {
  x: 0.8, y: 3.3, w: 8.5, h: 0.4,
  fontSize: 16, color: C.muted, fontFace: FONT, italic: true
});
s.addText("Addis Ababa University · School of IT Engineering · May 2026", {
  x: 0.8, y: 4.7, w: 8.5, h: 0.3,
  fontSize: 12, color: C.muted, fontFace: FONT
});

// ═══════════════════════════════════════════════════════════
// 2 — TEAM
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
base(s, "Project Team", 2);

const team = [
  ["Abdellah Teshome",   "ATE/0406/13"],
  ["Abdurezak Zeynu",    "ATE/7317/13"],
  ["Biniam Dagne",       "ATE/1540/13"],
  ["Rehoboth Melaku",    "ATE/1745/13"],
  ["Yared Yirgalem",     "ATE/9061/13"],
];

team.forEach((m, i) => {
  const y = 1.3 + i * 0.55;
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y, w: 9, h: 0.45,
    fill: { color: C.light }, line: { color: C.border, width: 0.5 }
  });
  s.addText(m[0], {
    x: 0.8, y, w: 5, h: 0.45,
    fontSize: 15, color: C.text, bold: true, fontFace: FONT, valign: "middle"
  });
  s.addText(m[1], {
    x: 5.8, y, w: 3.5, h: 0.45,
    fontSize: 13, color: C.muted, fontFace: FONT, valign: "middle"
  });
});

s.addText("Advisor: Mr. Daniel Abebe", {
  x: 0.5, y: 4.4, w: 9, h: 0.3,
  fontSize: 14, color: C.accent, bold: true, fontFace: FONT
});

// ═══════════════════════════════════════════════════════════
// 3 — AGENDA
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
base(s, "Agenda", 3);

const agenda = [
  ["1", "Problem & Motivation",       "Why this project"],
  ["2", "System Architecture",         "Microservices, tech stack"],
  ["3", "Core Modules",                "CV scoring, exam engine, XAI"],
  ["4", "Technical Achievements",      "Race-condition fix, async pipelines"],
  ["5", "Testing & Results",           "AI accuracy, performance, security"],
  ["6", "Limitations & Future Work",   "What's next"],
  ["7", "Demo & Q&A",                  "Live walkthrough"],
];

agenda.forEach((row, i) => {
  const y = 1.2 + i * 0.55;
  // Number circle
  s.addShape(pres.shapes.OVAL, {
    x: 0.6, y, w: 0.4, h: 0.4,
    fill: { color: C.accentLt }, line: { color: C.accent, width: 1 }
  });
  s.addText(row[0], {
    x: 0.6, y, w: 0.4, h: 0.4,
    fontSize: 13, color: C.accent, bold: true, fontFace: FONT,
    align: "center", valign: "middle"
  });
  // Title
  s.addText(row[1], {
    x: 1.2, y, w: 4, h: 0.4,
    fontSize: 15, color: C.text, bold: true, fontFace: FONT, valign: "middle"
  });
  // Subtitle
  s.addText(row[2], {
    x: 5.2, y, w: 4.3, h: 0.4,
    fontSize: 13, color: C.muted, fontFace: FONT, valign: "middle", italic: true
  });
});

// ═══════════════════════════════════════════════════════════
// 4 — PROBLEM
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
base(s, "Problem Statement", 4);

s.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 1.1, w: 9, h: 0.75,
  fill: { color: C.accentLt }, line: { color: C.accent, width: 0 }
});
s.addText("Traditional recruitment is slow, biased, and opaque — recruiters spend 80% of their time on manual CV screening with no accountability trail.", {
  x: 0.7, y: 1.1, w: 8.6, h: 0.75,
  fontSize: 14, color: C.text, italic: true, fontFace: FONT, valign: "middle"
});

s.addText("Pain Points", {
  x: 0.5, y: 2.05, w: 9, h: 0.35,
  fontSize: 17, color: C.accent, bold: true, fontFace: FONT
});
s.addText(bullets([
  "Manual CV review: ~6 minutes per resume, 250+ applicants per role",
  "No standardized assessment tied to the actual job requirements",
  "AI hiring tools are black boxes — rejected candidates get no explanation",
  "Interview scheduling lives in chaotic email threads",
  "Hidden bias in job descriptions discourages diverse applicants"
], { fontSize: 14 }), {
  x: 0.7, y: 2.4, w: 8.8, h: 2.0
});

s.addShape(pres.shapes.LINE, {
  x: 0.5, y: 4.5, w: 9, h: 0,
  line: { color: C.border, width: 1 }
});
s.addText("Our Goal: automate screening, examine fairly, explain every decision.", {
  x: 0.5, y: 4.6, w: 9, h: 0.5,
  fontSize: 14, color: C.text, bold: true, fontFace: FONT
});

// ═══════════════════════════════════════════════════════════
// 5 — OBJECTIVES
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
base(s, "Project Objectives", 5);

const objs = [
  { t: "Automate", d: "Replace 6-min manual CV review with sub-second semantic scoring." },
  { t: "Standardize", d: "Deliver fair, role-specific exams with consistent AI grading." },
  { t: "Explain", d: "Produce LIME-backed PDF for every decision (EU AI Act aligned)." },
  { t: "Prevent Bias", d: "Flag gendered/exclusionary language at job-creation time." },
  { t: "Self-Host", d: "No external AI APIs — full data sovereignty with local Ollama." },
];

objs.forEach((o, i) => {
  const y = 1.1 + i * 0.75;
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y, w: 0.15, h: 0.6,
    fill: { color: C.accent }, line: { color: C.accent, width: 0 }
  });
  s.addText(o.t, {
    x: 0.8, y, w: 2.2, h: 0.6,
    fontSize: 16, color: C.text, bold: true, fontFace: FONT, valign: "middle"
  });
  s.addText(o.d, {
    x: 3.1, y, w: 6.4, h: 0.6,
    fontSize: 13, color: C.muted, fontFace: FONT, valign: "middle"
  });
});

// ═══════════════════════════════════════════════════════════
// 6 — RELATED WORK
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
base(s, "Related Work & Our Contribution", 6);

const rwRows = [
  [
    { text: "System", options: { bold: true, color: C.bg, fill: { color: C.accent }, fontSize: 13, fontFace: FONT } },
    { text: "Limitation", options: { bold: true, color: C.bg, fill: { color: C.accent }, fontSize: 13, fontFace: FONT } },
    { text: "Our Contribution", options: { bold: true, color: C.bg, fill: { color: C.accent }, fontSize: 13, fontFace: FONT } },
  ],
  [
    { text: "LinkedIn Recruiter", options: { fontSize: 12, fontFace: FONT, bold: true } },
    { text: "No XAI, no data sovereignty", options: { fontSize: 12, fontFace: FONT } },
    { text: "LIME explainability + local deployment", options: { fontSize: 12, fontFace: FONT } },
  ],
  [
    { text: "Workday ATS", options: { fontSize: 12, fontFace: FONT, bold: true, fill: { color: C.light } } },
    { text: "Expensive, generic", options: { fontSize: 12, fontFace: FONT, fill: { color: C.light } } },
    { text: "Open-source, aviation-specific", options: { fontSize: 12, fontFace: FONT, fill: { color: C.light } } },
  ],
  [
    { text: "Google for Jobs", options: { fontSize: 12, fontFace: FONT, bold: true } },
    { text: "No exam engine, no grading", options: { fontSize: 12, fontFace: FONT } },
    { text: "Role-specific exam + AI grading", options: { fontSize: 12, fontFace: FONT } },
  ],
  [
    { text: "Ethiopian job portals", options: { fontSize: 12, fontFace: FONT, bold: true, fill: { color: C.light } } },
    { text: "Manual, no AI", options: { fontSize: 12, fontFace: FONT, fill: { color: C.light } } },
    { text: "Full AI automation pipeline", options: { fontSize: 12, fontFace: FONT, fill: { color: C.light } } },
  ],
];

s.addTable(rwRows, {
  x: 0.5, y: 1.1, w: 9,
  colW: [2.3, 3.2, 3.5],
  border: { pt: 0.5, color: C.border },
  rowH: [0.4, 0.5, 0.5, 0.5, 0.5],
});

s.addText("Key Differentiators", {
  x: 0.5, y: 3.7, w: 9, h: 0.35,
  fontSize: 15, color: C.accent, bold: true, fontFace: FONT
});
s.addText(bullets([
  "First Ethiopian aviation-specific AI recruitment platform",
  "Full data sovereignty (local Ollama, no cloud APIs)",
  "Integrated semantic CV scoring + AI-graded exam + LIME XAI in one pipeline"
], { fontSize: 13 }), {
  x: 0.7, y: 4.05, w: 8.8, h: 1.2
});

// ═══════════════════════════════════════════════════════════
// 7 — ARCHITECTURE
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
base(s, "System Architecture", 7);

// Frontend
s.addShape(pres.shapes.RECTANGLE, {
  x: 2, y: 1.05, w: 6, h: 0.55,
  fill: { color: C.accentLt }, line: { color: C.accent, width: 1 }
});
s.addText("Next.js 14  ·  Recruiter / Candidate / Admin Portals", {
  x: 2, y: 1.05, w: 6, h: 0.55,
  fontSize: 13, color: C.text, bold: true, fontFace: FONT,
  align: "center", valign: "middle"
});
s.addText("▼  HTTPS + JWT (HS512)", {
  x: 3, y: 1.65, w: 4, h: 0.25,
  fontSize: 10, color: C.muted, fontFace: FONT, align: "center"
});

// Spring Boot
s.addShape(pres.shapes.RECTANGLE, {
  x: 2, y: 1.95, w: 6, h: 0.6,
  fill: { color: C.accent }, line: { color: C.accent, width: 0 }
});
s.addText([
  { text: "Spring Boot 3 — Core API\n", options: { bold: true, fontSize: 13, color: C.bg, fontFace: FONT, breakLine: true } },
  { text: "Auth · Jobs · Applications · Decisions", options: { fontSize: 11, color: C.accentLt, fontFace: FONT } }
], {
  x: 2, y: 1.95, w: 6, h: 0.6, align: "center", valign: "middle"
});

// Arrow row
["▼ REST + Key", "▼ REST + Key", "▼ JDBC"].forEach((lbl, i) => {
  s.addText(lbl, {
    x: 0.5 + i * 3.15, y: 2.6, w: 3, h: 0.25,
    fontSize: 10, color: C.muted, fontFace: FONT, align: "center"
  });
});

// Three service boxes
const services = [
  { x: 0.5, label: "AI Service",    sub: "FastAPI · SBERT · Ollama · LIME" },
  { x: 3.65, label: "Exam Engine",  sub: "Go · Gin · Redis Sessions" },
  { x: 6.8, label: "Data Layer",    sub: "PostgreSQL 16 · Redis 7" },
];
services.forEach(svc => {
  s.addShape(pres.shapes.RECTANGLE, {
    x: svc.x, y: 2.95, w: 2.7, h: 1.0,
    fill: { color: C.light }, line: { color: C.accent, width: 1 }
  });
  s.addText([
    { text: svc.label + "\n", options: { bold: true, fontSize: 13, color: C.text, fontFace: FONT, breakLine: true } },
    { text: svc.sub, options: { fontSize: 10, color: C.muted, fontFace: FONT } }
  ], {
    x: svc.x, y: 2.95, w: 2.7, h: 1.0, align: "center", valign: "middle"
  });
});

s.addText("5 services  ·  Docker Compose  ·  HTTP/1.1 enforced inter-service", {
  x: 0.5, y: 4.2, w: 9, h: 0.35,
  fontSize: 12, color: C.muted, fontFace: FONT, align: "center", italic: true
});

// Highlights
s.addText("Why microservices?", {
  x: 0.5, y: 4.65, w: 2.5, h: 0.3,
  fontSize: 12, color: C.accent, bold: true, fontFace: FONT
});
s.addText("Independent scale per workload (AI ≠ exam ≠ API); language match per task (Java/Go/Python).", {
  x: 2.8, y: 4.65, w: 6.7, h: 0.4,
  fontSize: 11, color: C.muted, fontFace: FONT
});

// ═══════════════════════════════════════════════════════════
// 8 — TECH STACK
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
base(s, "Technology Stack", 8);

const stackRows = [
  [
    { text: "Layer",      options: { bold: true, color: C.bg, fill: { color: C.accent }, fontSize: 12, fontFace: FONT } },
    { text: "Technology", options: { bold: true, color: C.bg, fill: { color: C.accent }, fontSize: 12, fontFace: FONT } },
    { text: "Rationale",  options: { bold: true, color: C.bg, fill: { color: C.accent }, fontSize: 12, fontFace: FONT } },
  ],
  [{ text: "Frontend", options: { fontSize: 11, fontFace: FONT, bold: true } },
   { text: "Next.js 14 + TypeScript + Tailwind", options: { fontSize: 11, fontFace: FONT } },
   { text: "SSR, type safety", options: { fontSize: 11, fontFace: FONT } }],
  [{ text: "Backend", options: { fontSize: 11, fontFace: FONT, bold: true, fill: { color: C.light } } },
   { text: "Spring Boot 3 + Java 21", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light } } },
   { text: "Mature ecosystem, transactions", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light } } }],
  [{ text: "AI Service", options: { fontSize: 11, fontFace: FONT, bold: true } },
   { text: "FastAPI + Python 3.11", options: { fontSize: 11, fontFace: FONT } },
   { text: "ML library ecosystem", options: { fontSize: 11, fontFace: FONT } }],
  [{ text: "Exam Engine", options: { fontSize: 11, fontFace: FONT, bold: true, fill: { color: C.light } } },
   { text: "Go 1.22 + Gin", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light } } },
   { text: "Goroutine concurrency", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light } } }],
  [{ text: "Embeddings", options: { fontSize: 11, fontFace: FONT, bold: true } },
   { text: "SBERT all-MiniLM-L6-v2", options: { fontSize: 11, fontFace: FONT } },
   { text: "22M params, 384-dim, ~80ms/call", options: { fontSize: 11, fontFace: FONT } }],
  [{ text: "LLM", options: { fontSize: 11, fontFace: FONT, bold: true, fill: { color: C.light } } },
   { text: "Ollama llama3.2 (local)", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light } } },
   { text: "No API cost, full sovereignty", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light } } }],
  [{ text: "XAI", options: { fontSize: 11, fontFace: FONT, bold: true } },
   { text: "LIME + ReportLab + matplotlib", options: { fontSize: 11, fontFace: FONT } },
   { text: "Model-agnostic attribution → PDF", options: { fontSize: 11, fontFace: FONT } }],
  [{ text: "Database", options: { fontSize: 11, fontFace: FONT, bold: true, fill: { color: C.light } } },
   { text: "PostgreSQL 16 + Flyway", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light } } },
   { text: "ACID, versioned migrations", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light } } }],
  [{ text: "Cache/Sessions", options: { fontSize: 11, fontFace: FONT, bold: true } },
   { text: "Redis 7", options: { fontSize: 11, fontFace: FONT } },
   { text: "Sub-ms exam state, OTP cache", options: { fontSize: 11, fontFace: FONT } }],
  [{ text: "Auth", options: { fontSize: 11, fontFace: FONT, bold: true, fill: { color: C.light } } },
   { text: "JWT HS512, RBAC, BCrypt(10)", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light } } },
   { text: "4 roles, service-to-service API keys", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light } } }],
];
s.addTable(stackRows, {
  x: 0.4, y: 1.05, w: 9.2, colW: [1.6, 3.5, 4.1],
  border: { pt: 0.5, color: C.border },
  rowH: 0.36,
});

// ═══════════════════════════════════════════════════════════
// 9 — DATABASE DESIGN
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
base(s, "Database Design", 9);

s.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 1.05, w: 5.5, h: 3.0,
  fill: { color: C.codeBg }, line: { color: C.border, width: 0.5 }
});
s.addText(
`users ──< job_postings ──< applications ──< exam_sessions
                              │
                              ├── cv_relevance_score  (FLOAT)
                              ├── exam_score          (FLOAT, 0-100)
                              ├── final_score         (FLOAT, 0-100)
                              ├── hard_filter_passed  (BOOLEAN)
                              ├── xai_report_url      (TEXT)
                              ├── decision_notes      (TEXT)
                              └── version             (@Version)

questions (per job)
  ├── type: MCQ | SHORT_ANSWER
  ├── correct_answer
  └── ideal_answer  (V12, used by LIME grader)`, {
  x: 0.7, y: 1.15, w: 5.1, h: 2.8,
  fontSize: 10, color: C.text, fontFace: "Consolas", valign: "top"
});

// Side notes
s.addShape(pres.shapes.RECTANGLE, {
  x: 6.3, y: 1.05, w: 3.2, h: 0.85,
  fill: { color: C.accentLt }, line: { color: C.accent, width: 0 }
});
s.addText([
  { text: "12 Flyway Migrations\n", options: { bold: true, fontSize: 13, color: C.accent, fontFace: FONT, breakLine: true } },
  { text: "Run on startup, tracked in\nflyway_schema_history", options: { fontSize: 10, color: C.text, fontFace: FONT } }
], {
  x: 6.3, y: 1.05, w: 3.2, h: 0.85, align: "center", valign: "middle"
});

s.addShape(pres.shapes.RECTANGLE, {
  x: 6.3, y: 2.0, w: 3.2, h: 0.95,
  fill: { color: C.amberLt }, line: { color: C.amber, width: 0 }
});
s.addText([
  { text: "Optimistic Locking\n", options: { bold: true, fontSize: 13, color: C.amber, fontFace: FONT, breakLine: true } },
  { text: "@Version on applications.\nBypassed for async XAI save\nvia native UPDATE query.", options: { fontSize: 10, color: C.text, fontFace: FONT } }
], {
  x: 6.3, y: 2.0, w: 3.2, h: 0.95, align: "center", valign: "middle"
});

s.addShape(pres.shapes.RECTANGLE, {
  x: 6.3, y: 3.05, w: 3.2, h: 1.0,
  fill: { color: C.greenLt }, line: { color: C.green, width: 0 }
});
s.addText([
  { text: "Connection Pool\n", options: { bold: true, fontSize: 13, color: C.green, fontFace: FONT, breakLine: true } },
  { text: "HikariCP max=20, min=5.\nIndexes on candidate_id,\njob_id, status, recruiter_id.", options: { fontSize: 10, color: C.text, fontFace: FONT } }
], {
  x: 6.3, y: 3.05, w: 3.2, h: 1.0, align: "center", valign: "middle"
});

s.addText("Redis (3 roles): OTP cache · exam sessions · login lockout", {
  x: 0.5, y: 4.4, w: 9, h: 0.35,
  fontSize: 12, color: C.muted, fontFace: FONT, italic: true, align: "center"
});

// ═══════════════════════════════════════════════════════════
// 10 — MODULE 1: CV SCORING
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
base(s, "Module 1 — CV Scoring (AI Service)", 10);

// Pipeline boxes
const steps = [
  { label: "CV Text\n(PDF extracted)",      bg: C.light,    tc: C.text },
  { label: "SBERT Encoder\n384-dim vector", bg: C.accentLt, tc: C.accent },
  { label: "Cosine\nSimilarity",            bg: C.greenLt,  tc: C.green },
  { label: "Hard Filter\n(threshold)",      bg: C.amberLt,  tc: C.amber },
  { label: "PASS / FAIL\nstored on DB",     bg: C.redLt,    tc: C.red },
];
const stepW = 1.65, stepGap = 0.2, startX = 0.55;
steps.forEach((st, i) => {
  const x = startX + i * (stepW + stepGap);
  s.addShape(pres.shapes.RECTANGLE, {
    x, y: 1.2, w: stepW, h: 0.9,
    fill: { color: st.bg }, line: { color: st.tc, width: 1 }
  });
  s.addText(st.label, {
    x, y: 1.2, w: stepW, h: 0.9,
    fontSize: 11, color: st.tc, bold: true, fontFace: FONT,
    align: "center", valign: "middle"
  });
  if (i < steps.length - 1) {
    s.addText("→", {
      x: x + stepW, y: 1.2, w: stepGap, h: 0.9,
      fontSize: 16, color: C.muted, align: "center", valign: "middle"
    });
  }
});

// Parallel JD
s.addShape(pres.shapes.RECTANGLE, {
  x: 0.55, y: 2.3, w: 1.65, h: 0.5,
  fill: { color: C.codeBg }, line: { color: C.muted, width: 1 }
});
s.addText("Job Description", {
  x: 0.55, y: 2.3, w: 1.65, h: 0.5,
  fontSize: 11, color: C.text, bold: true, fontFace: FONT,
  align: "center", valign: "middle"
});
s.addText("↗ also encoded via SBERT then compared", {
  x: 2.3, y: 2.3, w: 6, h: 0.5,
  fontSize: 11, color: C.muted, fontFace: FONT, italic: true, valign: "middle"
});

// Details
s.addText("Implementation Details", {
  x: 0.5, y: 3.1, w: 9, h: 0.35,
  fontSize: 15, color: C.accent, bold: true, fontFace: FONT
});
s.addText(bullets([
  "Model: sentence-transformers/all-MiniLM-L6-v2 (22M params, ~80ms/encode)",
  "Both vectors L2-normalized → cosine sim = dot product, mapped to [0,1]",
  "Hard filter: configurable per-job threshold; default 0.35 (failed = no exam invite)",
  "Score persisted as cv_relevance_score on applications table"
], { fontSize: 13 }), {
  x: 0.7, y: 3.5, w: 8.8, h: 1.6
});

// ═══════════════════════════════════════════════════════════
// 11 — MODULE 2: EXAM ENGINE
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
base(s, "Module 2 — Exam Engine (Go)", 11);

const states = [
  { label: "BATCH_READY",  desc: "Spring → /internal/exams/batch-ready" },
  { label: "PENDING",      desc: "Candidate clicks Start Exam" },
  { label: "IN_PROGRESS",  desc: "Timed questions served from Redis" },
  { label: "SUBMITTED",    desc: "Grading begins (MCQ instant, SA async)" },
  { label: "COMPLETED",    desc: "Single callback → Spring updates DB" },
];

states.forEach((st, i) => {
  const y = 1.15 + i * 0.65;
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y, w: 2.2, h: 0.45,
    fill: { color: C.accentLt }, line: { color: C.accent, width: 1 }
  });
  s.addText(st.label, {
    x: 0.5, y, w: 2.2, h: 0.45,
    fontSize: 12, color: C.accent, bold: true, fontFace: "Consolas",
    align: "center", valign: "middle"
  });
  s.addText(st.desc, {
    x: 2.85, y, w: 3.2, h: 0.45,
    fontSize: 11, color: C.muted, fontFace: FONT, valign: "middle"
  });
  if (i < states.length - 1) {
    s.addText("▼", {
      x: 0.5, y: y + 0.42, w: 2.2, h: 0.23,
      fontSize: 10, color: C.accent, align: "center"
    });
  }
});

// Side card
s.addShape(pres.shapes.RECTANGLE, {
  x: 6.4, y: 1.15, w: 3.1, h: 1.95,
  fill: { color: C.light }, line: { color: C.border, width: 1 }
});
s.addText("Why Go?", {
  x: 6.4, y: 1.15, w: 3.1, h: 0.4,
  fontSize: 14, color: C.accent, bold: true, fontFace: FONT, align: "center"
});
s.addText(bullets([
  "Goroutines: cheap parallelism",
  "Compiled binary: fast startup",
  "Strong stdlib for HTTP",
  "WaitGroup: clean sync primitive"
], { fontSize: 11 }), {
  x: 6.6, y: 1.55, w: 2.8, h: 1.5
});

s.addShape(pres.shapes.RECTANGLE, {
  x: 6.4, y: 3.2, w: 3.1, h: 1.4,
  fill: { color: C.redLt }, line: { color: C.red, width: 0 }
});
s.addText("Redis stores", {
  x: 6.4, y: 3.2, w: 3.1, h: 0.3,
  fontSize: 13, color: C.red, bold: true, fontFace: FONT, align: "center"
});
s.addText(bullets([
  "Session state",
  "Question schedule",
  "Authorized candidates"
], { fontSize: 11 }), {
  x: 6.6, y: 3.55, w: 2.8, h: 1.0
});

// ═══════════════════════════════════════════════════════════
// 12 — RACE CONDITION FIX
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
base(s, "Key Achievement — Race Condition Fix", 12);

// BEFORE
s.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 1.1, w: 4.4, h: 2.3,
  fill: { color: C.redLt }, line: { color: C.red, width: 1 }
});
s.addText("BEFORE (Broken)", {
  x: 0.5, y: 1.15, w: 4.4, h: 0.35,
  fontSize: 14, color: C.red, bold: true, fontFace: FONT, align: "center"
});
s.addText([
  { text: "goroutine 1:\n", options: { bold: true, fontSize: 11, color: C.text, fontFace: "Consolas", breakLine: true } },
  { text: "  read → add 17.5 → publish ✓\n", options: { fontSize: 11, color: C.text, fontFace: "Consolas", breakLine: true } },
  { text: "\n", options: { fontSize: 6, breakLine: true } },
  { text: "goroutine 2:\n", options: { bold: true, fontSize: 11, color: C.text, fontFace: "Consolas", breakLine: true } },
  { text: "  read → add 7.6  → publish ✗\n", options: { fontSize: 11, color: C.text, fontFace: "Consolas", breakLine: true } },
  { text: "  (duplicate, ignored)\n", options: { fontSize: 10, color: C.muted, fontFace: "Consolas", italic: true, breakLine: true } },
  { text: "\n", options: { fontSize: 6, breakLine: true } },
  { text: "Final score in DB: 17.5  ← WRONG", options: { fontSize: 12, color: C.red, bold: true, fontFace: "Consolas" } },
], {
  x: 0.7, y: 1.55, w: 4.0, h: 1.8
});

// AFTER
s.addShape(pres.shapes.RECTANGLE, {
  x: 5.1, y: 1.1, w: 4.4, h: 2.3,
  fill: { color: C.greenLt }, line: { color: C.green, width: 1 }
});
s.addText("AFTER (Fixed)", {
  x: 5.1, y: 1.15, w: 4.4, h: 0.35,
  fontSize: 14, color: C.green, bold: true, fontFace: FONT, align: "center"
});
s.addText([
  { text: "WaitGroup collects ALL results\n", options: { bold: true, fontSize: 11, color: C.text, fontFace: "Consolas", breakLine: true } },
  { text: "  Mutex-protected result map\n", options: { fontSize: 11, color: C.text, fontFace: "Consolas", breakLine: true } },
  { text: "\n", options: { fontSize: 6, breakLine: true } },
  { text: "wg.Wait()  // sync barrier\n", options: { fontSize: 11, color: C.text, fontFace: "Consolas", breakLine: true } },
  { text: "\n", options: { fontSize: 6, breakLine: true } },
  { text: "Single atomic update\n", options: { bold: true, fontSize: 11, color: C.text, fontFace: "Consolas", breakLine: true } },
  { text: "Single callback to Spring\n", options: { bold: true, fontSize: 11, color: C.text, fontFace: "Consolas", breakLine: true } },
  { text: "\n", options: { fontSize: 6, breakLine: true } },
  { text: "Final score in DB: 25.1  ← CORRECT", options: { fontSize: 12, color: C.green, bold: true, fontFace: "Consolas" } },
], {
  x: 5.3, y: 1.55, w: 4.0, h: 1.8
});

// Insight box
s.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 3.6, w: 9, h: 0.55,
  fill: { color: C.accentLt }, line: { color: C.accent, width: 0 }
});
s.addText("Pattern: collect-then-publish — all goroutines finish before any side effect fires.", {
  x: 0.7, y: 3.6, w: 8.6, h: 0.55,
  fontSize: 13, color: C.accent, bold: true, fontFace: FONT, italic: true, valign: "middle"
});

// Code
s.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 4.3, w: 9, h: 0.75,
  fill: { color: C.codeBg }, line: { color: C.border, width: 0.5 }
});
s.addText("wg.Wait()                                    // barrier — wait for all\ng.finalizeSession(session, results)          // single atomic update\ng.springClient.PublishExamCompleted(session) // called exactly once", {
  x: 0.7, y: 4.3, w: 8.6, h: 0.75,
  fontSize: 11, color: C.text, fontFace: "Consolas", valign: "middle"
});

// ═══════════════════════════════════════════════════════════
// 13 — MODULE 3: XAI
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
base(s, "Module 3 — XAI Report (Explainable AI)", 13);

// EU note
s.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 1.05, w: 9, h: 0.55,
  fill: { color: C.amberLt }, line: { color: C.amber, width: 0 }
});
s.addText("EU AI Act (2024): automated hiring decisions MUST be explainable to candidates.", {
  x: 0.7, y: 1.05, w: 8.6, h: 0.55,
  fontSize: 13, color: C.amber, bold: true, fontFace: FONT, valign: "middle"
});

// LIME steps
s.addText("How LIME Works", {
  x: 0.5, y: 1.8, w: 4, h: 0.35,
  fontSize: 15, color: C.accent, bold: true, fontFace: FONT
});
s.addText(bullets([
  "Mask random words in CV (300 samples)",
  "Score each variant with SBERT vs job",
  "Fit local linear model on perturbations",
  "Extract top feature weights → top keywords"
], { fontSize: 12 }), {
  x: 0.7, y: 2.15, w: 4.5, h: 1.5
});

// Example output box
s.addShape(pres.shapes.RECTANGLE, {
  x: 5.5, y: 1.8, w: 4.0, h: 1.65,
  fill: { color: C.codeBg }, line: { color: C.border, width: 0.5 }
});
s.addText('{ "python":     +0.42,\n  "leadership": +0.31,\n  "java":       +0.18,\n  "teamwork":   +0.12 }', {
  x: 5.7, y: 1.85, w: 3.7, h: 1.55,
  fontSize: 12, color: C.text, fontFace: "Consolas", valign: "middle"
});

// PDF parts
s.addText("PDF Report Contents", {
  x: 0.5, y: 3.75, w: 9, h: 0.35,
  fontSize: 15, color: C.accent, bold: true, fontFace: FONT
});
const parts = [
  ["1.", "Score Breakdown",   "CV score, exam score, final score"],
  ["2.", "Attribution Chart", "Top 10 keywords by LIME impact"],
  ["3.", "LLM Justification", "Ollama generates 3-paragraph explanation"],
  ["4.", "Hard Filter Status", "Pass/fail with threshold context"],
];
parts.forEach((p, i) => {
  const y = 4.15 + i * 0.27;
  s.addText(p[0], {
    x: 0.5, y, w: 0.35, h: 0.25,
    fontSize: 12, color: C.accent, bold: true, fontFace: FONT
  });
  s.addText(p[1], {
    x: 0.85, y, w: 2.3, h: 0.25,
    fontSize: 12, color: C.text, bold: true, fontFace: FONT
  });
  s.addText("— " + p[2], {
    x: 3.1, y, w: 6.4, h: 0.25,
    fontSize: 11, color: C.muted, fontFace: FONT
  });
});

// ═══════════════════════════════════════════════════════════
// 14 — XAI DELIVERY PIPELINE
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
base(s, "XAI Delivery Pipeline (Async)", 14);

const xaiSteps = [
  { lbl: "Recruiter\nrecords decision",  bg: C.accentLt, tc: C.accent },
  { lbl: "@Async\nnon-blocking",          bg: C.amberLt,  tc: C.amber },
  { lbl: "AI Service\nLIME → PDF",        bg: C.greenLt,  tc: C.green },
  { lbl: "Native SQL\nUPDATE",            bg: C.accentLt, tc: C.accent },
  { lbl: "PDF streamed\nto browser",      bg: C.redLt,    tc: C.red },
];
xaiSteps.forEach((st, i) => {
  const x = 0.3 + i * 1.95;
  s.addShape(pres.shapes.RECTANGLE, {
    x, y: 1.2, w: 1.7, h: 0.9,
    fill: { color: st.bg }, line: { color: st.tc, width: 1 }
  });
  s.addText(st.lbl, {
    x, y: 1.2, w: 1.7, h: 0.9,
    fontSize: 11, color: st.tc, bold: true, fontFace: FONT,
    align: "center", valign: "middle"
  });
  if (i < xaiSteps.length - 1) {
    s.addText("→", {
      x: x + 1.7, y: 1.2, w: 0.25, h: 0.9,
      fontSize: 14, color: C.muted, align: "center", valign: "middle"
    });
  }
});

s.addText("Key Design Decisions", {
  x: 0.5, y: 2.4, w: 9, h: 0.35,
  fontSize: 15, color: C.accent, bold: true, fontFace: FONT
});
s.addText(bullets([
  "Recruiter's decision response is INSTANT — XAI runs 5–15s in background",
  "Native @Modifying @Query bypasses JPA optimistic lock (stale version problem)",
  "ByteArrayResource proxy: Spring downloads then streams (not 302 redirect)",
  "Both recruiter and candidate can download the same PDF (ownership check)",
  "5–15s latency hidden from UX — user sees immediate success toast"
], { fontSize: 13 }), {
  x: 0.7, y: 2.8, w: 8.8, h: 2.3
});

// ═══════════════════════════════════════════════════════════
// 15 — BIAS DETECTION
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
base(s, "Bias Detection Module", 15);

s.addText("Problem", {
  x: 0.5, y: 1.05, w: 4, h: 0.35,
  fontSize: 15, color: C.accent, bold: true, fontFace: FONT
});
s.addText("Job descriptions often contain gendered or exclusionary language that discourages diverse applicants before they apply.", {
  x: 0.5, y: 1.4, w: 9, h: 0.55,
  fontSize: 13, color: C.text, fontFace: FONT
});

// API box
s.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 2.1, w: 4.2, h: 2.4,
  fill: { color: C.codeBg }, line: { color: C.border, width: 0.5 }
});
s.addText(
`POST /api/v1/bias/analyze
{ "jobDescription": "..." }

Response:
{
  "biasScore": 0.72,
  "flaggedTerms": [
    "rockstar", "ninja",
    "aggressive"
  ],
  "suggestions": [
    "high performer",
    "expert",
    "results-driven"
  ]
}`, {
  x: 0.7, y: 2.2, w: 3.8, h: 2.2,
  fontSize: 10.5, color: C.text, fontFace: "Consolas", valign: "top"
});

s.addText("Key Features", {
  x: 5.0, y: 2.1, w: 4, h: 0.35,
  fontSize: 15, color: C.accent, bold: true, fontFace: FONT
});
s.addText(bullets([
  "Runs at job creation — recruiter sees warning BEFORE posting",
  "Flagged terms highlighted in UI with suggested alternatives",
  "Categories: gendered_language, age, culture_fit_bias",
  "Score threshold configurable by admin",
  "Lexicon + simple rule-based scoring (~50ms)"
], { fontSize: 12 }), {
  x: 5.2, y: 2.5, w: 4.5, h: 2.0
});

// ═══════════════════════════════════════════════════════════
// 16 — SECURITY
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
base(s, "Security Architecture", 16);

// User-facing
s.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 1.1, w: 4.3, h: 2.0,
  fill: { color: C.light }, line: { color: C.accent, width: 1 }
});
s.addText("User-Facing Auth", {
  x: 0.5, y: 1.15, w: 4.3, h: 0.35,
  fontSize: 14, color: C.accent, bold: true, fontFace: FONT, align: "center"
});
s.addText(bullets([
  "JWT HS512, signed by Spring",
  "Dual HS256/HS512 in exam-engine",
  "4 roles: ADMIN, RECRUITER, CANDIDATE, INTERVIEWER",
  "Annotations: @IsRecruiter, @IsCandidate"
], { fontSize: 11 }), {
  x: 0.7, y: 1.55, w: 3.9, h: 1.5
});

// Service-to-service
s.addShape(pres.shapes.RECTANGLE, {
  x: 5.2, y: 1.1, w: 4.3, h: 2.0,
  fill: { color: C.light }, line: { color: C.accent, width: 1 }
});
s.addText("Service-to-Service Auth", {
  x: 5.2, y: 1.15, w: 4.3, h: 0.35,
  fontSize: 14, color: C.accent, bold: true, fontFace: FONT, align: "center"
});
s.addText([
  { text: "Spring → ai-service:\n",      options: { fontSize: 11, color: C.text, fontFace: "Consolas", breakLine: true } },
  { text: "  X-Internal-Api-Key\n",       options: { fontSize: 10, color: C.muted, fontFace: "Consolas", breakLine: true } },
  { text: "Spring → exam-engine:\n",      options: { fontSize: 11, color: C.text, fontFace: "Consolas", breakLine: true } },
  { text: "  X-Internal-Api-Key\n",       options: { fontSize: 10, color: C.muted, fontFace: "Consolas", breakLine: true } },
  { text: "exam-engine → ai-service:\n",  options: { fontSize: 11, color: C.text, fontFace: "Consolas", breakLine: true } },
  { text: "  X-Internal-Api-Key",         options: { fontSize: 10, color: C.muted, fontFace: "Consolas" } },
], {
  x: 5.4, y: 1.55, w: 3.9, h: 1.5
});

// Data isolation full-width
s.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 3.25, w: 9, h: 1.6,
  fill: { color: C.accentLt }, line: { color: C.accent, width: 0 }
});
s.addText("Data Isolation", {
  x: 0.5, y: 3.3, w: 9, h: 0.35,
  fontSize: 14, color: C.accent, bold: true, fontFace: FONT, align: "center"
});
s.addText(bullets([
  "Recruiter sees only their own jobs' applications",
  "Candidate accesses only their own applications/exams",
  "XAI report: both recruiter (job owner) and candidate (applicant) can access; admin cannot"
], { fontSize: 12 }), {
  x: 0.7, y: 3.7, w: 8.8, h: 1.1
});

// ═══════════════════════════════════════════════════════════
// 17 — END-TO-END DEMO FLOW
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
base(s, "End-to-End User Flow", 17);

const demo = [
  ["1", "ADMIN",     "creates recruiter account",          ""],
  ["2", "RECRUITER", "creates job posting",                "Bias analysis runs"],
  ["3", "CANDIDATE", "registers + uploads CV (PDF)",       "SBERT scoring → hard filter"],
  ["4", "SYSTEM",    "exam invitation if passed",           "BATCH_READY in exam-engine"],
  ["5", "CANDIDATE", "takes timed exam (5 questions)",     "MCQ instant + SA via Ollama"],
  ["6", "RECRUITER", "reviews ranked applications",         "Records SELECTED/REJECTED"],
  ["7", "SYSTEM",    "generates XAI PDF in background",    "LIME + LLM justification"],
  ["8", "BOTH",      "download XAI PDF",                    "Full transparency"],
];

demo.forEach((row, i) => {
  const y = 1.05 + i * 0.5;
  // Step circle
  s.addShape(pres.shapes.OVAL, {
    x: 0.5, y, w: 0.35, h: 0.35,
    fill: { color: C.accent }, line: { color: C.accent, width: 0 }
  });
  s.addText(row[0], {
    x: 0.5, y, w: 0.35, h: 0.35,
    fontSize: 11, color: C.bg, bold: true, fontFace: FONT, align: "center", valign: "middle"
  });
  // Actor badge
  s.addShape(pres.shapes.RECTANGLE, {
    x: 1.0, y: y + 0.05, w: 1.5, h: 0.25,
    fill: { color: C.light }, line: { color: C.border, width: 0.5 }
  });
  s.addText(row[1], {
    x: 1.0, y: y + 0.05, w: 1.5, h: 0.25,
    fontSize: 10, color: C.accent, bold: true, fontFace: FONT, align: "center", valign: "middle"
  });
  // Action
  s.addText(row[2], {
    x: 2.65, y, w: 4, h: 0.35,
    fontSize: 12, color: C.text, fontFace: FONT, valign: "middle"
  });
  // Hint
  s.addText(row[3], {
    x: 6.7, y, w: 2.8, h: 0.35,
    fontSize: 10, color: C.muted, fontFace: FONT, italic: true, valign: "middle"
  });
});

// ═══════════════════════════════════════════════════════════
// 18 — TIMELINE
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
base(s, "Implementation Timeline", 18);

s.addText("13 sprints over 6 months · Dec 2025 → May 2026", {
  x: 0.5, y: 1.0, w: 9, h: 0.3,
  fontSize: 12, color: C.muted, fontFace: FONT, italic: true
});

// Phases
const phases = [
  { title: "Phase 1: Core Platform",    period: "Dec 2025 – Jan 2026", color: C.accent,
    items: "Sprint 1-4 · Spring Boot scaffold, JWT auth, Job CRUD, Application submit, V1-V5 migrations, Docker Compose" },
  { title: "Phase 2: AI Features",      period: "Feb – Mar 2026",       color: C.green,
    items: "Sprint 5-9 · SBERT scoring, Go exam engine, Ollama grading, LIME XAI, Bias detection, V6-V12 migrations" },
  { title: "Phase 3: Polish & Defense", period: "Apr – May 2026",       color: C.amber,
    items: "Sprint 10-13 · Admin panel, recruiter analytics, bug fixes, 215 test cases, full documentation" },
];

phases.forEach((ph, i) => {
  const y = 1.4 + i * 1.2;
  // Side bar
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y, w: 0.12, h: 1.0,
    fill: { color: ph.color }, line: { color: ph.color, width: 0 }
  });
  s.addText(ph.title, {
    x: 0.8, y, w: 5, h: 0.3,
    fontSize: 15, color: ph.color, bold: true, fontFace: FONT, valign: "top"
  });
  s.addText(ph.period, {
    x: 6.5, y, w: 3, h: 0.3,
    fontSize: 12, color: C.muted, fontFace: FONT, italic: true, valign: "top", align: "right"
  });
  s.addText(ph.items, {
    x: 0.8, y: y + 0.35, w: 8.7, h: 0.7,
    fontSize: 11, color: C.text, fontFace: FONT, valign: "top"
  });
});

s.addText("215 test cases executed · 148 hours estimated effort", {
  x: 0.5, y: 5.0, w: 9, h: 0.3,
  fontSize: 12, color: C.accent, bold: true, fontFace: FONT, align: "center"
});

// ═══════════════════════════════════════════════════════════
// 19 — TECHNICAL CHALLENGES
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
base(s, "Technical Challenges Resolved", 19);

const chRows = [
  [
    { text: "#",         options: { bold: true, color: C.bg, fill: { color: C.accent }, fontSize: 11, fontFace: FONT, align: "center" } },
    { text: "Challenge", options: { bold: true, color: C.bg, fill: { color: C.accent }, fontSize: 11, fontFace: FONT } },
    { text: "Root Cause",options: { bold: true, color: C.bg, fill: { color: C.accent }, fontSize: 11, fontFace: FONT } },
    { text: "Solution",  options: { bold: true, color: C.bg, fill: { color: C.accent }, fontSize: 11, fontFace: FONT } },
  ],
  [
    { text: "1", options: { fontSize: 10, align: "center", fontFace: FONT } },
    { text: "JWT rejected by exam-engine", options: { fontSize: 10, fontFace: FONT } },
    { text: "Go only handled HS256; Spring signs HS512", options: { fontSize: 10, fontFace: FONT } },
    { text: "Added HS512 case with sha512.New", options: { fontSize: 10, fontFace: FONT } },
  ],
  [
    { text: "2", options: { fontSize: 10, align: "center", fill: { color: C.light }, fontFace: FONT } },
    { text: "HTTP/2 upgrade rejected", options: { fontSize: 10, fill: { color: C.light }, fontFace: FONT } },
    { text: "Spring default client tried h2, uvicorn rejects", options: { fontSize: 10, fill: { color: C.light }, fontFace: FONT } },
    { text: "JdkClientHttpRequestFactory + HTTP_1_1", options: { fontSize: 10, fill: { color: C.light }, fontFace: FONT } },
  ],
  [
    { text: "3", options: { fontSize: 10, align: "center", fontFace: FONT } },
    { text: "Grading race condition", options: { fontSize: 10, fontFace: FONT } },
    { text: "Two goroutines independently published callback", options: { fontSize: 10, fontFace: FONT } },
    { text: "WaitGroup → single atomic update + publish", options: { fontSize: 10, fontFace: FONT } },
  ],
  [
    { text: "4", options: { fontSize: 10, align: "center", fill: { color: C.light }, fontFace: FONT } },
    { text: "Optimistic lock on XAI save", options: { fontSize: 10, fill: { color: C.light }, fontFace: FONT } },
    { text: "Async thread had stale entity version", options: { fontSize: 10, fill: { color: C.light }, fontFace: FONT } },
    { text: "Native @Modifying @Query bypasses JPA", options: { fontSize: 10, fill: { color: C.light }, fontFace: FONT } },
  ],
  [
    { text: "5", options: { fontSize: 10, align: "center", fontFace: FONT } },
    { text: "PDF returned 57 bytes", options: { fontSize: 10, fontFace: FONT } },
    { text: "UrlResource didn't proxy FastAPI stream", options: { fontSize: 10, fontFace: FONT } },
    { text: "RestClient download → ByteArrayResource", options: { fontSize: 10, fontFace: FONT } },
  ],
  [
    { text: "6", options: { fontSize: 10, align: "center", fill: { color: C.light }, fontFace: FONT } },
    { text: "LazyInitializationException", options: { fontSize: 10, fill: { color: C.light }, fontFace: FONT } },
    { text: "@Async ran outside Hibernate session", options: { fontSize: 10, fill: { color: C.light }, fontFace: FONT } },
    { text: "Added @Transactional to buildAndStore()", options: { fontSize: 10, fill: { color: C.light }, fontFace: FONT } },
  ],
];

s.addTable(chRows, {
  x: 0.4, y: 1.05, w: 9.2,
  colW: [0.4, 2.4, 3.4, 3.0],
  border: { pt: 0.5, color: C.border },
  rowH: [0.36, 0.48, 0.48, 0.48, 0.48, 0.48, 0.48],
});

s.addText("Every fix was a distributed-systems problem in disguise.", {
  x: 0.5, y: 4.9, w: 9, h: 0.3,
  fontSize: 12, color: C.accent, bold: true, italic: true, fontFace: FONT, align: "center"
});

// ═══════════════════════════════════════════════════════════
// 20 — TEST RESULTS: AI ACCURACY
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
base(s, "Test Results — AI Accuracy Validation", 20);

const aiRows = [
  [
    { text: "AI Validation Metric", options: { bold: true, color: C.bg, fill: { color: C.accent }, fontSize: 12, fontFace: FONT } },
    { text: "Result",                options: { bold: true, color: C.bg, fill: { color: C.accent }, fontSize: 12, fontFace: FONT, align: "center" } },
    { text: "Status",                options: { bold: true, color: C.bg, fill: { color: C.accent }, fontSize: 12, fontFace: FONT, align: "center" } },
  ],
  [
    { text: "CV Relevance Scoring (SBERT cosine)", options: { fontSize: 11, fontFace: FONT } },
    { text: "0.72 (relevant) vs 0.21 (off-topic)", options: { fontSize: 11, fontFace: FONT, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, align: "center" } },
  ],
  [
    { text: "Hard Filter Decision Accuracy", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light } } },
    { text: "Correctly gates exam access at threshold 0.35", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light }, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, fill: { color: C.light }, align: "center" } },
  ],
  [
    { text: "MCQ Grading Accuracy", options: { fontSize: 11, fontFace: FONT } },
    { text: "100% (deterministic string match)", options: { fontSize: 11, fontFace: FONT, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, align: "center" } },
  ],
  [
    { text: "Short-Answer Grading (SBERT + Ollama)", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light } } },
    { text: "Hybrid α=0.6: agreement with human grader on sample set", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light }, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, fill: { color: C.light }, align: "center" } },
  ],
  [
    { text: "LIME Attribution Stability", options: { fontSize: 11, fontFace: FONT } },
    { text: "300 samples → consistent top-10 keywords across runs", options: { fontSize: 11, fontFace: FONT, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, align: "center" } },
  ],
  [
    { text: "Bias Detection (gendered terms)", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light } } },
    { text: "Flagged \"rockstar\", \"ninja\", \"aggressive\" correctly", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light }, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, fill: { color: C.light }, align: "center" } },
  ],
  [
    { text: "XAI PDF Generation", options: { fontSize: 11, fontFace: FONT } },
    { text: "38KB PDF with attribution chart + justification", options: { fontSize: 11, fontFace: FONT, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, align: "center" } },
  ],
];

s.addTable(aiRows, {
  x: 0.4, y: 1.05, w: 9.2,
  colW: [3.4, 4.4, 1.4],
  border: { pt: 0.5, color: C.border },
  rowH: 0.42,
});

s.addText("All 7 AI validation tests: PASS", {
  x: 0.5, y: 4.7, w: 9, h: 0.3,
  fontSize: 13, color: C.green, bold: true, fontFace: FONT, align: "center"
});

// ═══════════════════════════════════════════════════════════
// 21 — TEST RESULTS: PERFORMANCE
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
base(s, "Test Results — Performance Validation", 21);

const perfRows = [
  [
    { text: "Performance Metric", options: { bold: true, color: C.bg, fill: { color: C.accent }, fontSize: 12, fontFace: FONT } },
    { text: "Measured",           options: { bold: true, color: C.bg, fill: { color: C.accent }, fontSize: 12, fontFace: FONT, align: "center" } },
    { text: "Target",             options: { bold: true, color: C.bg, fill: { color: C.accent }, fontSize: 12, fontFace: FONT, align: "center" } },
    { text: "Status",             options: { bold: true, color: C.bg, fill: { color: C.accent }, fontSize: 12, fontFace: FONT, align: "center" } },
  ],
  [
    { text: "CV Scoring (SBERT encode + cosine)", options: { fontSize: 11, fontFace: FONT } },
    { text: "~80 ms", options: { fontSize: 11, fontFace: FONT, align: "center" } },
    { text: "< 200 ms", options: { fontSize: 11, fontFace: FONT, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, align: "center" } },
  ],
  [
    { text: "API Response (95th percentile)", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light } } },
    { text: "< 400 ms", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light }, align: "center" } },
    { text: "< 500 ms", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light }, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, fill: { color: C.light }, align: "center" } },
  ],
  [
    { text: "Frontend Page Load (Next.js SSR)", options: { fontSize: 11, fontFace: FONT } },
    { text: "1.2 – 1.8 s", options: { fontSize: 11, fontFace: FONT, align: "center" } },
    { text: "< 2 s", options: { fontSize: 11, fontFace: FONT, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, align: "center" } },
  ],
  [
    { text: "LIME Attribution (300 samples)", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light } } },
    { text: "4 – 8 s", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light }, align: "center" } },
    { text: "< 15 s", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light }, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, fill: { color: C.light }, align: "center" } },
  ],
  [
    { text: "Short-Answer Grading (Ollama)", options: { fontSize: 11, fontFace: FONT } },
    { text: "2 – 5 s / question", options: { fontSize: 11, fontFace: FONT, align: "center" } },
    { text: "< 8 s", options: { fontSize: 11, fontFace: FONT, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, align: "center" } },
  ],
  [
    { text: "PDF Generation (ReportLab)", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light } } },
    { text: "~1 s", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light }, align: "center" } },
    { text: "< 3 s", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light }, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, fill: { color: C.light }, align: "center" } },
  ],
  [
    { text: "Concurrent Exam Sessions", options: { fontSize: 11, fontFace: FONT } },
    { text: "50+ verified (Redis-backed)", options: { fontSize: 11, fontFace: FONT, align: "center" } },
    { text: "50+", options: { fontSize: 11, fontFace: FONT, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, align: "center" } },
  ],
  [
    { text: "DB Query (HikariCP pool=20)", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light } } },
    { text: "Optimized (indexed)", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light }, align: "center" } },
    { text: "Stable", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light }, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, fill: { color: C.light }, align: "center" } },
  ],
];

s.addTable(perfRows, {
  x: 0.4, y: 1.05, w: 9.2,
  colW: [3.6, 2.4, 1.8, 1.4],
  border: { pt: 0.5, color: C.border },
  rowH: 0.38,
});

s.addText("Hardware: i7 dev laptop, 16 GB RAM, CPU-only inference", {
  x: 0.5, y: 4.95, w: 9, h: 0.25,
  fontSize: 11, color: C.muted, italic: true, fontFace: FONT, align: "center"
});

// ═══════════════════════════════════════════════════════════
// 22 — TEST RESULTS: SECURITY
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
base(s, "Test Results — Security Validation", 22);

const secRows = [
  [
    { text: "Security Test",   options: { bold: true, color: C.bg, fill: { color: C.accent }, fontSize: 12, fontFace: FONT } },
    { text: "Result",          options: { bold: true, color: C.bg, fill: { color: C.accent }, fontSize: 12, fontFace: FONT, align: "center" } },
    { text: "Status",          options: { bold: true, color: C.bg, fill: { color: C.accent }, fontSize: 12, fontFace: FONT, align: "center" } },
  ],
  [
    { text: "Password Hashing (BCrypt round=10)", options: { fontSize: 11, fontFace: FONT } },
    { text: "Verified — passwords never stored in plain text", options: { fontSize: 11, fontFace: FONT, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, align: "center" } },
  ],
  [
    { text: "JWT Validation (HS512)", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light } } },
    { text: "Forged token rejected; tampered signature → 401", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light }, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, fill: { color: C.light }, align: "center" } },
  ],
  [
    { text: "Unauthorized Access (RBAC matrix)", options: { fontSize: 11, fontFace: FONT } },
    { text: "All wrong-role calls → 403 (tested across roles)", options: { fontSize: 11, fontFace: FONT, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, align: "center" } },
  ],
  [
    { text: "SQL Injection Protection", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light } } },
    { text: "Spring Data JPA parameterized queries; no raw SQL with input", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light }, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, fill: { color: C.light }, align: "center" } },
  ],
  [
    { text: "XSS Protection (React JSX escape)", options: { fontSize: 11, fontFace: FONT } },
    { text: "User input escaped by default; no dangerouslySetInnerHTML", options: { fontSize: 11, fontFace: FONT, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, align: "center" } },
  ],
  [
    { text: "Internal API Key Protection", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light } } },
    { text: "Missing/wrong header → 403 on all internal endpoints", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light }, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, fill: { color: C.light }, align: "center" } },
  ],
  [
    { text: "Session Management (Redis-backed)", options: { fontSize: 11, fontFace: FONT } },
    { text: "Stateless JWT + Redis lockout; TTL enforced", options: { fontSize: 11, fontFace: FONT, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, align: "center" } },
  ],
  [
    { text: "Brute-Force Lockout", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light } } },
    { text: "5 failed attempts → 15-min Redis block", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light }, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, fill: { color: C.light }, align: "center" } },
  ],
];

s.addTable(secRows, {
  x: 0.4, y: 1.05, w: 9.2,
  colW: [3.2, 4.6, 1.4],
  border: { pt: 0.5, color: C.border },
  rowH: 0.42,
});

s.addText("Secrets in .env (gitignored); internal services on Docker network only.", {
  x: 0.5, y: 5.0, w: 9, h: 0.25,
  fontSize: 11, color: C.muted, italic: true, fontFace: FONT, align: "center"
});

// ═══════════════════════════════════════════════════════════
// 23 — TEST RESULTS: INTEGRATION
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
base(s, "Test Results — Integration Testing", 23);

const intRows = [
  [
    { text: "Component Tested", options: { bold: true, color: C.bg, fill: { color: C.accent }, fontSize: 12, fontFace: FONT } },
    { text: "Scope",            options: { bold: true, color: C.bg, fill: { color: C.accent }, fontSize: 12, fontFace: FONT, align: "center" } },
    { text: "Status",           options: { bold: true, color: C.bg, fill: { color: C.accent }, fontSize: 12, fontFace: FONT, align: "center" } },
  ],
  [
    { text: "Frontend ↔ Backend", options: { fontSize: 11, fontFace: FONT } },
    { text: "All 25 pages wired to real API; JWT round-trip works", options: { fontSize: 11, fontFace: FONT, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, align: "center" } },
  ],
  [
    { text: "Authentication & Authorization", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light } } },
    { text: "Register → OTP → Login → role-routed; refresh persists", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light }, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, fill: { color: C.light }, align: "center" } },
  ],
  [
    { text: "AI Resume Screening Engine", options: { fontSize: 11, fontFace: FONT } },
    { text: "Spring → AI Service /score-cv; async update on application", options: { fontSize: 11, fontFace: FONT, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, align: "center" } },
  ],
  [
    { text: "Job Posting Module", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light } } },
    { text: "Full CRUD + status lifecycle (DRAFT→OPEN→CLOSED) verified", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light }, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, fill: { color: C.light }, align: "center" } },
  ],
  [
    { text: "Applicant Tracking (Pipeline)", options: { fontSize: 11, fontFace: FONT } },
    { text: "10-state lifecycle; Kanban drag-drop updates DB", options: { fontSize: 11, fontFace: FONT, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, align: "center" } },
  ],
  [
    { text: "Exam Engine ↔ AI Service", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light } } },
    { text: "Short-answer grading: parallel goroutines, single callback", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light }, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, fill: { color: C.light }, align: "center" } },
  ],
  [
    { text: "Database Connectivity", options: { fontSize: 11, fontFace: FONT } },
    { text: "Flyway V1–V12 all run; HikariCP pool stable; Redis cache hits", options: { fontSize: 11, fontFace: FONT, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, align: "center" } },
  ],
  [
    { text: "Email Notification Service", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light } } },
    { text: "OTP delivery via Gmail SMTP; async, non-blocking", options: { fontSize: 11, fontFace: FONT, fill: { color: C.light }, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, fill: { color: C.light }, align: "center" } },
  ],
  [
    { text: "Internal API Integrations (3 services)", options: { fontSize: 11, fontFace: FONT } },
    { text: "Spring↔AI, Spring↔Exam, Exam↔AI: all via X-Internal-Api-Key", options: { fontSize: 11, fontFace: FONT, align: "center" } },
    { text: "Pass", options: { fontSize: 11, fontFace: FONT, color: C.green, bold: true, align: "center" } },
  ],
];

s.addTable(intRows, {
  x: 0.4, y: 1.05, w: 9.2,
  colW: [3.0, 4.8, 1.4],
  border: { pt: 0.5, color: C.border },
  rowH: 0.38,
});

s.addText("9 / 9 integration scenarios: PASS  ·  Total test cases executed: 215", {
  x: 0.5, y: 4.95, w: 9, h: 0.3,
  fontSize: 12, color: C.accent, bold: true, fontFace: FONT, align: "center"
});

// ═══════════════════════════════════════════════════════════
// 24 — LIMITATIONS
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
base(s, "Limitations", 24);

const lims = [
  { t: "Ollama Grading Quality",
    d: "llama3.2 local model; accuracy not formally benchmarked against larger LLMs (GPT-4)." },
  { t: "No Stress Load Testing",
    d: "Concurrent exam sessions tested to 50+; production-grade load test not performed." },
  { t: "CV Text Extraction",
    d: "pdfminer.six requires text-layer PDFs; scanned/image-only CVs unsupported." },
  { t: "LIME Sample Size",
    d: "300 samples balances speed (4–8s) vs stability; 2000+ would be more stable but slower." },
  { t: "Manual Threshold Calibration",
    d: "Hard-filter threshold (0.35) tuned on small sample; needs production data for ROC tuning." },
  { t: "Single-Tenant Only",
    d: "No multi-tenant isolation; one institution per deployment." },
];

lims.forEach((l, i) => {
  const y = 1.05 + i * 0.7;
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y, w: 0.1, h: 0.55,
    fill: { color: C.amber }, line: { color: C.amber, width: 0 }
  });
  s.addText(l.t, {
    x: 0.75, y, w: 3.0, h: 0.55,
    fontSize: 13, color: C.text, bold: true, fontFace: FONT, valign: "middle"
  });
  s.addText(l.d, {
    x: 3.85, y, w: 5.7, h: 0.55,
    fontSize: 11, color: C.muted, fontFace: FONT, valign: "middle"
  });
});

// ═══════════════════════════════════════════════════════════
// 25 — FUTURE WORK
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
base(s, "Future Work", 25);

const fw = [
  ["Fine-tuned Grading Model",     "Domain-specific aviation Q&A dataset to fine-tune SBERT/Ollama"],
  ["Video Interview Module",       "Asynchronous video Q&A with sentiment + content analysis"],
  ["Threshold A/B Testing",        "Data-driven calibration of hard-filter and bias thresholds"],
  ["Kubernetes Deployment",        "Horizontal autoscaling per service; production-grade observability"],
  ["Candidate Mobile App",         "React Native — improve accessibility for low-end devices"],
  ["GDPR Audit & Export",          "Full audit log export + candidate right-to-be-forgotten flow"],
  ["Multi-Tenant SaaS",            "Tenant isolation (schema-per-tenant), per-tenant billing"],
  ["LLM Bias Audit",               "Periodic adversarial testing against known biased datasets"],
];

fw.forEach((row, i) => {
  const col = i % 2;
  const r   = Math.floor(i / 2);
  const x = 0.5 + col * 4.5;
  const y = 1.15 + r * 1.0;
  s.addShape(pres.shapes.RECTANGLE, {
    x, y, w: 4.3, h: 0.85,
    fill: { color: C.light }, line: { color: C.accent, width: 1 }
  });
  s.addText(row[0], {
    x: x + 0.15, y: y + 0.05, w: 4.0, h: 0.3,
    fontSize: 13, color: C.accent, bold: true, fontFace: FONT
  });
  s.addText(row[1], {
    x: x + 0.15, y: y + 0.35, w: 4.0, h: 0.5,
    fontSize: 10, color: C.muted, fontFace: FONT, valign: "top"
  });
});

// ═══════════════════════════════════════════════════════════
// 26 — LESSONS LEARNED
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
base(s, "Lessons Learned", 26);

const lessons = [
  { c: C.accent, t: "Distributed > Algorithmic",
    d: "Most production bugs were not in AI logic — they were in service coordination (race conditions, async transactions, protocol negotiation, version mismatches)." },
  { c: C.green, t: "Explainability is Architectural",
    d: "XAI cannot be bolted on. Async pipeline, native SQL bypass, ByteArrayResource proxy — every choice was driven by the goal of fast UX + correct attribution." },
  { c: C.amber, t: "Local LLMs Have Trade-offs",
    d: "Ollama gave us data sovereignty but inconsistent grading. Hybrid SBERT+LLM (α=0.6) was the practical compromise — deterministic floor + LLM signal." },
  { c: C.red,   t: "Concurrency is the Hardest Part",
    d: "Race condition fix took 2 days to diagnose; 30 lines to fix. WaitGroup pattern (collect-then-publish) is now our default for any goroutine-fan-out work." },
];

lessons.forEach((l, i) => {
  const y = 1.05 + i * 1.05;
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y, w: 0.15, h: 0.9,
    fill: { color: l.c }, line: { color: l.c, width: 0 }
  });
  s.addText(l.t, {
    x: 0.8, y, w: 8.7, h: 0.35,
    fontSize: 15, color: l.c, bold: true, fontFace: FONT
  });
  s.addText(l.d, {
    x: 0.8, y: y + 0.35, w: 8.7, h: 0.6,
    fontSize: 12, color: C.text, fontFace: FONT, valign: "top"
  });
});

// ═══════════════════════════════════════════════════════════
// 27 — CONCLUSION
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
base(s, "Conclusion", 27);

s.addText("What We Delivered", {
  x: 0.5, y: 1.05, w: 9, h: 0.4,
  fontSize: 18, color: C.accent, bold: true, fontFace: FONT
});

const dels = [
  "Full recruitment pipeline — job posting to hired/rejected decision",
  "AI-powered CV screening — semantic similarity, not keyword matching",
  "Fair standardized exam engine — timed, randomized, AI-graded",
  "Explainable decisions — LIME attribution PDF, EU AI Act aligned",
  "Bias prevention — proactive analysis at job creation",
  "Microservice architecture — independent scale, language match per task",
  "Security — JWT HS512, RBAC, internal API key isolation",
];

dels.forEach((d, i) => {
  const y = 1.55 + i * 0.32;
  s.addText("✓", {
    x: 0.6, y, w: 0.35, h: 0.3,
    fontSize: 14, color: C.green, bold: true, fontFace: FONT
  });
  s.addText(d, {
    x: 1.0, y, w: 8.5, h: 0.3,
    fontSize: 13, color: C.text, fontFace: FONT, valign: "middle"
  });
});

s.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 3.95, w: 9, h: 1.0,
  fill: { color: C.accentLt }, line: { color: C.accent, width: 0 }
});
s.addText("The hardest part wasn't the AI — it was making 5 distributed services behave reliably under async, concurrent, and failure conditions.", {
  x: 0.7, y: 4.0, w: 8.6, h: 0.9,
  fontSize: 13, color: C.accent, italic: true, fontFace: FONT, valign: "middle", bold: true
});

// ═══════════════════════════════════════════════════════════
// 28 — THANK YOU / Q&A
// ═══════════════════════════════════════════════════════════
s = pres.addSlide(); s.background = { color: C.bg };
s.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 0.3, h: 5.625, fill: { color: C.accent }, line: { color: C.accent, width: 0 }
});

s.addText("Thank You", {
  x: 0.8, y: 1.4, w: 8.5, h: 1.0,
  fontSize: 56, color: C.text, bold: true, fontFace: FONT
});
s.addShape(pres.shapes.LINE, {
  x: 0.8, y: 2.5, w: 1.2, h: 0,
  line: { color: C.accent, width: 2 }
});
s.addText("Questions?", {
  x: 0.8, y: 2.65, w: 8.5, h: 0.6,
  fontSize: 32, color: C.accent, fontFace: FONT
});

s.addText("Repository  ·  github.com/hopeIsCo0l/eaa-recruit", {
  x: 0.8, y: 4.3, w: 8.5, h: 0.3,
  fontSize: 14, color: C.muted, fontFace: FONT
});
s.addText("EAA-Recruit — AI-Powered Recruitment Platform", {
  x: 0.8, y: 4.65, w: 8.5, h: 0.3,
  fontSize: 12, color: C.muted, fontFace: FONT, italic: true
});

// ─── Generate ───
pres.writeFile({ fileName: "D:\\EAA-recruit\\EAA-Recruit-Defense-30min.pptx" })
  .then(f => console.log("✅ Generated:", f))
  .catch(err => console.error("❌ Error:", err));
