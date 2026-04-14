# Functional Requirements — EAA Recruitment System

---

## Epic 1: Core Recruitment Orchestration (Spring Boot)

### Infrastructure & Security Foundation

---

## FR-01: Spring Boot Project Initialization
**Description:** The system requires a well-structured Spring Boot project using Java 21+ and a build tool (Gradle or Maven) to serve as the backbone of the recruitment orchestration service. The project structure must follow standard layered architecture conventions (controller, service, repository) to ensure maintainability and scalability across all future development phases.

**Actors:** Developer, System

**Preconditions:**
- Java 21+ is installed on the development machine
- Gradle or Maven is available
- An IDE (e.g., IntelliJ) is configured

**Acceptance Criteria:**
- Project initializes and runs without errors using `./gradlew bootRun` or `mvn spring-boot:run`
- Java 21+ language features are usable (records, sealed classes, pattern matching)
- Standard package structure exists: `controller/`, `service/`, `repository/`, `entity/`, `dto/`, `config/`
- Application starts on a configurable port (default 8080)
- A health check endpoint (`/actuator/health`) returns `UP`

---

## FR-02: PostgreSQL Connection Pool and Hibernate/JPA Configuration
**Description:** The system must establish a reliable and performant connection to a PostgreSQL database using a configured connection pool (HikariCP) and Hibernate/JPA for ORM. This configuration ensures that database interactions are efficient, safe under concurrent load, and consistent across all entities in the system.

**Actors:** Developer, System

**Preconditions:**
- A PostgreSQL instance is running and accessible
- Database credentials are available
- Spring Boot project (FR-01) is initialized

**Acceptance Criteria:**
- Application connects to PostgreSQL on startup without errors
- HikariCP connection pool is configured with sensible min/max pool sizes
- Hibernate DDL auto-update or Flyway/Liquibase migration runs on startup
- JPA repositories can perform basic CRUD operations
- Connection pool settings are externalized in `application.yml`

---

## FR-03: Spring Security with JWT Stateless Authentication
**Description:** The system must implement a stateless authentication mechanism using JSON Web Tokens (JWT) via Spring Security. Every protected API endpoint must require a valid Bearer token in the Authorization header. The system must not store session state on the server side, making it horizontally scalable.

**Actors:** Candidate, Recruiter, Admin, Super Admin, System

**Preconditions:**
- Spring Boot project is initialized (FR-01)
- User entity and roles are defined (FR-07, FR-08)

**Acceptance Criteria:**
- Unauthenticated requests to protected endpoints return HTTP 401
- A valid JWT token is accepted and the user's identity is resolved from it
- JWT contains user ID, role, and expiry claims
- Token expiry is enforced; expired tokens return HTTP 401
- The JWT secret is externalized and not hardcoded
- Stateless session creation policy is configured (`SessionCreationPolicy.STATELESS`)

---

## FR-04: Global Exception Handler and Standard API Response Wrapper
**Description:** All API responses across the system must follow a consistent structure using a standard wrapper object, and all exceptions must be caught and formatted centrally using a `@RestControllerAdvice` global exception handler. This ensures that clients always receive predictable, machine-readable responses regardless of whether the request succeeded or failed.

**Actors:** Developer, System, All API Consumers

**Preconditions:**
- Spring Boot project is initialized (FR-01)

**Acceptance Criteria:**
- All successful API responses follow the structure: `{ status, message, data, timestamp }`
- All error responses follow the structure: `{ status, message, errors, timestamp }`
- `@RestControllerAdvice` handles common exceptions: `NotFoundException`, `ValidationException`, `UnauthorizedException`
- HTTP status codes are mapped correctly (404, 400, 401, 403, 500)
- Stack traces are never exposed in production responses
- Validation errors (from `@Valid`) return a structured list of field-level messages

---

## FR-05: Spring Cloud Stream with Kafka Configuration
**Description:** The system must integrate Apache Kafka via Spring Cloud Stream to enable asynchronous, event-driven communication between the Spring Boot orchestrator and the other services (Python AI and Go Exam Engine). Kafka producers must be configured to publish events for CV uploads and exam batch triggers.

**Actors:** System, Python AI Service, Go Exam Engine

**Preconditions:**
- A Kafka broker is running and accessible
- Spring Boot project is initialized (FR-01)

**Acceptance Criteria:**
- Application connects to Kafka on startup without errors
- A Kafka producer can publish a message to the `CV_UPLOADED` topic
- A Kafka producer can publish a message to the `EXAM_BATCH_READY` topic
- Kafka broker address is externalized in `application.yml`
- Failed message publishing is logged with sufficient detail for debugging
- Messages are serialized as JSON

---

## FR-06: Redis Integration for Session Management and OTP Caching
**Description:** The system must integrate Redis as an in-memory data store for two purposes: caching One-Time Passwords (OTPs) with a short time-to-live (TTL) during the registration and verification flow, and supporting any lightweight session or state caching needs. Redis must be configured with a connection pool and the TTL for OTP keys must be strictly enforced.

**Actors:** Candidate, Recruiter, System

**Preconditions:**
- A Redis instance is running and accessible
- Spring Boot project is initialized (FR-01)

**Acceptance Criteria:**
- Application connects to Redis on startup without errors
- OTP values can be stored with a configurable TTL (e.g., 5 minutes)
- Expired OTP keys are automatically evicted by Redis
- Redis connection details are externalized in `application.yml`
- A failed Redis connection does not crash the entire application (graceful degradation)

---

### User & Identity Management

---

## FR-07: Role-Based Access Control (RBAC)
**Description:** The system must enforce role-based access control across all API endpoints, distinguishing between four roles: Candidate, Recruiter, Admin, and Super Admin. Each role has a distinct set of permitted actions, and any attempt to access a resource outside a user's role must be rejected with an appropriate HTTP error.

**Actors:** Candidate, Recruiter, Admin, Super Admin, System

**Preconditions:**
- JWT authentication is configured (FR-03)
- User entity with a role field exists (FR-08)

**Acceptance Criteria:**
- Candidates cannot access recruiter or admin endpoints
- Recruiters cannot access admin-only endpoints
- Admins can manage recruiter accounts but cannot override Super Admin actions
- Super Admins have unrestricted access to all endpoints
- Unauthorized role access returns HTTP 403
- Role is encoded in the JWT and enforced via `@PreAuthorize` or a security filter

---

## FR-08: User Entity and Repository
**Description:** The system must define a shared `User` entity that stores common fields applicable to all roles. This entity acts as the base identity record in the system and is extended or referenced by role-specific profiles. A corresponding JPA repository must expose standard CRUD operations for user management.

**Actors:** Developer, System

**Preconditions:**
- PostgreSQL and JPA are configured (FR-02)

**Acceptance Criteria:**
- `User` entity contains: `id`, `email`, `passwordHash`, `role`, `isActive`, `createdAt`, `updatedAt`
- Email is unique and indexed
- `UserRepository` extends `JpaRepository` and supports `findByEmail`
- Passwords are stored as bcrypt hashes, never as plaintext
- Entity timestamps are automatically managed via `@CreationTimestamp` / `@UpdateTimestamp`

---

## FR-09: OTP Service
**Description:** The system must provide an OTP (One-Time Password) service that generates a time-limited numeric code, sends it to the user via a mock email or SMS channel, and verifies it upon user submission. This service is used during candidate registration and any other flows requiring secondary identity verification.

**Actors:** Candidate, System

**Preconditions:**
- Redis is configured (FR-06)
- A mock email/SMS transport is available

**Acceptance Criteria:**
- OTP is a 6-digit numeric code generated securely
- OTP is stored in Redis with a TTL of 5 minutes keyed by the user's email or phone
- A mock email/SMS is sent (logged to console in development) upon OTP generation
- OTP verification returns success if the code matches and has not expired
- OTP verification returns failure with a clear message if expired or incorrect
- A used OTP is immediately invalidated after successful verification

---

## FR-10: Candidate Registration API
**Description:** The system must expose a public API endpoint allowing new candidates to register by providing their basic profile information. Upon successful registration, an OTP verification flow is triggered to confirm the candidate's contact information before the account is activated.

**Actors:** Candidate, System

**Preconditions:**
- User entity and repository are ready (FR-08)
- OTP service is implemented (FR-09)

**Acceptance Criteria:**
- `POST /api/v1/auth/register/candidate` accepts: name, email, password, phone
- Duplicate email registrations return HTTP 409
- Password is hashed before storage
- An OTP is sent to the candidate's email/phone upon successful registration
- The account is created in an `INACTIVE` state pending OTP verification
- Input validation rejects missing or malformed fields with HTTP 400

---

## FR-11: Recruiter Account Creation API
**Description:** Recruiter accounts cannot be self-registered. They must be created exclusively by Admin or Super Admin users through a restricted API endpoint. This ensures that only vetted individuals are granted recruiter-level access to the system.

**Actors:** Admin, Super Admin, System

**Preconditions:**
- RBAC is configured (FR-07)
- User entity and repository are ready (FR-08)

**Acceptance Criteria:**
- `POST /api/v1/admin/users/recruiter` is accessible only to Admin and Super Admin roles
- Endpoint accepts: name, email, temporary password
- A recruiter account is created in an `ACTIVE` state
- Duplicate email returns HTTP 409
- The new recruiter receives a mock welcome email with their credentials
- Candidates or unauthenticated users receive HTTP 403

---

## FR-12: User Activation and Deactivation
**Description:** Admins must be able to toggle the active status of any user account in the system, effectively enabling or disabling their access. A deactivated user must be immediately prevented from authenticating, even if they hold a currently valid JWT token.

**Actors:** Admin, Super Admin, System

**Preconditions:**
- RBAC is configured (FR-07)
- User entity exists (FR-08)

**Acceptance Criteria:**
- `PATCH /api/v1/admin/users/{id}/status` accepts `{ active: true | false }`
- Deactivated users receive HTTP 403 on any subsequent request
- Activation restores full access for the user
- Admins cannot deactivate Super Admin accounts
- The status change is reflected immediately without requiring a new token
- Action is recorded in the audit log (FR-37)

---

### Job Management (Recruiter Flow)

---

## FR-13: Job Posting Entity
**Description:** The system must define a `JobPosting` entity that captures all relevant information about a job opening, including title, description, and strict eligibility requirements such as minimum height, weight, and educational qualifications that will be used in the hard-filter stage of the recruitment pipeline.

**Actors:** Developer, System

**Preconditions:**
- PostgreSQL and JPA are configured (FR-02)
- Recruiter user entity exists (FR-08)

**Acceptance Criteria:**
- `JobPosting` entity contains: `id`, `title`, `description`, `minHeight`, `minWeight`, `requiredDegree`, `status`, `createdBy`, `createdAt`
- Status field supports values: `DRAFT`, `OPEN`, `CLOSED`, `EXAM_SCHEDULED`
- `createdBy` references the Recruiter's user ID
- Entity is persisted and retrievable via JPA repository
- All required fields are validated with non-null constraints

---

## FR-14: Create Job API with Batch Timing Logic
**Description:** Recruiters must be able to create a new job posting through an API that also captures the three critical dates governing the recruitment batch: the application open date, the application close date, and the scheduled exam date. These dates control the automated lifecycle of the job posting.

**Actors:** Recruiter, System

**Preconditions:**
- RBAC is configured (FR-07)
- JobPosting entity is defined (FR-13)

**Acceptance Criteria:**
- `POST /api/v1/jobs` is accessible only to Recruiters
- Request body includes: title, description, requirements, `openDate`, `closeDate`, `examDate`
- `examDate` must be after `closeDate`, and `closeDate` must be after `openDate`; invalid ordering returns HTTP 400
- A newly created job has status `DRAFT` until `openDate` is reached
- The job's ID is returned in the response for subsequent operations
- Input validation rejects missing required fields

---

## FR-15: Job Status Scheduler
**Description:** The system must run an automated background scheduler that periodically checks all active job postings and automatically transitions their status to `CLOSED` when the application deadline is reached. This removes the need for manual recruiter intervention to close jobs on time.

**Actors:** System

**Preconditions:**
- JobPosting entity with date fields is defined (FR-13, FR-14)

**Acceptance Criteria:**
- A Spring `@Scheduled` task runs at a configurable interval (e.g., every minute)
- Jobs whose `closeDate` has passed and whose status is `OPEN` are updated to `CLOSED`
- Scheduler logs each status transition it performs
- The scheduler does not affect jobs already in `CLOSED` or `EXAM_SCHEDULED` status
- Scheduler execution is idempotent (running twice produces no duplicate changes)

---

## FR-16: Recruiter Interview Availability Slots API
**Description:** Recruiters must be able to define their personal availability for conducting interviews by specifying individual time slots. These slots are later presented to shortlisted candidates for booking, forming the basis of the interview scheduling sub-system.

**Actors:** Recruiter, System

**Preconditions:**
- RBAC is configured (FR-07)
- Recruiter user exists and is authenticated

**Acceptance Criteria:**
- `POST /api/v1/recruiters/availability` accepts: `{ date, startTime, endTime }` per slot
- Recruiter can submit multiple slots in a single request
- Overlapping slots for the same recruiter are rejected with HTTP 409
- Slots are stored and linked to the recruiter's user ID
- `GET /api/v1/recruiters/availability` returns all future availability slots for the authenticated recruiter
- Past slots are not returned in the active availability list

---

## FR-17: Recruiter Dashboard API
**Description:** Recruiters must have access to a dashboard API that provides an aggregate summary of application counts broken down by job posting. This gives recruiters a quick, high-level view of pipeline activity without needing to query individual applications.

**Actors:** Recruiter, System

**Preconditions:**
- RBAC is configured (FR-07)
- Application entity exists (FR-18)

**Acceptance Criteria:**
- `GET /api/v1/recruiters/dashboard` returns a list of job postings owned by the recruiter
- Each entry includes: job title, total applications, applications per status (screening, exam, interview, decided)
- Only the authenticated recruiter's own jobs are returned
- Response is paginated and supports sorting by application count
- Data reflects real-time counts from the database

---

### Application & Sifting Logic

---

## FR-18: Application Entity
**Description:** The system must define an `Application` entity that serves as the central record linking a candidate to a job posting. This entity stores all scoring results from the different pipeline stages (CV relevance, exam score, hard filter result) and tracks the current status of the application through the recruitment lifecycle.

**Actors:** Developer, System

**Preconditions:**
- Candidate and JobPosting entities exist (FR-08, FR-13)

**Acceptance Criteria:**
- `Application` entity contains: `id`, `candidateId`, `jobId`, `cvFilePath`, `cvRelevanceScore`, `examScore`, `hardFilterPassed`, `finalScore`, `status`, `xaiReportUrl`, `submittedAt`
- Status supports: `SUBMITTED`, `AI_SCREENING`, `HARD_FILTER_FAILED`, `EXAM_AUTHORIZED`, `EXAM_COMPLETED`, `SHORTLISTED`, `INTERVIEW_SCHEDULED`, `SELECTED`, `REJECTED`, `WAITLISTED`
- A candidate can only have one application per job (unique constraint on `candidateId` + `jobId`)
- Entity is persisted and retrievable via JPA repository

---

## FR-19: Submit Application API
**Description:** Candidates must be able to submit an application for an open job posting by uploading their CV as a file and creating an application record in the database. The system must handle file storage (to S3 or local disk) and create the corresponding application record atomically.

**Actors:** Candidate, System

**Preconditions:**
- RBAC and authentication are configured (FR-03, FR-07)
- Application entity exists (FR-18)
- The job must be in `OPEN` status

**Acceptance Criteria:**
- `POST /api/v1/applications` accepts a multipart form with `jobId` and CV file (PDF or DOCX)
- File is saved to S3 or local storage; the file path is stored in the application record
- Application is created with status `SUBMITTED`
- Duplicate applications (same candidate, same job) return HTTP 409
- Applications to closed jobs return HTTP 400
- Maximum file size is enforced (e.g., 5MB); oversized files return HTTP 413
- File path is stored but the raw file is never returned in API responses directly

---

## FR-20: Kafka Producer for CV Upload Notification
**Description:** Upon successful CV submission, the Spring Boot service must asynchronously notify the Python AI service by publishing an event to a Kafka topic. This decouples the application submission flow from the AI processing pipeline, ensuring that the candidate receives an immediate response while AI analysis happens in the background.

**Actors:** System, Python AI Service

**Preconditions:**
- Kafka is configured (FR-05)
- Application is successfully created (FR-19)

**Acceptance Criteria:**
- A `CV_UPLOADED` event is published to Kafka immediately after a successful application submission
- The event payload contains: `applicationId`, `candidateId`, `jobId`, `cvFilePath`
- If Kafka publishing fails, the error is logged but the application record is not rolled back
- Messages are published in JSON format
- The event is published within the same request thread or via a reliable async mechanism

---

## FR-21: AI Score Callback Endpoint
**Description:** The system must expose a callback endpoint that the Python AI service can call once it has finished processing a CV. This endpoint receives the computed CV relevance score and the URL of the generated XAI (Explainable AI) report, and updates the corresponding application record accordingly.

**Actors:** Python AI Service, System

**Preconditions:**
- Application entity exists (FR-18)
- Python AI service is running and can reach the Spring Boot service

**Acceptance Criteria:**
- `POST /api/v1/internal/applications/{id}/ai-score` accepts: `{ cvRelevanceScore, xaiReportUrl }`
- The endpoint is secured against public access (e.g., internal network only or API key)
- The application's `cvRelevanceScore` and `xaiReportUrl` are updated atomically
- Application status is transitioned from `SUBMITTED` to `AI_SCREENING`
- If the application ID does not exist, HTTP 404 is returned
- The update is reflected immediately in subsequent application queries

---

## FR-22: Hard Filter Service
**Description:** The system must implement a hard filter service that evaluates a candidate's profile against the strict eligibility criteria defined in the job posting (minimum height, weight, and required degree). This check is SQL-based for performance and runs after the AI screening stage to eliminate ineligible candidates before the exam phase.

**Actors:** System

**Preconditions:**
- Candidate profile with height, weight, and education fields exists
- Application and JobPosting entities exist (FR-18, FR-13)

**Acceptance Criteria:**
- Hard filter runs automatically after the AI score callback is received (FR-21)
- Candidates who fail the height, weight, or degree check have their application status set to `HARD_FILTER_FAILED`
- Candidates who pass remain eligible to proceed to the exam
- The filter logic is implemented as a SQL query (not in-memory logic) for efficiency
- Hard filter results are stored on the application record (`hardFilterPassed: true/false`)
- Candidates are notified of hard filter failure via the notification service

---

### Exam Orchestration

---

## FR-23: Exam and Question Entities
**Description:** The system must define data entities for Exams and their associated Questions to support the exam orchestration pipeline. Questions must support two types: Multiple Choice Questions (MCQ) with a defined answer key, and Short Answer questions that are later graded semantically by the Python AI service.

**Actors:** Developer, System

**Preconditions:**
- PostgreSQL and JPA are configured (FR-02)
- JobPosting entity exists (FR-13)

**Acceptance Criteria:**
- `Exam` entity contains: `id`, `jobId`, `title`, `durationMinutes`, `createdAt`
- `Question` entity contains: `id`, `examId`, `type` (MCQ/SHORT_ANSWER), `text`, `options` (JSON for MCQ), `correctAnswer` (for MCQ), `marks`
- A job can have at most one exam
- Questions are ordered and retrievable by exam ID
- Both entities are persisted via JPA repositories

---

## FR-24: Exam Upload/Definition API for Recruiters
**Description:** Recruiters must be able to define or upload an exam for a specific job posting through an API. This includes setting the exam duration and providing all questions with their types, answer options, and correct answers for MCQ items.

**Actors:** Recruiter, System

**Preconditions:**
- RBAC is configured (FR-07)
- Exam and Question entities exist (FR-23)

**Acceptance Criteria:**
- `POST /api/v1/jobs/{jobId}/exam` is accessible only to Recruiters
- Request body includes exam duration and a list of question objects
- At least one question must be provided; empty exams return HTTP 400
- MCQ questions must include options and a correct answer index
- Short answer questions require only the question text
- Duplicate exam creation for the same job returns HTTP 409
- The created exam ID is returned in the response

---

## FR-25: Batch Authorization Logic
**Description:** The system must implement a batch authorization mechanism that allows a recruiter to unlock exam access for a specific group of candidates who have passed the screening and hard-filter stages. Once authorized, exam links are generated and distributed to the selected candidates.

**Actors:** Recruiter, System

**Preconditions:**
- Exam is defined for the job (FR-24)
- Candidates have passed hard filter (FR-22)
- RBAC is configured (FR-07)

**Acceptance Criteria:**
- `POST /api/v1/jobs/{jobId}/exam/authorize` accepts a list of application IDs to authorize
- Only candidates with status `AI_SCREENING` (passed hard filter) can be authorized
- Authorized candidates have their application status updated to `EXAM_AUTHORIZED`
- An exam access link/token is generated per candidate
- Candidates are notified of their exam authorization with the access link
- Unauthorized candidates in the list are skipped with a warning in the response

---

## FR-26: Go Exam Engine Synchronization
**Description:** The Spring Boot service must interface with the Go Exam Engine to synchronize the list of authorized candidate IDs before the exam window opens. This ensures the Go service knows exactly which candidates are permitted to start the exam session.

**Actors:** System, Go Exam Engine

**Preconditions:**
- Batch authorization is complete (FR-25)
- Go Exam Engine is running and reachable
- Kafka is configured (FR-05)

**Acceptance Criteria:**
- Upon batch authorization, a `EXAM_BATCH_READY` Kafka event is published containing: `jobId`, `examId`, list of authorized `candidateIds`, `examStartTime`, `examDurationMinutes`
- The Go service consumes this event and caches the authorized candidate list
- If the Go service is unavailable, the event remains in Kafka for retry
- The exam start time is enforced by both services

---

## FR-27: Exam Score Ingestion API
**Description:** The system must expose an API endpoint that the Go Exam Engine can call to submit the final graded exam scores for each candidate upon exam completion. These scores are stored on the application record and used in the final weighted scoring algorithm.

**Actors:** Go Exam Engine, System

**Preconditions:**
- Application entity exists (FR-18)
- Go Exam Engine has completed grading

**Acceptance Criteria:**
- `POST /api/v1/internal/applications/{id}/exam-score` accepts: `{ examScore, completedAt }`
- The endpoint is secured against public access
- The application's `examScore` is updated and status transitions to `EXAM_COMPLETED`
- If the application ID does not exist, HTTP 404 is returned
- Scores outside the valid range (0–100) are rejected with HTTP 400
- The ingestion is idempotent; duplicate score submissions for the same application are handled gracefully

---

### Shortlisting & Interview Scheduling

---

## FR-28: Weighted Scoring Algorithm
**Description:** The system must implement a weighted scoring algorithm that combines the three scoring components into a single final relevance score for each candidate: 40% from CV relevance, 40% from the exam score, and 20% from the hard filter result (pass = full marks, fail = disqualified). This final score is used to rank candidates for shortlisting.

**Actors:** System

**Preconditions:**
- CV score (FR-21), exam score (FR-27), and hard filter result (FR-22) are all recorded on the application

**Acceptance Criteria:**
- Final score is calculated as: `(cvRelevanceScore × 0.4) + (examScore × 0.4) + (hardFilterScore × 0.2)`
- Hard filter `FAILED` results in a final score of 0 regardless of other scores
- Final score is stored on the application record as a decimal (0.00–100.00)
- Score is recalculated and updated whenever any component score is updated
- Scores are rounded to two decimal places
- The algorithm is implemented as a reusable service method

---

## FR-29: Shortlist for Interview API
**Description:** Recruiters must be able to mark one or more candidates as shortlisted for an interview based on their final weighted scores. Upon shortlisting, the system must automatically send notifications to the selected candidates informing them of their status and prompting them to book an interview slot.

**Actors:** Recruiter, System

**Preconditions:**
- Final scores are calculated (FR-28)
- Recruiter interview availability slots exist (FR-16)
- RBAC is configured (FR-07)

**Acceptance Criteria:**
- `POST /api/v1/jobs/{jobId}/shortlist` accepts a list of application IDs
- Only candidates with status `EXAM_COMPLETED` can be shortlisted
- Shortlisted candidates have their application status updated to `SHORTLISTED`
- A notification (mock email/SMS) is sent to each shortlisted candidate with instructions to book a slot
- Non-shortlisted exam-completed candidates remain in `EXAM_COMPLETED` status
- Response confirms the count of successfully shortlisted candidates

---

## FR-30: Interview Slot Booking API
**Description:** Shortlisted candidates must be able to view the recruiter's available interview slots and book one of their choosing. The booking system must ensure that each slot is assigned to exactly one candidate and that no candidate can book more than one slot per job.

**Actors:** Candidate, System

**Preconditions:**
- Candidate is shortlisted (FR-29)
- Recruiter availability slots exist (FR-16)
- RBAC is configured (FR-07)

**Acceptance Criteria:**
- `GET /api/v1/jobs/{jobId}/slots` returns available (unbooked) interview slots
- `POST /api/v1/jobs/{jobId}/slots/{slotId}/book` books the selected slot for the authenticated candidate
- A candidate can only book one slot per job; a second booking attempt returns HTTP 409
- A slot that is already booked is not returned in the available slots list
- Application status is updated to `INTERVIEW_SCHEDULED` upon successful booking
- Booking confirmation is sent to the candidate via notification

---

## FR-31: Double-Booking Prevention
**Description:** The system must enforce at the database level that no interview slot can be assigned to more than one candidate. This must be handled as a concurrency-safe constraint to prevent race conditions in scenarios where multiple candidates attempt to book the same slot simultaneously.

**Actors:** System

**Preconditions:**
- Slot booking API exists (FR-30)
- Slot entity is persisted in PostgreSQL

**Acceptance Criteria:**
- A unique constraint or optimistic locking is applied to the slot's `bookedBy` field
- Concurrent booking attempts for the same slot result in only one success; the other(s) receive HTTP 409
- The system does not produce duplicate bookings under load
- Failed concurrent bookings return a user-friendly error message
- The constraint is enforced at the database level, not only in application code

---

## FR-32: Automated Interview Reminder Notifications
**Description:** The system must automatically send reminder notifications to candidates and recruiters before a scheduled interview. These reminders are triggered by a background scheduler that checks for upcoming interview bookings within a configurable time window.

**Actors:** System, Candidate, Recruiter

**Preconditions:**
- Interview slots are booked (FR-30)
- A notification service (mock email/SMS) is available

**Acceptance Criteria:**
- A scheduler checks for interviews occurring within the next 24 hours at a configurable interval
- Reminder notifications are sent to both the candidate and the recruiter
- Reminders include: candidate name, job title, interview date/time, recruiter name
- Reminders are not sent more than once per interview per trigger window
- Notification delivery is logged for audit purposes

---

### Feedback & Finalization

---

## FR-33: Final Decision API
**Description:** Recruiters must be able to record their final hiring decision for each interviewed candidate through a dedicated API. The system must support three decision outcomes — Selected, Rejected, or Waitlisted — and must notify the candidate of the outcome automatically upon decision submission.

**Actors:** Recruiter, System

**Preconditions:**
- Candidate application status is `INTERVIEW_SCHEDULED` or later
- RBAC is configured (FR-07)

**Acceptance Criteria:**
- `PATCH /api/v1/applications/{id}/decision` accepts: `{ decision: SELECTED | REJECTED | WAITLISTED, notes }`
- Application status is updated to the corresponding final status
- Candidate is notified of the decision via mock email/SMS immediately
- The decision is recorded with a timestamp and the recruiter's user ID
- Only the recruiter who owns the job can record the decision
- Decision cannot be changed once set (immutable final state)

---

## FR-34: Feedback Report Aggregator
**Description:** Upon finalization of a recruitment decision, the system must aggregate all available data about the candidate's performance into a unified feedback report. This includes the AI-generated insights, exam statistics, hard filter results, and any notes recorded by the recruiter during the interview.

**Actors:** System, Recruiter

**Preconditions:**
- Final decision is recorded (FR-33)
- AI score and XAI report URL are available (FR-21)
- Exam score is recorded (FR-27)

**Acceptance Criteria:**
- `GET /api/v1/applications/{id}/feedback-report` returns a structured report object
- Report includes: CV relevance score, XAI justification URL, exam score, hard filter result, final weighted score, recruiter notes, and decision outcome
- Report is accessible to the recruiter and the candidate (with role-based field filtering)
- Report generation does not trigger external service calls; it aggregates already-stored data
- Report is available immediately after the final decision is recorded

---

## FR-35: Secure XAI PDF Download API
**Description:** Candidates must be able to securely download their personalized XAI (Explainable AI) feedback PDF report after the recruitment process concludes. Access must be restricted to the candidate who owns the report, and download links must not expose raw file system paths.

**Actors:** Candidate, System

**Preconditions:**
- XAI report has been generated by the Python AI service and its URL is stored (FR-21)
- Candidate is authenticated (FR-03)

**Acceptance Criteria:**
- `GET /api/v1/applications/{id}/xai-report/download` returns the PDF file as a downloadable stream
- Only the candidate associated with the application can download their own report
- Attempting to download another candidate's report returns HTTP 403
- The raw file system path is never exposed in any API response
- If the report has not been generated yet, HTTP 404 is returned
- Download is logged with timestamp and candidate ID for audit purposes

---

## FR-36: Archive Job and Application Data
**Description:** After a recruitment cycle is fully closed, the system must provide a mechanism to archive the associated job posting and all its applications. Archived data must be retained for audit and compliance purposes but must not appear in active operational queries.

**Actors:** Admin, Super Admin, System

**Preconditions:**
- All applications for the job have reached a final status (FR-33)
- RBAC is configured (FR-07)

**Acceptance Criteria:**
- `POST /api/v1/admin/jobs/{jobId}/archive` transitions the job to `ARCHIVED` status
- Archived jobs do not appear in public job listings or recruiter dashboards
- Archived applications are excluded from active pipeline queries
- Archived data remains queryable through a dedicated admin audit endpoint
- Archiving is only possible when all applications have a final decision recorded
- Archive action is logged in the audit trail (FR-37)

---

### Admin & System Health

---

## FR-37: Audit Log Service
**Description:** The system must maintain a comprehensive audit log that records every status change for every candidate application, as well as key administrative actions. This log is critical for compliance, debugging, and providing a traceable history of all decisions made throughout the recruitment process.

**Actors:** System, Admin, Super Admin

**Preconditions:**
- Application and User entities exist (FR-08, FR-18)
- PostgreSQL is configured (FR-02)

**Acceptance Criteria:**
- Every application status transition is automatically recorded with: `entityType`, `entityId`, `oldStatus`, `newStatus`, `changedBy`, `changedAt`, `reason`
- Administrative actions (user activation, recruiter creation) are also logged
- Audit log records are immutable — no update or delete operations are permitted
- `GET /api/v1/admin/audit-logs` returns paginated, filterable audit entries
- Filtering supports: date range, entity type, entity ID, and actor user ID

---

## FR-38: System Monitor API for Admins
**Description:** Admins must have access to a system health monitoring API that provides real-time operational metrics including Kafka consumer lag, Redis cache hit rates, and database connection pool status. This enables proactive identification of performance issues before they impact the user experience.

**Actors:** Admin, Super Admin, System

**Preconditions:**
- Kafka, Redis, and PostgreSQL integrations are configured (FR-02, FR-05, FR-06)
- RBAC is configured (FR-07)

**Acceptance Criteria:**
- `GET /api/v1/admin/system-health` returns: Kafka consumer lag per topic, Redis hit/miss ratio, DB pool active/idle connection counts, application uptime
- Endpoint is accessible only to Admin and Super Admin roles
- Response time for this endpoint is under 500ms
- Unhealthy metrics are flagged with a status indicator (e.g., `WARNING`, `CRITICAL`)
- The endpoint does not cache its response (always reflects real-time state)

---

## FR-39: AI Model Metadata Update API
**Description:** The system must allow Super Admins to update and version the metadata associated with the AI model currently active in the Python AI service. This enables controlled model upgrades without redeployment and provides a record of which model version was used for any given recruitment batch.

**Actors:** Super Admin, System

**Preconditions:**
- RBAC is configured (FR-07)
- Python AI service is running

**Acceptance Criteria:**
- `PUT /api/v1/admin/ai-model` accepts: `{ modelVersion, description, activatedAt }`
- Only Super Admin can call this endpoint; other roles receive HTTP 403
- The active model version is stored in the database with a history of previous versions
- `GET /api/v1/admin/ai-model` returns the currently active model metadata and version history
- Model version change is recorded in the audit log (FR-37)

---

## FR-40: Export Recruitment Analytics API
**Description:** The system must provide an analytics export API that generates aggregate recruitment metrics for completed job cycles. These metrics include time-to-hire, score distributions, and demographic diversity indicators, and must be exportable in a structured format suitable for reporting.

**Actors:** Admin, Super Admin, Recruiter

**Preconditions:**
- Applications with final decisions exist (FR-33)
- RBAC is configured (FR-07)

**Acceptance Criteria:**
- `GET /api/v1/analytics/export?jobId={id}` returns analytics data for the specified job
- Metrics include: average time-to-hire (days from application to decision), pass rates per stage, score distribution histogram, total applications by final status
- Bias indicators flag score distribution anomalies across candidate cohorts (where demographic data is available)
- Response supports JSON format; CSV export is an optional query parameter
- Data is aggregated at query time from existing application records
- Endpoint is accessible to Admin, Super Admin, and the owning Recruiter

---

---

## Epic 2: High-Concurrency Exam Engine (Go)

### Core Engine & Concurrency Setup

---

## FR-41: Go Module Initialization with Hexagonal Architecture
**Description:** The Go exam engine must be initialized as a clean Go module following hexagonal architecture principles, separating the entry point (`cmd/`), core business logic (`internal/`), and shared utilities (`pkg/`). This structure ensures the exam engine remains testable, maintainable, and decoupled from infrastructure concerns.

**Actors:** Developer, System

**Preconditions:**
- Go is installed on the development machine
- Git repository is initialized

**Acceptance Criteria:**
- Go module is initialized with a meaningful module path (e.g., `github.com/org/exam-engine`)
- Directory structure contains: `cmd/server/`, `internal/domain/`, `internal/handlers/`, `internal/services/`, `pkg/`
- Application compiles and runs without errors from `cmd/server/`
- Dependencies are managed via `go.mod` and `go.sum`
- A `README.md` describes how to build and run the service

---

## FR-42: HTTP/2 Server Setup with Gin or Echo
**Description:** The exam engine must use a high-performance HTTP framework (Gin or Echo) to handle concurrent exam requests with minimal latency. The server must be configured for HTTP/2 to support multiplexed connections, which is critical during the batch exam window when thousands of candidates connect simultaneously.

**Actors:** Developer, System

**Preconditions:**
- Go module is initialized (FR-41)

**Acceptance Criteria:**
- Server starts and listens on a configurable port (default 8090)
- Gin or Echo framework is used for routing
- At least one test route (`GET /ping`) responds with HTTP 200
- Server is gracefully shut down on SIGTERM with in-flight requests completed
- Request/response logging middleware is configured

---

## FR-43: Goroutine Worker Pool for Non-Blocking Grading
**Description:** The exam engine must implement a goroutine-based worker pool to handle exam answer grading concurrently without blocking the main HTTP handler goroutines. This ensures that grading operations, particularly those involving calls to the Python AI service for short answers, do not degrade response times for other candidates.

**Actors:** System

**Preconditions:**
- Go module and server are initialized (FR-41, FR-42)

**Acceptance Criteria:**
- A worker pool with a configurable number of goroutines is initialized on startup
- Grading tasks are submitted to the pool via a buffered channel
- The main HTTP handler returns immediately after submitting a grading task
- Worker pool size is configurable via environment variable
- Pool gracefully drains pending tasks on shutdown before terminating

---

## FR-44: Redis Client with Connection Pooling for Exam State
**Description:** The exam engine must configure a Redis client with connection pooling specifically for persisting real-time exam session state. Redis is the authoritative store for all active exam sessions, ensuring that session data survives Go service restarts and is accessible across multiple service instances.

**Actors:** System

**Preconditions:**
- Redis is running and accessible
- Go module is initialized (FR-41)

**Acceptance Criteria:**
- Redis client is initialized on startup with configurable host, port, and pool size
- Connection pool parameters (min idle, max connections) are configurable via environment variables
- Client can SET, GET, and DEL keys with TTL support
- A startup health check confirms Redis connectivity; the service refuses to start if Redis is unreachable
- Connection errors are logged with sufficient context for debugging

---

## FR-45: Rate Limiting Middleware
**Description:** The exam engine must implement custom rate-limiting middleware to protect the service from being overwhelmed by excessive requests during the batch exam window. The rate limiter must operate per-candidate to prevent individual clients from flooding the service while not affecting other candidates.

**Actors:** System, Candidate

**Preconditions:**
- HTTP server is configured (FR-42)
- Redis is configured for state storage (FR-44)

**Acceptance Criteria:**
- Rate limiting is applied per candidate token/IP at a configurable request-per-second threshold
- Requests exceeding the rate limit return HTTP 429 with a `Retry-After` header
- Rate limit counters are stored in Redis for consistency across service instances
- The rate limit is configurable per environment (stricter in production)
- Rate limiting does not affect the `/health` endpoint

---

### Synchronous Batch Logic

---

## FR-46: Batch Trigger Service
**Description:** The exam engine must implement a batch trigger service that controls exam access based on the current time relative to the scheduled exam window for each job. A candidate's token is only valid during the designated exam window, and any attempt to start the exam outside this window must be rejected.

**Actors:** System, Candidate

**Preconditions:**
- Authorized candidate list and exam schedule are received from Spring Boot (FR-26)
- Redis is configured (FR-44)

**Acceptance Criteria:**
- The service checks whether the exam window for a given `jobId` is `UNLOCKED` before allowing a candidate to start
- Requests before the exam start time return HTTP 403 with a "Exam not yet open" message
- Requests after the exam end time return HTTP 403 with a "Exam window closed" message
- The exam schedule is cached in Redis upon receipt of the `EXAM_BATCH_READY` event
- Only candidates in the authorized list for the job can start the exam

---

## FR-47: Countdown Orchestrator
**Description:** The exam engine must implement a countdown orchestrator that enforces the exam duration for every active candidate session. When the global exam timer reaches zero, the orchestrator must automatically finalize and submit all active exam sessions, regardless of whether the candidate has manually submitted.

**Actors:** System, Candidate

**Preconditions:**
- Exam sessions are stored in Redis (FR-49)
- Batch trigger service is operational (FR-46)

**Acceptance Criteria:**
- Each exam session has a `timeRemaining` field in Redis that counts down in real-time
- No candidate can start the exam before the official start time
- When the exam window expires, all sessions with status `ACTIVE` are automatically submitted
- Auto-submitted sessions are processed through the same grading pipeline as manual submissions
- Candidates who attempt to submit after the window closes receive HTTP 403

---

## FR-48: Heartbeat Mechanism
**Description:** The exam engine must support a lightweight heartbeat mechanism where the candidate's browser periodically pings the service to signal that the session is still active and the network connection is stable. This heartbeat is used to track connectivity and distinguish between deliberate exits and network drops.

**Actors:** System, Candidate

**Preconditions:**
- Exam sessions exist in Redis (FR-49)
- HTTP server is configured (FR-42)

**Acceptance Criteria:**
- `POST /exam/heartbeat` accepts a candidate token and updates the session's `lastSeenAt` timestamp in Redis
- Sessions that miss more than a configurable number of consecutive heartbeats are flagged as `DISCONNECTED`
- `DISCONNECTED` sessions are not automatically submitted; they remain resumable (FR-53)
- The heartbeat endpoint is rate-limited to prevent abuse
- Heartbeat interval is configurable (default: every 10 seconds)

---

### Question Delivery & State Management

---

## FR-49: ExamSession Struct in Redis
**Description:** The exam engine must define and manage an `ExamSession` data structure persisted in Redis that captures the complete real-time state of a candidate's exam attempt. This structure is the single source of truth for a candidate's progress and must be updated atomically to prevent data corruption under concurrent writes.

**Actors:** System

**Preconditions:**
- Redis is configured (FR-44)

**Acceptance Criteria:**
- `ExamSession` struct contains: `CandidateID`, `JobID`, `ExamID`, `StartedAt`, `CurrentQuestionIndex`, `AnswersMap` (question ID → selected answer), `TimeRemaining`, `Status` (ACTIVE/SUBMITTED/DISCONNECTED)
- Sessions are stored in Redis with a key pattern: `exam:session:{candidateId}:{jobId}`
- Session TTL is set to exam duration + 10 minutes buffer
- Concurrent writes to the same session are serialized using Redis transactions or Lua scripts
- Session data is JSON-serialized for storage

---

## FR-50: Question Shuffling Algorithm
**Description:** The exam engine must implement a shuffling algorithm that randomizes the order of questions for each candidate while ensuring all candidates receive the same question set. This prevents answer sharing between candidates sitting the exam simultaneously.

**Actors:** System

**Preconditions:**
- Questions are cached in the Go service memory (FR-56)
- Exam session is initialized (FR-49)

**Acceptance Criteria:**
- Each candidate receives a unique, deterministically shuffled question order derived from their candidate ID as a seed
- All candidates receive the same set of questions (none added or removed)
- The shuffled order is stored in the candidate's session upon exam start
- The same candidate always gets the same shuffle order if they resume (FR-53)
- Shuffling does not modify the master question list in memory

---

## FR-51: Start Exam API
**Description:** The exam engine must expose an endpoint that a candidate uses to begin their exam session. Upon validation, the service initializes a new exam session in Redis, applies the question shuffle, and returns the first question to the candidate.

**Actors:** Candidate, System

**Preconditions:**
- Candidate is authorized (FR-25)
- Exam window is open (FR-46)
- Redis session structure is defined (FR-49)

**Acceptance Criteria:**
- `GET /exam/start` validates the candidate's token and confirms they are in the authorized list
- A new `ExamSession` is created in Redis and the countdown begins
- The first question (per the shuffled order) is returned in the response
- Starting an already-active session returns the current state instead of creating a duplicate
- Response includes: question text, options (for MCQ), question number, total question count, time remaining

---

## FR-52: Submit Answer API
**Description:** The exam engine must provide an endpoint that candidates use to submit their answer for each question in real time. Answers must be persisted to the Redis session immediately to prevent data loss from browser crashes or network interruptions.

**Actors:** Candidate, System

**Preconditions:**
- An active exam session exists in Redis (FR-51)

**Acceptance Criteria:**
- `POST /exam/submit-answer` accepts: `{ questionId, selectedAnswer }`
- The answer is written to the `AnswersMap` in the Redis session immediately
- Previous answers for the same question are overwritten (candidates can change their mind)
- Submissions after the exam window closes return HTTP 403
- The response returns the next question or signals exam completion if the last question was answered
- Response latency for this endpoint must be under 100ms under normal load

---

## FR-53: Resume Exam API
**Description:** The exam engine must allow candidates to recover their exam session if their browser crashes or their connection drops during the exam. The resume endpoint retrieves the candidate's existing session from Redis and returns their current progress so they can continue from where they left off.

**Actors:** Candidate, System

**Preconditions:**
- An exam session exists in Redis for the candidate (FR-49)

**Acceptance Criteria:**
- `GET /exam/resume` validates the candidate's token and retrieves their existing session from Redis
- Response includes: all previously answered questions, current question index, remaining time
- If no session exists (e.g., candidate never started), HTTP 404 is returned
- If the exam window has closed, the session cannot be resumed and HTTP 403 is returned
- Time remaining accurately reflects the elapsed time since session creation

---

### Real-Time Grading

---

## FR-54: Automated MCQ Grader
**Description:** The exam engine must implement an automated grader for Multiple Choice Questions that compares each candidate's selected answers against the correct answer key fetched from the Spring Boot service. Grading must occur immediately upon exam submission to enable rapid score delivery.

**Actors:** System

**Preconditions:**
- Correct answer key is cached in the Go service (FR-56)
- Exam session with submitted answers exists (FR-49)

**Acceptance Criteria:**
- MCQ grader runs synchronously after an exam session is finalized
- Each MCQ answer is compared against the correct answer key
- Score is calculated as: sum of marks for each correctly answered MCQ question
- Incorrect and unanswered MCQ questions score zero
- Grading result (score per question and total) is stored in the session before being forwarded
- Grading runs within 1 second for exams with up to 100 MCQ questions

---

## FR-55: Concurrency-Safe Scorer
**Description:** The exam engine must implement a concurrency-safe scoring mechanism to ensure that final scores are calculated accurately even when multiple answer packets arrive concurrently for the same candidate, which can occur under poor network conditions. Race conditions must be prevented at the code level.

**Actors:** System

**Preconditions:**
- Goroutine worker pool is configured (FR-43)
- MCQ grader is implemented (FR-54)

**Acceptance Criteria:**
- Score calculation uses `sync.Mutex` or atomic operations to serialize concurrent writes per candidate session
- Running the scorer concurrently 1000 times for the same session produces a consistent, correct result
- No data races are detected by the Go race detector (`go test -race`)
- Locking granularity is per-session (not a global lock) to avoid contention between different candidates

---

### AI Service Integration

---

## FR-56: gRPC or REST Client for Short-Answer AI Grading
**Description:** The exam engine must implement a client to communicate with the Python AI service for semantic grading of short-answer exam responses. The client must send the candidate's answer text along with the question context and receive a numeric score in return.

**Actors:** System, Python AI Service

**Preconditions:**
- Python AI service short-answer grading endpoint is available (FR-61)
- Worker pool is configured (FR-43)

**Acceptance Criteria:**
- Short-answer grading requests are dispatched asynchronously via the worker pool
- Request payload includes: `questionId`, `candidateAnswer`, `jobId`
- A numeric score (0–100) is received and stored in the exam session
- The client supports both gRPC and REST, configurable via environment variable
- Timeout for AI grading requests is configurable (default: 10 seconds)

---

## FR-57: Retry Logic for AI Grading
**Description:** The exam engine must implement a retry mechanism for AI grading requests to handle transient failures or periods when the Python AI service is under heavy load. Failed grading tasks must be queued and retried without blocking the candidate's session finalization.

**Actors:** System

**Preconditions:**
- AI grading client is implemented (FR-56)

**Acceptance Criteria:**
- Failed AI grading requests are retried up to a configurable number of times (default: 3) with exponential backoff
- If all retries are exhausted, the short-answer question is scored as 0 and the failure is logged
- Retry attempts do not block the candidate's session from being marked as `SUBMITTED`
- Retry state is tracked in Redis to survive service restarts
- Each retry attempt is logged with the attempt number and failure reason

---

### Integration with Spring Boot

---

## FR-58: Kafka Consumer for Exam Batch Ready Event
**Description:** The exam engine must consume the `EXAM_BATCH_READY` Kafka event published by Spring Boot to receive the exam configuration and authorized candidate list before the exam window opens. Upon receipt, the engine must cache the question data in memory for fast retrieval during the exam.

**Actors:** System, Spring Boot

**Preconditions:**
- Kafka is configured
- Spring Boot publishes `EXAM_BATCH_READY` events (FR-26)

**Acceptance Criteria:**
- The Go service subscribes to the `EXAM_BATCH_READY` Kafka topic on startup
- Upon receiving the event, exam questions are fetched from Spring Boot and cached in the Go service's memory
- The authorized candidate ID list is stored in Redis
- The exam schedule (start time, duration) is cached for the batch trigger service (FR-46)
- If the event payload is malformed, the error is logged and the event is sent to a dead-letter topic

---

## FR-59: Kafka Producer for Exam Completed Event
**Description:** Once an exam session is finalized and graded, the Go exam engine must publish an `EXAM_COMPLETED` event back to Kafka for consumption by the Spring Boot orchestrator. This event carries the final exam score and triggers the downstream scoring and shortlisting pipeline.

**Actors:** System, Spring Boot

**Preconditions:**
- Exam grading is complete (FR-54, FR-56)
- Kafka is configured

**Acceptance Criteria:**
- An `EXAM_COMPLETED` event is published to Kafka upon finalization of a graded exam session
- Event payload contains: `candidateId`, `jobId`, `examId`, `totalScore`, `completedAt`
- If Kafka publishing fails, the event is retried with exponential backoff
- Spring Boot consumes this event and updates the application record (FR-27)
- Published events are logged for traceability

---

## FR-60: Health Check Endpoint
**Description:** The exam engine must expose a health check endpoint that reports the current operational status of the service, including Redis connectivity and the number of active candidate sessions. This endpoint is consumed by the Spring Boot admin monitoring API and by infrastructure health checks.

**Actors:** System, Admin

**Preconditions:**
- Redis is configured (FR-44)
- HTTP server is running (FR-42)

**Acceptance Criteria:**
- `GET /health` returns HTTP 200 with: `{ status: "UP", redisConnected: true/false, activeCandidates: N, uptime: "..." }`
- If Redis is disconnected, `redisConnected` is `false` and overall status is `DEGRADED`
- Response time is under 100ms
- The endpoint does not require authentication
- Active candidate count reflects the current number of sessions with `ACTIVE` status in Redis

---

---

## Epic 3: AI Ranking & Explainability Service (Python)

### Architecture & NLP Pipeline Setup

---

## FR-61: FastAPI Project Initialization
**Description:** The Python AI service must be initialized as a FastAPI application using a `src/` layout that cleanly separates routing, business logic, and ML model management. This structure enables independent testing of each layer and clear separation between the API contract and the underlying AI implementation.

**Actors:** Developer, System

**Preconditions:**
- Python 3.10+ and pip/poetry are available
- FastAPI and Uvicorn are installed

**Acceptance Criteria:**
- Project structure contains: `src/routers/`, `src/services/`, `src/models/`, `src/utils/`
- Application starts with `uvicorn src.main:app` without errors
- A root health endpoint (`GET /`) returns HTTP 200
- Dependencies are managed via `pyproject.toml` or `requirements.txt`
- Environment variables are loaded via `python-dotenv`

---

## FR-62: SBERT Integration for Vector Embeddings
**Description:** The AI service must integrate the Sentence-Transformers (SBERT) library to generate semantic vector embeddings for CV text and job descriptions. These embeddings form the basis of the cosine similarity scoring that determines CV relevance.

**Actors:** System

**Preconditions:**
- FastAPI project is initialized (FR-61)
- `sentence-transformers` library is installed
- Sufficient CPU/GPU resources are available for model inference

**Acceptance Criteria:**
- A pre-trained SBERT model (e.g., `all-MiniLM-L6-v2`) is loaded on service startup
- The embedding service generates 384 or 768-dimensional vectors from input text
- Embedding generation completes within 2 seconds for a typical CV-length document on CPU
- The model is loaded once at startup, not per request
- Model loading errors prevent service startup and are clearly logged

---

## FR-63: Kafka Consumer for CV and Exam Events
**Description:** The AI service must consume Kafka events from the `CV_UPLOADED` and `EXAM_SUBMITTED` topics to trigger asynchronous CV scoring and short-answer grading respectively. Kafka-based consumption decouples the AI workload from the real-time API flows of the other services.

**Actors:** System, Spring Boot, Go Exam Engine

**Preconditions:**
- FastAPI project is initialized (FR-61)
- Kafka is running and the relevant topics exist

**Acceptance Criteria:**
- The service subscribes to `CV_UPLOADED` and `EXAM_SUBMITTED` topics on startup
- `CV_UPLOADED` events trigger the CV parsing and scoring pipeline
- `EXAM_SUBMITTED` events trigger the short-answer semantic grading pipeline
- Consumer offset commits only occur after successful processing
- Malformed event payloads are logged and sent to a dead-letter queue without crashing the consumer

---

## FR-64: Text Extraction Utility
**Description:** The AI service must be able to extract clean, normalized text from raw CV files in PDF and DOCX formats. The extracted text is the input to the NLP preprocessing pipeline and must accurately capture all relevant content from the document.

**Actors:** System

**Preconditions:**
- `PyMuPDF` and `python-docx` libraries are installed
- CV file is accessible at the path provided in the Kafka event

**Acceptance Criteria:**
- PDF files are processed using PyMuPDF (`fitz`)
- DOCX files are processed using `python-docx`
- Extracted text is stripped of excessive whitespace and non-printable characters
- Text extraction handles multi-page documents correctly
- Files that cannot be read return a logged error; the application record is updated with a failure status via the callback endpoint (FR-21)

---

## FR-65: NLP Preprocessing Pipeline
**Description:** The AI service must apply a standard NLP preprocessing pipeline to CV text before generating embeddings. This pipeline improves the quality of semantic matching by normalizing the text and ensuring that domain-specific terminology (e.g., "Boeing 737", "FastAPI") is correctly handled as single entities.

**Actors:** System

**Preconditions:**
- Text extraction utility is implemented (FR-64)
- Required NLP libraries (`spaCy` or `NLTK`) are installed

**Acceptance Criteria:**
- Pipeline applies: lowercasing, stop-word removal, and lemmatization
- Domain-specific compound terms are recognized as single tokens (configurable entity list)
- Preprocessing runs in under 1 second for a typical CV
- Preprocessed text is used as input to the embedding service (FR-62)
- Raw and preprocessed text versions are kept separately; only preprocessed text is embedded

---

### Semantic Matching & Vector Logic

---

## FR-66: Cosine Similarity Engine
**Description:** The AI service must implement a cosine similarity engine that compares the vector embedding of a candidate's CV against the vector embedding of the job description to produce a relevance score between 0 and 100.

**Actors:** System

**Preconditions:**
- SBERT integration is implemented (FR-62)
- Both the job description and CV text are available

**Acceptance Criteria:**
- Cosine similarity is computed between the job description vector and the CV vector
- Raw cosine similarity (range -1 to 1) is scaled to a 0–100 score
- Score is computed in under 500ms per candidate
- The same inputs always produce the same score (deterministic)
- Score is a float rounded to two decimal places

---

## FR-67: Weighted Ranking Algorithm (Python Side)
**Description:** The Python AI service must implement the client-side component of the weighted ranking algorithm that merges the CV relevance score with exam results and hard filter status into a single final relevance percentage for each candidate in a batch.

**Actors:** System

**Preconditions:**
- Cosine similarity scores are available (FR-66)
- Exam scores and hard filter results are passed in the batch ranking request

**Acceptance Criteria:**
- `POST /rank/batch` accepts a list of candidates with: `candidateId`, `cvScore`, `examScore`, `hardFilterPassed`
- Final score is calculated using the 40/40/20 formula (FR-28)
- Response returns candidates sorted by final score in descending order
- Hard filter failures result in a final score of 0 and are moved to the end of the list
- Batch processing handles up to 1000 candidates in a single request within 30 seconds

---

## FR-68: Vector Cache Service
**Description:** The AI service must cache generated embeddings in Redis or ChromaDB to avoid recomputing vectors for identical or previously processed CV files. Caching reduces inference time for re-screenings and batch re-rankings without degrading accuracy.

**Actors:** System

**Preconditions:**
- SBERT integration is implemented (FR-62)
- Redis or ChromaDB is accessible

**Acceptance Criteria:**
- Generated embeddings are stored with a cache key derived from a hash of the input text
- Cache lookup is attempted before running the embedding model
- Cache hits return the stored vector within 50ms
- Cache misses trigger model inference and store the result for future use
- PII-containing text is never used directly as a cache key (hashed only)

---

### Short-Answer Grading

---

## FR-69: Answer Key Embedding
**Description:** The AI service must generate and store vector embeddings for the ideal answer to each short-answer exam question. These stored embeddings serve as the reference point for semantic comparison against candidate responses.

**Actors:** System, Recruiter

**Preconditions:**
- SBERT integration is implemented (FR-62)
- Exam questions with model answers are available

**Acceptance Criteria:**
- Ideal answer embeddings are generated when an exam is created and cached
- Embeddings are regenerated if the answer key is updated
- Embeddings are retrievable by question ID within 100ms (from cache)
- The embedding generation process is triggered automatically upon receipt of exam data

---

## FR-70: Student Answer Scorer
**Description:** The AI service must score a candidate's short-answer response by comparing its semantic vector against the stored ideal answer embedding. Responses that exceed a configurable semantic similarity threshold are awarded full or partial marks.

**Actors:** System

**Preconditions:**
- Ideal answer embeddings are stored (FR-69)
- Candidate answer is received from the Go Exam Engine (FR-56)

**Acceptance Criteria:**
- Candidate answer is embedded and compared against the ideal answer embedding using cosine similarity
- Similarity score above 0.85 awards full marks; between 0.65–0.85 awards partial marks; below 0.65 awards zero
- Thresholds are configurable via environment variable
- Score is returned as a float between 0 and the question's maximum marks
- Grading completes within 2 seconds per answer

---

## FR-71: Keyword Presence Checker
**Description:** As a secondary scoring signal, the AI service must verify that candidate short-answer responses contain critical technical keywords defined in the answer key. A response that is semantically similar but missing key terminology may be penalized, ensuring technical precision is rewarded.

**Actors:** System

**Preconditions:**
- Short-answer scoring is implemented (FR-70)
- An expected keyword list is defined per question

**Acceptance Criteria:**
- Each short-answer question has an optional list of required keywords
- The presence of each keyword in the candidate's answer is checked (case-insensitive)
- Missing keywords result in a configurable score penalty (e.g., -5% per missing keyword, floored at 0)
- Keyword check runs after semantic scoring and adjusts the final score
- Results include a breakdown of which keywords were present and which were missing

---

### Explainable AI (XAI) Generation

---

## FR-72: Feature Attribution with SHAP or LIME
**Description:** The AI service must apply SHAP or LIME feature attribution to identify which specific words and phrases in a candidate's CV contributed most to their relevance score. This attribution data is the foundation of the explainability report provided to candidates and recruiters.

**Actors:** System

**Preconditions:**
- CV relevance score is computed (FR-66)
- SHAP or LIME library is installed

**Acceptance Criteria:**
- Feature attribution runs after the CV scoring pipeline for each candidate
- Attribution output identifies the top 10 most impactful words/phrases from the CV
- Both positive contributors (boosted the score) and negative contributors (lowered the score) are identified
- Attribution completes within 10 seconds per CV
- Attribution data is stored for use in the PDF report (FR-74)

---

## FR-73: Natural Language Justification Engine
**Description:** The AI service must convert the raw numerical scores and feature attribution data into human-readable natural language justifications that explain the AI's ranking decision in plain terms. These justifications are included in the candidate's feedback report.

**Actors:** System

**Preconditions:**
- Feature attribution data is available (FR-72)
- Scoring results are finalized

**Acceptance Criteria:**
- Justification is generated as 3–5 sentences summarizing why the candidate scored as they did
- Justifications reference specific CV content (e.g., "5 years of Python experience", "Cloud Architecture skills")
- Template-based generation is used to ensure consistency and avoid hallucinations
- Justification text is stored alongside the score for inclusion in the PDF (FR-74)
- Output is grammatically correct and professionally worded

---

## FR-74: Feedback PDF Generator
**Description:** The AI service must generate a professional PDF report for each candidate that compiles their scores, SHAP/LIME attribution charts, natural language justifications, and recruiter notes into a single downloadable document. This report is the primary artifact delivered to candidates at the end of the recruitment process.

**Actors:** System, Candidate, Recruiter

**Preconditions:**
- XAI attribution (FR-72) and justification (FR-73) are available
- Exam scores are finalized
- A PDF generation library (e.g., `reportlab` or `weasyprint`) is installed

**Acceptance Criteria:**
- PDF report includes: candidate name, job title, CV score, exam score, final score, XAI attribution chart, natural language justification, recruiter notes
- Report is saved to the designated storage location and its URL is returned to Spring Boot via the callback endpoint (FR-21)
- PDF is generated within 30 seconds of the final decision being recorded
- Generated PDF is readable and correctly formatted on standard PDF viewers
- Report does not contain any raw PII beyond the candidate's name and role applied for

---

### Security & Accuracy Controls

---

## FR-75: PII Masking
**Description:** The AI service must ensure that Personally Identifiable Information (PII) such as phone numbers, home addresses, and identity numbers are detected and masked in CV text before it is stored in any vector database or used as a cache key. This ensures compliance with data privacy standards.

**Actors:** System

**Preconditions:**
- Text extraction utility is implemented (FR-64)
- Vector cache service is implemented (FR-68)

**Acceptance Criteria:**
- PII detection runs on extracted CV text before it is embedded or cached
- Detected PII types: phone numbers, email addresses, physical addresses, national ID numbers
- Detected PII is replaced with a placeholder (e.g., `[PHONE_REDACTED]`) before storage
- Original unmasked text is used only for display in the feedback report, not for ML processing
- PII masking is logged (type detected, not the actual value)

---

## FR-76: Bias Detection Tool
**Description:** The AI service must provide a bias detection script that analyzes the distribution of CV relevance scores across different candidate cohorts (e.g., based on university names or geographic indicators) to flag potential systematic bias in the AI model's scoring behavior.

**Actors:** System, Admin, Super Admin

**Preconditions:**
- CV scores for a completed recruitment batch are available
- Candidate profile data with cohort indicators is accessible

**Acceptance Criteria:**
- Script computes average scores per cohort (e.g., grouped by university name)
- Cohorts with average scores more than 1.5 standard deviations from the overall mean are flagged
- Results are output as a structured JSON report
- The script can be run on demand for any completed job batch
- Bias flags are stored and accessible via the admin analytics API (FR-40)

---

## FR-77: AI Service Health Endpoint
**Description:** The Python AI service must expose a health check endpoint that reports its operational status including model load status and current CPU/GPU memory usage. This endpoint supports the Spring Boot admin monitoring dashboard and infrastructure health checks.

**Actors:** System, Admin

**Preconditions:**
- FastAPI service is running (FR-61)
- SBERT model is loaded (FR-62)

**Acceptance Criteria:**
- `GET /ai/health` returns: `{ status: "UP", modelLoaded: true, cpuUsagePercent, ramUsageMb, gpuMemoryMb (if available) }`
- If the model is not loaded, status is `DEGRADED`
- Response time is under 200ms
- The endpoint does not require authentication
- Memory metrics are collected using `psutil` or equivalent

---

---

## Epic 4: Frontend Experience (React + TypeScript)

### Core Architecture & UI Foundation

---

## FR-78: Vite + React + TypeScript Project Initialization
**Description:** The frontend must be initialized as a Vite-powered React application using TypeScript for type safety. This setup provides fast development builds, strong typing across the codebase, and a modern development experience consistent with industry best practices.

**Actors:** Developer, System

**Preconditions:**
- Node.js 18+ and npm/yarn are installed

**Acceptance Criteria:**
- Project is scaffolded using `npm create vite@latest` with the React + TypeScript template
- Application compiles and runs on `localhost:5173` without errors
- TypeScript strict mode is enabled in `tsconfig.json`
- ESLint and Prettier are configured with consistent rules
- A placeholder home page renders without console errors

---

## FR-79: Tailwind CSS and Shadcn/UI Setup
**Description:** The frontend must integrate Tailwind CSS for utility-based styling and Shadcn/UI as the component library. The design system must reflect a professional aviation aesthetic — clean, authoritative, and functional — consistent across all user portals.

**Actors:** Developer, System

**Preconditions:**
- Vite + React + TypeScript project is initialized (FR-78)

**Acceptance Criteria:**
- Tailwind CSS is installed and configured via `tailwind.config.js`
- Shadcn/UI components are installable via CLI and render correctly
- A custom theme (colors, fonts) reflecting an aviation aesthetic is defined in the Tailwind config
- At least one Shadcn/UI component (e.g., Button, Card) renders correctly in the app
- No raw inline CSS styles are used; all styling uses Tailwind utility classes

---

## FR-80: Zustand Store for Auth and Global State
**Description:** The frontend must use Zustand for global state management, storing the authenticated user's JWT token, role, and profile information. The store must handle login, logout, and token refresh scenarios, persisting the auth state across page refreshes where appropriate.

**Actors:** Candidate, Recruiter, Admin, Super Admin, System

**Preconditions:**
- Vite + React + TypeScript project is initialized (FR-78)
- Zustand is installed

**Acceptance Criteria:**
- A Zustand `authStore` stores: `token`, `user` (id, name, role), `isAuthenticated`
- Login action sets the token and user; logout action clears all auth state
- Auth state is persisted to `localStorage` via Zustand persist middleware
- All components accessing auth state use the `useAuthStore` hook
- TypeScript interfaces are defined for all store state and actions

---

## FR-81: Axios Interceptors for Auth and Error Handling
**Description:** The frontend must configure Axios interceptors that automatically attach the Bearer token to every outgoing API request and handle HTTP 401 responses by redirecting the user to the login page. This centralizes authentication token management and prevents unauthorized API calls.

**Actors:** System

**Preconditions:**
- Zustand auth store is implemented (FR-80)

**Acceptance Criteria:**
- A request interceptor automatically adds `Authorization: Bearer {token}` to all API requests
- A response interceptor catches HTTP 401 responses and redirects to the login page
- The base API URL is configurable via an environment variable (`VITE_API_BASE_URL`)
- All API calls in the application use the configured Axios instance, not the default
- Network errors (e.g., timeout, no response) are caught and surfaced to the user with a toast notification

---

## FR-82: Responsive Layout System with Role-Based Sidebars
**Description:** The frontend must implement a responsive layout system with distinct sidebar navigation menus for each user role. Candidates, Recruiters, Admins, and Super Admins must each see a sidebar tailored to their available features, with the layout adapting gracefully to mobile and tablet screen sizes.

**Actors:** Candidate, Recruiter, Admin, Super Admin

**Preconditions:**
- Auth store is implemented (FR-80)
- Tailwind CSS and Shadcn/UI are configured (FR-79)

**Acceptance Criteria:**
- The layout renders a sidebar with navigation links appropriate to the logged-in user's role
- Candidates see: Dashboard, Jobs, My Applications, My Exam, Interview Slot, Results
- Recruiters see: Dashboard, Post Job, Applications, Exam Management, Interview Calendar, Decisions
- Admins see: User Management, System Health, Audit Logs, Analytics
- Sidebar collapses to a hamburger menu on mobile screens (< 768px)
- Unauthenticated users are redirected to the login page on any protected route

---

### Candidate Portal

---

## FR-83: Authentication Pages with OTP Verification
**Description:** The candidate portal must include multi-step registration and login pages. The registration flow must collect the candidate's basic details, submit them to the API, and then present an OTP verification step before the account is activated.

**Actors:** Candidate, System

**Preconditions:**
- Candidate Registration API is implemented (FR-10)
- OTP service is implemented (FR-09)

**Acceptance Criteria:**
- Registration form collects: name, email, password, phone number
- Form validation (via `react-hook-form` + `zod`) prevents submission of invalid data
- Upon successful registration, an OTP input screen is displayed
- OTP input accepts a 6-digit code and submits it to the verification endpoint
- Successful OTP verification redirects the candidate to their dashboard
- Error messages are shown inline for API errors (e.g., email already taken)

---

## FR-84: Candidate Profile Builder
**Description:** After registration, candidates must complete their profile by providing additional information required for the hard-filter stage: height, weight, and educational qualifications. This profile is validated on the frontend before submission to prevent incomplete applications.

**Actors:** Candidate, System

**Preconditions:**
- Candidate is registered and authenticated (FR-83)

**Acceptance Criteria:**
- Profile form includes fields for: height (cm), weight (kg), highest degree, field of study, graduation year
- All fields are validated using `react-hook-form` + `zod` with appropriate constraints (e.g., height between 100–250 cm)
- Form prevents submission until all required fields are valid
- Successful profile submission redirects the candidate to the job board
- Profile can be edited and resubmitted prior to any application being submitted

---

## FR-85: Job Board with Apply Functionality and CV Upload
**Description:** Candidates must be able to browse all open job postings on a searchable job board and apply to a position by uploading their CV. The job board must clearly display each posting's requirements and closing date to help candidates make informed decisions.

**Actors:** Candidate, System

**Preconditions:**
- Candidate profile is complete (FR-84)
- Job postings API is available (FR-14)

**Acceptance Criteria:**
- Job board displays all `OPEN` job postings with: title, description summary, closing date, key requirements
- Search/filter functionality allows filtering by job title or required degree
- "Apply" button opens a modal with a drag-and-drop CV upload interface
- Accepted file types: PDF, DOCX; maximum size: 5MB; invalid files show an error
- Successful application submission shows a confirmation message and updates the job card to "Applied"
- Previously applied jobs display an "Applied" badge instead of the Apply button

---

## FR-86: Application Tracking Timeline
**Description:** Candidates must be able to view a visual timeline showing the current status of each of their applications across all stages of the recruitment pipeline. The timeline must clearly communicate what has happened and what the next step is.

**Actors:** Candidate, System

**Preconditions:**
- Candidate has submitted at least one application (FR-85)

**Acceptance Criteria:**
- Timeline displays stages: Applied → AI Screening → Exam Scheduled → Interview → Decision
- The current stage is visually highlighted; completed stages are marked as done
- Pending or failed stages (e.g., hard filter failed) are clearly indicated with an explanation
- Timeline updates in near real-time (polling or WebSocket) as the application status changes
- Clicking a completed stage reveals more details (e.g., AI score, exam score)

---

## FR-87: Exam Interface
**Description:** The exam interface must provide candidates with a secure, distraction-free environment for completing their timed exam. The interface must persist answers automatically on every change and display a persistent countdown timer, ensuring that no progress is lost due to accidental navigation or network issues.

**Actors:** Candidate, System

**Preconditions:**
- Candidate is authorized for the exam (FR-25)
- Exam window is open (FR-46)
- Go Exam Engine APIs are available (FR-51, FR-52)

**Acceptance Criteria:**
- Exam page hides the main navigation sidebar to eliminate distractions
- A persistent countdown timer is visible at all times and counts down in real time
- Each answer selection triggers an auto-save API call to `POST /exam/submit-answer`
- Candidate can navigate between questions using Previous/Next buttons
- A question progress indicator shows answered vs unanswered questions
- When the timer reaches zero, the exam is automatically submitted with a visual confirmation
- A warning modal is shown if the candidate attempts to navigate away during the exam

---

## FR-88: Interview Slot Picker
**Description:** Shortlisted candidates must be able to select and book an available interview slot from a calendar interface displaying the recruiter's available times. The interface must provide a clear, intuitive booking experience and confirm the booking immediately.

**Actors:** Candidate, System

**Preconditions:**
- Candidate is shortlisted (FR-29)
- Recruiter availability slots are defined (FR-16)

**Acceptance Criteria:**
- Calendar view displays all available interview slots for the relevant recruiter
- Booked slots are not displayed or are shown as unavailable
- Candidate selects a slot and confirms via a booking confirmation dialog
- Successful booking displays the confirmed interview date/time prominently
- A confirmation notification is sent to the candidate's email upon booking
- Once booked, the slot picker is replaced with the confirmed booking details

---

### Recruiter Dashboard

---

## FR-89: Job Creator Form
**Description:** Recruiters must be able to create new job postings through a structured form that captures all required fields including the three critical batch dates. The form must validate inputs before submission and provide a clear confirmation upon successful posting.

**Actors:** Recruiter, System

**Preconditions:**
- Recruiter is authenticated with the Recruiter role (FR-07, FR-80)

**Acceptance Criteria:**
- Form includes fields for: title, description, min height, min weight, required degree, open date, close date, exam date
- `zod` validation enforces date ordering (open < close < exam) before submission
- Successful form submission creates the job and redirects the recruiter to their job list
- API errors (e.g., duplicate job title) are surfaced as inline form errors
- A rich text editor is used for the job description field

---

## FR-90: Candidate Ranking Table
**Description:** Recruiters must have access to a sortable, paginated table that displays all candidates who have reached the scoring stage for a given job, along with their scores and current status. This table is the primary tool for comparing and selecting candidates for shortlisting.

**Actors:** Recruiter, System

**Preconditions:**
- Applications with scores exist for the recruiter's jobs
- RBAC is enforced (FR-07)

**Acceptance Criteria:**
- Table displays per candidate: name, CV score, exam score, final score, hard filter status, current status
- Columns are sortable (ascending/descending) by clicking the column header
- Table is paginated with configurable page size (10, 25, 50 per page)
- A search bar filters candidates by name
- Selecting a candidate row opens the XAI side-drawer (FR-91)
- Batch selection checkboxes enable bulk actions (FR-92)

---

## FR-91: XAI Side-Drawer
**Description:** When a recruiter clicks on a candidate in the ranking table, a side-drawer panel must slide in displaying the AI-generated explainability report for that candidate. This gives the recruiter transparent insight into why the AI ranked the candidate as it did.

**Actors:** Recruiter, System

**Preconditions:**
- XAI data is available for the candidate (FR-72, FR-73)
- Candidate ranking table is implemented (FR-90)

**Acceptance Criteria:**
- Side-drawer slides in from the right without navigating away from the ranking table
- Drawer displays: candidate name, final score, CV score breakdown, top contributing CV keywords (SHAP/LIME chart), natural language justification, exam score, hard filter result
- SHAP/LIME attribution is visualized as a horizontal bar chart
- Drawer can be closed without losing the current table position/scroll
- Drawer loads candidate XAI data within 1 second of opening

---

## FR-92: Batch Action Toolbar
**Description:** The recruiter's candidate table must include a batch action toolbar that activates when one or more candidates are selected via checkboxes. The toolbar must allow recruiters to perform bulk operations such as authorizing candidates for the exam or sending rejection notifications.

**Actors:** Recruiter, System

**Preconditions:**
- Candidate ranking table is implemented (FR-90)
- Batch authorization API exists (FR-25)

**Acceptance Criteria:**
- Toolbar appears above the table when at least one candidate is selected
- Available batch actions: "Authorize for Exam", "Send Rejection"
- A confirmation dialog is shown before any batch action is executed
- After execution, the table reflects the updated statuses of the affected candidates
- A summary toast notification confirms how many candidates were affected
- Batch actions respect eligibility rules (e.g., only `AI_SCREENING` candidates can be authorized for exam)

---

## FR-93: Recruiter Availability Calendar
**Description:** Recruiters must be able to define their interview availability by interacting with a calendar interface where they can "paint" or click time blocks to mark themselves as available. This availability data is then exposed to shortlisted candidates for slot booking.

**Actors:** Recruiter, System

**Preconditions:**
- Recruiter is authenticated (FR-07, FR-80)
- Recruiter availability API exists (FR-16)

**Acceptance Criteria:**
- Calendar displays a weekly view with time slots in 30-minute or 1-hour increments
- Recruiter can click individual time slots to toggle them as available/unavailable
- Saved availability is persisted via the API and reflected on reload
- Already-booked slots (by candidates) are shown as locked and cannot be toggled
- A "Save Availability" button submits all changes in a single API call
- The calendar highlights the current day and prevents setting availability for past dates

---

### Admin & Super Admin Panel

---

## FR-94: User Management Table
**Description:** Admins must have a dedicated user management interface to create new recruiter accounts and toggle the active/inactive status of any user in the system. The interface must provide a clear overview of all users and their current status.

**Actors:** Admin, Super Admin, System

**Preconditions:**
- Admin is authenticated with the Admin or Super Admin role
- User management APIs exist (FR-11, FR-12)

**Acceptance Criteria:**
- Table displays all users with: name, email, role, active status, created date
- "Create Recruiter" button opens a modal form to create a new recruiter account
- Each row has an "Active/Inactive" toggle that calls the status update API
- Confirmation dialog is shown before deactivating any account
- Table is searchable by name or email and filterable by role
- Super Admin accounts cannot be deactivated from the UI

---

## FR-95: System Metrics Dashboard
**Description:** Admins must have access to a real-time system metrics dashboard that visualizes application volume, exam pass rates, and other key operational indicators using charts. This dashboard enables proactive monitoring of system health and recruitment pipeline activity.

**Actors:** Admin, Super Admin, System

**Preconditions:**
- System monitor API is implemented (FR-38)
- Analytics export API is implemented (FR-40)

**Acceptance Criteria:**
- Dashboard displays: total applications today, exam pass rate (%), active exam sessions, Kafka lag, Redis hit rate, DB pool utilization
- Data is presented using Recharts or Chart.js bar/line charts
- Metrics refresh automatically every 30 seconds
- Critical metrics (e.g., Kafka lag > threshold) are highlighted in red
- Dashboard layout is responsive and readable on tablet-sized screens

---

## FR-96: Audit Log Viewer
**Description:** Admins must be able to browse the system's audit log through a searchable, filterable table that shows all status changes and administrative actions recorded by the system. The audit log provides a complete traceable history of the recruitment process.

**Actors:** Admin, Super Admin, System

**Preconditions:**
- Audit log service is implemented (FR-37)

**Acceptance Criteria:**
- Table displays audit entries with: timestamp, actor name, entity type, entity ID, action taken, old status, new status
- Filters available: date range picker, entity type dropdown, actor search
- Table is paginated and sorted by timestamp (newest first by default)
- Clicking a row expands full details of the audit event
- Audit log is read-only — no edit or delete actions are available in the UI

---

## FR-97: AI Model Versioning Toggle
**Description:** Super Admins must have access to an interface that displays the currently active AI model version and allows them to update the model metadata. This interface provides visibility into the AI pipeline's configuration and enables controlled model upgrades.

**Actors:** Super Admin, System

**Preconditions:**
- AI model metadata API exists (FR-39)
- User is authenticated as Super Admin

**Acceptance Criteria:**
- Interface displays: current model version, description, date activated, version history
- "Update Model" button opens a form to submit a new model version string and description
- Confirmation dialog is shown before updating the active model version
- Only Super Admin role can see and interact with this interface
- Version history is displayed in a table showing all previous model versions

---

### Feedback & Reporting

---

## FR-98: Candidate Result Portal
**Description:** After a final decision is made, candidates must be able to view their detailed recruitment outcome through a dedicated results page. The page must display their scores, the AI-generated feedback, and the final decision in a clear and professional format.

**Actors:** Candidate, System

**Preconditions:**
- Final decision is recorded (FR-33)
- Feedback report is available (FR-34)

**Acceptance Criteria:**
- Results page is accessible to the candidate once their application reaches a final status
- Page displays: job title, final decision (Selected/Rejected/Waitlisted), CV score, exam score, final weighted score, natural language AI justification
- Selected candidates see a congratulatory message; rejected/waitlisted candidates see an encouraging message
- A "Download Full Report" button triggers the XAI PDF download (FR-99)
- Scores are presented with visual progress bars for easy comprehension

---

## FR-99: In-Browser PDF Viewer for Feedback Report
**Description:** Candidates must be able to preview their AI-generated feedback PDF report directly in the browser without downloading it first. This integrated viewing experience allows candidates to quickly review their report before deciding whether to save it locally.

**Actors:** Candidate, System

**Preconditions:**
- XAI PDF report has been generated (FR-74)
- Secure download API exists (FR-35)

**Acceptance Criteria:**
- A "Preview Report" button on the results page opens the PDF in an embedded viewer within the browser
- The embedded viewer uses a library such as `react-pdf` or an iframe with the secure API URL
- The viewer displays the full PDF without requiring the user to download it first
- A separate "Download" button allows the candidate to save the PDF locally
- The viewer is responsive and readable on desktop and tablet screen sizes
- If the report is not yet available, a loading state is shown with an estimated wait time