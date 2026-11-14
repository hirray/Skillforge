import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const types = [
    'ProjectCreated',
    'InvitationSent',
    'MemberJoined',
    'TaskCompleted',
    'MilestoneReached',
    'CandidateShortlisted',
  ];
  for (let day = 0; day < 21; day++)
    for (let member = 1; member <= 8; member++)
      for (const type of types) {
        const id = `m2-fake-${day}-${member}-${type}`;
        await p.metricEvent.upsert({
          where: { id },
          update: {},
          create: {
            id,
            type,
            actorId: `user-${String(member).padStart(3, '0')}`,
            projectId: 'm2-demo-project',
            synthetic: true,
            occurredAt: new Date(Date.now() - day * 86400000),
          },
        });
      }
  console.log(
    'Generated labelled synthetic event history. No real activity was changed.'
  );
}
main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => p.$disconnect());
