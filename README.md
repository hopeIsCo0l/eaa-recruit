# EAA Recruit

An AI-powered end-to-end recruitment platform for aviation roles. Candidates apply, sit a proctored exam, book an interview, and receive an explainable AI feedback report — all in one system.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Services](#services)
- [Tech Stack](#tech-stack)
- [Roles](#roles)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Scoring Formula](#scoring-formula)
- [Kafka Events](#kafka-events)

---

## Overview

EAA Recruit automates the full hiring pipeline:

1. **Job posting** — recruiters publish open positions with physical/academic requirements
2. **CV screening** — candidates upload a CV; SBERT cosine similarity scores it against the job description
3. **Hard filter** — SQL-based check against minimum height, weight, and degree (fast, no AI)
4. **Batch exam** — all shortlisted candidates in a job start simultaneously; the Go engine manages concurrent sessions in Redis
5. **Interview scheduling** — shortlisted candidates self-book from recruiter availability slots; double-booking prevented at DB level
6. **Final decision** — recruiter selects, rejects, or waitlists; an XAI PDF (SHAP/LIME + natural language) is generated in the background
7. **Candidate portal** — candidates track every stage and view their explainable AI feedback report

---

## Architecture

```
React Frontend (TypeScript + Vite)
        ↕ REST / Axios
Spring Boot — Core Orchestrator (Java 21, Gradle)
        ↕ Kafka events              ↕ REST callbacks
Go Exam Engine               Python AI Service (FastAPI)
        ↕ Redis                        ↕ Redis / ChromaDB
        └──────────── PostgreSQL ───────┘
```

Full diagrams (sequence, ER, Kafka topology, deployment) are in [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Services

### Spring Boot — Core Orchestrator (`/backend`)

The central API. Handles all business logic, auth, and orchestration.

- **Auth** — JWT stateless, BCrypt passwords, Redis-backed OTP, blocked-user check on every request
- **Jobs** — CRUD, status scheduler (OPEN → CLOSED → EXAM_SCHEDULED via cron)
- **Applications** — CV upload, hard filter, Kafka event dispatch, AI score ingestion, weighted final score
- **Exams** — question bank management, batch authorization, Go engine sync
- **Scheduling** — availability slot CRUD, interview booking with optimistic locking
- **Decisions** — SELECTED / REJECTED / WAITLISTED with audit trail
- **Admin** — user management, system health (DB + Redis + Kafka), AI model versioning, analytics export

### Go Exam Engine (`/exam-engine`)

Handles burst-concurrent exam sessions — all candidates in a batch start at the same time.

- Sessions stored as JSON in Redis (no in-memory Go state)
- Per-session `sync.Mutex` via `sync.Map` prevents race conditions
- `CountdownService` ticks every 10 s, auto-submits when time expires
- `HeartbeatMonitor` flags disconnected candidates; session remains resumable
- Goroutine `WorkerPool` grades short answers via the AI service asynchronously
- Rate limiting per candidate via Redis sliding counter
- Publishes `EXAM_COMPLETED` to Kafka with exponential-backoff retry

### Python AI Service (`/ai-service`)

All ML workloads. Runs as a FastAPI service; never blocks the main API path.

- **CV scoring** — PyMuPDF/python-docx extraction → PII masking → spaCy NLP → SBERT embedding → cosine similarity
- **Short-answer grading** — embedding cosine similarity against answer-key vectors
- **XAI** — SHAP/LIME feature attribution + Claude-powered natural language justification
- **Bias detection** — per-demographic audit of scoring distributions
- **PDF generation** — ReportLab report with charts and explanations
- Vector embeddings cached in Redis (1 h) and persisted in ChromaDB

### Observability

All three backend services emit **structured JSON logs** to stdout and propagate a `X-Correlation-ID` header across service boundaries:

- **Spring Boot** — `logstash-logback-encoder`, `CorrelationIdFilter` writes to MDC
- **Go Exam Engine** — `log/slog` JSON handler, `CorrelationID` Gin middleware
- **Python AI Service** — `python-json-logger`, FastAPI ASGI middleware

---

### React Frontend (`/frontend`)

Four role-specific portals behind a single protected shell.

| Role | Pages |
|------|-------|
| Candidate | Job board, CV upload, application timeline, timed exam, slot booking, results + XAI PDF viewer |
| Recruiter | Job creator, candidate ranking table, XAI side drawer, batch decisions, availability calendar |
| Admin | User management, system health dashboard, audit log, AI model versioning |
| Super Admin | All admin pages + AI model toggle |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4, Shadcn/UI, Zustand, react-hook-form + Zod, Axios |
| Backend | Spring Boot 3.2, Java 23, Gradle 8.13, Spring Security (JWT), Spring Cloud Stream (Kafka), Hibernate/JPA, Flyway |
| Exam Engine | Go 1.23, Gin, go-redis v9, IBM/sarama (Kafka) |
| AI Service | Python 3.11+, FastAPI, sentence-transformers (SBERT), SHAP, LIME, spaCy, PyMuPDF, ReportLab |
| Data | PostgreSQL 16, Redis 7 |
| Messaging | Apache Kafka |

---

## Roles

| Role | Description |
|------|-------------|
| `CANDIDATE` | Self-registers, applies to jobs, takes exams, books interviews, views results |
| `RECRUITER` | Posts jobs, manages applications, authorizes exam batches, sets availability, makes decisions |
| `ADMIN` | Creates/deactivates recruiter accounts, views audit logs and system health |
| `SUPER_ADMIN` | All admin access + AI model versioning and analytics export |

---

## Project Structure

```
eaa-recruit/
├── backend/                        # Spring Boot (Java 21)
│   ├── src/main/java/com/eaa/recruit/
│   │   ├── config/                 # Security, Kafka, Redis, XAI properties
│   │   ├── controller/             # REST controllers (Auth, Job, Application, Exam, Recruiter, Admin, Internal)
│   │   ├── dto/                    # Request/response DTOs
│   │   ├── entity/                 # JPA entities + BaseEntity
│   │   ├── messaging/              # Kafka publisher + event records
│   │   ├── repository/             # Spring Data JPA repositories
│   │   ├── scheduler/              # Job status + interview reminder schedulers
│   │   ├── security/               # JWT filter, UserDetailsService, RBAC annotations
│   │   └── service/                # Business logic
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/           # Flyway SQL migrations (V1–V7)
│
├── exam-engine/                    # Go (Gin)
│   ├── cmd/server/main.go          # Entry point, wires all services
│   ├── internal/
│   │   ├── config/                 # Env-based config struct
│   │   ├── domain/                 # ExamSession, Question types
│   │   ├── handlers/               # HTTP handlers (exam, heartbeat, health)
│   │   ├── middleware/             # JWT auth, rate limiter
│   │   └── services/               # Session, batch, countdown, grading, worker pool, Kafka
│   └── pkg/
│       ├── kafka/                  # Producer + consumer group factory
│       └── redis/                  # Client with connection pooling
│
├── ai-service/                     # Python (FastAPI)
│   ├── src/
│   │   ├── main.py                 # App factory, startup hooks
│   │   ├── config.py               # Pydantic settings
│   │   ├── routers/                # health, ranking, bias endpoints
│   │   ├── services/               # Embedding, scoring, grading, XAI, PDF, Kafka consumer
│   │   └── utils/                  # Text extractor, NLP pipeline, PII masker
│   ├── tests/                      # pytest suite with ML stubs
│   └── requirements.txt
│
└── frontend/                       # React 18 + TypeScript
    ├── src/
    │   ├── api/                    # Axios modules (auth, jobs, applications, availability, admin, profile)
    │   ├── components/
    │   │   ├── layout/             # AppShell (protected route), Sidebar (role-based nav)
    │   │   ├── recruiter/          # XaiDrawer, BatchToolbar
    │   │   └── ui/                 # Shadcn/UI components (button, card, dialog, badge, …)
    │   ├── hooks/                  # useToast
    │   ├── pages/
    │   │   ├── auth/               # LoginPage, RegisterPage, OtpPage
    │   │   ├── candidate/          # JobBoard, Applications, Exam, InterviewSlot, Results, Profile
    │   │   ├── recruiter/          # JobCreator, Ranking, AvailabilityCalendar
    │   │   └── admin/              # Users, HealthDashboard, AuditLog, AiModel
    │   ├── store/                  # Zustand auth store (persisted to localStorage)
    │   └── types/                  # TypeScript interfaces (auth, roles)
    └── vite.config.ts              # @tailwindcss/vite, @ alias, /api proxy
```

---

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Java 21
- Go 1.21+
- Python 3.11+
- Node.js 20+

### 1. Start infrastructure

```bash
docker compose up -d postgres redis kafka zookeeper chromadb
```

### 2. Spring Boot

```bash
cd backend
cp .env.example .env        # fill in secrets
./gradlew bootRun
# runs on :8080
```

### 3. Go Exam Engine

```bash
cd exam-engine
cp .env.example .env
go run ./cmd/server
# runs on :8090
```

### 4. Python AI Service

```bash
cd ai-service
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000
# runs on :8000
```

### 5. React Frontend

```bash
cd frontend
npm install
npm run dev
# runs on :5173, proxies /api → :8080
```

### Running tests

```bash
# Spring Boot
cd backend && ./gradlew test

# Go (unit tests; add -race in Linux CI for data-race detection)
cd exam-engine && go test ./...

# Python
cd ai-service
pip install -r requirements-test.txt
pytest tests/
```

---

## Environment Variables

### Spring Boot (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/recruitment` | PostgreSQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | `postgres` | DB username |
| `SPRING_DATASOURCE_PASSWORD` | `postgres` | DB password |
| `JWT_SECRET` | — | HS256 signing key (min 32 chars) |
| `REDIS_HOST` | `localhost` | Redis host |
| `KAFKA_BOOTSTRAP_SERVERS` | `localhost:9092` | Kafka broker |
| `XAI_REPORTS_DIR` | `./reports` | Directory for generated PDFs |

### Go Exam Engine (`exam-engine/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8090` | HTTP port |
| `REDIS_ADDR` | `localhost:6379` | Redis address |
| `REDIS_POOL_SIZE` | `20` | Max Redis connections |
| `KAFKA_BROKER` | `localhost:9092` | Kafka broker |
| `SPRING_BASE_URL` | `http://localhost:8080` | Spring Boot base URL |
| `WORKER_POOL_SIZE` | `10` | Grading goroutine count |
| `RATE_LIMIT_RPS` | `10` | Requests/second per candidate |
| `AI_GRADING_URL` | `http://localhost:8000` | Python AI service URL |
| `AI_GRADING_RETRIES` | `3` | Retry attempts with exponential backoff |

### Python AI Service (`ai-service/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `SBERT_MODEL` | `all-MiniLM-L6-v2` | HuggingFace model name |
| `REDIS_URL` | `redis://localhost:6379` | Redis URL |
| `CHROMA_PATH` | `./chroma_db` | ChromaDB persistence path |
| `SPRING_CALLBACK_URL` | `http://localhost:8080` | Spring Boot callback base URL |
| `KAFKA_BOOTSTRAP_SERVERS` | `localhost:9092` | Kafka broker |
| `ANTHROPIC_API_KEY` | — | Claude API key for XAI justifications |
| `PDF_STORAGE_DIR` | `./reports` | XAI PDF output directory |

---

## API Overview

All Spring Boot responses use the standard wrapper:

```json
{
  "status": "success",
  "message": "...",
  "data": { ... },
  "timestamp": "2026-04-17T10:00:00Z"
}
```

### Key endpoints

| Method | Path | Role | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/auth/register` | Public | Candidate self-registration |
| `POST` | `/api/v1/auth/verify-otp` | Public | OTP verify + issue JWT |
| `POST` | `/api/v1/auth/login` | Public | Password login |
| `GET` | `/api/v1/jobs` | Any | List open job postings |
| `POST` | `/api/v1/jobs` | Recruiter | Create job posting |
| `POST` | `/api/v1/applications` | Candidate | Submit application + CV |
| `GET` | `/api/v1/applications/my` | Candidate | List own applications |
| `POST` | `/api/v1/applications/{id}/book-slot` | Candidate | Book interview slot |
| `GET` | `/api/v1/applications/{id}/feedback` | Candidate | Get feedback report |
| `GET` | `/api/v1/applications/{id}/xai-report` | Candidate | Download XAI PDF |
| `POST` | `/api/v1/applications/shortlist` | Recruiter | Batch shortlist |
| `POST` | `/api/v1/applications/{id}/decision` | Recruiter | Final decision |
| `GET` | `/api/v1/recruiters/availability` | Recruiter | Get own slots |
| `POST` | `/api/v1/recruiters/availability/batch` | Recruiter | Create availability slots |
| `POST` | `/api/v1/admin/recruiters` | Admin | Create recruiter account |
| `PATCH` | `/api/v1/admin/users/{id}/status` | Admin | Activate / deactivate user |
| `GET` | `/api/v1/admin/audit-logs` | Admin | Browse audit log |
| `GET` | `/api/v1/admin/system/health` | Super Admin | DB / Redis / Kafka health |
| `POST` | `/api/v1/admin/ai-models/{id}/activate` | Super Admin | Activate AI model version |
| `GET` | `/exam/start` | Candidate (Go) | Start or resume exam session |
| `POST` | `/exam/submit-answer` | Candidate (Go) | Save answer |
| `GET` | `/exam/resume` | Candidate (Go) | Resume after disconnect |
| `GET` | `/health` | Public (Go) | Go engine health check |
| `GET` | `/health` | Public (Python) | AI service health check |

---

## Scoring Formula

```
Final Score = (CV Relevance × 100 × 0.40)
            + (Exam Score × 0.40)
            + (Hard Filter Passed ? 100 : 0) × 0.20
```

If the hard filter fails, the final score is forced to **0** regardless of CV or exam performance.

---

## Kafka Events

| Topic | Producer | Consumer | Payload |
|-------|----------|----------|---------|
| `CV_UPLOADED` | Spring Boot | Python AI | `applicationId`, `jobId`, `cvPath`, `jobDescription` |
| `EXAM_BATCH_READY` | Spring Boot | Go Engine | `examId`, `jobId`, `candidates[]`, `startTime`, `endTime`, `durationSecs` |
| `EXAM_COMPLETED` | Go Engine | Spring Boot | `candidateId`, `jobId`, `examId`, `totalScore` |
| `EXAM_SUBMITTED` | Spring Boot | Python AI | `applicationId`, `jobId` — triggers XAI PDF generation |
| `EXAM_BATCH_READY_DLT` | Go Engine | — | Dead-letter for malformed `EXAM_BATCH_READY` messages |
