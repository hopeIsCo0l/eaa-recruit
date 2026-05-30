

EAA Recruit
## 2025



College of Technology and Built Environment
School of Information Technology and
## Engineering
Department of IT/SE Eng.

EAA Recruit

## Software Requirements Specification


## Team Members
- Abdellah Teshome ATE/0406/13
- Abdurezak Zeynu ATE/7317/13
- Biniam Dagne ATE/1540/13
- Rehoboth Melaku ATE/1745/13
- Yared Yirgalem ATE/9061/13




## Advisors: Mr. Daniel Abebe
## .

## Date Dec 16 2025

EAA Recruit
## 2025


## Revision History

## Date Description Author Comments
<date> <Version 1> <Your Name> <First Revision>





## Document Approval

The following Software Requirements Specification has been accepted and approved by the
following:
## Signature Printed Name Title Date











EAA Recruit
## 2025


Table of Contents

DOCUMENT APPROVAL .......................................................................................................................................II
LIST OF TABLES ...................................................................................................................................................... V
LIST OF FIGURES .................................................................................................................................................. VI
DEFINITIONS, ACRONYMS, AND ABBREVIATIONS .................................................................................. VII
DECLARATION ................................................................................................................................................. VIII
- INTRODUCTION ................................................................................................................................................... 1
1.1 PURPOSE .............................................................................................................................................................. 1
1.3 OVERVIEW ........................................................................................................................................................... 2
1.4 RELATED WORKS AND CONTRIBUTION ................................................................................................................ 3
- GENERAL DESCRIPTION ................................................................................................................................... 5
2.1 PRODUCT PERSPECTIVE ....................................................................................................................................... 5
2.3 USER CHARACTERISTICS ..................................................................................................................................... 5
2.4 GENERAL CONSTRAINTS ...................................................................................................................................... 6
2.5 COMPUTATIONAL REQUIREMENTS ....................................................................................................................... 6
- SPECIFIC REQUIREMENTS ............................................................................................................................... 7
3.1 EXTERNAL INTERFACE REQUIREMENTS ............................................................................................................... 7
3.1.1 User Interfaces ............................................................................................................................................ 7
3.1.3 Software Interfaces.................................................................................................................................... 15
3.1.4 Communications Interfaces ....................................................................................................................... 15
3.1.2 Hardware Interfaces ................................................................................................................................. 15
3.1.3 Software Interfaces.................................................................................................................................... 15
3.1.4 Communications Interfaces ....................................................................................................................... 15
3.2 FUNCTIONAL REQUIREMENTS ............................................................................................................................ 16
FR-01: Upload Job Description ......................................................................................................................... 16
FR-02: Upload Candidate Resumes ................................................................................................................... 17
FR-03: Automatic Skill Extraction ..................................................................................................................... 18
FR-04: Rank Candidates .................................................................................................................................... 19
FR-05: View Similarity Score ............................................................................................................................ 20
FR-06: Export Shortlist ...................................................................................................................................... 21
1.3 USE CASES ................................................................................................................................................ 23
3.3.1 Use Case #1: Candidate Registration and Login ...................................................................................... 24
3.3.2 Use Case #2: Submit Job Application with CV ......................................................................................... 26
3.3.3 Use Case #3: Intelligent CV Parsing and Scoring (System-Triggered) .................................................... 28
3.3.4 Use Case #4: Take Automated Written Examination ................................................................................ 29
3.3.6 Use Case #6: Generate Explainable Candidate Report ............................................................................ 31
3.3.7 Use Case #7: Post and Manage Job Positions .......................................................................................... 33
3.3.8 Use Case #8: View Application Status and Feedback ............................................................................... 34
3.3.9 Use Case #9: Search and Filter Candidates ............................................................................................. 35
3.3.10 Use Case #10: Administer System Users and Settings ............................................................................ 36
NFR-01: Performance ........................................................................................................................................ 37
NFR-02: Scalability ........................................................................................................................................... 38
NFR-03: Security ............................................................................................................................................... 40
NFR-08: Usability .............................................................................................................................................. 41
NFR-09: Availability .......................................................................................................................................... 43
3.5 LIMITATIONS ..................................................................................................................................................... 45
3.6 ASSUMPTIONS .................................................................................................................................................... 45

EAA Recruit
## 2025


3.7 RISK MITIGATION .............................................................................................................................................. 46
3.8 SCOPE BOUNDARIES (EXPLICITLY OUT OF SCOPE) ............................................................................................ 46
3.6 DESIGN CONSTRAINTS ....................................................................................................................................... 47
4.3 CHANGE EVALUATION ....................................................................................................................................... 50
4.4 APPROVAL PROCESS .......................................................................................................................................... 50
4.5 IMPLEMENTATION AND DOCUMENTATION ......................................................................................................... 50
4.6 CHANGE REJECTION .......................................................................................................................................... 51
4.7 TOOLS AND RESPONSIBILITIES ........................................................................................................................... 51
APPENDICES ............................................................................................................................................................ 52
REFERENCES .......................................................................................................................................................... 53



EAA Recruit
## 2025


List of Tables
Table 1 Use Case #1: Candidate Registration and Login 3.3.2 Use Case #2: Submit Job
Application with CV ..................................................................................................................... 26
Table 2 Use Case #2: Submit Job Application with CV ............................................................... 27
Table 3 Use Case #3: Intelligent CV Parsing and Scoring (System-Triggered) ........................... 29
Table 4 Use Case #4: Take Automated Written Examination ...................................................... 31
Table 5 Use Case #6: Generate Explainable Candidate Report .................................................... 32
Table 6 Use Case #7: Post and Manage Job Positions.................................................................. 34
Table 7 Use Case #8: View Application Status and Feedback. .................................................... 35
Table 8 Use Case #9: Search and Filter Candidates ..................................................................... 36
Table 9 Use Case #10: Administer Systm Users and Settings...................................................... 37



EAA Recruit
## 2025


List of figures
Fig 1 UI-01 Splash/Landing page ................................................................................................... 7
Fig 2 UI-02 Registration Page ........................................................................................................ 8
Fig 3 UI-03 LogIn Page .................................................................................................................. 8
Fig 4 UI-04 Job browsing and search. ............................................................................................ 9
Fig 5 UI-05 Application form with CV upload. ............................................................................. 9
Fig 63.6 UI-06 Exam Interface ..................................................................................................... 10
Fig 7 UI-08 Dashboard for status tracking and feedback ............................................................. 11
Fig 8 UI-9 Job posting and management ...................................................................................... 11
Fig 9 UI-10 Candidate pipeline ..................................................................................................... 12
Fig 10 UI-11 Detailed candidate reports ....................................................................................... 12
Fig 11 UI-12 Notification Center .................................................................................................. 13
Fig 12 Admin Panel ...................................................................................................................... 13
Fig 13 UI-14 System settings and monitoring. ............................................................................. 14
Fig 14 Use Cases ........................................................................................................................... 23












EAA Recruit
## 2025


Definitions, Acronyms, and Abbreviations

Term/Acronym Definition
## AI
Artificial Intelligence – technologies enabling the system to perform tasks
such as parsing, scoring, and evaluation.
## CV
Curriculum Vitae – the document submitted by candidates detailing education,
experience, skills, and qualifications.
## EAA
Ethiopian Aviation Academy – one of the primary stakeholders and intended
users of the platform.
## ETL
Extract, Transform, Load – process used in data pipelines (relevant for future
enhancements).
FYP Final Year Projet
## LLM
Large Language Model – open-source AI model (Llama 3, Mistral) fine-tuned
for natural language tasks such as CV extraction, question generation,
interview evaluation, and XAI explanations.
## ML
Machine Learning – techniques used for initial CV filtering, scoring models,
and bias mitigation.
## NLP
Natural Language Processing – subset of AI used for text analysis, semantic
matching, and descriptive answer evaluation.
## OCR
Optical Character Recognition – technology to extract text from scanned or
image-based CVs.
## RAG
Retrieval-Augmented Generation – method combining information retrieval
with LLM generation, used in advanced AI processing.
STT Speech-to-Text – transcription technology for audio interviews.
## XAI
Explainable Artificial Intelligence – mechanisms providing natural-language
justifications for AI decisions (scores, rankings, rejections) to ensure
transparency and fairness.
## Candidate
Job applicant who uses the platform to register, apply, take assessments, and
track status.
## Recruiter
HR professional or hiring manager who posts jobs, reviews candidates, and
makes final decisions.
## Administrator
System overseer responsible for user management, configuration, and
monitoring.





EAA Recruit
## 2025


## DECLARATION

We declare that this written submission represents our ideas in our own words and where others’
ideas or words have been included, we have adequately cited and referenced the original sources.
We also declare that we have adhered to all principles of academic honesty and integrity and
have not misrepresented or fabricated or falsified any idea/data/fact/source in our submission.
We understand that any violation of the above will be cause for disciplinary action by the
University and can also evoke penal action from the sources which have thus not been properly
cited or from whom proper permission has not been taken when needed.
Group NO: G-18
## Date: December 16, 2025


EAA Recruit
## 2025

School Of Information Technology and Engineering                                               1 |          P a g e
## 1. Introduction
This Software Requirements Specification (SRS) document defines the complete set of
requirements for EAA Recruit, an AI-powered recruitment automation platform developed
specifically for Ethiopian Airlines and the Ethiopian Aviation Academy.
## 1.1 Purpose
The primary purpose of this document is to provide software engineers, designers, developers,
testers, and stakeholders with a clear, detailed, and unambiguous description of what the system
must do, how it will behave, and the constraints under which it must operate. It serves as the
foundational reference for the subsequent design, implementation, testing, and validation phases
of the project.
The intended audience includes:
- The development team (G 18)
- Project advisor (Mr. Daniel Abebe)
- Examiners (Mr. Yared Y,)
- Potential stakeholders from Ethiopian Airlines and Ethiopian Aviation Academy
- Future maintainers of the system
## 1.2 Scope
(1) Identification of the Software Product The software product to be produced is EAA
Recruit, an AI-powered web-based recruitment automation platform dedicated to Ethiopian
Airlines and the Ethiopian Aviation Academy.
(2) What the Software Product Will and Will Not Do EAA Recruit will automate the
recruitment process by providing:
- Candidate registration and multi-format CV submission (with OCR support for scanned
documents)
- Intelligent multi-stage CV parsing featuring text preprocessing (OCR + cleanup),
lightweight keyword filtering, advanced extraction of structured entities (education,
experience, skills, certifications), semantic skill matching with TF-IDF vectorization and
Cosine Similarity, employment gap detection, career trajectory analysis, and initial
candidate scoring
- Automated generation and grading of role-specific written examinations (dynamic
questions with objective matching and semantic evaluation of descriptive answers using
TF-IDF + Cosine Similarity)
- Recruiter dashboards with pipeline visualization, candidate search/filtering, analytics,
notifications, and detailed reports incorporating explainable insights (top matching terms,
score breakdown, and basic justifications)
- Offline-capable deployment using open-source models to ensure full data sovereignty
The system will NOT:

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               2 |          P a g e
- Include AI-assisted interviews (text, audio, or video)
- Support native mobile applications (web-responsive only)
- Integrate with existing HR systems or external job boards
- Provide production-scale hosting beyond prototype demonstration
- Include multi-tenant SaaS capabilities or advanced cloud features (designed for future
extension)
- Offer post-project maintenance
(3) Application of the Software Being Specified
(a) Relevant Benefits, Objectives, and Goals EAA Recruit will address the current manual
recruitment process that takes 4–6 months for high-volume drives by delivering:
- Reduction of recruitment cycle time to under 4 weeks
- Objective candidate-role matching with aviation-specific models (using TF-IDF + Cosine
Similarity for transparent similarity scoring)
- Elimination of bias through standardized evaluation and basic fairness checks
- 60–75% reduction in HR processing costs via automation
- Immediate feedback and transparent score explanations to applicants
- Full compliance with Ethiopian data protection laws through local deployment
The prototype is single-tenant, focused on Ethiopian Airlines and the Ethiopian Aviation
Academy. The system uses TF-IDF + Cosine Similarity for resume-job matching; advanced
LLM features are considered future work. The architecture is designed for future extensibility,
including optional video interviews, proctored exams, timed recruiter review windows, and
multi-tenant support in post-prototype versions.
(b) Consistency with Higher-Level Specifications This scope is fully consistent with the
approved Project Proposal dated December 1, 2025, and incorporates examiner and advisor
feedback from the December 19, 2025 presentation (enhanced CV parsing intelligence,
explainable AI reports) and subsequent reviews (removal of AI-assisted interviews for
feasibility, shift to TF-IDF + Cosine Similarity pipeline for transparent and achievable
implementation). Future enhancements noted above extend the platform's potential without
altering the approved prototype scope.
## 1.3 Overview
(1) What the Rest of the SRS Contains and How It Is Organized
This Software Requirements Specification (SRS) is structured to provide a complete, traceable,
and verifiable set of requirements for the EAA Recruit system.
The document is organized as follows:

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               3 |          P a g e
- Section 2 – General Description presents a high-level overview of the product,
including its perspective relative to existing systems, major product functions, user
classes and characteristics, operating environment, design and implementation
constraints, and key assumptions.
- Section 3 – Specific Requirements contains the detailed requirements needed for design
and implementation. It covers:
o 3.1 External Interface Requirements
o 3.2 Functional Requirements
o 3.3 Use Cases
o 3.4 Non-Functional Requirements
o 3.5 Inverse Requirements
o 3.6 Design Constraints
o 3.7 Logical Database Requirements
o 3.8 Other Requirements

Supporting diagrams are referenced in Section 3 and provided in the Appendices.
- Section 4 – Change Management Process describes the procedure for proposing,
reviewing, approving, and incorporating changes to this SRS during the project lifecycle.
- References lists all documents and sources cited.
- Appendices include supplementary materials such as detailed data models, UI
wireframes, glossary expansions, and additional diagrams.
1.4 Related Works and Contribution
## (1) Related Works
- LinkedIn Recruiter: AI-based candidate matching and search, but lacks localized
Ethiopian support, explainable AI for transparency, and offline LLM for data
sovereignty. Relies on global cloud, raising privacy concerns for Ethiopian regulations.
- Workday ATS: Enterprise recruitment with CV parsing and assessments, but expensive,
not tailored for aviation, and no support or bias mitigation for African contexts.
- Google for Jobs: AI search and matching, but general-purpose, no advanced CV gap
detection or XAI, and dependent on external APIs.
- Local Examples: Ethiopian government job portals (Ministry of Labor) use basic manual
systems; no AI automation. Academic projects focus on simple apps, not AI recruitment.
(2) Our Contribution which is Relative Better Work
- Localized AI: First Ethiopian aviation-specific platform with support and cultural
tailoring.
- Explainable Transparency: Unique XAI for natural-language justifications, reducing
bias and building trust (unlike opaque systems).

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               4 |          P a g e
- Data Sovereignty: Fully local/offline LLM deployment, complying with Ethiopian laws
(no foreign cloud like LinkedIn).
- Feasible Innovation: Multi-stage CV parsing with gap detection and semantic grading,
optimized for limited resources — better for developing contexts than enterprise tools.
- Cost-Effective: Open-source stack, 60–75% HR cost reduction — more accessible than
## Workday.
- Fairness Focus: Built-in bias mitigation in scoring, addressing African employment
challenges not covered in global tools.


EAA Recruit
## 2025

School Of Information Technology and Engineering                                               5 |          P a g e
## 2. GENERAL DESCRIPTION
## 2.1 Product Perspective
EAA Recruit is a novel AI-powered platform that builds upon existing recruitment systems by
integrating advanced machine learning, natural language processing, and large language models
to automate and optimize hiring processes. It addresses gaps in current manual or semi-
automated tools used by Ethiopian Airlines, such as long processing times, subjective biases, and
lack of localized AI support. Unlike general-purpose platforms (LinkedIn Recruiter or ATS
systems like Workday), EAA Recruit is tailored for aviation-specific roles, emphasizing
Ethiopian cultural context, bilingual capabilities, and data sovereignty. This system represents an
evolution from traditional HR software, incorporating examiner-recommended enhancements
like smarter CV parsing and explainable AI for transparency, positioning it as a pioneering
solution for African aviation recruitment.
## 2.2 Product Functions
The system provides the following core functions:
- Upload Job Description Recruiters can upload or input a job description (text or file)
that includes role title, required skills, qualifications, and other criteria.
- Upload Candidate Resumes Candidates can upload resumes in common formats (PDF,
DOCX, scanned images) via the application portal.
- Automatic Skill Extraction The system automatically extracts relevant skills, education,
experience, and other key information from resumes using preprocessing (text extraction,
cleaning) and feature extraction techniques (TF-IDF vectorization).
- Candidate Ranking The system ranks candidates by calculating a similarity score
between each resume and the job description using Cosine Similarity on TF-IDF
vectors, producing an ordered shortlist.
- View Similarity Score Recruiters can view the similarity score (0–100%) for each
candidate, along with a breakdown of top matching terms and keywords from the resume
that align with the job description.
- Export Shortlist Recruiters can export the ranked shortlist as a CSV or PDF file,
including candidate names, scores, and top matching skills for further review.
## 2.3 User Characteristics
- Candidates (Applicants): Job seekers with varying technical skills (basic computer
literacy assumed), aged 18–40, familiar with web interfaces; may include non-English
speakers requiring Amharic support.
- Recruiters/HR Staff: Experienced professionals at Ethiopian Airlines, proficient in HR
tools, needing intuitive dashboards for high-volume tasks.
- Administrators: IT personnel or HR managers with technical expertise for system
configuration and oversight.

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               6 |          P a g e
## 2.4 General Constraints
- Hardware/Software: Runs on standard lab servers (Ubuntu Linux) with Python backend;
compatible with modern browsers (Chrome, Firefox).
- Standards Compliance: Adheres to Ethiopian Data Protection Proclamation No. 1329/2023
and WCAG 2.1 for accessibility.
- Development Constraints: Built using open-source tools (React.js, FastAPI, PostgreSQL,
Hugging Face LLMs) within a 6–7-month student timeline; budget limited to 2,000–30,000
## ETB.
- Assumptions: Stable internet for cloud features; synthetic datasets for training; future multi-
tenancy as v1.2 extension.
## 2.5 Computational Requirements
The system requires the following resources to compute and run the AI-driven features (CV
parsing, exam grading, XAI generation):
## • Hardware:
o Minimum: Standard university lab server with Intel Xeon or equivalent CPU, 32
GB RAM, 500 GB SSD storage.
o Recommended: Optional NVIDIA GPU (RTX 3060 or better) for faster LLM
inference; without GPU, CPU-only mode will be used with longer processing
times (up to 90 seconds for parsing).
o How? The prototype is optimized for low-resource environments using fine-tuned
lightweight LLMs (Mistral 7B).
## • Software & Libraries:
o OS: Ubuntu Linux 20.04+
o Backend: Python 3.10+, FastAPI, SQLAlchemy, PyMongo, Chroma client.
o AI/ML: Hugging Face Transformers, Sentence Transformers for embeddings,
Tesseract OCR.
o Databases: PostgreSQL 15, MongoDB 7, Chroma.
o Deployment: Docker Compose for easy setup.
o How? All tools are open-source and installable via pip/docker — no paid services
required, ensuring feasibility for student development.
## • Computational Load:
o CV parsing: < 30 seconds per CV on CPU (justified by multi-stage approach: fast
keyword filter + batched LLM calls).
o Exam grading: < 10 seconds per submission (objective matching + semantic
similarity on embeddings).
o XAI generation: < 15 seconds per report (simple LLM prompts).
o How? Asynchronous queues (RQ/Celery) handle heavy computations in
background; tested on lab hardware.


EAA Recruit
## 2025

School Of Information Technology and Engineering                                               7 |          P a g e
## 3. SPECIFIC REQUIREMENTS
## 3.1 External Interface Requirements
## 3.1.1 User Interfaces
The system shall provide a responsive web-based graphical user interface (GUI) accessible via
standard modern browsers.
The GUI shall consist of three main portals with consistent design,
## • Candidate Portal

Fig 1 UI-01 Splash/Landing page

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               8 |          P a g e

Fig 2 UI-02 Registration Page

Fig 3 UI-03 LogIn Page

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               9 |          P a g e



Fig 4 UI-04 Job browsing and search.
Fig 5 UI-05 Application form with CV upload.

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               10 |          P a g e



Fig 63.6 UI-06 Exam Interface

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               11 |          P a g e

## Recruiter Dashboard
Fig 7 UI-08 Dashboard for status tracking and feedback
Fig 8 UI-9 Job posting and management

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               12 |          P a g e



Fig 9 UI-10 Candidate pipeline
Fig 10 UI-11 Detailed candidate reports

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               13 |          P a g e

## • Administrator Panel

Fig 11 UI-12 Notification Center
## Fig 12 Admin Panel

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               14 |          P a g e


Figure 3.15 UI-15 Log views.


Fig 13 UI-14 System settings and monitoring.

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               15 |          P a g e
## 3.1.2 Hardware Interfaces
The system has no direct hardware interfaces. Microphone access for audio interviews is handled
via browse.
## 3.1.3 Software Interfaces
- Modern web browsers.
- Configurable SMTP server for email notifications.
- Optional SMS gateway API.
## 3.1.4 Communications Interfaces
- HTTPS for all traffic.
- WebSocket for real-time interview chat/audio.
- RESTful JSON APIs for internal microservices.
## 3.1.2 Hardware Interfaces
The system has no direct hardware interface requirements. It shall operate entirely as a server-
based web application without controlling.
## 3.1.3 Software Interfaces
The system shall interface with the following external software components:
## 3.1.3.1 Web Browser
- Name: Modern web browsers.
- Purpose: Render the user interface and execute client-side logic (React.js application)
- Interface: Standard HTTP/HTTPS protocols with WebSocket support for real-time
features (Interview chat)
## 3.1.3.2 Email Service Provider
- Name: SMTP server (Institutional mail server)
- Purpose: Send automated notifications, application confirmations, interview invitations,
and status updates
- Interface: Standard SMTP protocol over TLS; the system shall send formatted HTML
emails with bilingual content
3.1.3.3 SMS Gateway (Optional)
- Name: Third-party SMS API.
- Purpose: Deliver time-sensitive notifications and OTPs where email is insufficient
- Interface: RESTful API calls with JSON payloads; configuration shall be externalized
No other mandatory external software systems are required. Integration with Ethiopian Airlines'
existing HR databases or identity management systems is explicitly out of scope.
## 3.1.4 Communications Interfaces
The system shall use the following communication protocols:
- HTTPS for all client-server communications to ensure confidentiality and integrity.
- HTTP/2 or HTTP/3 for improved performance in asset delivery.

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               16 |          P a g e
- Standard RESTful API endpoints (JSON over HTTPS) for internal microservice
communication.
- SMTP/TLS for email transmission.
The system shall support IPv4 and IPv6 networks and operate behind standard institutional
firewalls with ports 443 (HTTPS) and 80 (HTTP redirect) open.
## 3.2 Functional Requirements
The system shall provide the following core functional requirements to support efficient resume-
based candidate shortlisting:
FR-01: Upload Job Description
Intro: Recruiters upload or manually enter job descriptions containing role requirements, skills,
qualifications, and scoring weights used by AI matching algorithms.
## Inputs:
- Title: String, required, 5-100 characters ("Senior ATPL Pilot")
- Description: Text area, required, 100-5000 characters (full job spec)
- Required Skills: Multi-select dropdown + free text tags (["ATPL", "Boeing_737",
"Python"])
- Qualifications: Checkboxes (["BSc Aviation", "5+ years", "IATA Certified"])
- Scoring Weights: Sliders with validation
o CV Similarity: 30-60% (default: 40%)
o Exam Score: 20-50% (default: 35%)
o Interview Score: 10-30% (default: 25%)
- Application Deadline: Date picker (2026-03-15)
- Optional File: PDF/TXT upload (max 2MB) for complex JDs
## Processing:
- Client-side validation: Title length, weights sum=100%
- Auto-skill extraction: NLP parses description → ["ATPL", "safety", "python"]
- Weight normalization: Ensure cv_weight + exam_weight + interview_weight =
## 1.0
- Store Job record: PostgreSQL with criteriaWeights JSON field
- Set lifecycle: status = "DRAFT" → recruiter publishes
- Generate jobCriteria: JSON for TF-IDF ({"mandatory": ["ATPL"], "preferred":
["Python"]})


EAA Recruit
## 2025

School Of Information Technology and Engineering                                               17 |          P a g e
## Outputs:
HTTP 201 Created
## {
"jobId": "job_456",
"title": "Senior ATPL Pilot",
"status": "DRAFT",
"autoExtractedSkills": ["ATPL", "pilot", "safety", "python"],
"criteriaWeights": {"cv": 0.40, "exam": 0.35, "interview": 0.25},
"trackUrl": "/recruiter/jobs/job_456",
"publishUrl": "/recruiter/jobs/job_456/publish"
## }
## Error Handling:
- "Title required (5-100 characters)"
- "Weights must sum exactly 100%"
- "Description too short (<100 chars) or too long (>5000 chars)"
- "Minimum 3 skills required (auto-detected: 1)"
- "File too large (max 2MB)"
- "Invalid date (must be future date)"
FR-02: Upload Candidate Resumes
Intro: Candidates upload resumes through job application portal; system validates, encrypts, and
queues for immediate async AI processing.
## Inputs:
- Resume File: Required, one of:
## Format Expected % Max Size
PDF (text) 60% 10MB
PDF (scanned) 25% 10MB
## DOCX 10% 10MB
## PNG/JPG 5% 5MB
- Job ID: String ("job_456")
- Candidate Details: Auto-filled from profile (name, phone, email)
- Cover Letter: Optional text (max 2000 chars)
## Processing:
- Client-side validation: File type, size, basic format check
- Server-side virus scan: ClamAV (blocks malware in <1s)
- File type detection: OCR path vs native text path
- Secure storage: AES-256 encryption → MongoDB GridFS

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               18 |          P a g e
- Create Application: PostgreSQL status = "SUBMITTED"
- Async queue: Celery task CVParserService.process(appId)
- Immediate ACK: Candidate sees confirmation instantly
## Outputs:
HTTP 202 Accepted
## {
"applicationId": "app_789",
"jobId": "job_456",
"status": "SUBMITTED",
"storageLocation": "encrypted_gridfs://app_789",
"expectedResults": "Results within 24 hours",
"trackUrl": "/candidate/applications/app_789",
"estimatedProcessingTime": "3-5 minutes"
## }
## Error Handling:
- "Invalid file type. Accepted: PDF, DOCX, PNG, JPG"
- "File too large. Maximum: 10MB (PDF/DOCX), 5MB (images)"
- "Virus detected. File rejected for security"
- "Already applied to this job on 2026-01-27"
- "Job not accepting applications (closed)"
- "File corrupted - cannot extract text"
- "Upload timeout - please try smaller file"
FR-03: Automatic Skill Extraction
Intro: System automatically processes uploaded resumes through complete AI pipeline to extract
skills, compute similarity scores, and generate skill match explanations versus job requirements.
## Inputs:
- Raw Resume File: Encrypted GridFS reference (app_789)
- Job Description: Job record description + requiredSkills
- Application ID: Links to candidate/job ("app_789")
- Processing Parameters: max_features=5000, threshold=0.01
## Processing:
- Text Extraction (4.2.1): OCR/PDF → cvRawText (2300 chars avg)
- NLP Preprocessing (4.2.2): Clean → cleanedCvText ("atpl python boeing")
- TF-IDF Vectorization (4.2.3): → cv_vector, jd_vector (5000-dim)
- Cosine Similarity (4.2.4): → similarity_score=0.819 (81.9%)
- Skill Extraction (4.2.6): → top_skills=["ATPL"(44%), "Python"(19%)]

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               19 |          P a g e
- Store ParsedCV: MongoDB {initialScore:81.9, topSkills: [...], vectors:
## [...]}
- Update Application: PostgreSQL status="PARSED", cvScore=81.9
## Outputs:
text
## {
"applicationId": "app_789",
"cvScore": 81.9,
"status": "PARSED",
"topSkills": [
{"skill": "ATPL", "contribution": 0.44},
{"skill": "Python", "contribution": 0.19},
## {"skill": "pilot", "contribution": 0.12}
## ],
"commonTerms": 23,
"processingTime": "2.8s",
"extractionQuality": 0.94
## }
## Error Handling:
- "Text extraction failed (OCR confidence <60%)"
- "No meaningful skills detected (similarity <50%)"
- "Processing timeout (>30s) - fallback keyword match"
- "Vector computation error - empty document"
- "Job description missing - cannot compute similarity"
FR-04: Rank Candidates
Intro: System computes final scores across all candidates using job-specific weights and
generates ranked shortlist for recruiter review.
## Inputs:
- Candidate Scores: Array of ParsedCV records ([{appId:"789", cvScore:81.9},
## ...])
- Job Criteria: job_456.criteriaWeights ({"cv":0.40, "exam":0.35,
## "interview":0.25})
- Shortlist Parameters: threshold=70.0, maxShortlist=20
- Exam Results: Optional ExamResult.score per application
## Processing:
- Aggregate Scores: finalScore = (cv*0.4) + (exam*0.35) + (interview*0.25)
- Bias Check: Statistical test across demographic groups

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               20 |          P a g e
- Sort Descending: By finalScore
- Apply Rules: Keep top-20 OR score≥70% (whichever larger)
- Generate Stats: Average score, distribution percentiles
- Store Shortlist: Job.shortlistIds array
## Outputs:
## {
"jobId": "job_456",
"shortlistCount": 18,
## "threshold": 70.0,
## "candidates": [
## {
"appId": "789",
"finalScore": 84.6,
## "rank": 1,
## "breakdown": {"cv": 81.9, "exam": 88.0},
"candidateName": "Abebe Dagne"
## }
## ],
"avgShortlistScore": 78.2,
"biasCheck": "Passed (disparity ratio: 1.08)"
## }
## Error Handling:
- "No candidates with scores"
- "Invalid weights (sum ≠ 100%)"
- "Bias detected (disparity >1.2x)"
- "Score aggregation failed (missing data)"
- "Ranking timeout (>1000 candidates)"
FR-05: View Similarity Score
Intro: Recruiters view detailed similarity analysis and top skill matches for individual candidates
to make informed shortlisting decisions.
## Inputs:
- Application ID: Unique identifier ("app_789")
- Job ID: Context ("job_456")
- View Mode: "summary" or "detailed"
- User Role: Recruiter (RBAC check)
## Processing:
- Load Data: Fetch ParsedCV, Application, Job records
- Validate Access: Recruiter owns job or admin
- Generate XAI: Recompute top skills + contributions from vectors
- Format Breakdown: CV score, exam score, final score
- Bias Flag: Check demographic disparity warnings
- Render UI: Color-coded scores + skill list

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               21 |          P a g e
## Outputs:
text
## {
"applicationId": "app_789",
"candidateName": "Abebe Dagne",
"similarityScore": 81.9,
"finalScore": 84.6,
"status": "PARSED",
"skillMatches": [
{"skill": "ATPL", "cvWeight": 0.62, "jdWeight": 0.58, "contrib": 44%},
{"skill": "Python", "cvWeight": 0.45, "jdWeight": 0.35, "contrib": 19%}
## ],
"explanation": "81.9% CV match driven by ATPL certification and Python skills",
## "actions": ["shortlist", "reject", "interview"]
## }
## Error Handling:
- "Application not found"
- "Access denied (not your job)"
- "Parsing incomplete (status=SUBMITTED)"
- "Candidate data unavailable"

FR-06: Export Shortlist
Intro: Recruiters export ranked shortlist with scores and contact details for HR workflow,
interviews, and stakeholder sharing.
## Inputs:
- Job ID: ("job_456")
## • Format: "excel", "pdf", "csv"
- Fields: Checkboxes (scores, skills, contact, resume_link)
- Recipients: Email list (optional auto-send)
## Processing:
- Fetch Shortlist: Top-20 or threshold-qualified candidates
- Format Data: Columns per selection (Name, Score, Top Skills, Phone)
- Generate XAI Summary: Per-candidate skill explanations
- Secure Links: Time-limited resume download URLs (24h)
- Create File: Excel (preferred) or PDF report
- Store Temporarily: Secure GridFS (auto-delete 7 days)
- Email/Download: Secure link delivery
## Outputs:
Excel: shortlist_job456_20260127.xlsx
## Candidate
## Name
## Final
## Score
CV Match
## Score
## Key Skills Contact
## Number
## Resume
## Link
Abebe Dagne 84.6% 81.9% ATPL,
## Python
## +251 911 23 Link
## Bethel K. 79.2% 76.5% Pilot, Safety +251 922 22 Link

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               22 |          P a g e

## HTTP 200:
## {
"downloadId": "export_123",
## "filename": "shortlist_job456.xlsx",
"size": "245KB",
"expires": "2026-01-28T23:59",
"downloadUrl": "/exports/export_123"
## }
## Error Handling:
- "No shortlist available (generate first)"
- "Invalid export format (excel/pdf/csv)"
- "Export generation failed (try again)"
- "Download expired (generate new export)"
- "Too many fields selected (max 15 columns)"


EAA Recruit
## 2025

School Of Information Technology and Engineering                                               23 |          P a g e
## 1.3 Use Cases

## Fig 14 Use Cases

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               24 |          P a g e
3.3.1 Use Case #1: Candidate Registration and Login
Use Case ID UC-01
Actor Candidate (Primary)
Goal To create a new account or log in to an existing account in order to access
the candidate portal and apply for jobs.
Priority High (essential for all candidate interactions)
Frequency High (expected multiple times per recruitment cycle)
Preconditions - The candidate has access to a compatible web browser and a stable
internet connection.
- The system is operational and the public homepage is accessible.
## Main Success
## Scenario
- The candidate navigates to the EAA Recruit homepage.
- The candidate selects "Register" (for new users) or "Login" (for
returning users).
- Registration Path: a. The system displays the registration form. b.
The candidate enters required information: full name, email address,
phone number (Ethiopian format preferred), password (with strength
indicator), confirmation password, date of birth, and nationality. c.
The candidate optionally uploads a profile photo (JPEG/PNG, max 5
MB). d. The candidate checks the consent box for data processing
and terms of service. e. The candidate submits the form.
- Login Path: a. The system displays the login form. b. The candidate
enters email address and password. c. The candidate submits the
form.
- The system validates the submitted data (format, uniqueness for
registration, credentials for login).
- For registration: The system creates the account, hashes the
password, and sends a verification email containing a unique link or
an SMS with a one-time password (OTP).
- The candidate clicks the verification link or enters the OTP on the
verification page.
- The system verifies the token/OTP and activates the account.
- The system logs the candidate in, creates a secure session, and
redirects to the candidate dashboard.
- The system sends a welcome email confirming successful
registration/login.

## Alternative
## Flows
A1: Invalid Input During Registration or Login (at step 3 or 4)
- The system detects invalid or incomplete data.
- The system highlights the erroneous fields and displays clear,
bilingual (English/Amharic) error messages without submitting.

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               25 |          P a g e
- The candidate corrects the input and resubmits. Flow returns to step
## 5.
A2: Duplicate Email or Phone During Registration (at step 5)
- The system detects that the email or phone is already registered.
- The system displays “This email/phone is already in use. Please log
in instead.” with a link to the login page.
- The candidate may choose to log in (returns to step 4) or use a
different email/phone.
A3: Incorrect Credentials During Login (at step 5)
- The system finds no matching active account or incorrect password.
- The system displays “Invalid email or password. Please try again.”
- After 5 failed attempts within 30 minutes, the system temporarily
locks the account for 15 minutes and notifies via email.
- The candidate may use “Forgot Password” to initiate reset.
A4: Forgot Password (triggered from login page)
- The candidate selects “Forgot Password”.
- The candidate enters registered email.
- The system sends a password reset link (valid for 1 hour).
- The candidate clicks the link, enters new password (twice), and
submits.
- The system updates the password and logs the candidate in.
A5: Verification Failure or Expired Token (at step 7)
- The candidate enters incorrect OTP or clicks expired link.
- The system displays error and provides “Resend Verification”
option (rate-limited to 3 per hour).
- Flow returns to step 6 upon resend.
A6: Account Not Verified (during login attempt)
- The candidate attempts login before verification.
The system displays “Please verify your email/phone first” and resends
verification.

Exceptions Network timeout or server error: The system displays a friendly error
message with retry option. All actions are logged for administrator review.
## Includes None

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               26 |          P a g e
## Extends None
## Non-
## Functional
## Considerations
- Response time for form submission/validation: < 2 seconds.
- Password storage: Hashed with bcrypt
- Session security: HTTPS only.
Table 1 Use Case #1: Candidate Registration and Login 3.3.2 Use Case #2:
Submit Job Application with CV
3.3.2 Use Case #2: Submit Job Application with CV
Use Case ID UC-02
Actor Candidate (Primary)
Goal To browse available job positions, select a position, and successfully
submit an application including a CV and optional supporting
documents.
Priority High (core entry point for all recruitment data)
Frequency High (multiple applications per candidate during recruitment drives)
Preconditions • The candidate is successfully logged in and authenticated (UC-01
completed). • At least one active job posting exists in the system. • The
candidate has prepared a CV file in a supported format.
Postconditions • Success: A new application record is created, the CV is stored securely,
the application status is set to “Received”, a confirmation is sent to the
candidate, and the intelligent CV parsing process (UC-03) is
automatically triggered. • Failure: No application is recorded, and the
candidate receives clear feedback on the issue.
## Main Success
## Scenario
- The candidate navigates to the “Open Positions” section from the
dashboard. 2. The system displays a list of active job postings with key
details (title, department, location, application deadline, brief
description). 3. The candidate selects a desired job position. 4. The
system displays the full job description, requirements, and application
form. 5. The candidate uploads a CV file (PDF, DOCX, or image
formats such as JPEG/PNG for scanned documents; maximum size 10
MB). 6. The candidate optionally uploads a cover letter or additional
documents (same format/size constraints) and enters any required free-
text fields ( motivation statement). 7. The candidate checks the consent
checkbox confirming agreement to data processing and truthfulness of
information. 8. The candidate reviews the submission preview and clicks
“Submit Application”. 9. The system validates file types, sizes, and
required fields. 10. The system stores the files securely, generates a
unique application ID, records the submission timestamp, and updates
the candidate’s application history. 11. The system changes the
application status to “Received” and automatically queues the CV for
intelligent parsing (triggers UC-03). 12. The system displays a
confirmation page with the application ID and estimated processing

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               27 |          P a g e
timeline. 13. The system sends a confirmation email and/or SMS to the
candidate containing the application ID, job title, and next steps.
Alternative Flows A1: No Active Job Postings (at step 2)
- The system displays “No open positions at this time. Please check back
later.”
- The candidate may subscribe to job alerts (optional feature). Flow ends.
A2: Invalid or Missing Upload (at step 9)
- The system detects unsupported file type, oversized file, or missing
required CV.
- The system highlights the error, displays a bilingual error message (
“Please upload a valid CV in PDF, DOCX, or image format (max 10
MB)”), and prevents submission.
- The candidate corrects the issue and resubmits. Flow returns to step 8.
A3: Application Already Submitted for Same Position (at step 9)
- The system detects a previous submission for the same job by the same
candidate.
- The system displays “You have already applied for this position
(Application ID: XXX). You may view it in your history.”
- The candidate may choose another position or exit. A4: Deadline
Passed (at step 4)
- The system checks the job posting deadline.
- If expired, the “Apply” button is disabled and a message “Application
deadline has passed” is shown. Flow ends.
Exceptions • File upload failure due to network issues: The system shows a retry
option with progress resumption support.
- Server error during submission: The system logs the error, displays a
friendly message (“Temporary issue – please try again”), and retains
entered data for resubmission.
## Includes /
## Extends
Includes: None Extends: UC-03 (Intelligent CV Parsing and Scoring) –
triggered automatically upon successful submission.
Non-Functional
## Considerations
- Upload progress indicator shall be displayed for files >2 MB.
- Response time for submission confirmation: < 3 seconds under normal
load.
- All uploaded files shall be scanned for viruses/malware before storage.
- Bilingual support: All labels, instructions, and messages available in
English and Amharic.
Table 2 Use Case #2: Submit Job Application with CV


EAA Recruit
## 2025

School Of Information Technology and Engineering                                               28 |          P a g e
3.3.3 Use Case #3: Intelligent CV Parsing and Scoring (System-Triggered)

Use Case ID UC-03
Actor System (Automated – triggered by UC-02)
Goal Automatically process an uploaded candidate resume, extract key
information and skills, compare it against the job description using TF-
IDF vectorization and Cosine Similarity, compute a similarity score,
rank the candidate, and provide transparent explainable results to
recruiters.
Priority High (core AI differentiation and examiner-highlighted enhancement)
Frequency Medium to High (once per application)
Preconditions • A new job application with CV has been successfully submitted (UC-
02 completed).
- Job-specific criteria and weightings are defined by recruiters.
Postconditions Success: Resume is parsed, skills extracted, similarity score calculated,
candidate ranked, results stored, and recruiter dashboard updated.
Failure: Parsing flagged for manual review, candidate notified, and
recruiters alerted.
## Main Success
## Scenario
-  The system detects a new resume upload and places it in the
processing queue.
-  The system retrieves the resume file and the associated job
description/criteria.
-  The system performs preprocessing:
- Extract text from resume
- Clean text
-  The system performs feature extraction using TF-IDF vectorization
to convert resume and job description into numerical vectors.
-  The system computes a similarity score between the resume vector
and job description vector using Cosine Similarity (score 0–1, converted
to 0–100%).
-  The system ranks the candidate relative to other applicants based on
the similarity score.
-  The system extracts and highlights top matching skills/terms (from
TF-IDF weights) for explainability.
-  The system stores parsed resume data, similarity score, top matching
terms, and ranking in the candidate profile.
-  The system updates the application status (e.g., “Processed –
Ranked”) and notifies the recruiter dashboard of the new ranked
candidate.
Alternative Flows A1: Low Confidence or Parsing Failure (steps 3–5)

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               29 |          P a g e
- The system encounters unreadable text, highly unstructured
format, or low similarity confidence.
- The system flags the application for manual recruiter review,
stores raw file, and partially populates profile with available data.
- The system notifies the candidate: “Your resume requires manual
review due to format issues. We will contact you soon.”
A2: Immediate Rejection by Preprocessing (step 3)
- Critical missing information detected (e.g., no skills extracted or
file unreadable).
- The system sets status to “Rejected – Unable to Process” and
generates basic reason.
- The system sends polite rejection email to candidate.
Exceptions • File too large/corrupt: Reject upload with clear message “Invalid
file – please upload PDF/DOCX under 10 MB.”
- Processing timeout: Retry up to 3 times in background queue; on
final failure, flag for manual review.
- All failures logged with audit trail for compliance.
## Includes / Extends Includes: None
## Extends: None
Non-Functional
## Considerations
-  Processing time: < 5 seconds for average resume (95% percentile).
-  Accuracy target: ≥ 90% for skill extraction on well-formatted
resumes.
-  All processing shall occur locally to ensure data sovereignty and
compliance with Ethiopian data protection laws.
-  Audit log maintained for all parsing and scoring decisions.
Table 3 Use Case #3: Intelligent CV Parsing and Scoring (System-Triggered)
## 3.3.4 Use Case #4: Take Automated Written Examination
Use Case ID UC-04
Actor Candidate (Primary)
Goal To complete a dynamically generated, role-specific written examination
and receive an immediate score with feedback.
Priority High (key evaluation stage)
Frequency Medium (once per qualified application)
Preconditions • The candidate is logged in and authenticated. • The candidate’s
application has passed initial CV parsing and scoring (UC-03) with a
score above the recruiter-defined threshold for the exam stage. • The
system has sent an exam invitation notification, and the exam is within
its validity period (typically 7 days from invitation). • A question bank
with sufficient aviation-relevant questions exists for the job position.

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               30 |          P a g e
Postconditions • Success: Examination completed, answers submitted, score calculated,
application status updated, and candidate receives results.
- Failure: Exam not completed (time expiry), partial or no score
recorded, status updated accordingly.
## Main Success
## Scenario
- The candidate navigates to the dashboard and selects “Start Written
Examination” for the invited application.
- The system verifies eligibility and exam availability.
- The system dynamically generates a set of questions tailored to the job
position (30–50 questions: multiple-choice, true/false, scenario-based,
and short descriptive).
- The system displays exam instructions, total questions, time limit (60–
120 minutes), and a countdown timer.
- The candidate begins the exam; the system presents one question at a
time (or section-based) with navigation restrictions (no returning to
previous questions).
- The candidate selects answers for objective questions and types
responses for descriptive questions.
- The candidate submits the exam before or upon time expiry.
- The system immediately grades:
- Objective questions: Exact match scoring.
- Descriptive questions: Embedding-based semantic similarity against
LLM-generated ideal answers.
- The system calculates an overall exam score (0–100%) and stores
detailed results.
- The system displays results to the candidate (total score, section
breakdown, correct/incorrect per objective question, and general
feedback).
- The system updates the application status and notifies the recruiter
dashboard.
- If the score meets the threshold, the system will let him to the next
stage.
Alternative Flows A1: Exam Invitation Expired or Not Eligible (at step 2) • The system
displays “Examination invitation has expired or you are not eligible at
this time. Contact support if needed.”
- Flow ends without starting exam.
A2: Time Expiry During Exam (at step 7)
- Timer reaches zero before submission. • The system auto-submits
answered questions, grades only those, and displays “Time expired –
exam auto-submitted” with partial results.
A3: Technical Issue During Exam (any step) • Connectivity loss
detected. • The system saves progress locally (browser storage) and
attempts auto-resume upon reconnection within 10 minutes. • If
unrecoverable, flags for recruiter review and notifies candidate.
Exceptions • Cheating detection (rapid copy-paste, tab switching > threshold):
System warns once, then terminates exam with flag for manual review. •

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               31 |          P a g e
Server error during grading: System retries in background; candidate
sees temporary message and refreshed results later.
## Includes /
## Extends
Includes: None Extends: None (results feed into UC-06 for final
scoring/reporting)
Non-Functional
## Considerations
- Exam generation time: < 5 seconds. • Grading completion: < 10
seconds after submission. • Interface: Proctored-like (full-screen
encouragement, inactivity detection). • Bilingual: Questions and
instructions available in English and Amharic. • Accessibility: Keyboard
navigation, readable fonts, screen reader compatibility.
## Table 4 Use Case #4: Take Automated Written Examination
## 3.3.6 Use Case #6: Generate Explainable Candidate Report
Use Case ID UC-06
Actor Recruiter (Primary)
Goal Allow the recruiter to generate a detailed, explainable report for a
candidate or shortlist, showing similarity scores, top matching
terms/skills, and ranking rationale based on the TF-IDF + Cosine
Similarity matching between resume and job description.
Priority High (core examiner-recommended transparency feature)
Frequency High (viewed multiple times per candidate during review)
## Preconditions
-  At least one candidate application has been processed (UC-03
completed).
-  Similarity scores and top matching terms are available in the system.
## Postconditions
-  Success: A clear, explainable report is generated, displayed to the
recruiter, and optionally exported.
-  Failure: Report generation fails due to missing data; recruiter notified
of issue.
## Main Success
## Scenario
-  The recruiter selects a candidate or shortlist from the
pipeline/dashboard.
-  The recruiter requests to generate the report for the selected
candidate(s).
-  The system retrieves the candidate's processed resume data (extracted
skills, TF-IDF vectors) and the job description (criteria, TF-IDF vector).
-  The system recalculates or retrieves the similarity score using Cosine
Similarity between resume and job vectors.
-  The system extracts and ranks the top matching terms/skills based on
TF-IDF weights.
-  The system generates the explainable report containing:
- Candidate name and basic info
- Similarity score (0–100%)
- Ranked list of top matching skills/terms with
weights/contributions

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               32 |          P a g e
- Overall ranking position among applicants
- Basic explanation (e.g., “High score due to strong match on
aviation safety and customer service skills; minor deduction for
limited recent experience”)
-  The system displays the report in the recruiter dashboard.
-  The recruiter reviews the report and optionally exports it (CSV or
## PDF).
-  The system logs the report generation event for audit.
## Alternative Flows A1: Missing Processed Data (step 3)
- The system finds the candidate has not been processed or has low
confidence results.
- The system notifies the recruiter: “Candidate resume requires
manual review or re-processing.”
- The system offers to flag for re-parsing or skip to manual entry.
A2: Bulk Report for Shortlist (step 1)
- Recruiter selects multiple candidates.
- The system generates a summarized shortlist report with scores,
rankings, and top terms for all selected candidates.
- Export option includes bulk CSV with scores and key matches.
## Exceptions
-  No matching data available: Return message “No processed data for
this candidate – please wait or re-upload resume.”
-  Export failure (e.g., file size limit): Provide on-screen view only and
notify “Export limit reached – use on-screen view.”
-  All exceptions logged with audit trail.
## Includes /
## Extends
Includes: UC-03: Intelligent CV Parsing & Scoring (provides similarity
score and top terms).
## Extends: None
Non-Functional
## Considerations
-  Report generation time: < 3 seconds for single candidate, < 10 seconds
for shortlist of 50.
-  Report clarity: Transparent and easy to understand (top terms listed
with weights).
-  Export format: CSV/PDF with readable layout.
-  Audit log maintained for all report generations for compliance.
## Table 5 Use Case #6: Generate Explainable Candidate Report


EAA Recruit
## 2025

School Of Information Technology and Engineering                                               33 |          P a g e
3.3.7 Use Case #7: Post and Manage Job Positions
Use Case ID UC-07
Actor Recruiter or Administrator (Primary)
Goal To create, publish, edit, close, or archive job positions with detailed
requirements and evaluation criteria.
Priority High (initiates recruitment cycles)
Frequency Medium (new positions per recruitment drive)
Preconditions • The user is logged in with recruiter or administrator privileges. • The
system is configured with default templates or question banks (optional).
Postconditions • Success: Job position created/updated, made visible (or hidden) to
candidates, and ready for applications. • Failure: Changes not saved, with
feedback provided.
## Main Success
## Scenario
- The user navigates to the “Job Management” section in the
recruiter/admin dashboard. 2. The user selects “Create New Job
Position” (or “Edit” for existing). 3. The system displays the job posting
form. 4. The user enters mandatory details: • Job title, department,
location, type (full-time, cadet, etc.) • Detailed description and
responsibilities • Minimum qualifications (education, experience,
certifications) • Application deadline • Stage weightings (CV: %, Exam:
%, Interview: %) • Specific scoring criteria (mandatory keywords, height
range for cabin crew) • Question bank selection or custom questions for
exam stage 5. The user optionally uploads supporting documents (job
flyer PDF). 6. The user previews the public-facing job listing. 7. The
user sets status to “Published” and submits. 8. The system validates
required fields and logical consistency (deadline in future). 9. The
system saves the position, assigns a unique job ID, and makes it visible
in the candidate portal. 10. The system logs the action and notifies other
recruiters (if configured).
Alternative Flows A1: Edit Existing Position • User selects an active position and modifies
details. • If already receiving applications, system warns “Changes will
affect ongoing applications” and requires confirmation. A2: Close or
Archive Position • User sets status to “Closed” or “Archived”. • System
hides from candidate view, stops new applications, and updates status for
existing applicants. A3: Duplicate Position • User selects “Duplicate” on
existing job. • System creates copy with “Draft” status for quick setup of
similar roles.
Exceptions • Deadline in past during creation: System rejects with error. • Missing
mandatory criteria: Prevent submission with highlighted fields.
## Includes /
## Extends
Includes: None Extends: None (but creates data used in UC-02, UC-03,
etc.)
Non-Functional
## Considerations
- Form autosave draft every 2 minutes. • Response time for save/publish:
< 3 seconds. • Version history maintained for edited positions. •
Bilingual: Job description and public listing support English and
Amharic entry/display.

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               34 |          P a g e
Table 6 Use Case #7: Post and Manage Job Positions
3.3.8 Use Case #8: View Application Status and Feedback
Use Case ID UC-08
Actor Candidate (Primary)
Goal To check the real-time status of submitted job applications and receive
transparent, explainable feedback on progress or outcomes.
Priority High (improves candidate experience and trust)
Frequency High (candidates check frequently during recruitment cycles)
Preconditions • The candidate is logged in and authenticated (UC-01 completed).
- The candidate has at least one submitted application (UC-02
completed).
Postconditions • Success: Candidate views up-to-date status for all applications and
receives detailed feedback where available (including XAI
explanations for advancement/rejection).
- Failure: No applications found or temporary display issue, with
appropriate message.
## Main Success
## Scenario
-  The candidate navigates to the "My Applications" section in the
portal.
-  The system retrieves the candidate's submitted applications from the
database.
-  The system displays a list of applications with current status (e.g.,
"Submitted", "CV Parsed", "Processed – Ranked", "Rejected").
-  The candidate selects a specific application to view detailed status
and feedback.
-  The system retrieves the processed data: similarity score, top
matching terms/skills, and ranking position (if applicable).
-  The system presents the explainable feedback in a clear format:
- Current application status
- Similarity score (0–100%) with job description
- List of top matching skills/terms (from TF-IDF weights)
- Brief explanation (e.g., “Your resume scored 78% due to
strong match on customer service and safety skills; lower score
due to limited aviation-specific experience”)
- Next steps (e.g., "Awaiting recruiter review" or "Not
shortlisted")
-  The candidate reviews the feedback and optionally logs out or
returns to dashboard.
-  The system logs the view event for audit.
Alternative Flows A1: No Applications Submitted (at step 2)

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               35 |          P a g e
- The system displays “You have no applications yet. Browse
open positions to get started.” with a prominent link to job
listings.
A2: Feedback Not Yet Available (at step 4)
- For in-progress applications (“CV Parsing in progress”).
- The system shows “Your application is being processed.
Expected update within 24–48 hours.” with estimated timeline
based on job configuration.
A3: Rejected with Detailed XAI Feedback
- Status “Rejected”.
- System prominently displays explainable rejection reason
derived from CV parsing and exam scoring
Exceptions • Data loading error: System shows retry button and fallback cached
view if available.
- Sensitive information restriction: Scores/feedback hidden until
recruiter releases (configurable per job).
Includes / Extends Includes: Results from UC-03 (Intelligent CV Parsing) and UC-04
(Automated Written Examination)
## Extends: None
Non-Functional
## Considerations
- Page load time: < 2 seconds for application list.
- Real-time updates: Status refreshed automatically or via pull-to-
refresh. • Privacy: Feedback never reveals comparative data about
other candidates.
Table 7 Use Case #8: View Application Status and Feedback.
3.3.9 Use Case #9: Search and Filter Candidates
Use Case ID UC-09
Actor Recruiter (Primary)
Goal To efficiently search, filter, and sort candidates based on multiple criteria
to identify suitable applicants for review or advancement.
Priority High (essential for managing high-volume recruitment)
Frequency High (used daily during active drives)
Preconditions • The recruiter is logged in with appropriate privileges. • Applications
have been submitted and processed through at least initial stages.
Postconditions • Success: A refined list of candidates is displayed matching the criteria,
with options to perform bulk actions or drill down.
## Main Success
## Scenario
- The recruiter navigates to the “Candidate Pipeline” or “All
Candidates” section in the dashboard. 2. The system displays a default
view (all active applications sorted by submission date or overall score).
- The recruiter applies filters and search: • Free-text search (name,
email, skills, certifications) • Status filters (“Exam Completed”,
“Shortlisted”) • Score ranges (overall, CV, exam, interview) • Job
position • Parsed attributes (years of experience, education level, specific
certifications, employment gaps) • Date ranges (submission, last update)

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               36 |          P a g e
- Flags (manual review needed, inconsistencies) 4. The recruiter
optionally sorts results (highest score descending). 5. The system
instantly updates the list with matching candidates (pagination for large
sets). 6. The recruiter selects one or more candidates for actions: view
profile/report (UC-06), send notification, advance/reject, add notes. 7.
The system executes bulk actions where applicable and updates statuses.
Alternative Flows A1: No Matching Candidates • After applying filters. • The system
displays “No candidates match your criteria. Try adjusting filters.” with
suggestions (broaden score range).
A2: Advanced Saved Filters • Recruiter saves current filter set for reuse
(“Pilot Cadets – High Scorers”). • System stores and lists under “Saved
Searches” for quick access.
## A3: Export Filtered List
- Recruiter clicks “Export”. • System generates CSV/PDF with selected
columns (anonymized if configured).
Exceptions • Excessive results (>10,000): System enforces pagination and warns
“Refine filters for better performance.” • Filter error (invalid range):
Inline validation prevents application.
## Includes /
## Extends
Includes: UC-06 (for profile/report viewing) Extends: None
Non-Functional
## Considerations
- Search response time: < 1 second for typical queries. • Results per
page: Configurable (50–200). • Accessibility: Filter controls keyboard-
navigable and screen-reader friendly.
Table 8 Use Case #9: Search and Filter Candidates
3.3.10 Use Case #10: Administer System Users and Settings
Use Case ID UC-10
Actor Administrator (Primary)
Goal To manage recruiter accounts, configure system-wide settings, monitor
activity, and maintain system integrity.
Priority Medium (administrative support)
Frequency Low to Medium (setup and occasional maintenance)
Preconditions • The user is logged in with administrator privileges.
Postconditions • Success: Users/settings updated, changes logged, system operates with
new configuration.
## Main Success
## Scenario
- The administrator navigates to the “Administration Panel”. 2. The
administrator selects a task (“Manage Users”, “System Settings”,
“Activity Logs”). 3. User Management: a. View list of recruiters/admins.
b. Add new user (email, role, name). c. Edit role, reset password, or
deactivate account. 4. System Settings: a. Configure notification
templates (email/SMS). b. Set global thresholds (auto-advance scores). c.
Manage bilingual content defaults. d. Configure external services
(SMTP, SMS gateway). 5. Monitoring: a. View system logs (audit trail
of key actions). b. Check performance metrics (active users, processing

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               37 |          P a g e
queue). c. Export logs if needed. 6. The administrator saves changes. 7.
The system validates inputs, applies updates, and logs all administrative
actions with timestamp and user ID.
## Alternative Flows A1: No Processed Data Available (step 5)
- The system finds the application is still processing or failed.
- The system displays status: “Your application is being processed
– please check back later.”
- The system notifies the candidate when processing completes.
## A2: Rejected Application (step 6)
- The system shows status “Rejected” with brief reason (e.g.,
“Similarity score below threshold”).
- The system encourages re-application to other jobs
## Exceptions
-  No applications found: Display message “You have no active
applications – browse jobs to apply.”
-  Data retrieval failure: Return message “Temporary issue – please try
again later.”
-  All exceptions logged with audit trail.
## Includes /
## Extends
## Includes: None Extends: None
Non-Functional
## Considerations
- All admin actions logged immutably. • Role-based access control
strictly enforced. • Sensitive operations require confirmation or 2FA (if
implemented).
Table 9 Use Case #10: Administer Systm Users and Settings
3.4 Non-Functional Requirements
Non-functional requirements are categorized below. Each requirement is uniquely identified,
verifiable, and includes measurable criteria where applicable.
NFR-01: Performance
Intro: System processes individual CVs and responds to UI requests within strict time
boundaries to maintain recruiter productivity and perceived responsiveness.
## Inputs:
- Single CV file (avg 2.3MB PDF, 3 pages)
- Job description (487 chars avg)
- Hardware: Single CPU (Intel i5-12400, 8GB RAM)
- Network: 100Mbps LAN

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               38 |          P a g e
## Metrics & Targets:
CV End-to-End Processing: <3 seconds (p95)
- Text Extraction:     <1.2s   (OCR worst-case)
## • Preprocessing:       <0.15s
- TF-IDF Vectors:      <0.35s
## • Cosine Similarity:   <0.02s
- DB Writes:           <0.12s
## • Overhead:            <1.14s
Throughput: 100 CVs/hour sustained (16.7/min)
Peak: 5 CVs/minute (5 concurrent)

UI Response Times (p95):
## • Dashboard Load:      <500ms
## • Candidate Detail:    <800ms
## • Similarity View:     <600ms
## • Shortlist Export:    <2s
## • Real-time Search:    <300ms

Batch Ranking (1000 CVs): <45 seconds total
Database Queries: <50ms avg (PostgreSQL indexed)
## Measurement Protocol:
Load Test: Locust.io (100 users × 60min)
CV Files: 50 real EAA resumes (mixed PDF/OCR)
Metrics: Prometheus + Grafana histograms
Alert: p95 >3s → Performance degradation
## Verification Criteria:
- 95/100 CVs process <3s ✓
- 100 CVs/hour sustained ✓
- No timeouts (30s max) ✓
Non-Compliance:
p95 >3s: Reduce max_features (5000→3000)
p95 >5s: CPU overload → Scale vertically
Throughput <80 CVs/hr: DB indexing issue

NFR-02: Scalability
Intro: System handles high-volume recruitment drives through horizontal scaling and intelligent
queue management without service interruption.
## Inputs:

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               39 |          P a g e
- Peak: 5000 CVs/day (125 CVs/hour avg)
- Concurrent Jobs: 10 active postings
- Concurrent Users: 25 recruiters + 500 candidates
- Hardware: Docker on 4-16 CPU cores
## Metrics & Targets:
## Single Node Capacity:
- CV Processing: 100 CVs/hour (1 CPU core)
- Active Jobs: 25 concurrent
- Memory: 2GB base + 25MB/CV peak
- Disk: 50GB (10k CVs × 5MB avg)

Horizontal Scaling (Docker Swarm):
- 1 Node: 100 CVs/hr
- 4 Nodes: 400 CVs/hr
- 10 Nodes: 1000 CVs/hr
- Auto-scale trigger: Queue >100 CVs

Queue Management (Redis):
- Max Depth: 10,000 pending CVs
- Priority: High-similarity first
- Letter: Failed >3 attempts
- TTL: 7 days inactive

## Graceful Degradation:
## System Load State New Applications Processing Mode User Interface
Normal Accepted Full speed Normal
High (500/hr) Accepted Queued Notice shown
Critical Paused Prioritized only Read-only

## Scaling Architecture:
Load Balancer → API Gateway → Docker Swarm
- CV Parser Workers (auto-scale 1-20)
- PostgreSQL (replicas=3)
- MongoDB (sharded)
- Redis (queue + cache)
## Measurement Protocol:
Stress Test: 5000 CVs × 10 jobs (48hr)
Monitoring: Prometheus scrape every 15s
Auto-scaling: CPU>70% → +1 worker pod
Capacity Test: 10k CVs without crash
## Verification Criteria:

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               40 |          P a g e
- 1000 CVs/job without failure ✓
- Auto-scale 1→10 nodes <5min ✓
- Queue never blocks UI ✓
- No data loss under peak load ✓
Non-Compliance:
Queue >5000: Reject new apps (temp)
Workers exhausted: Status 503 "Try later"
DB saturation: Connection pool overflow
NFR-03: Security
Intro: All candidate personally identifiable information (PII) protected through defense-in-depth
encryption, strict access controls, and compliance with Ethiopian Data Protection Proclamation
## No. 1329/2023.
## Inputs:
- Sensitive Data: Resumes (PII), Phone numbers, Scores, Demographic hints
## • Users: 25 Recruiters, 5 Admins, 5000 Candidates
- Attack Surface: API endpoints, File uploads, Database queries
## Metrics & Controls:
## Encryption Everywhere:
- At-Rest (MongoDB GridFS):
o Algorithm: AES-256-GCM
o Key Management: HashiCorp Vault (auto-rotate 90 days)
o CV Files: 100% encrypted (verified)
- In-Transit:
o HTTPS: TLS 1.3 only (no TLS 1.2)
o HSTS: 1 year max-age
o Certificate: Let's Encrypt (auto-renew)
- Session: JWT tokens (HS256, 24hr expiry)

Access Control (RBAC):
API Endpoint Recruiter Access Admin Access Candidate Access
/jobs/{id}/cv Own jobs only All jobs No access
/shortlist/export Own jobs only All jobs No access
/candidate/track No access No access Own applications
Granular SQL Enforcement Job-owned rows Superuser Application-owned rows


## Data Protection Compliance:
- Retention: 90 days post-job close (auto-purge)
- Right to Delete: Candidate request → 30 days
- Audit Logs: All access (user, IP, timestamp) → 1 year
- Anonymization: Names hashed for bias detection

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               41 |          P a g e
- No Cloud APIs: 100% local (Tesseract, scikit-learn)

## Vulnerability Management:
- Virus Scanning: ClamAV on all uploads (<1s)
- SQL Injection: SQLAlchemy ORM (parameterized)
- XSS/CSRF: React + FastAPI built-in protection
- Rate Limiting: 100 req/min per IP
- Dependency Scan: Snyk weekly (0 critical CVEs)

## Security Testing:
- Penetration Test: Quarterly (external firm)
- DAST: OWASP ZAP automated weekly
- SAST: Bandit (Python) + ESLint (React)
- Compliance Audit: Ethiopian DPP annual
## Verification Protocol:
- Encryption audit: 100 CVs → decrypt success rate 100%
- RBAC test: 50 permission combinations
- Pen test: 0 critical, <3 high severity
- Virus test: EICAR + real malware → 100% blocked
## Success Criteria:
- Zero PII breaches (year 1)
- All uploads encrypted ✓
- RBAC passes 100% ✓
- Compliance certification ✓
Non-Compliance:
Critical CVE: Emergency patch <24hr
Access violation: Immediate revoke + audit
Data breach: Full disclosure + compensation

NFR-08: Usability
Intro: Recruiter interface designed for maximum efficiency with intuitive visualizations of AI
recommendations and minimal training required.
## Inputs:
- Similarity scores (81.9%), Top skills, Candidate details
## • User Roles: Recruiters (25), Admins (5)
## • Devices: Desktop (80%), Mobile (15%), Tablet (5%)
## • Languages: English (current)

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               42 |          P a g e
## Metrics & Targets:
Decision Efficiency: <5 clicks average
- View shortlist → Decision: 2 clicks
- Detail view → Shortlist: 3 clicks
- Export → Email: 4 clicks
- New job → Publish: 5 clicks

## Similarity Score Display:
- Format: "81.9% ← ATPL(44%), Python(19%)"
- Color coding:
o Green: >80% (auto-shortlist ✓)
o Yellow: 60-80% (review)
o Red: <60% (likely reject)
- Hover tooltip: Full skill breakdown

## Mobile Responsiveness:
## • Framework: Bootstrap 5 + React Responsive
- Breakpoints: 320px phone → 1920px desktop
- Touch targets: >44px (iOS Human Guidelines)
- Swipe: Shortlist left → Reject right

Accessibility (WCAG 2.1 AA):
- Screen reader: All scores/skills announced
- Keyboard nav: Tab through decisions
- contrast mode: 4.5:1 ratio
- Color-blind friendly: Patterns + colors

## Learnability:
- Onboarding tour: 8 steps (<10 mins)
- Tooltips: All AI terms explained
- Success messages: "Shortlisted 18/100 candidates"
- Undo: Last 5 actions reversible

## Internationalization:
## • Current: English (100%)
## Measurement Protocol:

User Testing: 8 recruiters × 30min sessions
Tasks: 10 decisions, 2 exports, 1 new job
Heatmaps: CrazyEgg click tracking
NPS Survey: "How easy was this?" (target >8/10)
## Verification Criteria:
- Average 4.2 clicks/decision ✓
- 95% task success rate ✓
- Mobile pass: Chrome DevTools ✓

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               43 |          P a g e
- WCAG audit: 100% AA compliance ✓
Non-Compliance:
>6 clicks avg: UX redesign
Mobile bounce >20%: Responsive fix
NPS <7: User interviews required

NFR-09: Availability
Intro: Local Docker deployment achieves enterprise-grade uptime through health checks,
automated recovery, and robust backup strategy.
## Inputs:
- Deployment: Docker Compose (single node production)
- Services: FastAPI, PostgreSQL, MongoDB, Redis, Celery
- Hardware: Ubuntu 22.04, 16GB RAM, SSD
## Metrics & Targets:
Uptime SLA: 99.0% (43.2 minutes downtime/month max)
## Components Monitored:
- API Server: /healthz (<200ms)
- PostgreSQL: Connection pool (>10 free)
- MongoDB: Replica lag (<1s)
- Redis: Queue depth (<5000)
- Celery Workers: >80% healthy

Health Checks (30s intervals):
- Liveness: /healthz → HTTP 200
- Readiness: DB connections OK
- Critical: Queue stalled >10min → Restart

Offline Mode (Progressive Enhancement):
- Scoring: Pre-computed TF-IDF vectors cached
- Dashboard: Last-known shortlist viewable
- New CVs: Queue locally → sync when back

## Automated Backups:
- PostgreSQL: Daily pg_dump → S3 (00:00 EAT)
- MongoDB: Hourly mongodump → Local + S3
- Redis: RDB snapshot every 5min
- Retention: 30 days (7 daily + 23 weekly)
- Restore Test: Quarterly full recovery drill
- Size: 2.3GB compressed

## Recovery Objectives:

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               44 |          P a g e
- RTO (Recovery Time): <5 minutes
- RPO (Recovery Point): <1 hour data loss
- Failover: Docker restart <30s

## Monitoring Stack:
- Prometheus: Metrics collection (15s scrape)
- Grafana: Dashboards (uptime, queue depth)
- Alertmanager: Slack notifications
- PagerDuty: Critical incidents (24/7)
## Measurement Protocol:
30-day uptime test: docker stats + Prometheus
Backup verification: Weekly restore test
Load test failure injection: Kill workers → Auto-recovery
## Verification Criteria:
- 30-day uptime ≥99.0% ✓
- Backup restore success 100% ✓
- Health check pass rate 99.9% ✓
- RTO <5min verified ✓
Non-Compliance:
Uptime <98%: Root cause + capacity upgrade
Backup fail: Immediate manual backup
Health check fail >1%: Service restart


EAA Recruit
## 2025

School Of Information Technology and Engineering                                               45 |          P a g e
## 3.5 Limitations
The current prototype implementation has the following constraints that impact scope and
performance:
## Dataset Constraints:
- Synthetic EAA data only: 100 generated resumes × 5 aviation jobs (no real candidate
data)
- Limited diversity: Primarily pilot/technical roles (no cabin crew, ground staff variety)
- No longitudinal data: Cannot evaluate ranking stability over time
## Feedback & Validation Gaps:
- No real HR feedback loop: Lacks recruiter validation of shortlists
- No A/B testing: Cannot compare AI vs manual screening effectiveness
- Prototype scope: Recommendations only (human makes final hiring decisions)
## Technical Limitations:
- English-only processing: No Amharic/Afaan Oromo support (95% English CVs
assumed)
- No multimodal assessment: Video interviews, audio tests excluded
- OCR accuracy: 92% on printed text, 65% handwritten (common in Ethiopia)
- Static TF-IDF: No semantic understanding (BERT/LLM deferred)
## Operational Constraints:
- Single-node deployment: No production clustering/high availability
- Manual bias monitoring: Statistical checks only (no ML fairness training)
- No real-time collaboration: Single recruiter per job (no team review)
## 3.6 Assumptions
The system design and evaluation rely on the following assumptions about users, data, and
environment:
## User Behavior:
- Recruiters validate AI recommendations: Human override of shortlists
- Recruiters trained on system (<10min onboarding): Understand similarity scores
- Consistent decision criteria: Recruiters agree on "qualified" candidates (Kappa>0.7)
## Data Quality:

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               46 |          P a g e
- CVs contain standard sections: Skills, experience, education clearly labeled
- 80% machine-readable: PDF/DOCX vs scanned images (industry avg Ethiopia)
- Job descriptions include skills: Required competencies explicitly listed
- Representative synthetic data: Generated CVs match real EAA applicant profiles
## Technical Environment:
- Stable local infrastructure: Docker + PostgreSQL (no cloud dependency)
- Sufficient CPU:  i9 handles 100 CVs/hour (no GPU needed)
- Network reliability: LAN 100Mbps (no internet for scoring)
- File format compliance: 95% CVs follow expected structure
## Regulatory Compliance:
- Human-in-loop sufficient: AI recommendations + recruiter review = compliant
- Local processing acceptable: No cross-border data transfer issues
- 90-day retention meets requirements: Ethiopian Data Protection Proc. 1329/2023
## 3.7 Risk Mitigation
## RISK IMPACT MITIGATION
POOR OCR (HANDWRITTEN) High Manual review flag + photo upload guidance
ENGLISH-ONLY FAILURE Medium Amharic tokenizer Q2 2026
SYNTHETIC DATA BIAS High Real EAA data collection post-prototype
RECRUITER OVERRIDE Low Training + XAI explanations
INFRASTRUCTURE FAILURE High Docker health checks + backups
3.8 Scope Boundaries (Explicitly Out of Scope)
NOT IMPLEMENTED (Future Work):
- Video interview analysis
- Real-time chat screening
- Multi-language support
- Cloud deployment
- Advanced ML (BERT, fairness training)
- End-to-end hiring automation

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               47 |          P a g e
## 3.6 Design Constraints
The following constraints shall be observed during the design and implementation of EAA
## Recruit:
3.6.1 Standards Compliance The system shall comply with the Ethiopian Data Protection
Proclamation No. 1329/2023. All personal data processing, storage, and AI model deployment
shall ensure data sovereignty by using only local or offline-capable components.
3.6.2 Technology Stack Constraints The system shall be implemented exclusively using open-
source technologies to minimize licensing costs and ensure future maintainability. Permitted
technologies include:
- Frontend: React.js (or equivalent open-source framework)
- Backend: Python-based frameworks (FastAPI or Flask)
- Database: PostgreSQL (relational), MongoDB (unstructured data), Chroma or FAISS
(vector storage)
- AI/ML: Hugging Face Transformers, open-source LLMs (  Llama 3, Mistral), and fine-
tuning libraries (PEFT/LoRA) Proprietary or closed-source large language models (
GPT-4, Claude) shall not be used in production deployment.
3.6.3 Deployment Environment The system shall be designed for deployment on standard on-
premises Linux servers (Ubuntu 20.04 LTS or later) available at Addis Ababa University or
Ethiopian Airlines. Containerization using Docker and orchestration with Docker Compose (or
Kubernetes for future scaling) shall be supported. Cloud-hosted proprietary AI services that
require data transmission outside Ethiopia shall not be used.
3.6.4 Development Timeline and Resources The system shall be completed within the final-
year project timeline (December 2025 – July 2026) by a team of five undergraduate students.
Total development effort shall not exceed available student hours (approximately 2,000 person-
hours). Budget for hardware, cloud credits, or external services shall be limited to 30,000 ETB.
3.6.5 Hardware Limitations The prototype shall run on standard university laboratory hardware
(  servers with Intel Xeon or equivalent CPU, 32–64 GB RAM, NVIDIA GPU if available for
model fine-tuning). No assumption shall be made of dedicated high-performance computing
resources.
3.6.6 Accessibility and Localization All design decisions shall prioritize compatibility with
Ge'ez script rendering and right-to-left layout where needed.
3.6.7 University Policy The system shall adhere to Addis Ababa University academic integrity
policies. All code shall be original or properly attributed open-source components. The project
shall be delivered as a functional prototype with complete source code, documentation, and
demonstration materials.

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               48 |          P a g e
## 3.7 Logical Database Requirements
Yes, databases will be used. EAA Recruit shall employ a hybrid database approach to efficiently
store and retrieve structured data, unstructured documents, and vector embeddings required for
AI processing.
3.7.1 Database Types and Rationale
- Relational Database (PostgreSQL): Shall be used for all structured data requiring
ACID compliance, referential integrity, and complex queries (  users, applications,
scores, jobs).
- NoSQL Database (MongoDB): Shall be used for unstructured or semi-structured data
such as parsed CV content, interview transcripts, and audit logs where schema flexibility
is beneficial.
- Vector Database (Chroma or FAISS): Shall be used for storing embeddings generated
during semantic search, descriptive answer evaluation, and Retrieval-Augmented
Generation (RAG) in LLM processing.
## 3.7.2 Data Formats
- Text fields shall support UTF-8 encoding to accommodate English.
- Date/time fields shall be stored in ISO 8601 format (UTC).
- File references (CVs, transcripts) shall be stored as paths or binary references with
metadata (filename, MIME type, upload timestamp, size).
- Numeric scores shall be stored as DECIMAL(5,2) for precision (0.00–100.00).
- Boolean flags (  verified, active) shall use BOOLEAN type.
## 3.7.3 Storage Capabilities
- The system shall support storage of up to 50,000 candidate applications (estimated for
multiple recruitment cycles), including associated CV files (average 5 MB each),
resulting in approximately 250 GB total storage requirement.
- Vector database shall support at least 1 million embeddings (for question bank, ideal
answers, and skill synonyms).
## 3.7.4 Data Retention
- Candidate personal data and applications shall be retained for a minimum of 2 years after
the recruitment cycle ends or until explicit deletion request (in compliance with Ethiopian
data protection laws).
- Rejected applications may be anonymized after 1 year for analytics purposes.
- Audit logs shall be retained indefinitely or for at least 5 years.
3.7.5 Data Integrity and Constraints

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               49 |          P a g e
- Primary keys shall be auto-generated UUIDs or sequential integers with UNIQUE
constraints.
- Foreign key relationships shall be enforced (  applications reference users and jobs).
- NOT NULL constraints shall apply to mandatory fields (  email, application status).
- CHECK constraints shall ensure valid ranges (  scores BETWEEN 0 AND 100).
- Unique constraints on email and phone per user.
- Transactional integrity shall be maintained for multi-step operations (  application
submission + parsing queue).
3.7.6 Key Logical Entities and Relationships The main entities include:
- Users (candidate, recruiter, administrator) – attributes: user_id (PK), email, name, role,
status, created_at
- Jobs – job_id (PK), title, description, criteria_weights (JSON), status, deadline,
created_by (FK to Users)
- Applications – application_id (PK), candidate_id (FK to Users), job_id (FK to Jobs),
status, submitted_at, overall_score
- CV_Parsed_Data – parsed_id (PK), application_id (FK), extracted_json (JSONB),
initial_score
- Exams – exam_id (PK), application_id (FK), score, answers_json, completed_at
- Interviews – interview_id (PK), application_id (FK), transcript_text, score, completed_at
- Reports – report_id (PK), application_id (FK), explanation_text, generated_at
- Audit_Logs – log_id (PK), user_id (FK), action, timestamp, details
Relationships are primarily one-to-many (  one candidate has many applications; one job has
many applications) and many-to-one (  many applications reference one job).
## 3.7.7 Additional Requirements
- All sensitive fields (  personal details) shall be encrypted at rest where supported by the
database engine.
- Indexes shall be created on frequently queried fields (  application status, job_id,
overall_score) to meet performance requirements (3.4.1).
- Backup and recovery procedures shall support daily snapshots with point-in-time
recovery within 15 minutes.
This section describes the process for managing changes to this Software Requirements
Specification (SRS) during the development lifecycle of EAA Recruit.
4.1 Purpose The change management process ensures that all proposed modifications to the
approved requirements are systematically evaluated, approved, and documented to maintain
traceability, control scope, and prevent uncontrolled alterations.

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               50 |          P a g e
4.2 Change Request Submission Any stakeholder (team member, advisor, examiner, or
potential user from Ethiopian Airlines/Ethiopian Aviation Academy) may submit a change
request.
- Change requests shall be submitted in writing using the Change Request Form
(provided in Appendix A).
- The form shall include:
o Requestor name and date
o Description of the proposed change
o Rationale/justification (  examiner feedback, technical discovery, scope
clarification)
o Impact assessment (affected requirements, use cases, effort estimate, timeline)
o Priority (Critical, High, Medium, Low)
## 4.3 Change Evaluation
- All change requests shall be logged in a central repository (Google Docs shared tracker or
GitHub Issues in the project repository).
- The development team shall review the request within 5 working days of submission.
- The team shall assess:
o Feasibility within remaining timeline and resources
o Alignment with project objectives and approved proposal
o Impact on existing requirements, design, implementation, and testing
## 4.4 Approval Process
- Minor changes (  clarification, typo correction, no impact on scope/effort) may be
approved by the team lead and advisor via email or meeting minutes.
- Major changes (  new functional requirement, scope expansion, examiner-mandated
enhancements) shall require formal approval:
- Team discussion and consensus
- Advisor review and approval
- If necessary, consultation with internal/external examiners
- Approved changes shall be documented with approval signatures/dates on the Change
## Request Form.
4.5 Implementation and Documentation
- Approved changes shall be incorporated into the SRS by updating the relevant sections.
- The updated SRS shall be version-controlled:
o New version number (  v1.0 → v1.1)
o Change log added to the document (Appendix B – Revision History)
o Date and approver recorded
- Affected sections (  functional requirements, use cases, non-functional requirements)
shall be revised accordingly.

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               51 |          P a g e
- Traceability shall be maintained by cross-referencing changed requirements to the
original change request.
## 4.6 Change Rejection
- Rejected requests shall be documented with reasons and communicated to the requestor.
- Rejected changes may be reconsidered as future enhancements (  v1.2 for multi-tenancy).
4.7 Tools and Responsibilities
- Tools: Google Docs (for collaborative editing and comments), GitHub (for code-related
changes linked to requirements), shared Change Log spreadsheet.
## • Roles:
o Team members: Submit and implement changes
o Team lead (designated member): Coordinate review and logging
o Advisor (Mr. Daniel Abebe): Final approval authority
This process ensures controlled evolution of requirements while respecting the final-year project
timeline and academic guidelines.


EAA Recruit
## 2025

School Of Information Technology and Engineering                                               52 |          P a g e
## APPENDICES
A. APPENDIX 1: Change Request Form
B. APPENDIX 2: Revision History
Version Date Author/Editor Description of Changes Approved By
## 1.0 Dec 16,
## 2025
Group 18 Initial approved SRS based on
proposal
## Mr. Daniel
## Abebe


C. APPENDIX 3: Glossary
## TERM DEFINITION
CV Curriculum Vitae – document submitted by candidates detailing qualifications and
experience
LLM Large Language Model – AI model used for natural language processing and
generation
FYP Final Year Project
OCR Optical Character Recognition – technology to extract text from scanned images
XAI Explainable Artificial Intelligence – techniques providing transparent AI decision
rationale
RAG Retrieval-Augmented Generation – method combining retrieval and generation in
LLMs

EAA Recruit
## 2025

School Of Information Technology and Engineering                                               53 |          P a g e
## REFERENCES
The following documents and sources were referenced in the preparation of this Software
Requirements Specification (SRS) for EAA Recruit:
[1] Project Proposal: "EAA Recruit - AI-Powered Recruitment Automation Platform for
Ethiopian Airlines & Ethiopian Aviation Academy". Group 18, Addis Ababa University,
Department of Software Engineering. Prepared by Abdellah Teshome et al. Advisor: Mr. Daniel
Abebe. Date: December 1, 2025. Internal university document.
[2] Ethiopian Data Protection Proclamation No. 1329/2023. Federal Democratic Republic of
## Ethiopia.
[3] IEEE Std 830-1998, IEEE Recommended Practice for Software Requirements Specifications.
IEEE Computer Society, 1998.
[4] Hugging Face Documentation. "Transformers Library", "PEFT: Parameter-Efficient Fine-
Tuning", and model cards for Llama 3 and Mistral. Accessed December 2025. Available at:
https://huggingface.co/docs
[5] PostgreSQL Documentation, Version 15. The PostgreSQL Global Development Group, 2025.
Available at: https://www.postgresql.org/docs/
[6] MongoDB Documentation, Version 7.0. MongoDB, Inc., 2025. Available at:
https://www.mongodb.com/docs/
[7] Chroma Documentation. "Chroma – the AI-native open-source embedding database".
Accessed December 2025. Available at: https://www.trychroma.com/
[8] React Documentation. Meta, 2025. Available at: https://react.dev
[9] FastAPI Documentation. Sebastián Ramírez, 2025. Available at: https://fastapi.tiangolo.com
[10] Web Content Accessibility Guidelines (WCAG) 2.1. Web Accessibility Initiative, W3C,
June 2018. Available at: https://www.w3.org/TR/WCAG21/
[11] Example SRS Document: "ቤት ያፈራው (Bet Yaferaw)" Software Requirements Specification.
Prepared by Rediet Mebrat, Samra Kahsay, Zewetir Mebrat. Advisor: Miss Nuniyat. Addis
Ababa University, June 07, 2021. Used as structural and formatting reference.
