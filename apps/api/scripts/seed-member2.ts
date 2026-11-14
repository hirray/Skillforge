import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const skills = [
    'React',
    'Node.js',
    'Python',
    'Computer Vision',
    'Machine Learning',
    'AWS',
    'Docker',
    'CI/CD',
    'TypeScript',
    'SQL',
    'Figma',
    'UI/UX Design',
    'NLP',
    'Security',
    'WebSockets',
    'Data Analysis',
    'React Native',
    'Unity',
    'C#',
    'C++',
    'IoT',
  ];
  const skillMap = new Map<string, string>();
  for (const name of skills) {
    const existing = await p.skill.findUnique({ where: { name } });
    const skill =
      existing ||
      (await p.skill.create({
        data: {
          id: `m2-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          name,
          category: 'Member 2 demo taxonomy',
        },
      }));
    skillMap.set(name, skill.id);
    const aliases: Record<string, string[]> = {
      'Node.js': ['NodeJS', 'node js'],
      'Machine Learning': ['ML'],
      'Computer Vision': ['CV'],
      TypeScript: ['TS'],
      JavaScript: ['JS'],
    };
    for (const alias of aliases[name] || [])
      if (
        !(await p.skillAlias.findFirst({ where: { skillId: skill.id, alias } }))
      )
        await p.skillAlias.create({ data: { skillId: skill.id, alias } });
  }
  const names = [
    'Arjun Rao',
    'Maya Chen',
    'Dev Patel',
    'Sam Rivera',
    'Leena Shah',
    'Neha Iyer',
    'Omar Khan',
    'Alex Morgan',
  ];
  const abilities = [
    ['React'],
    ['React', 'TypeScript', 'Node.js'],
    ['Python', 'SQL'],
    ['Node.js', 'SQL'],
    ['Figma', 'UI/UX Design'],
    ['Python', 'Computer Vision', 'Machine Learning'],
    ['AWS', 'Docker', 'CI/CD'],
    ['Python', 'React'],
  ];
  for (let i = 0; i < 8; i++) {
    const userId = `user-${String(i + 1).padStart(3, '0')}`;
    await p.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: `member${i + 1}@example.com`,
        roles: '["user"]',
      },
    });
    await p.aiCandidateProfile.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        name: names[i],
        headline: [
          'Project builder',
          'Frontend engineer',
          'Backend developer',
          'Product engineer',
          'Product designer',
          'ML engineer',
          'Cloud engineer',
          'Developer',
        ][i],
        matchingOptIn: true,
        recruiterVisible: true,
        hoursPerWeek: 10 + i * 2,
        workMode: 'remote',
        duration: 'few weeks',
        location: i === 6 ? 'Bengaluru' : 'Remote',
        experienceYears: i % 4,
        profileText: abilities[i].join(' '),
      },
    });
    for (const name of abilities[i]) {
      const skillId = skillMap.get(name)!;
      if (!(await p.userSkill.findFirst({ where: { userId, skillId } })))
        await p.userSkill.create({
          data: { userId, skillId, level: i === 7 ? 'beginner' : 'advanced' },
        });
      await p.skillEvidence.upsert({
        where: {
          userId_skillId_sourceType_sourceId: {
            userId,
            skillId,
            sourceType: 'member2_demo',
            sourceId: 'seed',
          },
        },
        update: {},
        create: {
          userId,
          skillId,
          type: i === 5 || i === 6 ? 'github_contribution' : 'self_declared',
          sourceType: 'member2_demo',
          sourceId: 'seed',
        },
      });
    }
    if (
      i === 7 &&
      !(await p.learningGoal.findFirst({
        where: { userId, goal: 'Machine Learning' },
      }))
    )
      await p.learningGoal.create({
        data: { userId, goal: 'Machine Learning' },
      });
  }
  const project = await p.project.upsert({
    where: { id: 'm2-demo-project' },
    update: {},
    create: {
      id: 'm2-demo-project',
      ownerId: 'user-001',
      title: 'Vision attendance platform',
      description:
        'A demo web application for classroom attendance using face recognition, a React dashboard, Python computer vision, and secure cloud deployment.',
      status: 'Active',
      category: 'AI / ML',
      duration: 'few weeks',
      targetDate: new Date(Date.now() + 21 * 86400000),
    },
  });
  for (const name of ['Python', 'Computer Vision', 'AWS', 'React'])
    if (
      !(await p.projectRequirement.findFirst({
        where: { projectId: project.id, skillName: name },
      }))
    )
      await p.projectRequirement.create({
        data: { projectId: project.id, skillName: name, level: 'intermediate' },
      });
  for (const title of ['ML Engineer', 'Cloud Engineer', 'Frontend Developer'])
    if (
      !(await p.projectRole.findFirst({
        where: { projectId: project.id, title },
      }))
    )
      await p.projectRole.create({
        data: { projectId: project.id, title, openings: 1 },
      });
  if (
    !(await p.projectMember.findFirst({
      where: { projectId: project.id, userId: 'user-002' },
    }))
  )
    await p.projectMember.create({
      data: {
        projectId: project.id,
        userId: 'user-002',
        role: 'Frontend Developer',
      },
    });
  const tasks = [
    {
      id: 'm2-demo-task-1',
      title: 'Evaluate face recognition accuracy',
      priority: 'Critical',
      status: 'In Progress',
      dueDate: new Date(Date.now() - 3 * 86400000),
      needsReassignment: true,
    },
    {
      id: 'm2-demo-task-2',
      title: 'Build attendance dashboard',
      priority: 'Medium',
      status: 'Done',
      dueDate: new Date(Date.now() + 7 * 86400000),
      needsReassignment: false,
    },
  ];
  for (const task of tasks)
    await p.task.upsert({
      where: { id: task.id },
      update: {},
      create: {
        ...task,
        projectId: project.id,
        creatorId: 'user-001',
        assigneeId: task.status === 'Done' ? 'user-002' : null,
      },
    });
  await p.milestone.upsert({
    where: { id: 'm2-demo-milestone' },
    update: {},
    create: {
      id: 'm2-demo-milestone',
      projectId: project.id,
      title: 'Prototype validation',
      dueDate: new Date(Date.now() - 86400000),
    },
  });
  for (const [id, email, roles] of [
    ['admin-001', 'admin@example.com', '["admin"]'],
    ['recruiter-001', 'recruiter@example.com', '["recruiter"]'],
  ])
    await p.user.upsert({
      where: { id },
      update: {},
      create: { id, email, roles },
    });
  await p.company.upsert({
    where: { id: 'm2-demo-company' },
    update: {},
    create: { id: 'm2-demo-company', name: 'Northstar Labs · Demo' },
  });
  if (
    !(await p.recruiterMember.findFirst({
      where: { companyId: 'm2-demo-company', userId: 'recruiter-001' },
    }))
  )
    await p.recruiterMember.create({
      data: { companyId: 'm2-demo-company', userId: 'recruiter-001' },
    });
  await p.job.upsert({
    where: { id: 'm2-demo-job' },
    update: {},
    create: {
      id: 'm2-demo-job',
      companyId: 'm2-demo-company',
      title: 'Machine Learning Engineer',
      status: 'Published',
    },
  });
  await p.aiJobRequirements.upsert({
    where: { jobId: 'm2-demo-job' },
    update: {},
    create: {
      jobId: 'm2-demo-job',
      requirementsJson: JSON.stringify([
        { name: 'Python' },
        { name: 'Machine Learning' },
        { name: 'AWS', isOptional: true },
      ]),
      workMode: 'remote',
      location: 'Bengaluru',
      minimumExperience: 1,
    },
  });
  console.log(
    'Member 2 demo ready. Existing records were preserved. Project: m2-demo-project; recruiter: recruiter-001; admin: admin-001.'
  );
}
main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => p.$disconnect());
