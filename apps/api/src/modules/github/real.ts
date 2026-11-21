import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { config } from '../../config';
import { encryptToken, decryptToken } from './crypto';
import { LinkRepoInput } from './schema';
import { syncRepository } from './sync';
import { jobQueue } from '../../core/queue';

const prisma = new PrismaClient();

export class RealService {
  async getConnectUrl(userId: string, redirectUri?: string) {
    const clientId = config.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID || 'mock_github_client_id';
    const state = crypto.randomBytes(16).toString('hex') + `_${userId}`;
    const callback = redirectUri || config.GITHUB_CALLBACK_URL || 'http://localhost:5173/integrations/github/callback';

    const url = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(callback)}&scope=read:user,repo&state=${encodeURIComponent(state)}`;

    return { url, state };
  }

  async handleCallback(userId: string, code: string, state?: string) {
    const clientId = config.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID;
    const clientSecret = config.GITHUB_CLIENT_SECRET || process.env.GITHUB_CLIENT_SECRET;

    let accessToken = `mock_token_${Date.now()}`;
    let githubUsername = `gh-${userId.replace(/[^a-zA-Z0-9]/g, '')}`;

    // If real credentials are provided, attempt live token exchange
    if (clientId && clientSecret && !code.startsWith('mock_')) {
      try {
        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code,
          }),
        });

        if (tokenRes.ok) {
          const tokenData = (await tokenRes.json()) as any;
          if (tokenData.access_token) {
            accessToken = tokenData.access_token;

            // Fetch authenticated user's profile
            const userRes = await fetch('https://api.github.com/user', {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'SkillForge-GitHub-Auth',
              },
            });
            if (userRes.ok) {
              const userData = (await userRes.json()) as any;
              if (userData.login) {
                githubUsername = userData.login;
              }
            }
          }
        }
      } catch (err) {
        console.warn('[GitHub RealService] OAuth token exchange fallback:', err);
      }
    } else {
      // In local dev without OAuth credentials, extract username or generate readable handle
      if (code && code.length > 2) {
        githubUsername = code.replace(/[^a-zA-Z0-9-_]/g, '');
      }
    }

    const encrypted = encryptToken(accessToken);

    const integration = await prisma.gitHubIntegration.upsert({
      where: { userId },
      update: {
        token: encrypted,
        username: githubUsername,
        scopes: 'read:user,repo',
        status: 'connected',
      },
      create: {
        userId,
        token: encrypted,
        username: githubUsername,
        scopes: 'read:user,repo',
        status: 'connected',
      },
    });

    return {
      success: true,
      username: integration.username,
      scopes: integration.scopes,
      connectedAt: integration.updatedAt.toISOString(),
    };
  }

  async disconnect(userId: string) {
    const existing = await prisma.gitHubIntegration.findUnique({ where: { userId } });
    if (!existing) {
      return { success: true, message: 'No active integration found' };
    }

    await prisma.gitHubIntegration.update({
      where: { userId },
      data: {
        token: '',
        status: 'revoked',
      },
    });

    return { success: true, message: 'GitHub integration revoked successfully' };
  }

  async getStatus(userId: string) {
    const integration = await prisma.gitHubIntegration.findUnique({
      where: { userId },
    });

    if (!integration || integration.status !== 'connected') {
      return {
        connected: false,
        username: null,
        scopes: null,
        lastSyncedAt: null,
      };
    }

    return {
      connected: true,
      username: integration.username,
      scopes: integration.scopes,
      lastSyncedAt: integration.lastSyncedAt?.toISOString() || null,
    };
  }

  async getProjectRepos(projectId: string) {
    const repos = await prisma.projectRepo.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    // Attach contribution event counts and latest events
    const results = await Promise.all(
      repos.map(async (r) => {
        const eventsCount = await prisma.contributionEvent.count({
          where: { projectId, source: 'github' },
        });

        const recentEvents = await prisma.contributionEvent.findMany({
          where: { projectId, source: 'github' },
          orderBy: { occurredAt: 'desc' },
          take: 3,
        });

        return {
          ...r,
          eventsCount,
          recentEvents,
        };
      })
    );

    return results;
  }

  async linkRepo(projectId: string, data: LinkRepoInput) {
    const repo = await prisma.projectRepo.upsert({
      where: {
        projectId_owner_name: {
          projectId,
          owner: data.owner,
          name: data.name,
        },
      },
      update: {
        githubRepoId: data.githubRepoId || null,
        status: 'active',
      },
      create: {
        projectId,
        owner: data.owner,
        name: data.name,
        githubRepoId: data.githubRepoId || null,
        status: 'active',
      },
    });

    // Queue background incremental sync immediately
    await jobQueue.add('github:sync', { projectId, repoId: repo.id });

    return repo;
  }

  async syncRepo(projectId: string, repoId: string) {
    await jobQueue.add('github:sync', { projectId, repoId });
    // Also perform immediate synchronous sync step if available
    try {
      await syncRepository(projectId, repoId);
    } catch (e) {
      console.warn('[GitHub RealService] Immediate sync error, continuing via queue:', e);
    }

    return {
      queued: true,
      message: 'Incremental sync job queued successfully for repository',
      repoId,
      projectId,
    };
  }

  async handle() {
    return { message: 'GitHub service ready (Real)' };
  }
}
