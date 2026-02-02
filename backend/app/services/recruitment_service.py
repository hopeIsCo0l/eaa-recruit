"""
Recruitment service layer.
"""
from app.models.recruitment_engine import RecruitmentEngine


class RecruitmentService:
    """Service for handling recruitment operations."""
    
    def __init__(self):
        """Initialize the recruitment service."""
        self.engine = RecruitmentEngine()
    
    def process_job_description(self, job_text: str) -> dict:
        """
        Process job description.
        
        Args:
            job_text: Raw job description text
            
        Returns:
            Processing result dictionary
        """
        return self.engine.process_job_description(job_text)
    
    def rank_candidates(self, resumes: list) -> dict:
        """
        Rank candidates based on resumes.
        
        Args:
            resumes: List of resume dictionaries with 'id' and 'text' keys
            
        Returns:
            Ranking results with report
        """
        return self.engine.rank_candidates(resumes)
    
    def parse_document(self, file_content: bytes, filename: str) -> str:
        """
        Parse document file.
        
        Args:
            file_content: File content bytes
            filename: Name of the file
            
        Returns:
            Extracted text
        """
        return self.engine.parse_document(file_content, filename)


# Global service instance
recruitment_service = RecruitmentService()
