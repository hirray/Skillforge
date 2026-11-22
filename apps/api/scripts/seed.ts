import { PrismaClient } from '@prisma/client';
import seedData from '../../../packages/contract/seed/seed-data.json';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  for (const user of seedData.users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email,
        roles: user.roles,
      },
    });
  }
  
  for (const skill of seedData.skills) {
    await prisma.skill.upsert({
      where: { id: skill.id },
      update: {},
      create: {
        id: skill.id,
        name: skill.name,
        category: skill.category,
      },
    });
  }

  // Seed mentors (PRD Area 27)
  await prisma.mentorProfile.upsert({
    where: { userId: 'user-003' },
    update: {
      expertiseSkillIds: JSON.stringify(['React', 'TypeScript', 'Frontend Architecture', 'UI/UX']),
      domains: JSON.stringify(['Web Applications', 'SaaS', 'EdTech']),
      availability: '5 hrs/week',
      formats: JSON.stringify(['async_review', 'live_call', 'code_review']),
      bio: 'Staff Frontend Engineer with 8+ years experience scaling design systems and web apps.',
      active: true,
    },
    create: {
      userId: 'user-003',
      expertiseSkillIds: JSON.stringify(['React', 'TypeScript', 'Frontend Architecture', 'UI/UX']),
      domains: JSON.stringify(['Web Applications', 'SaaS', 'EdTech']),
      availability: '5 hrs/week',
      formats: JSON.stringify(['async_review', 'live_call', 'code_review']),
      bio: 'Staff Frontend Engineer with 8+ years experience scaling design systems and web apps.',
      active: true,
    },
  });

  await prisma.mentorProfile.upsert({
    where: { userId: 'user-004' },
    update: {
      expertiseSkillIds: JSON.stringify(['Node.js', 'System Design', 'PostgreSQL', 'Go', 'Docker']),
      domains: JSON.stringify(['Backend Infrastructure', 'Fintech', 'Distributed Systems']),
      availability: '3 hrs/week',
      formats: JSON.stringify(['async_review', 'office_hours']),
      bio: 'Technical founder and cloud architect. Enjoys reviewing schemas, system design, and API contracts.',
      active: true,
    },
    create: {
      userId: 'user-004',
      expertiseSkillIds: JSON.stringify(['Node.js', 'System Design', 'PostgreSQL', 'Go', 'Docker']),
      domains: JSON.stringify(['Backend Infrastructure', 'Fintech', 'Distributed Systems']),
      availability: '3 hrs/week',
      formats: JSON.stringify(['async_review', 'office_hours']),
      bio: 'Technical founder and cloud architect. Enjoys reviewing schemas, system design, and API contracts.',
      active: true,
    },
  });

  // Seed Hackathon Event (PRD Area 29)
  await prisma.hackathonEvent.upsert({
    where: { id: 'hackathon-001' },
    update: {
      status: 'running',
    },
    create: {
      id: 'hackathon-001',
      name: 'Winter Global AI & Agentic Sprint 2026',
      description: 'A high-velocity 48-hour build marathon uniting designers, fullstack developers, and AI engineers to build production-grade agentic applications.',
      theme: 'Autonomous Collaboration & Knowledge Workflows',
      startsAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 36),
      rules: 'Teams of 1-5 members. Pre-existing ideas are welcome; all project code must be developed and pushed during the sprint window.',
      suggestedSkillIds: JSON.stringify(['React', 'TypeScript', 'FastAPI', 'Python', 'TailwindCSS']),
      status: 'running',
      organizerId: 'admin-001',
    },
  });

  await prisma.eventParticipant.upsert({
    where: {
      eventId_userId: {
        eventId: 'hackathon-001',
        userId: 'user-005',
      }
    },
    update: { lookingForTeam: true },
    create: {
      eventId: 'hackathon-001',
      userId: 'user-005',
      lookingForTeam: true,
      skillsSnapshot: JSON.stringify(['UI/UX Design', 'Figma', 'Design Systems']),
    },
  });

  await prisma.eventParticipant.upsert({
    where: {
      eventId_userId: {
        eventId: 'hackathon-001',
        userId: 'user-006',
      }
    },
    update: { lookingForTeam: true },
    create: {
      eventId: 'hackathon-001',
      userId: 'user-006',
      lookingForTeam: true,
      skillsSnapshot: JSON.stringify(['Python', 'PyTorch', 'FastAPI', 'LLMs']),
    },
  });

  // Seed demo company & recruiters (PRD Area 21)
  await prisma.company.upsert({
    where: { id: 'm2-demo-company' },
    update: {
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
    create: {
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
  });

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
  
  // Seed Phase 4 Demo Data (Modules 25 & 28)
  const { seedPhase4Data } = await import('./seed-phase4');
  await seedPhase4Data();

  console.log('Database seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
