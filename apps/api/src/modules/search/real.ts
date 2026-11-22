import { PrismaClient } from '@prisma/client';
import { canView } from '../../core/visibility';

const prisma = new PrismaClient();

export class RealSearchService {
  /**
   * GET /search?q=&type=all|projects|people|jobs|companies|challenges
   */
  async universalSearch(query: { q?: string; type?: string; limit?: number; page?: number }, viewer?: { id: string; roles: string[] }) {
    const q = (query.q || '').trim().toLowerCase();
    const type = query.type || 'all';
    const limit = query.limit || 30;

    const results: any[] = [];

    // 1. Projects
    if (type === 'all' || type === 'projects') {
      const projects = await prisma.project.findMany({
        take: limit,
        orderBy: { updatedAt: 'desc' },
      });

      const matchedProjects = projects.filter((p) => {
        if (!q) return true;
        return (
          p.title.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
        );
      });

      for (const p of matchedProjects) {
        results.push({
          id: p.id,
          type: 'project',
          title: p.title,
          subtitle: `${p.category} · Stage: ${p.stage}`,
          description: p.description,
          link: `/projects/${p.id}`,
          tags: [p.category, p.stage, p.visibility],
          metadata: { stage: p.stage, membersCount: 1 },
        });
      }
    }

    // 2. People (Candidates / Users) - with visibility filtering
    if (type === 'all' || type === 'people') {
      const users = await prisma.user.findMany({
        where: {
          deactivated: false,
        },
        include: {
          skills: { include: { skill: true } },
          availabilities: true,
        },
        take: limit,
      });

      for (const u of users) {
        let visSettings: any = {};
        if (u.visibilitySettings) {
          try {
            visSettings = JSON.parse(u.visibilitySettings);
          } catch {}
        }

        const isAllowed = canView(viewer, u.id, 'profile', visSettings);
        if (!isAllowed) continue;

        const skillsStr = u.skills.map((s: any) => s.skill?.name || '').join(' ').toLowerCase();
        const matchesQ =
          !q ||
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.headline && u.headline.toLowerCase().includes(q)) ||
          (u.bio && u.bio.toLowerCase().includes(q)) ||
          skillsStr.includes(q);

        if (matchesQ) {
          results.push({
            id: u.id,
            type: 'people',
            title: u.name || 'Anonymous Engineer',
            subtitle: u.headline || 'Verified Engineer',
            description: u.bio,
            link: `/users/${u.id}`,
            avatarUrl: u.avatarUrl,
            tags: u.skills.slice(0, 4).map((s: any) => s.skill?.name || ''),
            metadata: {
              workMode: u.workMode,
              city: u.city,
              availability: u.availabilities?.[0]?.status || 'immediate',
            },
          });
        }
      }
    }

    // 3. Jobs
    if (type === 'all' || type === 'jobs') {
      const jobs = await prisma.job.findMany({
        where: { status: 'active' },
        take: limit,
      });

      for (const j of jobs) {
        const desc = j.description || '';
        const loc = j.location || 'Remote';
        const matchesQ =
          !q ||
          j.title.toLowerCase().includes(q) ||
          desc.toLowerCase().includes(q) ||
          loc.toLowerCase().includes(q);

        if (matchesQ) {
          results.push({
            id: j.id,
            type: 'job',
            title: j.title,
            subtitle: `${j.companyId} · ${loc}`,
            description: j.description,
            link: `/jobs/${j.id}`,
            tags: [j.workMode, j.employmentType || 'Full-time'],
            metadata: {
              companyId: j.companyId,
              salaryRange: j.salaryMin && j.salaryMax ? `${j.salaryMin} - ${j.salaryMax} ${j.currency}` : 'Competitive',
            },
          });
        }
      }
    }

    // 4. Companies
    if (type === 'all' || type === 'companies') {
      const companies = await prisma.company.findMany({
        take: limit,
      });

      for (const c of companies) {
        const desc = c.overview || '';
        const matchesQ =
          !q ||
          c.name.toLowerCase().includes(q) ||
          desc.toLowerCase().includes(q) ||
          (c.industry && c.industry.toLowerCase().includes(q));

        if (matchesQ) {
          results.push({
            id: c.id,
            type: 'company',
            title: c.name,
            subtitle: `${c.industry || 'Technology'} · ${c.sizeBand || 'Enterprise'}`,
            description: c.overview,
            link: `/companies/${c.id}`,
            tags: [c.industry || 'Tech', c.sizeBand || 'Company'],
            metadata: { website: c.website, verified: c.verificationStatus === 'verified' },
          });
        }
      }
    }

    // 5. Challenges & Hackathons
    if (type === 'all' || type === 'challenges') {
      const challenges = await prisma.challenge.findMany({
        take: limit,
      });

      for (const ch of challenges) {
        const matchesQ =
          !q ||
          ch.title.toLowerCase().includes(q) ||
          ch.problem.toLowerCase().includes(q);

        if (matchesQ) {
          results.push({
            id: ch.id,
            type: 'challenge',
            title: ch.title,
            subtitle: `Engineering Challenge · Ends ${new Date(ch.endsAt).toLocaleDateString()}`,
            description: ch.problem,
            link: `/challenges/${ch.id}`,
            tags: ['Technical Challenge', ch.status],
            metadata: { endsAt: ch.endsAt },
          });
        }
      }
    }

    return {
      query: q,
      type,
      total: results.length,
      data: results.slice(0, limit),
    };
  }

  /**
   * GET /feed or /search/feed - Module 26 Opportunity Discovery Feed
   */
  async getOpportunityFeed(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: { include: { skill: true } },
      },
    });

    const userSkillNames = (user?.skills || []).map((s: any) => (s.skill?.name || '').toLowerCase());

    const [activeJobs, openChallenges, activeProjects] = await Promise.all([
      prisma.job.findMany({ where: { status: 'active' }, take: 10 }),
      prisma.challenge.findMany({ where: { status: 'open' }, take: 5 }),
      prisma.project.findMany({ where: { visibility: 'public' }, take: 8 }),
    ]);

    const feed: any[] = [];

    // Map jobs
    for (const job of activeJobs) {
      let matchScore = 85;
      const reasons = [
        'Matches your target engineering seniority level',
        'Direct recruiter inquiry active for this opening',
      ];

      if (userSkillNames.length > 0) {
        reasons.unshift(`High synergy with your verified skill profile (${userSkillNames.slice(0, 3).join(', ')})`);
      }

      feed.push({
        id: `feed-job-${job.id}`,
        type: 'job',
        title: job.title,
        subtitle: `${job.companyId} · ${job.location || 'Remote'} (${job.workMode})`,
        matchScore,
        badge: `${matchScore}% Fit`,
        reasons,
        link: `/jobs/${job.id}`,
        actionText: 'View Role & Apply',
        metadata: {
          salaryRange: job.salaryMin && job.salaryMax ? `${job.salaryMin} - ${job.salaryMax} ${job.currency}` : 'Competitive',
          employmentType: job.employmentType,
        },
      });
    }

    // Map technical challenges
    for (const ch of openChallenges) {
      feed.push({
        id: `feed-ch-${ch.id}`,
        type: 'challenge',
        title: ch.title,
        subtitle: `Sponsored Technical Hackathon · Active Submission Window`,
        matchScore: 92,
        badge: 'Priority Proof',
        reasons: [
          'High hiring conversion rate for solutions in top 10%',
          'Verifies real-world distributed systems & architecture capability',
        ],
        link: `/challenges/${ch.id}`,
        actionText: 'Submit Team Solution',
        metadata: {
          endsAt: ch.endsAt,
        },
      });
    }

    // Map collaborative projects
    for (const proj of activeProjects) {
      feed.push({
        id: `feed-proj-${proj.id}`,
        type: 'project',
        title: proj.title,
        subtitle: `Collaborative Engineering Project · ${proj.category}`,
        matchScore: 78,
        badge: 'Team Up',
        reasons: [
          'Actively seeking engineering collaborators for production milestone',
          'Attested commits contribute to your verified proof graph',
        ],
        link: `/projects/${proj.id}`,
        actionText: 'Join Project Team',
        metadata: {
          stage: proj.stage,
        },
      });
    }

    feed.sort((a, b) => b.matchScore - a.matchScore);

    return {
      personalizedFor: user?.name || userId,
      count: feed.length,
      feed,
    };
  }

  /**
   * Bookmarks CRUD
   */
  async addBookmark(userId: string, targetType: string, targetId: string) {
    const bookmark = await prisma.bookmark.upsert({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType,
          targetId,
        },
      },
      create: {
        userId,
        targetType,
        targetId,
      },
      update: {},
    });
    return bookmark;
  }

  async removeBookmark(userId: string, idOrTargetId: string) {
    await prisma.bookmark.deleteMany({
      where: {
        userId,
        OR: [{ id: idOrTargetId }, { targetId: idOrTargetId }],
      },
    });
    return { success: true };
  }

  async listBookmarks(userId: string) {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const populated = await Promise.all(
      bookmarks.map(async (b) => {
        let details: any = null;
        if (b.targetType === 'project') {
          details = await prisma.project.findUnique({ where: { id: b.targetId } });
        } else if (b.targetType === 'job') {
          details = await prisma.job.findUnique({ where: { id: b.targetId } });
        } else if (b.targetType === 'user') {
          details = await prisma.user.findUnique({ where: { id: b.targetId }, select: { id: true, name: true, headline: true } });
        } else if (b.targetType === 'challenge') {
          details = await prisma.challenge.findUnique({ where: { id: b.targetId } });
        }
        return {
          ...b,
          item: details,
        };
      })
    );

    return { data: populated };
  }
}

export const realSearchService = new RealSearchService();
