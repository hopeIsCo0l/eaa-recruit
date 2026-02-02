"""
Unit tests for the recruitment engine components.
"""
import unittest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.text_preprocessor import TextPreprocessor
from app.utils.skill_extractor import SkillExtractor
from app.utils.similarity_scorer import SimilarityScorer
from app.utils.report_generator import ReportGenerator
from app.models.recruitment_engine import RecruitmentEngine


class TestTextPreprocessor(unittest.TestCase):
    """Test text preprocessing functionality."""
    
    def setUp(self):
        self.preprocessor = TextPreprocessor()
    
    def test_clean_text(self):
        """Test text cleaning."""
        text = "Hello! This is a TEST with numbers 123 and special chars @#$%"
        cleaned = self.preprocessor.clean_text(text)
        
        # Should be lowercase and remove special chars
        self.assertNotIn('!', cleaned)
        self.assertNotIn('123', cleaned)
        self.assertNotIn('@', cleaned)
        self.assertTrue(cleaned.islower() or not cleaned.isalpha())
    
    def test_tokenize(self):
        """Test tokenization."""
        text = "Python programming machine learning"
        tokens = self.preprocessor.tokenize(text)
        
        self.assertEqual(len(tokens), 4)
        self.assertIn('Python', tokens)
        self.assertIn('programming', tokens)
    
    def test_remove_stopwords(self):
        """Test stopword removal."""
        tokens = ['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog']
        filtered = self.preprocessor.remove_stopwords(tokens)
        
        # Common stopwords should be removed
        self.assertNotIn('the', filtered)
        self.assertNotIn('over', filtered)
        
        # Content words should remain
        self.assertIn('quick', filtered)
        self.assertIn('brown', filtered)
    
    def test_preprocess_pipeline(self):
        """Test complete preprocessing pipeline."""
        text = "I am a Python developer with 5 years of experience!"
        processed = self.preprocessor.preprocess(text)
        
        # Should return a non-empty string
        self.assertIsInstance(processed, str)
        self.assertGreater(len(processed), 0)


class TestSkillExtractor(unittest.TestCase):
    """Test skill extraction functionality."""
    
    def setUp(self):
        self.extractor = SkillExtractor(max_features=50, ngram_range=(1, 2))
    
    def test_fit_transform(self):
        """Test fitting and transforming documents."""
        documents = [
            "python programming machine learning",
            "java development web services",
            "data science python analytics"
        ]
        
        matrix = self.extractor.fit_transform(documents)
        
        # Should return a matrix with correct shape
        self.assertEqual(matrix.shape[0], 3)
        self.assertGreater(matrix.shape[1], 0)
    
    def test_get_top_terms(self):
        """Test extracting top terms."""
        documents = [
            "python python python programming",
            "java development"
        ]
        
        matrix = self.extractor.fit_transform(documents)
        top_terms = self.extractor.get_top_terms(matrix[0], top_n=3)
        
        # Should return list of tuples
        self.assertIsInstance(top_terms, list)
        if top_terms:
            self.assertIsInstance(top_terms[0], tuple)
            self.assertEqual(len(top_terms[0]), 2)


class TestSimilarityScorer(unittest.TestCase):
    """Test similarity scoring functionality."""
    
    def setUp(self):
        self.scorer = SimilarityScorer()
        self.extractor = SkillExtractor(max_features=50)
    
    def test_calculate_similarity(self):
        """Test cosine similarity calculation."""
        documents = [
            "python machine learning data science",
            "python programming development",
            "java enterprise applications"
        ]
        
        matrix = self.extractor.fit_transform(documents)
        job_vector = matrix[0:1]
        resume_vectors = matrix[1:]
        
        similarities = self.scorer.calculate_similarity(job_vector, resume_vectors)
        
        # Should return similarity scores
        self.assertEqual(len(similarities), 2)
        
        # Scores should be between 0 and 1
        for score in similarities:
            self.assertGreaterEqual(score, 0.0)
            self.assertLessEqual(score, 1.0)
    
    def test_rank_candidates(self):
        """Test candidate ranking."""
        similarities = [0.8, 0.5, 0.9, 0.3]
        candidate_ids = ['candidate1', 'candidate2', 'candidate3', 'candidate4']
        
        ranked = self.scorer.rank_candidates(similarities, candidate_ids)
        
        # Should be sorted in descending order
        self.assertEqual(len(ranked), 4)
        self.assertEqual(ranked[0][0], 'candidate3')  # Highest score
        self.assertEqual(ranked[-1][0], 'candidate4')  # Lowest score
        
        # Scores should be in descending order
        for i in range(len(ranked) - 1):
            self.assertGreaterEqual(ranked[i][1], ranked[i + 1][1])
    
    def test_get_top_candidates(self):
        """Test getting top N candidates."""
        similarities = [0.8, 0.5, 0.9, 0.3, 0.7]
        candidate_ids = ['c1', 'c2', 'c3', 'c4', 'c5']
        
        top_3 = self.scorer.get_top_candidates(similarities, candidate_ids, top_n=3)
        
        self.assertEqual(len(top_3), 3)
        self.assertEqual(top_3[0][0], 'c3')  # Highest score


class TestReportGenerator(unittest.TestCase):
    """Test report generation functionality."""
    
    def setUp(self):
        self.generator = ReportGenerator()
    
    def test_generate_candidate_report(self):
        """Test generating a single candidate report."""
        top_terms = [('python', 0.8), ('machine learning', 0.7), ('data', 0.6)]
        
        report = self.generator.generate_candidate_report(
            candidate_id='candidate1',
            score=0.85,
            top_matching_terms=top_terms,
            rank=1
        )
        
        self.assertEqual(report['candidate_id'], 'candidate1')
        self.assertEqual(report['rank'], 1)
        self.assertAlmostEqual(report['similarity_score'], 0.85, places=2)
        self.assertEqual(len(report['top_matching_terms']), 3)
    
    def test_generate_ranking_report(self):
        """Test generating comprehensive ranking report."""
        ranked_candidates = [
            ('candidate1', 0.9),
            ('candidate2', 0.7)
        ]
        
        candidate_terms = {
            'candidate1': [('python', 0.8), ('ml', 0.7)],
            'candidate2': [('java', 0.6), ('spring', 0.5)]
        }
        
        report = self.generator.generate_ranking_report(
            job_description_summary="Python developer position",
            ranked_candidates=ranked_candidates,
            candidate_terms=candidate_terms
        )
        
        self.assertEqual(report['total_candidates'], 2)
        self.assertEqual(len(report['candidates']), 2)
        self.assertEqual(report['candidates'][0]['rank'], 1)
        self.assertEqual(report['candidates'][1]['rank'], 2)
    
    def test_format_report_text(self):
        """Test text formatting of report."""
        report = {
            'timestamp': '2024-01-01T00:00:00',
            'total_candidates': 1,
            'job_description_summary': 'Test job description',
            'candidates': [
                {
                    'candidate_id': 'test.pdf',
                    'rank': 1,
                    'similarity_score': 0.85,
                    'match_percentage': 85.0,
                    'top_matching_terms': [
                        {'term': 'python', 'relevance': 0.8}
                    ]
                }
            ]
        }
        
        text = self.generator.format_report_text(report)
        
        self.assertIn('EAA RECRUIT', text)
        self.assertIn('Rank #1', text)
        self.assertIn('test.pdf', text)
        self.assertIn('85.00%', text)


class TestRecruitmentEngine(unittest.TestCase):
    """Test the main recruitment engine."""
    
    def setUp(self):
        self.engine = RecruitmentEngine()
    
    def test_process_job_description(self):
        """Test job description processing."""
        job_text = "We are looking for a Python developer with machine learning experience."
        
        result = self.engine.process_job_description(job_text)
        
        self.assertEqual(result['status'], 'success')
        self.assertIsNotNone(self.engine.preprocessed_job)
        self.assertGreater(result['preprocessed_length'], 0)
    
    def test_rank_candidates(self):
        """Test candidate ranking."""
        # Process job description first
        job_text = "Python developer with machine learning and data science experience required."
        self.engine.process_job_description(job_text)
        
        # Create test resumes
        resumes = [
            {
                'id': 'candidate1.pdf',
                'text': 'Experienced Python developer with 5 years in machine learning and data science projects.'
            },
            {
                'id': 'candidate2.pdf',
                'text': 'Java developer with experience in enterprise applications and Spring framework.'
            },
            {
                'id': 'candidate3.pdf',
                'text': 'Python programmer with basic machine learning knowledge and analytics background.'
            }
        ]
        
        result = self.engine.rank_candidates(resumes)
        
        self.assertEqual(result['status'], 'success')
        self.assertIn('report', result)
        self.assertIn('text_report', result)
        
        report = result['report']
        self.assertEqual(report['total_candidates'], 3)
        self.assertEqual(len(report['candidates']), 3)
        
        # First candidate should have higher score (more relevant)
        self.assertGreater(
            report['candidates'][0]['similarity_score'],
            report['candidates'][2]['similarity_score']
        )
    
    def test_rank_without_job_description(self):
        """Test that ranking fails without job description."""
        resumes = [
            {'id': 'test.pdf', 'text': 'Test resume'}
        ]
        
        with self.assertRaises(ValueError):
            self.engine.rank_candidates(resumes)


if __name__ == '__main__':
    unittest.main()
