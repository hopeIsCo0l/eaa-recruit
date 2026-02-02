"""
Report generator for explainable recruitment results.
"""
from datetime import datetime


class ReportGenerator:
    """Generate explainable reports for candidate rankings."""
    
    def generate_candidate_report(self, candidate_id, score, top_matching_terms, rank=None):
        """
        Generate a report for a single candidate.
        
        Args:
            candidate_id (str): Candidate identifier
            score (float): Similarity score
            top_matching_terms (list): List of tuples (term, score)
            rank (int): Candidate's rank (optional)
            
        Returns:
            dict: Candidate report
        """
        report = {
            'candidate_id': candidate_id,
            'similarity_score': round(float(score), 4),
            'match_percentage': round(float(score) * 100, 2),
            'top_matching_terms': [
                {'term': term, 'relevance': round(float(relevance), 4)}
                for term, relevance in top_matching_terms
            ]
        }
        
        if rank is not None:
            report['rank'] = rank
        
        return report
    
    def generate_ranking_report(self, job_description_summary, ranked_candidates, 
                                candidate_terms, timestamp=None):
        """
        Generate a comprehensive ranking report.
        
        Args:
            job_description_summary (str): Summary of job requirements
            ranked_candidates (list): List of (candidate_id, score) tuples
            candidate_terms (dict): Dictionary mapping candidate_id to top terms
            timestamp (datetime): Report generation time (optional)
            
        Returns:
            dict: Complete ranking report
        """
        if timestamp is None:
            timestamp = datetime.now()
        
        report = {
            'timestamp': timestamp.isoformat(),
            'job_description_summary': job_description_summary,
            'total_candidates': len(ranked_candidates),
            'candidates': []
        }
        
        # Generate report for each candidate
        for rank, (candidate_id, score) in enumerate(ranked_candidates, start=1):
            top_terms = candidate_terms.get(candidate_id, [])
            candidate_report = self.generate_candidate_report(
                candidate_id, score, top_terms, rank
            )
            report['candidates'].append(candidate_report)
        
        return report
    
    def format_report_text(self, report):
        """
        Format report as human-readable text.
        
        Args:
            report (dict): Report dictionary
            
        Returns:
            str: Formatted text report
        """
        lines = []
        lines.append("=" * 80)
        lines.append("EAA RECRUIT - CANDIDATE RANKING REPORT")
        lines.append("=" * 80)
        lines.append(f"Generated: {report['timestamp']}")
        lines.append(f"Total Candidates: {report['total_candidates']}")
        lines.append("")
        lines.append("Job Description Summary:")
        lines.append(report['job_description_summary'][:200] + "...")
        lines.append("")
        lines.append("=" * 80)
        lines.append("RANKED CANDIDATES")
        lines.append("=" * 80)
        lines.append("")
        
        for candidate in report['candidates']:
            lines.append(f"Rank #{candidate['rank']}: {candidate['candidate_id']}")
            lines.append(f"  Match Score: {candidate['match_percentage']:.2f}%")
            lines.append(f"  Similarity Score: {candidate['similarity_score']:.4f}")
            lines.append("  Top Matching Terms:")
            
            for term_info in candidate['top_matching_terms'][:5]:
                lines.append(f"    - {term_info['term']}: {term_info['relevance']:.4f}")
            
            lines.append("")
        
        return "\n".join(lines)
