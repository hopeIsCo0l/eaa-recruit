"""
Command-line interface for EAA Recruit platform.
"""
import argparse
import json
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.recruitment_engine import RecruitmentEngine


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description='EAA Recruit - AI-Powered Recruitment Automation CLI'
    )
    
    parser.add_argument(
        '--job',
        required=True,
        help='Path to job description file'
    )
    
    parser.add_argument(
        '--resumes',
        nargs='+',
        required=True,
        help='Paths to resume files'
    )
    
    parser.add_argument(
        '--output',
        default='ranking_report.json',
        help='Output file for ranking report (default: ranking_report.json)'
    )
    
    parser.add_argument(
        '--text-output',
        default='ranking_report.txt',
        help='Output file for text report (default: ranking_report.txt)'
    )
    
    args = parser.parse_args()
    
    # Initialize engine
    print("Initializing EAA Recruit Engine...")
    engine = RecruitmentEngine()
    
    # Process job description
    print(f"\nProcessing job description: {args.job}")
    try:
        with open(args.job, 'rb') as f:
            job_content = f.read()
        
        job_text = engine.parse_document(job_content, args.job)
        engine.process_job_description(job_text)
        print("✓ Job description processed successfully")
    except Exception as e:
        print(f"✗ Error processing job description: {str(e)}")
        sys.exit(1)
    
    # Process resumes
    print(f"\nProcessing {len(args.resumes)} resumes...")
    resumes = []
    
    for resume_path in args.resumes:
        try:
            with open(resume_path, 'rb') as f:
                resume_content = f.read()
            
            resume_text = engine.parse_document(resume_content, resume_path)
            resumes.append({
                'id': os.path.basename(resume_path),
                'text': resume_text
            })
            print(f"  ✓ Processed: {os.path.basename(resume_path)}")
        except Exception as e:
            print(f"  ✗ Error processing {resume_path}: {str(e)}")
    
    if not resumes:
        print("\n✗ No resumes were successfully processed")
        sys.exit(1)
    
    # Rank candidates
    print("\nRanking candidates...")
    try:
        result = engine.rank_candidates(resumes)
        print("✓ Ranking completed successfully")
        
        # Save JSON report
        with open(args.output, 'w') as f:
            json.dump(result['report'], f, indent=2)
        print(f"\n✓ JSON report saved to: {args.output}")
        
        # Save text report
        with open(args.text_output, 'w') as f:
            f.write(result['text_report'])
        print(f"✓ Text report saved to: {args.text_output}")
        
        # Display summary
        print("\n" + "=" * 80)
        print("RANKING SUMMARY")
        print("=" * 80)
        
        for candidate in result['report']['candidates'][:5]:  # Top 5
            print(f"\nRank #{candidate['rank']}: {candidate['candidate_id']}")
            print(f"  Match Score: {candidate['match_percentage']:.2f}%")
            print(f"  Top Terms: {', '.join([t['term'] for t in candidate['top_matching_terms'][:3]])}")
        
        print("\n" + "=" * 80)
        
    except Exception as e:
        print(f"✗ Error during ranking: {str(e)}")
        sys.exit(1)


if __name__ == '__main__':
    main()
