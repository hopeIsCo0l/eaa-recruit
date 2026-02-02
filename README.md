#  EAA Recruit

AI-Powered Recruitment Automation Platform for Ethiopian Airlines and Ethiopian Aviation Academy

**Final Year Project - Addis Ababa University, Software Engineering**

##  Overview

EAA Recruit is an AI-powered platform designed to automate high-volume recruitment for Ethiopian Airlines. The system leverages machine learning techniques to objectively rank candidates based on their resumes against job descriptions, providing explainable results.

### Key Features

- **Document Processing**: Supports PDF, DOCX, and TXT formats for job descriptions and resumes
- **Text Preprocessing**: Advanced text cleaning, tokenization, stopword removal, and stemming
- **Skill Extraction**: TF-IDF (Term Frequency-Inverse Document Frequency) based skill extraction
- **Similarity Scoring**: Cosine Similarity for objective candidate ranking
- **Explainable Results**: Detailed reports with top matching terms for each candidate
- **Modern Web Interface**: React-based frontend with FastAPI backend
- **Docker Support**: Containerized deployment with Docker Compose

##  Architecture

### Project Structure

```
eaa-recruit/
├── backend/                # FastAPI Backend
│   ├── app/
│   │   ├── main.py        # FastAPI application entry point
│   │   ├── routers/       # API route handlers
│   │   ├── models/        # Business logic models
│   │   ├── schemas/       # Pydantic schemas for validation
│   │   ├── services/      # Service layer
│   │   └── database.py    # Database configuration
│   ├── requirements.txt   # Python dependencies
│   └── Dockerfile         # Backend Docker configuration
├── frontend/              # React Frontend
│   ├── src/              # React source code
│   ├── public/           # Static assets
│   ├── package.json      # Node.js dependencies
│   └── Dockerfile        # Frontend Docker configuration
├── docker-compose.yml    # Docker Compose configuration
├── .gitignore
└── README.md
```

### Technology Stack

**Backend:**
- FastAPI - Modern Python web framework
- scikit-learn - Machine learning (TF-IDF, Cosine Similarity)
- NLTK - Natural language processing
- Pydantic - Data validation
- Uvicorn - ASGI server

**Frontend:**
- React - JavaScript library for building UI
- Axios - HTTP client for API calls
- CSS3 - Modern styling

**Deployment:**
- Docker - Containerization
- Docker Compose - Multi-container orchestration

##  Getting Started

### Prerequisites

- Docker and Docker Compose (recommended)
- OR
- Python 3.11+ (for backend development)
- Node.js 18+ (for frontend development)

### Option 1: Using Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/hopeIsCo0l/eaa-recruit.git
cd eaa-recruit
```

2. Build and start the containers:
```bash
docker-compose up --build
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Option 2: Manual Setup

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Download NLTK data:
```python
python -c "import nltk; nltk.download('punkt_tab'); nltk.download('stopwords')"
```

5. Run the backend:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create .env file:
```bash
echo "REACT_APP_API_URL=http://localhost:8000/api" > .env
```

4. Start development server:
```bash
npm start
```

The application will open at http://localhost:3000

##  Usage

### Web Interface

1. **Upload Job Description**: 
   - Click on the job description upload area
   - Select a PDF, DOCX, or TXT file containing the job requirements
   - Click "Process Job Description"

2. **Upload Candidate Resumes**:
   - After job description is processed, upload multiple resume files
   - Supported formats: PDF, DOCX, TXT
   - Click "Rank Candidates"

3. **View Results**:
   - See ranked candidates with match percentages
   - View top matching terms for each candidate
   - Understand why candidates were ranked in that order

### API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `POST /api/upload-job` - Upload job description
- `POST /api/upload-resumes` - Upload and rank resumes
- `GET /docs` - Interactive API documentation (Swagger UI)

##  Technical Details

### Machine Learning Pipeline

1. **Text Preprocessing**:
   - Lowercasing and normalization
   - Special character and URL removal
   - Tokenization using NLTK
   - Stopword removal
   - Porter Stemming

2. **Feature Extraction**:
   - TF-IDF vectorization
   - Unigrams and bigrams (1-2 word phrases)
   - Maximum 100 features
   - Captures skill terms and phrases

3. **Similarity Scoring**:
   - Cosine similarity between job and resume vectors
   - Scores range from 0 (no match) to 1 (perfect match)
   - Converted to percentages for readability

4. **Ranking & Reporting**:
   - Candidates sorted by similarity score
   - Top matching terms extracted for each candidate
   - Detailed reports with explanations

##  Security

- File type validation
- File size limits (16MB max)
- Secure filename handling
- No sensitive data storage
- Environment-based configuration
- CORS configuration for production
- All dependencies up-to-date and vulnerability-free

See [SECURITY.md](SECURITY.md) for detailed security information.

##  Development

### Running Tests

```bash
cd backend
python -m pytest tests/
```

### API Development

The FastAPI backend includes:
- Automatic API documentation at `/docs`
- Request/response validation with Pydantic
- Type hints throughout
- Modular router structure

### Frontend Development

The React frontend uses:
- Functional components with hooks
- Axios for API communication
- Modern CSS with flexbox/grid
- Responsive design

##  Deployment

### Production Deployment with Docker

1. Update docker-compose.yml for production:
   - Set appropriate CORS origins
   - Use production API URLs
   - Configure environment variables

2. Build and deploy:
```bash
docker-compose -f docker-compose.yml up -d
```

### Environment Variables

**Backend:**
- `PYTHONUNBUFFERED=1` - Python output buffering

**Frontend:**
- `REACT_APP_API_URL` - Backend API URL

##  Contributing

This is a final year project. Contributions, issues, and feature requests are welcome!

##  License

This project is developed as part of academic requirements at Addis Ababa University.

##  Authors

- Final Year Software Engineering Students
   Abdellah Teshome
   Abdurezak Zeynu
   Biniyam Dagne
   Rehobot Melaku
   Yared Yirgalem

- Addis Ababa University

##  Acknowledgments

- Ethiopian Airlines Group
- Ethiopian Aviation Academy
- Addis Ababa University, Faculty of Software Engineering
- Our Afvisor Mr. Daniel Abebe

##  Contact

For questions or feedback about this project, please contact the development team through the university.

---

**Built with  for Ethiopian Airlines**
