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
