from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI()

class ReasonResponse(BaseModel):
    reasons: List[str]

class ParseResumeRequest(BaseModel):
    resumeId: str

class ParseResumeResponse(ReasonResponse):
    extractionId: str
    data: dict

class RequirementRequest(BaseModel):
    projectId: str

class RequirementResponse(ReasonResponse):
    skills: List[str]
    roles: List[str]

class MatchRequest(BaseModel):
    projectId: str

class CandidateMatch(BaseModel):
    userId: str
    score: float
    reasons: List[str]

class MatchResponse(BaseModel):
    candidates: List[CandidateMatch]

class JobMatchRequest(BaseModel):
    jobId: str

class JobMatchResponse(BaseModel):
    candidates: List[CandidateMatch]

class ProjectHealthResponse(ReasonResponse):
    status: str
    score: float

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/ai/resume/parse", response_model=ParseResumeResponse)
def parse_resume(req: ParseResumeRequest):
    return {"reasons": ["Parsed successfully based on layout"], "extractionId": "ext-123", "data": {"skills": ["Python"]}}

@app.post("/ai/requirements", response_model=RequirementResponse)
def requirements(req: RequirementRequest):
    return {"reasons": ["Analyzed project description"], "skills": ["React"], "roles": ["Frontend Dev"]}

@app.post("/ai/match", response_model=MatchResponse)
def match(req: MatchRequest):
    return {"candidates": [{"userId": "user-001", "score": 0.95, "reasons": ["Has React skill"]}]}

@app.post("/ai/job-match", response_model=JobMatchResponse)
def job_match(req: JobMatchRequest):
    return {"candidates": [{"userId": "user-008", "score": 0.88, "reasons": ["Looking for roles"]}]}

@app.get("/projects/{projectId}/health", response_model=ProjectHealthResponse)
def project_health(projectId: str):
    return {"reasons": ["All roles filled"], "status": "healthy", "score": 0.92}
