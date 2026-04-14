Epic: Core Recruitment Orchestration (Spring Boot) 1. Infrastructure &
Security Foundation \* Issue #1: Set up Spring Boot project structure
with Java 21+ and Gradle/Maven. \* Issue #2: Configure PostgreSQL
connection pool and Hibernate/JPA settings. \* Issue #3: Implement
Spring Security with JWT (Stateless authentication). \* Issue #4: Create
Global Exception Handler and standard API Response wrapper. \* Issue #5:
Configure Spring Cloud Stream with Kafka (Producer for CV uploads and
Exam triggers). \* Issue #6: Set up Redis integration for session
management and OTP caching. 2. User & Identity Management \* Issue #7:
Implement RBAC (Role-Based Access Control) for Candidate, Recruiter,
Admin, and Super Admin. \* Issue #8: Create User entity and repository
(Common fields for all roles). \* Issue #9: Implement OTP Service
(Generate, Send via Mock Email/SMS, and Verify). \* Issue #10: Candidate
Registration API (Profile basics). \* Issue #11: Recruiter Account
Creation API (Restricted to Admin/Super Admin only). \* Issue #12: User
Activation/Deactivation logic for Admins. 3. Job Management (Recruiter
Flow) \* Issue #13: Create JobPosting entity (includes title,
description, and strict requirements). \* Issue #14: Implement \"Create
Job\" API with Batch Timing Logic (Open, Close, and Exam dates). \*
Issue #15: Create Job Status scheduler (Automatically flip status to
\"Closed\" at the deadline). \* Issue #16: API for Recruiters to set
their individual Interview availability slots. \* Issue #17: Dashboard
API for Recruiters to see aggregate application counts per Job ID. 4.
Application & Sifting Logic \* Issue #18: Create Application entity
(links Candidate, Job, and Scores). \* Issue #19: \"Submit Application\"
API (File upload handling to S3/Local and DB record creation). \* Issue
#20: Implement Kafka Producer to notify Python AI service of a new CV
upload. \* Issue #21: Create callback endpoint for Python AI to update
cv_relevance_score and xai_report_url. \* Issue #22: Implement Hard
Filter Service (SQL-based height/weight/degree check). 5. Exam
Orchestration \* Issue #23: Create Exam and Question entities (MCQ and
Short Answer types). \* Issue #24: API for Recruiters to upload/define
the exam for a specific Job ID. \* Issue #25: Implement \"Batch
Authorization\" logic (Unlock exam links for a specific group of
candidates). \* Issue #26: Interface with the Go Exam Engine to sync
authorized Candidate IDs. \* Issue #27: API to ingest final Exam Scores
from the Go service. 6. Shortlisting & Interview Scheduling \* Issue
#28: Implement Weighted Scoring Algorithm (40% CV + 40% Exam + 20% Hard
Filters). \* Issue #29: \"Shortlist for Interview\" API (Triggers
notification to candidates). \* Issue #30: Slot Booking API (Candidate
chooses from Recruiter's available slots). \* Issue #31: Prevent
double-booking logic for Interview slots. \* Issue #32: Automated
Email/Notification service for Interview reminders. 7. Feedback &
Finalization \* Issue #33: \"Final Decision\" API for Recruiters
(Selected / Rejected / Waitlisted). \* Issue #34: Implement Feedback
Report Aggregator (Gathers AI insights + Exam stats + Recruiter notes).
\* Issue #35: Create Secure Download API for candidates to retrieve
their XAI PDF. \* Issue #36: Archive Job/Application data after
recruitment closure. 8. Admin & System Health \* Issue #37: Implement
Audit Log service (Track every status change for every candidate). \*
Issue #38: Create \"System Monitor\" API for Admins (View Kafka lag,
Redis hits, and DB health). \* Issue #39: API to update/version AI model
metadata used in the ranking process. \* Issue #40: Export Recruitment
Analytics API (Time-to-hire, diversity metrics, score distribution).
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Epic: High-Concurrency Exam Engine (Go) 1. Core Engine & Concurrency
Setup \* Issue #1: Initialize Go module with a clean hexagonal
architecture (Cmd, Internal, Pkg). \* Issue #2: Set up an HTTP/2 Server
using Gin or Echo for high-performance request handling. \* Issue #3:
Implement a Goroutine Worker Pool to handle non-blocking grading for
multiple candidates. \* Issue #4: Configure a Redis Client with
connection pooling specifically for real-time exam state persistence. \*
Issue #5: Implement a Custom Middleware for rate limiting to prevent
DDoS during the batch exam window. 2. Synchronous Batch Logic (The
\"Exam Clock\") \* Issue #6: Implement the Batch Trigger Service: A
global check against the Job_ID to see if the exam window is
\"Unlocked.\" \* Issue #7: Create the Countdown Orchestrator: Logic that
ensures no candidate can start before the official start time and
automatically submits all active exams when the timer hits zero. \*
Issue #8: Implement Heartbeat Mechanism: Small periodic pings from the
candidate\'s browser to the Go service to track \"Active\" status and
network stability. 3. Question Delivery & State Management \* Issue #9:
Create the ExamSession struct in Redis to store: StartedAt,
CurrentQuestionIndex, AnswersMap, TimeRemaining. \* Issue #10: Implement
the \"Shuffling\" Algorithm: Randomize question order for each candidate
(to prevent cheating) while keeping the same question set. \* Issue #11:
API: GET /exam/start -- Validates candidate token, creates Redis
session, and returns the first question. \* Issue #12: API: POST
/exam/submit-answer -- Updates the Redis session with the selected
answer instantly. \* Issue #13: API: GET /exam/resume -- Allows a
candidate to recover their session from Redis if their browser crashes.
4. Real-Time Grading (MCQs) \* Issue #14: Implement the Automated MCQ
Grader: Compares selected answers against the key fetched from Spring
Boot. \* Issue #15: Build a Concurrency-Safe Scorer: Ensures that even
if multiple packets arrive for one candidate, the score is calculated
accurately using sync.Mutex or Atomic operations. 5. AI Service
Integration (Short Answers) \* Issue #16: Implement a gRPC or REST
Client to send short-answer text to the Python AI service for semantic
grading. \* Issue #17: Create a Retry Logic for AI grading: If the
Python service is busy, the Go service should queue the grading task and
retry until a score is returned. 6. Integration with Core Orchestrator
(Spring Boot) \* Issue #18: Kafka Consumer: Listen for the
EXAM_BATCH_READY event from Spring Boot to cache exam questions in Go\'s
memory. \* Issue #19: Kafka Producer: Once an exam is finished and
graded, send the EXAM_COMPLETED event back to Spring Boot with the final
score. \* Issue #20: Implement a Health Check Endpoint (/health) that
reports Redis connectivity and current active candidate count to the
Admin dashboard. \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Epic: AI Ranking & Explainability Service (Python) 1. Architecture & NLP
Pipeline Setup \* Issue #1: Initialize FastAPI project using the src/
layout (separating routers, services, and ML models). \* Issue #2: Set
up Sentence-Transformers (SBERT) integration for generating 384 or
768-dimensional vector embeddings. \* Issue #3: Configure Kafka Consumer
to listen for CV_UPLOADED and EXAM_SUBMITTED events. \* Issue #4:
Implement a Text Extraction Utility (using PyMuPDF or python-docx) to
convert raw CV files into clean, normalized strings. \* Issue #5: Build
a Preprocessing Pipeline: Lemmatization, stop-word removal, and
domain-specific tokenization (e.g., recognizing \"FastAPI\" or \"Boeing
737\" as single entities). 2. Semantic Matching & Vector Logic \* Issue
#6: Implement the Cosine Similarity Engine: Compare Job Description
vectors against parsed CV vectors. \* Issue #7: Create the Weighted
Ranking Algorithm: Logic to merge CV score, Exam results, and
Hard-filter status into one final \"Relevance %\". \* Issue #8: Build a
Vector Cache Service: Store generated embeddings in Redis or a local
ChromaDB to avoid re-computing vectors for the same files. \* Issue #9:
API: POST /rank/batch -- Receives a list of candidate IDs and returns a
sorted ranking based on the current Job Description. 3. Short-Answer
Grading (Semantic Similarity) \* Issue #10: Implement Answer Key
Embedding: Convert the \"ideal\" exam answers into vectors. \* Issue
#11: Create the Student Answer Scorer: Compare candidate short-answers
against the ideal answer using a semantic threshold (e.g., if similarity
\> 0.85, award full marks). \* Issue #12: Implement Keyword Presence
Checker: A secondary check to ensure technical terms (e.g., \"Dependency
Injection\") are present even if the sentence structure is unique. 4.
Explainable AI (XAI) Generation \* Issue #13: Implement Feature
Attribution (using SHAP or LIME) to identify which specific words in a
CV contributed most to a high score. \* Issue #14: Build the Natural
Language Justification Engine: Convert scores into sentences (e.g.,
\"This candidate was ranked highly due to 5 years of Python experience
and a strong match in \'Cloud Architecture\' skills\"). \* Issue #15:
Create the Feedback PDF Generator: A service to compile scores, XAI
charts, and justifications into a professional document for the
candidate and recruiter. 5. Security & Accuracy Controls \* Issue #16:
Implement PII Masking: Ensure that sensitive data (Phone numbers,
addresses) are not stored in the Vector Database to comply with privacy
standards. \* Issue #17: Build a Bias Detection Tool: A script to check
if the AI is unfairly penalizing certain demographics (e.g., checking
score distributions across different university names). \* Issue #18:
API: GET /ai/health -- Monitors model load and GPU/CPU memory usage
(important for observability dashboards).
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Epic: Frontend Experience (React + TypeScript) 1. Core Architecture & UI
Foundation \* Issue #1: Initialize Vite + React + TypeScript project. \*
Issue #2: Set up Tailwind CSS and a component library (e.g., Shadcn/UI)
for a professional aviation aesthetic. \* Issue #3: Implement Zustand
Store for Auth (JWT storage) and Global User State. \* Issue #4:
Configure Axios Interceptors to automatically attach Bearer tokens and
handle 401 (Unauthorized) redirects. \* Issue #5: Create a Responsive
Layout System: Different Sidebars for Candidates vs. Recruiters. 2.
Candidate Portal (The Journey) \* Issue #6: Auth Pages: Multi-step
Registration with OTP Verification input fields. \* Issue #7: Profile
Builder: Form with validation (using react-hook-form + zod) for height,
weight, and education. \* Issue #8: Job Board: Searchable list of the 8
job postings with \"Apply\" functionality and file upload (Drag & Drop
CV). \* Issue #9: Application Tracking: A visual timeline (Steppers)
showing the status: Applied → AI Screening → Exam Scheduled → Interview.
\* Issue #10: The Exam Interface: A secure, \"Distraction-Free\" mode
with a persistent countdown timer and auto-save on answer change. \*
Issue #11: Slot Picker: Integrated calendar for candidates to book their
interview from the recruiter\'s available slots. 3. Recruiter Dashboard
(The Command Center) \* Issue #12: Job Creator: Form to post new jobs
and define the Critical Dates (Open, Close, Exam). \* Issue #13: The
Ranking Table: A sortable, paginated data table showing candidate scores
and status. \* Issue #14: XAI Side-Drawer: A slide-out panel that
displays the AI justification charts and skill-gap analysis when
clicking a candidate. \* Issue #15: Batch Action Toolbar: Ability to
select multiple candidates and click \"Authorize for Exam\" or \"Send
Rejections.\" \* Issue #16: Availability Calendar: Interface for
recruiters to \"paint\" their free time for interviews. 4. Admin & Super
Admin Panel \* Issue #17: User Management: Table to create recruiter
accounts and toggle \"Active/Inactive\" status for all users. \* Issue
#18: System Metrics Dashboard: Real-time charts (using Recharts or
Chart.js) showing application volume and exam pass rates. \* Issue #19:
Audit Log Viewer: Searchable table of all system events (who changed
which status and when). \* Issue #20: Model Versioning Toggle: Interface
to see which AI model version is currently active in the Python backend.
5. Feedback & Reporting \* Issue #21: Result Portal: A dedicated page
for rejected/selected candidates to view their detailed feedback report.
\* Issue #22: PDF Viewer Integration: A way to preview the AI-generated
feedback report within the browser.
