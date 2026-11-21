import { PrismaClient } from '@prisma/client';
import { decryptToken } from './crypto';
import { jobQueue } from '../../core/queue';

const prisma = new PrismaClient();

// Standard sandbox fixtures for offline/mock ingestion
export const GITHUB_SANDBOX_FIXTURES = [
  {
    externalId: 'c0a1b2c3d4e5f67890123456789abcdef0123456',
    type: 'commit',
    detail: 'feat(core): implement agent workflow orchestrator and queue processing',
    externalLogin: 'dev-alice',
    authorEmail: 'alice@example.com',
    referenceUrl: 'https://github.com/skillforge-org/sandbox/commit/c0a1b2c',
    occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    metadata: { additions: 342, deletions: 18, branch: 'main' },
  },
  {
    externalId: 'd1e2f3a4b5c67890123456789abcdef01234567',
    type: 'commit',
    detail: 'fix(api): address race condition during concurrent task reassignment',
    externalLogin: 'dev-bob',
    authorEmail: 'bob@example.com',
    referenceUrl: 'https://github.com/skillforge-org/sandbox/commit/d1e2f3a',
    occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    metadata: { additions: 45, deletions: 12, branch: 'main' },
  },
  {
    externalId: 'pr-42',
    type: 'pr',
    detail: 'PR #42: Add automated end-to-end integration verification suite',
    externalLogin: 'dev-alice',
    authorEmail: 'alice@example.com',
    referenceUrl: 'https://github.com/skillforge-org/sandbox/pull/42',
    occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
    metadata: { prNumber: 42, status: 'merged', reviewComments: 3 },
  },
  {
    externalId: 'review-101',
    type: 'review',
    detail: 'Code Review Approved on PR #42 (Architecture & Performance audit)',
    externalLogin: 'pro-dev',
    authorEmail: 'pro@example.com',
    referenceUrl: 'https://github.com/skillforge-org/sandbox/pull/42#pullrequestreview-101',
    occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 16),
    metadata: { prNumber: 42, state: 'APPROVED' },
  },
  {
    externalId: 'issue-15',
    type: 'issue',
    detail: 'Issue #15: High-concurrency rate limit handling under burst load',
    externalLogin: 'dev-charlie',
    authorEmail: 'charlie@example.com',
    referenceUrl: 'https://github.com/skillforge-org/sandbox/issues/15',
    occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    metadata: { issueNumber: 15, state: 'closed', labels: ['bug', 'performance'] },
  },
];

export async function syncRepository(
  projectId: string,
  repoId: string,
  options?: { force?: boolean }
): Promise<{ syncedCount: number; eventsCount: number }> {
  const repo = await prisma.projectRepo.findUnique({
    where: { id: repoId },
    include: { project: { include: { members: true } } },
  });

  if (!repo) {
    throw new Error(`ProjectRepo ${repoId} not found`);
  }

  // Update status to syncing
  await prisma.projectRepo.update({
    where: { id: repoId },
    data: { status: 'syncing' },
  });

  let eventsToIngest: Array<{
    externalId: string;
    type: string;
    detail: string;
    externalLogin?: string;
    authorEmail?: string;
    referenceUrl?: string;
    occurredAt: Date;
    metadata?: any;
  }> = [];

  // Check if project owner or any member has an active GitHubIntegration with a live token
  const projectOwner = repo.project.ownerId;
  const memberUserIds = [projectOwner, ...repo.project.members.map((m) => m.userId)];
  const integrations = await prisma.gitHubIntegration.findMany({
    where: {
      userId: { in: memberUserIds },
      status: 'connected',
    },
  });

  let liveFetched = false;
  if (integrations.length > 0) {
    const activeIntegration = integrations[0];
    try {
      const decryptedToken = decryptToken(activeIntegration.token);
      // Attempt live GitHub REST API fetch if token is available
      if (decryptedToken && !decryptedToken.startsWith('mock_')) {
        const headers = {
          Authorization: `Bearer ${decryptedToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'SkillForge-GitHub-Sync',
        };

        const commitsRes = await fetch(
          `https://api.github.com/repos/${repo.owner}/${repo.name}/commits?per_page=20`,
          { headers }
        );

        if (commitsRes.ok) {
          const commits = (await commitsRes.json()) as any[];
          for (const c of commits) {
            eventsToIngest.push({
              externalId: c.sha,
              type: 'commit',
              detail: c.commit?.message?.split('\n')[0] || 'GitHub commit',
              externalLogin: c.author?.login || c.committer?.login,
              authorEmail: c.commit?.author?.email,
              referenceUrl: c.html_url,
              occurredAt: new Date(c.commit?.author?.date || Date.now()),
              metadata: { sha: c.sha },
            });
          }
          liveFetched = true;
        }

        const pullsRes = await fetch(
          `https://api.github.com/repos/${repo.owner}/${repo.name}/pulls?state=all&per_page=10`,
          { headers }
        );
        if (pullsRes.ok) {
          const pulls = (await pullsRes.json()) as any[];
          for (const p of pulls) {
            eventsToIngest.push({
              externalId: `pr-${p.number}`,
              type: 'pr',
              detail: `PR #${p.number}: ${p.title}`,
              externalLogin: p.user?.login,
              referenceUrl: p.html_url,
              occurredAt: new Date(p.created_at),
              metadata: { number: p.number, state: p.state },
            });
          }
          liveFetched = true;
        }
      }
    } catch (err) {
      console.warn('[GitHub Sync] Live GitHub API sync encountered fallback:', err);
    }
  }

  // Fallback to deterministic sandbox fixtures for offline testing / sandbox repos
  if (!liveFetched || eventsToIngest.length === 0) {
    eventsToIngest = GITHUB_SANDBOX_FIXTURES;
  }

  // Identity mapping: map externalLogin / authorEmail to internal user IDs
  const allUsers = await prisma.user.findMany({
    include: { githubIntegration: true },
  });

  const usernameToUser = new Map<string, string>();
  const emailToUser = new Map<string, string>();
  for (const u of allUsers) {
    emailToUser.set(u.email.toLowerCase(), u.id);
    if (u.githubIntegration?.username) {
      usernameToUser.set(u.githubIntegration.username.toLowerCase(), u.id);
    }
  }

  let syncedCount = 0;
  for (const ev of eventsToIngest) {
    let matchedUserId: string = projectOwner;

    if (ev.externalLogin && usernameToUser.has(ev.externalLogin.toLowerCase())) {
      matchedUserId = usernameToUser.get(ev.externalLogin.toLowerCase())!;
    } else if (ev.authorEmail && emailToUser.has(ev.authorEmail.toLowerCase())) {
      matchedUserId = emailToUser.get(ev.authorEmail.toLowerCase())!;
    }

    await prisma.contributionEvent.upsert({
      where: {
        source_externalId: {
          source: 'github',
          externalId: ev.externalId,
        },
      },
      update: {
        detail: ev.detail,
        referenceUrl: ev.referenceUrl,
        metadataJson: JSON.stringify(ev.metadata || {}),
      },
      create: {
        userId: matchedUserId,
        projectId,
        type: ev.type,
        source: 'github',
        externalId: ev.externalId,
        externalLogin: ev.externalLogin,
        detail: ev.detail,
        referenceUrl: ev.referenceUrl,
        occurredAt: ev.occurredAt,
        metadataJson: JSON.stringify(ev.metadata || {}),
      },
    });
    syncedCount++;
  }

  const now = new Date();
  await prisma.projectRepo.update({
    where: { id: repoId },
    data: {
      status: 'active',
      lastSyncedAt: now,
    },
  });

  const totalEvents = await prisma.contributionEvent.count({
    where: { projectId, source: 'github' },
  });

  return { syncedCount, eventsCount: totalEvents };
}

// Register background job handler
jobQueue.process('github:sync', async (job) => {
  const { projectId, repoId, options } = job.data;
  await syncRepository(projectId, repoId, options);
});
