# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
A full-stack, AI-powered recruitment platform for aviation roles. The system handles end-to-end candidate management: CV upload → AI screening → batch exam → interview scheduling → final decision with explainable AI feedback.

## Architecture (4 Services)

```
React Frontend (TypeScript + Vite)
        ↕ REST / Axios
Spring Boot — Core Orchestrator (Java 21, Gradle)
        ↕ Kafka events        ↕ REST/gRPC
Go Exam Engine            Python AI Service (FastAPI)
        ↕ Redis                   ↕ Redis / ChromaDB
        └─────── PostgreSQL ──────┘
```

## Tech Stack

| Layer        | Technology                                     |
|--------------|------------------------------------------------|
| Frontend     | React 18, TypeScript, Vite, Tailwind, Shadcn/UI, Zustand, react-hook-form + zod, Axios |
| Backend      | Spring Boot 3, Java 21, Gradle, Spring Security (JWT), Spring Cloud Stream (Kafka), Hibernate/JPA |
| Exam Engine  | Go (Gin or Echo), Redis, Kafka, gRPC           |
| AI Service   | Python, FastAPI, SBERT, SHAP/LIME, PyMuPDF, ChromaDB |
| Data         | PostgreSQL, Redis, S3 (or local file storage)  |
| Messaging    | Apache Kafka                                   |

## Roles & RBAC
- **Candidate** — Register, apply, take exam, book interview slot, view feedback
- **Recruiter** — Post jobs, view rankings, authorize exam batches, set availability, make final decisions
- **Admin** — Manage recruiter accounts, activate/deactivate users
- **Super Admin** — Full system access, model versioning, analytics export

## Key Kafka Events
- `CV_UPLOADED` → Spring Boot → Python AI
- `EXAM_BATCH_READY` → Spring Boot → Go Engine
- `EXAM_COMPLETED` → Go Engine → Spring Boot
- `EXAM_SUBMITTED` → Go Engine → Python AI (short answers)

## Scoring Formula
```
Final Score = 40% CV relevance + 40% Exam score + 20% Hard filter pass/fail
```

## Directory Structure (Expected)
```
fyp103-main/
├── backend/          # Spring Boot (Java 21)
├── exam-engine/      # Go service
├── ai-service/       # Python FastAPI
└── frontend/         # React + TypeScript
```

## Coding Conventions

### General
- Follow RESTful naming: `/api/v1/jobs`, `/api/v1/applications/{id}`
- All API responses use the standard wrapper: `{ status, message, data, timestamp }`
- Use environment variables for all secrets and config (never hardcode)
- Always handle errors — no silent failures

### Spring Boot (Java)
- Java 21 features encouraged (records, sealed classes, pattern matching)
- Use `@RestControllerAdvice` for global exception handling
- DTOs for all request/response bodies — never expose entities directly
- Repository layer → Service layer → Controller layer — keep them clean
- JWT is stateless — no sessions
- Use `@Transactional` on service methods that write to DB

### Go (Exam Engine)
- Hexagonal architecture: `cmd/`, `internal/`, `pkg/`
- Use `sync.Mutex` or atomic operations for concurrent score updates
- All exam state lives in Redis (not in-memory Go structs)
- Goroutine worker pool for grading — no blocking the main handler

### Python (AI Service)
- `src/` layout: `routers/`, `services/`, `models/`
- Use async FastAPI endpoints where possible
- Never store PII in ChromaDB/Redis vector store
- Wrap all ML model calls in try/except with meaningful fallback

### React (Frontend)
- Functional components only, hooks-based
- Zustand for global state (auth, user info)
- `react-hook-form` + `zod` for all forms
- No inline styles — use Tailwind utility classes
- Keep API calls in a dedicated `services/` or `api/` folder
- Axios interceptors handle auth headers and 401 redirects globally

## Environment Variables (Template)
```
# Spring Boot
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/recruitment
SPRING_DATASOURCE_USERNAME=
SPRING_DATASOURCE_PASSWORD=
JWT_SECRET=
REDIS_HOST=localhost
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# Python AI Service
ANTHROPIC_API_KEY=
REDIS_URL=redis://localhost:6379
CHROMA_PATH=./chroma_db

# Go Exam Engine
REDIS_ADDR=localhost:6379
SPRING_BASE_URL=http://localhost:8080
KAFKA_BROKER=localhost:9092
```

## Status
Greenfield — no source code yet. Directory structure above is the target layout, not current state.

## Current Backlog
The project has 4 epics across 40 Spring Boot issues, 20 Go issues, 18 Python issues, and 22 React issues.

### Recommended Build Order
1. **Infrastructure first** — Docker Compose with PostgreSQL, Redis, Kafka
2. **Spring Boot skeleton** — Security, DB, Kafka config, global error handler
3. **User + Auth** — RBAC, OTP, JWT
4. **Job + Application** — Core entity flow
5. **Python AI** — CV parsing and scoring
6. **Go Exam Engine** — Concurrent session management
7. **React Frontend** — Build per-role portals after APIs are stable

## Important Notes
- The exam engine must handle burst concurrency — all candidates in a batch start simultaneously
- XAI PDF generation is a background task — do not block the API response
- Hard filter (height/weight/degree) is SQL-based, not AI-based — keep it fast
- Do not store raw CV files in the database — use S3/local path only
- Interview slot booking must prevent double-booking at the DB level (optimistic locking or unique constraint)
