import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedPhase4Data() {
  console.log('--- Seeding Member 4 Phase 4 Demo Data (Modules 25 & 28) ---');

  // 1. Ensure Verified Companies
  const companies = [
    {
      id: 'm2-demo-company',
      name: 'Northstar Labs · Demo',
      logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=200&h=200',
      overview: 'Building next-generation collaborative AI infrastructure, autonomous agent orchestration, and distributed developer tooling.',
      industry: 'Software & Cloud Infrastructure',
      sizeBand: '51-200',
      website: 'https://northstarlabs.example.com',
      locations: 'San Francisco, CA • Remote',
      hiringFocus: 'Machine Learning, Fullstack TypeScript, Distributed Systems, Python',
      verificationStatus: 'verified',
      verificationReason: 'Work domain verified: @northstarlabs.example.com',
    },
    {
      id: 'company-002',
      name: 'NextGen Robotics Enterprise',
      logo: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=200&h=200',
      overview: 'Pioneering autonomous industrial robotics systems and high-throughput real-time edge telemetry.',
      industry: 'Robotics & Automation',
      sizeBand: '201-500',
      website: 'https://nextgenrobotics.example.com',
      locations: 'Austin, TX • Remote',
      hiringFocus: 'Python, FastAPI, Edge Computing, C++, WebSockets',
      verificationStatus: 'verified',
      verificationReason: 'Enterprise accreditation verified',
    },
    {
      id: 'company-003',
      name: 'Vector AI Systems',
      logo: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=200&h=200',
      overview: 'Large-scale vector databases, semantic search architectures, and high-performance neural retrieval.',
      industry: 'Artificial Intelligence',
      sizeBand: '11-50',
      website: 'https://vectoraisystems.example.com',
      locations: 'New York, NY • Remote',
      hiringFocus: 'Go, PostgreSQL, pgvector, Distributed Storage',
      verificationStatus: 'verified',
      verificationReason: 'Verified Technology Partner',
    },
  ];

  for (const c of companies) {
    await prisma.company.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    });
  }

  // Ensure recruiter member
  await prisma.recruiterMember.upsert({
    where: {
      companyId_userId: {
        companyId: 'm2-demo-company',
        userId: 'recruiter-001',
      },
    },
    update: { role: 'recruiter_admin' },
    create: {
      companyId: 'm2-demo-company',
      userId: 'recruiter-001',
      role: 'recruiter_admin',
    },
  });

  // Ensure Demo Job exists for Shortlists and Pipelines
  await prisma.job.upsert({
    where: { id: 'm2-demo-job' },
    update: {
      companyId: 'm2-demo-company',
      title: 'Senior Distributed Systems & AI Systems Lead',
      status: 'Open',
    },
    create: {
      id: 'm2-demo-job',
      companyId: 'm2-demo-company',
      title: 'Senior Distributed Systems & AI Systems Lead',
      department: 'Engineering',
      description: 'Lead engineering for scalable neural search, streaming data pipelines, and distributed event architectures.',
      location: 'San Francisco, CA • Remote',
      workMode: 'remote',
      status: 'Open',
    },
  });

  // 2. Ensure Candidates Have User Profiles & UserPreferences
  const candidatesData = [
    {
      userId: 'user-001',
      name: 'Maya Chen',
      headline: 'Fullstack Systems Lead & Core Contributor',
      location: 'San Francisco, CA',
      workMode: 'remote',
      experienceYears: 4,
      availability: 'immediate',
      recruiterVisible: true,
      matchingOptIn: true,
    },
    {
      userId: 'user-002',
      name: 'Alexandre Chen',
      headline: 'Senior Distributed Systems & Backend Engineer',
      location: 'New York, NY',
      workMode: 'hybrid',
      experienceYears: 6,
      availability: 'two_weeks',
      recruiterVisible: true,
      matchingOptIn: true,
    },
    {
      userId: 'user-003',
      name: 'Elena Rostova',
      headline: 'Staff UI Systems Architect & Design Systems Lead',
      location: 'Seattle, WA',
      workMode: 'remote',
      experienceYears: 8,
      availability: 'one_month',
      recruiterVisible: true,
      matchingOptIn: true,
    },
    {
      userId: 'user-006',
      name: 'Jordan Lee',
      headline: 'Machine Learning & Neural Search Engineer',
      location: 'Boston, MA',
      workMode: 'remote',
      experienceYears: 3,
      availability: 'immediate',
      recruiterVisible: true,
      matchingOptIn: true,
    },
    {
      userId: 'user-008',
      name: 'Sarah Jenkins',
      headline: 'Cloud Infrastructure & Kubernetes Architect',
      location: 'Austin, TX',
      workMode: 'remote',
      experienceYears: 5,
      availability: 'immediate',
      recruiterVisible: true,
      matchingOptIn: true,
    },
    {
      userId: 'user-005',
      name: 'David Kim',
      headline: 'Lead Product Designer & Design Technologist',
      location: 'Toronto, Canada',
      workMode: 'flexible',
      experienceYears: 4,
      availability: 'immediate',
      recruiterVisible: true,
      matchingOptIn: true,
    },
    {
      userId: 'user-007',
      name: 'Marcus Vance',
      headline: 'Cloud Security & DevSecOps Engineer',
      location: 'Denver, CO',
      workMode: 'remote',
      experienceYears: 5,
      availability: 'not_looking',
      recruiterVisible: false, // Intentionally withdrawn to demonstrate privacy enforcement!
      matchingOptIn: false,
    },
  ];

  for (const cand of candidatesData) {
    // Ensure User
    await prisma.user.upsert({
      where: { id: cand.userId },
      update: {},
      create: {
        id: cand.userId,
        email: `${cand.userId}@skillforge.test`,
        roles: JSON.stringify(['developer']),
      },
    });

    // Ensure AiCandidateProfile
    await prisma.aiCandidateProfile.upsert({
      where: { userId: cand.userId },
      update: {
        name: cand.name,
        headline: cand.headline,
        location: cand.location,
        workMode: cand.workMode,
        experienceYears: cand.experienceYears,
        recruiterVisible: cand.recruiterVisible,
        matchingOptIn: cand.matchingOptIn,
        publicSkills: true,
      },
      create: {
        userId: cand.userId,
        name: cand.name,
        headline: cand.headline,
        location: cand.location,
        workMode: cand.workMode,
        experienceYears: cand.experienceYears,
        recruiterVisible: cand.recruiterVisible,
        matchingOptIn: cand.matchingOptIn,
        publicSkills: true,
      },
    });
  }

  // 3. Seed Module 25: Hiring Pipeline Entries (Shortlists, Stages, History, Private Notes)
  const pipelineSeedData = [
    {
      id: 'pipeline-entry-001',
      companyId: 'm2-demo-company',
      recruiterId: 'recruiter-001',
      jobId: 'm2-demo-job',
      userId: 'user-001',
      stage: 'Interview',
      history: [
        { fromStage: null, toStage: 'New', by: 'system:discovery' },
        { fromStage: 'New', toStage: 'Reviewed', by: 'recruiter-001' },
        { fromStage: 'Reviewed', toStage: 'Shortlisted', by: 'recruiter-001' },
        { fromStage: 'Shortlisted', toStage: 'Interview', by: 'recruiter-001' },
      ],
      notes: [
        {
          authorId: 'recruiter-001',
          text: 'Candidate demonstrated exemplary system design in project verification sprint. 96/100 milestone performance score.',
        },
        {
          authorId: 'recruiter-001',
          text: 'Technical interview scheduled for Tuesday 2:00 PM with Distributed Systems panel.',
        },
      ],
    },
    {
      id: 'pipeline-entry-002',
      companyId: 'm2-demo-company',
      recruiterId: 'recruiter-001',
      jobId: 'm2-demo-job',
      userId: 'user-002',
      stage: 'Shortlisted',
      history: [
        { fromStage: null, toStage: 'New', by: 'system:matching' },
        { fromStage: 'New', toStage: 'Shortlisted', by: 'recruiter-001' },
      ],
      notes: [
        {
          authorId: 'recruiter-001',
          text: 'Strong database migration and schema performance metrics on GitHub. Top tier candidate for backend distributed lead.',
        },
      ],
    },
    {
      id: 'pipeline-entry-003',
      companyId: 'm2-demo-company',
      recruiterId: 'recruiter-001',
      jobId: 'm2-demo-job',
      userId: 'user-003',
      stage: 'Selected',
      history: [
        { fromStage: null, toStage: 'Shortlisted', by: 'recruiter-001' },
        { fromStage: 'Shortlisted', toStage: 'Interview', by: 'recruiter-001' },
        { fromStage: 'Interview', toStage: 'Selected', by: 'recruiter-001' },
      ],
      notes: [
        {
          authorId: 'recruiter-001',
          text: 'Exceptional feedback from design team. Formal offer package extended.',
        },
      ],
    },
    {
      id: 'pipeline-entry-004',
      companyId: 'm2-demo-company',
      recruiterId: 'recruiter-001',
      jobId: 'm2-demo-job',
      userId: 'user-006',
      stage: 'Reviewed',
      history: [
        { fromStage: null, toStage: 'New', by: 'system:search' },
        { fromStage: 'New', toStage: 'Reviewed', by: 'recruiter-001' },
      ],
      notes: [
        {
          authorId: 'recruiter-001',
          text: 'Inspected verified PyTorch and vector search embeddings code. Solid production practices.',
        },
      ],
    },
    {
      id: 'pipeline-entry-005',
      companyId: 'm2-demo-company',
      recruiterId: 'recruiter-001',
      jobId: 'm2-demo-job',
      userId: 'user-008',
      stage: 'Contacted',
      history: [
        { fromStage: null, toStage: 'New', by: 'system:search' },
        { fromStage: 'New', toStage: 'Shortlisted', by: 'recruiter-001' },
        { fromStage: 'Shortlisted', toStage: 'Contacted', by: 'recruiter-001' },
      ],
      notes: [
        {
          authorId: 'recruiter-001',
          text: 'Sent platform outreach message inquiring about cloud reliability engineering role.',
        },
      ],
    },
    {
      id: 'pipeline-entry-006',
      companyId: 'm2-demo-company',
      recruiterId: 'recruiter-001',
      jobId: 'm2-demo-job',
      userId: 'user-005',
      stage: 'New',
      history: [
        { fromStage: null, toStage: 'New', by: 'system:discovery' },
      ],
      notes: [],
    },
    {
      id: 'pipeline-entry-007',
      companyId: 'm2-demo-company',
      recruiterId: 'recruiter-001',
      jobId: 'm2-demo-job',
      userId: 'user-007',
      stage: 'Reviewed',
      history: [
        { fromStage: null, toStage: 'New', by: 'system:search' },
        { fromStage: 'New', toStage: 'Reviewed', by: 'recruiter-001' },
      ],
      notes: [
        {
          authorId: 'recruiter-001',
          text: 'Notice: Candidate has toggled visibility off. Existing notes preserved under GDPR compliance.',
        },
      ],
    },
  ];

  for (const item of pipelineSeedData) {
    const entry = await prisma.shortlist.upsert({
      where: { id: item.id },
      update: {
        companyId: item.companyId,
        recruiterId: item.recruiterId,
        jobId: item.jobId,
        userId: item.userId,
        stage: item.stage,
      },
      create: {
        id: item.id,
        companyId: item.companyId,
        recruiterId: item.recruiterId,
        jobId: item.jobId,
        userId: item.userId,
        stage: item.stage,
      },
    });

    // Seed stage history
    for (const h of item.history) {
      await prisma.pipelineStageHistory.create({
        data: {
          entryId: entry.id,
          fromStage: h.fromStage || 'Initial',
          toStage: h.toStage,
          changedBy: h.by,
        },
      });
    }

    // Seed notes
    for (const n of item.notes) {
      await prisma.recruiterNote.create({
        data: {
          entryId: entry.id,
          authorId: n.authorId,
          text: n.text,
        },
      });
    }
  }

  // 4. Seed Outreach Messages (Delivered to candidate's Opportunities Inbox)
  const outreachData = [
    {
      id: 'outreach-msg-001',
      entryId: 'pipeline-entry-001',
      recruiterId: 'recruiter-001',
      candidateId: 'user-001',
      text: 'Hi Maya! We thoroughly reviewed your verified engineering contributions to the SkillForge monorepo. Your architecture for asynchronous event pipelines and 96/100 milestone completion score aligns with what our Distributed Systems team is building at Northstar Labs. We would love to discuss a Senior Distributed Systems Lead opening with you.',
      status: 'accepted',
    },
    {
      id: 'outreach-msg-002',
      entryId: 'pipeline-entry-002',
      recruiterId: 'recruiter-001',
      candidateId: 'user-002',
      text: 'Hi Alexandre, we were impressed by your attested database pooling and SQLite/Prisma schema migrations. Are you available for a brief introductory call with our engineering team this week?',
      status: 'sent',
    },
    {
      id: 'outreach-msg-003',
      entryId: 'pipeline-entry-005',
      recruiterId: 'recruiter-001',
      candidateId: 'user-008',
      text: 'Hi Sarah, Northstar Labs is looking for a Cloud Infrastructure Lead to design resilient multi-cluster Kubernetes deployments. Your verified project milestones caught our attention.',
      status: 'sent',
    },
  ];

  for (const msg of outreachData) {
    await prisma.outreachMessage.upsert({
      where: { id: msg.id },
      update: msg,
      create: msg,
    });
  }

  // 5. Seed Module 28: Company-Sponsored Challenges & Submissions
  const challengesSeedData = [
    {
      id: 'challenge-001',
      companyId: 'm2-demo-company',
      title: 'Zero-Trust Decentralized Identity Verification Agent',
      problem: 'Architect and implement an end-to-end zero-trust cryptographic verification engine for student and contributor deliverables. Solution must include verifiable credentials, HMAC token signatures, and replay attack protection across distributed nodes.',
      deliverables: 'Production REST API microservice, verifiable proof explorer UI, and comprehensive automated test suite with at least 90% branch coverage.',
      skillIds: JSON.stringify(['TypeScript', 'Cryptography', 'Node.js', 'Decentralized Systems']),
      startsAt: new Date(Date.now() - 5 * 86400000),
      endsAt: new Date(Date.now() + 24 * 86400000),
      rules: 'Multi-member teams of 2-5 eligible. All milestone deliveries must pass cryptographic attestation. Standard SkillForge verification required.',
      visibility: 'public',
      status: 'open',
    },
    {
      id: 'challenge-002',
      companyId: 'company-002',
      title: 'Autonomous Edge Robotics Telemetry & Failover Pipeline',
      problem: 'Design a fault-tolerant edge telemetry ingestion service capable of processing 10,000 sensor pulses per second with automatic fallback replication and offline SQLite caching.',
      deliverables: 'Edge broker microservice, WebSocket streaming telemetry client, and failover disaster simulation runner.',
      skillIds: JSON.stringify(['Python', 'FastAPI', 'Docker', 'WebSockets', 'Edge Computing']),
      startsAt: new Date(Date.now() - 2 * 86400000),
      endsAt: new Date(Date.now() + 14 * 86400000),
      rules: 'Open to student and professional developer teams. Benchmark metrics and latency percentiles must be submitted.',
      visibility: 'public',
      status: 'open',
    },
    {
      id: 'challenge-003',
      companyId: 'company-003',
      title: 'Sub-Millisecond Vector Retrieval & Hybrid Search Engine',
      problem: 'Build a high-performance vector retrieval microservice combining sparse BM25 keyword matching with dense embedding cosine similarity under 5ms p99 latency.',
      deliverables: 'Hybrid search indexing engine, benchmarking dashboard, and containerized deployment spec.',
      skillIds: JSON.stringify(['Go', 'PostgreSQL', 'pgvector', 'Information Retrieval']),
      startsAt: new Date(Date.now() - 1 * 86400000),
      endsAt: new Date(Date.now() + 8 * 86400000),
      rules: 'Open to multi-disciplinary teams. Submissions will be tested against a 1-million-vector evaluation set.',
      visibility: 'public',
      status: 'open',
    },
    {
      id: 'challenge-004',
      companyId: 'm2-demo-company',
      title: 'Legacy Smart Contract Vulnerability Auditing Toolkit',
      problem: 'Build automated static analysis rules to flag reentrancy, unchecked call return values, and arithmetic overflow vulnerabilities in EVM bytecode.',
      deliverables: 'CLI static analyzer, SARIF reporting formatter, and test contract corpus.',
      skillIds: JSON.stringify(['Solidity', 'Security', 'TypeScript']),
      startsAt: new Date(Date.now() - 35 * 86400000),
      endsAt: new Date(Date.now() - 5 * 86400000), // In the past -> closed!
      rules: 'Submissions closed.',
      visibility: 'public',
      status: 'closed',
    },
  ];

  for (const chal of challengesSeedData) {
    await prisma.challenge.upsert({
      where: { id: chal.id },
      update: chal,
      create: chal,
    });
  }

  // Seed Team Submissions for Challenges
  const entriesSeedData = [
    {
      id: 'entry-001',
      challengeId: 'challenge-001',
      projectId: 'm2-demo-project',
      summary: 'Implemented asymmetric signature attestation with zero-knowledge proof verification layers. Integrated with SQLite ledger fallback and multi-agent consensus validation.',
      demoUrl: 'https://identity-verify-demo.skillforge.app',
      repoUrl: 'https://github.com/skillforge-org/zero-trust-agent',
      status: 'shortlisted',
      companyNote: 'Stellar architecture with 98% branch test coverage. Cleanly decouples verification primitives from HTTP routing. Fast-tracked for interview.',
    },
    {
      id: 'entry-002',
      challengeId: 'challenge-001',
      projectId: 'proj-hackathon-1',
      summary: 'Decentralized DID and verifiable credential registry utilizing Ed25519 signatures and automated replay protection.',
      demoUrl: 'https://did-registry.skillforge.app',
      repoUrl: 'https://github.com/skillforge-org/did-registry',
      status: 'under_review',
      companyNote: 'Solid initial approach; checking latency under heavy simulated load.',
    },
    {
      id: 'entry-003',
      challengeId: 'challenge-002',
      projectId: 'm2-demo-project',
      summary: 'Real-time edge telemetry broker with automated WebSocket heartbeats, sub-2ms processing, and offline SQLite queuing.',
      demoUrl: 'https://robotics-telemetry.skillforge.app',
      repoUrl: 'https://github.com/skillforge-org/edge-robotics-broker',
      status: 'submitted',
      companyNote: null,
    },
  ];

  for (const entry of entriesSeedData) {
    await prisma.challengeEntry.upsert({
      where: { id: entry.id },
      update: entry,
      create: entry,
    });
  }

  console.log('--- Phase 4 Demo Data (Modules 25 & 28) Successfully Seeded! ---');
}

if (require.main === module) {
  seedPhase4Data()
    .catch((err) => {
      console.error('Error seeding Phase 4 demo data:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
