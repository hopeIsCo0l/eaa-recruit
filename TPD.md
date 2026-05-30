# Test Plan Documentation (TPD)

**Project:** EAA-Recruit &mdash; AI-Powered Recruitment Platform  
**Version:** 1.0  
**Date:** 2026-05-26  
**Prepared by:** QA Team  
**Status:** Active

---

## Table of Contents

1. [Objective](#1-objective)
2. [Scope](#2-scope)
3. [Test Strategy & Approach](#3-test-strategy--approach)
4. [Test Scenarios & Cases](#4-test-scenarios--cases)
5. [Assumptions & Risks](#5-assumptions--risks)
6. [Roles & Responsibilities](#6-roles--responsibilities)
7. [Schedule & Estimation](#7-schedule--estimation)
8. [Test Environment](#8-test-environment)
9. [Entry & Exit Criteria](#9-entry--exit-criteria)
10. [Defect Management](#10-defect-management)
11. [Test Automation Plan](#11-test-automation-plan)
12. [Test Deliverables](#12-test-deliverables)
13. [Templates & Standards](#13-templates--standards)

---

## 1. Objective

### 1.1 Purpose

This document defines the test plan for the **EAA-Recruit** platform, a microservice-based recruitment system that automates the hiring pipeline from candidate registration through AI-powered screening, examination, interview scheduling, and final decision with explainable AI (XAI) feedback reports.

### 1.2 Goals

| # | Goal | Success Metric |
|---|------|----------------|
| G-1 | Validate all functional requirements across 3 user roles | 100% of identified test cases pass |
| G-2 | Verify end-to-end application lifecycle flows | All 10 application statuses reachable and transitions correct |
| G-3 | Ensure inter-service communication reliability | Zero data loss between Spring Boot, Go exam-engine, and Python AI-service |
| G-4 | Confirm security controls (JWT, RBAC, OTP) | No unauthorized access possible across all endpoints |
| G-5 | Validate AI scoring accuracy and fairness | Grading proportional to answer quality; bias detection functional |
| G-6 | Verify XAI report generation and accessibility | PDF generated, downloadable by both candidate and recruiter |
| G-7 | Ensure frontend correctness across all pages | All 25 pages render with real data, actions perform correctly |

### 1.3 Quality Targets

- **Defect Density:** < 5 critical defects per module at release
- **Test Coverage:** > 80% line coverage for backend unit tests
- **Performance:** API responses < 500ms for 95th percentile (excluding AI operations)
- **Availability:** System handles concurrent exam sessions without data corruption

---

## 2. Scope

### 2.1 In-Scope Features

#### 2.1.1 Authentication & Authorization Module

| Feature ID | Feature | Description |
|------------|---------|-------------|
| AUTH-01 | Candidate Registration | Email + password + OTP verification |
| AUTH-02 | Recruiter Registration | Admin-created accounts |
| AUTH-03 | Login (all roles) | JWT-based with HS512 signing |
| AUTH-04 | OTP Verification | Redis-cached 6-digit code, email delivery |
| AUTH-05 | Password Reset | Forgot password + reset token flow |
| AUTH-06 | Role-Based Access | SUPER_ADMIN, RECRUITER, CANDIDATE enforcement |
| AUTH-07 | User Status Management | ACTIVE / SUSPENDED / BLOCKED transitions |

#### 2.1.2 Job Management Module

| Feature ID | Feature | Description |
|------------|---------|-------------|
| JOB-01 | Create Job Posting | Recruiter creates with title, description, requirements, exam date |
| JOB-02 | Update Job Posting | Edit title, description, requirements, location, salary range |
| JOB-03 | Archive/Unarchive Job | Soft-delete toggle |
| JOB-04 | List Jobs (Candidate) | Active job listings with search |
| JOB-05 | List Jobs (Recruiter) | Own jobs with application counts |
| JOB-06 | Change Job Status | OPEN / CLOSED / DRAFT transitions |

#### 2.1.3 Application & CV Module

| Feature ID | Feature | Description |
|------------|---------|-------------|
| APP-01 | Submit Application | Candidate applies with CV upload (PDF) |
| APP-02 | Duplicate Prevention | One application per candidate per job |
| APP-03 | AI CV Screening | Ollama LLM scores CV relevance (0-100) |
| APP-04 | Hard Filter Check | Boolean pass/fail on mandatory requirements |
| APP-05 | Weighted Final Score | Configurable CV + exam weight formula |
| APP-06 | Application Status Tracking | 10-state lifecycle (see 2.1.8) |

#### 2.1.4 Exam Engine Module (Go/Gin microservice)

| Feature ID | Feature | Description |
|------------|---------|-------------|
| EXAM-01 | Batch Ready Event | Spring notifies exam-engine with candidate list + schedule |
| EXAM-02 | Question Caching | Fetches questions from Spring, caches in-memory |
| EXAM-03 | Start Exam | Candidate starts with JWT; validates window + authorization |
| EXAM-04 | Submit Answer | Sequential question flow; MCQ + SHORT_ANSWER types |
| EXAM-05 | Question Shuffling | Per-candidate deterministic shuffle |
| EXAM-06 | MCQ Auto-Grading | Immediate scoring against correct answer index |
| EXAM-07 | Short-Answer AI Grading | Async via worker pool; SBERT similarity + Ollama LLM |
| EXAM-08 | Exam Completion Callback | POST to Spring with final score |
| EXAM-09 | Session Persistence | Redis-backed with TTL |
| EXAM-10 | Heartbeat / Disconnect Detection | Flags candidates as DISCONNECTED after inactivity |
| EXAM-11 | Resume Exam | Reconnect to active session |
| EXAM-12 | JWT HS256 + HS512 Support | Shared secret with Spring Boot |

#### 2.1.5 Interview Scheduling Module

| Feature ID | Feature | Description |
|------------|---------|-------------|
| INT-01 | Recruiter Availability Slots | Define available date/time slots |
| INT-02 | Candidate Slot Booking | Book from available slots |
| INT-03 | Interview Reminders | Scheduled email reminders before interview date |

#### 2.1.6 Decision & Feedback Module

| Feature ID | Feature | Description |
|------------|---------|-------------|
| DEC-01 | Shortlist Candidates | Batch operation from EXAM_COMPLETED |
| DEC-02 | Record Final Decision | SELECTED / REJECTED / WAITLISTED with notes |
| DEC-03 | XAI Report Generation | LIME-backed PDF with CV attribution, justification |
| DEC-04 | XAI Report Download | Recruiter + candidate access via Spring proxy |
| DEC-05 | Candidate Feedback | View scores, status, and XAI report |
| DEC-06 | Decision Notifications | Email notification on status change |

#### 2.1.7 Admin Module

| Feature ID | Feature | Description |
|------------|---------|-------------|
| ADM-01 | User Management | List, create recruiter, suspend/block/activate users |
| ADM-02 | Job Oversight | View all jobs across recruiters |
| ADM-03 | System Health | Actuator-based health checks |
| ADM-04 | Audit Logs | Searchable activity trail |
| ADM-05 | AI Model Versions | Register, activate AI model configurations |
| ADM-06 | Analytics Export | CSV download of recruitment metrics |

#### 2.1.8 Application Status Lifecycle

```
SUBMITTED
    |
AI_SCREENING -----> HARD_FILTER_FAILED (terminal)
    |
EXAM_AUTHORIZED
    |
EXAM_COMPLETED
    |
SHORTLISTED
    |
INTERVIEW_SCHEDULED
    |
+-----------+-----------+
|           |           |
SELECTED  REJECTED  WAITLISTED
```

### 2.2 Out-of-Scope

| Item | Reason |
|------|--------|
| Load/stress testing beyond 50 concurrent users | Infrastructure not provisioned for scale testing |
| Mobile-native application testing | Platform is web-only |
| Third-party email delivery reliability | SMTP is external; mock adapter used in dev |
| Ollama model accuracy benchmarking | Model quality is upstream concern; we test integration only |
| Browser compatibility beyond Chrome/Firefox/Edge | Target browsers defined by stakeholders |
| Accessibility (WCAG) compliance | Deferred to future phase |

---

## 3. Test Strategy & Approach

### 3.1 Testing Levels

```
Level 4:  E2E Tests (Browser)        <- Selenium / manual
Level 3:  Integration Tests          <- Spring Boot @SpringBootTest, Docker
Level 2:  API / Contract Tests       <- REST endpoint validation
Level 1:  Unit Tests                 <- JUnit, Go testing, pytest
```

### 3.2 Testing Types

| Type | Scope | Tools | Priority |
|------|-------|-------|----------|
| **Unit Testing** | Individual classes/functions | JUnit 5, Go `testing`, pytest | P0 |
| **Integration Testing** | Service-to-service, DB queries | Spring Boot Test, Testcontainers | P0 |
| **API Testing** | REST endpoint contracts | curl, Postman, RestAssured | P0 |
| **End-to-End Testing** | Full user flows in browser | Manual + Selenium | P1 |
| **Security Testing** | Auth bypass, RBAC, injection | Manual + OWASP ZAP | P0 |
| **Regression Testing** | Previous bugs stay fixed | Automated test suite | P1 |
| **Smoke Testing** | Basic health after deployment | Docker health checks + curl | P0 |
| **Database Testing** | Migration, data integrity | Flyway validation, SQL queries | P1 |
| **Cross-Service Testing** | Spring <-> Go <-> Python flows | Docker Compose integration | P0 |

### 3.3 Test Execution Flow

```
1. Developer pushes code
2. CI runs unit tests (JUnit, Go test, pytest)
3. CI runs integration tests (Testcontainers)
4. Deploy to staging (Docker Compose)
5. Run smoke tests (health endpoints)
6. Run API tests (endpoint contracts)
7. Run E2E tests (critical paths)
8. Manual exploratory testing
9. Sign-off and merge
```

### 3.4 Test Design Techniques

- **Equivalence Partitioning:** Input validation (valid/invalid emails, password strength)
- **Boundary Value Analysis:** Score ranges (0, 0.3, 0.5, 1.0), marks (0, max), pagination limits
- **State Transition Testing:** Application status lifecycle (10 states, valid/invalid transitions)
- **Decision Table Testing:** RBAC matrix (role x endpoint x method = allow/deny)
- **Error Guessing:** Race conditions in grading, concurrent exam submissions, stale JWT

---

## 4. Test Scenarios & Cases

### 4.1 Authentication & Authorization

#### TC-AUTH-01: Candidate Registration

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | POST `/api/v1/auth/register/candidate` with valid data | 201 Created, OTP email sent |
| 2 | POST with duplicate email | 409 Conflict |
| 3 | POST with invalid email format | 400 Bad Request |
| 4 | POST with password < 8 chars | 400 Bad Request |
| 5 | POST `/api/v1/auth/verify-otp` with correct OTP | 200 OK, account activated |
| 6 | POST `/api/v1/auth/verify-otp` with expired OTP | 400 Bad Request |
| 7 | POST `/api/v1/auth/verify-otp` with wrong OTP 5x | Account blocked |
| 8 | POST `/api/v1/auth/resend-otp` | New OTP sent, old invalidated |

#### TC-AUTH-02: Login

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | POST `/api/v1/auth/login` with valid credentials | 200 OK, JWT token returned |
| 2 | POST with wrong password | 401 Unauthorized |
| 3 | POST with non-existent email | 401 Unauthorized |
| 4 | POST with SUSPENDED user | 403 Forbidden |
| 5 | Verify JWT contains userId, role, exp claims | Claims present and correct |
| 6 | Use expired JWT on protected endpoint | 401 Unauthorized |

#### TC-AUTH-03: RBAC Enforcement

| Endpoint | CANDIDATE | RECRUITER | SUPER_ADMIN |
|----------|-----------|-----------|-------------|
| POST `/api/v1/applications` | ALLOW | DENY | DENY |
| GET `/api/v1/recruiters/dashboard` | DENY | ALLOW | DENY |
| GET `/api/v1/recruiters/applications` | DENY | ALLOW | DENY |
| POST `/api/v1/applications/shortlist` | DENY | ALLOW | DENY |
| POST `/api/v1/applications/{id}/decision` | DENY | ALLOW | DENY |
| GET `/api/v1/admin/users` | DENY | DENY | ALLOW |
| POST `/api/v1/admin/users/recruiter` | DENY | DENY | ALLOW |
| PATCH `/api/v1/admin/users/{id}/status` | DENY | DENY | ALLOW |
| GET `/api/v1/admin/audit-logs` | DENY | DENY | ALLOW |
| GET `/api/v1/applications/{id}/xai-report` | ALLOW* | ALLOW* | DENY |

*\*ALLOW only for own applications (candidate) or own jobs (recruiter)*

#### TC-AUTH-04: Password Reset

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | POST `/api/v1/auth/forgot-password` with valid email | 200 OK, reset OTP sent |
| 2 | POST `/api/v1/auth/reset-password` with valid OTP + new password | 200 OK, password changed |
| 3 | Login with old password | 401 Unauthorized |
| 4 | Login with new password | 200 OK |

---

### 4.2 Job Management

#### TC-JOB-01: Job CRUD

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | POST `/api/v1/jobs` with valid data (recruiter) | 201 Created |
| 2 | GET `/api/v1/jobs` as candidate | Returns active jobs only |
| 3 | GET `/api/v1/jobs/mine` as recruiter | Returns own jobs with app counts |
| 4 | PUT `/api/v1/jobs/{id}` update title | 200 OK, title updated |
| 5 | POST `/api/v1/jobs/{id}/archive` | Job archived, hidden from candidates |
| 6 | PATCH `/api/v1/jobs/{id}/status` to CLOSED | Status updated |
| 7 | Candidate applies to CLOSED job | 400 Bad Request |

---

### 4.3 Application & CV Screening

#### TC-APP-01: Submit Application

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | POST `/api/v1/applications` with CV file (PDF) | 201 Created, status=SUBMITTED |
| 2 | Submit again to same job | 409 Conflict (duplicate prevention) |
| 3 | Submit to non-existent job | 404 Not Found |
| 4 | Submit without CV file | 400 Bad Request |
| 5 | Verify AI scoring event dispatched | ai-service receives POST `/api/v1/score-cv` |

#### TC-APP-02: AI CV Screening Pipeline

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | ai-service receives score-cv event | CV text extracted, SBERT + Ollama score computed |
| 2 | Score callback to Spring | POST `/api/v1/internal/applications/{id}/ai-score` |
| 3 | Application status updated | SUBMITTED -> AI_SCREENING with cvRelevanceScore set |
| 4 | Hard filter check executed | hardFilterPassed set to true/false |
| 5 | If hard filter fails | Status -> HARD_FILTER_FAILED (terminal) |
| 6 | Final weighted score computed | finalScore = (cvWeight * cvScore) + (examWeight * examScore) |

#### TC-APP-03: Score Proportionality

| Input Similarity | Expected Behavior |
|-----------------|-------------------|
| similarity <= 0.3 | Awarded marks = 0 |
| similarity = 0.5 | Marks capped at 50% of max |
| similarity = 0.9 | Marks close to max |
| Completely wrong topic answer | 0 marks |
| Perfect paraphrase | Near-max marks |

---

### 4.4 Exam Engine

#### TC-EXAM-01: Batch Ready Flow

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Recruiter authorizes exam batch via Spring | ExamBatchReadyEvent published |
| 2 | Exam-engine receives POST `/api/v1/batches/ready` | 202 Accepted |
| 3 | Exam-engine fetches questions from Spring | GET `/api/v1/internal/exams/{id}/questions` returns 5 questions |
| 4 | Questions cached in memory | Log: "cached 5 questions for exam X" |
| 5 | Schedule stored in Redis | Start time + duration window persisted |
| 6 | Candidate IDs stored as authorized | Redis set populated |

#### TC-EXAM-02: Start Exam

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | GET `/exam/start?jobId=X` with valid JWT | 200 OK, first question returned |
| 2 | Response includes questionNumber, totalQuestions, timeRemaining | All fields present |
| 3 | Start again while active session exists | Returns same session (idempotent) |
| 4 | Start after exam submitted | 403 "exam already submitted" |
| 5 | Start outside time window | 403 "exam window closed" |
| 6 | Start as unauthorized candidate | 403 "not authorized for this exam" |
| 7 | Start with invalid JWT | 401 Unauthorized |
| 8 | Start with HS256 JWT | Works (both algorithms supported) |
| 9 | Start with HS512 JWT | Works (both algorithms supported) |

#### TC-EXAM-03: Submit Answers

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | POST `/exam/submit-answer?jobId=X` MCQ correct | Next question returned, score incremented |
| 2 | POST MCQ incorrect answer | Next question returned, score not incremented |
| 3 | POST SHORT_ANSWER with good answer | Next question returned |
| 4 | Submit all 5 answers | `{"completed": true}` |
| 5 | Submit after completion | 403 "exam already submitted" |
| 6 | Question order is shuffled per candidate | Different candidates get different order |

#### TC-EXAM-04: Grading Pipeline

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | MCQ grading: all correct | MCQ score = sum of all MCQ marks |
| 2 | MCQ grading: all wrong | MCQ score = 0 |
| 3 | Short-answer grading dispatched to worker pool | AI grading requests sent to ai-service |
| 4 | All short-answers graded before publishing | Single exam-completed event (no race condition) |
| 5 | exam-completed POST to Spring | candidateId, jobId, examScore, completedAt |
| 6 | Application status updated | EXAM_AUTHORIZED -> EXAM_COMPLETED, examScore set |
| 7 | AI grading failure (3 retries exhausted) | Score 0 for that question, exam still completes |

#### TC-EXAM-05: Disconnect & Resume

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Stop sending heartbeats for 30s | Candidate flagged DISCONNECTED |
| 2 | GET `/exam/resume?jobId=X` | Current question + progress returned |
| 3 | Previous answers preserved | AnswersMap intact in Redis |
| 4 | Timer continues during disconnect | timeRemaining decremented |

---

### 4.5 Interview Scheduling

#### TC-INT-01: Slot Management

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | POST `/api/v1/jobs/{id}/slots/availability` as recruiter | Slots created |
| 2 | GET `/api/v1/jobs/{id}/slots/availability` as candidate | Available slots listed |
| 3 | POST `/api/v1/jobs/{id}/slots/{slotId}/book` | Slot booked, status -> INTERVIEW_SCHEDULED |
| 4 | Book already-booked slot | 409 Conflict |
| 5 | Book slot for non-shortlisted application | 400 Bad Request |

---

### 4.6 Decision & XAI Report

#### TC-DEC-01: Record Decision

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | POST `/api/v1/applications/{id}/decision` SELECTED | Status -> SELECTED, audit log created |
| 2 | POST REJECTED with notes | Status -> REJECTED, decisionNotes stored |
| 3 | POST WAITLISTED | Status -> WAITLISTED |
| 4 | Decision on non-SHORTLISTED/INTERVIEW_SCHEDULED app | 400 "only allowed from SHORTLISTED or INTERVIEW_SCHEDULED" |
| 5 | Decision on already-decided app | 400 "Decision already recorded" |
| 6 | Decision triggers XAI report build | Async POST to ai-service `/api/v1/xai/report` |
| 7 | Candidate receives email notification | Decision email sent |

#### TC-DEC-02: XAI Report Generation

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | ai-service builds LIME attribution | CV features weighted and ranked |
| 2 | Justification text generated | Summary of scores + rationale |
| 3 | PDF generated with charts | ReportLab PDF with attribution bar chart |
| 4 | downloadUrl stored on application | xai_report_url column updated |
| 5 | No CV text in cache | Fallback: uses job description as proxy |

#### TC-DEC-03: XAI Report Download

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | GET `/api/v1/applications/{id}/xai-report` as recruiter (own job) | 200 OK, PDF stream (application/pdf) |
| 2 | GET as candidate (own application) | 200 OK, PDF stream |
| 3 | GET as recruiter (not own job) | 403 Forbidden |
| 4 | GET as candidate (not own application) | 403 Forbidden |
| 5 | GET before report generated | 400 "XAI report not available yet" |
| 6 | Verify PDF is valid | Starts with `%PDF-1.4`, parseable |

---

### 4.7 Recruiter Dashboard

#### TC-DASH-01: Dashboard Data

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | GET `/api/v1/recruiters/dashboard` | Paginated job entries with counts |
| 2 | Each entry has screeningCount, examCount, interviewCount, decidedCount | Counts match application statuses |
| 3 | GET `/api/v1/recruiters/applications` | All applications across recruiter's jobs |
| 4 | Response includes xaiReportUrl and decisionNotes | Fields present (null if not set) |

---

### 4.8 Admin Module

#### TC-ADM-01: User Management

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | GET `/api/v1/admin/users` as SUPER_ADMIN | All users listed |
| 2 | POST `/api/v1/admin/users/recruiter` | Recruiter account created |
| 3 | PATCH `/api/v1/admin/users/{id}/status` to SUSPENDED | User cannot login |
| 4 | PATCH back to ACTIVE | User can login again |
| 5 | All above as non-admin | 403 Forbidden |

#### TC-ADM-02: System Administration

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | GET `/api/v1/admin/system/health` | Service health status |
| 2 | GET `/api/v1/admin/audit-logs` | Paginated audit trail |
| 3 | POST `/api/v1/admin/ai-models` | New model version registered |
| 4 | POST `/api/v1/admin/ai-models/{id}/activate` | Model set as active |
| 5 | GET `/api/v1/analytics/export` | CSV file download |

---

### 4.9 Frontend Pages

#### TC-FE-01: Page Rendering & Data

| Page | Route | Key Assertions |
|------|-------|----------------|
| Login | `/login` | Form submits, JWT stored, redirect by role |
| Register | `/register` | Candidate registration + OTP flow |
| Verify OTP | `/verify-otp` | 6-digit input, timer, resend |
| Forgot Password | `/forgot-password` | Email input, OTP, new password |
| Recruiter Dashboard | `/dashboard` | Funnel chart, job cards with counts |
| Candidates Pool | `/dashboard/candidates` | Table with search/filter, detail modal, XAI download button |
| Pipeline (Kanban) | `/dashboard/pipeline` | Drag-and-drop columns by status |
| Jobs Management | `/dashboard/jobs` | CRUD, archive, status change |
| Interviews | `/dashboard/interviews` | Slot management, calendar view |
| Reports | `/dashboard/reports` | Charts, analytics data |
| Admin Dashboard | `/admin` | Stats overview |
| Admin Users | `/admin/users` | User table, create recruiter, status actions |
| Admin Jobs | `/admin/jobs` | All jobs across recruiters |
| Admin Config | `/admin/config` | AI model management panel |
| Admin Logs | `/admin/logs` | Audit log viewer |
| Candidate Home | `/candidate` | Application status overview |
| Candidate Jobs | `/candidate/jobs` | Browse + apply |
| Candidate Applications | `/candidate/applications` | My applications list |
| Candidate Exams | `/candidate/exams` | Exam interface |
| Candidate Profile | `/candidate/profile` | Edit profile |
| Candidate Feedback | `/candidate/feedback` | View scores + XAI report |
| Settings | `/settings` | Account settings |
| Notifications | `/notifications` | Notification center |

---

### 4.10 Cross-Service Integration

#### TC-INT-SVC-01: Spring Boot <-> Exam Engine

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Spring POST batch-ready to exam-engine | X-Internal-Api-Key validated, 202 returned |
| 2 | Exam-engine GET questions from Spring | X-Internal-Api-Key validated, questions returned with idealAnswer |
| 3 | Exam-engine POST exam-completed to Spring | Score applied, status updated |
| 4 | Invalid API key | 401 Unauthorized |
| 5 | Exam-engine down during batch-ready | Spring logs error, does not crash |

#### TC-INT-SVC-02: Spring Boot <-> AI Service

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Spring POST score-cv to ai-service | CV scored, callback received |
| 2 | Spring POST XAI report build | PDF generated, URL stored |
| 3 | Spring proxy-downloads PDF from ai-service | Full PDF streamed (HTTP/1.1) |
| 4 | AI service down | Spring logs error, request continues |
| 5 | HTTP/1.1 enforced | No "Unsupported upgrade request" errors |

#### TC-INT-SVC-03: Exam Engine <-> AI Service

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Exam-engine POST grade-answer to ai-service | SBERT similarity + Ollama grading returned |
| 2 | Retry on failure (3 attempts, exponential backoff) | Eventual success or graceful 0 score |
| 3 | ai-service returns 422 (validation error) | All retries fail, score = 0, exam still completes |

---

## 5. Assumptions & Risks

### 5.1 Assumptions

| # | Assumption |
|---|-----------|
| A-1 | PostgreSQL 16.x is available and running before tests |
| A-2 | Redis 7.x is available for session/cache storage |
| A-3 | Ollama is running locally with `qwen2.5:1.5b` model loaded |
| A-4 | SMTP server is reachable (or mock adapter is active for dev) |
| A-5 | Docker and Docker Compose are installed for integration tests |
| A-6 | Test data is seeded via Flyway migrations (V1-V12) |
| A-7 | All services share the same JWT_SECRET and INTERNAL_API_KEY |
| A-8 | Test users exist: admin@eaa.dz, recruiter-demo@eaa.dz (password: Test1234!) |

### 5.2 Risks & Mitigation

| # | Risk | Impact | Probability | Mitigation |
|---|------|--------|-------------|------------|
| R-1 | Ollama model produces inconsistent grading across runs | Medium | High | Post-processing caps + similarity thresholds enforced |
| R-2 | Race condition in concurrent exam grading | High | Medium | Fixed: atomic collection of all short-answer results before publishing |
| R-3 | Redis data loss on container restart | Medium | Medium | Exam sessions use TTL; batch-ready can be re-sent |
| R-4 | XAI report generation takes > 30s | Low | Medium | Async @Async execution; recruiter not blocked |
| R-5 | HTTP/2 upgrade breaks Spring <-> uvicorn | High | High | Fixed: HTTP/1.1 enforced via JdkClientHttpRequestFactory |
| R-6 | Lazy initialization in async context | High | High | Fixed: @Transactional on async methods |
| R-7 | Optimistic lock conflict on XAI URL save | Medium | High | Fixed: native UPDATE query bypasses JPA versioning |
| R-8 | PDF reports lost on container rebuild | Low | High | Reports stored in container; recommend volume mount for production |
| R-9 | JWT algorithm mismatch between services | High | Low | Fixed: exam-engine supports both HS256 and HS512 |
| R-10 | Seed data has no ideal_answer for SHORT_ANSWER questions | High | Low | Fixed: V12 migration backfills ideal answers |

---

## 6. Roles & Responsibilities

| Role | Responsibility | Assignee |
|------|---------------|----------|
| **QA Lead** | Test plan creation, review, sign-off, defect triage | TBD |
| **Backend Tester** | API testing, integration tests, DB validation | TBD |
| **Frontend Tester** | UI testing, cross-browser, responsive layout | TBD |
| **DevOps Engineer** | Test environment setup, Docker, CI/CD pipeline | TBD |
| **Developer** | Unit tests, bug fixes, code review | Development Team |
| **Product Owner** | Acceptance criteria, UAT sign-off | TBD |

---

## 7. Schedule & Estimation

### 7.1 Test Phases

| Phase | Duration | Start | End | Deliverable |
|-------|----------|-------|-----|-------------|
| **Phase 1: Unit Testing** | 1 week | Week 1 | Week 1 | Unit test reports per service |
| **Phase 2: API Testing** | 1 week | Week 2 | Week 2 | API test results + Postman collection |
| **Phase 3: Integration Testing** | 1 week | Week 2 | Week 3 | Cross-service test results |
| **Phase 4: E2E / UI Testing** | 1 week | Week 3 | Week 4 | E2E test report + screenshots |
| **Phase 5: Security Testing** | 3 days | Week 4 | Week 4 | Security audit report |
| **Phase 6: Regression Testing** | 3 days | Week 5 | Week 5 | Regression pass/fail report |
| **Phase 7: UAT** | 3 days | Week 5 | Week 5 | UAT sign-off document |

### 7.2 Effort Estimation

| Module | Test Cases | Estimated Hours |
|--------|-----------|-----------------|
| Authentication & Authorization | 25 | 16 |
| Job Management | 12 | 8 |
| Application & CV Screening | 18 | 14 |
| Exam Engine | 30 | 24 |
| Interview Scheduling | 10 | 6 |
| Decision & XAI Report | 20 | 16 |
| Admin Module | 15 | 10 |
| Frontend Pages (25 pages) | 50 | 30 |
| Cross-Service Integration | 15 | 12 |
| Security & RBAC | 20 | 12 |
| **Total** | **215** | **148 hours** |

---

## 8. Test Environment

### 8.1 Architecture

```
                   +-------------+
                   |   Frontend  |
                   | Next.js 15  |
                   | Port: 3000  |
                   +------+------+
                          |
                   +------+------+
                   |   Backend   |
                   | Spring Boot |
                   |  Port: 8080 |
                   +--+-------+--+
                      |       |
           +----------+       +----------+
           |                              |
    +------+------+              +--------+-------+
    | Exam Engine  |              |   AI Service   |
    |   Go / Gin   |              | Python/FastAPI |
    |  Port: 8090  |              |  Port: 8000    |
    +------+------+              +--------+-------+
           |                              |
           +-----+     +---------+    +---+---+
                 |     |         |    |       |
              +--+--+  |  +-----+--+ | +-----+----+
              |Redis|  |  |Postgres| | |  Ollama   |
              |6379 |  |  | 5432   | | | 11434     |
              +-----+  |  +--------+ | +-----------+
                       |              |
                       +--------------+
```

### 8.2 Software Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Backend API | Spring Boot (Java 21) | 3.2.x |
| Exam Engine | Go + Gin | 1.22.x |
| AI Service | Python + FastAPI | 3.11 |
| Frontend | Next.js + React + TypeScript | 15.x |
| Database | PostgreSQL | 16.x |
| Cache / Sessions | Redis | 7.x |
| LLM | Ollama (qwen2.5:1.5b) | Latest |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) | Latest |
| Containerization | Docker + Docker Compose | Latest |

### 8.3 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| SUPER_ADMIN | admin@eaa.dz | Test1234! |
| RECRUITER | recruiter-demo@eaa.dz | Test1234! |
| CANDIDATE (good) | alice.good@demo.test | Test1234! |
| CANDIDATE (good) | bob.good@demo.test | Test1234! |
| CANDIDATE (medium) | dan.medium@demo.test | Test1234! |

### 8.4 Configuration

| Variable | Purpose | Test Value |
|----------|---------|------------|
| JWT_SECRET | Token signing (min 32 chars) | `dev-jwt-secret-change-me-min-256-bits-long-secret-key-12345` |
| INTERNAL_API_KEY | Service-to-service auth | From `.env` file |
| SPRING_PROFILES_ACTIVE | Env profile | `dev` |
| MAIL_ADAPTER | Email delivery | `mock` (dev) / `smtp` (staging) |

### 8.5 Starting the Test Environment

```bash
# Start all services
docker compose up -d

# Verify all healthy
docker compose ps

# Expected: 6 containers (postgres, redis, backend, frontend, exam-engine, ai-service)
```

---

## 9. Entry & Exit Criteria

### 9.1 Entry Criteria

| # | Criterion | Verification |
|---|-----------|-------------|
| EC-1 | Code compiles without errors in all 4 services | `docker compose build` succeeds |
| EC-2 | All Flyway migrations run successfully (V1-V12) | Backend logs: "Schema is up to date" |
| EC-3 | All services start and pass health checks | `docker compose ps` shows all healthy/running |
| EC-4 | Test data seeded in database | Users, jobs, applications exist |
| EC-5 | Unit test suite passes (>80% coverage) | CI green |
| EC-6 | Test environment matches staging configuration | Docker Compose with same images |
| EC-7 | Test plan reviewed and approved | QA Lead sign-off |

### 9.2 Exit Criteria

| # | Criterion | Threshold |
|---|-----------|-----------|
| EX-1 | All P0 test cases pass | 100% |
| EX-2 | All P1 test cases pass | >= 95% |
| EX-3 | No open Critical/Blocker defects | 0 |
| EX-4 | No open High defects | <= 2 (with workarounds documented) |
| EX-5 | All cross-service integration tests pass | 100% |
| EX-6 | Security tests reveal no auth bypass | 0 findings |
| EX-7 | Performance: API < 500ms (95th percentile) | Measured and documented |
| EX-8 | Regression test suite passes | 100% |

### 9.3 Suspension Criteria

| Criterion | Action |
|-----------|--------|
| > 3 Blocker defects open simultaneously | Suspend testing, escalate to dev team |
| Test environment unavailable > 2 hours | Suspend, notify DevOps |
| Service crashes repeatedly on basic flows | Suspend module testing, await hotfix |

---

## 10. Defect Management

### 10.1 Defect Lifecycle

```
  NEW --> OPEN --> IN PROGRESS --> FIXED --> VERIFIED --> CLOSED
   |                  |                        |
   +-> DUPLICATE      +-> DEFERRED             +-> REOPENED -> IN PROGRESS
   +-> REJECTED                                         
```

### 10.2 Severity Levels

| Severity | Definition | Example | SLA |
|----------|-----------|---------|-----|
| **BLOCKER** | System unusable, no workaround | Login fails for all users; exam engine crashes | Fix within 4 hours |
| **CRITICAL** | Major feature broken, workaround exists | XAI report generation fails; grading race condition | Fix within 1 day |
| **HIGH** | Feature partially broken | Candidate can't resume exam after disconnect | Fix within 2 days |
| **MEDIUM** | Minor feature issue | Dashboard counts off by 1; UI alignment | Fix within 1 week |
| **LOW** | Cosmetic / enhancement | Typo in label; color inconsistency | Backlog |

### 10.3 Priority Levels

| Priority | Description |
|----------|------------|
| P0 | Fix immediately (blocks release) |
| P1 | Fix before release |
| P2 | Fix in next sprint |
| P3 | Nice to have |

### 10.4 Defect Report Template

```
Title:        [Module] Brief description
Severity:     BLOCKER | CRITICAL | HIGH | MEDIUM | LOW
Priority:     P0 | P1 | P2 | P3
Environment:  Docker Compose / staging / production
Steps:        1. ... 2. ... 3. ...
Expected:     What should happen
Actual:       What actually happens
Evidence:     Screenshot / log excerpt / curl command
Assignee:     Developer name
```

### 10.5 Known Resolved Defects

| # | Defect | Root Cause | Fix |
|---|--------|-----------|-----|
| D-1 | Exam engine rejects Spring JWT | HS512 not supported, only HS256 | Added HS512 support in auth middleware |
| D-2 | Short-answer grading 422 error | idealAnswer was empty string (min_length=1) | Added ideal_answer column + V12 migration |
| D-3 | Duplicate exam-completed callbacks | Each short-answer goroutine published independently | Atomic collection via WaitGroup before single publish |
| D-4 | XAI report LazyInitializationException | @Async method ran outside Hibernate session | Added @Transactional to buildAndStore() |
| D-5 | Spring <-> ai-service HTTP/2 rejection | Java HttpClient default HTTP/2 upgrade | Forced HTTP/1.1 via JdkClientHttpRequestFactory |
| D-6 | Optimistic lock on XAI URL save | Version mismatch between decision tx and async tx | Native UPDATE query bypasses JPA versioning |
| D-7 | matplotlib "Invalid RGBA argument: 0x2e86c1" | ReportLab hexval() format incompatible | Hardcoded "#2e86c1" for matplotlib |
| D-8 | XAI download returns 57 bytes | UrlResource streaming issue with URL class | Proxy download via RestClient + ByteArrayResource |
| D-9 | Grading too generous at similarity=0.3 | Threshold used `<` instead of `<=` | Changed to `<= 0.3` |
| D-10 | Exam engine crash on startup | JWT_SECRET not set in docker-compose | Added env var to exam-engine service |

---

## 11. Test Automation Plan

### 11.1 Current Automated Tests

#### Backend (Spring Boot) &mdash; 41 test classes

| Category | Test Classes | Framework |
|----------|-------------|-----------|
| Entity / Domain | UserTest, JobPostingTest | JUnit 5 |
| Repository | UserRepositoryTest, JobPostingRepositoryTest | Spring Data JPA Test |
| Service | ApplicationServiceTest, ExamServiceTest, FinalDecisionServiceTest, ShortlistServiceTest, WeightedScoringServiceTest, HardFilterServiceTest, SlotBookingServiceTest, ArchiveServiceTest, AnalyticsServiceTest, FeedbackReportServiceTest, LoginServiceTest, PasswordResetServiceTest, CandidateRegistrationServiceTest, CandidateProfileServiceTest, JobServiceTest, RecruiterAdminServiceTest, UserStatusServiceTest | JUnit 5 + Mockito |
| Controller | AuthControllerTest, ApplicationControllerTest, ExamControllerTest, JobControllerTest, AdminUserControllerTest, AdminUserStatusControllerTest | MockMvc |
| Security | JwtTokenProviderTest, JwtAuthenticationFilterTest, RbacTest | Spring Security Test |
| Scheduler | JobStatusSchedulerTest, InterviewReminderSchedulerTest | JUnit 5 |
| Cache | OtpCacheServiceTest, OtpCacheIntegrationTest, BlockedUserCacheServiceTest | JUnit 5 |
| OTP | OtpServiceTest, MockOtpNotificationAdapterTest | JUnit 5 |
| Config | DataSourceConfigTest | Spring Boot Test |

#### Exam Engine (Go) &mdash; 6 test files

| Test File | Coverage |
|-----------|----------|
| exam_session_test.go | Session state management |
| question_cache_test.go | Cache store/retrieve |
| shuffle_test.go | Deterministic question shuffle |
| worker_pool_test.go | Task dispatch + collection |
| auth_test.go | JWT verification (HS256 + HS512) |
| session_service_concurrent_test.go | Concurrent Redis access |

#### AI Service (Python) &mdash; 8 test files

| Test File | Coverage |
|-----------|----------|
| test_health.py | Health endpoint |
| test_answer_scorer.py | Short-answer grading logic |
| test_similarity.py | SBERT similarity computation |
| test_keyword_checker.py | Required keyword validation |
| test_bias.py | Bias detection service |
| test_justification.py | XAI justification generation |
| test_ranking.py | Candidate ranking algorithm |
| test_vector_cache.py | Embedding cache |

### 11.2 Automation Targets

| Area | Current | Target | Tool |
|------|---------|--------|------|
| Backend unit tests | 41 classes | Maintain 80%+ coverage | JUnit 5 + JaCoCo |
| Backend integration | Partial | Full controller coverage | @SpringBootTest + Testcontainers |
| Exam engine unit | 6 files | Add grading_service_test.go | Go testing |
| AI service unit | 8 files | Add test_ollama_scoring.py, test_xai.py | pytest |
| API contract tests | 0 | Full endpoint coverage | Postman / Newman |
| E2E browser tests | 0 | Critical path coverage (5 flows) | Playwright / Selenium |

### 11.3 CI Pipeline Integration

```yaml
# Proposed CI stages
stages:
  - build:
      - docker compose build
  - unit-test:
      - ./gradlew test                    # Backend
      - cd exam-engine && go test ./...   # Exam engine
      - cd ai-service && pytest           # AI service
  - integration-test:
      - docker compose up -d
      - ./gradlew integrationTest
  - api-test:
      - newman run postman_collection.json
  - deploy-staging:
      - docker compose -f docker-compose.staging.yml up -d
```

---

## 12. Test Deliverables

| # | Deliverable | Format | When |
|---|------------|--------|------|
| D-1 | Test Plan Document (this file) | Markdown | Before testing begins |
| D-2 | Test Case Specifications | Spreadsheet / Markdown | Phase 1 |
| D-3 | Unit Test Reports (per service) | JUnit XML / Go test output / pytest | Each phase |
| D-4 | API Test Collection | Postman JSON | Phase 2 |
| D-5 | Integration Test Results | CI report | Phase 3 |
| D-6 | E2E Test Report with Screenshots | HTML report | Phase 4 |
| D-7 | Security Audit Report | PDF | Phase 5 |
| D-8 | Defect Log | Issue tracker export | Ongoing |
| D-9 | Regression Test Report | CI report | Phase 6 |
| D-10 | Test Summary Report | PDF / Markdown | End of testing |
| D-11 | UAT Sign-off Document | Signed PDF | Phase 7 |

---

## 13. Templates & Standards

### 13.1 Test Case Template

| Field | Description |
|-------|------------|
| **TC-ID** | Unique identifier (e.g., TC-AUTH-01) |
| **Module** | Feature module (Auth, Exam, XAI, etc.) |
| **Title** | Brief description of what is being tested |
| **Preconditions** | Required state before test execution |
| **Steps** | Numbered sequence of actions |
| **Test Data** | Specific inputs used |
| **Expected Result** | What should happen |
| **Actual Result** | What actually happened (filled during execution) |
| **Status** | PASS / FAIL / BLOCKED / SKIPPED |
| **Priority** | P0 / P1 / P2 / P3 |
| **Notes** | Additional observations |

### 13.2 Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Test case ID | TC-{MODULE}-{NUMBER} | TC-EXAM-04 |
| Defect ID | D-{NUMBER} | D-7 |
| Test class (Java) | {Class}Test | ExamServiceTest |
| Test file (Go) | {file}_test.go | auth_test.go |
| Test file (Python) | test_{module}.py | test_similarity.py |
| Test method | test_{scenario}_{expected} | testLoginWithInvalidPassword_Returns401 |

### 13.3 Standards & References

| Standard | Application |
|----------|------------|
| IEEE 829 | Test documentation structure |
| OWASP Top 10 | Security testing checklist |
| REST API Guidelines | Endpoint naming, HTTP status codes |
| Git Conventional Commits | Commit message format for test code |

---

## Appendix A: Application Status Transition Matrix

| From \ To | SUBMITTED | AI_SCREENING | HARD_FILTER_FAILED | EXAM_AUTHORIZED | EXAM_COMPLETED | SHORTLISTED | INTERVIEW_SCHEDULED | SELECTED | REJECTED | WAITLISTED |
|-----------|:---------:|:------------:|:-----------------:|:---------------:|:--------------:|:-----------:|:-------------------:|:--------:|:--------:|:----------:|
| SUBMITTED | - | AUTO | - | - | - | - | - | - | - | - |
| AI_SCREENING | - | - | AUTO | RECRUITER | - | - | - | - | - | - |
| HARD_FILTER_FAILED | - | - | - | - | - | - | - | - | - | - |
| EXAM_AUTHORIZED | - | - | - | - | ENGINE | - | - | - | - | - |
| EXAM_COMPLETED | - | - | - | - | - | RECRUITER | - | - | - | - |
| SHORTLISTED | - | - | - | - | - | - | CANDIDATE | RECRUITER | RECRUITER | RECRUITER |
| INTERVIEW_SCHEDULED | - | - | - | - | - | - | - | RECRUITER | RECRUITER | RECRUITER |
| SELECTED | - | - | - | - | - | - | - | - | - | - |
| REJECTED | - | - | - | - | - | - | - | - | - | - |
| WAITLISTED | - | - | - | - | - | - | - | - | - | - |

**Legend:** AUTO = system-triggered, RECRUITER = recruiter action, CANDIDATE = candidate action, ENGINE = exam-engine callback

---

## Appendix B: API Endpoint Inventory

### Auth (`/api/v1/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /register/candidate | None | Register new candidate |
| POST | /verify-otp | None | Verify OTP code |
| POST | /resend-otp | None | Resend OTP |
| POST | /login | None | Login, get JWT |
| POST | /forgot-password | None | Request password reset |
| POST | /reset-password | None | Reset with OTP |
| POST | /change-password | JWT | Change password |

### Jobs (`/api/v1/jobs`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | / | JWT | List jobs (role-filtered) |
| POST | / | RECRUITER | Create job |
| GET | /mine | RECRUITER | Own jobs |
| GET | /{id} | JWT | Job detail |
| PUT | /{id} | RECRUITER | Update job |
| PATCH | /{id}/status | RECRUITER | Change status |
| POST | /{id}/archive | RECRUITER | Archive/unarchive |

### Applications (`/api/v1/applications`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | / | CANDIDATE | Submit application (multipart) |
| GET | / | CANDIDATE | My applications |
| POST | /shortlist | RECRUITER | Batch shortlist |
| POST | /{id}/decision | RECRUITER | Record final decision |
| POST | /{id}/advance | RECRUITER | Advance application status |
| GET | /{id}/feedback | AUTHENTICATED | Get feedback report |
| GET | /{id}/xai-report | AUTHENTICATED | Download XAI PDF |

### Recruiters (`/api/v1/recruiters`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /dashboard | RECRUITER | Dashboard with counts |
| GET | /applications | RECRUITER | All applications |

### Exams (`/api/v1/jobs/{jobId}/exam`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | / | RECRUITER | Create exam |
| POST | /authorize | RECRUITER | Authorize exam batch |

### Exam Engine (port 8090)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/v1/batches/ready | API Key | Batch ready event |
| GET | /exam/start | JWT | Start exam |
| POST | /exam/submit-answer | JWT | Submit answer |
| GET | /exam/resume | JWT | Resume session |
| POST | /exam/heartbeat | JWT | Keep-alive |
| GET | /health | None | Health check |

### Admin (`/api/v1/admin`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /users | SUPER_ADMIN | List users |
| POST | /users/recruiter | SUPER_ADMIN | Create recruiter |
| PATCH | /users/{id}/status | SUPER_ADMIN | Change user status |
| GET | /system/health | SUPER_ADMIN | System health |
| GET | /audit-logs | SUPER_ADMIN | Audit trail |
| GET | /ai-models | SUPER_ADMIN | List AI models |
| POST | /ai-models | SUPER_ADMIN | Register model |
| POST | /ai-models/{id}/activate | SUPER_ADMIN | Activate model |

### Internal (`/api/v1/internal`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /exams/{id}/questions | API Key | Fetch questions for exam-engine |
| POST | /applications/{id}/ai-score | API Key | AI score callback |
| POST | /applications/{id}/exam-score | API Key | Exam score callback |
| POST | /exam-completed | API Key | Exam completion callback |

### Candidates (`/api/v1/candidates`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /profile | CANDIDATE | Get profile |
| PUT | /profile | CANDIDATE | Update profile |
| GET | /me | CANDIDATE | Current user info |

### Slots (`/api/v1/jobs/{jobId}/slots`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /availability | RECRUITER | Create slots |
| GET | /availability | AUTHENTICATED | List slots |
| POST | /{slotId}/book | CANDIDATE | Book interview slot |

### Analytics (`/api/v1/analytics`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | / | AUTHENTICATED | Analytics summary |
| GET | /export | AUTHENTICATED | CSV export |

---

## Appendix C: Database Schema Overview

| Table | Records (seed) | Purpose |
|-------|---------------|---------|
| users | ~35 | All user accounts (admin, recruiters, candidates) |
| job_postings | 13 | Job listings with requirements |
| applications | ~65 | Candidate applications with scores |
| exams | 13 | Exam definitions per job |
| questions | 65 | 5 questions per exam (3 MCQ + 2 SHORT_ANSWER) |
| availability_slots | Variable | Interview time slots |
| audit_logs | Variable | Activity trail |
| ai_model_versions | Variable | AI model configurations |
| flyway_schema_history | 12 | Migration tracking |

---

*End of Test Plan Documentation*
