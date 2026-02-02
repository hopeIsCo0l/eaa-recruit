"""
Recruitment API router.
"""
from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import List

from app.schemas.recruitment import (
    JobProcessResponse,
    RankingResponse,
    HealthResponse
)
from app.services.recruitment_service import recruitment_service

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="healthy")


@router.post("/upload-job", response_model=JobProcessResponse)
async def upload_job(job_file: UploadFile = File(...)):
    """
    Upload and process job description.
    
    Args:
        job_file: Job description file (PDF, DOCX, or TXT)
        
    Returns:
        Processing result
    """
    try:
        # Validate file type
        allowed_extensions = {'txt', 'pdf', 'docx', 'doc'}
        file_ext = job_file.filename.split('.')[-1].lower()
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail="Invalid file format. Use PDF, DOCX, or TXT"
            )
        
        # Read and parse file
        file_content = await job_file.read()
        job_text = recruitment_service.parse_document(file_content, job_file.filename)
        
        # Process job description
        result = recruitment_service.process_job_description(job_text)
        
        return JobProcessResponse(**result)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-resumes", response_model=RankingResponse)
async def upload_resumes(resume_files: List[UploadFile] = File(...)):
    """
    Upload and process candidate resumes.
    
    Args:
        resume_files: List of resume files (PDF, DOCX, or TXT)
        
    Returns:
        Ranking results with detailed report
    """
    try:
        if not resume_files:
            raise HTTPException(status_code=400, detail="No files provided")
        
        # Process all resumes
        resumes = []
        allowed_extensions = {'txt', 'pdf', 'docx', 'doc'}
        
        for file in resume_files:
            file_ext = file.filename.split('.')[-1].lower()
            
            if file_ext in allowed_extensions:
                file_content = await file.read()
                resume_text = recruitment_service.parse_document(
                    file_content, 
                    file.filename
                )
                
                resumes.append({
                    'id': file.filename,
                    'text': resume_text
                })
        
        if not resumes:
            raise HTTPException(
                status_code=400,
                detail="No valid resume files provided"
            )
        
        # Rank candidates
        result = recruitment_service.rank_candidates(resumes)
        
        return RankingResponse(**result)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
