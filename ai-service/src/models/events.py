from pydantic import BaseModel


class CvUploadedEvent(BaseModel):
    applicationId: str
    candidateId: str
    jobId: str
    cvFilePath: str


class ExamSubmittedEvent(BaseModel):
    applicationId: str
    candidateId: str
    jobId: str
    answers: dict  # questionId -> answer text
