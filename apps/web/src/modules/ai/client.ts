export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}
export const token = () => localStorage.getItem('token') || 'user-001';

export const getEffectiveUserId = (): string => {
  const t = token();
  if (t.startsWith('eyJ') && t.includes('.')) {
    try {
      const parts = t.split('.');
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload._id || payload.id || payload.userId || payload.sub || t;
    } catch {
      return t;
    }
  }
  return t;
};

export const getUserDisplayName = (): string => {
  const t = token();
  if (t.startsWith('eyJ') && t.includes('.')) {
    try {
      const parts = t.split('.');
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload.name || payload.nickname || payload.email || payload._id || 'You';
    } catch {
      return t;
    }
  }
  return t;
};
export async function api<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token()}`);
  if (options.body && !(options.body instanceof FormData))
    headers.set('Content-Type', 'application/json');
  const response = await fetch(`/api/v1${path}`, { ...options, headers });
  const data = await response.json();
  if (!response.ok)
    throw new ApiError(
      response.status,
      data.error?.message || 'The request could not be completed.'
    );
  return data;
}
export interface WorkspaceContext {
  user: { id: string; name: string; roles: string[] };
  projects: {
    id: string;
    title: string;
    ownerId: string;
    status: string;
    roles?: { title: string }[];
  }[];
  jobs: { id: string; title: string; companyId: string }[];
  preference: {
    matchingOptIn: boolean;
    recruiterVisible: boolean;
    publicSkills: boolean;
  };
  extensionsEnabled: boolean;
  ranker: string;
}
export interface Suggestion {
  name: string;
  canonicalSkillId?: string;
  proficiency: string;
  type: string;
  rationale: string;
  source: string;
  unmatched?: boolean;
}
export interface RequirementResult {
  skills: Suggestion[];
  roles: { title: string; rationale: string }[];
  modules: string[];
  warnings: string[];
  questions: string[];
  needsClarification: boolean;
  gap: Record<string, { skill: string; people: string[]; reason: string }[]>;
  mode: string;
}
export interface Candidate {
  userId: string;
  name: string;
  headline: string;
  rank: number;
  role?: string;
  matchType?: string;
  reasons: string[];
  matchedSkills: string[];
  caveats: string[];
  signals: Record<string, number>;
  weights: Record<string, number>;
  verifiedProjects: { id: string; title: string }[];
  constraintResults?: {
    field: string;
    mode: string;
    passed: boolean;
    reason: string;
  }[];
}
export interface MatchResult {
  candidates: Candidate[];
  noStrongMatches: boolean;
  relaxationSuggestions: string[];
  sampleSize: number;
  mode: string;
  ranker: string;
  stale?: boolean;
}
export interface HealthResult {
  status: string;
  score: number | null;
  reasons: string[];
  signals: { reason: string; severity: string; code: string }[];
  recommendedActions: { label: string; href: string }[];
  sampleSize: number;
  computedAt: string;
  mode: string;
}
export interface ResumeRecord {
  id: string;
  fileName: string;
  status: string;
  attempts: number;
  lastError?: string;
  createdAt: string;
}
export interface ExtractionItem {
  id: string;
  section: string;
  value: Record<string, string>;
  confidence: number;
  confidenceLabel: string;
  evidence: string;
  reason: string;
}
export interface Extraction {
  decisions?: {
    id: string;
    action: 'accepted' | 'edited' | 'discarded';
    value?: Record<string, string>;
  }[];
  id: string;
  confirmedAt?: string;
  contact: { name?: string; email?: string };
  skills: ExtractionItem[];
  experience: ExtractionItem[];
  education: ExtractionItem[];
  certifications: ExtractionItem[];
  links: ExtractionItem[];
  projects: ExtractionItem[];
  proposals: { name: string; reason: string }[];
  warnings: string[];
  mode: string;
}
export const intelligence = {
  requirements: (input: object) =>
    api<{ data: RequirementResult }>('/ai/requirements', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  match: (input: object) =>
    api<{ data: MatchResult }>('/ai/match', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  jobMatch: (input: object) =>
    api<{ data: MatchResult }>('/ai/job-match', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  health: (id: string) =>
    api<{ data: HealthResult }>(`/projects/${encodeURIComponent(id)}/health`),
};
