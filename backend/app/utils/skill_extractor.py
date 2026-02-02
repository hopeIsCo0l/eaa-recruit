"""
Skill extraction using TF-IDF (Term Frequency-Inverse Document Frequency).
"""
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np


class SkillExtractor:
    """Extract and analyze skills using TF-IDF."""
    
    def __init__(self, max_features=100, ngram_range=(1, 2)):
        """
        Initialize the skill extractor.
        
        Args:
            max_features (int): Maximum number of features to extract
            ngram_range (tuple): Range of n-grams to consider
        """
        self.vectorizer = TfidfVectorizer(
            max_features=max_features,
            ngram_range=ngram_range,
            lowercase=True,
            strip_accents='ascii'
        )
        self.feature_names = None
        self.tfidf_matrix = None
    
    def fit_transform(self, documents):
        """
        Fit the vectorizer and transform documents.
        
        Args:
            documents (list): List of preprocessed text documents
            
        Returns:
            scipy.sparse.matrix: TF-IDF matrix
        """
        self.tfidf_matrix = self.vectorizer.fit_transform(documents)
        self.feature_names = self.vectorizer.get_feature_names_out()
        return self.tfidf_matrix
    
    def transform(self, documents):
        """
        Transform documents using fitted vectorizer.
        
        Args:
            documents (list): List of preprocessed text documents
            
        Returns:
            scipy.sparse.matrix: TF-IDF matrix
        """
        return self.vectorizer.transform(documents)
    
    def get_top_terms(self, document_vector, top_n=10):
        """
        Get top N terms from a document vector.
        
        Args:
            document_vector (array): TF-IDF vector for a document
            top_n (int): Number of top terms to return
            
        Returns:
            list: List of tuples (term, score)
        """
        # Convert sparse matrix to dense if needed
        if hasattr(document_vector, 'toarray'):
            document_vector = document_vector.toarray().flatten()
        
        # Get indices of top N scores
        top_indices = np.argsort(document_vector)[-top_n:][::-1]
        
        # Get terms and scores
        top_terms = [(self.feature_names[i], document_vector[i]) 
                     for i in top_indices if document_vector[i] > 0]
        
        return top_terms
    
    def extract_skills(self, text, top_n=10):
        """
        Extract top skills from a single text.
        
        Args:
            text (str): Preprocessed text
            top_n (int): Number of top skills to extract
            
        Returns:
            list: List of tuples (skill, score)
        """
        # Transform the text
        vector = self.vectorizer.transform([text])
        
        # Get top terms
        return self.get_top_terms(vector, top_n)
