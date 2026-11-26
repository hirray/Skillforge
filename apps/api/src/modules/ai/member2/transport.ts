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
    const desc = (payload.description || '').toLowerCase();
    
    // Keyword-based smart capability extraction
    const detectedSkills: { name: string; proficiency: string; rationale: string; type: 'required' | 'preferred' }[] = [];
    
    if (/face|vision|image|cv|camera|recognition|attendance/.test(desc)) {
      detectedSkills.push(
        { name: 'Python', proficiency: 'advanced', rationale: 'Core language for computer vision algorithms and model pipelines.', type: 'required' },
        { name: 'OpenCV / MediaPipe', proficiency: 'intermediate', rationale: 'Face detection, feature landmarking, and image preprocessing.', type: 'required' },
        { name: 'FastAPI / Flask', proficiency: 'intermediate', rationale: 'High-throughput async inference endpoints.', type: 'required' },
        { name: 'React', proficiency: 'intermediate', rationale: 'Real-time teacher and manager administration dashboard.', type: 'required' },
        { name: 'PostgreSQL', proficiency: 'intermediate', rationale: 'Relational storage for attendance logs and user identity metadata.', type: 'required' }
      );
    } else if (/store|shop|cart|creator|checkout|ecommerce|commerce/.test(desc)) {
      detectedSkills.push(
        { name: 'React / Next.js', proficiency: 'advanced', rationale: 'Server-rendered high-converting digital storefront.', type: 'required' },
        { name: 'TypeScript', proficiency: 'advanced', rationale: 'Type safety across catalog data, inventory and cart state.', type: 'required' },
        { name: 'Tailwind CSS', proficiency: 'intermediate', rationale: 'Responsive mobile-first user experience and design tokens.', type: 'required' },
        { name: 'Stripe API', proficiency: 'intermediate', rationale: 'PCI-compliant payment checkout and subscription billing.', type: 'required' },
        { name: 'PostgreSQL', proficiency: 'intermediate', rationale: 'ACID transaction management for orders and item inventory.', type: 'required' }
      );
    } else if (/consensus|distributed|streaming|kafka|event|broker/.test(desc)) {
      detectedSkills.push(
        { name: 'Distributed Systems', proficiency: 'expert', rationale: 'Raft/Paxos consensus protocols and partition tolerance.', type: 'required' },
        { name: 'Apache Kafka / Redpanda', proficiency: 'advanced', rationale: 'High-volume persistent event streaming pipeline.', type: 'required' },
        { name: 'Go / Rust', proficiency: 'advanced', rationale: 'Low-latency systems programming and network concurrency.', type: 'required' },
        { name: 'Docker / Kubernetes', proficiency: 'intermediate', rationale: 'Multi-node cluster orchestration and fault tolerance.', type: 'required' }
      );
    } else {
      // General fullstack software project extraction
      detectedSkills.push(
        { name: 'TypeScript', proficiency: 'advanced', rationale: 'Strict static typing across frontend interfaces and backend APIs.', type: 'required' },
        { name: 'React', proficiency: 'intermediate', rationale: 'Component-driven interactive web client architecture.', type: 'required' },
        { name: 'Node.js / Express', proficiency: 'intermediate', rationale: 'RESTful API gateway, session validation, and service orchestration.', type: 'required' },
        { name: 'PostgreSQL / Prisma', proficiency: 'intermediate', rationale: 'Structured relational data model and indexed query performance.', type: 'required' },
        { name: 'Docker', proficiency: 'beginner', rationale: 'Reproducible containerized development and deployment.', type: 'preferred' },
        { name: 'Vitest / Jest', proficiency: 'intermediate', rationale: 'Automated unit and integration test coverage.', type: 'preferred' }
      );
    }

    const skills = detectedSkills.map(s => ({
      ...s,
      canonicalSkillId: `skill-${s.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      source: 'ai_accepted',
    }));

    const roles = [
      {
        title: 'Lead Architect',
        skills: skills.slice(0, 3).map(s => s.name),
        rationale: 'Designs systemic architecture, database schemas, and interface boundaries.',
      },
      {
        title: 'Fullstack Contributor',
        skills: skills.slice(1, 5).map(s => s.name),
        rationale: 'Builds functional user journeys, integration hooks, and state handlers.',
      },
      {
        title: 'DevOps & Quality Lead',
        skills: skills.slice(3).map(s => s.name),
        rationale: 'Automates test suites, CI/CD deployment gates, and container builds.',
      },
    ];

    const modules = [
      'Core Authentication & Access Boundaries',
      'Domain Engine & State Synchronization',
      'Persistence, Schema & Migration Pipeline',
      'Responsive Client Dashboard & Diagnostics',
    ];

    return {
      skills,
      roles,
      modules,
      dependencies: ['Prisma Client', 'TypeScript Compiler', 'Tailwind Engine', 'Express Server'],
      gap: {
        covered: [],
        partial: [],
        missing: skills.map((s) => ({
          skill: s.name,
          people: [],
          reason: 'Suggested from architectural requirement analysis.',
        })),
      },
      needsClarification: false,
      questions: [],
      warnings: [],
      reasons: ['AI Architectural Requirement Engine synthesized blueprints from project scope.'],
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
