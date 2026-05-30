---
marp: true
theme: default
paginate: true
backgroundColor: #ffffff
color: #1a1a2e
style: |
  section {
    font-family: 'Segoe UI', sans-serif;
    font-size: 22px;
  }
  h1 {
    color: #1a237e;
    font-size: 42px;
    border-bottom: 3px solid #1565c0;
    padding-bottom: 8px;
  }
  h2 {
    color: #1565c0;
    font-size: 32px;
  }
  h3 {
    color: #0d47a1;
  }
  code {
    background: #e8eaf6;
    color: #1a237e;
    padding: 2px 6px;
    border-radius: 4px;
  }
  pre code {
    background: #1a1a2e;
    color: #e8eaf6;
  }
  .columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
  table {
    font-size: 18px;
  }
  th {
    background: #1565c0;
    color: white;
  }
  blockquote {
    border-left: 4px solid #1565c0;
    background: #e3f2fd;
    padding: 8px 16px;
    color: #0d47a1;
  }
---

# EAA-Recruit
## AI-Powered Recruitment Platform

**Final Year Project Defense**

*Intelligent CV Screening · Adaptive Exam Engine · Explainable AI Reports*

---

# Problem Statement

> Traditional recruitment is **slow**, **biased**, and **opaque** — recruiters spend 80% of their time on manual CV screening with no accountability trail.

### What's broken today

- Manual CV review: ~6 minutes per resume, 250+ applicants per role
- No standardized skill assessment tied to the role
- AI-assisted tools are **black boxes** — candidates never know why they were rejected
- Scheduling chaos: interviews booked through email threads

### What we built

An end-to-end platform that **automates screening**, **examines candidates fairly**, and **explains every decision** with LIME-backed evidence.

---

# System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js 14                           │
│              Recruiter Dashboard · Candidate Portal         │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS + JWT (HS512)
┌──────────────────────────▼──────────────────────────────────┐
│               Spring Boot 3.x  (Core API)                   │
│   Auth · Jobs · Applications · Interviews · Decisions        │
└───────┬───────────────────┬────────────────┬────────────────┘
        │ REST + API Key    │ REST + API Key │ REST + API Key
┌───────▼──────┐   ┌────────▼───────┐   ┌───▼──────────────┐
│  AI Service  │   │  Exam Engine   │   │  PostgreSQL 16   │
│  FastAPI/Py  │   │  Go + Gin      │   │  + Flyway        │
│  SBERT+Ollama│   │  Redis Sessions│   └──────────────────┘
└──────────────┘   └────────────────┘
```

**5 services** · **Docker Compose** · **HTTP/1.1 enforced** inter-service

---

# Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind | SSR, type safety |
| Backend | Spring Boot 3, Java 21 | Mature ecosystem, transactions |
| AI Service | FastAPI, Python 3.11 | ML library ecosystem |
| Exam Engine | Go 1.22, Gin | Goroutine concurrency |
| Embeddings | SBERT `all-MiniLM-L6-v2` | Fast, lightweight semantic model |
| LLM Grading | Ollama `llama3.2` | Local, no API cost |
| XAI | LIME (`lime` library) | Model-agnostic attribution |
| Database | PostgreSQL 16, Flyway | ACID, versioned migrations |
| Sessions | Redis 7 | Sub-ms exam state |
| Auth | JWT HS512, RBAC | 4 roles: ADMIN/RECRUITER/CANDIDATE/INTERVIEWER |

---

# Module 1 — CV Scoring (AI Service)

### Pipeline

```
CV Text (PDF extracted)
      │
      ▼
SBERT Encoder → 384-dim embedding vector
      │
      ▼
Job Description → SBERT Encoder → 384-dim embedding vector
      │
      ▼
Cosine Similarity → score ∈ [0, 1]
      │
      ▼
Hard Filter (threshold configurable, e.g. 0.35)
      │
 PASS / FAIL → stored on Application entity
```

- **Model:** `sentence-transformers/all-MiniLM-L6-v2` (22M params, ~80ms/call)
- **Hard filter:** configurable per-job threshold; fail = no exam invitation
- **Score stored:** `cv_relevance_score` on `applications` table (0–1)

---

# Module 2 — Exam Engine (Go Microservice)

### State Machine

```
BATCH_READY
    │  Spring calls /internal/exams/batch-ready
    ▼
PENDING → candidate hits "Start Exam"
    │  POST /exams/start  (JWT authenticated)
    ▼
IN_PROGRESS
    │  GET /exams/next-question  (served from Redis, timed)
    │  POST /exams/submit-answer (per question)
    ▼
SUBMITTED → grading begins
    │
    ├── MCQ: instant scoring (exam-engine, no AI call)
    └── SHORT_ANSWER: async goroutine pool → ai-service /grade-answer
    ▼
COMPLETED → Spring callback → DB updated
```

- **Redis:** session state, question schedule, authorized candidates
- **Concurrency:** one goroutine per short-answer question, `WaitGroup` synchronizes

---

# Module 3 — Short-Answer Grading Deep Dive

### The Race Condition We Solved

**Before (broken):**
```
goroutine 1: read session → add 17.5 → publish exam-completed ✓
goroutine 2: read session → add 7.6  → publish exam-completed ✗ (duplicate, ignored)
```
Final score in DB: **17.5** — wrong, missing second answer's score.

**After (fixed):**
```go
type shortAnswerTask struct {
    question domain.Question
    answer   string
}

// WaitGroup collects ALL results first
var wg sync.WaitGroup
var mu sync.Mutex
results := map[string]float64{}

// THEN single atomic update + single callback
g.finalizeSession(session, results)
g.springClient.PublishExamCompleted(session)  // called exactly once
```
Final score: **sum of all answers**, single callback, no duplicates.

---

# Module 4 — XAI Report (Explainable AI)

### Why Explainability Matters

EU AI Act (2024) mandates that automated hiring decisions be **explainable** to candidates.

### How LIME Works Here

```
CV Text
  │
  ├── Mask random words (300 samples)
  ├── Score each variant with SBERT
  ├── Fit linear model on perturbations
  └── Extract top feature weights
        │
        ▼
  { "python": +0.42, "leadership": +0.31, "java": +0.18, ... }
```

### Report Output (PDF)
1. **Score breakdown** — CV score, exam score, final score
2. **Attribution bar chart** — top 10 CV keywords by impact
3. **LLM justification** — Ollama generates 3-paragraph explanation
4. **Hard filter status** — pass/fail with threshold context

---

# Module 5 — XAI Delivery Pipeline

```
Recruiter records decision
        │
        ▼ (async @Async, non-blocking)
XaiReportClient.buildAndStore(applicationId)
        │
        ▼ HTTP/1.1 POST /api/v1/xai/report
    ai-service
        │ LIME → PDF → stored as {appId}_feedback.pdf
        ▼
    downloadUrl returned
        │
        ▼ native SQL UPDATE (bypasses JPA optimistic lock)
applicationRepository.updateXaiReportUrl(id, url)
        │
        ▼ Recruiter / Candidate fetches
GET /api/feedback/{appId}/xai-report (Spring)
        │ ByteArrayResource proxy (not redirect)
        ▼
    PDF streamed to browser
```

Recruiter's decision response is **instant** — XAI takes 5–15s in background.

---

# Security Architecture

### User-Facing Auth
- **JWT HS512** signed by Spring, verified by exam-engine (dual HS256/HS512 support)
- **4 roles:** `SUPER_ADMIN · RECRUITER · CANDIDATE · INTERVIEWER`
- Role-scoped endpoints: `@IsRecruiter`, `@IsCandidate`, `@IsAuthenticated`

### Service-to-Service Auth
```
Spring → ai-service:     X-Internal-Api-Key header
Spring → exam-engine:    X-Internal-Api-Key header
exam-engine → ai-service: X-Internal-Api-Key header
```
Internal key never exposed to frontend. JWT never shared between services.

### Data Isolation
- Recruiter sees only their own jobs' applications
- Candidate accesses only their own applications/exams
- XAI report: both recruiter (owns job) and candidate (owns application) can access

---

# Database Design Highlights

### Schema (12 Flyway migrations)

```
users ──< jobs ──< applications ──< exam_sessions
                       │
                       ├── cv_relevance_score (FLOAT)
                       ├── exam_score (FLOAT, 0-100)
                       ├── final_score (FLOAT, 0-100)
                       ├── hard_filter_passed (BOOLEAN)
                       ├── xai_report_url (TEXT)
                       └── decision_notes (TEXT)

questions (per job)
  ├── type: MCQ | SHORT_ANSWER
  ├── correct_answer
  └── ideal_answer (TEXT) ← added V12, used by LIME grader
```

- **Optimistic locking** on `applications` (`@Version`) — bypassed for async XAI update via native `UPDATE` query
- **Flyway:** migrations run at startup, tracked in `flyway_schema_history`

---

# Key Technical Challenges

| # | Challenge | Root Cause | Solution |
|---|---|---|---|
| 1 | JWT rejected by exam-engine | Go auth only handled HS256; Spring signs HS512 | Added HS512 case with `sha512.New` in switch |
| 2 | HTTP/2 upgrade rejected | Spring default client tried h2, uvicorn rejected | `JdkClientHttpRequestFactory` + `HTTP_1_1` |
| 3 | Grading race condition | Two goroutines independently published callback | `WaitGroup` → single atomic update + publish |
| 4 | Optimistic lock on XAI save | Async thread had stale entity version | Native `@Modifying @Query` bypasses JPA versioning |
| 5 | PDF returned 57 bytes | `UrlResource` didn't proxy FastAPI stream | `RestClient` download → `ByteArrayResource` |
| 6 | `LazyInitializationException` in async | `@Async` ran outside Hibernate session | Added `@Transactional` to `buildAndStore()` |

---

# Bias Detection Module

### Problem
Job descriptions often contain **gendered or exclusionary language** that discourages diverse applicants before they even apply.

### Our Approach
```
POST /api/v1/bias/analyze
  { "jobDescription": "..." }

Response:
  {
    "biasScore": 0.72,
    "flaggedTerms": ["rockstar", "ninja", "aggressive"],
    "suggestions": ["high performer", "expert", "results-driven"],
    "categories": ["gendered_language", "culture_fit_bias"]
  }
```

- Runs **at job creation time** — recruiter sees warning before posting
- Flagged terms highlighted in UI with suggested alternatives
- Score threshold configurable by admin

---

# End-to-End Demo Flow

```
1. ADMIN creates recruiter account
         │
2. RECRUITER creates job posting
   └── Bias analysis runs automatically
         │
3. CANDIDATE registers + uploads CV (PDF)
   └── SBERT scoring runs → hard filter check
         │
4. If PASSED → exam invitation sent
   └── exam-engine: BATCH_READY
         │
5. CANDIDATE starts exam (timed questions)
   └── MCQ: instant score
   └── SHORT_ANSWER: Ollama grades against ideal_answer
         │
6. RECRUITER sees ranked applications dashboard
   └── Records decision + notes
         │
7. XAI PDF generated (async, LIME attribution)
   └── Recruiter downloads — sees why candidate scored X
   └── Candidate downloads — transparent decision explanation
```

---

# Results & Validation

### What We Tested (End-to-End)

| Scenario | Result |
|---|---|
| CV scoring: relevant CV vs off-topic | Cosine sim correctly ranked (0.72 vs 0.21) |
| Hard filter: score below threshold | Rejected before exam — correct |
| MCQ exam: 3 correct / 5 total | Score 60% — correct |
| SA grading: both answers graded | WaitGroup fix: single callback, correct sum |
| XAI report: PDF generated | 38KB PDF, LIME attribution chart rendered |
| XAI download: recruiter proxied | ByteArrayResource: full PDF, no truncation |
| Auth: HS512 JWT in exam-engine | HS512 case added — verified working |
| Concurrent short-answer grading | Race condition fixed — deterministic result |

### Performance (local dev hardware)
- CV scoring: ~80ms per application
- LIME attribution: ~4–8s (300 samples)
- Short-answer grading: ~2–5s per question (Ollama)
- PDF generation: ~1s

---

# Limitations & Future Work

### Current Limitations
- **Ollama grading quality** — `llama3.2` local model; accuracy not formally benchmarked
- **No load testing** — concurrent exam sessions not stress-tested
- **CV parsing** — text extraction depends on PDF structure; scanned CVs unsupported
- **LIME samples** — 300 samples is fast but less stable than 2000+ for production

### Future Work
| Feature | Value |
|---|---|
| Fine-tuned grading model | Domain-specific scoring accuracy |
| Video interview integration | Asynchronous interview module |
| A/B bias threshold testing | Data-driven threshold calibration |
| Kubernetes deployment | Horizontal scale per service |
| Candidate mobile app | Better accessibility |
| Audit log & GDPR export | Compliance module |

---

# Conclusion

### What We Delivered

✅ **Full recruitment pipeline** — from job posting to hired/rejected decision
✅ **AI-powered CV screening** — semantic similarity, not keyword matching
✅ **Fair standardized assessment** — exam engine with anti-cheat (timed, randomized)
✅ **Explainable decisions** — LIME attribution PDF, EU AI Act aligned
✅ **Bias prevention** — proactive analysis at job creation
✅ **Microservice architecture** — each service scaled independently
✅ **Security** — JWT HS512, role-based, internal API key isolation

### Key Engineering Insight

> The hardest part wasn't the AI — it was making **5 distributed services behave reliably** under async, concurrent, and failure conditions. Every bug we fixed was a distributed systems problem in disguise.

---

# Thank You

## Questions?

**Repository:** `hopeIsCo0l/eaa-recruit`
**PR #207:** All exam engine + XAI changes

---

*Prepared for Final Year Project Defense*
*EAA-Recruit — AI-Powered Recruitment Platform*
