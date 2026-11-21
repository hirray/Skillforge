import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding fake contribution evidence...');

  // 1. Ensure user and project exist
  let project = await prisma.project.findFirst({
    where: { OR: [{ id: 'pilot-project' }, { title: { contains: 'Pilot' } }, { title: { contains: 'skillforge' } }] },
  });

  if (!project) {
    project = await prisma.project.findFirst();
  }

  if (!project) {
    const owner = await prisma.user.findFirst();
    if (!owner) {
      console.error('No users found to seed contributions.');
      return;
    }
    project = await prisma.project.create({
      data: {
        id: 'pilot-project',
        title: 'SkillForge Verified Pilot Project',
        description: 'Collaborative showcase project demonstrating verified engineering evidence.',
        ownerId: owner.id,
        category: 'Web App',
        stage: 'in progress',
        status: 'Active',
      },
    });
  }

  const users = await prisma.user.findMany({ take: 3 });
  if (users.length === 0) {
    console.error('No users found in database.');
    return;
  }

  const userA = users[0];
  const userB = users[1] || users[0];

  const fakeEvents = [
    {
      userId: userA.id,
      projectId: project.id,
      detail: 'feat(auth): Add resilient JWT token verification and user context middleware',
      type: 'commit',
      source: 'github',
      externalId: 'gh-commit-c4e9f1a',
      externalLogin: 'hirray',
      referenceUrl: 'https://github.com/skillforge-org/skillforge-sandbox/commit/c4e9f1a',
      occurredAt: new Date(Date.now() - 3600000 * 36),
      metadataJson: JSON.stringify({ additions: 180, deletions: 14 }),
    },
    {
      userId: userA.id,
      projectId: project.id,
      detail: 'Completed task: Implement database connection pooling and transaction retry handler',
      type: 'task',
      source: 'task',
      externalId: 'task-db-pool-01',
      referenceUrl: null,
      occurredAt: new Date(Date.now() - 3600000 * 24),
      metadataJson: JSON.stringify({ priority: 'high', status: 'Done' }),
    },
    {
      userId: userB.id,
      projectId: project.id,
      detail: 'pr: Merged PR #4: Complete responsive dark theme design system tokens',
      type: 'pr',
      source: 'github',
      externalId: 'gh-pr-4-merged',
      externalLogin: 'designer_dev',
      referenceUrl: 'https://github.com/skillforge-org/skillforge-sandbox/pull/4',
      occurredAt: new Date(Date.now() - 3600000 * 18),
      metadataJson: JSON.stringify({ status: 'merged', mergedBy: userA.id }),
    },
    {
      userId: userB.id,
      projectId: project.id,
      detail: 'review: Approved PR #3: Security headers and rate-limiting enforcement',
      type: 'review',
      source: 'github',
      externalId: 'gh-rev-sec-3',
      externalLogin: 'designer_dev',
      referenceUrl: 'https://github.com/skillforge-org/skillforge-sandbox/pull/3',
      occurredAt: new Date(Date.now() - 3600000 * 8),
      metadataJson: JSON.stringify({ state: 'APPROVED' }),
    },
    {
      userId: userA.id,
      projectId: project.id,
      detail: 'Led live architecture breakdown and cloud infra benchmark session',
      type: 'manual',
      source: 'manual',
      externalId: 'manual-arch-session-01',
      referenceUrl: 'https://docs.skillforge.internal/arch-session',
      occurredAt: new Date(Date.now() - 3600000 * 4),
      metadataJson: JSON.stringify({
        justification: 'Documented offline systems design workshop attended by all core team leads',
        recordedBy: userA.id,
      }),
    },
  ];

  for (const ev of fakeEvents) {
    await prisma.contributionEvent.upsert({
      where: {
        source_externalId: {
          source: ev.source,
          externalId: ev.externalId,
        },
      },
      update: { detail: ev.detail, occurredAt: ev.occurredAt },
      create: ev,
    });
  }

  console.log(`Successfully seeded ${fakeEvents.length} contribution events for project ${project.title} (${project.id}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
