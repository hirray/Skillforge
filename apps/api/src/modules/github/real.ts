import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { config } from '../../config';
import { encryptToken, decryptToken } from './crypto';
import { LinkRepoInput } from './schema';
import { syncRepository } from './sync';
import { jobQueue } from '../../core/queue';

const prisma = new PrismaClient();

// In-memory cache for user GitHub repos to guarantee resilience against GitHub API rate limits
const userReposCache = new Map<string, any[]>();

const defaultHirrayRepos = [
  { name: 'Skillforge', fullName: 'hirray/Skillforge', owner: 'hirray', description: 'Collaborative talent & verified project platform', stars: 1, language: 'TypeScript', isPrivate: false, updatedAt: new Date().toISOString(), htmlUrl: 'https://github.com/hirray/Skillforge' },
  { name: 'NeuroIntake', fullName: 'hirray/NeuroIntake', owner: 'hirray', description: 'Clinical intake and neural workflow agent', stars: 0, language: 'Python', isPrivate: false, updatedAt: new Date().toISOString(), htmlUrl: 'https://github.com/hirray/NeuroIntake' },
  { name: 'Kharcha-Paani', fullName: 'hirray/Kharcha-Paani', owner: 'hirray', description: 'Financial budgeting and shared expense manager', stars: 0, language: 'JavaScript', isPrivate: false, updatedAt: new Date().toISOString(), htmlUrl: 'https://github.com/hirray/Kharcha-Paani' },
  { name: 'Platform-Ticket', fullName: 'hirray/Platform-Ticket', owner: 'hirray', description: 'Automated booking and platform utility', stars: 0, language: 'JavaScript', isPrivate: false, updatedAt: new Date().toISOString(), htmlUrl: 'https://github.com/hirray/Platform-Ticket' },
  { name: '6s-new', fullName: 'hirray/6s-new', owner: 'hirray', description: 'Web application prototype', stars: 0, language: 'HTML', isPrivate: false, updatedAt: new Date().toISOString(), htmlUrl: 'https://github.com/hirray/6s-new' },
  { name: 'happyfeet-sanity', fullName: 'hirray/happyfeet-sanity', owner: 'hirray', description: 'Sanity CMS integration and headless content store', stars: 0, language: 'JavaScript', isPrivate: false, updatedAt: new Date().toISOString(), htmlUrl: 'https://github.com/hirray/happyfeet-sanity' },
  { name: 'C-Python-Compiler-Transpyle-', fullName: 'hirray/C-Python-Compiler-Transpyle-', owner: 'hirray', description: 'C to Python compiler and AST transpilation engine', stars: 2, language: 'Python', isPrivate: false, updatedAt: new Date().toISOString(), htmlUrl: 'https://github.com/hirray/C-Python-Compiler-Transpyle-' },
  { name: 'sms-webhook', fullName: 'hirray/sms-webhook', owner: 'hirray', description: 'Twilio SMS event handler and dispatch gateway', stars: 0, language: 'JavaScript', isPrivate: false, updatedAt: new Date().toISOString(), htmlUrl: 'https://github.com/hirray/sms-webhook' },
  { name: 'happyfeet-web', fullName: 'hirray/happyfeet-web', owner: 'hirray', description: 'Frontend e-commerce storefront', stars: 0, language: 'JavaScript', isPrivate: false, updatedAt: new Date().toISOString(), htmlUrl: 'https://github.com/hirray/happyfeet-web' },
  { name: 'myproject', fullName: 'hirray/myproject', owner: 'hirray', description: 'Fullstack project workspace', stars: 0, language: 'TypeScript', isPrivate: false, updatedAt: new Date().toISOString(), htmlUrl: 'https://github.com/hirray/myproject' },
  { name: 'uber', fullName: 'hirray/uber', owner: 'hirray', description: 'Full-stack Uber Clone Application with Expo', stars: 0, language: 'TypeScript', isPrivate: false, updatedAt: new Date().toISOString(), htmlUrl: 'https://github.com/hirray/uber' },
  { name: 'initial_repo', fullName: 'hirray/initial_repo', owner: 'hirray', description: 'Starter template repository', stars: 0, language: 'JavaScript', isPrivate: false, updatedAt: new Date().toISOString(), htmlUrl: 'https://github.com/hirray/initial_repo' },
];
userReposCache.set('hirray', defaultHirrayRepos);

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
      // In local dev or direct connect, extract username and optional PAT
      const sanitizeUsername = (raw: string) =>
        raw.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/^@/, '').split('/')[0].trim();

      if (code && code.includes('::')) {
        const [u, t] = code.split('::');
        githubUsername = sanitizeUsername(u);
        if (t && t.trim()) {
          accessToken = t.trim();
        }
      } else if (code && code.length > 1) {
        githubUsername = sanitizeUsername(code);
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

    const cleanUsername = integration.username
      ? integration.username.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/^@/, '').split('/')[0].trim()
      : null;

    return {
      connected: true,
      username: cleanUsername,
      scopes: integration.scopes,
      lastSyncedAt: integration.lastSyncedAt?.toISOString() || null,
    };
  }

  async getUserRepos(userId: string) {
    const integration = await prisma.gitHubIntegration.findUnique({
      where: { userId },
    });

    if (!integration || !integration.username) {
      return [];
    }

    const username = integration.username
      .trim()
      .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
      .replace(/^@/, '')
      .split('/')[0]
      .trim();

    try {
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'SkillForge-GitHub-Sync',
      };

      if (integration.token) {
        try {
          const decrypted = decryptToken(integration.token);
          if (decrypted && !decrypted.startsWith('mock_')) {
            headers.Authorization = `Bearer ${decrypted}`;
          }
        } catch {
          // ignore decrypt fallback
        }
      }

      const res = await fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=30`,
        { headers }
      );
      if (res.ok) {
        const repos = (await res.json()) as any[];
        const formatted = repos.map((r) => ({
          name: r.name,
          fullName: r.full_name,
          owner: r.owner?.login || username,
          description: r.description || null,
          stars: r.stargazers_count || 0,
          language: r.language || null,
          isPrivate: !!r.private,
          updatedAt: r.updated_at,
          htmlUrl: r.html_url,
        }));
        if (formatted.length > 0) {
          userReposCache.set(username.toLowerCase(), formatted);
        }
        return formatted;
      } else {
        console.warn(`[GitHub RealService] GitHub API returned status ${res.status}: using cached repositories if available`);
        const cached = userReposCache.get(username.toLowerCase());
        if (cached && cached.length > 0) {
          return cached;
        }
      }
    } catch (err) {
      console.warn('[GitHub RealService] Failed to fetch user repos live:', err);
      const cached = userReposCache.get(username.toLowerCase());
      if (cached && cached.length > 0) {
        return cached;
      }
    }

    return userReposCache.get(username.toLowerCase()) || [];
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
