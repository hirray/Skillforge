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
