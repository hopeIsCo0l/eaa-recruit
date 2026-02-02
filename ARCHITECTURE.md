# Architecture Documentation

## System Overview

EAA Recruit is a modern web application built with a microservices architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React)                              │
│  - React Components                                              │
│  - State Management                                              │
│  - HTTP Client (Axios)                                           │
│  - Responsive UI                                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP/REST API
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                             │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    API Layer                             │   │
│  │  - Routers (recruitment.py)                             │   │
│  │  - Request/Response Schemas (Pydantic)                  │   │
│  │  - CORS Middleware                                       │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                        │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │                 Service Layer                            │   │
│  │  - RecruitmentService                                    │   │
│  │  - Business Logic                                        │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                        │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │                  Models Layer                            │   │
│  │  - RecruitmentEngine                                     │   │
│  │  - Text Preprocessor                                     │   │
│  │  - Skill Extractor (TF-IDF)                             │   │
│  │  - Similarity Scorer (Cosine)                           │   │
│  │  - Report Generator                                      │   │
│  │  - Document Parser                                       │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                        │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │              Data Layer (Future)                         │   │
│  │  - Database Configuration                                │   │
│  │  - SQLAlchemy Models (Optional)                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Folder Structure (As Required)

```
eaa-recruit/
├── backend/                # FastAPI Backend
│   ├── app/
│   │   ├── main.py        # FastAPI application entry
│   │   ├── routers/       # API endpoints
│   │   ├── models/        # Business logic and ML models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Service layer
│   │   └── database.py    # Database configuration
│   ├── requirements.txt   # Python dependencies
│   └── Dockerfile         # Backend container config
├── frontend/              # React Frontend
│   ├── src/              # React source code
│   ├── public/           # Static files
│   ├── package.json      # NPM dependencies
│   └── Dockerfile        # Frontend container config
├── docker-compose.yml    # Multi-container orchestration
├── .gitignore           # Git ignore rules
└── README.md            # Project documentation
```

## Component Details

### Backend Components

#### 1. Routers (`backend/app/routers/`)
- Handle HTTP requests and responses
- Define API endpoints
- Validate request data using Pydantic schemas
- Return appropriate HTTP status codes

#### 2. Schemas (`backend/app/schemas/`)
- Define request/response data structures
- Pydantic models for automatic validation
- Type hints for better IDE support
- Documentation generation for API

#### 3. Services (`backend/app/services/`)
- Business logic layer
- Orchestrates between routers and models
- Handles complex operations
- Maintains separation of concerns

#### 4. Models (`backend/app/models/`)
- Core ML and business logic
- RecruitmentEngine: Main orchestrator
- Text preprocessing utilities
- TF-IDF skill extraction
- Cosine similarity scoring
- Report generation

#### 5. Database (`backend/app/database.py`)
- Database configuration (future use)
- SQLAlchemy setup (optional)
- Connection management

### Frontend Components

#### 1. Components (`frontend/src/`)
- React functional components
- State management with hooks
- Event handlers
- API communication

#### 2. Styling (`frontend/src/*.css`)
- Modern CSS with flexbox/grid
- Responsive design
- Gradient backgrounds
- Consistent theming

#### 3. Public Assets (`frontend/public/`)
- HTML template
- Static assets
- Favicon (optional)

## API Endpoints

### Public Endpoints
- `GET /` - API information
- `GET /health` - Health check

### API Endpoints (prefix: `/api`)
- `GET /api/health` - Service health check
- `POST /api/upload-job` - Upload job description
  - Accepts: multipart/form-data with file
  - Returns: Processing status
- `POST /api/upload-resumes` - Upload and rank resumes
  - Accepts: multipart/form-data with multiple files
  - Returns: Ranking report with scores and terms

### Documentation
- `GET /docs` - Swagger UI (interactive API docs)
- `GET /redoc` - ReDoc (alternative API docs)

## Data Flow

### Job Description Upload
```
1. User uploads file → Frontend
2. Frontend sends file → Backend API (/api/upload-job)
3. Backend parses document → Extract text
4. Text preprocessing → Clean, tokenize, stem
5. Store preprocessed text → In-memory
6. Return success → Frontend
```

### Resume Ranking
```
1. User uploads resumes → Frontend
2. Frontend sends files → Backend API (/api/upload-resumes)
3. Backend parses each resume → Extract text
4. Text preprocessing → Clean, tokenize, stem
5. TF-IDF vectorization → Create feature vectors
6. Cosine similarity → Calculate scores
7. Rank candidates → Sort by scores
8. Generate report → Extract top terms
9. Return results → Frontend
10. Frontend displays → Ranked list with explanations
```

## Machine Learning Pipeline

### 1. Text Preprocessing
```python
Input: Raw text
↓
Lowercase conversion
↓
URL/Email removal
↓
Special character removal
↓
Tokenization (NLTK)
↓
Stopword removal
↓
Porter Stemming
↓
Output: Clean tokens
```

### 2. Feature Extraction (TF-IDF)
```python
Input: Preprocessed text
↓
Create corpus (job + all resumes)
↓
TF-IDF Vectorization
- Unigrams and Bigrams
- Max 100 features
↓
Output: Sparse matrix
```

### 3. Similarity Scoring
```python
Input: TF-IDF vectors
↓
Extract job vector
↓
Extract resume vectors
↓
Calculate Cosine Similarity
↓
Output: Similarity scores (0-1)
```

### 4. Report Generation
```python
Input: Scores + Vectors
↓
Sort candidates by score
↓
Extract top terms per candidate
↓
Format as JSON/Text
↓
Output: Detailed report
```

## Deployment Architecture

### Development
```
┌─────────────┐
│  Developer  │
└──────┬──────┘
       │
       ├─→ npm start (Frontend: 3000)
       └─→ uvicorn (Backend: 8000)
```

### Docker Compose
```
┌──────────────────┐
│  Docker Compose  │
└────┬─────────┬───┘
     │         │
     ▼         ▼
┌─────────┐ ┌──────────┐
│ Frontend│ │ Backend  │
│  :80    │ │  :8000   │
└─────────┘ └──────────┘
```

### Production (Future)
```
┌──────────────┐
│    Load      │
│  Balancer    │
└──────┬───────┘
       │
       ├─→ Frontend Instances
       │   (React static files)
       │
       └─→ Backend Instances
           (FastAPI workers)
```

## Security Considerations

1. **Input Validation**
   - File type checking
   - File size limits
   - Pydantic schema validation

2. **CORS Configuration**
   - Configurable origins
   - Credentials handling

3. **Error Handling**
   - Try-catch blocks
   - Appropriate HTTP status codes
   - No sensitive data in errors

4. **Dependencies**
   - Regular updates
   - Vulnerability scanning
   - Version pinning

## Future Enhancements

1. **Database Integration**
   - PostgreSQL for persistent storage
   - Job and candidate history
   - User management

2. **Authentication**
   - JWT tokens
   - Role-based access
   - OAuth2 integration

3. **Advanced Features**
   - Real-time updates (WebSockets)
   - Batch processing
   - Analytics dashboard
   - Export functionality

4. **Scalability**
   - Redis for caching
   - Message queue (Celery)
   - Horizontal scaling
   - CDN for frontend

## Development Guidelines

### Backend
- Follow FastAPI best practices
- Use type hints everywhere
- Write Pydantic schemas for all data
- Keep routers thin, logic in services
- Document all endpoints

### Frontend
- Use functional components
- Keep components small and focused
- Handle loading and error states
- Provide user feedback
- Make it responsive

### Testing
- Unit tests for models
- Integration tests for API
- E2E tests for critical flows
- Test error scenarios

## Monitoring & Logging

### Development
- Console logs
- FastAPI debug mode
- React DevTools

### Production (Future)
- Structured logging
- APM tools (New Relic, DataDog)
- Error tracking (Sentry)
- Metrics (Prometheus)

---

This architecture provides a solid foundation for the EAA Recruit platform with clear separation of concerns, scalability, and maintainability.
