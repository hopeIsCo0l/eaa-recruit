"""
Main recruitment engine that orchestrates the entire recruitment process.
"""
from app.utils.text_preprocessor import TextPreprocessor
from app.utils.skill_extractor import SkillExtractor
from app.utils.similarity_scorer import SimilarityScorer
from app.utils.report_generator import ReportGenerator
from app.utils.document_parser import DocumentParser


class RecruitmentEngine:
    """Main engine for AI-powered recruitment automation."""
    
    def __init__(self):
        """Initialize the recruitment engine with all necessary components."""
        self.preprocessor = TextPreprocessor()
        self.skill_extractor = SkillExtractor(max_features=100, ngram_range=(1, 2))
        self.similarity_scorer = SimilarityScorer()
        self.report_generator = ReportGenerator()
        self.document_parser = DocumentParser()
        
        self.job_description = None
        self.job_vector = None
        self.preprocessed_job = None
    
    def process_job_description(self, job_text):
        """
        Process and store job description.
        
        Args:
            job_text (str): Raw job description text
            
        Returns:
            dict: Processing result
        """
        # Preprocess the job description
        self.preprocessed_job = self.preprocessor.preprocess(job_text)
        self.job_description = job_text
        
        return {
            'status': 'success',
            'message': 'Job description processed successfully',
            'preprocessed_length': len(self.preprocessed_job)
        }
    
    def rank_candidates(self, resumes):
        """
        Rank candidates based on their resumes against the job description.
        
        Args:
            resumes (list): List of dictionaries with 'id' and 'text' keys
            
        Returns:
            dict: Ranking results with report
        """
        if not self.preprocessed_job:
            raise ValueError("Job description must be processed first")
        
        if not resumes:
            raise ValueError("No resumes provided")
        
        # Preprocess all resumes
        candidate_ids = [resume['id'] for resume in resumes]
        preprocessed_resumes = [
            self.preprocessor.preprocess(resume['text']) 
            for resume in resumes
        ]
        
        # Create corpus with job description and all resumes
        corpus = [self.preprocessed_job] + preprocessed_resumes
        
        # Fit TF-IDF vectorizer and transform all documents
        tfidf_matrix = self.skill_extractor.fit_transform(corpus)
        
        # Separate job vector from resume vectors
        self.job_vector = tfidf_matrix[0:1]  # Keep as 2D array
        resume_vectors = tfidf_matrix[1:]
        
        # Calculate similarities
        similarities = self.similarity_scorer.calculate_similarity(
            self.job_vector, resume_vectors
        )
        
        # Rank candidates
        ranked_candidates = self.similarity_scorer.rank_candidates(
            similarities, candidate_ids
        )
        
        # Extract top matching terms for each candidate
        candidate_terms = {}
        for i, candidate_id in enumerate(candidate_ids):
            resume_vector = resume_vectors[i]
            top_terms = self.skill_extractor.get_top_terms(resume_vector, top_n=10)
            candidate_terms[candidate_id] = top_terms
        
        # Generate comprehensive report
        report = self.report_generator.generate_ranking_report(
            job_description_summary=self.job_description[:200],
            ranked_candidates=ranked_candidates,
            candidate_terms=candidate_terms
        )
        
        return {
            'status': 'success',
            'report': report,
            'text_report': self.report_generator.format_report_text(report)
        }
    
    def parse_document(self, file_content, filename):
        """
        Parse a document file.
        
        Args:
            file_content (bytes): File content
            filename (str): Name of the file
            
        Returns:
            str: Extracted text
        """
        return self.document_parser.parse(file_content, filename)
