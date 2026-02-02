# 🛫 EAA Recruit

AI-Powered Recruitment Automation Platform for Ethiopian Airlines and Ethiopian Aviation Academy

**Final Year Project - Addis Ababa University, Software Engineering**

## 📋 Overview

EAA Recruit is an AI-powered platform designed to automate high-volume recruitment for Ethiopian Airlines. The system leverages machine learning techniques to objectively rank candidates based on their resumes against job descriptions, providing explainable results.

### Key Features

- **📄 Document Processing**: Supports PDF, DOCX, and TXT formats for job descriptions and resumes
- **🔤 Text Preprocessing**: Advanced text cleaning, tokenization, stopword removal, and stemming
- **🎯 Skill Extraction**: TF-IDF (Term Frequency-Inverse Document Frequency) based skill extraction
- **📊 Similarity Scoring**: Cosine Similarity for objective candidate ranking
- **📈 Explainable Results**: Detailed reports with top matching terms for each candidate
- **🌐 Web Interface**: User-friendly Flask-based web application
- **💻 CLI Tool**: Command-line interface for batch processing

## 🏗️ Architecture

The system consists of several key components:

1. **Text Preprocessor**: Cleans and normalizes text data
2. **Skill Extractor**: Extracts relevant skills and terms using TF-IDF
3. **Similarity Scorer**: Calculates cosine similarity between job descriptions and resumes
4. **Report Generator**: Creates comprehensive, explainable ranking reports
5. **Document Parser**: Handles multiple document formats (PDF, DOCX, TXT)
6. **Recruitment Engine**: Orchestrates the entire recruitment process

## 🚀 Installation

### Prerequisites

- Python 3.8 or higher
- pip package manager

### Setup

1. Clone the repository:
```bash
git clone https://github.com/hopeIsCo0l/eaa-recruit.git
cd eaa-recruit
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Download required NLTK data (automatically done on first run):
```python
import nltk
nltk.download('punkt')
nltk.download('stopwords')
```

## 📖 Usage

### Web Application

1. Start the Flask server:
```bash
python -m app.main
```

2. Open your browser and navigate to:
```
http://localhost:5000
```

3. Follow the web interface:
   - **Step 1**: Upload a job description file (PDF, DOCX, or TXT)
   - **Step 2**: Upload candidate resume files (multiple files supported)
   - **View Results**: See ranked candidates with match scores and top matching terms

### Command-Line Interface

For batch processing or automation:

```bash
python cli.py --job data/job_description.txt \
              --resumes data/resume_candidate1.txt data/resume_candidate2.txt data/resume_candidate3.txt \
              --output ranking_report.json \
              --text-output ranking_report.txt
```

### Python API

You can also use the recruitment engine programmatically:

```python
from app.models.recruitment_engine import RecruitmentEngine

# Initialize engine
engine = RecruitmentEngine()

# Process job description
job_text = "Your job description here..."
engine.process_job_description(job_text)

# Prepare resumes
resumes = [
    {'id': 'candidate1.pdf', 'text': 'Resume text...'},
    {'id': 'candidate2.pdf', 'text': 'Resume text...'},
]

# Rank candidates
result = engine.rank_candidates(resumes)
print(result['text_report'])
```

## 🧪 Testing

Run the test suite:

```bash
python -m pytest tests/
```

Or using unittest:

```bash
python -m unittest discover tests
```

## 📊 Sample Data

The repository includes sample data in the `data/` directory:

- `job_description.txt`: Sample job posting for a Senior Python Developer
- `resume_candidate1.txt`: Highly relevant candidate (Python + ML experience)
- `resume_candidate2.txt`: Less relevant candidate (Java developer)
- `resume_candidate3.txt`: Moderately relevant candidate (Data Science background)

Test with sample data:

```bash
python cli.py --job data/job_description.txt \
              --resumes data/resume_candidate*.txt
```

## 🔧 Technical Details

### Machine Learning Techniques

1. **TF-IDF (Term Frequency-Inverse Document Frequency)**
   - Extracts important terms from documents
   - Weighs terms by their frequency and uniqueness
   - Captures both single words and bi-grams (two-word phrases)

2. **Cosine Similarity**
   - Measures similarity between job descriptions and resumes
   - Produces scores between 0 (no match) and 1 (perfect match)
   - Language-agnostic and efficient

3. **Text Preprocessing**
   - Lowercasing and normalization
   - Removal of stopwords (common words like "the", "is", etc.)
   - Stemming to reduce words to their root form
   - Special character and URL removal

### Project Structure

```
eaa-recruit/
├── app/
│   ├── models/
│   │   └── recruitment_engine.py    # Main orchestration engine
│   ├── utils/
│   │   ├── text_preprocessor.py     # Text cleaning and normalization
│   │   ├── skill_extractor.py       # TF-IDF skill extraction
│   │   ├── similarity_scorer.py     # Cosine similarity calculation
│   │   ├── report_generator.py      # Report generation
│   │   └── document_parser.py       # File parsing (PDF, DOCX, TXT)
│   ├── templates/
│   │   └── index.html               # Web interface
│   └── main.py                      # Flask application
├── tests/
│   └── test_recruitment_engine.py   # Unit tests
├── data/
│   ├── job_description.txt          # Sample job description
│   └── resume_candidate*.txt        # Sample resumes
├── cli.py                           # Command-line interface
├── requirements.txt                 # Python dependencies
└── README.md                        # This file
```

## 🎯 Features in Detail

### Explainable AI

The system provides transparency through:
- **Similarity Scores**: Numerical scores showing how well each candidate matches
- **Top Matching Terms**: The specific skills/terms that led to the ranking
- **Relevance Weights**: TF-IDF scores showing term importance

### Scalability

- Processes multiple resumes simultaneously
- Efficient sparse matrix operations
- Suitable for high-volume recruitment scenarios

### Flexibility

- Multiple document format support (PDF, DOCX, TXT)
- Configurable parameters (max features, n-gram ranges)
- Both web interface and CLI for different use cases

## 🤝 Contributing

This is a final year project. Contributions, issues, and feature requests are welcome!

## 📝 License

This project is developed as part of academic requirements at Addis Ababa University.

## 👥 Authors

- Final Year Software Engineering Students
- Addis Ababa University

## 🙏 Acknowledgments

- Ethiopian Airlines Group
- Ethiopian Aviation Academy
- Addis Ababa University, Faculty of Software Engineering
- All instructors and advisors who supported this project

## 📧 Contact

For questions or feedback about this project, please contact the development team through the university.
