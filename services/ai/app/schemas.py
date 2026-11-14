from typing import Literal
from pydantic import BaseModel, Field, ConfigDict

class Strict(BaseModel):
    model_config = ConfigDict(extra='forbid')

class TaxonomySkill(Strict):
    id: str
    name: str
    aliases: list[str] = []

class ParseRequest(Strict):
    resumeId: str = ''
    dataBase64: str | None = Field(default=None, max_length=14_000_000)
    taxonomy: list[TaxonomySkill] = []

class ParseResponse(BaseModel):
    extractionId: str
    data: dict
    reasons: list[str]

class RequirementRequest(Strict):
    projectId: str | None = None
    description: str = Field(default='', max_length=50000)
    taxonomy: list[TaxonomySkill] = []
    team: list[dict] = []
    teamSize: int | None = Field(default=None, ge=1, le=100)
    timeline: int | None = Field(default=None, ge=1, le=520)

class RequirementResponse(BaseModel):
    skills: list[dict]
    roles: list[dict]
    modules: list[str]
    dependencies: list[str]
    warnings: list[str]
    questions: list[str]
    needsClarification: bool
    gap: dict
    reasons: list[str]

class SkillInput(Strict):
    name: str
    level: str = 'intermediate'
    evidence: str = 'self_declared'
    visible: bool = True

class CandidateInput(Strict):
    id: str
    name: str
    headline: str = ''
    skills: list[SkillInput] = []
    learningGoals: list[str] = []
    hoursPerWeek: float = Field(default=0, ge=0, le=168)
    workMode: str = ''
    duration: str = ''
    matchingOptIn: bool = False
    recruiterVisible: bool = False
    location: str = ''
    experienceYears: float = Field(default=0, ge=0)
    verifiedProjects: list[dict] = []
    profileText: str = ''
    recentActivity: bool = False
    publicSkills: bool = True

class MatchRequest(Strict):
    projectId: str = ''
    project: dict = {}
    candidates: list[CandidateInput] = Field(default_factory=list, max_length=2000)
    exclusions: list[str] = []
    filters: dict = {}
    ranker: Literal['baseline', 'hybrid'] = 'baseline'

class JobRequest(Strict):
    jobId: str = ''
    job: dict = {}
    candidates: list[CandidateInput] = Field(default_factory=list, max_length=2000)
    constraints: dict[str, Literal['hard', 'soft']] = {}

class MatchResponse(BaseModel):
    candidates: list[dict]
    noStrongMatches: bool
    relaxationSuggestions: list[str]
    sampleSize: int
    ranker: str
    removedByConstraint: dict[str, int] = {}

class HealthRequest(Strict):
    project: dict
    tasks: list[dict] = []
    milestones: list[dict] = []
    activity: list[str] = []
    now: str

class HealthResponse(BaseModel):
    status: str
    score: float | None
    signals: list[dict]
    reasons: list[str]
    recommendedActions: list[dict]
    sampleSize: int
    computedAt: str
