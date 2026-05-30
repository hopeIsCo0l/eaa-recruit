# EAA-Recruit — Final Project Document

**College of Technology and Built Environment**
**School of Information Technology and Engineering**
**Department of IT/SW Engineering**

---

**Project:** EAA-Recruit — AI-Powered Recruitment Platform
**Version:** 2.0 (Final)
**Date:** May 2026

## Team Members

| Name | ID |
|------|-----|
| Abdellah Teshome | ATE/0406/13 |
| Abdurezak Zeynu | ATE/7317/13 |
| Biniam Dagne | ATE/1540/13 |
| Rehoboth Melaku | ATE/1745/13 |
| Yared Yirgalem | ATE/9061/13 |

**Advisor:** Mr. Daniel Abebe

---

## Document Structure

This document consolidates five deliverables into a single reference:

| Part | Section | Pages |
|------|---------|-------|
| **Part I** | Software Requirements Specification (SRS) | 1–3 |
| **Part II** | Software Design Specification (SDS) | 4–5 |
| **Part III** | Implementation Document | 6–12 |
| **Part IV** | User Manual Documentation (UMD) | 13–16 |
| **Part V** | Test Plan Documentation (TPD) | 17–20 |

---

# PART I — Software Requirements Specification (SRS)

## 1.2 Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | 2026-05-01 | Team EAA | Initial release and base consolidation of deliverables |
| 1.1 | 2026-05-05 | Abdellah Teshome | Added AI CV scoring pipeline details and SBERT notes |
| 1.2 | 2026-05-10 | Abdurezak Zeynu | Documented Exam Engine architecture and Redis session design |
| 1.3 | 2026-05-12 | Biniam Dagne | Added XAI (LIME) methodology and PDF report format |
| 1.4 | 2026-05-15 | Rehoboth Melaku | Security section expanded (OAuth2, MFA, WAF, TLS) |
| 1.5 | 2026-05-18 | Yared Yirgalem | CI/CD and container image signing/Helm examples added |
| 1.6 | 2026-05-20 | Team EAA | Monitoring, logging and backup/recovery sections added |
| 1.7 | 2026-05-22 | Abdellah Teshome | Performance testing notes and NFR tuning added |
| 1.8 | 2026-05-25 | Abdurezak Zeynu | Integration details updated (SSO, SMS, Calendar) |
| 1.9 | 2026-05-27 | Team EAA | Final editorial pass; consolidated FinalAllInOneDocument |

## 1. Introduction

### 1.1 Purpose

This SRS defines complete requirements for EAA-Recruit, an AI-powered recruitment automation platform for Ethiopian Airlines and the Ethiopian Aviation Academy.

**Intended Audience:** Development team, advisor, examiners, stakeholders, future maintainers.

### 1.2 Scope

**Product:** EAA-Recruit — a web-based AI-powered recruitment platform.

**What the system does:**
- Candidate registration and CV submission (PDF upload)
- Intelligent CV parsing and semantic scoring using SBERT embeddings
- Automated exam generation, delivery, and grading (MCQ + short-answer)
- Recruiter dashboards with ranked pipeline, analytics, and XAI reports
- Explainable AI reports (LIME attribution) for transparency
- Bias detection in job descriptions
- Interview scheduling with slot management
- Admin panel for user/system management

**What the system does NOT do:**
- AI-assisted video/audio interviews
- Native mobile applications
- Integration with external HR systems
- Multi-tenant SaaS deployment
- Post-project maintenance

### 1.3 Related Works and Contribution

| System | Limitation | Our Contribution |
|--------|-----------|-----------------|
| LinkedIn Recruiter | No XAI, no data sovereignty | LIME-backed explainability, local deployment |
| Workday ATS | Expensive, not aviation-specific | Open-source, cost-effective |
| Google for Jobs | General-purpose, no exam engine | Role-specific exam + semantic grading |
| Ethiopian portals | Manual, no AI | Full AI automation pipeline |

**Key differentiators:**
1. First Ethiopian aviation-specific AI recruitment platform
2. LIME-backed explainable decisions (EU AI Act aligned)
3. Full data sovereignty (local Ollama LLM, no cloud APIs)
4. Integrated exam engine with AI-graded short answers
5. Built-in bias detection at job creation

---

## 2. General Description

### 2.1 Product Perspective

EAA-Recruit integrates ML, NLP, and LLMs to automate hiring. Unlike general-purpose platforms, it is tailored for aviation-specific roles with Ethiopian cultural context and data sovereignty requirements.

### 2.2 Product Functions

| Function | Description |
|----------|-------------|
| CV Scoring | SBERT embeddings + cosine similarity for semantic job-CV matching |
| Hard Filter | Configurable threshold that gates exam access |
| Exam Engine | Timed MCQ + short-answer exams with per-question delivery |
| AI Grading | Ollama LLM grades short answers against ideal answers |
| XAI Reports | LIME attribution + LLM justification in downloadable PDF |
| Bias Detection | Flags gendered/exclusionary language in job descriptions |
| Pipeline Tracking | 10-state application lifecycle with role-based transitions |
| Interview Scheduling | Slot-based booking with email reminders |

### 2.3 User Characteristics

| Role | Description |
|------|-------------|
| **Candidate** | Job seekers, basic computer literacy, age 18–40 |
| **Recruiter** | HR professionals, proficient in HR tools, need intuitive dashboards |
| **Super Admin** | IT personnel with technical expertise for system configuration |
| **Interviewer** | Staff who conduct interviews (future role) |

### 2.4 General Constraints

- **Deployment:** Docker Compose on standard servers (no cloud dependency)
- **Standards:** Ethiopian Data Protection Proclamation No. 1329/2023
- **Technology:** Open-source stack exclusively
- **Timeline:** December 2025 – May 2026

---

## 3. Specific Requirements

### 3.1 Functional Requirements

#### FR-01: Candidate Registration
- Email + password registration with OTP verification
- Redis-cached 6-digit OTP with email delivery
- Account activation only after OTP verified

#### FR-02: Authentication & Authorization
- JWT HS512 token-based auth
- 4 roles: SUPER_ADMIN, RECRUITER, CANDIDATE, INTERVIEWER
- Role-scoped endpoint protection via annotations

#### FR-03: Job Posting Management
- Recruiter creates jobs with title, description, requirements, exam date
- CRUD operations + archive/unarchive
- Status lifecycle: DRAFT → OPEN → CLOSED

#### FR-04: Application Submission
- Candidate uploads CV (PDF) with job application
- Duplicate prevention (one application per job per candidate)
- Immediate async AI scoring trigger

#### FR-05: AI CV Scoring
- SBERT `all-MiniLM-L6-v2` encodes CV and job description
- Cosine similarity produces score (0–1)
- Hard filter gate (configurable threshold)

#### FR-06: Exam Engine
- Go/Gin microservice with Redis sessions
- Supports MCQ + SHORT_ANSWER question types
- Per-question timed delivery with shuffle
- MCQ: instant grading in-engine
- SHORT_ANSWER: async AI grading via worker pool

#### FR-07: Short-Answer AI Grading
- SBERT similarity + Ollama LLM evaluation
- Grading against ideal_answer stored per question
- Score proportional to semantic similarity

#### FR-08: XAI Report Generation
- LIME (Local Interpretable Model-Agnostic Explanations)
- 300 sample perturbations on CV text
- PDF with attribution bar chart + LLM justification
- Accessible to both recruiter and candidate

#### FR-09: Bias Detection
- Analyzes job description text for gendered/exclusionary language
- Returns bias score, flagged terms, suggestions, categories
- Runs at job creation time

#### FR-10: Interview Scheduling
- Recruiter defines available time slots
- Candidate books from available slots
- Email reminders before interview date

#### FR-11: Final Decision & Feedback
- Recruiter records SELECTED/REJECTED/WAITLISTED with notes
- Triggers async XAI report generation
- Candidate notified via email

#### FR-12: Admin Panel
- User management (create recruiter, suspend/block/activate)
- System health monitoring (actuator)
- AI model version management
- Audit log viewer
- Analytics export (CSV)

### 3.2 Non-Functional Requirements

| NFR | Metric | Target |
|-----|--------|--------|
| **Performance** | CV scoring latency | < 200ms |
| **Performance** | API response (95th percentile) | < 500ms |
| **Performance** | LIME attribution | 4–8 seconds |
| **Performance** | Short-answer grading | 2–5 seconds per question |
| **Scalability** | Concurrent exam sessions | 50+ without data corruption |
| **Security** | Auth mechanism | JWT HS512, role-based |
| **Security** | Service-to-service | Internal API key header |
| **Security** | Data at rest | PostgreSQL encryption |
| **Availability** | Uptime target | 99% (Docker health checks) |
| **Usability** | Recruiter decision flow | < 5 clicks |
| **Usability** | Candidate application | < 3 minutes |

### 3.3 Use Cases Summary

| UC | Actor | Goal |
|----|-------|------|
| UC-01 | Candidate | Register and login |
| UC-02 | Candidate | Submit job application with CV |
| UC-03 | System | Intelligent CV parsing and scoring |
| UC-04 | Candidate | Take automated written examination |
| UC-05 | Recruiter | Post and manage job positions |
| UC-06 | Recruiter | Generate explainable candidate report |
| UC-07 | Candidate | View application status and feedback |
| UC-08 | Recruiter | Search and filter candidates |
| UC-09 | Admin | Administer system users and settings |
| UC-10 | Recruiter | Record hiring decision |

### 3.4 Application Status Lifecycle

```
SUBMITTED → AI_SCREENING → HARD_FILTER_FAILED (terminal)
                         → EXAM_AUTHORIZED → EXAM_COMPLETED
                                           → SHORTLISTED
                                           → INTERVIEW_SCHEDULED
                                           → SELECTED / REJECTED / WAITLISTED
```

### 3.5 Assumptions

- Stable Docker environment available
- CVs in English, PDF format
- Ollama running locally with model loaded
- PostgreSQL and Redis available
- Internet for email delivery only

### 3.6 Design Constraints

- Open-source technologies exclusively
- Local deployment (no external cloud AI APIs)
- Ethiopian Data Protection compliance
- 6-month student timeline
- Standard university hardware

---

# PART II — Software Design Specification (SDS)

## 4. System Architecture

### 4.1 Architecture Overview

EAA-Recruit uses a **microservice architecture** with 5 independent services:

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js 14 Frontend                     │
│              Recruiter Dashboard · Candidate Portal          │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS + JWT (HS512)
┌──────────────────────────▼──────────────────────────────────┐
│               Spring Boot 3.x  (Core API)                    │
│   Auth · Jobs · Applications · Interviews · Decisions        │
└───────┬───────────────────┬────────────────┬────────────────┘
        │ REST + API Key    │ REST + API Key │ JDBC
┌───────▼──────┐   ┌────────▼───────┐   ┌───▼──────────────┐
│  AI Service  │   │  Exam Engine   │   │  PostgreSQL 16   │
│  FastAPI/Py  │   │  Go + Gin      │   │  + Redis 7       │
│  SBERT+Ollama│   │  Redis Sessions│   └──────────────────┘
└──────────────┘   └────────────────┘
```

### 4.2 Technology Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Frontend | Next.js, TypeScript, Tailwind CSS | 14.x | SSR, type safety, utility-first CSS |
| Backend API | Spring Boot, Java | 3.2.x / 21 | Mature ecosystem, transactions, annotations |
| AI Service | FastAPI, Python | 3.11 | ML library ecosystem (PyTorch, transformers) |
| Exam Engine | Go, Gin | 1.22 | Goroutine concurrency for parallel exams |
| Embeddings | SBERT `all-MiniLM-L6-v2` | - | 22M params, 384-dim, ~80ms/call |
| LLM | Ollama `llama3.2` / `qwen2.5:1.5b` | - | Local, no API cost |
| XAI | LIME library | - | Model-agnostic feature attribution |
| Database | PostgreSQL | 16.x | ACID, Flyway migrations |
| Cache/Sessions | Redis | 7.x | Sub-ms exam state, OTP cache |
| Auth | JWT HS512 | - | 4 roles, service-to-service API keys |
| Containerization | Docker Compose | Latest | Multi-service orchestration |

### 4.3 Subsystem Decomposition

#### 4.3.1 Backend (Spring Boot)
- **AuthController** — registration, login, OTP, password reset
- **JobController** — CRUD, status, archive
- **ApplicationController** — submit, shortlist, decision, feedback
- **ExamController** — create exam, authorize batch
- **InternalController** — callbacks from exam-engine/ai-service
- **AdminUserController** — user management
- **AdminSystemController** — health, audit, AI models
- **FeedbackController** — XAI report download

#### 4.3.2 AI Service (FastAPI)
- **cv_scoring router** — SBERT encode + cosine similarity
- **grading router** — short-answer evaluation
- **xai router** — LIME attribution + PDF generation
- **bias router** — job description bias analysis
- **ranking router** — candidate ranking
- **health router** — service health

#### 4.3.3 Exam Engine (Go/Gin)
- **BatchReadyHandler** — receives exam schedule from Spring
- **StartExamHandler** — creates Redis session, serves first question
- **SubmitAnswerHandler** — processes answer, dispatches grading
- **GradingService** — worker pool for async AI grading
- **SpringClient** — publishes exam-completed callback

### 4.4 Security Architecture

| Layer | Mechanism |
|-------|-----------|
| User → Frontend | HTTPS |
| Frontend → Backend | JWT HS512 in Authorization header |
| Backend → AI Service | X-Internal-Api-Key header |
| Backend → Exam Engine | X-Internal-Api-Key header |
| Exam Engine → AI Service | X-Internal-Api-Key header |
| Candidate JWT → Exam Engine | HS256 + HS512 dual support |

**Data Isolation:**
- Recruiter sees only own jobs' applications
- Candidate accesses only own exams/applications
- XAI report: both recruiter (job owner) and candidate (applicant)

### 4.5 Database Design

#### Entity Relationship (12 Flyway migrations)

```
users ──< job_postings ──< applications ──< exam_sessions
                │
                ├── cv_relevance_score  FLOAT (0–1)
                ├── hard_filter_passed  BOOLEAN
                ├── exam_score          FLOAT (0–100)
                ├── final_score         FLOAT (0–100)
                ├── xai_report_url      TEXT
                ├── decision_notes      TEXT
                └── version             INTEGER (@Version)

questions (per job)
  ├── type: MCQ | SHORT_ANSWER
  ├── correct_answer TEXT
  └── ideal_answer   TEXT (V12 migration)

exams (per job)
  ├── scheduled_start TIMESTAMP
  ├── duration_minutes INTEGER
  └── status ENUM
```

### 4.6 Key Algorithms

#### 4.6.1 CV Scoring Pipeline
```
CV Text (PDF) → SBERT Encoder → 384-dim vector
Job Description → SBERT Encoder → 384-dim vector
Cosine Similarity → score ∈ [0, 1]
Hard Filter (configurable threshold) → PASS / FAIL
```

#### 4.6.2 LIME Attribution
```
1. Take CV text
2. Randomly mask words (300 samples)
3. Score each variant with SBERT
4. Fit local linear model on perturbations
5. Extract top feature weights
   → { "python": +0.42, "leadership": +0.31, ... }
```

#### 4.6.3 Short-Answer Grading
```
1. SBERT encode student answer + ideal answer
2. Compute cosine similarity
3. Ollama LLM evaluates quality (0–10 scale)
4. Final score = weighted combination
```

#### 4.6.4 Exam Grading Pipeline
```
MCQ: instant scoring (correct_answer match) in exam-engine
SHORT_ANSWER: goroutine pool → ai-service → WaitGroup collection
Single atomic session update → single callback to Spring
```

### 4.7 Asynchronous Processing Patterns

| Operation | Pattern | Rationale |
|-----------|---------|-----------|
| CV scoring after upload | Spring @Async → ai-service | Don't block application submission |
| Short-answer grading | Go goroutine pool + WaitGroup | Grade N answers in parallel |
| XAI report generation | Spring @Async + @Transactional | Don't block recruiter decision response |
| Email notifications | Spring @Async | Don't block user actions |

### 4.8 Error Handling Strategy

| Error Type | Handling |
|------------|----------|
| AI service down | Graceful degradation (score stays 0, exam still completes) |
| Grading timeout | Retry 3x with exponential backoff, then score = 0 |
| Optimistic lock conflict | Native SQL UPDATE bypasses JPA versioning |
| Lazy initialization in async | @Transactional ensures Hibernate session |
| HTTP/2 rejection | HTTP/1.1 enforced via JdkClientHttpRequestFactory |

---

# PART III — Implementation Document

## 5. Implementation Strategy

### 5.1 Implementation Approach

- **Agile:** Weekly sprints with advisor review
- **Incremental:** MVP (auth + jobs + applications) → AI scoring → Exam engine → XAI
- **Parallel development:** Frontend, backend, AI service, exam engine developed simultaneously
- **Docker-first:** All services containerized from day one

### 5.2 Environment Strategy

| Environment | Purpose | Configuration |
|-------------|---------|---------------|
| Development | Local coding/debugging | `docker compose up` with hot-reload |
| Testing | Automated test execution | Docker Compose + test profiles |
| Demo/Staging | Defense demonstration | Full stack on local machine |

### 5.3 Deployment Model

Single-node Docker Compose deployment with 6 containers:
- `backend` (Spring Boot)
- `frontend` (Next.js)
- `exam-engine` (Go)
- `ai-service` (FastAPI)
- `postgres` (PostgreSQL 16)
- `redis` (Redis 7)

Ollama runs as a host service (port 11434).

---

## 6. System Environment Setup

### 6.1 Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | Intel i5 (4 cores) | Intel i7/i9 (8+ cores) |
| RAM | 16 GB | 32 GB |
| Storage | 50 GB SSD | 100 GB SSD |
| GPU | Not required | NVIDIA (faster LLM inference) |

### 6.2 Software Requirements

| Software | Version | Purpose |
|----------|---------|---------|
| Docker Desktop | Latest | Container runtime |
| Docker Compose | v2+ | Multi-service orchestration |
| JDK | 21 | Spring Boot backend |
| Go | 1.22+ | Exam engine |
| Python | 3.11+ | AI service |
| Node.js | 18+ | Frontend build |
| Ollama | Latest | Local LLM inference |
| Git | Latest | Version control |

### 6.3 Development Tools

- **IDE:** IntelliJ IDEA (Java), VS Code (Go/Python/TypeScript)
- **Database:** pgAdmin / DBeaver
- **API Testing:** Postman / curl
- **Container:** Docker Desktop
- **Version Control:** Git + GitHub

---

## 8. Database Implementation

This section covers installation, schema design, migration management, index strategy, Redis configuration, connection pooling, and backup procedures for the EAA-Recruit data layer.

### 8.1 PostgreSQL Installation & Startup

PostgreSQL 16 runs as a Docker service. Spring Boot connects via JDBC and runs Flyway migrations on every startup.

```bash
# Start PostgreSQL (Docker)
docker compose up postgres -d

# Verify connectivity
docker exec -it eaa-postgres psql -U eaa_user -d eaa_recruit -c "\dt"

# Flyway migrations run automatically at Spring Boot startup
# Tracked in: flyway_schema_history
```

**docker-compose.yml (PostgreSQL service):**
```yaml
postgres:
  image: postgres:16-alpine
  environment:
    POSTGRES_USER: eaa_user
    POSTGRES_PASSWORD: ${DB_PASSWORD}
    POSTGRES_DB: eaa_recruit
  ports:
    - "5432:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U eaa_user -d eaa_recruit"]
    interval: 10s
    timeout: 5s
    retries: 5
```

### 8.2 Schema Migrations (Flyway)

Flyway manages all schema changes through numbered SQL migration files in `src/main/resources/db/migration/`. Each migration runs exactly once and is recorded in `flyway_schema_history`. **Never modify an existing migration file** — always create a new versioned file.

| Migration | Purpose |
|-----------|---------|
| V1 | Create `users`, `job_postings`, `applications` core tables |
| V2 | Add `exams` and `questions` tables with MCQ/SHORT_ANSWER type enum |
| V3 | Add `availability_slots` for interview scheduling |
| V4 | Add `audit_logs` table (action, actor, target, timestamp) |
| V5 | Add `ai_model_versions` table for admin model tracking |
| V6 | Add `cv_relevance_score` (FLOAT), `hard_filter_passed` (BOOLEAN) to applications |
| V7 | Add `exam_score` (FLOAT, 0–100) and `final_score` (FLOAT, 0–100) to applications |
| V8 | Add `xai_report_url` (TEXT) to applications |
| V9 | Add `decision_notes` (TEXT), `status` ENUM expansion |
| V10 | Add `version` (INTEGER) to applications for JPA `@Version` optimistic locking |
| V11 | Seed initial test data: admin user, recruiter, sample job, sample applications |
| V12 | Add `ideal_answer` (TEXT) to questions; `UPDATE` backfill for existing SHORT_ANSWER rows |

**Flyway config (application.properties):**
```properties
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=false
spring.flyway.validate-on-migrate=true
```

### 8.3 Key Table Structures

Representative DDL for the most critical tables (simplified from actual migration files):

**users table (V1):**
```sql
CREATE TABLE users (
    id         BIGSERIAL PRIMARY KEY,
    email      VARCHAR(255) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,          -- BCrypt encoded
    full_name  VARCHAR(255),
    phone      VARCHAR(50),
    role       VARCHAR(50) NOT NULL,           -- SUPER_ADMIN | RECRUITER | CANDIDATE | INTERVIEWER
    status     VARCHAR(50) DEFAULT 'ACTIVE',   -- ACTIVE | SUSPENDED | BLOCKED
    created_at TIMESTAMP DEFAULT NOW()
);
```

**job_postings table (V1):**
```sql
CREATE TABLE job_postings (
    id                BIGSERIAL PRIMARY KEY,
    recruiter_id      BIGINT NOT NULL REFERENCES users(id),
    title             VARCHAR(255) NOT NULL,
    description       TEXT NOT NULL,
    requirements      TEXT,
    location          VARCHAR(255),
    salary_range      VARCHAR(100),
    status            VARCHAR(50) DEFAULT 'DRAFT',   -- DRAFT | OPEN | CLOSED
    exam_date         TIMESTAMP,
    duration_minutes  INTEGER,
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW()
);
```

**applications table (V1 + V6–V10):**
```sql
CREATE TABLE applications (
    id                  BIGSERIAL PRIMARY KEY,
    candidate_id        BIGINT NOT NULL REFERENCES users(id),
    job_id              BIGINT NOT NULL REFERENCES job_postings(id),
    cv_file_path        TEXT,
    status              VARCHAR(50) DEFAULT 'SUBMITTED',
    -- AI fields added in V6–V9
    cv_relevance_score  FLOAT,
    hard_filter_passed  BOOLEAN,
    exam_score          FLOAT,
    final_score         FLOAT,
    xai_report_url      TEXT,
    decision_notes      TEXT,
    -- Optimistic locking (V10)
    version             INTEGER DEFAULT 0,
    submitted_at        TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),
    UNIQUE (candidate_id, job_id)               -- prevent duplicate applications
);
```

**questions table (V2 + V12):**
```sql
CREATE TABLE questions (
    id             BIGSERIAL PRIMARY KEY,
    exam_id        BIGINT NOT NULL REFERENCES exams(id),
    question_text  TEXT NOT NULL,
    type           VARCHAR(50) NOT NULL,    -- MCQ | SHORT_ANSWER
    option_a       TEXT,
    option_b       TEXT,
    option_c       TEXT,
    option_d       TEXT,
    correct_answer TEXT,                    -- option letter for MCQ
    ideal_answer   TEXT,                    -- V12: reference answer for short-answer grading
    marks          INTEGER DEFAULT 10,
    display_order  INTEGER
);
```

### 8.4 Index Design

Primary and foreign key indexes are created automatically by PostgreSQL. Additional indexes for query performance:

```sql
-- Candidate looks up their own applications frequently
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);

-- Recruiter fetches applications for their jobs
CREATE INDEX idx_applications_job_id ON applications(job_id);

-- Status filtering (pipeline views, scheduler queries)
CREATE INDEX idx_applications_status ON applications(status);

-- Job listing by recruiter
CREATE INDEX idx_job_postings_recruiter_id ON job_postings(recruiter_id);

-- Audit log queries by user and date
CREATE INDEX idx_audit_logs_actor_id_created ON audit_logs(actor_id, created_at DESC);
```

### 8.5 Connection Pooling (HikariCP)

Spring Boot uses HikariCP as the default JDBC connection pool. Configuration in `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/eaa_recruit
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

# HikariCP pool settings
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000
spring.datasource.hikari.pool-name=EaaRecruitPool

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=validate   # Flyway owns schema — JPA only validates
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

### 8.6 Redis Configuration

Redis 7 serves three distinct roles: OTP caching (auth), exam session state (exam-engine), and user block tracking (auth middleware).

| Use Case | Key Pattern | TTL | Who Writes |
|----------|-------------|-----|-----------|
| OTP codes | `otp:{email}` | 5 minutes | Spring backend |
| Exam sessions | `exam:session:{candidateId}:{jobId}` | Exam duration + 30 min | Exam engine |
| Question schedule | `exam:questions:{examId}` | Exam duration | Exam engine |
| Authorized candidates | `exam:authorized:{examId}:{candidateId}` | Until exam ends | Exam engine |
| Blocked login attempts | `blocked:{userId}` | 15 minutes | Spring backend |
| CV text cache | `cv:text:{applicationId}` | 7 days | AI service |

**Redis docker-compose service:**
```yaml
redis:
  image: redis:7-alpine
  command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
```

**Spring Boot Redis config:**
```properties
spring.data.redis.host=${REDIS_HOST:localhost}
spring.data.redis.port=6379
spring.data.redis.timeout=2000ms
```

**Exam engine Redis (Go):**
```go
rdb := redis.NewClient(&redis.Options{
    Addr:         os.Getenv("REDIS_URL"),
    DialTimeout:  3 * time.Second,
    ReadTimeout:  2 * time.Second,
    WriteTimeout: 2 * time.Second,
    PoolSize:     10,
})
```

Eviction policy `allkeys-lru` ensures the exam session keys are evicted least-recently-used if memory pressure occurs, preventing OOM crashes.

### 8.7 Backup & Recovery

**Logical backup (pg_dump):**
```bash
# Full database backup
pg_dump -h localhost -U eaa_user -d eaa_recruit -Fc -f backup_$(date +%Y%m%d).dump

# Restore
pg_restore -h localhost -U eaa_user -d eaa_recruit backup_20260527.dump
```

**Automated backup script (run nightly via cron):**
```bash
#!/bin/bash
BACKUP_DIR=/var/backups/eaa-recruit
DATE=$(date +%Y%m%d_%H%M%S)
docker exec eaa-postgres pg_dump -U eaa_user eaa_recruit > $BACKUP_DIR/db_$DATE.sql
# Keep last 7 days only
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete
```

**Recovery time objective (RTO):** < 30 minutes for full restore from backup.
**Recovery point objective (RPO):** 24 hours (nightly backup cadence).

---

## 9. Backend Implementation

This section covers the three backend services: Spring Boot (Core API), the Exam Engine (Go), and the AI Service (Python/FastAPI). Each service is self-contained, communicates via REST with API-key authentication, and runs as a Docker container.

### 9.1 Spring Boot Backend

**Package structure:**
```
com.eaa.recruit
├── config/
│   ├── SecurityConfig.java        — CORS, filter chain, role matchers
│   ├── AsyncConfig.java           — ThreadPoolTaskExecutor (async threads)
│   ├── RestClientConfig.java      — HTTP/1.1-enforced RestClient beans
│   ├── MailConfig.java            — JavaMailSender config
│   └── AiProperties.java          — AI/exam engine URL bindings
├── controller/
│   ├── AuthController.java        — /auth: register, login, OTP, reset
│   ├── JobController.java         — /jobs: CRUD, archive, status
│   ├── ApplicationController.java — /applications: submit, shortlist, decision
│   ├── ExamController.java        — /exams: create, authorize batch
│   ├── InternalController.java    — /internal: AI score callback, exam completed
│   ├── FeedbackController.java    — /feedback: XAI PDF proxy download
│   ├── AdminUserController.java   — /admin/users: CRUD, status changes
│   └── AdminSystemController.java — /admin/system: health, logs, AI models
├── dto/                           — Request/response DTOs (per feature)
├── entity/                        — JPA entities with @Version on Application
├── exception/
│   ├── GlobalExceptionHandler.java — @ControllerAdvice, maps exceptions → HTTP
│   ├── ResourceNotFoundException.java
│   ├── DuplicateApplicationException.java
│   └── UnauthorizedException.java
├── messaging/
│   ├── XaiReportClient.java       — Async: calls ai-service /xai/report
│   └── EventPublisher.java        — Spring application events
├── repository/
│   ├── ApplicationRepository.java
│   │   └── @Modifying @Query "UPDATE applications SET xai_report_url = ..."
│   ├── UserRepository.java
│   ├── JobRepository.java
│   └── ...
├── scheduler/
│   ├── JobStatusScheduler.java    — Auto-close expired jobs
│   └── InterviewReminderScheduler.java — Email reminders 24h before
├── security/
│   ├── JwtProvider.java           — HS512 sign/verify
│   ├── JwtAuthFilter.java         — OncePerRequestFilter chain
│   ├── IsRecruiter.java           — @annotation
│   ├── IsCandidate.java
│   ├── IsAdmin.java
│   └── IsAuthenticated.java
└── service/                       — Business logic (40+ service classes)
```

**Security configuration (SecurityConfig.java — simplified):**
```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(AbstractHttpConfigurer::disable)
        .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/v1/auth/**").permitAll()
            .requestMatchers("/api/v1/internal/**").permitAll()  // protected by API key filter
            .anyRequest().authenticated()
        )
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
        .addFilterBefore(internalApiKeyFilter, JwtAuthFilter.class)
        .build();
}
```

**Async executor configuration:**
```java
@Bean(name = "taskExecutor")
public Executor taskExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(4);
    executor.setMaxPoolSize(8);
    executor.setQueueCapacity(100);
    executor.setThreadNamePrefix("eaa-async-");
    executor.initialize();
    return executor;
}
```

**HTTP/1.1-enforced RestClient (all inter-service calls):**
```java
@Bean
public RestClient aiServiceClient(@Value("${ai.service.url}") String baseUrl) {
    var httpClient = HttpClient.newBuilder()
        .version(HttpClient.Version.HTTP_1_1)   // uvicorn rejects h2 upgrade
        .connectTimeout(Duration.ofSeconds(5))
        .build();
    return RestClient.builder()
        .baseUrl(baseUrl)
        .requestFactory(new JdkClientHttpRequestFactory(httpClient))
        .defaultHeader("X-Internal-Api-Key", internalApiKey)
        .build();
}
```

**Key implementation details:**

| Feature | Implementation | Notes |
|---------|---------------|-------|
| Auth | JWT HS512, BCrypt(10), Redis OTP | Token expiry: 24h |
| Async CV scoring | `@Async` → `AiServiceClient.scoreCv()` | Non-blocking on upload |
| Async XAI build | `@Async @Transactional XaiReportClient.buildAndStore()` | After decision |
| File upload | `MultipartFile` → local path on disk → path stored in DB | max 10MB |
| Optimistic locking | `@Version Integer version` on `Application` entity | Prevents concurrent edits |
| XAI URL update | `@Modifying @Query("UPDATE Application a SET a.xaiReportUrl=...")` | Bypasses JPA version check |
| Scheduled jobs | `@Scheduled(cron = "0 0 * * * *")` on `JobStatusScheduler` | Hourly job status check |
| Email | JavaMailSender with Spring's `@Async` — never blocks user requests | SMTP via Gmail/custom |

**Application lifecycle state machine (ApplicationService.java):**
```
SUBMITTED
  └─(async AI scoring)→ AI_SCREENING
       ├─(score < threshold)→ HARD_FILTER_FAILED  [terminal]
       └─(recruiter authorizes)→ EXAM_AUTHORIZED
            └─(candidate completes)→ EXAM_COMPLETED  [engine callback]
                 └─(recruiter shortlists)→ SHORTLISTED
                      ├─(candidate books)→ INTERVIEW_SCHEDULED
                      └─(recruiter decides)→ SELECTED | REJECTED | WAITLISTED
```

**Global exception handler:**
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> notFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(404).body(new ErrorResponse(ex.getMessage()));
    }
    @ExceptionHandler(DuplicateApplicationException.class)
    public ResponseEntity<ErrorResponse> duplicate(DuplicateApplicationException ex) {
        return ResponseEntity.status(409).body(new ErrorResponse(ex.getMessage()));
    }
    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ResponseEntity<ErrorResponse> lock(OptimisticLockingFailureException ex) {
        return ResponseEntity.status(409).body(new ErrorResponse("Concurrent update conflict"));
    }
}
```

### 9.2 Exam Engine (Go)

The exam engine is a standalone Go/Gin microservice responsible for exam session management, timed question delivery, MCQ grading, and async short-answer grading via a goroutine worker pool.

**Package structure:**
```
exam-engine/
├── cmd/server/main.go              — Entry point, Gin router, route registration
├── internal/
│   ├── domain/
│   │   ├── question.go            — Question struct (type, text, options, idealAnswer)
│   │   └── session.go             — ExamSession struct (answers, scores, status)
│   ├── handlers/
│   │   ├── batch_ready.go         — POST /internal/exams/batch-ready
│   │   ├── start_exam.go          — POST /exams/start
│   │   ├── next_question.go       — GET  /exams/next-question
│   │   └── submit_answer.go       — POST /exams/submit-answer
│   ├── middleware/
│   │   ├── jwt_auth.go            — JWT validation (HS256 + HS512 dual support)
│   │   └── api_key_auth.go        — X-Internal-Api-Key for Spring callbacks
│   ├── services/
│   │   ├── grading_service.go     — Worker pool + WaitGroup for short-answer grading
│   │   └── session_service.go     — Redis session read/write
│   └── clients/
│       ├── spring_client.go       — POST /internal/exam-completed callback
│       └── ai_client.go           — POST /grade-answer to ai-service
└── pkg/redis/
    └── client.go                  — Redis connection pool
```

**JWT middleware (dual HS256/HS512 support):**
```go
func validateJWT(tokenStr, secret string) (*Claims, error) {
    token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
        switch t.Method.(type) {
        case *jwt.SigningMethodHMAC:
            if t.Method == jwt.SigningMethodHS512 {
                return []byte(secret), nil   // Spring uses HS512
            }
            if t.Method == jwt.SigningMethodHS256 {
                return []byte(secret), nil   // legacy support
            }
        }
        return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
    })
    ...
}
```

**Goroutine worker pool with WaitGroup (GradingService.go):**
```go
type shortAnswerTask struct {
    question domain.Question
    answer   string
}

func (g *GradingService) gradeAllShortAnswers(session *domain.ExamSession) {
    tasks := extractShortAnswerTasks(session)
    var wg sync.WaitGroup
    var mu sync.Mutex
    scores := make(map[string]float64, len(tasks))

    for _, task := range tasks {
        wg.Add(1)
        go func(t shortAnswerTask) {
            defer wg.Done()
            score := g.aiClient.GradeAnswer(t.question, t.answer)  // HTTP to ai-service
            mu.Lock()
            scores[t.question.ID] = score
            mu.Unlock()
        }(task)
    }

    wg.Wait()  // Wait for ALL goroutines before touching session state

    // Single atomic update — no race condition
    g.finalizeSession(session, scores)
    g.springClient.PublishExamCompleted(session)  // called exactly once
}
```

**Key implementation details:**

| Feature | Implementation | Notes |
|---------|---------------|-------|
| JWT auth | Dual HS256/HS512 switch in `jwt.ParseWithClaims` | Spring signs HS512 |
| Sessions | Redis `HSET exam:session:{cId}:{jId}` with TTL | Survives restarts |
| Question delivery | Stored as ordered list in Redis; index incremented per submission | Shuffle at batch-ready |
| MCQ grading | String comparison in Go (no AI call) | Instant |
| SA grading | `goroutine per question` + `sync.WaitGroup` + `sync.Mutex` map | All collected before callback |
| Callback | Single HTTP POST to Spring `/internal/exam-completed` | Only after WaitGroup.Wait() |
| Health | `GET /health` returns 200 + Redis ping result | Used by Docker healthcheck |

### 9.3 AI Service (Python/FastAPI)

**Package structure:**
```
ai-service/src/
├── main.py                         — FastAPI app init, routers, startup events
├── config.py                       — Pydantic Settings (env var binding)
├── routers/
│   ├── cv_scoring.py              — POST /api/v1/score-cv
│   ├── grading.py                 — POST /api/v1/grade-answer
│   ├── xai.py                     — POST /api/v1/xai/report, GET /xai/report/{id}
│   ├── bias.py                    — POST /api/v1/bias/analyze
│   ├── ranking.py                 — POST /api/v1/rank-candidates
│   └── health.py                  — GET /api/v1/health
├── services/
│   ├── embedding_service.py       — SBERT model singleton (lazy-loaded)
│   ├── ollama_scoring.py          — HTTP client for Ollama /api/generate
│   ├── attribution_service.py     — LIME explain_instance wrapper
│   ├── justification_engine.py    — Ollama prompt for 3-para justification text
│   ├── pdf_generator.py           — ReportLab + matplotlib chart → PDF bytes
│   └── cv_text_cache.py           — Redis get/set for CV text (7-day TTL)
└── utils/
    └── auth.py                    — X-Internal-Api-Key header dependency
```

**FastAPI startup and model loading:**
```python
from fastapi import FastAPI
from sentence_transformers import SentenceTransformer
import redis

app = FastAPI(title="EAA-Recruit AI Service")
_model: SentenceTransformer | None = None  # singleton

@app.on_event("startup")
async def startup():
    global _model
    _model = SentenceTransformer("all-MiniLM-L6-v2")  # loads once, shared across requests
    print(f"SBERT model loaded. Embedding dim: {_model.get_sentence_embedding_dimension()}")

def get_model() -> SentenceTransformer:
    return _model
```

**Internal API key authentication (dependency):**
```python
from fastapi import Security, HTTPException
from fastapi.security import APIKeyHeader

api_key_header = APIKeyHeader(name="X-Internal-Api-Key", auto_error=False)

def verify_internal_key(key: str = Security(api_key_header)):
    if key != settings.internal_api_key:
        raise HTTPException(status_code=403, detail="Invalid internal API key")
    return key
```

**CV scoring endpoint:**
```python
@router.post("/score-cv")
async def score_cv(req: ScoreCvRequest, _=Depends(verify_internal_key)):
    model = get_model()
    cv_emb  = model.encode(req.cv_text,      normalize_embeddings=True)
    jd_emb  = model.encode(req.jd_text,      normalize_embeddings=True)
    score   = float(np.dot(cv_emb, jd_emb))  # cosine similarity (both L2-normalized)
    passed  = score >= req.threshold
    return {"cv_relevance_score": score, "hard_filter_passed": passed}
```

**Key service behaviors:**

| Feature | Implementation | Notes |
|---------|---------------|-------|
| SBERT model | Singleton loaded at startup, reused per request | ~22M params, 80ms/encode |
| Ollama calls | `httpx.post` to `http://host:11434/api/generate`, 4s timeout | Fallback to SBERT-only on timeout |
| LIME | `LimeTextExplainer.explain_instance(cv_text, sbert_score_fn, num_samples=300)` | 4–8s |
| PDF | ReportLab for layout, matplotlib for bar chart, merged into BytesIO | ~1s |
| CV text cache | Redis `SETEX cv:text:{appId} 604800 <text>` | Avoids re-parse for XAI |
| Bias detection | Lexicon lookup + simple rule-based scoring | ~50ms |

---

## 10. Frontend Implementation

The frontend is a Next.js 14 application using the App Router, TypeScript, and Tailwind CSS. It exposes three distinct portals: Candidate Portal, Recruiter Dashboard, and Admin Panel.

### 10.1 Architecture & Directory Structure

Next.js 14 App Router separates Server Components (data fetching, SSR) from Client Components (interactivity, hooks). All pages that use browser APIs or React hooks are marked `"use client"`.

**Full page structure (25 pages):**
```
src/
├── app/
│   ├── layout.tsx                  — Root layout: AuthProvider, global styles
│   ├── page.tsx                    — Landing (redirect to login)
│   ├── login/page.tsx              — Credential login form
│   ├── register/page.tsx           — Registration form (name, email, phone, password)
│   ├── verify-otp/page.tsx         — 6-digit OTP entry, auto-submit on complete
│   ├── forgot-password/page.tsx    — Request OTP to email
│   ├── reset-password/page.tsx     — New password entry (OTP-verified)
│   │
│   ├── dashboard/                  — Recruiter Portal (requires RECRUITER role)
│   │   ├── layout.tsx             — Sidebar + navbar layout
│   │   ├── page.tsx               — Funnel chart + job cards
│   │   ├── candidates/page.tsx    — All candidates table + detail modal
│   │   ├── pipeline/page.tsx      — Kanban drag-and-drop view
│   │   ├── jobs/page.tsx          — Job CRUD + exam setup
│   │   ├── interviews/page.tsx    — Slot management + booking calendar
│   │   └── reports/page.tsx       — Analytics: conversion, score distributions
│   │
│   ├── admin/                      — Admin Portal (requires SUPER_ADMIN role)
│   │   ├── layout.tsx             — Admin sidebar
│   │   ├── page.tsx               — System metrics dashboard
│   │   ├── users/page.tsx         — User list + create recruiter + status actions
│   │   ├── jobs/page.tsx          — All jobs across all recruiters
│   │   ├── config/page.tsx        — AI model version management
│   │   └── logs/page.tsx          — Audit log viewer with filters
│   │
│   └── candidate/                  — Candidate Portal (requires CANDIDATE role)
│       ├── layout.tsx             — Candidate sidebar + nav
│       ├── page.tsx               — Overview + status cards
│       ├── jobs/page.tsx          — Job listings, apply with CV upload
│       ├── applications/page.tsx  — My applications + status tracking
│       ├── exams/page.tsx         — Exam interface (timed, one question at a time)
│       ├── profile/page.tsx       — View/edit profile
│       └── feedback/page.tsx      — Scores + XAI report download
│
├── components/
│   ├── auth/
│   │   └── AuthProvider.tsx        — JWT context provider, role routing
│   ├── recruiter/
│   │   ├── KanbanBoard.tsx         — Drag-and-drop pipeline
│   │   ├── CandidateDetailModal.tsx — Slide-over with scores + XAI
│   │   ├── FunnelChart.tsx         — Recharts funnel visualization
│   │   └── JobCard.tsx             — Job summary with counts
│   ├── candidate/
│   │   ├── ExamInterface.tsx       — Timed Q&A with progress bar
│   │   ├── ApplicationCard.tsx     — Status + scores
│   │   └── XaiDownloadButton.tsx   — PDF blob fetch + download trigger
│   ├── admin/
│   │   ├── UserTable.tsx           — Paginated user list
│   │   └── AuditLogTable.tsx       — Log viewer with date filter
│   └── ui/                         — Shared: Button, Modal, Badge, Spinner, Toast
│
├── hooks/
│   ├── useAuth.ts                  — Access AuthContext
│   ├── useApi.ts                   — Typed fetch wrapper with JWT header
│   └── useInterval.ts              — Exam timer countdown
│
├── lib/
│   ├── api.ts                      — Base URL, Axios instance config
│   └── auth.ts                     — Token parse, role extract
│
└── types/
    ├── application.ts
    ├── job.ts
    └── user.ts
```

### 10.2 Authentication & Authorization

**AuthProvider (AuthProvider.tsx):**
```typescript
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  token: string | null;
  user: { email: string; role: string; id: number } | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("jwt");
    if (stored) {
      setToken(stored);
      setUser(parseJwt(stored));
    }
  }, []);

  const login = (jwt: string) => {
    localStorage.setItem("jwt", jwt);
    setToken(jwt);
    const parsed = parseJwt(jwt);
    setUser(parsed);
    // Role-based redirect
    if (parsed.role === "RECRUITER")    router.push("/dashboard");
    if (parsed.role === "CANDIDATE")    router.push("/candidate");
    if (parsed.role === "SUPER_ADMIN")  router.push("/admin");
  };

  const logout = () => {
    localStorage.removeItem("jwt");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext)!;
```

**JWT is stored in `localStorage`** and attached to every API request via Axios interceptor. Role-based access control is enforced both by interceptors (frontend redirect) and backend (403 on wrong role).

**Route guard (layout-level):**
```typescript
// dashboard/layout.tsx
"use client";
export default function DashboardLayout({ children }) {
  const { user } = useAuth();
  if (!user) redirect("/login");
  if (user.role !== "RECRUITER") redirect("/login");
  return <SidebarLayout>{children}</SidebarLayout>;
}
```

### 10.3 API Client Configuration

**Axios instance (lib/api.ts):**
```typescript
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  timeout: 10_000,
});

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem("jwt");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("jwt");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
```

**Typed API calls:**
```typescript
// Example: fetch recruiter's candidates
export async function fetchCandidates(jobId?: number): Promise<Application[]> {
  const { data } = await api.get("/api/v1/recruiters/applications", {
    params: jobId ? { jobId } : {},
  });
  return data;
}

// Example: record decision
export async function recordDecision(appId: number, req: DecisionRequest) {
  return api.post(`/api/v1/applications/${appId}/decision`, req);
}
```

### 10.4 Key Components

| Component | Behavior |
|-----------|---------|
| `AuthProvider` | JWT context + role-based redirect on login. Reads token from localStorage on mount. |
| `ExamInterface` | Displays one question at a time, countdown timer per question, submits on timeout, shows progress (question N of M). |
| `XaiDownloadButton` | Calls `/api/feedback/{appId}/xai-report`, receives Blob, creates `<a>` link, auto-clicks. Handles "not ready yet" with 5s retry. |
| `KanbanBoard` | Drag-and-drop across status columns using `@hello-pangea/dnd`. On drop: calls `PATCH /applications/{id}/status`. |
| `FunnelChart` | Recharts `FunnelChart` showing SUBMITTED → SCREENING → EXAM → SHORTLISTED → SELECTED counts from dashboard API. |
| `CandidateDetailModal` | Slide-over (Sheet) showing CV score, exam score, final score, hard-filter badge, decision notes, XAI download button. |
| `UserTable` | Admin user list with action menu: Activate / Suspend / Block (calls PATCH `/admin/users/{id}/status`). |
| `AuditLogTable` | Paginated, filtered by date range and actor. Displays action, target, IP, timestamp. |

### 10.5 Exam Interface Implementation

The exam page is the most stateful component. It uses a polling model and local timer.

```typescript
// candidate/exams/page.tsx (simplified)
"use client";
export default function ExamPage() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    // Start exam on mount
    api.post(`http://localhost:8090/exams/start`, { jobId })
       .then(res => { setQuestion(res.data.question); setTimeLeft(res.data.timeLimit); });
  }, []);

  useInterval(() => {
    setTimeLeft(t => {
      if (t <= 1) { submitAnswer(); return 0; }  // auto-submit on timer expiry
      return t - 1;
    });
  }, 1000);

  const submitAnswer = async () => {
    await api.post("http://localhost:8090/exams/submit-answer", { questionId: question.id, answer });
    // Fetch next question
    const next = await api.get("http://localhost:8090/exams/next-question");
    if (next.data.completed) router.push("/candidate/applications");
    else { setQuestion(next.data.question); setAnswer(""); setTimeLeft(next.data.timeLimit); }
  };

  return (/* Timer display + question text + answer input + submit button */);
}
```

### 10.6 Build & Deployment

**Environment variables (.env.local / Docker):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_EXAM_ENGINE_URL=http://localhost:8090
```

**docker-compose frontend service:**
```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
  ports:
    - "3000:3000"
  environment:
    - NEXT_PUBLIC_API_URL=http://backend:8080
  depends_on:
    - backend
```

**Dockerfile (multi-stage build):**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

**TypeScript + Tailwind configuration (tsconfig.json + tailwind.config.ts):**
- `strict: true` — all types explicit, no implicit any
- Path aliases: `@/*` → `src/*`
- Tailwind custom colors: `primary: #1a237e`, `accent: #1565c0` matching the brand
- ESLint + Prettier enforced in CI

---

## 11. AI/ML Implementation

This section expands the AI/ML implementation details, covering data preprocessing, embedding pipelines, short-answer grading, explainability (LIME), bias detection, model serving, monitoring, and operational considerations. The goal is to make the design reproducible, auditable, and performant while remaining explainable and privacy-preserving.

### 10.1 AI Environment & Key Libraries

Recommended Python runtime: `python 3.11+`.

Install core libraries used by the AI service:

```bash
pip install sentence-transformers torch torchvision
pip install fastapi uvicorn[standard] pydantic
pip install lime reportlab matplotlib
pip install redis faiss-cpu pdfminer.six python-magic
```

- **Sentence-Transformers**: `all-MiniLM-L6-v2` for dense, semantic embeddings (384 dims). Chosen for speed/accuracy trade-off in scoring CV ↔ job descriptions.
- **Ollama**: local LLM used for nuanced grading and textual justification. Runs as a host service and is invoked via HTTP.
- **LIME**: Local interpretable explanations for attributed features in CV text.
- **FAISS** (optional): approximate nearest neighbor index for fast ranking at scale.
- **Redis**: caching embeddings, CV text, temporary exam session state, and OTPs.

Model versioning: store model name + checksum in `ai_model_versions` table. Use semantic version tags (e.g., `sbert_all-MiniLM-L6-v2@2026-05-01`).

### 10.2 Data Ingestion & Preprocessing

1. PDF → text: extract text using `pdfminer.six` (or Tika) with these steps:
   - Normalize whitespace and newlines.
   - Remove headers/footers heuristically (first/last 3 lines repeated across pages).
   - Preserve bullet tokens and section headings (e.g., EDUCATION:, EXPERIENCE:) to help LIME and tokenization.
2. Language detection: verify English (fasttext or langdetect); if non-English, mark for manual review.
3. Text cleaning: remove non-printable chars, normalize unicode, expand common contractions.
4. Chunking: for very long CVs, split into 512–1024 token chunks and compute per-chunk embeddings; aggregate by mean-pooling and by max to capture both typical and salient features.

Caching: after encoding, store embeddings in Redis (or local disk) keyed by `emb:cv:{application_id}` with TTL configurable (e.g., 7 days). Reuse during XAI and ranking to avoid re-encoding.

### 10.3 Embedding & Scoring Pipeline

Core algorithm (CV ↔ Job Description relevance):

1. Encode job description and CV (aggregated) using SBERT → 384-dim vectors.
2. Optionally L2-normalize embeddings for cosine similarity via dot product:

   score = dot(u_normalized, v_normalized)  # range [-1,1] → map to [0,1]

3. Hard filter: configurable threshold `T_hard` (e.g., 0.35). If score < T_hard, candidate is blocked from exam.

4. Calibration: periodically calibrate `T_hard` using labeled historical data (precision/recall trade-off). Use ROC curve and choose threshold to meet target false-negative rate.

5. Ranking: for recruiter dashboards, compute final ranking score as a weighted combination:

   final_rank = w_cv * cv_score + w_exam * (exam_score/100) + w_experience * exp_factor

   Weights are configurable in admin UI and versioned per job.

Example encoding snippet:

```python
from sentence_transformers import SentenceTransformer
from numpy.linalg import norm
import numpy as np

model = SentenceTransformer('all-MiniLM-L6-v2')

def embed_text(text: str) -> np.ndarray:
   emb = model.encode(text, show_progress_bar=False)
   return emb / (norm(emb) + 1e-12)

def cv_jd_score(cv_text: str, jd_text: str) -> float:
   e_cv = embed_text(cv_text)
   e_jd = embed_text(jd_text)
   return float(np.dot(e_cv, e_jd)) * 0.5 + 0.5  # map [-1,1] → [0,1]
```

Performance: single encode ~60–120ms on CPU depending on hardware. Parallelize encoding for batches using worker threads or process pool.

### 10.4 Short-Answer Grading (Hybrid SBERT + LLM)

Approach: combine a deterministic semantic-similarity signal (SBERT) with a calibrated LLM evaluation from Ollama.

Steps:
1. Preprocess both student answer and `ideal_answer` (normalize punctuation, lowercasing optional depending on model).
2. Compute SBERT cosine similarity (similarity_score ∈ [0,1]).
3. Call Ollama with a compact grading prompt that asks for a numeric score (0–10) and a short rationale. Example prompt template:

```
You are an unbiased grader. Given the ideal answer and a student's answer, output a JSON: {"score": <0-10>, "reason": "..."}.
Ideal: <ideal_answer>
Student: <student_answer>
Criteria: correctness, completeness, relevance, language clarity.
```

4. Parse LLM response to extract `llm_score` then normalize to [0,1].
5. Combine: final_score = alpha * similarity_score + (1-alpha) * llm_score, where alpha is tuned (default alpha = 0.6).

Fail-safes & timeouts:

- Ollama calls have a timeout (e.g., 4s). On timeout, fallback to SBERT-only score.
- Use concurrency limits (token quota) and a small worker pool to avoid resource saturation.

Example grading code sketch:

```python
def grade_short_answer(student_answer, ideal_answer, alpha=0.6):
   sim = cosine_similarity(embed_text(student_answer), embed_text(ideal_answer))
   try:
      llm_resp = call_ollama_grade(student_answer, ideal_answer, timeout=4.0)
      llm_score = float(llm_resp['score']) / 10.0
   except Exception:
      llm_score = sim
   return alpha * sim + (1 - alpha) * llm_score
```

Evaluation: validate using labeled grader data. Use mean absolute error (MAE) and inter-rater agreement (Cohen's kappa) against human graders.

### 10.5 Explainability: LIME Integration & Implementation Details

Goals: produce human-interpretable explanations (top contributing words/phrases) for CV scoring so recruiters and candidates can understand why a candidate scored as they did.

Implementation notes:

- LIME works with a `classifier_fn` that maps text → scalar score. For SBERT, the function re-encodes perturbations and returns scores relative to the job description vector.
- Perturbation strategy: mask or remove tokens, not random character edits, and respect sentence boundaries when possible.
- Sampling: 300 perturbations is a good balance for stability and latency (4–8s). For larger CVs use hierarchical LIME: explain per-section then aggregate.
- Post-process: map token-level weights to normalized percentage contributions and select top-N (default 10) positive and negative contributors.

Example LIME usage adapted for SBERT scoring:

```python
from lime.lime_text import LimeTextExplainer

explainer = LimeTextExplainer(class_names=['score'])

def sbert_score_fn(texts: list[str]) -> np.ndarray:
   # returns shape (n_samples,) of scores in [0,1]
   embs = [embed_text(t) for t in texts]
   job_emb = embed_text(job_description)
   return np.array([float(np.dot(e, job_emb)) * 0.5 + 0.5 for e in embs])

exp = explainer.explain_instance(cv_text, classifier_fn=sbert_score_fn, num_features=20, num_samples=300)
features = exp.as_list()
```

Deliverable: PDF with bar-chart of top feature weights plus a short LLM-generated justification paragraph describing the key strengths/weaknesses.

### 10.6 Bias Detection

Detect biased or exclusionary language in job descriptions using a mixed approach:

1. Rule-based lexicons: curated lists for gendered terms ("rockstar", "ninja"), age-related terms, and culturally specific words.
2. Classifier: lightweight fine-tuned classifier (distilbert or SBERT-based) trained on labeled job-post data for bias categories (gendered, age, vague, militaristic).
3. Explainability: highlight flagged terms and provide suggested neutral alternatives.

Output: `{"biasScore": 0.0-1.0, "flaggedTerms": [...], "categoryScores": {...}, "suggestions": [...]}`.

### 10.7 Model Serving, Scalability & Operational Considerations

- FastAPI endpoints expose single-purpose routes: `/score-cv`, `/grade-answer`, `/xai/report`, `/bias/analyze`, `/health`.
- Use `uvicorn --workers N` behind an internal load balancer for concurrency; prefer fewer workers and async calls to Ollama.
- Rate limiting: per-recruiter and per-candidate quotas to avoid abuse during demos.
- Embedding batching: when scoring many CVs, encode JDs once and batch CV encodes to amortize costs.
- FAISS index: for large volumes (>10k CVs), maintain a FAISS index for quick nearest-neighbor ranking; refresh nightly or incrementally.
- Monitoring: track metrics—latency, throughput, error rate, median/95th-percentile encode times, Ollama timeouts, LIME duration. Export metrics to Prometheus and visualize in Grafana.

### 10.8 Model Evaluation, Versioning & Human-in-the-loop

- Evaluation dataset: keep a labeled set of past applications with human-assigned CV and SA scores. Regularly compute ROC AUC, precision@k, MAE for SA grading.
- Model drift detection: monitor distributional shift on embedding norms and feature importances; trigger review when shift > threshold.
- Human-in-the-loop: provide recruiter override for hard-filtered candidates with a reason; log overrides for model retraining.
- Retraining cadence: quarterly or when drift triggers; keep training pipelines reproducible with recorded random seeds and dataset snapshots.

### 10.9 Safety, Privacy & Reproducibility

- No external LLM APIs: Ollama runs locally for data sovereignty.
- PII handling: store only parsed CV text when necessary; mask or redact sensitive fields for ML pipelines used for research.
- Reproducibility: record model checksums, dependency `requirements.txt`, and Docker image digests in `ai_model_versions`.

---


---

## 12. Security Implementation

### 11.1 Authentication

| Mechanism | Detail |
|-----------|--------|
| Password hashing | BCrypt (10 rounds) |
| JWT signing | HMAC-SHA512 (HS512) |
| Token expiry | 24 hours |
| OTP | 6-digit, Redis-cached, 5-min TTL |
| Account lockout | 5 failed attempts → 15-min block |

### 11.2 Authorization (RBAC)

```java
@IsRecruiter    // Role = RECRUITER only
@IsCandidate    // Role = CANDIDATE only
@IsAdmin        // Role = SUPER_ADMIN only
@IsAuthenticated // Any authenticated user
```

### 11.3 Service-to-Service Security

All internal calls carry `X-Internal-Api-Key` header. API key shared via environment variable, never exposed to frontend.

### 11.4 Data Protection

- HTTPS for all client traffic
- Internal services communicate over Docker network
- Sensitive config in `.env` (gitignored)
- No PII in logs

---

## 13. DevOps & Containerization

### 12.1 Docker Compose Configuration

```yaml
services:
  postgres:    # Port 5432
  redis:       # Port 6379
  backend:     # Port 8080, depends_on: postgres, redis
  frontend:    # Port 3000, depends_on: backend
  exam-engine: # Port 8090, depends_on: redis
  ai-service:  # Port 8000
```

### 12.2 Environment Variables

| Variable | Service | Purpose |
|----------|---------|---------|
| JWT_SECRET | backend, exam-engine | Token signing (min 256 bits) |
| INTERNAL_API_KEY | all services | Service-to-service auth |
| DB_URL | backend | PostgreSQL connection |
| REDIS_URL | backend, exam-engine | Redis connection |
| OLLAMA_BASE_URL | ai-service | LLM endpoint |
| MAIL_HOST/PORT/USER/PASS | backend | SMTP delivery |
| AI_SERVICE_URL | backend | AI service base URL |
| EXAM_ENGINE_URL | backend | Exam engine base URL |

### 12.3 Build & Run

```bash
# Build all services
docker compose build

# Start full stack
docker compose up -d

# Verify health
docker compose ps
# Expected: 6 containers running

# View logs
docker compose logs -f backend
```

### 12.4 Flyway Migrations

- Run automatically on Spring Boot startup
- Versioned SQL files in `src/main/resources/db/migration/`
- Tracked in `flyway_schema_history` table
- Schema changes require new migration file (never modify existing)

---

## 14. Integration Implementation

### 13.1 Spring Boot ↔ AI Service

| Endpoint | Direction | Purpose |
|----------|-----------|---------|
| POST `/api/v1/score-cv` | Spring → AI | Score CV after upload |
| POST `/api/v1/xai/report` | Spring → AI | Build XAI PDF |
| GET `/api/v1/xai/report/{id}` | Spring → AI | Proxy PDF download |
| POST `/api/v1/grade-answer` | Exam → AI | Grade short-answer |

### 13.2 Spring Boot ↔ Exam Engine

| Endpoint | Direction | Purpose |
|----------|-----------|---------|
| POST `/api/v1/batches/ready` | Spring → Exam | Initiate exam batch |
| GET `/api/v1/internal/exams/{id}/questions` | Exam → Spring | Fetch questions |
| POST `/api/v1/internal/exam-completed` | Exam → Spring | Report score |

### 13.3 HTTP/1.1 Enforcement

```java
// All inter-service RestClient instances use:
var httpClient = HttpClient.newBuilder()
    .version(HttpClient.Version.HTTP_1_1)
    .build();
var requestFactory = new JdkClientHttpRequestFactory(httpClient);
RestClient.builder().requestFactory(requestFactory).build();
```

**Reason:** uvicorn (ASGI) rejects HTTP/2 upgrade requests from Spring's default client.

---

## 15. Key Technical Challenges Resolved

| # | Challenge | Root Cause | Solution |
|---|-----------|-----------|----------|
| 1 | JWT rejected by exam-engine | Go auth only supported HS256 | Added HS512 case with `sha512.New` |
| 2 | HTTP/2 upgrade rejected | Spring default → h2, uvicorn rejects | `JdkClientHttpRequestFactory` + HTTP_1_1 |
| 3 | Grading race condition | Two goroutines each published callback | WaitGroup → single atomic update |
| 4 | Optimistic lock on XAI save | Async thread stale version | Native `@Modifying @Query` |
| 5 | PDF returned 57 bytes | UrlResource didn't proxy | RestClient → ByteArrayResource |
| 6 | LazyInitializationException | @Async outside Hibernate session | Added @Transactional |
| 7 | matplotlib color format | `ACCENT.hexval()` = `0x2e86c1` | Hardcoded `"#2e86c1"` |
| 8 | No ideal_answer for SA | SHORT_ANSWER had empty correct_answer | V12 migration + entity update |
| 9 | CV text cache miss | Redis expired before XAI build | Fallback: job description as proxy |
| 10 | XAI GET requires auth | Router-level dependency on internal key | Separate public_router |

---

## 20. Implementation Timeline

The project ran from December 2025 through May 2026 over three delivery phases, each building on the previous. Each phase ended with a working, demonstrable increment.

### 20.1 Phase 1 — Core Platform (December 2025 – January 2026)

**Goal:** Working registration-to-application flow with job management and basic recruiter view.

| Sprint | Deliverable |
|--------|------------|
| Sprint 1 (Dec 2025) | Project setup — Spring Boot scaffold, PostgreSQL, Docker Compose, JWT auth (register, login, OTP verify), V1–V2 migrations |
| Sprint 2 (Dec 2025) | Job posting CRUD (DRAFT → OPEN → CLOSED), candidate job browsing, application submission with PDF upload |
| Sprint 3 (Jan 2026) | Recruiter dashboard skeleton, application list, V3 (availability slots), V4 (audit logs), basic RBAC enforcement |
| Sprint 4 (Jan 2026) | Frontend pages: login, register, OTP, candidate portal (jobs, applications), recruiter dashboard, Docker multi-stage builds |

**Phase 1 Deliverable:** Candidates can register, browse jobs, and apply with CV uploads. Recruiters can post and manage jobs. No AI components yet.

**Key decisions in this phase:**
- Chose Spring Boot over FastAPI as the core orchestrator for its mature transaction support and Spring Security ecosystem.
- Flyway selected for schema versioning (over Liquibase) for its simpler SQL-native migration format.
- JWT HS512 (not RS256) chosen to avoid PKI complexity in a student project context.

### 20.2 Phase 2 — AI Features (February – March 2026)

**Goal:** End-to-end intelligent screening + exam engine + XAI reports.

| Sprint | Deliverable |
|--------|------------|
| Sprint 5 (Feb 2026) | AI service scaffold (FastAPI), SBERT `all-MiniLM-L6-v2` integration, `/score-cv` endpoint, V6 migration (cv_relevance_score, hard_filter_passed), async CV scoring on application submit |
| Sprint 6 (Feb 2026) | Exam engine (Go/Gin) scaffold, Redis session management, batch-ready handler, question delivery, MCQ instant grading, V7 migration (exam_score, final_score) |
| Sprint 7 (Feb 2026) | Short-answer grading pipeline: Ollama integration in AI service, Go goroutine worker pool, exam-completed callback to Spring, V8 (xai_report_url), V9 (decision_notes) |
| Sprint 8 (Mar 2026) | LIME attribution engine, ReportLab PDF generation, XAI report delivery pipeline (async @Async, native query bypass, ByteArrayResource proxy), V10 (optimistic locking) |
| Sprint 9 (Mar 2026) | Bias detection module, admin panel foundation, V11 (seed data), V12 (ideal_answer + backfill), recruiter pipeline (Kanban), interview scheduling |

**Phase 2 Deliverable:** Full AI pipeline working — CV scored, exam completed, XAI PDF generated, bias warning at job creation.

**Key bugs resolved in this phase (cross-reference Section 15):**
- D-1 JWT HS512 fix in exam engine
- D-2 ideal_answer backfill (V12)
- D-3 WaitGroup race condition fix
- D-4 @Transactional on async methods
- D-5 HTTP/1.1 enforcement
- D-6 native SQL for XAI URL save
- D-7 matplotlib color format fix
- D-8 PDF ByteArrayResource fix

### 20.3 Phase 3 — Polish & Defense Preparation (April – May 2026)

**Goal:** Admin panel complete, recruiter analytics, all bugs resolved, documentation written, 215 test cases executed.

| Sprint | Deliverable |
|--------|------------|
| Sprint 10 (Apr 2026) | Admin panel: user management (create recruiter, suspend, block, activate), jobs oversight, audit logs, analytics export (CSV) |
| Sprint 11 (Apr 2026) | Admin config page (AI model version management), recruiter reports page, dashboard funnel chart + job cards with live data |
| Sprint 12 (Apr 2026) | End-to-end testing: all 215 test cases executed, defects logged and resolved, smoke tests, security RBAC matrix validation |
| Sprint 13 (May 2026) | Documentation sprint: SRS, SDS, TPD, UMD finalized; PRESENTATION.md and defense materials prepared |

**Phase 3 Deliverable:** Production-ready system with complete documentation and passing test suite.

### 20.4 Timeline Summary

```
Dec 2025     Jan 2026      Feb 2026      Mar 2026      Apr 2026      May 2026
    |------------|------------|------------|------------|------------|
    [=Phase 1: Core Platform=]
                             [======Phase 2: AI Features======]
                                                        [=Phase 3: Polish & Docs=]
                                                                        ^ Defense
```

| Milestone | Date |
|-----------|------|
| Core platform working | January 31, 2026 |
| CV scoring + exam engine | February 28, 2026 |
| Full AI pipeline (XAI, bias) | March 31, 2026 |
| All bugs resolved, admin complete | April 30, 2026 |
| Documentation complete | May 20, 2026 |
| Defense presentation | May 27, 2026 |

---

## 21. Risk & Issue Management

This section documents identified risks by category, their probability/impact rating, and the mitigation strategies applied during the project.

### 21.1 Technical Risks

| Risk | Probability | Impact | Status |
|------|------------|--------|--------|
| Microservice communication failure (HTTP/2 rejection) | Medium | High | **Resolved** — HTTP/1.1 enforced |
| Exam grading race condition (duplicate callbacks) | Medium | Critical | **Resolved** — WaitGroup pattern |
| JWT algorithm mismatch between services | Low | Critical | **Resolved** — HS512 dual-support |
| JPA optimistic lock conflict on async XAI save | Medium | High | **Resolved** — native SQL UPDATE |
| PDF streaming truncation (57-byte response) | Low | High | **Resolved** — ByteArrayResource |
| LazyInitializationException in async context | Medium | High | **Resolved** — @Transactional on async method |
| Ollama LLM timeout under load | Medium | Medium | **Mitigated** — 4s timeout + SBERT fallback |
| Redis session expiry during long exam | Low | High | **Mitigated** — TTL = exam duration + 30 min buffer |
| PostgreSQL connection pool exhaustion | Low | High | **Mitigated** — HikariCP max-pool-size=20 |

**Residual technical risks (open):**
- No load testing performed — concurrent exam behavior under >50 sessions not verified.
- CV text extraction fails on scanned/image-only PDFs — pdfminer.six requires text-layer PDFs.

### 21.2 Security Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| JWT token forgery | Low | Critical | HS512 signing with 256-bit secret; key never exposed |
| Internal API key exposure | Low | Critical | Key in `.env` (gitignored), Docker network only, never in logs |
| Unauthorized XAI report access | Low | High | Ownership check: candidate must own application; recruiter must own job |
| RBAC bypass via endpoint | Low | Critical | Spring Security filter chain + role annotations on all non-public endpoints |
| Brute force login | Medium | Medium | Account lockout: 5 attempts → 15-min Redis block |
| SQL injection | Low | Critical | Spring Data JPA parameterized queries; no raw SQL except `@Modifying @Query` with bound params |
| Sensitive data in logs | Low | High | PII fields (email, CV text) excluded from log statements |

**Security controls applied:**
- Passwords: BCrypt(10) — not reversible
- Secrets: `.env` file gitignored; no secrets in Docker image layers
- Internal services: communicate only on Docker internal network (not exposed externally)
- HTTPS: required in production; development uses HTTP internally

### 21.3 AI Model Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| SBERT threshold miscalibration (too strict/lenient) | Medium | High | Threshold configurable per-job in admin; default 0.35 tuned on sample CVs |
| Ollama grading inconsistency (LLM variability) | High | Medium | Hybrid approach: alpha=0.6 SBERT + 0.4 Ollama reduces variance |
| LIME instability (300 samples is low) | Medium | Medium | Accepted trade-off (speed vs stability); 2000+ samples for production |
| Model bias in scoring (demographic) | Medium | High | Bias detection module warns recruiters; XAI report provides transparency |
| Ollama model not loaded at startup | Low | Critical | Health check fails and Docker restarts container; startup validation |
| CV text extraction quality (noise from PDF) | Medium | Medium | Preprocessing: normalize whitespace, remove repeated headers |

**AI operational safeguards:**
- SBERT model loaded as singleton at startup — no per-request loading overhead
- Ollama timeout: 4 seconds per call with automatic fallback to SBERT-only scoring
- `ai_model_versions` table tracks active model name + checksum for auditability
- Human override: recruiters can override hard-filter decisions with recorded reason (audit trail)

### 21.4 Mitigation Strategy Summary

| Strategy | Applied To |
|----------|-----------|
| **Collect-then-publish** pattern | Goroutine grading — prevents duplicate callbacks |
| **HTTP/1.1 enforcement** | All inter-service RestClient instances |
| **@Transactional on @Async methods** | All async Spring methods touching JPA |
| **Native SQL for version-bypassed updates** | XAI URL, any async partial update |
| **Fallback scoring** | LLM timeout → SBERT-only grade |
| **Redis TTL buffer (+30 min)** | Exam sessions survive slow connections |
| **Configurable thresholds** | Hard filter, bias score, SA alpha weight |
| **Audit logs** | All admin actions, decision recording, model changes |
| **GitIgnore for secrets** | `.env`, model artifacts, credentials |
| **Account lockout** | 5 failed attempts → 15-min Redis block |

---

# PART IV — User Manual Documentation (UMD)

## 15. Getting Started

### 15.1 System Requirements

| Requirement | Minimum |
|-------------|---------|
| Browser | Chrome 90+, Firefox 88+, Edge 90+ |
| Internet | Required for email notifications |
| Screen | 1280×720 minimum resolution |

### 15.2 Accessing the System

Navigate to `http://localhost:3000` (development) or the deployed URL.

---

## 16. Candidate User Guide

### 16.1 Registration

1. Click **"Register"** on the landing page
2. Fill in: Full Name, Email, Phone, Password
3. Click **"Register"**
4. Check email for 6-digit OTP code
5. Enter OTP on verification page
6. Account activated — redirected to login

### 16.2 Applying for a Job

1. Login with your credentials
2. Navigate to **"Jobs"** section
3. Browse available positions
4. Click **"Apply"** on desired job
5. Upload CV (PDF format, max 10MB)
6. Click **"Submit Application"**
7. You'll see confirmation with application ID

### 16.3 Taking an Exam

1. After CV passes hard filter, you'll receive exam notification
2. Navigate to **"Exams"** section
3. Click **"Start Exam"** (only available during exam window)
4. Answer questions one at a time:
   - **MCQ:** Select one correct answer
   - **Short Answer:** Type your response
5. Click **"Submit"** for each question
6. After final question, exam auto-completes
7. Results appear in your applications page

### 16.4 Viewing Results & XAI Report

1. Go to **"My Applications"**
2. Click on an application to see details
3. View scores: CV score, Exam score, Final score
4. If decision recorded, click **"Download XAI Report"**
5. PDF opens with:
   - Score breakdown
   - Top CV keywords that impacted your score
   - Justification paragraph explaining the decision

### 16.5 Interview Booking

1. If shortlisted, navigate to **"Interviews"**
2. View available time slots
3. Click on preferred slot
4. Confirm booking
5. Email reminder sent before interview

---

## 17. Recruiter User Guide

### 17.1 Dashboard Overview

After login, the recruiter dashboard shows:
- **Funnel chart:** Application counts per stage
- **Job cards:** Each job with screening/exam/interview/decided counts
- **Quick actions:** Create job, view candidates

### 17.2 Creating a Job

1. Click **"Create Job"**
2. Fill in:
   - Title, Description, Location, Salary range
   - Requirements and qualifications
   - Exam date and duration
3. Click **"Save"** (saves as DRAFT)
4. Click **"Publish"** to make visible to candidates
5. Bias detection runs automatically — review warnings if any

### 17.3 Adding Exam Questions

1. Navigate to the job detail
2. Click **"Exam"** tab
3. Add questions (5 per exam):
   - **MCQ:** Question text + 4 options + correct answer index
   - **SHORT_ANSWER:** Question text + ideal answer
4. Set marks per question
5. Click **"Authorize Exam"** to enable for candidates

### 17.4 Reviewing Candidates

1. Navigate to **"Candidates"** page
2. View table with all applications across your jobs
3. Use search/filter to narrow results
4. Click a candidate row to open detail modal:
   - CV score, Exam score, Final score
   - Hard filter status
   - Decision notes (if recorded)
   - XAI report download button

### 17.5 Pipeline (Kanban) View

1. Navigate to **"Pipeline"**
2. Cards organized by status columns:
   - SUBMITTED → AI_SCREENING → EXAM_AUTHORIZED → EXAM_COMPLETED → SHORTLISTED → INTERVIEW_SCHEDULED → DECIDED
3. Drag cards to advance status (where allowed)

### 17.6 Recording Decisions

1. Select candidate(s) from SHORTLISTED or INTERVIEW_SCHEDULED
2. Click **"Record Decision"**
3. Choose: SELECTED / REJECTED / WAITLISTED
4. Add decision notes (optional)
5. Click **"Confirm"**
6. XAI report generates automatically in background
7. Candidate receives email notification

### 17.7 Downloading XAI Report

1. From candidate detail or candidates table
2. Click **"Download XAI Report"** button
3. PDF downloads with:
   - Score summary (CV, Exam, Final)
   - LIME attribution chart (top 10 keywords)
   - LLM justification text
   - Hard filter status

### 17.8 Interview Slot Management

1. Navigate to **"Interviews"**
2. Click **"Add Availability"**
3. Select date, start time, end time
4. Slots appear for shortlisted candidates to book
5. View calendar of booked interviews

---

## 18. Administrator User Guide

### 18.1 User Management

1. Navigate to **"Admin > Users"**
2. View all system users (admins, recruiters, candidates)
3. Actions available:
   - **Create Recruiter:** Add new recruiter account
   - **Suspend:** Temporarily disable access
   - **Block:** Permanently block
   - **Activate:** Restore access

### 18.2 Job Oversight

1. Navigate to **"Admin > Jobs"**
2. View all jobs across all recruiters
3. Monitor active recruitment drives

### 18.3 AI Model Management

1. Navigate to **"Admin > Config"**
2. View registered AI model versions
3. Register new model version
4. Activate/deactivate models

### 18.4 Audit Logs

1. Navigate to **"Admin > Logs"**
2. View chronological activity trail
3. Filter by user, action type, date range
4. Entries show: who did what, when, from where

### 18.5 Analytics Export

1. Navigate to **"Admin > Dashboard"**
2. View system stats (user counts, application metrics)
3. Click **"Export CSV"** for downloadable data

---

## 19. Troubleshooting

| Issue | Solution |
|-------|----------|
| OTP not received | Check spam folder; click "Resend OTP" |
| Exam won't start | Check exam window (not before/after scheduled time) |
| XAI report not available | Wait 5–15 seconds after decision; refresh page |
| Login fails | Verify email/password; check if account is SUSPENDED |
| CV upload rejected | Ensure PDF format, under 10MB |
| Forgot password | Use "Forgot Password" flow (email OTP + new password) |

---

# PART V — Test Plan Documentation (TPD)

## 20. Test Objective & Scope

### 20.1 Purpose

Validate all functional requirements, inter-service communication, security controls, AI scoring, and XAI report generation across the EAA-Recruit platform.

### 20.2 Quality Targets

| Metric | Target |
|--------|--------|
| Critical defects at release | < 5 per module |
| Backend test coverage | > 80% |
| API response time (95th percentile) | < 500ms |
| Concurrent exam handling | Zero data corruption |

### 20.3 In-Scope Modules

| Module | Features | Test Cases |
|--------|----------|------------|
| Authentication & Authorization | 7 features | 25 |
| Job Management | 6 features | 12 |
| Application & CV Screening | 6 features | 18 |
| Exam Engine | 12 features | 30 |
| Interview Scheduling | 3 features | 10 |
| Decision & XAI Report | 6 features | 20 |
| Admin Module | 6 features | 15 |
| Frontend Pages | 25 pages | 50 |
| Cross-Service Integration | 9 scenarios | 15 |
| Security & RBAC | Full matrix | 20 |
| **Total** | | **215 test cases** |

---

## 21. Test Strategy

### 21.1 Testing Levels

```
Level 4:  E2E Tests (Browser)        — Manual + Selenium
Level 3:  Integration Tests          — Spring Boot @SpringBootTest, Docker
Level 2:  API / Contract Tests       — REST endpoint validation
Level 1:  Unit Tests                 — JUnit 5, Go testing, pytest
```

### 21.2 Testing Types

| Type | Tools | Priority |
|------|-------|----------|
| Unit Testing | JUnit 5, Go `testing`, pytest | P0 |
| Integration Testing | Spring Boot Test, Testcontainers | P0 |
| API Testing | curl, Postman | P0 |
| End-to-End Testing | Manual + browser | P1 |
| Security Testing | OWASP ZAP, manual | P0 |
| Cross-Service Testing | Docker Compose | P0 |

### 21.3 Test Design Techniques

- **Equivalence Partitioning:** Valid/invalid inputs
- **Boundary Value Analysis:** Score ranges, pagination limits
- **State Transition:** Application lifecycle (10 states)
- **Decision Table:** RBAC matrix (role × endpoint × method)
- **Error Guessing:** Race conditions, stale JWT, concurrent submissions

---

## 22. Test Environment

### 22.1 Architecture

```
Frontend (Next.js :3000)
    → Backend (Spring Boot :8080)
        → Exam Engine (Go :8090)
        → AI Service (Python :8000)
        → PostgreSQL (:5432)
        → Redis (:6379)
        → Ollama (:11434)
```

### 22.2 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| SUPER_ADMIN | admin@eaa.dz | Test1234! |
| RECRUITER | recruiter-demo@eaa.dz | Test1234! |
| CANDIDATE | alice.good@demo.test | Test1234! |

### 22.3 Starting Test Environment

```bash
docker compose up -d
# Verify: docker compose ps → 6 containers running
```

---

## 23. Test Scenarios (Key)

### 23.1 Exam Engine End-to-End

| Step | Action | Expected |
|------|--------|----------|
| 1 | Recruiter authorizes exam batch | Batch-ready sent to exam-engine |
| 2 | Candidate starts exam (JWT auth) | First question returned |
| 3 | Submit 3 MCQ correct | Score incremented per question |
| 4 | Submit 2 SHORT_ANSWER | Async AI grading dispatched |
| 5 | All grading completes | Single exam-completed callback |
| 6 | Application updated | exam_score set, status → EXAM_COMPLETED |

### 23.2 XAI Report Generation

| Step | Action | Expected |
|------|--------|----------|
| 1 | Recruiter records SELECTED decision | Async XAI build triggered |
| 2 | LIME attribution computed (300 samples) | Feature weights extracted |
| 3 | PDF generated with charts | 30-50KB file created |
| 4 | downloadUrl stored on application | DB updated via native query |
| 5 | Recruiter downloads report | Full PDF streamed (ByteArrayResource) |
| 6 | Candidate downloads same report | Same PDF, own-application check passes |

### 23.3 Security (RBAC)

| Endpoint | CANDIDATE | RECRUITER | ADMIN |
|----------|-----------|-----------|-------|
| POST /applications | ALLOW | DENY | DENY |
| GET /recruiters/dashboard | DENY | ALLOW | DENY |
| POST /applications/{id}/decision | DENY | ALLOW | DENY |
| GET /admin/users | DENY | DENY | ALLOW |
| GET /applications/{id}/xai-report | ALLOW* | ALLOW* | DENY |

*own application / own job only

---

## 24. Known Resolved Defects

| # | Defect | Root Cause | Fix |
|---|--------|-----------|-----|
| D-1 | Exam engine rejects Spring JWT | HS512 not supported | Added HS512 with sha512.New |
| D-2 | Short-answer 422 error | Empty idealAnswer | V12 migration + backfill |
| D-3 | Duplicate exam-completed | Each goroutine published | WaitGroup atomic collection |
| D-4 | LazyInitializationException | @Async outside session | Added @Transactional |
| D-5 | HTTP/2 rejection | Default h2 upgrade | HTTP/1.1 enforced |
| D-6 | Optimistic lock conflict | Stale version | Native UPDATE query |
| D-7 | matplotlib color error | ReportLab hex format | Hardcoded "#2e86c1" |
| D-8 | PDF 57 bytes | UrlResource streaming | RestClient + ByteArrayResource |
| D-9 | Grading too generous | Threshold < vs <= | Changed to `<= 0.3` |
| D-10 | Exam engine crash | JWT_SECRET not in docker-compose | Added env var |

---

## 25. Entry & Exit Criteria

### Entry Criteria
- All services compile and start successfully
- Flyway migrations run (V1–V12)
- Docker Compose: 6 containers healthy
- Test data seeded

### Exit Criteria
- All P0 test cases: 100% pass
- All P1 test cases: >= 95% pass
- No open Critical/Blocker defects
- Cross-service integration: 100% pass
- Security: No auth bypass found

---

## 26. Automated Test Coverage

### Backend (Spring Boot) — 41 test classes
- Entity, Repository, Service, Controller, Security, Scheduler, Cache, OTP

### Exam Engine (Go) — 6 test files
- Session, cache, shuffle, worker pool, auth, concurrent access

### AI Service (Python) — 8 test files
- Health, grading, similarity, keywords, bias, justification, ranking, cache

---

# APPENDICES

## Appendix A: API Endpoint Inventory

### Auth (`/api/v1/auth`)
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | /register/candidate | None |
| POST | /verify-otp | None |
| POST | /login | None |
| POST | /forgot-password | None |
| POST | /reset-password | None |

### Jobs (`/api/v1/jobs`)
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | / | JWT |
| POST | / | RECRUITER |
| GET | /mine | RECRUITER |
| PUT | /{id} | RECRUITER |
| POST | /{id}/archive | RECRUITER |

### Applications (`/api/v1/applications`)
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | / | CANDIDATE |
| GET | / | CANDIDATE |
| POST | /shortlist | RECRUITER |
| POST | /{id}/decision | RECRUITER |
| GET | /{id}/xai-report | AUTHENTICATED |

### Admin (`/api/v1/admin`)
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | /users | SUPER_ADMIN |
| POST | /users/recruiter | SUPER_ADMIN |
| PATCH | /users/{id}/status | SUPER_ADMIN |
| GET | /system/health | SUPER_ADMIN |
| GET | /audit-logs | SUPER_ADMIN |

### Exam Engine (port 8090)
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | /api/v1/batches/ready | API Key |
| GET | /exam/start | JWT |
| POST | /exam/submit-answer | JWT |
| GET | /exam/resume | JWT |

### Internal Callbacks
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | /api/v1/internal/exams/{id}/questions | API Key |
| POST | /api/v1/internal/exam-completed | API Key |
| POST | /api/v1/internal/applications/{id}/ai-score | API Key |

---

## Appendix B: Docker Compose Services

| Service | Image | Ports | Depends On |
|---------|-------|-------|-----------|
| postgres | postgres:16-alpine | 5432 | — |
| redis | redis:7-alpine | 6379 | — |
| backend | eaa-recruit/backend | 8080 | postgres, redis |
| frontend | eaa-recruit/frontend | 3000 | backend |
| exam-engine | eaa-recruit/exam-engine | 8090 | redis |
| ai-service | eaa-recruit/ai-service | 8000 | — |

---

## Appendix C: Application Status Transition Matrix

| From → To | AUTO | RECRUITER | CANDIDATE | ENGINE |
|-----------|------|-----------|-----------|--------|
| SUBMITTED → AI_SCREENING | ✓ | | | |
| AI_SCREENING → HARD_FILTER_FAILED | ✓ | | | |
| AI_SCREENING → EXAM_AUTHORIZED | | ✓ | | |
| EXAM_AUTHORIZED → EXAM_COMPLETED | | | | ✓ |
| EXAM_COMPLETED → SHORTLISTED | | ✓ | | |
| SHORTLISTED → INTERVIEW_SCHEDULED | | | ✓ | |
| SHORTLISTED → SELECTED/REJECTED/WAITLISTED | | ✓ | | |
| INTERVIEW_SCHEDULED → SELECTED/REJECTED/WAITLISTED | | ✓ | | |

---

## Appendix D: Performance Benchmarks

| Operation | Measured | Hardware |
|-----------|----------|----------|
| CV scoring (SBERT) | ~80ms | i7, 16GB RAM |
| LIME attribution (300 samples) | 4–8s | i7, 16GB RAM |
| Short-answer grading (Ollama) | 2–5s per question | i7, 16GB RAM |
| PDF generation | ~1s | i7, 16GB RAM |
| MCQ grading | < 1ms | Any |
| Full exam flow (5 questions) | 8–15s total | i7, 16GB RAM |

---

## References

1. Project Proposal: "EAA-Recruit — AI-Powered Recruitment Automation Platform". Group 18, Addis Ababa University. December 2025.
2. Ethiopian Data Protection Proclamation No. 1329/2023.
3. IEEE Std 830-1998, IEEE Recommended Practice for Software Requirements Specifications.
4. Sentence-Transformers Documentation. https://www.sbert.net/
5. LIME: "Why Should I Trust You?" Ribeiro et al., 2016. https://arxiv.org/abs/1602.04938
6. Spring Boot 3 Documentation. https://spring.io/projects/spring-boot
7. Go Documentation. https://go.dev/doc/
8. FastAPI Documentation. https://fastapi.tiangolo.com
9. Next.js Documentation. https://nextjs.org/docs
10. Ollama Documentation. https://ollama.ai
11. PostgreSQL 16 Documentation. https://www.postgresql.org/docs/16/
12. Docker Compose Documentation. https://docs.docker.com/compose/

---

*End of Final Project Document*
*EAA-Recruit — AI-Powered Recruitment Platform*
*Addis Ababa University, May 2026*
