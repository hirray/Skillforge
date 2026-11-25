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

// ── Canonical Milestones, Tasks & Resources for Zero-Error Resilience ─────────

export const canonicalMilestonesMap: Record<string, any[]> = {
  'proj-whiteboard': [
    {
      id: 'ms-wb-1',
      projectId: 'proj-whiteboard',
      title: 'Core Vector Canvas & WebGL Rendering Loop',
      description: 'Implement 60fps hardware-accelerated 2D canvas drawing with custom shaders and vector point buffers.',
      status: 'Done',
      progressPercentage: 100,
      dueDate: '2026-11-10T00:00:00.000Z',
    },
    {
      id: 'ms-wb-2',
      projectId: 'proj-whiteboard',
      title: 'CRDT State Sync & WebSocket Binary Protocol',
      description: 'Conflict-free replicated data types for simultaneous multi-cursor drawings and path reconciliations.',
      status: 'In Progress',
      progressPercentage: 65,
      dueDate: '2026-12-05T00:00:00.000Z',
    },
    {
      id: 'ms-wb-3',
      projectId: 'proj-whiteboard',
      title: 'Multiplayer Cursors, Gestures & Undo/Redo',
      description: 'Smooth position interpolation, pinch-to-zoom matrix transforms, and per-user undo history stacks.',
      status: 'To Do',
      progressPercentage: 20,
      dueDate: '2026-12-20T00:00:00.000Z',
    },
    {
      id: 'ms-wb-4',
      projectId: 'proj-whiteboard',
      title: 'Latency Stress Benchmark & Verified Certification',
      description: 'Stress testing with 100 simulated clients, commit attestation, and completion certificate issuance.',
      status: 'To Do',
      progressPercentage: 0,
      dueDate: '2027-01-15T00:00:00.000Z',
    },
  ],
  'proj-consensus': [
    {
      id: 'ms-cs-1',
      projectId: 'proj-consensus',
      title: 'Raft Cluster Topology & Leader Election Engine',
      description: 'Implement core Raft state machine with leader heartbeats, vote requests, and term transitions.',
      status: 'Done',
      progressPercentage: 100,
      dueDate: '2026-10-15T00:00:00.000Z',
    },
    {
      id: 'ms-cs-2',
      projectId: 'proj-consensus',
      title: 'Kafka Ingestion & Zero-Loss Partition Buffer',
      description: 'High-throughput event streaming queue with guaranteed delivery and exactly-once log compaction.',
      status: 'Done',
      progressPercentage: 100,
      dueDate: '2026-11-01T00:00:00.000Z',
    },
    {
      id: 'ms-cs-3',
      projectId: 'proj-consensus',
      title: 'Automated Failover CI & Chaos Testing Suite',
      description: 'Simulate split-brain network partitions and measure time-to-recovery under continuous write pressure.',
      status: 'In Progress',
      progressPercentage: 80,
      dueDate: '2026-12-01T00:00:00.000Z',
    },
    {
      id: 'ms-cs-4',
      projectId: 'proj-consensus',
      title: 'Production Verification & Multi-Signature Sign-Off',
      description: 'Peer code reviews, cryptographic commit signing, and issuance of SkillForge Verified Attestation.',
      status: 'To Do',
      progressPercentage: 10,
      dueDate: '2026-12-25T00:00:00.000Z',
    },
  ],
  'proj-monorepo': [
    {
      id: 'ms-mr-1',
      projectId: 'proj-monorepo',
      title: 'Universal Workspace Shell & 6 Role Contexts',
      description: 'Scaffold role-aware navigation shell, top bar switcher, and isolated context permissions.',
      status: 'Done',
      progressPercentage: 100,
      dueDate: '2026-10-20T00:00:00.000Z',
    },
    {
      id: 'ms-mr-2',
      projectId: 'proj-monorepo',
      title: 'End-to-End Contract Types & Schema Validation',
      description: 'Unified TypeScript contracts, Prisma models, and cross-service domain event bus.',
      status: 'Done',
      progressPercentage: 100,
      dueDate: '2026-11-12T00:00:00.000Z',
    },
    {
      id: 'ms-mr-3',
      projectId: 'proj-monorepo',
      title: 'Help Center, Workflow Flowcharts & 20 Guided Tours',
      description: 'Interactive SVG pipeline diagrams, 17-chapter user manual, and spotlight feature tours.',
      status: 'Done',
      progressPercentage: 100,
      dueDate: '2026-11-24T00:00:00.000Z',
    },
    {
      id: 'ms-mr-4',
      projectId: 'proj-monorepo',
      title: 'Platform Production Hardening & Full-Suite Verification',
      description: 'Zero-downtime failover, performance audits, and multi-tenant recruiter enterprise features.',
      status: 'In Progress',
      progressPercentage: 70,
      dueDate: '2026-12-15T00:00:00.000Z',
    },
  ],
};

export const canonicalTasksMap: Record<string, any[]> = {
  'proj-whiteboard': [
    {
      id: 'task-wb-1',
      projectId: 'proj-whiteboard',
      title: 'Implement WebGL 2D line drawing shaders',
      description: 'Create fragment and vertex shaders for anti-aliased bezier curve rendering.',
      priority: 'High',
      status: 'Done',
      assignee: { id: 'user-005', email: 'david.kim@skillforge.io', name: 'David Kim' },
    },
    {
      id: 'task-wb-2',
      projectId: 'proj-whiteboard',
      title: 'Binary WebSocket serialization with Protobuf',
      description: 'Pack cursor positions and delta paths into compressed binary frames to maintain <15ms latency.',
      priority: 'Critical',
      status: 'Done',
      assignee: { id: 'user-001', email: 'alex.chen@skillforge.io', name: 'Alexandre Chen' },
    },
    {
      id: 'task-wb-3',
      projectId: 'proj-whiteboard',
      title: 'CRDT state reconciliation engine (Yjs integration)',
      description: 'Ensure concurrent edits from multiple developers merge deterministically without data loss.',
      priority: 'Critical',
      status: 'In Progress',
      assignee: { id: 'user-005', email: 'david.kim@skillforge.io', name: 'David Kim' },
    },
    {
      id: 'task-wb-4',
      projectId: 'proj-whiteboard',
      title: 'Multi-touch gesture zoom & pan transform matrix',
      description: 'Support smooth pinch-to-zoom on touchpads and mobile devices with boundary clamping.',
      priority: 'Medium',
      status: 'In Review',
      assignee: { id: 'user-001', email: 'alex.chen@skillforge.io', name: 'Alexandre Chen' },
    },
    {
      id: 'task-wb-5',
      projectId: 'proj-whiteboard',
      title: 'Export canvas to SVG, PNG and JSON schema',
      description: 'Allow users to export diagrams to vector SVG and clean structured JSON for documentation.',
      priority: 'Low',
      status: 'To Do',
      assignee: { id: 'user-005', email: 'david.kim@skillforge.io', name: 'David Kim' },
    },
  ],
  'proj-consensus': [
    {
      id: 'task-cs-1',
      projectId: 'proj-consensus',
      title: 'Raft heartbeat protocol implementation in Go',
      description: 'Implement randomized election timers and leader append entries RPCs.',
      priority: 'Critical',
      status: 'Done',
      assignee: { id: 'user-003', email: 'elena.rostova@skillforge.io', name: 'Elena Rostova' },
    },
    {
      id: 'task-cs-2',
      projectId: 'proj-consensus',
      title: 'Kafka event partitioner and deduplication ring',
      description: 'Partition event keys using xxHash64 with atomic monotonic sequence counters.',
      priority: 'High',
      status: 'Done',
      assignee: { id: 'user-001', email: 'alex.chen@skillforge.io', name: 'Alexandre Chen' },
    },
    {
      id: 'task-cs-3',
      projectId: 'proj-consensus',
      title: 'Network partition simulator for failover recovery',
      description: 'Simulate packet loss, network split, and measure cluster re-election time.',
      priority: 'Critical',
      status: 'In Progress',
      assignee: { id: 'user-007', email: 'marcus.vance@skillforge.io', name: 'Marcus Vance' },
    },
    {
      id: 'task-cs-4',
      projectId: 'proj-consensus',
      title: 'Chaos engineering suite for leader election stress',
      description: 'Kill leader nodes under 100k events/sec load and assert zero state divergence.',
      priority: 'High',
      status: 'In Review',
      assignee: { id: 'user-003', email: 'elena.rostova@skillforge.io', name: 'Elena Rostova' },
    },
  ],
};

export const canonicalResourcesMap: Record<string, any[]> = {
  'proj-whiteboard': [
    {
      id: 'res-wb-1',
      projectId: 'proj-whiteboard',
      title: 'Figma Whiteboard Canvas UI & Tooling Spec',
      url: 'https://figma.com/file/canvas-engine-spec',
      type: 'link',
      category: 'Design',
      addedBy: 'David Kim',
      createdAt: '2026-11-05T14:20:00.000Z',
    },
    {
      id: 'res-wb-2',
      projectId: 'proj-whiteboard',
      title: 'CRDT Binary Protocol Architecture Document',
      url: 'https://github.com/skillforge/whiteboard-engine/docs/protocol.md',
      type: 'link',
      category: 'Documentation',
      addedBy: 'Alexandre Chen',
      createdAt: '2026-11-08T10:15:00.000Z',
    },
    {
      id: 'res-wb-3',
      projectId: 'proj-whiteboard',
      title: 'Canvas Engine GitHub Repository',
      url: 'https://github.com/skillforge/collaborative-canvas-core',
      type: 'link',
      category: 'Repository',
      addedBy: 'David Kim',
      createdAt: '2026-11-12T09:30:00.000Z',
    },
    {
      id: 'res-wb-4',
      projectId: 'proj-whiteboard',
      title: 'Multiplayer Performance Benchmark Report (60fps)',
      fileName: 'canvas_benchmark_metrics.pdf',
      fileSize: 1845000,
      type: 'file',
      category: 'Dataset',
      addedBy: 'Alexandre Chen',
      createdAt: '2026-11-18T16:45:00.000Z',
    },
  ],
  'proj-consensus': [
    {
      id: 'res-cs-1',
      projectId: 'proj-consensus',
      title: 'Raft Consensus Algorithm Paper & State Machine Spec',
      url: 'https://raft.github.io/raft.pdf',
      type: 'link',
      category: 'Documentation',
      addedBy: 'Elena Rostova',
      createdAt: '2026-10-12T11:00:00.000Z',
    },
    {
      id: 'res-cs-2',
      projectId: 'proj-consensus',
      title: 'Kafka Stream Clustering & Topology Guide',
      url: 'https://github.com/skillforge/consensus-hub/docs/kafka.md',
      type: 'link',
      category: 'Documentation',
      addedBy: 'Alexandre Chen',
      createdAt: '2026-10-18T13:20:00.000Z',
    },
    {
      id: 'res-cs-3',
      projectId: 'proj-consensus',
      title: 'Consensus Core Engine GitHub Repository',
      url: 'https://github.com/skillforge/consensus-event-hub',
      type: 'link',
      category: 'Repository',
      addedBy: 'Elena Rostova',
      createdAt: '2026-10-25T15:10:00.000Z',
    },
  ],
};

// Generates fallback milestones for any project ID
export function getFallbackMilestones(projectId: string, projectTitle?: string) {
  if (canonicalMilestonesMap[projectId]) return canonicalMilestonesMap[projectId];
  const title = projectTitle || 'Engineering System';
  return [
    {
      id: `ms-${projectId}-1`,
      projectId,
      title: `1. System Architecture & Requirements for ${title}`,
      description: 'Define technical stack, data contracts, and component boundaries.',
      status: 'Done',
      progressPercentage: 100,
      dueDate: '2026-11-10T00:00:00.000Z',
    },
    {
      id: `ms-${projectId}-2`,
      projectId,
      title: `2. Core Implementation & API Integration`,
      description: 'Build backend endpoints, frontend components, and state management.',
      status: 'In Progress',
      progressPercentage: 70,
      dueDate: '2026-12-05T00:00:00.000Z',
    },
    {
      id: `ms-${projectId}-3`,
      projectId,
      title: `3. Testing, Performance & Peer Code Review`,
      description: 'Comprehensive test coverage, end-to-end integration, and PR reviews.',
      status: 'To Do',
      progressPercentage: 25,
      dueDate: '2026-12-20T00:00:00.000Z',
    },
    {
      id: `ms-${projectId}-4`,
      projectId,
      title: `4. Verification & Attested Credential Release`,
      description: 'Final multi-peer verification sign-off and digital completion certificate.',
      status: 'To Do',
      progressPercentage: 0,
      dueDate: '2027-01-10T00:00:00.000Z',
    },
  ];
}

// Generates fallback tasks for any project ID
export function getFallbackTasks(projectId: string) {
  if (canonicalTasksMap[projectId]) return canonicalTasksMap[projectId];
  return [
    {
      id: `task-${projectId}-1`,
      projectId,
      title: 'Architectural schema design and TypeScript contracts',
      priority: 'High',
      status: 'Done',
      assignee: { id: 'user-001', email: 'lead@skillforge.io', name: 'Lead Architect' },
    },
    {
      id: `task-${projectId}-2`,
      projectId,
      title: 'Core service endpoints and error handling boundaries',
      priority: 'Critical',
      status: 'Done',
      assignee: { id: 'user-002', email: 'dev@skillforge.io', name: 'Senior Engineer' },
    },
    {
      id: `task-${projectId}-3`,
      projectId,
      title: 'Interactive UI views and state integration',
      priority: 'Medium',
      status: 'In Progress',
      assignee: { id: 'user-003', email: 'frontend@skillforge.io', name: 'Frontend Engineer' },
    },
    {
      id: `task-${projectId}-4`,
      projectId,
      title: 'Automated test suite and CI deployment verification',
      priority: 'High',
      status: 'To Do',
      assignee: { id: 'user-001', email: 'lead@skillforge.io', name: 'Lead Architect' },
    },
  ];
}

// Generates fallback resources for any project ID
export function getFallbackResources(projectId: string) {
  if (canonicalResourcesMap[projectId]) return canonicalResourcesMap[projectId];
  return [
    {
      id: `res-${projectId}-1`,
      projectId,
      title: 'Project Architecture & Technical Specification',
      url: 'https://docs.skillforge.io/architecture/spec',
      type: 'link',
      category: 'Documentation',
      addedBy: 'System Architect',
      createdAt: new Date().toISOString(),
    },
    {
      id: `res-${projectId}-2`,
      projectId,
      title: 'GitHub Source Code Repository',
      url: 'https://github.com/skillforge/project-repository',
      type: 'link',
      category: 'Repository',
      addedBy: 'Lead Developer',
      createdAt: new Date().toISOString(),
    },
    {
      id: `res-${projectId}-3`,
      projectId,
      title: 'Figma Component & Screen Design Tokens',
      url: 'https://figma.com/file/skillforge-design-spec',
      type: 'link',
      category: 'Design',
      addedBy: 'Design Lead',
      createdAt: new Date().toISOString(),
    },
  ];
}
