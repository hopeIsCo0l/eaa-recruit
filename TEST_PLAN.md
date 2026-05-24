# Software Test Plan — EAA Recruit

**Document standard:** IEEE Std 829-2008 *Standard for Software and System Test Documentation*, with structural elements from ISO/IEC/IEEE 29119-3:2021 *Test Documentation*.

**Document type:** Master Test Plan (MTP)
**Document identifier:** EAA-RC-TPD-001
**Version:** 1.0
**Date of issue:** 2026-05-24
**Status:** Draft for review

---

## Document Change History

| Version | Date       | Author                  | Description of change                               |
|---------|------------|-------------------------|-----------------------------------------------------|
| 0.1     | 2026-05-10 | Engineering Lead        | Initial outline.                                    |
| 0.5     | 2026-05-18 | Engineering Lead        | Added per-service test approach + risk register.    |
| 1.0     | 2026-05-24 | Engineering Lead        | Issued for stakeholder review.                      |

---

## Table of Contents

1. Test Plan Identifier
2. Introduction
3. Test Items
4. Features to Be Tested
5. Features Not to Be Tested
6. Approach (Test Strategy)
7. Item Pass / Fail Criteria
8. Suspension Criteria and Resumption Requirements
9. Test Deliverables
10. Testing Tasks
11. Environmental Needs
12. Responsibilities
13. Staffing and Training Needs
14. Schedule
15. Risks and Contingencies
16. Glossary and References
17. Approvals

---

## 1. Test Plan Identifier

| Field             | Value                                                                 |
|-------------------|-----------------------------------------------------------------------|
| Identifier        | EAA-RC-TPD-001                                                        |
| Title             | Master Test Plan — EAA Recruit Platform                               |
| Version           | 1.0                                                                   |
| Date              | 2026-05-24                                                            |
| Project           | EAA Recruit (Ethiopian Aviation Academy recruitment platform)          |
| Repository        | `github.com/hopeIsCo0l/eaa-recruit`                                   |
| Authority         | EAA Recruit Engineering Lead                                          |
| Supersedes        | None                                                                  |

---

## 2. Introduction

### 2.1 Purpose

This document defines the master plan for verification and validation of the **EAA Recruit** platform — an AI-assisted recruitment system that handles candidate registration, CV screening, technical examinations, and recruiter decision workflows for the Ethiopian Aviation Academy and Ethiopian Airlines.

The plan defines:

- The scope of testing across all components (Spring backend, FastAPI AI service, Go exam engine, Next.js frontend, Postgres, Redis).
- The test approach at each level (unit, component, integration, system, acceptance).
- Entry and exit criteria for each phase.
- Deliverables, responsibilities, and the test schedule.
- Risks, mitigations, and the conditions under which testing is suspended.

### 2.2 Scope

In scope:

- All source code under `backend/`, `ai-service/`, `exam-engine/`, `frontend/`.
- All HTTP APIs exposed by the four services.
- Infrastructure as defined in `docker-compose.yml`.
- All 99 functional requirements (FR-01 to FR-99) referenced in the project backlog.
- Non-functional requirements: performance, security, accessibility, compliance with Ethiopian Data Protection Proclamation No. 1329/2023.

Out of scope:

- Penetration testing of the underlying cloud infrastructure (handled by the hosting provider).
- Third-party services (Gmail SMTP, future identity-provider integrations) beyond integration smoke checks.
- Hardware-level performance of the deployment host.

### 2.3 System Overview

EAA Recruit consists of four runtime services:

| Service       | Language / Runtime   | Port  | Primary responsibility                                         |
|---------------|----------------------|-------|----------------------------------------------------------------|
| `backend`     | Java 21, Spring Boot | 8080  | Auth, jobs, applications, exam orchestration, persistence.     |
| `ai-service`  | Python 3.13, FastAPI | 8000  | CV scoring, answer grading, XAI report generation, bias.       |
| `exam-engine` | Go 1.22, Gin         | 8081  | Live exam session lifecycle, heartbeat, batched grading.       |
| `frontend`    | Next.js 16 (React)   | 3000  | All user-facing UIs (candidate, recruiter, admin).             |

Supporting infrastructure: PostgreSQL 16 (durable state), Redis 7 (OTP, rate limits, session cache).

### 2.4 Document Conventions

- **Shall** indicates a mandatory requirement.
- **Should** indicates a recommended practice.
- **May** indicates a permitted option.
- HTTP methods and routes are written in `monospace`.
- Functional requirements are referenced as `FR-NN` and trace back to the project backlog.

---

## 3. Test Items

The following items are subject to testing under this plan:

| Item ID  | Component   | Artifact                                              | Version reference            |
|----------|-------------|-------------------------------------------------------|------------------------------|
| TI-01    | Backend     | Spring Boot application JAR                           | `backend/build.gradle`        |
| TI-02    | AI service  | FastAPI application image                             | `ai-service/Dockerfile`       |
| TI-03    | Exam engine | Go binary                                             | `exam-engine/cmd/server`      |
| TI-04    | Frontend    | Next.js production build                              | `frontend/package.json`       |
| TI-05    | Database    | Flyway migrations                                     | `backend/src/main/resources/db/migration` |
| TI-06    | Infra       | Docker Compose stack                                  | `docker-compose.yml`          |
| TI-07    | Contracts   | Internal HTTP API key + DTO contracts between TI-01/02/03 | `dto/`, `internal/` packages |
| TI-08    | Configuration | Environment variables, application.yml, mail/redis/JWT config | `application.yml`, `docker-compose.yml` |

Supporting test items:

- Test data fixtures under `backend/src/test/resources/` and `ai-service/tests/fixtures/`.
- Sample CV corpus (5 representative PDFs and 5 DOCX) maintained by QA.
- Seed scripts for jobs, candidates, and recruiters.

---

## 4. Features to Be Tested

Features are grouped by the architectural area that owns them. Each row traces to one or more functional requirements.

### 4.1 Authentication and identity (FR-01 to FR-12)

| Feature                              | Requirement(s) | Component(s)        |
|--------------------------------------|----------------|---------------------|
| Candidate registration with OTP      | FR-09, FR-10   | backend, ai-service*, frontend |
| Recruiter account creation by admin  | FR-11          | backend, frontend   |
| JWT issuance on login                | FR-03          | backend, frontend   |
| OTP delivery via SMTP and via mock   | FR-09          | backend             |
| Password reset                       | —              | backend, frontend   |
| Change password (authenticated)      | —              | backend, frontend   |
| Role-based access control            | FR-07, FR-08   | backend (filters)   |
| User activation / deactivation       | FR-12          | backend, frontend   |
| Session timeout and JWT refresh path | —              | backend, frontend   |

\* `ai-service` is only indirectly involved via downstream CV scoring after registration.

### 4.2 Job posting lifecycle (FR-13 to FR-15)

| Feature                              | Requirement(s) | Component(s) |
|--------------------------------------|----------------|--------------|
| Create job posting (recruiter)       | FR-14          | backend, frontend |
| List open jobs (candidate)           | FR-14          | backend, frontend |
| List own jobs (recruiter)            | FR-14          | backend, frontend |
| Get job details                      | FR-14          | backend, frontend |
| Job posting status transitions       | FR-13          | backend       |

### 4.3 Application intake and CV screening (FR-16 to FR-25)

| Feature                                                  | Requirement(s) | Component(s) |
|----------------------------------------------------------|----------------|--------------|
| Submit application with multipart CV                     | FR-16, FR-17   | backend, frontend |
| CV upload to durable storage                             | FR-17          | backend (FileStorageService) |
| Hard-filter evaluation (degree, height, weight)          | FR-19          | backend       |
| AI similarity scoring of CV against JD                   | FR-20, FR-21   | ai-service, backend |
| AI callback to backend with score and XAI URL            | FR-21          | ai-service, backend (InternalController) |
| Candidate-facing application list                        | FR-86          | backend, frontend |
| Recruiter shortlist endpoint                             | FR-23          | backend       |

### 4.4 Examination subsystem (FR-26 to FR-27, FR-41 to FR-56, FR-87)

| Feature                                                  | Requirement(s) | Component(s)         |
|----------------------------------------------------------|----------------|----------------------|
| Recruiter defines exam for a job                         | FR-24          | backend, frontend    |
| Recruiter authorizes candidate batch                     | FR-25          | backend, frontend    |
| Start exam (candidate)                                   | FR-51          | exam-engine, frontend |
| Submit answer                                            | FR-52          | exam-engine, frontend |
| Resume exam                                              | FR-53          | exam-engine, frontend |
| Heartbeat and tab-switch monitoring                      | FR-48          | exam-engine, frontend |
| Server-side countdown with auto-submission               | FR-47          | exam-engine          |
| AI grading of descriptive answers (worker pool)          | FR-43, FR-56   | ai-service, exam-engine |
| Callback of exam score to backend                        | FR-27          | exam-engine, backend |
| Weighted final score                                     | FR-28          | backend              |

### 4.5 Interview scheduling and decisions (FR-30 to FR-36)

Slot availability, slot booking with double-booking prevention, interview reminders, final decision endpoint, and archive workflow.

### 4.6 Explainability, feedback, and analytics (FR-37 to FR-40, FR-98, FR-99)

XAI report generation (LIME) and PDF export; candidate feedback retrieval; recruiter analytics dashboard; weekly TTF and funnel KPIs.

### 4.7 Administration (FR-94 to FR-97)

Admin user management, system health dashboard, audit-log viewer, AI model versioning toggle.

### 4.8 Frontend role portals (FR-78 to FR-93)

Marketing landing, role-aware layouts and sidebars, candidate profile builder, job board, application tracker, exam runner, recruiter availability calendar, admin panels.

### 4.9 Non-functional features

| Category         | Concern                                                      |
|------------------|--------------------------------------------------------------|
| Performance      | CV scoring < 5 s p95; exam answer round-trip < 200 ms p95.   |
| Concurrency      | 100 concurrent exam sessions sustained for 45 minutes.       |
| Security         | OWASP Top-10 review; no PII in logs; JWT secret strength.    |
| Compliance       | Proclamation 1329/2023 data residency and PII masking.       |
| Accessibility    | WCAG 2.1 AA for all candidate-facing pages.                  |
| Internationalization | English and Amharic (`am`) coverage on auth + dashboard. |
| Observability    | `/health` and `/metrics` endpoints return correct shapes.    |

---

## 5. Features Not to Be Tested

The following are explicitly excluded from this plan, with rationale.

| Excluded item                                       | Rationale                                                                                  |
|-----------------------------------------------------|--------------------------------------------------------------------------------------------|
| Third-party Gmail SMTP reliability                  | Owned by Google; covered only by integration smoke test of `MockOtpNotificationAdapter`.   |
| PostgreSQL internal correctness                     | Treated as a trusted dependency; only schema and queries are under test.                   |
| Browser-engine rendering bugs                       | Out of project scope; supported browsers are documented separately.                        |
| Load testing beyond 100 concurrent users            | Current deployment target is the EAA internal demo environment.                            |
| Internationalization beyond `en` and `am`           | Other languages are not in the FY26 backlog.                                              |
| Mobile-native applications                          | None exist in this repository; only the responsive web frontend is in scope.               |

---

## 6. Approach (Test Strategy)

### 6.1 Levels of Test

Testing shall be conducted at five levels, in order of execution:

1. **Unit test.** A single class, function, or module in isolation, with all collaborators stubbed or mocked. Owned by the developer who authors the change.
2. **Component test.** A single service exercised through its HTTP boundary, with external services replaced by test doubles. The database is real (Testcontainers or H2 with Flyway migrations).
3. **Integration test.** Two or more services interacting over real HTTP, with the full `docker-compose.yml` stack running. Used to verify the contract between `backend`, `ai-service`, and `exam-engine`.
4. **System test.** The full stack exercised through the frontend (or via API contract) to validate end-to-end user journeys. Includes performance, security, and compliance checks.
5. **Acceptance test (UAT).** Recruiter and admin walkthroughs of agreed scenarios with the EAA stakeholder sign-off.

### 6.2 Types of Test

| Type                | Scope                                                                       | Tooling                                  |
|---------------------|-----------------------------------------------------------------------------|------------------------------------------|
| Functional          | Behavior of features against the requirements in section 4.                 | JUnit 5, pytest, `go test`, Playwright.  |
| Regression          | Re-execution of the green-list suite on every PR.                           | GitHub Actions CI.                        |
| Smoke               | Five-minute "is the stack alive" check after deploy.                        | Bash + `curl`, `gh workflow`.            |
| Performance         | Load, soak, and stress tests against APIs and the exam engine.              | k6, JMeter (optional).                    |
| Security            | Static analysis, dependency scanning, OWASP review, secret-leak scan.       | OWASP Dependency-Check, gitleaks, Bandit, Semgrep. |
| Accessibility       | Automated WCAG 2.1 AA check on every candidate-facing page.                 | axe-core via Playwright.                 |
| Usability           | Moderated UAT sessions with two recruiters and one candidate.               | Manual.                                  |
| Exploratory         | Time-boxed (60 min) charters per release candidate.                         | Manual.                                  |

### 6.3 Per-Service Test Approach

#### 6.3.1 `backend` (Spring Boot)

- Unit tests with **JUnit 5** + **Mockito**. Coverage target: ≥ 80 % statements on `service/`, ≥ 90 % on `security/`.
- Component tests with **Spring Boot Test slices** (`@WebMvcTest`, `@DataJpaTest`) and **Testcontainers** for Postgres + Redis.
- Repository tests run against a real Postgres container so Flyway migrations execute as in production.
- Contract verification of all `InternalController` callbacks using JSON fixtures shared with `ai-service` and `exam-engine`.

#### 6.3.2 `ai-service` (FastAPI)

- Unit tests with **pytest** + **pytest-asyncio**. Coverage target: ≥ 80 % on `services/`.
- HTTP-level tests via `TestClient`; the `verify_internal_api_key` dependency is overridden in fixtures.
- Vector-similarity service tested against a curated set of three job descriptions and ten CVs with expected score ranges (not exact values).
- LIME and PDF generation tested for non-empty outputs and well-formed PDF headers; visual review is manual.

#### 6.3.3 `exam-engine` (Go)

- Unit tests with the standard `testing` package and `testify`. Coverage target: ≥ 85 % on `internal/services`.
- Concurrent tests for `worker_pool` and `question_cache` must pass under `go test -race`.
- Integration tests start the binary against a real Redis container and exercise the JWT-protected `/exam/*` routes with a test-issued token.

#### 6.3.4 `frontend` (Next.js)

- Unit tests with **Vitest** + **React Testing Library** on hooks and pure components.
- Type checking with `npx tsc --noEmit` is a required pre-commit gate.
- End-to-end tests with **Playwright** for the four primary user journeys (see section 6.4).
- Accessibility checks with **axe-core** via Playwright on every page visited during E2E.

### 6.4 Primary End-to-End User Journeys

The following journeys constitute the regression-blocker suite. All must pass before any release candidate is promoted.

| ID    | Journey                                                                                       |
|-------|-----------------------------------------------------------------------------------------------|
| E2E-1 | Candidate self-registers → receives OTP → verifies → lands on candidate dashboard.            |
| E2E-2 | Recruiter logs in → creates a job posting → posting appears in `/dashboard/jobs`.             |
| E2E-3 | Candidate applies to the job from E2E-2 → application appears in `/candidate/applications` with status `PENDING_AI` → status transitions to `SHORTLISTED` after AI callback. |
| E2E-4 | Recruiter authorizes batch → candidate starts exam → submits answers → final score is recorded → XAI PDF is downloadable. |

### 6.5 Test Data Strategy

- **Synthetic personae.** Six personae are seeded: two candidates (one matched, one rejected), two recruiters, one admin, one suspended user.
- **CV corpus.** Ten anonymized CVs cover four degree fields. Each has expected score bands per job (not exact values).
- **Determinism.** All AI calls in CI use seeded random sources and snapshot fixtures so similarity scores are reproducible.
- **PII.** All test data is synthetic; no real candidate data is used at any test level.

### 6.6 Tools

| Concern              | Tool                                                       |
|----------------------|------------------------------------------------------------|
| Backend unit + slice | JUnit 5, Mockito, Spring Boot Test, Testcontainers         |
| AI unit + HTTP       | pytest, pytest-asyncio, httpx TestClient                   |
| Exam-engine unit     | `go test`, testify, `-race`                                |
| Frontend unit        | Vitest, React Testing Library                              |
| E2E                  | Playwright                                                 |
| API contract         | Postman collections, exported JSON fixtures                |
| Load                 | k6                                                         |
| Security (SAST)      | Semgrep, Bandit, gosec                                     |
| Dependencies         | OWASP Dependency-Check, npm audit, pip-audit, govulncheck  |
| Secrets              | gitleaks (pre-commit + CI)                                 |
| Accessibility        | axe-core via Playwright                                    |
| CI                   | GitHub Actions                                             |

---

## 7. Item Pass / Fail Criteria

### 7.1 Pass criteria for a test item

A test item is considered to have passed when **all** of the following hold:

1. 100 % of the planned test cases at the relevant level execute to completion.
2. 100 % of priority-1 (blocker) and priority-2 (critical) cases pass.
3. ≥ 95 % of priority-3 (major) cases pass.
4. ≥ 90 % of priority-4 (minor) cases pass.
5. Coverage thresholds in section 6.3 are met.
6. No open defects of severity 1 (system unusable) or severity 2 (major function broken) remain.

### 7.2 Fail criteria

A test item is considered to have failed when any of the following hold:

- A blocker or critical case fails and no agreed workaround exists.
- Two or more major cases fail in the same feature area.
- Performance budgets in section 4.9 are not met in three consecutive runs.
- A security finding of severity 1 or 2 is discovered.

### 7.3 Per-defect severity

| Severity | Definition                                                                                       |
|----------|--------------------------------------------------------------------------------------------------|
| 1 — Blocker | System cannot start, primary journey cannot complete, data loss, or security breach.            |
| 2 — Critical | A primary feature is broken with no workaround.                                                 |
| 3 — Major   | A feature is broken but a workaround exists.                                                    |
| 4 — Minor   | Cosmetic, copy, layout, or non-functional polish.                                               |

---

## 8. Suspension Criteria and Resumption Requirements

### 8.1 Suspension criteria

Testing shall be suspended when any of the following occurs:

- The build under test cannot start in a clean Compose environment.
- More than 25 % of the regression suite fails in a single run.
- A severity-1 defect is detected and no fix can be produced within one business day.
- The test environment is unavailable for more than four contiguous hours.
- The internal API key contract is broken between `backend` and one or both downstream services.

### 8.2 Resumption requirements

Testing shall resume only when **all** of the following are satisfied:

- The suspending condition is fully resolved and a root-cause note is recorded.
- A new green smoke-test run is produced in the suspended environment.
- The defect that triggered suspension has an associated regression test that fails on the prior commit and passes on the fix.

---

## 9. Test Deliverables

The following deliverables shall be produced and kept under version control unless noted.

| ID    | Deliverable                                       | Owner            | Location                                  |
|-------|---------------------------------------------------|------------------|-------------------------------------------|
| TD-01 | Master Test Plan (this document)                  | Engineering Lead | `TEST_PLAN.md`                            |
| TD-02 | Test cases per feature area                       | QA               | `tests/cases/` (per-component)            |
| TD-03 | Automated test suites                             | Developers       | `backend/src/test/`, `ai-service/tests/`, `exam-engine/internal/**/*_test.go`, `frontend/tests/` |
| TD-04 | Postman API collection                            | QA               | `tests/postman/eaa-recruit.postman_collection.json` |
| TD-05 | Performance test scripts                          | QA               | `tests/performance/`                       |
| TD-06 | Defect log                                        | QA               | GitHub Issues, label `defect`             |
| TD-07 | Test execution report (per release candidate)     | QA               | GitHub Releases page                       |
| TD-08 | Coverage report                                   | CI               | GitHub Actions artifacts                   |
| TD-09 | UAT sign-off record                               | EAA stakeholder  | Signed PDF stored with project leadership  |
| TD-10 | Test environment configuration                    | DevOps           | `docker-compose.yml`, `.env.example`       |

---

## 10. Testing Tasks

The following tasks shall be executed in the order listed. Each task lists predecessors (P), responsible role (R), and estimated effort in person-days (E).

| #  | Task                                                                       | P            | R            | E   |
|----|----------------------------------------------------------------------------|--------------|--------------|-----|
| 1  | Approve this test plan.                                                    | —            | Stakeholder  | 1   |
| 2  | Set up CI matrix for backend, ai-service, exam-engine, frontend.            | 1            | DevOps       | 2   |
| 3  | Author unit test cases for each new feature in the sprint backlog.          | 1            | Developers   | per-feature |
| 4  | Author component tests per service.                                         | 3            | Developers   | per-service |
| 5  | Stand up shared integration environment.                                    | 2            | DevOps       | 2   |
| 6  | Author E2E suite (Playwright) for E2E-1 through E2E-4.                      | 5            | QA           | 4   |
| 7  | Author performance scripts for CV score, exam answer round-trip, login.     | 5            | QA           | 3   |
| 8  | Conduct security scan with Semgrep, Bandit, gosec, OWASP DC.                | 5            | Security Eng | 2   |
| 9  | Run regression suite on each release candidate.                             | 4, 6         | CI           | continuous |
| 10 | Run performance suite weekly and pre-release.                               | 7            | QA           | 1 / week |
| 11 | Conduct UAT with EAA stakeholders.                                          | 9            | QA + Stakeholder | 2 |
| 12 | Issue test execution report and obtain sign-off.                            | 11           | Engineering Lead | 1 |

---

## 11. Environmental Needs

### 11.1 Hardware

- Each developer workstation: ≥ 16 GB RAM, 4 cores, 20 GB free disk. Required to run the full Compose stack.
- CI runner: GitHub Actions `ubuntu-latest`, 7 GB RAM, 2 vCPU.
- Performance runner: a dedicated host or self-hosted runner with 16 GB RAM and 4 vCPU.

### 11.2 Software

| Item                 | Version                                              |
|----------------------|------------------------------------------------------|
| Java                 | 21 (JDK)                                              |
| Python               | 3.13                                                  |
| Go                   | 1.22                                                  |
| Node.js              | 20 LTS or 22 LTS                                      |
| Docker Engine        | 24+                                                   |
| Docker Compose       | v2 (CLI plugin)                                       |
| PostgreSQL           | 16                                                    |
| Redis                | 7-alpine                                              |
| Playwright browsers  | Chromium, Firefox, WebKit (latest at install time)    |

### 11.3 Network

- Outbound HTTPS to `smtp.gmail.com:587` for real OTP delivery in the staging environment.
- Outbound HTTPS to `github.com` for CI artifact upload and dependency download.

### 11.4 Environments

| Environment   | Purpose                                                                 | Data          |
|---------------|-------------------------------------------------------------------------|---------------|
| `dev`         | Developer workstation, Compose stack. Mock OTP, loose rate limits.       | Synthetic     |
| `ci`          | GitHub Actions ephemeral. Mock OTP, in-process Testcontainers.           | Synthetic     |
| `staging`     | Long-lived deployment for UAT and performance runs. Real SMTP.           | Synthetic     |
| `production`  | EAA live environment. Real SMTP, strict rate limits.                     | Real          |

Rate limits in `dev` are intentionally loose (`RATE_LIMIT_*_MAX = 999` per `docker-compose.yml`). Tests of rate-limit behavior shall run against `staging` with production-equivalent limits.

### 11.5 Test data

- All test data is synthetic. No production export shall be loaded into any non-production environment.
- The CV corpus is stored in `tests/fixtures/cvs/` and committed with the test code.
- Database seed scripts are version-controlled under `tests/fixtures/seed/`.

---

## 12. Responsibilities

| Role                   | Responsibility                                                                       |
|------------------------|--------------------------------------------------------------------------------------|
| Engineering Lead       | Owns this plan, prioritizes defects, signs off on releases.                          |
| Developers (per service) | Author unit and component tests; fix defects in their service.                     |
| QA Engineer            | Author E2E suite, performance scripts, exploratory charters; maintain defect log.    |
| Security Engineer      | Run SAST and dependency scans; review findings.                                      |
| DevOps                 | Maintain CI, test environments, secret management.                                    |
| EAA Stakeholder        | Conduct UAT, provide sign-off, approve scope changes.                                |

A RACI matrix for selected high-impact activities:

| Activity                       | Engineering Lead | Developers | QA | Security | DevOps | Stakeholder |
|--------------------------------|------------------|------------|----|----------|--------|-------------|
| Approve plan                   | R                | C          | C  | C        | C      | A           |
| Author unit tests              | A                | R          | C  | I        | I      | I           |
| Author E2E suite               | A                | C          | R  | I        | I      | I           |
| Run security scan              | A                | C          | I  | R        | C      | I           |
| Sign off release               | A                | I          | C  | C        | I      | R           |

R = Responsible, A = Accountable, C = Consulted, I = Informed.

---

## 13. Staffing and Training Needs

### 13.1 Staffing

- One QA engineer (full time during release windows).
- One developer per service (already staffed).
- One security engineer (fractional, ~ 1 day per sprint).
- One DevOps engineer (fractional, on call).

### 13.2 Training

| Audience       | Topic                                                       | Format             |
|----------------|-------------------------------------------------------------|--------------------|
| Developers     | Testcontainers patterns for Spring Boot.                    | Internal workshop. |
| QA             | Playwright + Next.js routing specifics.                     | Self-paced video.  |
| QA             | Reading LIME explanations and validating XAI PDFs.          | Pair session with AI service owner. |
| Stakeholders   | UAT scenario walkthrough.                                   | Live demo.         |

---

## 14. Schedule

The schedule is expressed relative to the release candidate (RC) cut date.

| Window           | Activity                                                                  |
|------------------|---------------------------------------------------------------------------|
| RC − 14 days     | Freeze the scope; finalize the test cases for the sprint.                  |
| RC − 10 days     | Component tests must be green in CI for all four services.                 |
| RC − 7 days      | First full E2E run; defects logged and triaged.                            |
| RC − 5 days      | Performance and security runs.                                             |
| RC − 3 days      | Second full E2E run; only severity-1 and severity-2 defects may remain.    |
| RC − 1 day       | UAT with stakeholders.                                                     |
| RC               | Sign-off; tag release; deploy to production after change-window approval.  |

Continuous activities throughout the sprint: unit tests on every PR, regression suite on every merge to `main`, smoke test post-deploy.

---

## 15. Risks and Contingencies

| Risk ID | Risk                                                                       | Likelihood | Impact | Mitigation                                                                                       |
|---------|----------------------------------------------------------------------------|------------|--------|--------------------------------------------------------------------------------------------------|
| R-01    | Gmail SMTP throttling blocks OTP delivery in staging.                       | Medium     | High   | Use mock adapter by default; rotate App Passwords; cache OTPs server-side.                       |
| R-02    | AI similarity scores drift between models, breaking deterministic tests.    | High       | Medium | Pin model version per release; use score bands not exact values; record current model in `AiModelService`. |
| R-03    | Exam engine session state lost on Redis restart.                            | Low        | High   | Persist session snapshots; test resume path; document Redis backup policy.                       |
| R-04    | Concurrent exam load exceeds worker-pool capacity.                          | Medium     | High   | Soak test at 2× expected concurrency; tune `WorkerPoolSize` in `exam-engine/config`.             |
| R-05    | PII leaks through logs in `ai-service`.                                     | Medium     | High   | PII mask before any logging; CI check that grep for common PII patterns finds none.              |
| R-06    | Frontend type errors land via incomplete migrations.                        | Low        | Medium | `npx tsc --noEmit` is a required CI gate.                                                       |
| R-07    | Stakeholder availability for UAT slips.                                     | Medium     | Medium | Schedule UAT at sprint start; allow async sign-off for low-risk items.                          |
| R-08    | Test data drift between QA and production data shapes.                      | Medium     | Medium | Generate seed from the same Flyway migrations as production.                                     |
| R-09    | Internal API key leaked.                                                    | Low        | High   | gitleaks pre-commit and CI; rotate quarterly; never echo in logs.                                |
| R-10    | Compliance gap with Proclamation 1329/2023.                                 | Low        | High   | Annual review with legal; data-residency check in deployment runbook.                            |

---

## 16. Glossary and References

### 16.1 Glossary

| Term            | Definition                                                                |
|-----------------|---------------------------------------------------------------------------|
| OTP             | One-Time Password sent to the candidate during registration.              |
| JD              | Job Description.                                                          |
| XAI             | Explainable AI; in this project, LIME explanations of the CV score.       |
| TTF             | Time-To-Fill, the number of days from job open to filled.                 |
| RC              | Release Candidate.                                                        |
| SAST            | Static Application Security Testing.                                      |
| PII             | Personally Identifiable Information.                                      |
| WCAG            | Web Content Accessibility Guidelines.                                     |

### 16.2 References

- IEEE Std 829-2008 — *Standard for Software and System Test Documentation*.
- ISO/IEC/IEEE 29119-3:2021 — *Software and systems engineering — Software testing — Part 3: Test documentation*.
- OWASP Top 10:2021.
- WCAG 2.1 (Recommendation, June 2018).
- Federal Democratic Republic of Ethiopia — Personal Data Protection Proclamation No. 1329/2023.
- Project documents: `ARCHITECTURE.md`, `README.md`, `BACKLOG_ISSUES.md`, `WEEK9_PROGRESS_REPORT.md`, `emailOTP.md`, `deploymentManual.md`.

---

## 17. Approvals

| Role                  | Name | Signature | Date |
|-----------------------|------|-----------|------|
| Engineering Lead      |      |           |      |
| QA Engineer           |      |           |      |
| Security Engineer     |      |           |      |
| DevOps Engineer       |      |           |      |
| EAA Stakeholder       |      |           |      |

---

*End of document.*
