# EAA Recruit — Architecture

## 1. System Overview

Four services communicate over REST and Kafka. PostgreSQL and Redis are shared infrastructure; ChromaDB is owned exclusively by the AI service.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Browser / Client                               │
│                   React 18 + TypeScript + Vite                          │
│          (Zustand auth, react-hook-form, Axios interceptors)            │
└────────────────────────────┬────────────────────────────────────────────┘
                             │ HTTPS REST  (Axios → /api/v1/*)
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Spring Boot — Core Orchestrator                      │
│                    Java 21 · Gradle · Port 8080                         │
│                                                                         │
│  Controllers   │  Services              │  Repositories                │
│  ─────────────  │  ─────────────────────  │  ──────────────────────────  │
│  Auth           │  CandidateRegistration  │  UserRepository             │
│  Job            │  ApplicationService     │  ApplicationRepository      │
│  Application    │  ExamService            │  JobPostingRepository       │
│  Exam           │  JobService             │  ExamRepository             │
│  Recruiter      │  AvailabilitySlot       │  QuestionRepository         │
│  AdminUser      │  HardFilter             │  AvailabilitySlotRepository │
│  AdminSystem    │  WeightedScoring        │  AuditLogRepository         │
│  Internal       │  FinalDecision          │  AiModelVersionRepository   │
│                 │  SlotBooking            │                             │
│                 │  AuditLog               │                             │
│                 │  SystemHealth           │                             │
└───────┬─────────┴──────────┬─────────────┴────────────┬────────────────┘
        │ JPA/JDBC            │ Kafka topics              │ REST callbacks
        ▼                     ▼                           ▼
┌──────────────┐   ┌──────────────────────┐   ┌─────────────────────────┐
│  PostgreSQL  │   │       Kafka          │   │  Python AI Service      │
│              │   │                      │   │  FastAPI · Port 8000    │
│  users       │   │  CV_UPLOADED    →AI  │   │                         │
│  job_posting │   │  EXAM_BATCH_READY→Go │   │  /cv/score              │
│  application │   │  EXAM_COMPLETED →SB  │   │  /grade/short-answer    │
│  exam        │   │  EXAM_SUBMITTED →AI  │   │  /xai/generate          │
│  question    │   │                      │   │  /health                │
│  avail_slot  │   └──────────┬───────────┘   │                         │
│  audit_log   │              │               │  SBERT embeddings       │
│  ai_model    │   ┌──────────┴───────────┐   │  SHAP/LIME attribution  │
└──────────────┘   │   Go Exam Engine     │   │  PDF report generation  │
                   │   Gin · Port 8090    │   └──────────┬──────────────┘
┌──────────────┐   │                      │              │ reads/writes
│    Redis     │   │  /exam/start         │   ┌──────────┴──────────────┐
│              │◄──│  /exam/submit-answer │   │      ChromaDB           │
│  OTP codes   │   │  /exam/resume        │   │  (vector embeddings)    │
│  JWT blocklist│  │  /exam/heartbeat     │   └─────────────────────────┘
│  ExamSession │◄──│  /health             │
│  RateLimit   │   │                      │
│  VectorCache │◄──│  WorkerPool (×N)     │
└──────────────┘   │  CountdownService    │
                   │  HeartbeatMonitor    │
                   └──────────────────────┘
```

---

## 2. Request / Response Flow — REST

All frontend API calls proxy through `/api/v1/*` to Spring Boot. Axios attaches the JWT in every request; a 401 auto-logs the user out.

```mermaid
sequenceDiagram
    participant B as Browser
    participant SB as Spring Boot
    participant DB as PostgreSQL
    participant R as Redis

    B->>SB: POST /api/v1/auth/login {email, password}
    SB->>DB: SELECT user WHERE email=?
    SB->>R: GET otp:{email}  (verify OTP pre-check)
    SB-->>B: 200 { token, user }

    B->>SB: GET /api/v1/jobs  (Bearer token)
    SB->>SB: JwtAuthFilter → extract claims
    SB->>DB: SELECT job_postings WHERE status=OPEN
    SB-->>B: 200 { data: [JobPosting...] }
```

---

## 3. Candidate Application Pipeline

```mermaid
flowchart TD
    A([Candidate uploads CV]) --> B[POST /api/v1/applications\nmultipart: cv + jobId]
    B --> C{Hard filter\nheight/weight/degree}
    C -- Fail --> D[status = HARD_FILTER_FAILED\nno further processing]
    C -- Pass --> E[status = SUBMITTED\ncvPath saved to disk/S3]
    E --> F[Kafka: CV_UPLOADED\napplicationId, jobId, cvPath]
    F --> G[Python AI Service\nSBERT cosine similarity]
    G --> H[POST /api/v1/internal/applications\nid/ai-score\ncvRelevanceScore]
    H --> I[status = AI_SCREENING → EXAM_AUTHORIZED\nweighted score updated]
    I --> J{Recruiter authorises\nexam batch}
    J --> K[Kafka: EXAM_BATCH_READY\nexamId, jobId, candidates, window]
    K --> L[Go Exam Engine\ncaches questions + schedule]
    L --> M([Candidate takes exam])
    M --> N[Kafka: EXAM_COMPLETED\ncandidateId, score]
    N --> O[Spring Boot ingests score\nweightedScore recomputed]
    O --> P{Recruiter\nshortlists}
    P --> Q[status = SHORTLISTED\ncandidate books slot]
    Q --> R[status = INTERVIEW_SCHEDULED]
    R --> S{Recruiter\nfinal decision}
    S --> T([SELECTED / REJECTED / WAITLISTED])
    T --> U[Kafka: EXAM_SUBMITTED → Python AI\ngenerate XAI PDF in background]
    U --> V[xaiReportUrl stored\non Application]
```

---

## 4. Kafka Event Topology

```mermaid
flowchart LR
    subgraph Producers
        SB1[Spring Boot]
        GO[Go Exam Engine]
    end

    subgraph Topics
        T1([CV_UPLOADED])
        T2([EXAM_BATCH_READY])
        T3([EXAM_COMPLETED])
        T4([EXAM_SUBMITTED])
        DLT([EXAM_BATCH_READY_DLT\ndead-letter])
    end

    subgraph Consumers
        AI[Python AI Service]
        GO2[Go Exam Engine]
        SB2[Spring Boot]
    end

    SB1 -->|publishCvUploaded| T1
    SB1 -->|publishExamBatchReady| T2
    GO  -->|PublishExamCompleted| T3
    SB1 -->|publishExamSubmitted| T4

    T1 --> AI
    T2 --> GO2
    T2 -->|malformed msg| DLT
    T3 --> SB2
    T4 --> AI
```

---

## 5. Exam Engine — Concurrent Session Lifecycle

```mermaid
sequenceDiagram
    participant SB as Spring Boot
    participant K  as Kafka
    participant GE as Go Engine
    participant R  as Redis
    participant AI as Python AI

    SB->>K: EXAM_BATCH_READY {examId, candidates[], window}
    K->>GE: consume event
    GE->>SB: GET /api/v1/exams/{id}/questions
    GE->>R: SET exam:batch:{jobId} (schedule)
    GE->>R: SADD exam:candidates:{jobId} (auth list)
    GE->>GE: cache questions in-memory

    Note over GE: Exam window opens

    loop Every candidate (concurrent)
        GE->>GE: GET /exam/start → JWTAuth → RateLimiter
        GE->>R: SET exam:session:{cid}:{jid} (ExamSession JSON)
        GE-->>GE: ShuffleQuestions(candidateId) — deterministic
        loop Each answer
            GE->>R: UpdateAnswer (per-session mutex)
        end
        GE->>GE: WorkerPool dispatches short-answer tasks
        GE->>AI: POST /api/v1/grade/short-answer (retry×3)
        AI-->>GE: { score }
        GE->>K: EXAM_COMPLETED {candidateId, totalScore}
    end

    Note over GE: CountdownService ticks every 10s
    GE->>R: decrement timeRemaining
    GE->>GE: auto-submit if timeRemaining ≤ 0

    Note over GE: HeartbeatMonitor ticks every interval
    GE->>R: flag DISCONNECTED if lastSeenAt stale
```

---

## 6. AI Service — CV Scoring & XAI Pipeline

```mermaid
flowchart TD
    subgraph Input
        E1([CV_UPLOADED event\nfrom Kafka])
        E2([EXAM_SUBMITTED event\nfrom Kafka])
    end

    subgraph NLP Pipeline
        P1[Text Extractor\nPyMuPDF / python-docx]
        P2[PII Masker\nremove names/emails]
        P3[NLP Preprocessor\nspaCy tokenise/lemmatise]
        P4[Keyword Checker\nmust-have terms]
        P5[SBERT Encoder\nall-MiniLM-L6-v2]
        P6[Cosine Similarity\nvs job description vector]
        P7[Vector Cache\nRedis + ChromaDB]
    end

    subgraph XAI Pipeline
        X1[Answer Scorer\nshort-answer cosine sim]
        X2[Feature Attribution\nSHAP / LIME]
        X3[NL Justification Engine\nClaude API]
        X4[Bias Detector\nper-demographic audit]
        X5[PDF Generator\nReportLab]
    end

    subgraph Output
        O1[POST /internal/applications\nid/ai-score → Spring Boot]
        O2[PDF saved to disk\nxaiReportUrl callback]
    end

    E1 --> P1 --> P2 --> P3 --> P4 --> P5
    P5 --> P7
    P7 --> P6
    P6 --> O1

    E2 --> X1 --> X2 --> X3 --> X4 --> X5 --> O2
```

---

## 7. Data Model (Core Tables)

```mermaid
erDiagram
    users {
        bigint id PK
        varchar email UK
        varchar full_name
        varchar role
        boolean active
        timestamp created_at
    }

    job_postings {
        bigint id PK
        varchar title
        text description
        int min_height_cm
        int min_weight_kg
        varchar required_degree
        date open_date
        date close_date
        date exam_date
        varchar status
        bigint created_by FK
    }

    applications {
        bigint id PK
        bigint job_id FK
        bigint candidate_id FK
        varchar status
        varchar cv_path
        float cv_relevance_score
        float exam_score
        boolean hard_filter_passed
        float final_score
        varchar xai_report_url
        text decision_notes
        bigint decision_by_id FK
        bigint interview_slot_id FK
        timestamp submitted_at
    }

    exams {
        bigint id PK
        bigint job_id FK
        int duration_minutes
        date exam_date
        varchar status
    }

    questions {
        bigint id PK
        bigint exam_id FK
        text text
        varchar type
        varchar correct_answer
        float marks
    }

    availability_slots {
        bigint id PK
        bigint recruiter_id FK
        date slot_date
        time start_time
        time end_time
        bigint booked_by_id FK UK
        timestamp booked_at
    }

    audit_logs {
        bigint id PK
        varchar entity_type
        bigint entity_id
        varchar old_status
        varchar new_status
        bigint changed_by_id FK
        varchar reason
        timestamp changed_at
    }

    users ||--o{ job_postings : "recruiter creates"
    users ||--o{ applications : "candidate submits"
    job_postings ||--o{ applications : "receives"
    job_postings ||--o{ exams : "has"
    exams ||--o{ questions : "contains"
    users ||--o{ availability_slots : "recruiter owns"
    users ||--o| availability_slots : "candidate books"
    applications ||--o| availability_slots : "scheduled at"
    applications ||--o{ audit_logs : "tracked by"
```

---

## 8. Redis Key Space

| Pattern | Owner | TTL | Purpose |
|---------|-------|-----|---------|
| `otp:{email}` | Spring Boot | 5 min | OTP verification code |
| `blocked:{userId}` | Spring Boot | until revoked | deactivated user blocklist |
| `exam:session:{cid}:{jid}` | Go Engine | duration + 10 min | live exam state (JSON) |
| `exam:batch:{jobId}` | Go Engine | until window end | exam schedule |
| `exam:candidates:{jobId}` | Go Engine | 48 h | authorized candidate set |
| `ratelimit:candidate:{cid}` | Go Engine | 1 s | sliding rate-limit counter |
| `vec:{sha256(text)}` | Python AI | 1 h | cached SBERT embedding |

---

## 9. Security & Auth Flow

```mermaid
sequenceDiagram
    participant B  as Browser
    participant SB as Spring Boot
    participant R  as Redis

    B->>SB: POST /api/v1/auth/register
    SB->>SB: hash password (BCrypt)
    SB->>R: SET otp:{email} = 6-digit code (TTL 5m)
    SB-->>B: 200 "OTP sent"

    B->>SB: POST /api/v1/auth/verify-otp {email, code}
    SB->>R: GET otp:{email}
    SB->>SB: issue JWT (sub=userId, role, jobId)
    SB-->>B: 200 { token }

    Note over B,SB: Every subsequent request

    B->>SB: GET /api/v1/jobs  Authorization: Bearer {token}
    SB->>SB: JwtAuthenticationFilter\n  - verify signature\n  - check exp\n  - load UserDetails
    SB->>R: SISMEMBER blocked:{userId}
    alt user deactivated
        SB-->>B: 401 Unauthorized
    else active
        SB->>SB: @PreAuthorize / @IsCandidate / @IsRecruiter
        SB-->>B: 200 response
    end
```

---

## 10. Deployment Topology

```mermaid
flowchart TB
    subgraph docker-compose
        FE[React\n:5173 dev / :80 prod]
        SB[Spring Boot\n:8080]
        GO[Go Exam Engine\n:8090]
        PY[Python AI\n:8000]
        PG[(PostgreSQL\n:5432)]
        RD[(Redis\n:6379)]
        KF[Kafka + Zookeeper\n:9092]
        CH[(ChromaDB\n:8001)]
    end

    FE -- "proxy /api → :8080" --> SB
    SB --> PG
    SB --> RD
    SB --> KF
    GO --> RD
    GO --> KF
    GO --> PY
    PY --> RD
    PY --> KF
    PY --> CH
```

---

## Environment Variables Quick Reference

| Service | Key variables |
|---------|--------------|
| Spring Boot | `SPRING_DATASOURCE_URL`, `JWT_SECRET`, `REDIS_HOST`, `KAFKA_BOOTSTRAP_SERVERS` |
| Go Engine | `REDIS_ADDR`, `KAFKA_BROKER`, `SPRING_BASE_URL`, `AI_GRADING_URL`, `WORKER_POOL_SIZE` |
| Python AI | `ANTHROPIC_API_KEY`, `REDIS_URL`, `CHROMA_PATH`, `SPRING_CALLBACK_URL`, `KAFKA_BOOTSTRAP_SERVERS` |
| React | `VITE_API_BASE_URL` (defaults to `/api` via Vite proxy) |
