export interface ProjectItemData {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  problemStatement?: string;
  category: string;
  type?: string;
  outcome?: string;
  visibility: string;
  status: string;
  stage: string;
  progress?: number;
  minTeamSize?: number;
  maxTeamSize?: number;
  membersCount?: number;
  commitsCount?: number;
  isOwner?: boolean;
  members?: Array<{ id: string; role: string; user?: { id: string; name: string; avatarUrl?: string } }>;
  roles?: Array<{ id: string; title: string; openings: number; filled: number }>;
  requirements?: Array<{ id: string; skill: string; proficiency: string; type: string }>;
}

export const canonicalProjectsMap: Record<string, ProjectItemData> = {
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
    stage: 'Production MVP',
    status: 'Active',
    progress: 85,
    minTeamSize: 2,
    maxTeamSize: 5,
    membersCount: 3,
    commitsCount: 14,
    isOwner: true,
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
    stage: 'Architecture AI',
    status: 'Active',
    progress: 60,
    minTeamSize: 2,
    maxTeamSize: 6,
    membersCount: 4,
    commitsCount: 28,
    isOwner: false,
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
    stage: 'Active Sprint',
    status: 'Active',
    progress: 72,
    minTeamSize: 2,
    maxTeamSize: 4,
    membersCount: 2,
    commitsCount: 19,
    isOwner: true,
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
    stage: 'Research Alpha',
    status: 'Active',
    progress: 45,
    minTeamSize: 2,
    maxTeamSize: 5,
    membersCount: 5,
    commitsCount: 31,
    isOwner: false,
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
    stage: 'Sponsored Challenge',
    status: 'Active',
    progress: 90,
    minTeamSize: 2,
    maxTeamSize: 4,
    membersCount: 3,
    commitsCount: 22,
    isOwner: false,
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
    stage: 'Beta',
    status: 'Active',
    progress: 65,
    minTeamSize: 2,
    maxTeamSize: 4,
    membersCount: 2,
    commitsCount: 16,
    isOwner: true,
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

export const canonicalProjectsList = Object.values(canonicalProjectsMap);
