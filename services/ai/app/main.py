import base64
import binascii
from datetime import datetime, timezone
from uuid import uuid4
from fastapi import FastAPI, HTTPException
from .schemas import ParseRequest, ParseResponse, RequirementRequest, RequirementResponse, MatchRequest, JobRequest, MatchResponse, HealthRequest, HealthResponse
from .extraction import extract_pdf, extract_text
from .requirements import analyze
from .matching import rank
from .job_matching import rank_jobs
from .health import compute

app = FastAPI(title='SkillForge Intelligence', version='1.0.0')

@app.get('/health')
def health():
    return {'status': 'ok'}

@app.post('/ai/resume/parse', response_model=ParseResponse)
def parse_resume(req: ParseRequest):
    try:
        taxonomy = [s.model_dump() for s in req.taxonomy]
        if not req.dataBase64:
            data = extract_text('', taxonomy)
        else:
            raw = base64.b64decode(req.dataBase64, validate=True)
            if not raw.startswith(b'%PDF-') or len(raw) > 10 * 1024 * 1024:
                raise ValueError('Upload a PDF of at most 10 MB.')
            data = extract_pdf(raw, taxonomy)
        return {'extractionId': str(uuid4()), 'data': data, 'reasons': data['reasons']}
    except (ValueError, binascii.Error) as exc:
        raise HTTPException(422, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(422, 'This PDF could not be read. Upload a valid, unlocked PDF or continue manually.') from exc

@app.post('/ai/requirements', response_model=RequirementResponse)
def requirements(req: RequirementRequest):
    return analyze(req.description, [s.model_dump() for s in req.taxonomy], req.team, req.teamSize, req.timeline)

@app.post('/ai/match', response_model=MatchResponse)
def match(req: MatchRequest):
    if not req.project:
        return {'candidates': [], 'noStrongMatches': True, 'relaxationSuggestions': ['Supply project requirements and an opt-in candidate pool.'], 'sampleSize': 0, 'ranker': req.ranker}
    try:
        return rank(req.project, [c.model_dump() for c in req.candidates], req.exclusions, ranker=req.ranker, filters=req.filters)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc

@app.post('/ai/job-match', response_model=MatchResponse)
def job_match(req: JobRequest):
    if not req.job:
        return {'candidates': [], 'noStrongMatches': True, 'relaxationSuggestions': ['Supply a job and recruiter-visible candidates.'], 'sampleSize': 0, 'ranker': 'baseline'}
    try:
        return rank_jobs(req.job, [c.model_dump() for c in req.candidates], req.constraints)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc

@app.post('/ai/health', response_model=HealthResponse)
def project_health_inputs(req: HealthRequest):
    return compute(req.project, req.tasks, req.milestones, req.activity, req.now)

@app.get('/projects/{projectId}/health', response_model=HealthResponse)
def project_health(projectId: str):
    return compute({'id': projectId}, [], [], [], datetime.now(timezone.utc).isoformat())
