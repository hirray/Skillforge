import { prisma } from './db';

const evidenceStrength: Record<string, number> = {
  verified_project: 5,
  github_contribution: 4,
  certification: 3,
  resume_extracted: 2,
  self_declared: 1,
};
let taxonomyCache: { expires: number; data: any[] } | undefined;
export async function taxonomy() {
  if (taxonomyCache && taxonomyCache.expires > Date.now())
    return taxonomyCache.data;
  const skills = await prisma.skill.findMany({ include: { aliases: true } });
  const data = skills.map((s) => ({
    id: s.id,
    name: s.name,
    aliases: s.aliases.map((a) => a.alias),
  }));
  taxonomyCache = { expires: Date.now() + 300000, data };
  return data;
}

/** Minimal Member 2 visibility adapter. Explicit opt-in, deny-by-default.
 * Member 1 can replace this adapter with core/visibility without changing engines.
 */
export async function candidateSnapshots(recruiter = false) {
  const profiles = await prisma.aiCandidateProfile.findMany({
    where: recruiter ? { recruiterVisible: true } : { matchingOptIn: true },
    take: 2000,
  });
  const ids = profiles.map((p) => p.userId);
  const [users, evidence, projects] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: ids } },
      include: { skills: { include: { skill: true } }, learningGoals: true },
    }),
    prisma.skillEvidence.findMany({ where: { userId: { in: ids } } }),
    // Only real Verified project records can be advertised as verified evidence.
    prisma.portfolioProject.findMany({ where: { userId: { in: ids } } }),
  ]);
  const verifiedIds = [...new Set(projects.map((p) => p.projectId))];
  const verified = await prisma.project.findMany({
    where: {
      id: { in: verifiedIds },
      status: 'Verified',
      visibility: 'Public',
    },
    select: { id: true, title: true },
  });
  return profiles.flatMap((p) => {
    const u = users.find((user) => user.id === p.userId);
    if (!u) return [];
    const verifiedProjects = projects
      .filter((row) => row.userId === p.userId)
      .flatMap((row) => verified.filter((v) => v.id === row.projectId));
    return [
      {
        id: p.userId,
        name: p.name,
        headline: p.headline,
        skills: u.skills
          .filter(() => p.publicSkills || p.matchingOptIn)
          .map((s) => {
            const strongest = evidence
              .filter((e) => e.userId === p.userId && e.skillId === s.skillId)
              .sort(
                (a, b) =>
                  (evidenceStrength[b.type] || 0) -
                  (evidenceStrength[a.type] || 0)
              )[0];
            return {
              name: s.skill.name,
              level: s.level,
              evidence: strongest?.type || 'self_declared',
              visible: p.publicSkills,
            };
          }),
        learningGoals: u.learningGoals.map((g) => g.goal),
        hoursPerWeek: p.hoursPerWeek,
        workMode: p.workMode,
        duration: p.duration,
        matchingOptIn: p.matchingOptIn,
        recruiterVisible: p.recruiterVisible,
        location: p.location,
        experienceYears: p.experienceYears,
        verifiedProjects,
        profileText: p.publicSkills ? p.profileText : '',
        recentActivity: Date.now() - u.updatedAt.getTime() < 30 * 86400000,
        publicSkills: p.publicSkills,
      },
    ];
  });
}
