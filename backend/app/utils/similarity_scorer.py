"""
Similarity scoring using Cosine Similarity.
"""
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


class SimilarityScorer:
    """Calculate similarity scores between job descriptions and resumes."""
    
    def calculate_similarity(self, job_vector, resume_vectors):
        """
        Calculate cosine similarity between job description and resumes.
        
        Args:
            job_vector (array): TF-IDF vector for job description
            resume_vectors (array): TF-IDF vectors for resumes
            
        Returns:
            numpy.array: Similarity scores for each resume
        """
        # Calculate cosine similarity
        similarities = cosine_similarity(job_vector, resume_vectors)
        
        # Flatten to 1D array
        return similarities.flatten()
    
    def rank_candidates(self, similarities, candidate_ids):
        """
        Rank candidates based on similarity scores.
        
        Args:
            similarities (array): Similarity scores
            candidate_ids (list): List of candidate identifiers
            
        Returns:
            list: List of tuples (candidate_id, score) sorted by score
        """
        # Create list of (id, score) tuples
        ranked = list(zip(candidate_ids, similarities))
        
        # Sort by score in descending order
        ranked.sort(key=lambda x: x[1], reverse=True)
        
        return ranked
    
    def get_top_candidates(self, similarities, candidate_ids, top_n=10):
        """
        Get top N candidates based on similarity scores.
        
        Args:
            similarities (array): Similarity scores
            candidate_ids (list): List of candidate identifiers
            top_n (int): Number of top candidates to return
            
        Returns:
            list: List of tuples (candidate_id, score)
        """
        ranked = self.rank_candidates(similarities, candidate_ids)
        return ranked[:top_n]
