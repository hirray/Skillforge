import { LinkRepoInput } from './schema';

export class MockService {
  private mockConnectedUsers = new Map<string, { username: string; scopes: string; connectedAt: string }>();
  private mockRepos = new Map<string, any[]>();

  constructor() {
    // Seed default mock connection for sandbox testing
    this.mockConnectedUsers.set('user-001', {
      username: 'octocat-dev',
      scopes: 'read:user,repo',
      connectedAt: new Date(Date.now() - 86400000).toISOString(),
    });
  }

  async getConnectUrl(userId: string, redirectUri?: string) {
    const state = `mock_state_${userId}_${Math.random().toString(36).substring(7)}`;
    const url = `https://github.com/login/oauth/authorize?client_id=mock_github_client_id&redirect_uri=${encodeURIComponent(
      redirectUri || 'http://localhost:5173/integrations/github/callback'
    )}&scope=read:user,repo&state=${state}`;
    return { url, state };
  }

  async handleCallback(userId: string, code: string, state?: string) {
    const username = code || 'octocat-dev';
    const scopes = 'read:user,repo';
    const connectedAt = new Date().toISOString();
    this.mockConnectedUsers.set(userId, { username, scopes, connectedAt });

    return {
      success: true,
      username,
      scopes,
      connectedAt,
    };
  }

  async disconnect(userId: string) {
    this.mockConnectedUsers.delete(userId);
    return { success: true, message: 'GitHub integration revoked successfully' };
  }

  async getStatus(userId: string) {
    const conn = this.mockConnectedUsers.get(userId);
    if (!conn) {
      return {
        connected: false,
        username: null,
        scopes: null,
        lastSyncedAt: null,
      };
    }
    return {
      connected: true,
      username: conn.username,
      scopes: conn.scopes,
      lastSyncedAt: conn.connectedAt,
    };
  }

  async getProjectRepos(projectId: string) {
    const repos = this.mockRepos.get(projectId) || [
      {
        id: `mock-repo-${projectId}-1`,
        projectId,
        owner: 'skillforge-org',
        name: 'skillforge-sandbox',
        githubRepoId: '10928374',
        lastSyncedAt: new Date(Date.now() - 3600000).toISOString(),
        status: 'active',
        eventsCount: 5,
        recentCommits: [
          { message: 'feat: implement agent workflow orchestrator', author: 'dev-alice', sha: 'c0a1b2c' },
          { message: 'fix: concurrent task reassignment race condition', author: 'dev-bob', sha: 'd1e2f3a' },
        ],
      },
    ];
    return repos;
  }

  async linkRepo(projectId: string, data: LinkRepoInput) {
    const current = this.mockRepos.get(projectId) || [];
    const newRepo = {
      id: `mock-repo-${Date.now()}`,
      projectId,
      owner: data.owner,
      name: data.name,
      githubRepoId: data.githubRepoId || `${Math.floor(Math.random() * 90000000) + 10000000}`,
      lastSyncedAt: new Date().toISOString(),
      status: 'active',
      eventsCount: 5,
    };
    current.push(newRepo);
    this.mockRepos.set(projectId, current);
    return newRepo;
  }

  async syncRepo(projectId: string, repoId: string) {
    return {
      queued: true,
      message: 'Incremental sync job queued successfully for repository',
      repoId,
      projectId,
    };
  }

  async handle() {
    return { message: 'GitHub service ready (Mock)' };
  }
}
