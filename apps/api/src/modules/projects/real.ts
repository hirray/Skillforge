import { PrismaClient } from '@prisma/client';
import { ErrorCode, DomainEvent } from '@skillforge/contract';
import { eventBus } from '../../core/eventBus';

const prisma = new PrismaClient();

export const canonicalProjectsMap: Record<string, any> = {
  'proj-consensus': {
    id: 'proj-consensus',
    ownerId: 'user-003',
    title: 'Distributed Consensus & Event Streaming Hub',
    description: 'High-throughput event streaming engine with raft-backed consensus, partition leader election, and automated zero-downtime failover test suite.',
    problemStatement: 'Distributed state machines struggle with split-brain scenarios and unpartitioned consensus under network partition stress.',
    category: 'Systems & Backend',
    type: 'Infrastructure',
    outcome: 'A production-grade Raft consensus hub capable of 250k events/sec with zero loss.',
    visibility: 'Public',
    stage: 'production',
    status: 'Active',
    minTeamSize: 2,
    maxTeamSize: 5,
    members: [
      { id: 'm-1', role: 'Lead Architect', user: { id: 'user-003', name: 'Elena Rostova', avatarUrl: '' } },
      { id: 'm-2', role: 'Distributed Systems Engineer', user: { id: 'user-001', name: 'Alexandre Chen', avatarUrl: '' } },
      { id: 'm-3', role: 'DevOps / Performance', user: { id: 'user-007', name: 'Marcus Vance', avatarUrl: '' } },
    ],
    roles: [
      { id: 'r-1', title: 'Lead Architect', openings: 1, filled: 1 },
      { id: 'r-2', title: 'Systems Engineer', openings: 2, filled: 1 },
      { id: 'r-3', title: 'Test Automation', openings: 1, filled: 0 },
    ],
    requirements: [
      { id: 'req-1', skill: 'Kafka', proficiency: 'expert', type: 'required' },
      { id: 'req-2', skill: 'Go', proficiency: 'intermediate', type: 'required' },
      { id: 'req-3', skill: 'Raft Consensus', proficiency: 'expert', type: 'required' },
      { id: 'req-4', skill: 'Docker', proficiency: 'intermediate', type: 'preferred' },
    ],
  },
  'proj-monorepo': {
    id: 'proj-monorepo',
    ownerId: 'user-001',
    title: 'SkillForge Universal Monorepo Shell',
    description: 'AI-powered collaborative workspace architecture spanning React, Express, Prisma, and Python services with contract validation.',
    problemStatement: 'Managing 34 autonomous modules across multi-disciplinary teams requires a unified role-aware shell and contract testing.',
    category: 'Fullstack Engineering',
    type: 'Web App',
    outcome: 'One unified monolithic platform with 6 distinct role contexts, guided tours, and verifiable cryptographic credentials.',
    visibility: 'Public',
    stage: 'beta',
    status: 'Active',
    minTeamSize: 2,
    maxTeamSize: 6,
    members: [
      { id: 'm-4', role: 'Fullstack Lead', user: { id: 'user-001', name: 'Alexandre Chen', avatarUrl: '' } },
      { id: 'm-5', role: 'Backend Engineer', user: { id: 'user-002', name: 'Sarah Lin', avatarUrl: '' } },
      { id: 'm-6', role: 'Frontend Engineer', user: { id: 'user-005', name: 'David Kim', avatarUrl: '' } },
      { id: 'm-7', role: 'Product Architect', user: { id: 'user-004', name: 'Priya Sharma', avatarUrl: '' } },
    ],
    roles: [
      { id: 'r-4', title: 'Fullstack Lead', openings: 1, filled: 1 },
      { id: 'r-5', title: 'Backend Engineer', openings: 2, filled: 1 },
      { id: 'r-6', title: 'Security Auditor', openings: 1, filled: 0 },
    ],
    requirements: [
      { id: 'req-5', skill: 'React', proficiency: 'expert', type: 'required' },
      { id: 'req-6', skill: 'TypeScript', proficiency: 'expert', type: 'required' },
      { id: 'req-7', skill: 'Node.js', proficiency: 'expert', type: 'required' },
      { id: 'req-8', skill: 'Prisma ORM', proficiency: 'intermediate', type: 'required' },
      { id: 'req-9', skill: 'TailwindCSS', proficiency: 'intermediate', type: 'preferred' },
    ],
  },
  'proj-security': {
    id: 'proj-security',
    ownerId: 'user-003',
    title: 'Security Auditing & Microservices',
    description: 'Enterprise OAuth2 authorization server, RBAC token verification, and automated vulnerability scanning pipeline.',
    problemStatement: 'Microservice ecosystems often suffer from token forgery, perimeter drift, and insecure direct object reference (IDOR) attacks.',
    category: 'Security & Cloud',
    type: 'Security Service',
    outcome: 'Automated policy enforcement middleware, secret zeroization, and cryptographic signing pipeline.',
    visibility: 'Public',
    stage: 'sprint',
    status: 'Active',
    minTeamSize: 2,
    maxTeamSize: 4,
    members: [
      { id: 'm-8', role: 'Security Architect', user: { id: 'user-003', name: 'Elena Rostova', avatarUrl: '' } },
      { id: 'm-9', role: 'Cloud Engineer', user: { id: 'user-007', name: 'Marcus Vance', avatarUrl: '' } },
    ],
    roles: [
      { id: 'r-7', title: 'Security Architect', openings: 1, filled: 1 },
      { id: 'r-8', title: 'Penetration Tester', openings: 1, filled: 0 },
    ],
    requirements: [
      { id: 'req-10', skill: 'OAuth2 / JWT', proficiency: 'expert', type: 'required' },
      { id: 'req-11', skill: 'Kubernetes', proficiency: 'intermediate', type: 'required' },
      { id: 'req-12', skill: 'Cryptography', proficiency: 'expert', type: 'required' },
    ],
  },
  'proj-swarm': {
    id: 'proj-swarm',
    ownerId: 'user-006',
    title: 'Autonomous Agent Swarm Orchestrator',
    description: 'Multi-agent orchestration framework leveraging LangGraph and vector memory for parallel architectural synthesis.',
    problemStatement: 'Autonomous AI agents need deterministic state machines and tool validation to avoid infinite loops and hallucinations.',
    category: 'AI & Autonomous Systems',
    type: 'AI System',
    outcome: 'Production multi-agent execution framework with telemetry and safety boundaries.',
    visibility: 'Public',
    stage: 'alpha',
    status: 'Active',
    minTeamSize: 2,
    maxTeamSize: 5,
    members: [
      { id: 'm-10', role: 'ML Research Lead', user: { id: 'user-006', name: 'Elena Rostova', avatarUrl: '' } },
      { id: 'm-11', role: 'Systems Engineer', user: { id: 'user-001', name: 'Alexandre Chen', avatarUrl: '' } },
    ],
    roles: [
      { id: 'r-9', title: 'ML Research Lead', openings: 1, filled: 1 },
      { id: 'r-10', title: 'Vector DB Specialist', openings: 1, filled: 0 },
    ],
    requirements: [
      { id: 'req-13', skill: 'Python', proficiency: 'expert', type: 'required' },
      { id: 'req-14', skill: 'LangGraph', proficiency: 'expert', type: 'required' },
      { id: 'req-15', skill: 'Vector Databases', proficiency: 'intermediate', type: 'required' },
    ],
  },
  'proj-fraud': {
    id: 'proj-fraud',
    ownerId: 'user-004',
    title: 'Real-Time Financial Fraud Detection Pipeline',
    description: 'Low-latency streaming anomaly detector processing transactions with graph neural networks and Kafka integration.',
    problemStatement: 'High-frequency payment processing requires sub-10ms anomaly inference with <0.01% false positives.',
    category: 'Machine Learning',
    type: 'Streaming Pipeline',
    outcome: 'Real-time inference engine handling 50k transactions/sec with real-time graph embeddings.',
    visibility: 'Public',
    stage: 'production',
    status: 'Active',
    minTeamSize: 2,
    maxTeamSize: 4,
    members: [
      { id: 'm-12', role: 'Data Architect', user: { id: 'user-004', name: 'Priya Sharma', avatarUrl: '' } },
      { id: 'm-13', role: 'Backend Engineer', user: { id: 'user-002', name: 'Sarah Lin', avatarUrl: '' } },
    ],
    roles: [
      { id: 'r-11', title: 'Data Architect', openings: 1, filled: 1 },
      { id: 'r-12', title: 'ML Ops Engineer', openings: 1, filled: 0 },
    ],
    requirements: [
      { id: 'req-16', skill: 'Kafka', proficiency: 'expert', type: 'required' },
      { id: 'req-17', skill: 'PyTorch', proficiency: 'expert', type: 'required' },
      { id: 'req-18', skill: 'PostgreSQL', proficiency: 'intermediate', type: 'required' },
    ],
  },
  'proj-whiteboard': {
    id: 'proj-whiteboard',
    ownerId: 'user-005',
    title: 'High-Throughput Collaborative Canvas Engine',
    description: 'Zero-latency vector drawing and architecture diagramming engine powered by WebSockets and CRDT synchronization.',
    problemStatement: 'Collaborative whiteboarding tools suffer from cursor desync and heavy canvas repaint lag under 50+ concurrent users.',
    category: 'Frontend & Realtime',
    type: 'Realtime App',
    outcome: '60fps hardware-accelerated canvas engine with conflict-free replicated data types.',
    visibility: 'Public',
    stage: 'beta',
    status: 'Active',
    minTeamSize: 2,
    maxTeamSize: 4,
    members: [
      { id: 'm-14', role: 'Frontend Lead', user: { id: 'user-005', name: 'David Kim', avatarUrl: '' } },
      { id: 'm-15', role: 'WebSockets Engineer', user: { id: 'user-001', name: 'Alexandre Chen', avatarUrl: '' } },
    ],
    roles: [
      { id: 'r-13', title: 'Frontend Lead', openings: 1, filled: 1 },
      { id: 'r-14', title: 'CRDT Specialist', openings: 1, filled: 0 },
    ],
    requirements: [
      { id: 'req-19', skill: 'Canvas API / WebGL', proficiency: 'expert', type: 'required' },
      { id: 'req-20', skill: 'TypeScript', proficiency: 'expert', type: 'required' },
      { id: 'req-21', skill: 'WebSockets', proficiency: 'expert', type: 'required' },
    ],
  },
};

export class RealService {
  async create(userId: string, data: any) {
    const project = await prisma.project.create({
      data: {
        ownerId: userId,
        status: 'Draft',
        title: data.title,
        description: data.description,
        problemStatement: data.problemStatement,
        category: data.category,
        type: data.type,
        outcome: data.outcome,
        coverImage: data.coverImage,
        visibility: data.visibility || 'Public',
        duration: data.duration,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        stage: data.stage || 'idea',
        minTeamSize: data.minTeamSize || 1,
        maxTeamSize: data.maxTeamSize || 5,
        budget: data.budget,
        paid: data.paid || false,
        joinMode: data.joinMode || 'both',
        memberApprovalMode: data.memberApprovalMode || 'owner',
        requirements: {
          create: (data.requirements || []).map((req: any) => ({
            skillName: req.skill || req.skillName,
            level: req.proficiency || req.level || 'intermediate',
            isOptional: req.type === 'preferred' || req.isOptional === true
          }))
        },
        roles: {
          create: (data.roles || []).map((r: any) => ({
            title: r.title,
            openings: Number(r.openings) || 1,
            filled: Number(r.filled) || 0
          }))
        }
      },
      include: {
        requirements: true,
        roles: true
      }
    });

    eventBus.emitEvent(DomainEvent.ProjectCreated, { projectId: project.id, ownerId: userId });
    return { data: this.formatProject(project) };
  }

  private formatProject(project: any) {
    if (!project) return project;
    return {
      ...project,
      requirements: (project.requirements || []).map((req: any) => ({
        ...req,
        skill: req.skillName || req.skill,
        proficiency: req.level || req.proficiency || 'intermediate',
        type: req.isOptional ? 'preferred' : (req.type || 'required')
      }))
    };
  }

  async list(filters: any) {
    const where: any = {};
    if (filters.visibility) where.visibility = filters.visibility;
    if (filters.stage) where.stage = filters.stage;
    if (filters.category) where.category = filters.category;
    
    let dbProjects: any[] = [];
    try {
      dbProjects = await prisma.project.findMany({ where, include: { requirements: true, roles: true } });
    } catch {
      dbProjects = [];
    }

    const canonicalList = Object.values(canonicalProjectsMap);
    const combined = [...dbProjects];
    canonicalList.forEach((canon) => {
      if (!combined.some((p) => p.id === canon.id || p.title === canon.title)) {
        combined.push(canon);
      }
    });

    return { data: combined.map(p => this.formatProject(p)) };
  }

  async getById(id: string) {
    let project: any = null;
    try {
      project = await prisma.project.findUnique({
        where: { id },
        include: { requirements: true, roles: true, members: true }
      });
    } catch {
      project = null;
    }

    if (!project && canonicalProjectsMap[id]) {
      project = canonicalProjectsMap[id];
    }

    if (!project) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };
    return { data: this.formatProject(project) };
  }

  async update(id: string, userId: string, data: any) {
    const existing = await prisma.project.findUnique({ where: { id }, include: { members: true } });
    if (!existing) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };
    if (existing.ownerId !== userId) throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'Forbidden' };

    if (data.maxTeamSize !== undefined && data.maxTeamSize < existing.members.length) {
       throw { status: 422, code: 'VALIDATION_ERROR', message: 'maxTeamSize cannot be below current member count' };
    }

    const updateData: any = {
      title: data.title,
      description: data.description,
      problemStatement: data.problemStatement,
      category: data.category,
      type: data.type,
      outcome: data.outcome,
      coverImage: data.coverImage,
      visibility: data.visibility,
      duration: data.duration,
      targetDate: data.targetDate ? new Date(data.targetDate) : null,
      stage: data.stage,
      minTeamSize: data.minTeamSize,
      maxTeamSize: data.maxTeamSize,
      budget: data.budget,
      paid: data.paid,
      joinMode: data.joinMode,
      memberApprovalMode: data.memberApprovalMode,
    };

    if (data.roles && Array.isArray(data.roles)) {
      await prisma.projectRole.deleteMany({ where: { projectId: id } });
      updateData.roles = {
        create: data.roles.map((r: any) => ({
          title: r.title,
          openings: Number(r.openings) || 1,
          filled: Number(r.filled) || 0
        }))
      };
    }

    if (data.requirements && Array.isArray(data.requirements)) {
      await prisma.projectRequirement.deleteMany({ where: { projectId: id } });
      updateData.requirements = {
        create: data.requirements.map((req: any) => ({
          skillName: req.skill || req.skillName,
          level: req.proficiency || req.level || 'intermediate',
          isOptional: req.type === 'preferred' || req.isOptional === true
        }))
      };
    }

    const updated = await prisma.project.update({
      where: { id },
      data: updateData,
      include: { requirements: true, roles: true }
    });

    eventBus.emitEvent(DomainEvent.ProjectUpdated, { projectId: updated.id });
    return { data: this.formatProject(updated) };
  }

  async transition(id: string, userId: string, newStatus: string) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };
    if (existing.ownerId !== userId && userId !== 'admin-001') throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'Forbidden' };

    const validTransitions: Record<string, string[]> = {
      'Draft': ['Recruiting'],
      'Recruiting': ['Active'],
      'Active': ['Paused', 'Completed', 'Verified'],
      'Paused': ['Active'],
      'Completed': ['Archived'],
      'Verified': ['Archived']
    };

    const currentNorm = existing.status.charAt(0).toUpperCase() + existing.status.slice(1).toLowerCase();
    const targetNorm = newStatus.charAt(0).toUpperCase() + newStatus.slice(1).toLowerCase();

    if (currentNorm === 'Completed' || currentNorm === 'Verified') {
      if (targetNorm !== 'Archived') {
         throw { status: 400, code: 'INVALID_TRANSITION', message: `Cannot transition from ${existing.status} to ${newStatus}. Only Archived is allowed.` };
      }
    }

    const allowedNext = validTransitions[currentNorm] || [];
    if (!allowedNext.map(s => s.toLowerCase()).includes(targetNorm.toLowerCase())) {
       throw { status: 400, code: 'INVALID_TRANSITION', message: `Invalid transition from ${existing.status} to ${newStatus}. Allowed: ${allowedNext.join(', ')}` };
    }

    const updated = await prisma.project.update({
      where: { id },
      data: { status: targetNorm },
      include: { requirements: true, roles: true }
    });

    eventBus.emitEvent(DomainEvent.ProjectUpdated, { projectId: updated.id });
    return { data: updated };
  }

  async delete(id: string, userId: string) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };
    if (existing.ownerId !== userId) throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'Only project owner can delete this project' };

    await prisma.project.delete({ where: { id } });
    eventBus.emitEvent(DomainEvent.ProjectDeleted, { projectId: id });
    return { data: { success: true, id } };
  }
}

export const realProjectsService = new RealService();
export const realService = realProjectsService;
