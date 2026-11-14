import { config } from '../../../config';
import { fail } from './db';

type Flag =
  | 'AI_RESUME_SOURCE'
  | 'AI_REQUIREMENTS_SOURCE'
  | 'AI_MATCH_SOURCE'
  | 'AI_HEALTH_SOURCE'
  | 'AI_JOBMATCH_SOURCE';
export const sourceFor = (flag: Flag) => config[flag] || config.AI_SOURCE;

export function mockResponse(endpoint: string, payload: any): any {
  if (endpoint === '/ai/resume/parse') {
    const skills = (payload.taxonomy || [])
      .slice(0, 2)
      .map((s: any, i: number) => ({
        id: `skills-${i}`,
        section: 'skills',
        value: { name: s.name, canonicalSkillId: s.id, level: 'intermediate' },
        confidence: 0.95,
        confidenceLabel: 'High',
        evidence: `Sample resume mentions ${s.name}.`,
        reason: 'Explicitly labelled sample data from the mock adapter.',
      }));
    return {
      extractionId: 'mock-extraction',
      reasons: [
        'Mock adapter; this is sample data, not an analysis of your PDF.',
      ],
      data: {
        contact: { name: 'Sample Candidate' },
        skills,
        experience: [],
        education: [],
        certifications: [],
        links: [],
        projects: [],
        proposals: [],
        warnings: [
          'Mock mode: sample extraction. Switch AI_RESUME_SOURCE=real to analyze the uploaded PDF.',
        ],
        reasons: ['Mock adapter sample.'],
      },
    };
  }
  if (endpoint === '/ai/requirements') {
    const clarify = (payload.description || '').trim().split(/\s+/).length < 15;
    const skills = clarify
      ? []
      : (payload.taxonomy || [])
          .slice(0, 3)
          .map((s: any) => ({
            name: s.name,
            canonicalSkillId: s.id,
            type: 'required',
            proficiency: 'intermediate',
            rationale: 'Sample suggestion from the mock adapter.',
            source: 'ai_accepted',
          }));
    return {
      skills,
      roles: skills.length
        ? [
            {
              title: 'Contributor',
              skills: skills.map((s: any) => s.name),
              rationale: 'Sample role.',
            },
          ]
        : [],
      modules: [],
      dependencies: [],
      gap: {
        covered: [],
        partial: [],
        missing: skills.map((s: any) => ({
          skill: s.name,
          people: [],
          reason: 'Sample gap.',
        })),
      },
      needsClarification: clarify,
      questions: clarify
        ? [
            'Who will use this project and what should it do?',
            'What are the main workflows?',
          ]
        : [],
      warnings: ['Mock mode: sample suggestions.'],
      reasons: ['Mock adapter.'],
    };
  }
  if (endpoint === '/ai/health')
    return {
      status: 'Not enough data',
      score: null,
      signals: [],
      reasons: [
        'Mock mode: switch AI_HEALTH_SOURCE=real to analyze project data.',
      ],
      recommendedActions: [],
      sampleSize: 0,
      computedAt: new Date().toISOString(),
    };
  return {
    candidates: [],
    noStrongMatches: true,
    sampleSize: 0,
    relaxationSuggestions: [
      'Mock mode: enable the matching flag for real rankings.',
    ],
    ranker: 'baseline',
    removedByConstraint: {},
  };
}

export async function callAI(
  endpoint: string,
  payload: unknown,
  flag: Flag
): Promise<any> {
  if (sourceFor(flag) === 'mock')
    return { ...mockResponse(endpoint, payload), mode: 'mock' };
  try {
    const response = await fetch(
      `${config.AI_SERVICE_URL.replace(/\/$/, '')}${endpoint}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(config.AI_REQUEST_TIMEOUT_MS),
      }
    );
    if (!response.ok) {
      if (response.status >= 500)
        fail(
          503,
          'AI_UNAVAILABLE',
          'The intelligence service is temporarily unavailable. Retry or continue manually.'
        );
      const body: any = await response.json().catch(() => ({}));
      fail(
        422,
        'AI_INPUT_ERROR',
        typeof body.detail === 'string'
          ? body.detail
          : 'The analysis inputs could not be processed.'
      );
    }
    return { ...((await response.json()) as object), mode: 'real' };
  } catch (e: any) {
    if (e.status) throw e;
    fail(
      503,
      'AI_UNAVAILABLE',
      'The intelligence service is unavailable. Retry or continue manually.'
    );
  }
}
